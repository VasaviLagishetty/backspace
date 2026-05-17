'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Heart, MapPin, Star, Zap, Car, ArrowLeft } from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import api from '@/lib/api'
import Link from 'next/link'
import Image from 'next/image'

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => { api.get('/favorites').then(r => setFavorites(r.data)) }, [])

  const remove = async (spotId: string) => {
    await api.delete(`/favorites/${spotId}`)
    setFavorites(f => f.filter(fav => fav.spotId !== spotId))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button onClick={() => router.back()} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#031c47] mb-5 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2"><Heart className="h-6 w-6 text-red-500" /> Saved Spots</h1>
        {favorites.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Heart className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No saved spots yet. <Link href="/" className="text-primary hover:underline">Browse spots →</Link></p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {favorites.map(fav => (
              <Card key={fav.id} className="overflow-hidden">
                <div className="relative h-36 bg-gray-200">
                  {fav.spot.images?.[0] ? (
                    <Image src={fav.spot.images[0]} alt={fav.spot.title} fill className="object-cover" />
                  ) : <div className="flex items-center justify-center h-full"><Car className="h-10 w-10 text-gray-400" /></div>}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold">{fav.spot.title}</h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" />{fav.spot.address}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="font-bold text-primary">₹{fav.spot.pricePerHour}/hr</span>
                    <div className="flex gap-2">
                      <Link href={`/spots/${fav.spotId}`}><Button size="sm">Book</Button></Link>
                      <Button size="sm" variant="outline" onClick={() => remove(fav.spotId)}>Remove</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
