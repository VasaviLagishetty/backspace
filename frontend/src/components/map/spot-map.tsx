'use client'
import { useEffect, useRef, useState } from 'react'

interface Spot {
  id: string; title: string; latitude: number; longitude: number
  pricePerHour: number; isEvCharging: boolean
}

interface Props {
  spots: Spot[]
  userLocation: { lat: number; lng: number } | null
}

const DEFAULT_CENTER: [number, number] = [12.9716, 77.5946]

export function SpotMap({ spots, userLocation }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [mapId] = useState(() => `map-${Math.random().toString(36).slice(2)}`)

  useEffect(() => {
    if (!wrapperRef.current) return

    // Replace inner content to guarantee a fresh container
    wrapperRef.current.innerHTML = `<div id="${mapId}" style="width:100%;height:100%"></div>`
    const container = document.getElementById(mapId)
    if (!container) return

    let map: any = null

    import('leaflet').then(L => {
      if (!container || !document.getElementById(mapId)) return

      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const center = userLocation ? [userLocation.lat, userLocation.lng] as [number, number] : DEFAULT_CENTER
      map = L.map(container, { scrollWheelZoom: true }).setView(center, 13)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map)

      setTimeout(() => map.invalidateSize(), 100)

      if (userLocation) {
        const userIcon = L.divIcon({
          html: `<div style="width:14px;height:14px;background:#4285F4;border:2px solid #fff;border-radius:50%;box-shadow:0 0 6px rgba(66,133,244,0.6)"></div>`,
          className: '',
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        })
        L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
          .addTo(map)
          .bindPopup('Your location')
      }

      spots.forEach(spot => {
        const isEv = spot.isEvCharging
        const spotIcon = L.divIcon({
          html: `<div style="
            background: ${isEv ? '#16a34a' : '#ffffff'};
            color: ${isEv ? '#ffffff' : '#031c47'};
            padding: 4px 10px;
            border-radius: 20px;
            font-size: 13px;
            font-weight: 700;
            white-space: nowrap;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            border: 2px solid ${isEv ? '#15803d' : '#031c47'};
            text-align: center;
          ">₹${spot.pricePerHour}${isEv ? ' ⚡' : ''}</div>`,
          className: '',
          iconSize: [60, 28],
          iconAnchor: [30, 14],
        })

        L.marker([spot.latitude, spot.longitude], { icon: spotIcon })
          .addTo(map)
          .bindPopup(`
            <div style="min-width:140px">
              <strong>${spot.title}</strong><br/>
              ₹${spot.pricePerHour}/hr${spot.isEvCharging ? ' &nbsp;⚡ EV' : ''}<br/>
              <a href="/spots/${spot.id}" style="color:#031c47;font-weight:600">View spot →</a>
            </div>
          `)
      })
    })

    return () => {
      if (map) map.remove()
      if (wrapperRef.current) wrapperRef.current.innerHTML = ''
    }
  }, [spots, userLocation, mapId])

  return (
    <div ref={wrapperRef} className="w-full h-[400px] rounded-2xl border border-gray-200 shadow-sm z-0" />
  )
}
