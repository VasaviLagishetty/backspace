import jwt from 'jsonwebtoken'

const SECRET = process.env.JWT_SECRET!
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!

export const signToken = (userId: string, role: string) =>
  jwt.sign({ userId, role }, SECRET, { expiresIn: '15m' })

export const signRefreshToken = (userId: string) =>
  jwt.sign({ userId }, REFRESH_SECRET, { expiresIn: '7d' })

export const verifyToken = (token: string) => jwt.verify(token, SECRET) as { userId: string; role: string }

export const verifyRefreshToken = (token: string) => jwt.verify(token, REFRESH_SECRET) as { userId: string }
