'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, Mail, Phone, Car, Save, Loader2 } from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { useAuthStore } from '@/lib/auth-store'
import { toast } from '@/components/ui/toaster'
import api from '@/lib/api'

export default function ProfilePage() {
  const { user, setAuth } = useAuthStore()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '' })
  const [vehicles, setVehicles] = useState<any[]>([])

  useEffect(() => { if (!user) router.push('/login') }, [user])

  useEffect(() => {
    if (!user) return
    setForm({ name: user.name || '', phone: '' })
    api.get('/auth/me').then(({ data }) => setForm({ name: data.name, phone: data.phone || '' }))
    api.get('/vehicles').then(({ data }) => setVehicles(data))
  }, [user])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await api.patch('/auth/me', form)
      setAuth({ ...user!, name: data.name }, localStorage.getItem('token')!, localStorage.getItem('refreshToken')!)
      toast({ title: 'Profile updated' })
    } catch {
      toast({ title: 'Update failed', variant: 'destructive' })
    } finally { setLoading(false) }
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-[#f4f6fb]">
      <Navbar />

      <div className="bg-[#031c47] text-white">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold">Profile</h1>
          <p className="text-blue-200 text-sm mt-1">Manage your account details</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Profile Form */}
        <form onSubmit={handleSave} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
              <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 rounded-xl text-gray-600 text-sm">
                <Mail className="h-4 w-4 text-gray-400" /> {user.email}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Name</label>
              <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5">
                <User className="h-4 w-4 text-gray-400" />
                <input
                  className="flex-1 text-sm text-gray-900 outline-none bg-transparent"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Phone</label>
              <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5">
                <Phone className="h-4 w-4 text-gray-400" />
                <input
                  className="flex-1 text-sm text-gray-900 outline-none bg-transparent"
                  placeholder="10-digit mobile number"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <span className="text-xs font-medium text-gray-500">Role:</span>
              <span className="text-xs font-semibold bg-[#031c47] text-white px-3 py-1 rounded-full">{user.role === 'HOST' ? 'Host' : 'Customer'}</span>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-6 flex items-center gap-2 bg-[#031c47] hover:bg-[#0a2a5c] text-white font-semibold px-6 py-2.5 rounded-xl transition-colors"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Changes
          </button>
        </form>

        {/* Vehicles */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">My Vehicles</h2>
          {vehicles.length === 0 ? (
            <p className="text-sm text-gray-500">No vehicles registered. Add one from the Dashboard.</p>
          ) : (
            <div className="space-y-3">
              {vehicles.map((v: any) => (
                <div key={v.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Car className="h-5 w-5 text-[#031c47]" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{v.make} {v.model} ({v.year})</p>
                    <p className="text-xs text-gray-500">{v.licensePlate} · {v.type} · {v.width}m × {v.length}m</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
