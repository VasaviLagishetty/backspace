'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Car, Loader2, Mail, Lock, ArrowLeft } from 'lucide-react'
import { toast } from '@/components/ui/toaster'
import api from '@/lib/api'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [step, setStep] = useState<'email' | 'reset'>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email })
      toast({ title: 'OTP sent', description: 'Check your email for the reset code' })
      setStep('reset')
    } catch (e: any) {
      toast({ title: 'Error', description: e.response?.data?.error || 'Failed to send OTP', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      toast({ title: 'Error', description: 'Passwords do not match', variant: 'destructive' })
      return
    }
    if (password.length < 8) {
      toast({ title: 'Error', description: 'Password must be at least 8 characters', variant: 'destructive' })
      return
    }
    setLoading(true)
    try {
      await api.post('/auth/reset-password', { email, otp, password })
      toast({ title: 'Password reset successful', description: 'Please login with your new password' })
      router.push('/login')
    } catch (e: any) {
      toast({ title: 'Error', description: e.response?.data?.error || 'Failed to reset password', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f6fb] p-6">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="bg-[#031c47] rounded-xl p-2">
            <Car className="h-6 w-6 text-amber-400" />
          </div>
          <span className="text-xl font-bold text-[#031c47]">backspace</span>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <Link href="/login" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to login
          </Link>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">Reset password</h1>
          <p className="text-gray-500 text-sm mb-7">
            {step === 'email' ? "Enter your email and we'll send you a reset code." : 'Enter the OTP and your new password.'}
          </p>

          {step === 'email' ? (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="email" placeholder="you@example.com" value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#031c47] focus:ring-2 focus:ring-[#031c47]/10 transition"
                    required
                  />
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-[#031c47] hover:bg-[#243d7a] text-white font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-60">
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Send Reset Code
              </button>
            </form>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">OTP Code</label>
                <input
                  type="text" placeholder="Enter 6-digit code" value={otp}
                  onChange={e => setOtp(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#031c47] focus:ring-2 focus:ring-[#031c47]/10 transition tracking-widest text-center"
                  maxLength={6} required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="password" placeholder="Min 8 characters" value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#031c47] focus:ring-2 focus:ring-[#031c47]/10 transition"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="password" placeholder="Re-enter password" value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#031c47] focus:ring-2 focus:ring-[#031c47]/10 transition"
                    required
                  />
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-[#031c47] hover:bg-[#243d7a] text-white font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-60">
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Reset Password
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
