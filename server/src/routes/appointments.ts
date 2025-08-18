import express, { Request, Response } from 'express'
import { z } from 'zod'
import { AuthRequest, protect } from '../middleware/auth'
import { startOfDay, endOfDay, parseISO } from 'date-fns'
import { prisma } from '../lib/prisma'

const router = express.Router()

// Validation schemas
const createAppointmentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  startTime: z.string().datetime('Invalid start time format'),
  endTime: z.string().datetime('Invalid end time format'),
  location: z.string().optional(),
  type: z.enum(['MEETING', 'TASK', 'REMINDER', 'PERSONAL']).default('MEETING'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
  status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).default('SCHEDULED'),
  isRecurring: z.boolean().default(false),
  participants: z.array(z.object({
    email: z.string().email(),
    name: z.string()
  })).optional()
})

const updateAppointmentSchema = createAppointmentSchema.partial()

const querySchema = z.object({
  date: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  type: z.enum(['MEETING', 'TASK', 'REMINDER', 'PERSONAL']).optional(),
  page: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional()
})

// @desc    Get all appointments
// @route   GET /api/appointments
// @access  Private
router.get('/', protect, async (req: AuthRequest, res: Response) => {
  try {
    const query = querySchema.parse(req.query)
    const page = query.page || 1
    const limit = query.limit || 10
    const skip = (page - 1) * limit

    let where: any = {
      userId: req.user!.id
    }

    // Date filters
    if (query.date) {
      const date = parseISO(query.date)
      where.startTime = {
        gte: startOfDay(date),
        lte: endOfDay(date)
      }
    } else if (query.startDate && query.endDate) {
      where.startTime = {
        gte: parseISO(query.startDate),
        lte: parseISO(query.endDate)
      }
    }

    // Status filter
    if (query.status) {
      where.status = query.status
    }

    // Type filter
    if (query.type) {
      where.type = query.type
    }

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        include: {
          participants: true
        },
        orderBy: {
          startTime: 'asc'
        },
        skip,
        take: limit
      }),
      prisma.appointment.count({ where })
    ])

    res.status(200).json({
      success: true,
      data: appointments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      })
    }

    console.error('Get appointments error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

// @desc    Get single appointment
// @route   GET /api/appointments/:id
// @access  Private
router.get('/:id', protect, async (req: AuthRequest, res: Response) => {
  try {
    const appointment = await prisma.appointment.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.id
      },
      include: {
        participants: true
      }
    })

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      })
    }

    res.status(200).json({
      success: true,
      data: appointment
    })
  } catch (error) {
    console.error('Get appointment error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

// @desc    Create appointment
// @route   POST /api/appointments
// @access  Private
router.post('/', protect, async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = createAppointmentSchema.parse(req.body)
    
    // Check for conflicts
    const conflictingAppointments = await prisma.appointment.findMany({
      where: {
        userId: req.user!.id,
        OR: [
          {
            AND: [
              { startTime: { lte: new Date(validatedData.startTime) } },
              { endTime: { gte: new Date(validatedData.startTime) } }
            ]
          },
          {
            AND: [
              { startTime: { lte: new Date(validatedData.endTime) } },
              { endTime: { gte: new Date(validatedData.endTime) } }
            ]
          }
        ],
        status: { not: 'CANCELLED' }
      }
    })

    if (conflictingAppointments.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Appointment conflicts with existing appointments',
        conflicts: conflictingAppointments
      })
    }

    const appointment = await prisma.appointment.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        startTime: new Date(validatedData.startTime),
        endTime: new Date(validatedData.endTime),
        location: validatedData.location,
        type: validatedData.type || 'MEETING',
        priority: validatedData.priority || 'MEDIUM',
        status: validatedData.status || 'SCHEDULED',
        isRecurring: validatedData.isRecurring || false,
        userId: req.user!.id
      },
      include: {
        participants: true
      }
    })

    // Create participants separately if provided
    if (validatedData.participants && validatedData.participants.length > 0) {
      await prisma.appointmentParticipant.createMany({
        data: validatedData.participants.map(p => ({
          appointmentId: appointment.id,
          email: p.email,
          name: p.name
        }))
      })
    }

    res.status(201).json({
      success: true,
      data: appointment
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      })
    }

    console.error('Create appointment error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

// @desc    Update appointment
// @route   PUT /api/appointments/:id
// @access  Private
router.put('/:id', protect, async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = updateAppointmentSchema.parse(req.body)

    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.id
      }
    })

    if (!existingAppointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      })
    }

    const updateData: any = { ...validatedData }
    if (validatedData.startTime) {
      updateData.startTime = new Date(validatedData.startTime)
    }
    if (validatedData.endTime) {
      updateData.endTime = new Date(validatedData.endTime)
    }

    const appointment = await prisma.appointment.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        participants: true
      }
    })

    res.status(200).json({
      success: true,
      data: appointment
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      })
    }

    console.error('Update appointment error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

// @desc    Delete appointment
// @route   DELETE /api/appointments/:id
// @access  Private
router.delete('/:id', protect, async (req: AuthRequest, res: Response) => {
  try {
    const appointment = await prisma.appointment.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.id
      }
    })

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      })
    }

    await prisma.appointment.delete({
      where: { id: req.params.id }
    })

    res.status(200).json({
      success: true,
      message: 'Appointment deleted successfully'
    })
  } catch (error) {
    console.error('Delete appointment error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

// @desc    Get appointment analytics
// @route   GET /api/appointments/analytics
// @access  Private
router.get('/analytics/stats', protect, async (req: AuthRequest, res: Response) => {
  try {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    const [
      totalAppointments,
      completedAppointments,
      thisMonthAppointments,
      appointmentsByType,
      appointmentsByStatus
    ] = await Promise.all([
      prisma.appointment.count({
        where: { userId: req.user!.id }
      }),
      prisma.appointment.count({
        where: { 
          userId: req.user!.id,
          status: 'COMPLETED'
        }
      }),
      prisma.appointment.count({
        where: {
          userId: req.user!.id,
          startTime: {
            gte: startOfMonth,
            lte: endOfMonth
          }
        }
      }),
      prisma.appointment.groupBy({
        by: ['type'],
        where: { userId: req.user!.id },
        _count: true
      }),
      prisma.appointment.groupBy({
        by: ['status'],
        where: { userId: req.user!.id },
        _count: true
      })
    ])

    const completionRate = totalAppointments > 0 
      ? ((completedAppointments / totalAppointments) * 100).toFixed(1)
      : '0'

    res.status(200).json({
      success: true,
      data: {
        totalAppointments,
        completedAppointments,
        thisMonthAppointments,
        completionRate: parseFloat(completionRate),
        appointmentsByType,
        appointmentsByStatus
      }
    })
  } catch (error) {
    console.error('Get analytics error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

export default router
