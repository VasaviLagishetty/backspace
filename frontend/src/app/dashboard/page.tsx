'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Car, MapPin, Clock, CheckCircle, Loader2, Plus, TrendingUp, Calendar, Zap } from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { toast } from '@/components/ui/toaster'
import { useAuthStore } from '@/lib/auth-store'
import api from '@/lib/api'
import Link from 'next/link'

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  CONFIRMED: 'bg-blue-50 text-blue-700 border-blue-200',
  ACTIVE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  COMPLETED: 'bg-gray-50 text-gray-600 border-gray-200',
  CANCELLED: 'bg-red-50 text-red-600 border-red-200',
  EXTENDED: 'bg-purple-50 text-purple-700 border-purple-200',
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [tab, setTab] = useState(searchParams.get('tab') || 'bookings')
  const [bookings, setBookings] = useState<any[]>([])
  const [vehicles, setVehicles] = useState<any[]>([])
  const [hostSpots, setHostSpots] = useState<any[]>([])
  const [hostBookings, setHostBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [extendModal, setExtendModal] = useState<{ bookingId: string; endTime: string } | null>(null)
  const [newVehicle, setNewVehicle] = useState({ make: '', model: '', year: '', type: 'PETROL', licensePlate: '', width: '', length: '' })

  useEffect(() => { if (!user) router.push('/login') }, [user])

  useEffect(() => {
    if (!user) return
    setLoading(true)
    const calls: Promise<any>[] = [api.get('/bookings'), api.get('/vehicles')]
    if (user.role === 'HOST') calls.push(api.get('/spots/host/mine'), api.get('/bookings/host/bookings'))
    Promise.all(calls).then(([b, v, s, hb]) => {
      setBookings(b.data.bookings || [])
      setVehicles(v.data)
      if (s) setHostSpots(s.data)
      if (hb) setHostBookings(hb.data)
    }).finally(() => setLoading(false))
  }, [user])

  const cancelBooking = async (id: string) => {
    await api.post(`/bookings/${id}/cancel`)
    setBookings(bs => bs.map(b => b.id === id ? { ...b, status: 'CANCELLED' } : b))
    toast({ title: 'Booking cancelled' })
  }

  const extendBooking = async () => {
    if (!extendModal) return
    try {
      await api.post(`/bookings/${extendModal.bookingId}/extend`, { newEndTime: extendModal.endTime })
      toast({ title: 'Booking extended!' })
      setExtendModal(null)
      const { data } = await api.get('/bookings')
      setBookings(data.bookings)
    } catch (e: any) {
      toast({ title: 'Cannot extend', description: e.response?.data?.error, variant: 'destructive' })
    }
  }

  const addVehicle = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { data } = await api.post('/vehicles', {
        ...newVehicle,
        year: parseInt(newVehicle.year),
        width: parseFloat(newVehicle.width),
        length: parseFloat(newVehicle.length),
      })
      setVehicles(v => [...v, data])
      setNewVehicle({ make: '', model: '', year: '', type: 'PETROL', licensePlate: '', width: '', length: '' })
      toast({ title: 'Vehicle added!' })
    } catch (e: any) {
      toast({ title: 'Error', description: e.response?.data?.errors?.[0]?.msg, variant: 'destructive' })
    }
  }

  const hostEarnings = hostBookings.filter(b => b.status === 'COMPLETED').reduce((s, b) => s + b.hostEarnings, 0)

  const tabs = [
    { id: 'bookings', label: 'My Bookings', icon: Calendar },
    { id: 'vehicles', label: 'Vehicles', icon: Car },
    ...(user?.role === 'HOST' ? [
      { id: 'spots', label: 'My Spots', icon: MapPin },
      { id: 'earnings', label: 'Earnings', icon: TrendingUp },
    ] : []),
  ]

  if (!user) return null

  return (
    <div className="min-h-screen bg-[#f4f6fb]">
      <Navbar />

      {/* Header */}
      <div className="bg-[#031c47] text-white">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-blue-200 text-sm mt-1">Welcome back, {user.name}</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100 mb-6 overflow-x-auto">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                tab === t.id
                  ? 'bg-[#031c47] text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-[#031c47]" />
          </div>
        ) : (
          <>
            {/* Bookings */}
            {tab === 'bookings' && (
              <div className="space-y-3">
                {bookings.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                    <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-200" />
                    <p className="font-medium text-gray-500">No bookings yet</p>
                    <Link href="/" className="text-[#031c47] text-sm font-medium hover:underline mt-1 inline-block">
                      Find a parking spot →
                    </Link>
                  </div>
                ) : bookings.map(b => (
                  <div key={b.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${STATUS_STYLES[b.status]}`}>
                            {b.status}
                          </span>
                          <span className="text-xs text-gray-400 font-mono bg-gray-50 px-2 py-0.5 rounded">{b.confirmationCode}</span>
                        </div>
                        <h3 className="font-semibold text-gray-900 truncate">{b.spot.title}</h3>
                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5 truncate">
                          <MapPin className="h-3.5 w-3.5 shrink-0" /> {b.spot.address}
                        </p>
                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                          <Clock className="h-3.5 w-3.5 shrink-0" />
                          {new Date(b.startTime).toLocaleString('en-IN')} → {new Date(b.endTime).toLocaleString('en-IN')}
                        </p>
                        <p className="text-sm font-semibold text-gray-800 mt-1.5">
                          ₹{b.totalAmount}
                          {b.latePenalty > 0 && <span className="text-red-500 font-normal ml-1">+₹{b.latePenalty} late fee</span>}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2 shrink-0">
                        {['CONFIRMED', 'ACTIVE', 'EXTENDED'].includes(b.status) && (
                          <button
                            onClick={() => setExtendModal({ bookingId: b.id, endTime: b.endTime })}
                            className="text-sm px-3 py-1.5 border border-[#031c47] text-[#031c47] rounded-lg hover:bg-[#031c47] hover:text-white transition-colors"
                          >
                            Extend
                          </button>
                        )}
                        {['PENDING', 'CONFIRMED'].includes(b.status) && (
                          <button
                            onClick={() => cancelBooking(b.id)}
                            className="text-sm px-3 py-1.5 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Vehicles */}
            {tab === 'vehicles' && (
              <div className="space-y-5">
                {vehicles.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {vehicles.map(v => (
                      <div key={v.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="h-11 w-11 rounded-xl bg-[#031c47]/10 flex items-center justify-center shrink-0">
                          {v.type === 'EV' ? <Zap className="h-5 w-5 text-emerald-600" /> : <Car className="h-5 w-5 text-[#031c47]" />}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{v.make} {v.model} ({v.year})</p>
                          <p className="text-sm text-gray-500">{v.licensePlate} · {v.type} · {v.width}m × {v.length}m</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Plus className="h-4 w-4" /> Add Vehicle
                  </h3>
                  <form onSubmit={addVehicle} className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Make', key: 'make', placeholder: 'Maruti' },
                      { label: 'Model', key: 'model', placeholder: 'Swift' },
                      { label: 'Year', key: 'year', placeholder: '2022', type: 'number' },
                      { label: 'License Plate', key: 'licensePlate', placeholder: 'KA01AB1234' },
                      { label: 'Width (m)', key: 'width', placeholder: '1.8', type: 'number', step: '0.1' },
                      { label: 'Length (m)', key: 'length', placeholder: '4.2', type: 'number', step: '0.1' },
                    ].map(f => (
                      <div key={f.key}>
                        <label className="block text-xs font-medium text-gray-600 mb-1">{f.label}</label>
                        <input
                          type={f.type || 'text'}
                          placeholder={f.placeholder}
                          className="w-full h-9 border border-gray-200 rounded-xl px-3 text-sm outline-none focus:border-[#031c47]"
                          value={(newVehicle as any)[f.key]}
                          onChange={e => setNewVehicle(v => ({ ...v, [f.key]: e.target.value }))}
                        />
                      </div>
                    ))}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
                      <select
                        className="w-full h-9 border border-gray-200 rounded-xl px-3 text-sm outline-none focus:border-[#031c47] bg-white"
                        value={newVehicle.type}
                        onChange={e => setNewVehicle(v => ({ ...v, type: e.target.value }))}
                      >
                        {['PETROL', 'DIESEL', 'EV', 'HYBRID'].map(t => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="col-span-2">
                      <button
                        type="submit"
                        className="w-full bg-[#031c47] hover:bg-[#243d7a] text-white font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors"
                      >
                        <Plus className="h-4 w-4" /> Add Vehicle
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Host Spots */}
            {tab === 'spots' && user.role === 'HOST' && (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <Link href="/spots/new">
                    <button className="bg-[#031c47] hover:bg-[#243d7a] text-white font-semibold px-4 py-2 rounded-xl flex items-center gap-2 text-sm transition-colors">
                      <Plus className="h-4 w-4" /> List New Spot
                    </button>
                  </Link>
                </div>
                {hostSpots.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                    <MapPin className="h-12 w-12 mx-auto mb-3 text-gray-200" />
                    <p className="text-gray-500">No spots listed yet</p>
                  </div>
                ) : hostSpots.map(s => (
                  <div key={s.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">{s.title}</h3>
                      <p className="text-sm text-gray-500 mt-0.5">{s.address} · ₹{s.pricePerHour}/hr · {s._count.bookings} bookings</p>
                      <span className={`inline-block text-xs px-2.5 py-0.5 rounded-full mt-2 font-medium ${s.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-50 text-gray-500'}`}>
                        {s.status}
                      </span>
                    </div>
                    <Link href={`/spots/${s.id}/edit`}>
                      <button className="text-sm px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg hover:border-[#031c47] hover:text-[#031c47] transition-colors shrink-0">
                        Edit
                      </button>
                    </Link>
                  </div>
                ))}
              </div>
            )}

            {/* Earnings */}
            {tab === 'earnings' && user.role === 'HOST' && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50', value: `₹${hostEarnings.toFixed(0)}`, label: 'Total Earnings' },
                    { icon: CheckCircle, color: 'text-blue-500', bg: 'bg-blue-50', value: hostBookings.filter(b => b.status === 'COMPLETED').length, label: 'Completed' },
                    { icon: MapPin, color: 'text-[#031c47]', bg: 'bg-[#031c47]/10', value: hostSpots.filter(s => s.status === 'ACTIVE').length, label: 'Active Spots' },
                  ].map(({ icon: Icon, color, bg, value, label }) => (
                    <div key={label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center">
                      <div className={`h-12 w-12 ${bg} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                        <Icon className={`h-6 w-6 ${color}`} />
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{value}</p>
                      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-4">Recent Bookings</h3>
                  {hostBookings.length === 0 ? (
                    <p className="text-gray-400 text-sm text-center py-6">No bookings yet</p>
                  ) : (
                    <div className="space-y-3">
                      {hostBookings.slice(0, 10).map(b => (
                        <div key={b.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                          <div>
                            <p className="font-medium text-sm text-gray-800">{b.user.name}</p>
                            <p className="text-xs text-gray-500">{b.spot.title} · {new Date(b.startTime).toLocaleDateString('en-IN')}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-sm text-emerald-600">₹{b.hostEarnings.toFixed(0)}</p>
                            <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_STYLES[b.status]}`}>{b.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Extend modal */}
      {extendModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="font-bold text-gray-900 mb-4">Extend Booking</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">New End Time</label>
              <input
                type="datetime-local"
                className="w-full h-10 border border-gray-200 rounded-xl px-3 text-sm outline-none focus:border-[#031c47]"
                value={extendModal.endTime}
                onChange={e => setExtendModal(m => m ? { ...m, endTime: e.target.value } : null)}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={extendBooking}
                className="flex-1 bg-[#031c47] hover:bg-[#243d7a] text-white font-semibold py-2.5 rounded-xl transition-colors"
              >
                Confirm
              </button>
              <button
                onClick={() => setExtendModal(null)}
                className="flex-1 border border-gray-200 text-gray-600 font-medium py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
