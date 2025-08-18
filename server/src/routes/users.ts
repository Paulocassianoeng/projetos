import express, { Request, Response } from 'express'
import { z } from 'zod'
import { AuthRequest, protect } from '../middleware/auth'
import { prisma } from '../lib/prisma'

const router = express.Router()

// Validation schemas
const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  avatar: z.string().url().optional()
})

const updateSettingsSchema = z.object({
  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  reminders: z.boolean().optional(),
  workingHoursStart: z.string().optional(),
  workingHoursEnd: z.string().optional(),
  timezone: z.string().optional(),
  theme: z.string().optional(),
  language: z.string().optional()
})

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
router.get('/profile', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        createdAt: true,
        settings: true
      }
    })

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      })
      return
    }

    res.status(200).json({
      success: true,
      data: user
    })
  } catch (error) {
    console.error('Get profile error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
router.put('/profile', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const validatedData = updateUserSchema.parse(req.body)

    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: validatedData,
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        createdAt: true
      }
    })

    res.status(200).json({
      success: true,
      data: user
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      })
      return
    }

    console.error('Update profile error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

// @desc    Get user settings
// @route   GET /api/users/settings
// @access  Private
router.get('/settings', protect, async (req: AuthRequest, res: Response) => {
  try {
    let settings = await prisma.userSettings.findUnique({
      where: { userId: req.user!.id }
    })

    if (!settings) {
      // Create default settings if they don't exist
      settings = await prisma.userSettings.create({
        data: {
          userId: req.user!.id
        }
      })
    }

    res.status(200).json({
      success: true,
      data: settings
    })
  } catch (error) {
    console.error('Get settings error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

// @desc    Update user settings
// @route   PUT /api/users/settings
// @access  Private
router.put('/settings', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const validatedData = updateSettingsSchema.parse(req.body)

    const settings = await prisma.userSettings.upsert({
      where: { userId: req.user!.id },
      update: validatedData,
      create: {
        userId: req.user!.id,
        ...validatedData
      }
    })

    res.status(200).json({
      success: true,
      data: settings
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      })
      return
    }

    console.error('Update settings error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

// @desc    Delete user account
// @route   DELETE /api/users/account
// @access  Private
router.delete('/account', protect, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.user.delete({
      where: { id: req.user!.id }
    })

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully'
    })
  } catch (error) {
    console.error('Delete account error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

export default router
