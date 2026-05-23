'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, MapPin, Zap, Filter, Star, Car, List, Map, Plus, Clock } from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SpotMap } from '@/components/map/spot-map'
import api from '@/lib/api'
import Image from 'next/image'
import Link from 'next/link'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

interface Spot {
  id: string; title: string; address: string; pricePerHour: number
  isEvCharging: boolean; totalRating: number; ratingCount: number
  images: string[]; distance?: number; width: number; length: number
  latitude: number; longitude: number
}

export default function HomePage() {
  const [spots, setSpots] = useState<Spot[]>([])
  const [loading, setLoading] = useState(false)
  const [view, setView] = useState<'list' | 'map'>('list')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedSlots, setSelectedSlots] = useState<number[]>([])
  const [customHours, setCustomHours] = useState('')
  const [customMinutes, setCustomMinutes] = useState('')
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [filters, setFilters] = useState({
    query: '', isEv: false, minPrice: '', maxPrice: '',
    startTime: '', endTime: '', lat: '', lng: '', amenities: '',
  })
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [suggestions, setSuggestions] = useState<{ display_name: string; lat: string; lon: string }[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      pos => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setUserLocation(loc)
        setFilters(f => ({ ...f, lat: String(loc.lat), lng: String(loc.lng) }))
        fetchSpots({ lat: String(loc.lat), lng: String(loc.lng) })
      },
      () => fetchSpots({})
    )
  }, [])

  const fetchSpots = useCallback(async (extra: Record<string, string> = {}) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ ...filters, isEv: String(filters.isEv), ...extra })
      const { data } = await api.get(`/spots/search?${params}`)
      setSpots(data.spots)
    } catch {} finally { setLoading(false) }
  }, [filters])

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.length < 3) { setSuggestions([]); return }
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5`,
        { headers: { 'Accept-Language': 'en' } }
      )
      setSuggestions(await res.json())
      setShowSuggestions(true)
    } catch {}
  }, [])

  const pickSuggestion = (s: { display_name: string; lat: string; lon: string }) => {
    setFilters(f => ({ ...f, query: s.display_name.split(',')[0], lat: s.lat, lng: s.lon }))
    setSuggestions([])
    setShowSuggestions(false)
    fetchSpots({ lat: s.lat, lng: s.lon })
  }


  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (filters.query.trim() && !filters.lat) {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(filters.query)}&format=json&limit=1`,
          { headers: { 'Accept-Language': 'en' } }
        )
        const results = await res.json()
        if (results[0]) {
          const lat = results[0].lat, lng = results[0].lon
          setFilters(f => ({ ...f, lat, lng }))
          fetchSpots({ lat, lng })
          return
        }
      } catch {}
    }
    fetchSpots()
  }

  return (
    <div className="min-h-screen bg-[#f4f6fb]">
      <Navbar />

      {/* Hero */}
      <div className="bg-[#031c47] text-white">
        <div className="max-w-5xl mx-auto px-4 py-16 text-center">
          <div className="inline-flex items-center gap-2 bg-amber-400/20 text-amber-300 text-sm font-medium px-4 py-1.5 rounded-full mb-5">
            <Zap className="h-3.5 w-3.5" /> Real-time availability · Secure payments · Instant booking
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight">
            Find Parking<br />
            <span className="text-amber-400">Near You</span>
          </h1>
          <p className="text-blue-200 text-lg mb-10 max-w-xl mx-auto">
            Book verified parking spots near malls, theatres & landmarks. Pay securely, park stress-free.
          </p>
          {/* Time Slot Selector */}
          <div className="max-w-3xl mx-auto mb-4">
            <div className="bg-white/10 backdrop-blur rounded-2xl px-4 py-3 flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 text-blue-200 text-sm font-medium mr-1">
                <Clock className="h-4 w-4 text-amber-400" />
                <span>Quick Select:</span>
              </div>
              {[15, 30, 45, 60].map(min => (
                <button
                  key={min}
                  type="button"
                  onClick={() => {
                    const newSlots = selectedSlots.includes(min) ? selectedSlots.filter(m => m !== min) : [...selectedSlots, min]
                    setSelectedSlots(newSlots)
                    setShowCustomInput(false)
                    setCustomHours('')
                    setCustomMinutes('')
                    if (filters.startTime) {
                      const totalMin = newSlots.reduce((a, b) => a + b, 0)
                      if (totalMin > 0) {
                        const end = new Date(new Date(filters.startTime).getTime() + totalMin * 60000)
                        setFilters(f => ({ ...f, endTime: end.toISOString() }))
                      }
                    }
                  }}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all border ${
                    selectedSlots.includes(min)
                      ? 'bg-amber-400 text-[#031c47] border-amber-400 shadow-md scale-105'
                      : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                  }`}
                >
                  {min < 60 ? `${min} min` : '1 hr'}
                </button>
              ))}
              {/* Custom duration button */}
              <button
                type="button"
                onClick={() => {
                  setShowCustomInput(v => !v)
                }}
                className={`flex items-center gap-1 px-4 py-1.5 rounded-full text-sm font-semibold transition-all border ${
                  showCustomInput
                    ? 'bg-amber-400 text-[#031c47] border-amber-400 shadow-md'
                    : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                }`}
              >
                <Plus className="h-3.5 w-3.5" /> Add
              </button>
              {showCustomInput && (
                <div className="flex items-center gap-2 ml-1">
                  <input
                    type="number"
                    min={0}
                    placeholder="hrs"
                    value={customHours}
                    onChange={e => setCustomHours(e.target.value)}
                    className="w-16 text-sm rounded-full px-3 py-1.5 bg-white text-gray-800 outline-none border border-amber-400 focus:ring-2 focus:ring-amber-300"
                  />
                  <input
                    type="number"
                    min={0}
                    max={59}
                    placeholder="mins"
                    value={customMinutes}
                    onChange={e => setCustomMinutes(e.target.value)}
                    className="w-16 text-sm rounded-full px-3 py-1.5 bg-white text-gray-800 outline-none border border-amber-400 focus:ring-2 focus:ring-amber-300"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const h = parseInt(customHours) || 0
                      const m = parseInt(customMinutes) || 0
                      const total = h * 60 + m
                      if (total > 0) {
                        const newSlots = [...selectedSlots, total]
                        setSelectedSlots(newSlots)
                        setShowCustomInput(false)
                        setCustomHours('')
                        setCustomMinutes('')
                        if (filters.startTime) {
                          const totalMin = newSlots.reduce((a, b) => a + b, 0)
                          const end = new Date(new Date(filters.startTime).getTime() + totalMin * 60000)
                          setFilters(f => ({ ...f, endTime: end.toISOString() }))
                        }
                      }
                    }}
                    className="px-3 py-1.5 rounded-full bg-amber-400 text-[#031c47] text-sm font-semibold hover:bg-amber-300 transition-all"
                  >
                    Set
                  </button>
                </div>
              )}
              {selectedSlots.filter(s => ![15, 30, 45, 60].includes(s)).map((s, i) => (
                <button
                  key={`custom-${i}`}
                  type="button"
                  onClick={() => setSelectedSlots(prev => { const idx = prev.indexOf(s); return idx > -1 ? [...prev.slice(0, idx), ...prev.slice(idx + 1)] : prev })}
                  className="px-4 py-1.5 rounded-full text-sm font-semibold transition-all border bg-amber-400 text-[#031c47] border-amber-400 shadow-md scale-105"
                >
                  {s >= 60 ? `${Math.floor(s / 60)}h${s % 60 ? ` ${s % 60}m` : ''}` : `${s} min`} ✕
                </button>
              ))}
              {selectedSlots.length > 0 && (
                <span className="ml-auto text-xs text-amber-300 font-medium">
                  {(() => { const t = selectedSlots.reduce((a, b) => a + b, 0); return t >= 60 ? `${Math.floor(t / 60)}h${t % 60 ? ` ${t % 60}m` : ''}` : `${t} min` })() } selected
                </span>
              )}
            </div>
          </div>

          {/* Search box */}
          <form onSubmit={handleSearch} className="bg-white rounded-2xl p-3 shadow-2xl max-w-3xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1 flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 relative">
                <MapPin className="h-4 w-4 text-gray-400 shrink-0" />
                <input
                  placeholder="Area, mall, landmark..."
                  className="flex-1 text-sm text-gray-800 outline-none placeholder:text-gray-400 bg-transparent"
                  value={filters.query}
                  onChange={e => { setFilters(f => ({ ...f, query: e.target.value })); fetchSuggestions(e.target.value) }}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  autoComplete="off"
                />
                {showSuggestions && suggestions.length > 0 && (
                  <ul className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                    {suggestions.map((s, i) => (
                      <li
                        key={i}
                        className="px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer flex items-center gap-2"
                        onMouseDown={() => pickSuggestion(s)}
                      >
                        <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                        {s.display_name.split(',').slice(0, 2).join(',')}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <DatePicker
                selected={filters.startTime ? new Date(filters.startTime) : null}
                onChange={(date: Date | null) => {
                  const iso = date ? date.toISOString() : ''
                  const totalMin = selectedSlots.reduce((a, b) => a + b, 0)
                  if (date && totalMin > 0) {
                    const end = new Date(date.getTime() + totalMin * 60000)
                    setFilters(f => ({ ...f, startTime: iso, endTime: end.toISOString() }))
                  } else {
                    setFilters(f => ({ ...f, startTime: iso }))
                  }
                }}
                showTimeSelect
                dateFormat="dd MMM, h:mm aa"
                placeholderText="Start date & time"
                className="w-40 text-sm border border-gray-200 rounded-xl px-3 py-2 text-gray-700 outline-none focus:border-[#031c47] bg-white"
                minDate={new Date()}
              />
              <DatePicker
                selected={filters.endTime ? new Date(filters.endTime) : null}
                onChange={(date: Date | null) => {
                  const iso = date ? date.toISOString() : ''
                  setFilters(f => ({ ...f, endTime: iso }))
                  if (date && filters.startTime) {
                    const diffMin = Math.round((date.getTime() - new Date(filters.startTime).getTime()) / 60000)
                    if (diffMin > 0) setSelectedSlots([diffMin])
                  }
                }}
                showTimeSelect
                dateFormat="dd MMM, h:mm aa"
                placeholderText="End date & time"
                className="w-40 text-sm border border-gray-200 rounded-xl px-3 py-2 text-gray-700 outline-none focus:border-[#031c47] bg-white"
                minDate={filters.startTime ? new Date(filters.startTime) : new Date()}
              />
              <button
                type="submit"
                className="bg-[#031c47] hover:bg-[#0a2a5c] text-white font-semibold px-6 py-2 rounded-xl flex items-center gap-2 transition-colors"
              >
                <Search className="h-4 w-4" /> Search
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Stats strip */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-4 flex flex-wrap justify-center gap-8 text-center text-sm">
          {[['650+', 'Parking Spots'], ['50K+', 'Happy Drivers'], ['4.8★', 'Avg Rating'], ['24/7', 'Support']].map(([val, label]) => (
            <div key={label}>
              <div className="font-bold text-[#031c47] text-lg">{val}</div>
              <div className="text-gray-500">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters + view toggle */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex flex-wrap gap-2 items-center">
          <button
            onClick={() => setShowFilters(f => !f)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border transition-all ${showFilters ? 'bg-[#031c47] text-white border-[#031c47]' : 'bg-white border-gray-200 text-gray-700 hover:border-[#031c47]'}`}
          >
            <Filter className="h-3.5 w-3.5" /> Filters
          </button>
          {showFilters && (
            <div className="w-full bg-white rounded-xl border border-gray-200 p-4 mt-2 space-y-4">
              <div>
                <p className="text-xs font-medium text-gray-600 mb-2">Vehicle / Spot Type</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'All', value: '' },
                    { label: '⛽ Petrol/Diesel', value: 'regular' },
                    { label: '⚡ EV Charging', value: 'ev' },
                    { label: '🏍️ Two Wheeler', value: 'twowheeler' },
                  ].map(opt => {
                    const types: string[] = (filters as any).spotTypes || []
                    const isAll = opt.value === ''
                    const isActive = isAll ? types.length === 0 : types.includes(opt.value)
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          if (isAll) {
                            setFilters(f => ({ ...f, spotTypes: [], isEv: false } as any))
                          } else {
                            const newTypes = types.includes(opt.value) ? types.filter((t: string) => t !== opt.value) : [...types, opt.value]
                            setFilters(f => ({ ...f, spotTypes: newTypes, isEv: newTypes.includes('ev') } as any))
                          }
                        }}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                          isActive
                            ? 'bg-[#031c47] text-white border-[#031c47]'
                            : 'bg-white border-gray-200 text-gray-700 hover:border-[#031c47]'
                        }`}
                      >
                        {opt.label}
                      </button>
                    )
                  })}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600 mb-2">Price Range (₹/hr)</p>
                <div className="flex items-center gap-2">
                  <input placeholder="Min" type="number" className="w-24 h-9 text-sm border border-gray-200 rounded-lg px-3 bg-white outline-none focus:border-[#031c47]" value={filters.minPrice} onChange={e => setFilters(f => ({ ...f, minPrice: e.target.value }))} />
                  <span className="text-gray-400">—</span>
                  <input placeholder="Max" type="number" className="w-24 h-9 text-sm border border-gray-200 rounded-lg px-3 bg-white outline-none focus:border-[#031c47]" value={filters.maxPrice} onChange={e => setFilters(f => ({ ...f, maxPrice: e.target.value }))} />
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => fetchSpots()} className="px-5 py-2 rounded-lg text-sm font-medium bg-[#031c47] text-white hover:bg-[#0a2a5c] transition-all">Apply Filters</button>
                <button onClick={() => { setFilters(f => ({ ...f, isEv: false, minPrice: '', maxPrice: '', spotTypes: [] } as any)); fetchSpots() }} className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all">Clear</button>
              </div>
            </div>
          )}

          <select
            className="h-9 px-3 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 outline-none focus:border-[#031c47]"
            value={(filters as any).sortBy || ''}
            onChange={e => setFilters(f => ({ ...f, sortBy: e.target.value } as any))}
          >
            <option value="">Sort by</option>
            <option value="relevance">Relevance</option>
            <option value="price">Price</option>
            <option value="rating">Rating</option>
            <option value="distance">Distance</option>
          </select>
          {(filters as any).sortBy && (filters as any).sortBy !== 'relevance' && (
            <button
              type="button"
              onClick={() => setFilters(f => ({ ...f, sortOrder: (f as any).sortOrder === 'desc' ? 'asc' : 'desc' } as any))}
              className="h-9 px-3 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 hover:border-[#031c47] transition-all"
            >
              {(filters as any).sortBy === 'distance'
                ? ((filters as any).sortOrder === 'desc' ? '↓ Far to Near' : '↑ Near to Far')
                : ((filters as any).sortOrder === 'desc' ? '↓ High to Low' : '↑ Low to High')}
            </button>
          )}

          <div className="ml-auto flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1">
          <button
            onClick={() => setView('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${view === 'list' ? 'bg-[#031c47] text-white' : 'text-gray-500 hover:text-gray-800'}`}
          >
            <List className="h-3.5 w-3.5" /> List
          </button>
          <button
            onClick={() => setView('map')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${view === 'map' ? 'bg-[#031c47] text-white' : 'text-gray-500 hover:text-gray-800'}`}
          >
            <Map className="h-3.5 w-3.5" /> Map
          </button>
        </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 pb-16">
        {view === 'map' ? (
          <SpotMap spots={spots} userLocation={userLocation} />
        ) : loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-72 bg-gray-200 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : spots.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <Car className="h-14 w-14 mx-auto mb-4 opacity-25" />
            <p className="text-lg font-medium text-gray-500">No spots found</p>
            <p className="text-sm mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">{spots.length} spot{spots.length !== 1 ? 's' : ''} found</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...spots].sort((a, b) => {
                const sort = (filters as any).sortBy
                const dir = (filters as any).sortOrder === 'desc' ? -1 : 1
                if (sort === 'relevance') {
                  const score = (s: Spot) => {
                    const rating = s.ratingCount > 0 ? (s.totalRating / s.ratingCount) / 5 : 0
                    const price = 1 - Math.min(s.pricePerHour, 200) / 200
                    const dist = 1 - Math.min(s.distance ?? 10, 10) / 10
                    return rating * 0.4 + price * 0.3 + dist * 0.3
                  }
                  return (score(b) - score(a)) * dir
                }
                if (sort === 'price') return (a.pricePerHour - b.pricePerHour) * dir
                if (sort === 'rating') return ((a.ratingCount > 0 ? a.totalRating / a.ratingCount : 0) - (b.ratingCount > 0 ? b.totalRating / b.ratingCount : 0)) * dir
                if (sort === 'distance') return ((a.distance ?? 999) - (b.distance ?? 999)) * dir
                return 0
              }).map(spot => <SpotCard key={spot.id} spot={spot} selectedSlots={selectedSlots} />)}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function SpotCard({ spot, selectedSlots }: { spot: Spot; selectedSlots: number[] }) {
  const avg = spot.ratingCount > 0 ? (spot.totalRating / spot.ratingCount).toFixed(1) : null
  const totalMin = selectedSlots.reduce((a, b) => a + b, 0)
  const now = new Date()
  const href = totalMin > 0
    ? `/spots/${spot.id}?startTime=${now.toISOString()}&duration=${totalMin}`
    : `/spots/${spot.id}`
  return (
    <Link href={href}>
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md border border-gray-100 transition-all group cursor-pointer">
        <div className="relative h-36 bg-gray-100">
          {spot.images[0] ? (
            <Image src={spot.images[0]} alt={spot.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <Image src={spot.isEvCharging ? '/ev.png' : '/parking.png'} alt={spot.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
          )}
          {spot.isEvCharging && (
            <span className="absolute top-3 left-3 bg-emerald-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
              <Zap className="h-3 w-3" /> EV
            </span>
          )}
          <span className="absolute top-3 right-3 bg-white/90 backdrop-blur text-[#031c47] text-sm font-bold px-2.5 py-1 rounded-full shadow-sm">
            ₹{spot.pricePerHour}/hr
          </span>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 truncate">{spot.title}</h3>
          <p className="text-sm text-gray-500 flex items-center gap-1 mt-1 truncate">
            <MapPin className="h-3.5 w-3.5 shrink-0" /> {spot.address}
          </p>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
            <span className="text-xs text-gray-400">{spot.width}m × {spot.length}m</span>
            <div className="flex items-center gap-1">
              {avg ? (
                <>
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-medium text-gray-700">{avg}</span>
                  <span className="text-xs text-gray-400">({spot.ratingCount})</span>
                </>
              ) : (
                <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">New</span>
              )}
            </div>
          </div>
          {spot.distance !== undefined && (
            <p className="text-xs text-gray-400 mt-1">{spot.distance.toFixed(1)} km away</p>
          )}
        </div>
      </div>
    </Link>
  )
}
