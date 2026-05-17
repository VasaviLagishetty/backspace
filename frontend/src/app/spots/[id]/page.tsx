'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { MapPin, Zap, Star, Car, Clock, Shield, Heart, AlertTriangle, Loader2, ChevronLeft } from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { toast } from '@/components/ui/toaster'
import { useAuthStore } from '@/lib/auth-store'
import api from '@/lib/api'
import Link from 'next/link'

declare global { interface Window { Razorpay: any } }

export default function SpotDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { user } = useAuthStore()
  const [spot, setSpot] = useState<any>(null)
  const [vehicles, setVehicles] = useState<any[]>([])
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [booking, setBooking] = useState({ vehicleId: '', startTime: '', endTime: '' })
  const [loading, setLoading] = useState(false)
  const [bookingLoading, setBookingLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      api.get(`/spots/${id}`),
      user ? api.get('/vehicles') : Promise.resolve({ data: [] }),
      user ? api.get('/favorites') : Promise.resolve({ data: [] }),
    ]).then(([spotRes, vehiclesRes, favsRes]) => {
      setSpot(spotRes.data)
      setVehicles(vehiclesRes.data)
      setFavorites(new Set(favsRes.data.map((f: any) => f.spotId)))
    }).finally(() => setLoading(false))
  }, [id, user])

  const toggleFavorite = async () => {
    if (!user) return router.push('/login')
    if (favorites.has(id)) {
      await api.delete(`/favorites/${id}`)
      setFavorites(f => { const s = new Set(f); s.delete(id); return s })
    } else {
      await api.post(`/favorites/${id}`)
      setFavorites(f => new Set([...f, id]))
    }
  }

  const loadRazorpay = () => new Promise<void>(resolve => {
    if (window.Razorpay) return resolve()
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve()
    document.body.appendChild(script)
  })

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return router.push('/login')
    if (!booking.vehicleId || !booking.startTime || !booking.endTime)
      return toast({ title: 'Fill all fields', variant: 'destructive' })

    setBookingLoading(true)
    try {
      const { data: bookingData } = await api.post('/bookings', {
        spotId: id, vehicleId: booking.vehicleId,
        startTime: booking.startTime, endTime: booking.endTime,
      })
      const { data: orderData } = await api.post('/payments/create-order', { bookingId: bookingData.id })
      await loadRazorpay()
      const rzp = new window.Razorpay({
        key: orderData.key, amount: orderData.amount, currency: orderData.currency,
        order_id: orderData.orderId, name: 'backspace',
        description: `Parking at ${spot.title}`,
        prefill: { name: user.name, email: user.email },
        theme: { color: '#031c47' },
        handler: async (response: any) => {
          await api.post('/payments/verify', {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            bookingId: bookingData.id,
          })
          toast({ title: 'Booking Confirmed! 🎉', description: `Code: ${bookingData.confirmationCode}` })
          router.push('/dashboard')
        },
        modal: { ondismiss: () => toast({ title: 'Payment cancelled', variant: 'destructive' }) },
      })
      rzp.open()
    } catch (e: any) {
      toast({ title: 'Booking failed', description: e.response?.data?.error || 'Something went wrong', variant: 'destructive' })
    } finally {
      setBookingLoading(false)
    }
  }

  const hours = booking.startTime && booking.endTime
    ? Math.max(0, (new Date(booking.endTime).getTime() - new Date(booking.startTime).getTime()) / 3600000)
    : 0
  const total = spot ? (hours * spot.pricePerHour).toFixed(2) : '0'

  if (loading) return (
    <div className="min-h-screen bg-[#f4f6fb]">
      <Navbar />
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-[#031c47]" />
      </div>
    </div>
  )
  if (!spot) return (
    <div className="min-h-screen bg-[#f4f6fb]">
      <Navbar />
      <div className="flex items-center justify-center py-32 text-gray-400">Spot not found</div>
    </div>
  )

  const avg = spot.ratingCount > 0 ? (spot.totalRating / spot.ratingCount).toFixed(1) : null

  return (
    <div className="min-h-screen bg-[#f4f6fb]">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Back */}
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#031c47] mb-5 transition-colors">
          <ChevronLeft className="h-4 w-4" /> Back to search
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left */}
          <div className="lg:col-span-2 space-y-5">
            {/* Image */}
            <div className="relative h-72 rounded-2xl overflow-hidden bg-gray-200 shadow-sm">
              {spot.images[0] ? (
                <Image src={spot.images[0]} alt={spot.title} fill className="object-cover" />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-300">
                  <Car className="h-16 w-16" />
                </div>
              )}
              <button
                onClick={toggleFavorite}
                className="absolute top-4 right-4 bg-white rounded-full p-2.5 shadow-md hover:scale-110 transition-transform"
              >
                <Heart className={`h-5 w-5 ${favorites.has(id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
              </button>
              {spot.isEvCharging && (
                <span className="absolute top-4 left-4 bg-emerald-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5" /> EV Charging
                </span>
              )}
            </div>

            {/* Info card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{spot.title}</h1>
                  <p className="text-gray-500 flex items-center gap-1.5 mt-1.5">
                    <MapPin className="h-4 w-4 shrink-0" /> {spot.address}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-2xl font-bold text-[#031c47]">₹{spot.pricePerHour}<span className="text-sm font-normal text-gray-400">/hr</span></p>
                  {spot.pricePerDay && <p className="text-sm text-gray-400">₹{spot.pricePerDay}/day</p>}
                </div>
              </div>

              {avg && (
                <div className="flex items-center gap-1.5 mt-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < Math.round(Number(avg)) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                  ))}
                  <span className="text-sm font-medium text-gray-700 ml-1">{avg}</span>
                  <span className="text-sm text-gray-400">({spot.ratingCount} reviews)</span>
                </div>
              )}

              <div className="flex flex-wrap gap-2 mt-4">
                <span className="flex items-center gap-1.5 text-sm bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full font-medium">
                  <Car className="h-3.5 w-3.5" /> {spot.width}m × {spot.length}m
                </span>
                {spot.isEvCharging && (
                  <span className="flex items-center gap-1.5 text-sm bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full font-medium">
                    <Zap className="h-3.5 w-3.5" /> {spot.evChargerType || 'EV Charging'}
                  </span>
                )}
                {spot.amenities?.map((a: string) => (
                  <span key={a} className="text-sm bg-gray-50 text-gray-600 px-3 py-1.5 rounded-full capitalize border border-gray-100">{a}</span>
                ))}
              </div>

              {spot.description && (
                <p className="mt-4 text-gray-600 text-sm leading-relaxed">{spot.description}</p>
              )}

              <div className="mt-4 p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5">
                <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                <p className="text-sm text-amber-800">Late checkout penalty: 50% of hourly rate per hour. Please vacate on time.</p>
              </div>
            </div>

            {/* Host */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-[#031c47]/10 flex items-center justify-center text-[#031c47] font-bold text-lg shrink-0">
                {spot.host.name[0]}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{spot.host.name}</p>
                <p className="text-sm text-gray-500">Host since {new Date(spot.host.createdAt).getFullYear()}</p>
              </div>
              {avg && (
                <div className="ml-auto flex items-center gap-1.5 text-amber-500">
                  <Star className="h-4 w-4 fill-amber-400" />
                  <span className="font-semibold">{avg}</span>
                  <span className="text-gray-400 text-sm">({spot.ratingCount})</span>
                </div>
              )}
            </div>

            {/* Reviews */}
            {spot.reviews?.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Reviews</h2>
                <div className="space-y-4">
                  {spot.reviews.map((r: any) => (
                    <div key={r.id} className="border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="font-medium text-sm text-gray-800">{r.author.name}</span>
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`h-3.5 w-3.5 ${i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                          ))}
                        </div>
                      </div>
                      {r.comment && <p className="text-sm text-gray-500">{r.comment}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Booking */}
          <div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-5">Book This Spot</h2>
              <form onSubmit={handleBook} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Your Vehicle</label>
                  {vehicles.length === 0 ? (
                    <div className="text-sm text-gray-500 p-3 border border-dashed border-gray-200 rounded-xl text-center">
                      <button type="button" onClick={() => router.push('/dashboard?tab=vehicles')}
                        className="text-[#031c47] font-medium hover:underline">
                        Add a vehicle first →
                      </button>
                    </div>
                  ) : (
                    <select
                      className="w-full h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-[#031c47]"
                      value={booking.vehicleId}
                      onChange={e => setBooking(b => ({ ...b, vehicleId: e.target.value }))}
                    >
                      <option value="">Select vehicle</option>
                      {vehicles.map((v: any) => (
                        <option key={v.id} value={v.id}>
                          {v.make} {v.model} ({v.licensePlate})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Start Time</label>
                  <input
                    type="datetime-local"
                    className="w-full h-10 rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#031c47]"
                    value={booking.startTime}
                    onChange={e => setBooking(b => ({ ...b, startTime: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">End Time</label>
                  <input
                    type="datetime-local"
                    className="w-full h-10 rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#031c47]"
                    value={booking.endTime}
                    onChange={e => setBooking(b => ({ ...b, endTime: e.target.value }))}
                  />
                </div>

                {hours > 0 && (
                  <div className="bg-[#f4f6fb] rounded-xl p-4 space-y-2 text-sm">
                    <div className="flex justify-between text-gray-600">
                      <span>Duration</span><span>{hours.toFixed(1)} hrs</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Rate</span><span>₹{spot.pricePerHour}/hr</span>
                    </div>
                    <div className="flex justify-between font-bold text-gray-900 border-t border-gray-200 pt-2 mt-1">
                      <span>Total</span><span>₹{total}</span>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={bookingLoading || vehicles.length === 0}
                  className="w-full bg-[#031c47] hover:bg-[#243d7a] text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  {bookingLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Book & Pay
                </button>

                <p className="text-xs text-center text-gray-400 flex items-center justify-center gap-1">
                  <Shield className="h-3 w-3" /> Secured by Razorpay
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
