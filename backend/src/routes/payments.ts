import { Router, Request, Response } from 'express'
import Razorpay from 'razorpay'
import crypto from 'crypto'
import { prisma } from '../utils/prisma'
import { authenticate, AuthRequest } from '../middleware/auth'
import { sendBookingConfirmation } from '../services/notifications'
import { emitSpotUpdate } from '../services/socket'

const router = Router()

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

// Create Razorpay order for a booking
router.post('/create-order', authenticate, async (req: Request, res: Response) => { const authReq = req as AuthRequest;
  const { bookingId } = req.body
  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, userId: authReq.user!.userId, status: 'PENDING' },
  })
  if (!booking) return res.status(404).json({ error: 'Pending booking not found' })

  const order = await razorpay.orders.create({
    amount: Math.round((booking.totalAmount + booking.latePenalty) * 100), // paise
    currency: 'INR',
    receipt: booking.id,
    notes: { bookingId: booking.id, userId: authReq.user!.userId },
  })

  await prisma.payment.upsert({
    where: { bookingId },
    create: { bookingId, razorpayOrderId: order.id, amount: booking.totalAmount, status: 'PENDING' },
    update: { razorpayOrderId: order.id, status: 'PENDING' },
  })

  res.json({ orderId: order.id, amount: order.amount, currency: order.currency, key: process.env.RAZORPAY_KEY_ID })
})

// Verify payment signature and confirm booking
router.post('/verify', authenticate, async (req: Request, res: Response) => { const authReq = req as AuthRequest;
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body

  const expectedSig = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex')

  if (expectedSig !== razorpay_signature)
    return res.status(400).json({ error: 'Invalid payment signature' })

  const [payment, booking] = await prisma.$transaction([
    prisma.payment.update({
      where: { bookingId },
      data: { razorpayPaymentId: razorpay_payment_id, razorpaySignature: razorpay_signature, status: 'CAPTURED' },
    }),
    prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'CONFIRMED' },
      include: { user: true, spot: true, vehicle: true },
    }),
  ])

  emitSpotUpdate(booking.spotId, 'booked', { spotId: booking.spotId, endTime: booking.endTime })
  await sendBookingConfirmation(booking.user.email, booking)

  res.json({ success: true, booking, payment })
})

// Razorpay webhook (for server-side payment events)
router.post('/webhook', async (req: Request, res: Response) => {
  const signature = req.headers['x-razorpay-signature'] as string
  const body = JSON.stringify(req.body)

  const expectedSig = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(body)
    .digest('hex')

  if (expectedSig !== signature) return res.status(400).json({ error: 'Invalid webhook signature' })

  const { event, payload } = req.body

  if (event === 'payment.captured') {
    const paymentId = payload.payment.entity.id
    const orderId = payload.payment.entity.order_id
    await prisma.payment.updateMany({
      where: { razorpayOrderId: orderId },
      data: { razorpayPaymentId: paymentId, status: 'CAPTURED' },
    })
  }

  if (event === 'payment.failed') {
    const orderId = payload.payment.entity.order_id
    await prisma.payment.updateMany({
      where: { razorpayOrderId: orderId },
      data: { status: 'FAILED' },
    })
  }

  res.json({ received: true })
})

// Refund (on cancellation)
router.post('/refund', authenticate, async (req: Request, res: Response) => { const authReq = req as AuthRequest;
  const { bookingId } = req.body
  const payment = await prisma.payment.findFirst({
    where: { bookingId, status: 'CAPTURED' },
    include: { booking: { include: { user: true } } },
  })
  if (!payment) return res.status(404).json({ error: 'No captured payment found' })
  if (payment.booking.userId !== authReq.user!.userId)
    return res.status(403).json({ error: 'Forbidden' })

  const refund = await razorpay.payments.refund(payment.razorpayPaymentId!, {
    amount: Math.round(payment.amount * 100),
  })

  await prisma.payment.update({
    where: { id: payment.id },
    data: { status: 'REFUNDED', refundId: refund.id },
  })

  res.json({ success: true, refundId: refund.id })
})

// Get payment details
router.get('/:bookingId', authenticate, async (req: Request, res: Response) => { const authReq = req as AuthRequest;
  const payment = await prisma.payment.findFirst({
    where: { bookingId: req.params.bookingId, booking: { userId: authReq.user!.userId } },
  })
  if (!payment) return res.status(404).json({ error: 'Payment not found' })
  res.json(payment)
})

export default router
