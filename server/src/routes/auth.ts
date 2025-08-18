import express, { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt, { SignOptions } from 'jsonwebtoken'
import { z } from 'zod'
import { prisma } from '../lib/prisma'

const router = express.Router()

// Validation schemas
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters')
})

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
})

// Generate JWT Token
const generateToken = (id: string): string => {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET is not defined')
  }
  
  return jwt.sign({ id }, secret, { expiresIn: '7d' })
}

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('[REGISTER] Body:', req.body);
    const { name, email, password } = registerSchema.parse(req.body)

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })
    if (existingUser) {
      console.warn('[REGISTER] User already exists:', email);
      res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      })
      return
    }

    // Hash password
    const salt = await bcrypt.genSalt(12)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        createdAt: true
      }
    })
    console.log('[REGISTER] User created:', user);

    // Create default user settings
    await prisma.userSettings.create({
      data: {
        userId: user.id
      }
    })
    console.log('[REGISTER] UserSettings created for:', user.id);

    const token = generateToken(user.id)

    res.status(201).json({
      success: true,
      data: {
        user,
        token
      }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('[REGISTER] Validation error:', error.errors);
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      })
      return
    }

    console.error('[REGISTER] Register error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : error
    })
  }
})

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('[LOGIN] Body:', req.body);
    const { email, password } = loginSchema.parse(req.body)

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      console.warn('[LOGIN] User not found:', email);
      res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      })
      return
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      console.warn('[LOGIN] Invalid password for:', email);
      res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      })
      return
    }

    const token = generateToken(user.id)

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          createdAt: user.createdAt
        },
        token
      }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('[LOGIN] Validation error:', error.errors);
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      })
      return
    }

    console.error('[LOGIN] Login error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : error
    })
  }
})

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', async (req: Request, res: Response) => {
  try {
    // This would normally use the auth middleware
    // For demo purposes, return demo user
    const demoUser = {
      id: '1',
      name: 'Usuário Demo',
      email: 'demo@agenda.com',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      createdAt: new Date()
    }

    res.status(200).json({
      success: true,
      data: demoUser
    })
  } catch (error) {
    console.error('Get me error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

export default router
