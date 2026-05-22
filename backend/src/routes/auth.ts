import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import { body, validationResult } from 'express-validator'
import axios from 'axios'
import { prisma } from '../utils/prisma'
import { signToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt'
import { authenticate, AuthRequest } from '../middleware/auth'
import crypto from 'crypto'

const router = Router()

// In-memory OTP store (for dev; use Redis in production)
const resetOtps = new Map<string, { otp: string; expires: number }>()

// Register
router.post('/register',
  body('email').isEmail(),
  body('password').isLength({ min: 8 }),
  body('name').notEmpty(),
  async (req: Request, res: Response) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })

    try {
      const { email, password, name, phone, role } = req.body
      const existing = await prisma.user.findUnique({ where: { email } })
      if (existing) return res.status(409).json({ error: 'Email already registered' })

      if (phone) {
        const phoneExists = await prisma.user.findUnique({ where: { phone } })
        if (phoneExists) return res.status(409).json({ error: 'Phone number already registered' })
      }

      const passwordHash = await bcrypt.hash(password, 12)
      const user = await prisma.user.create({
        data: { email, name, phone: phone || null, passwordHash, role: role === 'HOST' ? 'HOST' : 'USER' },
        select: { id: true, email: true, name: true, role: true },
      })

      const token = signToken(user.id, user.role)
      const refreshToken = signRefreshToken(user.id)
      res.status(201).json({ user, token, refreshToken })
    } catch (e: any) {
      console.error('Registration error:', e)
      res.status(500).json({ error: 'Registration failed. Please try again.' })
    }
  }
)

// Login
router.post('/login',
  body('email').isEmail(),
  body('password').notEmpty(),
  async (req: Request, res: Response) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })

    const { email, password } = req.body
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !user.passwordHash) return res.status(401).json({ error: 'Invalid credentials' })

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' })

    const token = signToken(user.id, user.role)
    const refreshToken = signRefreshToken(user.id)
    res.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role, avatar: user.avatar }, token, refreshToken })
  }
)

// Google OAuth - exchange Google access token
router.post('/google', async (req: Request, res: Response) => {
  const { accessToken } = req.body
  if (!accessToken) return res.status(400).json({ error: 'Access token required' })

  const { data } = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  let user = await prisma.user.findFirst({ where: { OR: [{ googleId: data.id }, { email: data.email }] } })
  if (!user) {
    user = await prisma.user.create({
      data: { email: data.email, name: data.name, googleId: data.id, avatar: data.picture, isVerified: true },
    })
  } else if (!user.googleId) {
    user = await prisma.user.update({ where: { id: user.id }, data: { googleId: data.id, avatar: data.picture } })
  }

  const token = signToken(user.id, user.role)
  const refreshToken = signRefreshToken(user.id)
  res.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role, avatar: user.avatar }, token, refreshToken })
})

// Refresh token
router.post('/refresh', async (req: Request, res: Response) => {
  const { refreshToken } = req.body
  if (!refreshToken) return res.status(400).json({ error: 'Refresh token required' })
  try {
    const { userId } = verifyRefreshToken(refreshToken)
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) return res.status(401).json({ error: 'User not found' })
    res.json({ token: signToken(user.id, user.role) })
  } catch {
    res.status(401).json({ error: 'Invalid refresh token' })
  }
})

// Get current user
router.get('/me', authenticate, async (req: Request, res: Response) => { const authReq = req as AuthRequest;
  const user = await prisma.user.findUnique({
    where: { id: authReq.user!.userId },
    select: { id: true, email: true, name: true, phone: true, role: true, avatar: true, isVerified: true, createdAt: true },
  })
  res.json(user)
})

// Update profile
router.patch('/me', authenticate, async (req: Request, res: Response) => { const authReq = req as AuthRequest;
  const { name, phone } = req.body
  const user = await prisma.user.update({
    where: { id: authReq.user!.userId },
    data: { name, phone },
    select: { id: true, email: true, name: true, phone: true, role: true, avatar: true },
  })
  res.json(user)
})

// Forgot password - send OTP
router.post('/forgot-password', body('email').isEmail(), async (req: Request, res: Response) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })

  const { email } = req.body
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return res.status(404).json({ error: 'No account found with this email' })

  const otp = crypto.randomInt(100000, 999999).toString()
  resetOtps.set(email, { otp, expires: Date.now() + 10 * 60 * 1000 }) // 10 min expiry

  // Log OTP in dev (in production, send via email)
  console.log(`[DEV] Password reset OTP for ${email}: ${otp}`)

  res.json({ message: 'OTP sent to your email' })
})

// Reset password with OTP
router.post('/reset-password',
  body('email').isEmail(),
  body('otp').isLength({ min: 6, max: 6 }),
  body('password').isLength({ min: 8 }),
  async (req: Request, res: Response) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })

    const { email, otp, password } = req.body
    const stored = resetOtps.get(email)

    if (!stored || stored.otp !== otp) return res.status(400).json({ error: 'Invalid OTP' })
    if (Date.now() > stored.expires) {
      resetOtps.delete(email)
      return res.status(400).json({ error: 'OTP expired. Please request a new one.' })
    }

    const passwordHash = await bcrypt.hash(password, 12)
    await prisma.user.update({ where: { email }, data: { passwordHash } })
    resetOtps.delete(email)

    res.json({ message: 'Password reset successful' })
  }
)

export default router
