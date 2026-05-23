import { Router, Request, Response } from 'express'
import { body, validationResult } from 'express-validator'
import QRCode from 'qrcode'
import { prisma } from '../utils/prisma'
import { authenticate, AuthRequest } from '../middleware/auth'
import { emitSpotUpdate } from '../services/socket'
import { sendBookingConfirmation, sendBookingCancellation } from '../services/notifications'

const router = Router()
router.use(authenticate)

const PLATFORM_FEE_RATE = 0.20 // 20%
const LATE_PENALTY_RATE = 0.50 // 50% of hourly rate per hour late

// Create booking (after payment order is created)
router.post('/',
  body('spotId').notEmpty(),
  body('vehicleId').notEmpty(),
  body('startTime').isISO8601(),
  body('endTime').isISO8601(),
  async (req: Request, res: Response) => { const authReq = req as AuthRequest;
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })

    const { spotId, vehicleId, startTime, endTime, notes } = req.body
    const start = new Date(startTime), end = new Date(endTime)

    if (end <= start) return res.status(400).json({ error: 'End time must be after start time' })

    const spot = await prisma.parkingSpot.findUnique({ where: { id: spotId } })
    if (!spot || spot.status !== 'ACTIVE') return res.status(404).json({ error: 'Spot not available' })

    // Check vehicle fits
    const vehicle = await prisma.vehicle.findFirst({ where: { id: vehicleId, userId: authReq.user!.userId } })
    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' })
    if (vehicle.width > spot.width || vehicle.length > spot.length)
      return res.status(400).json({ error: 'Vehicle does not fit in this spot' })

    // Check no conflicting bookings
    const conflict = await prisma.booking.findFirst({
      where: {
        spotId,
        status: { in: ['CONFIRMED', 'ACTIVE'] },
        OR: [{ startTime: { lt: end }, endTime: { gt: start } }],
      },
    })
    if (conflict) return res.status(409).json({ error: 'Spot already booked for this time' })

    const hours = (end.getTime() - start.getTime()) / 3600000
    const totalAmount = parseFloat((hours * spot.pricePerHour).toFixed(2))
    const platformFee = parseFloat((totalAmount * PLATFORM_FEE_RATE).toFixed(2))
    const hostEarnings = parseFloat((totalAmount - platformFee).toFixed(2))

    const booking = await prisma.booking.create({
      data: {
        userId: authReq.user!.userId,
        spotId,
        vehicleId,
        startTime: start,
        endTime: end,
        totalAmount,
        platformFee,
        hostEarnings,
        notes,
        status: 'PENDING',
      },
      include: { spot: true, vehicle: true },
    })

    res.status(201).json(booking)
  }
)

// Get booking by ID
router.get('/:id', async (req: Request, res: Response) => { const authReq = req as AuthRequest;
  if (req.params.id === 'host') return res.status(404).json({ error: 'Not found' })
  const booking = await prisma.booking.findFirst({
    where: { id: req.params.id, userId: authReq.user!.userId },
    include: {
      spot: { include: { host: { select: { name: true, phone: true } } } },
      vehicle: true,
      payment: true,
      extensions: true,
    },
  })
  if (!booking) return res.status(404).json({ error: 'Booking not found' })
  res.json(booking)
})

// Booking history
router.get('/', async (req: Request, res: Response) => { const authReq = req as AuthRequest;
  const { status, page = '1', limit = '10' } = req.query as Record<string, string>
  const bookings = await prisma.booking.findMany({
    where: { userId: authReq.user!.userId, ...(status && { status: status as any }) },
    include: { spot: { select: { title: true, address: true, images: true } }, vehicle: true, payment: true },
    orderBy: { createdAt: 'desc' },
    skip: (parseInt(page) - 1) * parseInt(limit),
    take: parseInt(limit),
  })
  const total = await prisma.booking.count({ where: { userId: authReq.user!.userId } })
  res.json({ bookings, total })
})

// Extend booking
router.post('/:id/extend',
  body('newEndTime').isISO8601(),
  async (req: Request, res: Response) => { const authReq = req as AuthRequest;
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })

    const booking = await prisma.booking.findFirst({
      where: { id: req.params.id, userId: authReq.user!.userId, status: { in: ['CONFIRMED', 'ACTIVE'] } },
      include: { spot: true },
    })
    if (!booking) return res.status(404).json({ error: 'Active booking not found' })

    const newEnd = new Date(req.body.newEndTime)
    if (newEnd <= booking.endTime) return res.status(400).json({ error: 'New end time must be later' })

    // Check no conflict after current end
    const conflict = await prisma.booking.findFirst({
      where: {
        spotId: booking.spotId,
        id: { not: booking.id },
        status: { in: ['CONFIRMED', 'ACTIVE'] },
        OR: [{ startTime: { lt: newEnd }, endTime: { gt: booking.endTime } }],
      },
    })
    if (conflict) return res.status(409).json({ error: 'Spot is booked after your current end time' })

    const extraHours = (newEnd.getTime() - booking.endTime.getTime()) / 3600000
    const extraAmount = parseFloat((extraHours * booking.spot.pricePerHour).toFixed(2))

    const [extension, updated] = await prisma.$transaction([
      prisma.bookingExtension.create({ data: { bookingId: booking.id, extendedTo: newEnd, extraAmount } }),
      prisma.booking.update({
        where: { id: booking.id },
        data: {
          originalEndTime: booking.originalEndTime || booking.endTime,
          endTime: newEnd,
          totalAmount: booking.totalAmount + extraAmount,
          hostEarnings: booking.hostEarnings + extraAmount * (1 - PLATFORM_FEE_RATE),
          platformFee: booking.platformFee + extraAmount * PLATFORM_FEE_RATE,
          status: 'EXTENDED',
        },
      }),
    ])

    res.json({ extension, booking: updated, extraAmount })
  }
)

// Cancel booking with refund tiers
router.post('/:id/cancel', async (req: Request, res: Response) => { const authReq = req as AuthRequest;
  const booking = await prisma.booking.findFirst({
    where: { id: req.params.id, userId: authReq.user!.userId, status: { in: ['PENDING', 'CONFIRMED', 'ACTIVE'] } },
    include: { spot: true, user: true, payment: true },
  })
  if (!booking) return res.status(404).json({ error: 'Cancellable booking not found' })

  // Refund tiers: >2hr before = 100%, <2hr before = 50%, after entry (ACTIVE) = 0%
  let refundPercent = 0
  if (booking.status === 'ACTIVE') {
    refundPercent = 0
  } else {
    const hoursUntilStart = (booking.startTime.getTime() - Date.now()) / 3600000
    refundPercent = hoursUntilStart > 2 ? 100 : 50
  }

  const updated = await prisma.booking.update({
    where: { id: booking.id },
    data: { status: 'CANCELLED' },
  })

  // Process refund if payment was captured
  if (booking.payment?.status === 'CAPTURED' && refundPercent > 0) {
    const refundAmount = parseFloat((booking.totalAmount * refundPercent / 100).toFixed(2))
    await prisma.payment.update({
      where: { id: booking.payment.id },
      data: { status: 'REFUNDED' },
    })
    // In production: call razorpay.payments.refund with partial amount
  }

  emitSpotUpdate(booking.spotId, 'available', { spotId: booking.spotId })
  await sendBookingCancellation(booking.user.email, booking)
  res.json({ booking: updated, refundPercent })
})

// Apply late penalty (called by cron or on checkout)
router.post('/:id/checkout', async (req: Request, res: Response) => { const authReq = req as AuthRequest;
  const booking = await prisma.booking.findFirst({
    where: { id: req.params.id, userId: authReq.user!.userId, status: { in: ['CONFIRMED', 'ACTIVE', 'EXTENDED'] } },
    include: { spot: true },
  })
  if (!booking) return res.status(404).json({ error: 'Booking not found' })

  const now = new Date()
  let latePenalty = 0
  if (now > booking.endTime) {
    const lateHours = Math.ceil((now.getTime() - booking.endTime.getTime()) / 3600000)
    latePenalty = parseFloat((lateHours * booking.spot.pricePerHour * LATE_PENALTY_RATE).toFixed(2))
  }

  const updated = await prisma.booking.update({
    where: { id: booking.id },
    data: { status: 'COMPLETED', latePenalty },
  })

  emitSpotUpdate(booking.spotId, 'available', { spotId: booking.spotId })
  res.json({ booking: updated, latePenalty })
})

// Host: view bookings for their spots
router.get('/host/bookings', async (req: Request, res: Response) => { const authReq = req as AuthRequest;
  const { page = '1', limit = '10' } = req.query as Record<string, string>
  const bookings = await prisma.booking.findMany({
    where: { spot: { hostId: authReq.user!.userId } },
    include: { user: { select: { name: true, email: true, phone: true } }, spot: { select: { title: true } }, vehicle: true, payment: true },
    orderBy: { createdAt: 'desc' },
    skip: (parseInt(page) - 1) * parseInt(limit),
    take: parseInt(limit),
  })
  res.json(bookings)
})

// Host: analytics (revenue, occupancy, stats)
router.get('/host/analytics', async (req: Request, res: Response) => { const authReq = req as AuthRequest;
  const hostId = authReq.user!.userId
  const spots = await prisma.parkingSpot.findMany({ where: { hostId }, select: { id: true } })
  const spotIds = spots.map(s => s.id)

  const [totalBookings, completedBookings, cancelledBookings, revenue] = await Promise.all([
    prisma.booking.count({ where: { spotId: { in: spotIds } } }),
    prisma.booking.count({ where: { spotId: { in: spotIds }, status: 'COMPLETED' } }),
    prisma.booking.count({ where: { spotId: { in: spotIds }, status: 'CANCELLED' } }),
    prisma.booking.aggregate({ where: { spotId: { in: spotIds }, status: { in: ['COMPLETED', 'ACTIVE', 'CONFIRMED'] } }, _sum: { hostEarnings: true } }),
  ])

  const occupancyRate = totalBookings > 0 ? ((completedBookings / totalBookings) * 100).toFixed(1) : '0'

  res.json({
    totalBookings,
    completedBookings,
    cancelledBookings,
    totalRevenue: revenue._sum.hostEarnings || 0,
    occupancyRate: `${occupancyRate}%`,
    totalSpots: spots.length,
  })
})

// Get QR code for booking
router.get('/:id/qr', async (req: Request, res: Response) => { const authReq = req as AuthRequest;
  const booking = await prisma.booking.findFirst({
    where: { id: req.params.id, userId: authReq.user!.userId, status: { in: ['CONFIRMED', 'ACTIVE', 'EXTENDED'] } },
  })
  if (!booking) return res.status(404).json({ error: 'Booking not found' })

  const qrData = JSON.stringify({ bookingId: booking.id, code: booking.confirmationCode, plate: booking.vehicleId })
  const qrImage = await QRCode.toDataURL(qrData)
  res.json({ qr: qrImage, confirmationCode: booking.confirmationCode })
})

export default router
