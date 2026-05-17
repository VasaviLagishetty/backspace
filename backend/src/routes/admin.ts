import { Router, Request, Response } from 'express'
import { prisma } from '../utils/prisma'
import { authenticate, requireRole, AuthRequest } from '../middleware/auth'

const router = Router()
router.use(authenticate, requireRole('ADMIN'))

// List owners pending verification
router.get('/owners', async (req: Request, res: Response) => {
  const { status } = req.query as { status?: string }
  const where = status === 'pending' ? { role: 'HOST' as const, isVerified: false } : { role: 'HOST' as const }
  const owners = await prisma.user.findMany({
    where,
    select: { id: true, name: true, email: true, phone: true, isVerified: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  })
  res.json(owners)
})

// Approve owner
router.post('/owners/:id/approve', async (req: Request, res: Response) => {
  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: { isVerified: true },
    select: { id: true, name: true, email: true, isVerified: true },
  })
  res.json(user)
})

// Reject/suspend owner
router.post('/owners/:id/reject', async (req: Request, res: Response) => {
  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: { isVerified: false },
    select: { id: true, name: true, email: true, isVerified: true },
  })
  // Suspend their spots
  await prisma.parkingSpot.updateMany({ where: { hostId: req.params.id }, data: { status: 'SUSPENDED' } })
  res.json(user)
})

// View all bookings
router.get('/bookings', async (req: Request, res: Response) => {
  const { page = '1', limit = '20', status } = req.query as Record<string, string>
  const where = status ? { status: status as any } : {}
  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      include: {
        user: { select: { name: true, email: true } },
        spot: { select: { title: true, address: true } },
        vehicle: { select: { licensePlate: true, type: true } },
        payment: { select: { status: true, amount: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
    }),
    prisma.booking.count({ where }),
  ])
  res.json({ bookings, total, page: parseInt(page) })
})

// View all disputes/issues
router.get('/disputes', async (req: Request, res: Response) => {
  const { status } = req.query as { status?: string }
  const where = status ? { status: status as any } : {}
  const issues = await prisma.issue.findMany({
    where,
    include: {
      user: { select: { name: true, email: true } },
      spot: { select: { title: true, host: { select: { name: true, email: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  })
  res.json(issues)
})

// Resolve dispute
router.post('/disputes/:id/resolve', async (req: Request, res: Response) => {
  const { resolution, status } = req.body
  const issue = await prisma.issue.update({
    where: { id: req.params.id },
    data: { resolution, status: status || 'RESOLVED' },
  })
  res.json(issue)
})

// Admin-initiated refund
router.post('/refund', async (req: Request, res: Response) => {
  const { bookingId, amount } = req.body
  const payment = await prisma.payment.findFirst({ where: { bookingId, status: 'CAPTURED' } })
  if (!payment) return res.status(404).json({ error: 'No captured payment' })

  // In production, call Razorpay partial refund API here
  await prisma.payment.update({
    where: { id: payment.id },
    data: { status: 'REFUNDED' },
  })
  await prisma.booking.update({ where: { id: bookingId }, data: { status: 'CANCELLED' } })
  res.json({ success: true, refundedAmount: amount || payment.amount })
})

// Platform stats
router.get('/stats', async (req: Request, res: Response) => {
  const [totalUsers, totalHosts, totalBookings, totalRevenue, activeBookings] = await Promise.all([
    prisma.user.count({ where: { role: 'USER' } }),
    prisma.user.count({ where: { role: 'HOST' } }),
    prisma.booking.count(),
    prisma.payment.aggregate({ where: { status: 'CAPTURED' }, _sum: { amount: true } }),
    prisma.booking.count({ where: { status: { in: ['CONFIRMED', 'ACTIVE'] } } }),
  ])
  res.json({
    totalUsers, totalHosts, totalBookings, activeBookings,
    totalRevenue: totalRevenue._sum.amount || 0,
  })
})

export default router
