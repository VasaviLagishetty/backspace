'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Car, Loader2, Lock, Mail, Eye, EyeOff } from 'lucide-react'
import { toast } from '@/components/ui/toaster'
import { useAuthStore } from '@/lib/auth-store'
import api from '@/lib/api'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  rememberMe: z.boolean().optional(),
})

export default function LoginPage() {
  const router = useRouter()
  const { setAuth } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const saved = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('savedLogin') || 'null') : null
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: saved ? { email: saved.email, password: saved.password, rememberMe: true } : {},
  })

  const onSubmit = async (data: any) => {
    setLoading(true)
    try {
      if (data.rememberMe) {
        localStorage.setItem('savedLogin', JSON.stringify({ email: data.email, password: data.password }))
      } else {
        localStorage.removeItem('savedLogin')
      }
      const res = await api.post('/auth/login', { email: data.email, password: data.password })
      setAuth(res.data.user, res.data.token, res.data.refreshToken)
      router.push(res.data.user.role === 'HOST' ? '/dashboard?tab=spots' : '/')
    } catch (e: any) {
      toast({ title: 'Login failed', description: e.response?.data?.error || 'Invalid credentials', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-[#f4f6fb]">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#031c47] flex-col items-center justify-center p-12 text-white">
        <img src="/logo.png" alt="Backspace" className="h-20 w-auto object-contain mb-6" />
        <h2 className="text-3xl font-bold mb-3">Welcome to Backspace</h2>
        <p className="text-blue-200 text-center max-w-xs">
          Smart parking near you. Find, book, and pay for parking spots in seconds.
        </p>
        <div className="mt-10 grid grid-cols-2 gap-4 w-full max-w-xs text-center">
          {[['650+', 'Spots'], ['50K+', 'Drivers'], ['4.8★', 'Rating'], ['24/7', 'Support']].map(([v, l]) => (
            <div key={l} className="bg-white/10 rounded-xl p-4">
              <div className="text-xl font-bold text-amber-400">{v}</div>
              <div className="text-sm text-blue-200">{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 justify-center mb-8">
            <div className="bg-[#031c47] rounded-xl p-2">
              <Car className="h-6 w-6 text-amber-400" />
            </div>
            <span className="text-xl font-bold text-[#031c47]">Backspace</span>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Sign in</h1>
            <p className="text-gray-500 text-sm mb-5">Welcome back! Enter your details below.</p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-[#031c47] focus:ring-2 focus:ring-[#031c47]/10 transition placeholder:text-gray-400"
                    {...register('email')}
                  />
                </div>
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message as string}</p>}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <Link href="/forgot-password" className="text-xs text-[#031c47] font-medium hover:underline">Forgot password?</Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-[#031c47] focus:ring-2 focus:ring-[#031c47]/10 transition placeholder:text-gray-400"
                    {...register('password')}
                  />
                  <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" {...register('rememberMe')} className="h-4 w-4 rounded border-gray-300 text-[#031c47] focus:ring-[#031c47]" />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#031c47] hover:bg-[#243d7a] text-white font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Sign In
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-[#031c47] font-semibold hover:underline">Create one</Link>
            </p>
            <p className="text-center text-sm mt-2">
              <Link href="/login/host" className="text-amber-600 font-medium hover:underline">Login/Signup as host</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
