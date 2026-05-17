import { Router, Request, Response } from 'express'
import { body, validationResult } from 'express-validator'
import { prisma } from '../utils/prisma'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()

// Get reviews for a spot
router.get('/spot/:spotId', async (req: any, res: Response) => {
  const reviews = await prisma.review.findMany({
    where: { spotId: req.params.spotId },
    include: { author: { select: { name: true, avatar: true } } },
    orderBy: { createdAt: 'desc' },
  })
  res.json(reviews)
})

// Submit review (must have completed booking)
router.post('/',
  authenticate,
  body('bookingId').notEmpty(),
  body('rating').isInt({ min: 1, max: 5 }),
  async (req: Request, res: Response) => { const authReq = req as AuthRequest;
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })

    const { bookingId, rating, comment } = req.body
    const booking = await prisma.booking.findFirst({
      where: { id: bookingId, userId: authReq.user!.userId, status: 'COMPLETED' },
      include: { spot: true },
    })
    if (!booking) return res.status(404).json({ error: 'Completed booking not found' })

    const existing = await prisma.review.findUnique({ where: { bookingId } })
    if (existing) return res.status(409).json({ error: 'Review already submitted' })

    const review = await prisma.review.create({
      data: {
        bookingId,
        authorId: authReq.user!.userId,
        spotId: booking.spotId,
        targetUserId: booking.spot.hostId,
        rating,
        comment,
      },
    })

    // Update spot aggregate rating
    const agg = await prisma.review.aggregate({ where: { spotId: booking.spotId }, _avg: { rating: true }, _count: true })
    await prisma.parkingSpot.update({
      where: { id: booking.spotId },
      data: { totalRating: agg._avg.rating || 0, ratingCount: agg._count },
    })

    res.status(201).json(review)
  }
)

export default router
