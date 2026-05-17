import { Server, Socket } from 'socket.io'
import { verifyToken } from '../utils/jwt'
import { prisma } from '../utils/prisma'

let ioInstance: Server

export function initSocket(io: Server) {
  ioInstance = io

  io.use((socket, next) => {
    const token = socket.handshake.auth.token
    if (!token) return next(new Error('Authentication required'))
    try {
      const user = verifyToken(token)
      ;(socket as any).user = user
      next()
    } catch {
      next(new Error('Invalid token'))
    }
  })

  io.on('connection', (socket: Socket) => {
    const user = (socket as any).user

    // Join personal room for notifications
    socket.join(`user:${user.userId}`)

    // Subscribe to spot updates in a geographic area
    socket.on('watch:area', ({ lat, lng, radius }: { lat: number; lng: number; radius: number }) => {
      socket.join(`area:${Math.round(lat * 10)}:${Math.round(lng * 10)}`)
    })

    // Subscribe to specific spot
    socket.on('watch:spot', (spotId: string) => {
      socket.join(`spot:${spotId}`)
    })

    socket.on('unwatch:spot', (spotId: string) => {
      socket.leave(`spot:${spotId}`)
    })

    // Request current availability for a spot
    socket.on('get:availability', async (spotId: string) => {
      const bookings = await prisma.booking.findMany({
        where: { spotId, status: { in: ['CONFIRMED', 'ACTIVE', 'EXTENDED'] }, endTime: { gt: new Date() } },
        select: { startTime: true, endTime: true },
      })
      socket.emit('availability:data', { spotId, bookings })
    })

    socket.on('disconnect', () => {})
  })
}

export function emitSpotUpdate(spotId: string, event: string, data: any) {
  if (!ioInstance) return
  ioInstance.to(`spot:${spotId}`).emit(`spot:${event}`, data)
  ioInstance.emit(`spots:${event}`, data) // broadcast to all for map updates
}

export function emitUserNotification(userId: string, notification: any) {
  if (!ioInstance) return
  ioInstance.to(`user:${userId}`).emit('notification', notification)
}
