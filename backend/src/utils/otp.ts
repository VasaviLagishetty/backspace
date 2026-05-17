// Simple in-memory OTP store with TTL (no Redis needed for MVP)
const otpStore = new Map<string, { code: string; expiresAt: number }>()

export function storeOtp(phone: string, code: string, ttlMs = 300000) {
  otpStore.set(phone, { code, expiresAt: Date.now() + ttlMs })
}

export function verifyOtp(phone: string, code: string): boolean {
  const entry = otpStore.get(phone)
  if (!entry) return false
  if (Date.now() > entry.expiresAt) { otpStore.delete(phone); return false }
  if (entry.code !== code) return false
  otpStore.delete(phone)
  return true
}
