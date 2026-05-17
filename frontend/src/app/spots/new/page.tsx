'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { useAuthStore } from '@/lib/auth-store'
import { toast } from '@/components/ui/toaster'
import api from '@/lib/api'
import { Loader2 } from 'lucide-react'

export default function NewSpotPage() {
  const { user } = useAuthStore()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: '', address: '', latitude: '', longitude: '',
    width: '2.5', length: '5.0', height: '',
    pricePerHour: '', pricePerDay: '',
    isEvCharging: false, evChargerType: '',
    amenities: [] as string[], description: '',
  })

  const amenityOptions = ['covered', 'cctv', 'security', '24/7', 'valet', 'wheelchair']

  const toggleAmenity = (a: string) => {
    setForm(f => ({
      ...f,
      amenities: f.amenities.includes(a) ? f.amenities.filter(x => x !== a) : [...f.amenities, a],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/spots', {
        ...form,
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
        width: parseFloat(form.width),
        length: parseFloat(form.length),
        height: form.height ? parseFloat(form.height) : undefined,
        pricePerHour: parseFloat(form.pricePerHour),
        pricePerDay: form.pricePerDay ? parseFloat(form.pricePerDay) : undefined,
      })
      toast({ title: 'Spot listed successfully!' })
      router.push('/dashboard')
    } catch (e: any) {
      toast({ title: 'Failed to list spot', description: e.response?.data?.error || 'Something went wrong', variant: 'destructive' })
    } finally { setLoading(false) }
  }

  if (!user || user.role !== 'HOST') {
    return (
      <div className="min-h-screen bg-[#f4f6fb]">
        <Navbar />
        <div className="max-w-xl mx-auto px-4 py-16 text-center">
          <p className="text-gray-500">Only hosts can list parking spots.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f4f6fb]">
      <Navbar />
      <div className="bg-[#031c47] text-white">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold">Add a Parking Spot</h1>
          <p className="text-blue-200 text-sm mt-1">Add your space and start earning</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Basic Details</h2>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Spot Title</label>
            <input className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#031c47]" placeholder="e.g. Phoenix Mall Parking" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Address</label>
            <input className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#031c47]" placeholder="Full address" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} required />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Description</label>
            <textarea className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#031c47]" rows={3} placeholder="Entry instructions, landmarks nearby..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Latitude</label>
              <input type="number" step="any" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#031c47]" placeholder="12.9716" value={form.latitude} onChange={e => setForm(f => ({ ...f, latitude: e.target.value }))} required />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Longitude</label>
              <input type="number" step="any" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#031c47]" placeholder="77.5946" value={form.longitude} onChange={e => setForm(f => ({ ...f, longitude: e.target.value }))} required />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Dimensions & Pricing</h2>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Width (m)</label>
              <input type="number" step="0.1" min="1.5" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#031c47]" value={form.width} onChange={e => setForm(f => ({ ...f, width: e.target.value }))} required />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Length (m)</label>
              <input type="number" step="0.1" min="3" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#031c47]" value={form.length} onChange={e => setForm(f => ({ ...f, length: e.target.value }))} required />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Height (m)</label>
              <input type="number" step="0.1" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#031c47]" placeholder="Optional" value={form.height} onChange={e => setForm(f => ({ ...f, height: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Price per Hour (₹)</label>
              <input type="number" min="0" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#031c47]" placeholder="40" value={form.pricePerHour} onChange={e => setForm(f => ({ ...f, pricePerHour: e.target.value }))} required />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Price per Day (₹)</label>
              <input type="number" min="0" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#031c47]" placeholder="Optional" value={form.pricePerDay} onChange={e => setForm(f => ({ ...f, pricePerDay: e.target.value }))} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Amenities</h2>
          <div className="flex flex-wrap gap-2">
            {amenityOptions.map(a => (
              <button key={a} type="button" onClick={() => toggleAmenity(a)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${form.amenities.includes(a) ? 'bg-[#031c47] text-white border-[#031c47]' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}`}
              >{a}</button>
            ))}
          </div>
          <div className="flex items-center gap-3 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isEvCharging} onChange={e => setForm(f => ({ ...f, isEvCharging: e.target.checked }))} className="rounded" />
              <span className="text-sm text-gray-700">EV Charging Available</span>
            </label>
          </div>
          {form.isEvCharging && (
            <input className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#031c47]" placeholder="Charger type (e.g. Type2, CCS, CHAdeMO)" value={form.evChargerType} onChange={e => setForm(f => ({ ...f, evChargerType: e.target.value }))} />
          )}
        </div>

        <button type="submit" disabled={loading}
          className="w-full bg-[#031c47] hover:bg-[#0a2a5c] text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-60">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />} Add Spot
        </button>
      </form>
    </div>
  )
}
