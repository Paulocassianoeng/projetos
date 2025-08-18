import { Request, Response, NextFunction } from 'express'

interface Error {
  statusCode?: number
  message: string
  stack?: string
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = { ...err }
  error.message = err.message

  // Log error
  console.error(err)

  // Mongoose bad ObjectId
  if (err.message.includes('Cast to ObjectId failed')) {
    const message = 'Resource not found'
    error = { message, statusCode: 404 }
  }

  // Mongoose duplicate key
  if (err.message.includes('duplicate key')) {
    const message = 'Resource already exists'
    error = { message, statusCode: 400 }
  }

  // Mongoose validation error
  if (err.message.includes('ValidationError')) {
    const message = 'Invalid input data'
    error = { message, statusCode: 400 }
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
}
