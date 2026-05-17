import { Router, Request, Response } from 'express'
import { body, query, validationResult } from 'express-validator'
import { prisma } from '../utils/prisma'
import { authenticate, requireRole, AuthRequest } from '../middleware/auth'
import { emitSpotUpdate } from '../services/socket'

const router = Router()

// Haversine distance in km
function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// Search spots with filters
router.get('/search', async (req: Request, res: Response) => {
  const {
    lat, lng, radius = '50', // km
    vehicleId, vehicleWidth, vehicleLength,
    isEv, minPrice, maxPrice, amenities,
    startTime, endTime, page = '1', limit = '20',
  } = req.query as Record<string, string>

  const spots = await prisma.parkingSpot.findMany({
    where: {
      status: 'ACTIVE',
      ...(isEv === 'true' && { isEvCharging: true }),
      ...(minPrice && { pricePerHour: { gte: parseFloat(minPrice) } }),
      ...(maxPrice && { pricePerHour: { lte: parseFloat(maxPrice) } }),
      ...(amenities && { amenities: { hasSome: amenities.split(',') } }),
    },
    include: {
      host: { select: { id: true, name: true, avatar: true } },
      availability: true,
      _count: { select: { bookings: true, reviews: true } },
    },
  })

  // Filter by distance
  let filtered = spots
  if (lat && lng) {
    filtered = spots.filter(s =>
      haversine(parseFloat(lat), parseFloat(lng), s.latitude, s.longitude) <= parseFloat(radius)
    ).map(s => ({
      ...s,
      distance: haversine(parseFloat(lat), parseFloat(lng), s.latitude, s.longitude),
    })).sort((a: any, b: any) => a.distance - b.distance)
  }

  // Filter by vehicle dimensions
  if (vehicleWidth && vehicleLength) {
    const w = parseFloat(vehicleWidth), l = parseFloat(vehicleLength)
    filtered = filtered.filter(s => s.width >= w && s.length >= l)
  }

  // Filter by time availability (no conflicting confirmed bookings)
  if (startTime && endTime) {
    const start = new Date(startTime), end = new Date(endTime)
    const bookedSpotIds = await prisma.booking.findMany({
      where: {
        status: { in: ['CONFIRMED', 'ACTIVE'] },
        OR: [{ startTime: { lt: end }, endTime: { gt: start } }],
      },
      select: { spotId: true },
    })
    const bookedIds = new Set(bookedSpotIds.map(b => b.spotId))
    filtered = filtered.filter(s => !bookedIds.has(s.id))
  }

  const pageNum = parseInt(page), limitNum = parseInt(limit)
  const paginated = filtered.slice((pageNum - 1) * limitNum, pageNum * limitNum)

  res.json({ spots: paginated, total: filtered.length, page: pageNum, pages: Math.ceil(filtered.length / limitNum) })
})

// Get single spot
router.get('/:id', async (req: Request, res: Response) => {
  const spot = await prisma.parkingSpot.findUnique({
    where: { id: req.params.id },
    include: {
      host: { select: { id: true, name: true, avatar: true, createdAt: true } },
      availability: true,
      reviews: { include: { author: { select: { name: true, avatar: true } } }, orderBy: { createdAt: 'desc' }, take: 10 },
      _count: { select: { bookings: true, reviews: true, favorites: true } },
    },
  })
  if (!spot) return res.status(404).json({ error: 'Spot not found' })
  res.json(spot)
})

// Create spot (HOST only)
router.post('/',
  authenticate, requireRole('HOST', 'ADMIN'),
  body('title').notEmpty(),
  body('address').notEmpty(),
  body('latitude').isFloat(), body('longitude').isFloat(),
  body('width').isFloat({ min: 1.5 }), body('length').isFloat({ min: 3 }),
  body('pricePerHour').isFloat({ min: 0 }),
  async (req: Request, res: Response) => { const authReq = req as AuthRequest;
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })

    const { availability, ...spotData } = req.body
    const spot = await prisma.parkingSpot.create({
      data: {
        ...spotData,
        hostId: authReq.user!.userId,
        ...(availability && {
          availability: { create: availability },
        }),
      },
      include: { availability: true },
    })
    emitSpotUpdate(spot.id, 'created', spot)
    res.status(201).json(spot)
  }
)

// Update spot
router.patch('/:id', authenticate, async (req: Request, res: Response) => { const authReq = req as AuthRequest;
  const spot = await prisma.parkingSpot.findUnique({ where: { id: req.params.id } })
  if (!spot) return res.status(404).json({ error: 'Not found' })
  if (spot.hostId !== authReq.user!.userId && authReq.user!.role !== 'ADMIN')
    return res.status(403).json({ error: 'Forbidden' })

  const { availability, ...data } = req.body
  const updated = await prisma.parkingSpot.update({ where: { id: req.params.id }, data })
  emitSpotUpdate(spot.id, 'updated', updated)
  res.json(updated)
})

// Delete spot
router.delete('/:id', authenticate, async (req: Request, res: Response) => { const authReq = req as AuthRequest;
  const spot = await prisma.parkingSpot.findUnique({ where: { id: req.params.id } })
  if (!spot) return res.status(404).json({ error: 'Not found' })
  if (spot.hostId !== authReq.user!.userId && authReq.user!.role !== 'ADMIN')
    return res.status(403).json({ error: 'Forbidden' })
  await prisma.parkingSpot.update({ where: { id: req.params.id }, data: { status: 'INACTIVE' } })
  emitSpotUpdate(spot.id, 'deleted', { id: spot.id })
  res.json({ success: true })
})

// Host's own spots
router.get('/host/mine', authenticate, async (req: Request, res: Response) => { const authReq = req as AuthRequest;
  const spots = await prisma.parkingSpot.findMany({
    where: { hostId: authReq.user!.userId },
    include: { _count: { select: { bookings: true } }, availability: true },
    orderBy: { createdAt: 'desc' },
  })
  res.json(spots)
})

// Update availability slots
router.put('/:id/availability', authenticate, async (req: Request, res: Response) => { const authReq = req as AuthRequest;
  const spot = await prisma.parkingSpot.findUnique({ where: { id: req.params.id } })
  if (!spot || spot.hostId !== authReq.user!.userId) return res.status(403).json({ error: 'Forbidden' })

  await prisma.availability.deleteMany({ where: { spotId: req.params.id } })
  const slots = await prisma.availability.createMany({ data: req.body.slots.map((s: any) => ({ ...s, spotId: req.params.id })) })
  res.json(slots)
})

export default router
