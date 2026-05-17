'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Car, Loader2, Mail, Lock, User, Phone, MapPin, Building2 } from 'lucide-react'
import { toast } from '@/components/ui/toaster'
import { useAuthStore } from '@/lib/auth-store'
import api from '@/lib/api'

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter valid 10-digit mobile number'),
  password: z.string().min(8, 'Minimum 8 characters'),
  role: z.enum(['USER', 'HOST']),
})

export default function RegisterPage() {
  const router = useRouter()
  const { setAuth } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'USER' },
  })
  const role = watch('role')

  const onSubmit = async (data: any) => {
    setLoading(true)
    try {
      const res = await api.post('/auth/register', data)
      setAuth(res.data.user, res.data.token, res.data.refreshToken)
      router.push('/')
    } catch (e: any) {
      toast({ title: 'Registration failed', description: e.response?.data?.error || 'Something went wrong', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-[#f4f6fb]">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#031c47] flex-col items-center justify-center p-12 text-white">
        <img src="/logo.png" alt="Backspace" className="h-20 w-auto object-contain mb-6" />
        <h2 className="text-3xl font-bold mb-3">Join backspace</h2>
        <p className="text-blue-200 text-center max-w-xs">
          Book parking spots or list your own space and start earning today.
        </p>
        <div className="mt-10 space-y-4 w-full max-w-xs">
          {[
            ['🚗', 'For Customers', 'Book parking at malls, offices, and residential areas'],
            ['📍', 'For Hosts', 'Monetise your unused parking space effortlessly'],
            ['⚡', 'Real-time Availability', 'Live slot tracking across your city'],
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
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 justify-center mb-8">
            <div className="bg-[#031c47] rounded-xl p-2">
              <Car className="h-6 w-6 text-amber-400" />
            </div>
            <span className="text-xl font-bold text-[#031c47]">backspace</span>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Create account</h1>
            <p className="text-gray-500 text-sm mb-7">Fill in your details to get started.</p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Role selector */}
              <div className="grid grid-cols-2 gap-3 mb-2">
                {(['USER', 'HOST'] as const).map(r => (
                  <button
                    key={r} type="button"
                    onClick={() => setValue('role', r)}
                    className={`flex items-center gap-2 border-2 rounded-xl p-3 text-sm font-medium transition-all ${
                      role === r
                        ? 'border-[#031c47] bg-[#031c47] text-white'
                        : 'border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {r === 'USER' ? <User className="h-4 w-4" /> : <Building2 className="h-4 w-4" />}
                    {r === 'USER' ? 'Customer' : 'Host'}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    placeholder="Rahul Sharma"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#031c47] focus:ring-2 focus:ring-[#031c47]/10 transition"
                    {...register('name')}
                  />
                </div>
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message as string}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="email" placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#031c47] focus:ring-2 focus:ring-[#031c47]/10 transition"
                    {...register('email')}
                  />
                </div>
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message as string}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Mobile</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="tel" placeholder="9876543210"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#031c47] focus:ring-2 focus:ring-[#031c47]/10 transition"
                    {...register('phone')}
                  />
                </div>
                {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message as string}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="password" placeholder="Min 8 characters"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#031c47] focus:ring-2 focus:ring-[#031c47]/10 transition"
                    {...register('password')}
                  />
                </div>
                {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message as string}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#031c47] hover:bg-[#243d7a] text-white font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-60 mt-2"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Create Account
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              Already have an account?{' '}
              <Link href="/login" className="text-[#031c47] font-semibold hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
