'use client'
export const dynamic = 'force-dynamic'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AlertTriangle, Loader2, ArrowLeft } from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from '@/components/ui/toaster'
import api from '@/lib/api'

const ISSUE_TYPES = ['Spot not available', 'Safety concern', 'Incorrect dimensions', 'No EV charger', 'Unauthorized vehicle', 'Other']

export default function ReportIssuePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const spotId = searchParams.get('spotId') || ''
  const bookingId = searchParams.get('bookingId') || undefined
  const [form, setForm] = useState({ title: '', description: '' })
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!spotId) return toast({ title: 'Spot ID missing', variant: 'destructive' })
    setLoading(true)
    try {
      await api.post('/issues', { spotId, bookingId, ...form })
      toast({ title: 'Issue reported. We\'ll look into it.' })
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
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" /> Report an Issue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-1">
                <Label>Issue Type</Label>
                <select
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                >
                  <option value="">Select issue type</option>
                  {ISSUE_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <Label>Description</Label>
                <textarea
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[100px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Describe the issue in detail..."
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Submit Report
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
