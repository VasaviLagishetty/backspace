import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { createServer } from 'http'
import { Server } from 'socket.io'
import dotenv from 'dotenv'
import { rateLimit } from 'express-rate-limit'

import authRoutes from './routes/auth'
import spotRoutes from './routes/spots'
import bookingRoutes from './routes/bookings'
import paymentRoutes from './routes/payments'
import notificationRoutes from './routes/notifications'
import reviewRoutes from './routes/reviews'
import issueRoutes from './routes/issues'
import favoriteRoutes from './routes/favorites'
import vehicleRoutes from './routes/vehicles'
import otpRoutes from './routes/otp'
import adminRoutes from './routes/admin'
import { initSocket } from './services/socket'
import { startNoShowJob } from './services/scheduler'

dotenv.config()

const app = express()
const httpServer = createServer(app)

export const io = new Server(httpServer, {
  cors: { origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true },
})

initSocket(io)

app.use(helmet())
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }))
app.use(express.json())

// Global rate limit
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }))

// Stricter rate limits for auth and booking
const authLimiter = rateLimit({ windowMs: 60 * 1000, max: 20, message: { error: 'Too many attempts, try again in 1 minute' } })
const bookingLimiter = rateLimit({ windowMs: 60 * 1000, max: 10, message: { error: 'Too many booking attempts, try again in 1 minute' } })

app.use('/api/auth', authLimiter, authRoutes)
app.use('/api/otp', authLimiter, otpRoutes)
app.use('/api/spots', spotRoutes)
app.use('/api/bookings', bookingLimiter, bookingRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/issues', issueRoutes)
app.use('/api/favorites', favoriteRoutes)
app.use('/api/vehicles', vehicleRoutes)
app.use('/api/admin', adminRoutes)

app.get('/health', (_, res) => res.json({ status: 'ok' }))

// Start scheduled jobs
startNoShowJob()

const PORT = process.env.PORT || 5000
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`))

export default app
