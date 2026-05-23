'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Building2, Loader2, Lock, Mail, Eye, EyeOff } from 'lucide-react'
import { toast } from '@/components/ui/toaster'
import { useAuthStore } from '@/lib/auth-store'
import api from '@/lib/api'

const schema = z.object({ email: z.string().email(), password: z.string().min(1), rememberMe: z.boolean().optional() })

export default function HostLoginPage() {
  const router = useRouter()
  const { setAuth } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const saved = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('savedHostLogin') || 'null') : null
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema), defaultValues: saved ? { email: saved.email, password: saved.password, rememberMe: true } : {} })

  const onSubmit = async (data: any) => {
    setLoading(true)
    try {
      if (data.rememberMe) {
        localStorage.setItem('savedHostLogin', JSON.stringify({ email: data.email, password: data.password }))
      } else {
        localStorage.removeItem('savedHostLogin')
      }
      const res = await api.post('/auth/login', { email: data.email, password: data.password })
      if (res.data.user.role !== 'HOST') {
        toast({ title: 'Access denied', description: 'This account is not registered as a Host', variant: 'destructive' })
        return
      }
      setAuth(res.data.user, res.data.token, res.data.refreshToken)
      router.push('/dashboard?tab=spots')
    } catch (e: any) {
      toast({ title: 'Login failed', description: e.response?.data?.error || 'Invalid credentials', variant: 'destructive' })
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex bg-[#f4f6fb]">
      {/* Left panel - perks */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#031c47] flex-col items-center justify-center p-12 text-white">
        <div className="bg-amber-400 rounded-2xl p-4 mb-6">
          <Building2 className="h-12 w-12 text-[#031c47]" />
        </div>
        <h2 className="text-3xl font-bold mb-3">Host with Backspace</h2>
        <p className="text-blue-200 text-center max-w-xs mb-10">
          Turn your unused parking space into a steady income stream.
        </p>
        <div className="space-y-4 w-full max-w-xs">
          {[
            ['💰', 'Earn Passive Income', 'Make money from your empty parking spot 24/7'],
            ['📊', 'Dashboard & Analytics', 'Track bookings, earnings, and occupancy in real-time'],
            ['🔒', 'Secure Payments', 'Get paid directly to your account, every week'],
            ['⚡', 'Easy Setup', 'List your spot in under 2 minutes, start earning today'],
            ['🛡️', 'Insurance Coverage', 'Your property is protected against damages'],
          ].map(([icon, title, desc]) => (
            <div key={title as string} className="flex items-start gap-3 bg-white/10 rounded-xl p-3">
              <span className="text-xl">{icon}</span>
              <div>
                <div className="font-semibold text-sm">{title}</div>
                <div className="text-xs text-blue-200">{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="bg-amber-400 rounded-xl p-2">
            <Building2 className="h-6 w-6 text-[#031c47]" />
          </div>
          <span className="text-xl font-bold text-[#031c47]">Backspace <span className="text-amber-600 text-sm font-medium">Host</span></span>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Host Sign in</h1>
          <p className="text-gray-500 text-sm mb-7">Manage your parking spots and earnings.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input type="email" placeholder="you@example.com" className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/10 transition placeholder:text-gray-400" {...register('email')} />
              </div>
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message as string}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input type={showPassword ? 'text' : 'password'} placeholder="••••••••" className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/10 transition placeholder:text-gray-400" {...register('password')} />
                <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" {...register('rememberMe')} className="h-4 w-4 rounded border-gray-300 text-amber-400 focus:ring-amber-400" />
              <span className="text-sm text-gray-600">Remember me</span>
            </label>
            <button type="submit" disabled={loading} className="w-full bg-amber-400 hover:bg-amber-500 text-[#031c47] font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-60">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Sign In as Host
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Not a host?{' '}
            <Link href="/login" className="text-[#031c47] font-semibold hover:underline">Customer login</Link>
          </p>
          <p className="text-center text-sm text-gray-500 mt-2">
            <Link href="/register/host" className="text-amber-600 font-medium hover:underline">Register as Host</Link>
          </p>
        </div>
      </div>
      </div>
    </div>
  )
}
