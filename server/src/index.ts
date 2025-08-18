import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import { createServer } from 'http'
import { Server } from 'socket.io'
import dotenv from 'dotenv'

// Import routes
import authRoutes from './routes/auth'
import userRoutes from './routes/users'
import appointmentRoutes from './routes/appointments'
import aiRoutes from './routes/ai'
import settingsRoutes from './routes/settings'

// Import middleware
import { errorHandler } from './middleware/errorHandler'
import { notFound } from './middleware/notFound'

// Load environment variables
dotenv.config()

const app = express()
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
})

const PORT = process.env.PORT || 5000

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
})

// Middleware
app.use(limiter)
app.use(helmet())
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true
}))
app.use(morgan('combined'))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/appointments', appointmentRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/settings', settingsRoutes)

// Servir arquivos estáticos de uploads
import path from 'path';
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

// Error handling middleware
app.use(notFound)
app.use(errorHandler)

// Socket.IO for real-time features
io.on('connection', (socket) => {
  console.log('User connected:', socket.id)

  socket.on('join-user-room', (userId: string) => {
    socket.join(`user:${userId}`)
    console.log(`User ${userId} joined their room`)
  })

  socket.on('appointment-update', (data) => {
    // Broadcast to all users in the room
    socket.to(`user:${data.userId}`).emit('appointment-updated', data)
  })

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id)
  })
})

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📱 Socket.IO enabled`)
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`)
})

export { io }
