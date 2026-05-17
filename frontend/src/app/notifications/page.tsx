'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, CheckCheck, ArrowLeft } from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import api from '@/lib/api'

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => { api.get('/notifications').then(r => setNotifications(r.data)) }, [])

  const markAllRead = async () => {
    await api.patch('/notifications/read-all')
    setNotifications(n => n.map(x => ({ ...x, isRead: true })))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <button onClick={() => router.back()} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#031c47] mb-5 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2"><Bell className="h-6 w-6" /> Notifications</h1>
          {notifications.some(n => !n.isRead) && (
            <Button variant="outline" size="sm" onClick={markAllRead} className="gap-1">
              <CheckCheck className="h-4 w-4" /> Mark all read
            </Button>
          )}
        </div>
        {notifications.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No notifications yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map(n => (
              <Card key={n.id} className={n.isRead ? 'opacity-60' : ''}>
                <CardContent className="p-4 flex items-start gap-3">
                  <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${n.isRead ? 'bg-gray-300' : 'bg-primary'}`} />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{n.title}</p>
                    <p className="text-sm text-muted-foreground">{n.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{new Date(n.createdAt).toLocaleString('en-IN')}</p>
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
