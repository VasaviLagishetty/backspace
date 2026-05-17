import nodemailer from 'nodemailer'
import twilio from 'twilio'
import { prisma } from '../utils/prisma'
import { emitUserNotification } from './socket'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
})

const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN)

async function saveAndEmit(userId: string, title: string, message: string, type: string, data?: any) {
  const notification = await prisma.notification.create({
    data: { userId, title, message, type, data },
  })
  emitUserNotification(userId, notification)
  return notification
}

export async function sendBookingConfirmation(email: string, booking: any) {
  const subject = `Booking Confirmed - ${booking.confirmationCode}`
  const html = `
    <h2>Your parking is confirmed!</h2>
    <p><strong>Spot:</strong> ${booking.spot.title}</p>
    <p><strong>Address:</strong> ${booking.spot.address}</p>
    <p><strong>From:</strong> ${new Date(booking.startTime).toLocaleString('en-IN')}</p>
    <p><strong>To:</strong> ${new Date(booking.endTime).toLocaleString('en-IN')}</p>
    <p><strong>Amount Paid:</strong> ₹${booking.totalAmount}</p>
    <p><strong>Confirmation Code:</strong> ${booking.confirmationCode}</p>
    <p style="color:red">⚠️ Late checkout incurs 50% hourly penalty. Please vacate on time.</p>
  `
  await transporter.sendMail({ from: process.env.SMTP_FROM, to: email, subject, html })

  if (booking.user?.phone) {
    await twilioClient.messages.create({
      body: `Backspace: Booking confirmed at ${booking.spot.title}. Code: ${booking.confirmationCode}. From ${new Date(booking.startTime).toLocaleTimeString('en-IN')}`,
      from: process.env.TWILIO_FROM,
      to: `+91${booking.user.phone}`,
    }).catch(() => {}) // non-fatal
  }

  await saveAndEmit(booking.userId, 'Booking Confirmed', `Your spot at ${booking.spot.title} is confirmed.`, 'booking', { bookingId: booking.id })
}

export async function sendBookingCancellation(email: string, booking: any) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: `Booking Cancelled - ${booking.confirmationCode}`,
    html: `<p>Your booking at <strong>${booking.spot?.title}</strong> has been cancelled. Refund will be processed within 5-7 business days.</p>`,
  })

  if (booking.user?.phone) {
    await twilioClient.messages.create({
      body: `Backspace: Your booking at ${booking.spot?.title} has been cancelled. Refund (if applicable) will be processed within 5-7 days.`,
      from: process.env.TWILIO_FROM,
      to: `+91${booking.user.phone}`,
    }).catch(() => {})
  }

  await saveAndEmit(booking.userId, 'Booking Cancelled', `Booking at ${booking.spot?.title} cancelled.`, 'booking', { bookingId: booking.id })
}

export async function sendNearbySpotAlert(userId: string, spotTitle: string) {
  await saveAndEmit(userId, 'Nearby Spot Available', `A parking spot just opened near you: ${spotTitle}`, 'alert')
}
