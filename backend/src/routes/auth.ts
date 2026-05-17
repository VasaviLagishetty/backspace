import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import { body, validationResult } from 'express-validator'
import axios from 'axios'
import { prisma } from '../utils/prisma'
import { signToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()

// Register
router.post('/register',
  body('email').isEmail(),
  body('password').isLength({ min: 8 }),
  body('name').notEmpty(),
  async (req: Request, res: Response) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })

    const { email, password, name, phone, role } = req.body
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return res.status(409).json({ error: 'Email already registered' })

    const passwordHash = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({
      data: { email, name, phone, passwordHash, role: role === 'HOST' ? 'HOST' : 'USER' },
      select: { id: true, email: true, name: true, role: true },
    })

    const token = signToken(user.id, user.role)
    const refreshToken = signRefreshToken(user.id)
    res.status(201).json({ user, token, refreshToken })
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

export default router
