# ParkBlr — Smart Parking Allocation for Bangalore

Book and pay for parking spots near malls, theatres, and landmarks across Bangalore. Real-time availability, EV charging support, and host commission system.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript + Tailwind CSS |
| Backend | Node.js + Express + TypeScript |
| Database | PostgreSQL + Prisma ORM |
| Real-time | Socket.io |
| Auth | JWT + Google OAuth |
| Payments | Razorpay |
| Maps | Google Maps JS API |
| Notifications | Nodemailer (email) + Twilio (SMS) |
| Storage | AWS S3 |
| Cache | Redis |

## Features

- Search parking spots by location, price, EV charging, amenities
- Vehicle dimension matching — only shows spots that fit your car
- EV-specific filtering with charger type info
- Real-time availability via Socket.io
- Razorpay payment with webhook confirmation
- 80/20 commission split (host/platform)
- Late checkout penalty (50% per hour)
- Booking extension (if no conflict)
- Booking history and cancellation
- Email + SMS notifications
- Favorites, ratings, reviews, issue reporting
- Host dashboard with earnings tracking
- Google Maps integration with spot markers

## Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 16+
- Redis 7+

### 1. Clone and install

```bash
# Backend
cd backend
cp .env.example .env   # fill in your keys
npm install
npx prisma db push
npm run dev

# Frontend (new terminal)
cd frontend
cp .env.example .env.local   # fill in your keys
npm install
npm run dev
```

### 2. Docker (recommended)

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
# Edit both .env files with your API keys
docker-compose up
```

App runs at: http://localhost:3000  
API runs at: http://localhost:5000

## Environment Variables

### Backend (`backend/.env`)
| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | JWT signing secret |
| `RAZORPAY_KEY_ID` | Razorpay key ID |
| `RAZORPAY_KEY_SECRET` | Razorpay secret |
| `RAZORPAY_WEBHOOK_SECRET` | Webhook verification secret |
| `SMTP_*` | Email (Gmail SMTP) credentials |
| `TWILIO_*` | SMS credentials |
| `AWS_*` | S3 for spot images |

### Frontend (`frontend/.env.local`)
| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API URL |
| `NEXT_PUBLIC_GOOGLE_MAPS_KEY` | Google Maps API key |
| `NEXT_PUBLIC_RAZORPAY_KEY` | Razorpay public key |

## API Routes

| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | Register user/host |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/google` | Google OAuth |
| GET | `/api/spots/search` | Search spots with filters |
| POST | `/api/spots` | Create spot (HOST) |
| POST | `/api/bookings` | Create booking |
| POST | `/api/bookings/:id/extend` | Extend booking |
| POST | `/api/bookings/:id/cancel` | Cancel booking |
| POST | `/api/payments/create-order` | Create Razorpay order |
| POST | `/api/payments/verify` | Verify payment |
| POST | `/api/payments/webhook` | Razorpay webhook |
| GET | `/api/favorites` | Get favorites |
| POST | `/api/reviews` | Submit review |
| POST | `/api/issues` | Report issue |

## Commission Structure

- Host receives **80%** of booking amount
- Platform retains **20%**
- Late checkout: **50% of hourly rate per hour** late

## Pages

| Route | Description |
|---|---|
| `/` | Home — search, filter, map/list view |
| `/login` | Login |
| `/register` | Register (user or host) |
| `/spots/:id` | Spot detail + booking |
| `/dashboard` | User/host dashboard |
| `/favorites` | Saved spots |
| `/notifications` | Notifications |
| `/review?bookingId=` | Submit review |
| `/report?spotId=` | Report issue |
