import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma'

interface AuthRequest extends Request {
  user?: {
    id: string
    email: string
    name: string
  }
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    let token

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1]
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      })
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, email: true, name: true }
      })

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'No user found with this id'
        })
      }

      req.user = user
      next()
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      })
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
}

export { AuthRequest }
