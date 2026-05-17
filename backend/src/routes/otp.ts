import { Router, Request, Response } from 'express'
import { body, validationResult } from 'express-validator'
import twilio from 'twilio'
import { prisma } from '../utils/prisma'
import { authenticate, AuthRequest } from '../middleware/auth'
import { storeOtp, verifyOtp } from '../utils/otp'

const router = Router()
const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN)

// Send OTP to phone
router.post('/send',
  authenticate,
  body('phone').matches(/^[6-9]\d{9}$/),
  async (req: Request, res: Response) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })

    const { phone } = req.body
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    storeOtp(phone, code)

    try {
      await twilioClient.messages.create({
        body: `Backspace: Your verification code is ${code}. Valid for 5 minutes.`,
        from: process.env.TWILIO_FROM,
        to: `+91${phone}`,
      })
    } catch {
      return res.status(500).json({ error: 'Failed to send SMS' })
    }

    res.json({ message: 'OTP sent' })
  }
)

// Verify OTP and mark phone verified
router.post('/verify',
  authenticate,
  body('phone').matches(/^[6-9]\d{9}$/),
  body('code').isLength({ min: 6, max: 6 }),
  async (req: Request, res: Response) => {
    const authReq = req as AuthRequest
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })

    const { phone, code } = req.body
    if (!verifyOtp(phone, code)) return res.status(400).json({ error: 'Invalid or expired OTP' })

    const user = await prisma.user.update({
      where: { id: authReq.user!.userId },
      data: { phone, isVerified: true },
      select: { id: true, phone: true, isVerified: true },
    })

    res.json({ message: 'Phone verified', user })
  }
)

export default router
