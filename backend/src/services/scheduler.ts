import cron from 'node-cron'
import { prisma } from '../utils/prisma'

const GRACE_PERIOD_MINUTES = 15

export function startNoShowJob() {
  // Run every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    const cutoff = new Date(Date.now() - GRACE_PERIOD_MINUTES * 60 * 1000)

    // Find confirmed bookings whose start time + grace period has passed
    const noShows = await prisma.booking.findMany({
      where: {
        status: 'CONFIRMED',
        startTime: { lt: cutoff },
      },
    })

    if (noShows.length === 0) return

    await prisma.booking.updateMany({
      where: { id: { in: noShows.map(b => b.id) } },
      data: { status: 'CANCELLED' },
    })

    console.log(`[Scheduler] Marked ${noShows.length} bookings as no-show`)
  })

  console.log('[Scheduler] No-show auto-release job started (every 5 min)')
}
