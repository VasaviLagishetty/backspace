import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create a host user
  const host = await prisma.user.upsert({
    where: { email: 'host@parkblr.in' },
    update: {},
    create: {
      email: 'host@backspace.in',
      name: 'Backspace Host',
      phone: '9876543210',
      passwordHash: await bcrypt.hash('password123', 12),
      role: 'HOST',
      isVerified: true,
    },
  })

  // Create a test user
  await prisma.user.upsert({
    where: { email: 'user@backspace.in' },
    update: {},
    create: {
      email: 'user@parkblr.in',
      name: 'Test User',
      phone: '9876543211',
      passwordHash: await bcrypt.hash('password123', 12),
      role: 'USER',
      isVerified: true,
    },
  })

  const spots = [
    {
      title: 'Phoenix Marketcity Parking',
      address: 'Whitefield Main Road, Whitefield, Bangalore',
      latitude: 12.9698,
      longitude: 77.7500,
      pricePerHour: 40,
      pricePerDay: 300,
      width: 2.5,
      length: 5.0,
      amenities: ['covered', 'cctv', 'security', '24/7'],
      isEvCharging: true,
      evChargerType: 'Type2',
      nearbyLandmark: 'Phoenix Marketcity Mall',
    },
    {
      title: 'Orion Mall Parking - Rajajinagar',
      address: 'Dr Rajkumar Road, Rajajinagar, Bangalore',
      latitude: 13.0107,
      longitude: 77.5556,
      pricePerHour: 50,
      pricePerDay: 350,
      width: 2.8,
      length: 5.5,
      amenities: ['covered', 'cctv', 'security', 'valet'],
      isEvCharging: true,
      evChargerType: 'CCS',
      nearbyLandmark: 'Orion Mall',
    },
    {
      title: 'MG Road Metro Parking',
      address: 'MG Road, Near Trinity Circle, Bangalore',
      latitude: 12.9756,
      longitude: 77.6068,
      pricePerHour: 30,
      pricePerDay: 200,
      width: 2.4,
      length: 4.8,
      amenities: ['open', 'cctv', 'security'],
      isEvCharging: false,
      nearbyLandmark: 'MG Road Metro Station',
    },
    {
      title: 'Indiranagar 100ft Road Parking',
      address: '100 Feet Road, Indiranagar, Bangalore',
      latitude: 12.9784,
      longitude: 77.6408,
      pricePerHour: 35,
      pricePerDay: 250,
      width: 2.5,
      length: 5.0,
      amenities: ['open', 'cctv'],
      isEvCharging: false,
      nearbyLandmark: 'Indiranagar Metro',
    },
    {
      title: 'Koramangala BDA Complex Parking',
      address: '80 Feet Road, Koramangala, Bangalore',
      latitude: 12.9352,
      longitude: 77.6245,
      pricePerHour: 25,
      pricePerDay: 180,
      width: 2.5,
      length: 5.0,
      amenities: ['open', 'security'],
      isEvCharging: false,
      nearbyLandmark: 'BDA Complex Koramangala',
    },
    {
      title: 'UB City Valet Parking',
      address: 'Vittal Mallya Road, Bangalore',
      latitude: 12.9716,
      longitude: 77.5964,
      pricePerHour: 80,
      pricePerDay: 500,
      width: 3.0,
      length: 5.5,
      amenities: ['covered', 'cctv', 'security', 'valet', '24/7'],
      isEvCharging: true,
      evChargerType: 'CHAdeMO',
      nearbyLandmark: 'UB City Mall',
    },
    {
      title: 'Jayanagar 4th Block Parking',
      address: '11th Main Road, Jayanagar 4th Block, Bangalore',
      latitude: 12.9259,
      longitude: 77.5838,
      pricePerHour: 20,
      pricePerDay: 150,
      width: 2.4,
      length: 4.5,
      amenities: ['open'],
      isEvCharging: false,
      nearbyLandmark: 'Jayanagar Shopping Complex',
    },
    {
      title: 'Mantri Square Mall Parking',
      address: 'Sampige Road, Malleshwaram, Bangalore',
      latitude: 12.9917,
      longitude: 77.5700,
      pricePerHour: 45,
      pricePerDay: 320,
      width: 2.6,
      length: 5.2,
      amenities: ['covered', 'cctv', 'security', '24/7'],
      isEvCharging: true,
      evChargerType: 'Type2',
      nearbyLandmark: 'Mantri Square Mall',
    },
    {
      title: 'HSR Layout Sector 1 Parking',
      address: '27th Main Road, HSR Layout, Bangalore',
      latitude: 12.9116,
      longitude: 77.6389,
      pricePerHour: 20,
      pricePerDay: 140,
      width: 2.5,
      length: 5.0,
      amenities: ['open', 'cctv'],
      isEvCharging: false,
      nearbyLandmark: 'HSR BDA Complex',
    },
    {
      title: 'Electronic City Infosys Gate Parking',
      address: 'Hosur Road, Electronic City Phase 1, Bangalore',
      latitude: 12.8456,
      longitude: 77.6603,
      pricePerHour: 15,
      pricePerDay: 100,
      width: 2.8,
      length: 5.5,
      amenities: ['open', 'security', '24/7'],
      isEvCharging: true,
      evChargerType: 'CCS',
      nearbyLandmark: 'Infosys Campus',
    },
  ]

  for (const spot of spots) {
    await prisma.parkingSpot.create({
      data: { ...spot, hostId: host.id, city: 'Bangalore' },
    })
  }

  console.log(`Seeded ${spots.length} parking spots in Bangalore`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
