'use client'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Star, Loader2, ArrowLeft } from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from '@/components/ui/toaster'
import api from '@/lib/api'

export default function ReviewPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const bookingId = searchParams.get('bookingId') || ''
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    if (!rating) return toast({ title: 'Please select a rating', variant: 'destructive' })
    setLoading(true)
    try {
      await api.post('/reviews', { bookingId, rating, comment })
      toast({ title: 'Review submitted! Thank you.' })
      router.push('/dashboard')
    } catch (e: any) {
      toast({ title: 'Error', description: e.response?.data?.error, variant: 'destructive' })
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-lg mx-auto px-4 py-12">
        <button onClick={() => router.back()} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#031c47] mb-5 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <Card>
          <CardHeader><CardTitle>Rate Your Parking Experience</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map(s => (
                <button key={s} onMouseEnter={() => setHover(s)} onMouseLeave={() => setHover(0)} onClick={() => setRating(s)}>
                  <Star className={`h-10 w-10 transition-colors ${s <= (hover || rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                </button>
              ))}
            </div>
            <div>
              <textarea
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[100px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Share your experience (optional)..."
                value={comment}
                onChange={e => setComment(e.target.value)}
              />
            </div>
            <Button className="w-full" onClick={submit} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Submit Review
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
