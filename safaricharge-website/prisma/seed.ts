import { PrismaClient } from '@prisma/client';
import { env } from '../src/lib/env';
import { hashPasswordForStorage } from '../src/lib/auth';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const adminPassword = hashPasswordForStorage('admin123');
  await prisma.user.upsert({
    where: { email: env.MAIN_ADMIN_EMAIL },
    update: {},
    create: {
      email: env.MAIN_ADMIN_EMAIL,
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
      phone: '+254 720 000 000',
      isEmailVerified: true,
    },
  });

  const driverPassword = hashPasswordForStorage('driver123');
  const driver = await prisma.user.upsert({
    where: { email: 'driver@example.com' },
    update: {},
    create: {
      email: 'driver@example.com',
      name: 'John Doe',
      password: driverPassword,
      role: 'DRIVER',
      phone: '+254 712 345 678',
      isEmailVerified: true,
    },
  });

  const fleetPassword = hashPasswordForStorage('fleet123');
  await prisma.user.upsert({
    where: { email: 'fleet@logistics.com' },
    update: {},
    create: {
      email: 'fleet@logistics.com',
      name: 'Fleet Manager',
      password: fleetPassword,
      role: 'FLEET_MANAGER',
      phone: '+254 733 222 111',
      isEmailVerified: true,
    },
  });

  await Promise.all([
    prisma.chargingStation.upsert({
      where: { id: 'station-1' },
      update: {},
      create: {
        id: 'station-1',
        name: 'SafariCharge Central Hub',
        description: 'Our flagship charging station with premium amenities including a lounge, cafe, and restrooms.',
        address: '123 Electric Avenue',
        city: 'Nairobi',
        latitude: -1.2921,
        longitude: 36.8219,
        status: 'AVAILABLE',
        rating: 4.8,
        reviewCount: 234,
        isOpen24h: true,
        amenities: JSON.stringify(['Cafe', 'Restrooms', 'Lounge', 'WiFi', 'Shopping']),
      },
    }),
    prisma.chargingStation.upsert({
      where: { id: 'station-2' },
      update: {},
      create: {
        id: 'station-2',
        name: 'Westlands Express Charge',
        description: 'Quick charging for busy professionals. Located near major shopping centers.',
        address: '45 Westlands Road',
        city: 'Nairobi',
        latitude: -1.2634,
        longitude: 36.803,
        status: 'AVAILABLE',
        rating: 4.5,
        reviewCount: 156,
        isOpen24h: false,
        amenities: JSON.stringify(['Restrooms', 'WiFi', 'Convenience Store']),
      },
    }),
    prisma.chargingStation.upsert({
      where: { id: 'station-3' },
      update: {},
      create: {
        id: 'station-3',
        name: 'Airport Gateway Station',
        description: 'Convenient charging while you travel. Long-term parking available.',
        address: 'Jomo Kenyatta International Airport',
        city: 'Nairobi',
        latitude: -1.3192,
        longitude: 36.9278,
        status: 'OCCUPIED',
        rating: 4.6,
        reviewCount: 89,
        isOpen24h: true,
        amenities: JSON.stringify(['Parking', 'Restrooms', 'WiFi', 'Shuttle Service']),
      },
    }),
    prisma.chargingStation.upsert({
      where: { id: 'station-4' },
      update: {},
      create: {
        id: 'station-4',
        name: 'Mombasa Road Service Center',
        description: 'Full service station with vehicle maintenance and charging capabilities.',
        address: 'Mombasa Road Highway',
        city: 'Nairobi',
        latitude: -1.331,
        longitude: 36.894,
        status: 'AVAILABLE',
        rating: 4.3,
        reviewCount: 67,
        isOpen24h: true,
        amenities: JSON.stringify(['Vehicle Service', 'Restrooms', 'Restaurant', 'Parking']),
      },
    }),
    prisma.chargingStation.upsert({
      where: { id: 'station-5' },
      update: {},
      create: {
        id: 'station-5',
        name: 'Karen Green Station',
        description: 'Eco-friendly station powered by solar energy. Beautiful garden setting.',
        address: 'Karen Shopping Centre',
        city: 'Nairobi',
        latitude: -1.3187,
        longitude: 36.7104,
        status: 'AVAILABLE',
        rating: 4.9,
        reviewCount: 178,
        isOpen24h: false,
        amenities: JSON.stringify(['Garden', 'Organic Cafe', 'WiFi', 'Bike Charging']),
      },
    }),
    prisma.chargingStation.upsert({
      where: { id: 'station-6' },
      update: {},
      create: {
        id: 'station-6',
        name: 'Industrial Area Power Hub',
        description: 'High-capacity charging for fleet vehicles and heavy-duty equipment.',
        address: 'Industrial Area Zone A',
        city: 'Nairobi',
        latitude: -1.305,
        longitude: 36.855,
        status: 'AVAILABLE',
        rating: 4.2,
        reviewCount: 45,
        isOpen24h: true,
        amenities: JSON.stringify(['Fleet Parking', 'Restrooms', '24/7 Security']),
      },
    }),
  ]);

  const connectorData = [
    { id: 'conn-1', stationId: 'station-1', type: 'CCS2' as const, powerOutput: 150, currentPrice: 0.35, status: 'AVAILABLE' as const },
    { id: 'conn-2', stationId: 'station-1', type: 'CCS2' as const, powerOutput: 150, currentPrice: 0.35, status: 'OCCUPIED' as const },
    { id: 'conn-3', stationId: 'station-1', type: 'CHADEMO' as const, powerOutput: 100, currentPrice: 0.3, status: 'AVAILABLE' as const },
    { id: 'conn-4', stationId: 'station-1', type: 'TYPE2' as const, powerOutput: 22, currentPrice: 0.25, status: 'AVAILABLE' as const },
    { id: 'conn-5', stationId: 'station-2', type: 'CCS2' as const, powerOutput: 50, currentPrice: 0.32, status: 'AVAILABLE' as const },
    { id: 'conn-6', stationId: 'station-2', type: 'TYPE2' as const, powerOutput: 22, currentPrice: 0.25, status: 'AVAILABLE' as const },
    { id: 'conn-7', stationId: 'station-3', type: 'CCS2' as const, powerOutput: 150, currentPrice: 0.38, status: 'OCCUPIED' as const },
    { id: 'conn-8', stationId: 'station-3', type: 'CCS2' as const, powerOutput: 150, currentPrice: 0.38, status: 'OCCUPIED' as const },
    { id: 'conn-9', stationId: 'station-3', type: 'TESLA' as const, powerOutput: 250, currentPrice: 0.42, status: 'AVAILABLE' as const },
    { id: 'conn-10', stationId: 'station-4', type: 'CCS2' as const, powerOutput: 100, currentPrice: 0.33, status: 'AVAILABLE' as const },
    { id: 'conn-11', stationId: 'station-4', type: 'CHADEMO' as const, powerOutput: 100, currentPrice: 0.3, status: 'MAINTENANCE' as const },
    { id: 'conn-12', stationId: 'station-4', type: 'TYPE2' as const, powerOutput: 22, currentPrice: 0.25, status: 'AVAILABLE' as const },
    { id: 'conn-13', stationId: 'station-5', type: 'TYPE2' as const, powerOutput: 22, currentPrice: 0.22, status: 'AVAILABLE' as const },
    { id: 'conn-14', stationId: 'station-5', type: 'TYPE2' as const, powerOutput: 11, currentPrice: 0.2, status: 'AVAILABLE' as const },
    { id: 'conn-15', stationId: 'station-6', type: 'CCS2' as const, powerOutput: 350, currentPrice: 0.4, status: 'AVAILABLE' as const },
    { id: 'conn-16', stationId: 'station-6', type: 'CCS2' as const, powerOutput: 350, currentPrice: 0.4, status: 'AVAILABLE' as const },
    { id: 'conn-17', stationId: 'station-6', type: 'CHADEMO' as const, powerOutput: 200, currentPrice: 0.35, status: 'OFFLINE' as const },
  ];

  for (const connector of connectorData) {
    await prisma.connector.upsert({
      where: { id: connector.id },
      update: {},
      create: connector,
    });
  }

  const sessions = [
    {
      id: 'session-1',
      userId: driver.id,
      stationId: 'station-1',
      connectorId: 'conn-2',
      status: 'COMPLETED' as const,
      startTime: new Date('2024-12-01T10:30:00'),
      endTime: new Date('2024-12-01T11:45:00'),
      energyDelivered: 45.5,
      cost: 15.93,
    },
    {
      id: 'session-2',
      userId: driver.id,
      stationId: 'station-2',
      connectorId: 'conn-5',
      status: 'COMPLETED' as const,
      startTime: new Date('2024-11-28T14:00:00'),
      endTime: new Date('2024-11-28T15:30:00'),
      energyDelivered: 38.2,
      cost: 12.22,
    },
    {
      id: 'session-3',
      userId: driver.id,
      stationId: 'station-5',
      connectorId: 'conn-13',
      status: 'COMPLETED' as const,
      startTime: new Date('2024-11-20T09:00:00'),
      endTime: new Date('2024-11-20T10:15:00'),
      energyDelivered: 22.8,
      cost: 5.02,
    },
  ];

  for (const session of sessions) {
    await prisma.chargingSession.upsert({
      where: { id: session.id },
      update: {},
      create: session,
    });
  }

  console.log('Database seeded successfully.');
  console.log('\nTest Accounts:');
  console.log(`  Admin: ${env.MAIN_ADMIN_EMAIL} / admin123`);
  console.log('  Driver: driver@example.com / driver123');
  console.log('  Fleet Manager: fleet@logistics.com / fleet123');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
