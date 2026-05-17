'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Car, Loader2, Lock, Mail } from 'lucide-react'
import { toast } from '@/components/ui/toaster'
import { useAuthStore } from '@/lib/auth-store'
import api from '@/lib/api'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export default function LoginPage() {
  const router = useRouter()
  const { setAuth } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) })

  const onSubmit = async (data: any) => {
    setLoading(true)
    try {
      const res = await api.post('/auth/login', data)
      setAuth(res.data.user, res.data.token, res.data.refreshToken)
      router.push('/')
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
        <div className="bg-amber-400 rounded-2xl p-4 mb-6">
          <Car className="h-12 w-12 text-[#031c47]" />
        </div>
        <h2 className="text-3xl font-bold mb-3">Welcome to backspace</h2>
        <p className="text-blue-200 text-center max-w-xs">
          Smart parking near you. Find, book, and pay for parking spots in seconds.
        </p>
        <div className="mt-10 grid grid-cols-2 gap-4 w-full max-w-xs text-center">
          {[['500+', 'Spots'], ['50K+', 'Drivers'], ['4.8★', 'Rating'], ['24/7', 'Support']].map(([v, l]) => (
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
            <span className="text-xl font-bold text-[#031c47]">backspace</span>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Sign in</h1>
            <p className="text-gray-500 text-sm mb-7">Welcome back! Enter your details below.</p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#031c47] focus:ring-2 focus:ring-[#031c47]/10 transition"
                    {...register('email')}
                  />
                </div>
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message as string}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#031c47] focus:ring-2 focus:ring-[#031c47]/10 transition"
                    {...register('password')}
                  />
                </div>
              </div>

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
          </div>
        </div>
      </div>
    </div>
  )
}
