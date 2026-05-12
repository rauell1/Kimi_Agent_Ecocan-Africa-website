import { ChargingStation, ChargingSession, User, AIInsight, StationAnalytics, ConnectorType } from '@/types';

// Connector type helper
const createConnector = (id: string, stationId: string, type: ConnectorType, powerOutput: number, price: number, status: 'AVAILABLE' | 'OCCUPIED' | 'OFFLINE' | 'MAINTENANCE' = 'AVAILABLE') => ({
  id, stationId, type, powerOutput, currentPrice: price, status
});

// Station helper to ensure all required fields are present
const createStation = (station: Omit<ChargingStation, 'description'> & { description?: string | null }): ChargingStation => ({
  ...station,
  description: station.description ?? null,
});

// Kenya Charging Stations - Real Data
// Note: description field defaults to null for all stations
export const mockStations: ChargingStation[] = [
  // ===== NAIROBI COUNTY =====
  {
    id: 'nairobi-1', name: 'Waterfront, Karen', description: null, address: 'Karen Shopping Centre', city: 'Nairobi', county: 'Nairobi',
    latitude: -1.3187, longitude: 36.7104, status: 'AVAILABLE' as const, rating: 4.5, reviewCount: 45,
    imageUrl: null, isOpen24h: true, amenities: ['Shopping', 'Restaurant', 'Parking'],
    connectors: [
      createConnector('n1-c1', 'nairobi-1', 'TYPE2', 22, 0.25),
      createConnector('n1-c2', 'nairobi-1', 'TYPE2', 22, 0.25),
    ], distance: 5.2
  },
  {
    id: 'nairobi-2', name: 'The Well, Karen', address: 'Karen Road', city: 'Nairobi', county: 'Nairobi',
    latitude: -1.3175, longitude: 36.7120, status: 'AVAILABLE' as const, description: null, rating: 4.7, reviewCount: 89,
    imageUrl: null, isOpen24h: true, amenities: ['Shopping', 'Cafe', 'WiFi', 'Parking'],
    connectors: [
      createConnector('n2-c1', 'nairobi-2', 'TYPE2', 22, 0.25),
      createConnector('n2-c2', 'nairobi-2', 'CCS2', 50, 0.35),
      createConnector('n2-c3', 'nairobi-2', 'CHADEMO', 50, 0.35),
    ], distance: 5.5
  },
  {
    id: 'nairobi-3', name: 'Karen C, Lang\'ata Road', address: 'Lang\'ata Road', city: 'Nairobi', county: 'Nairobi',
    latitude: -1.3245, longitude: 36.7380, status: 'AVAILABLE' as const, description: null, rating: 4.2, reviewCount: 34,
    imageUrl: null, isOpen24h: false, amenities: ['Parking'],
    connectors: [createConnector('n3-c1', 'nairobi-3', 'TYPE2', 22, 0.25)], distance: 6.1
  },
  {
    id: 'nairobi-4', name: 'Karen 31 off Ngong Rd', address: 'Ngong Road', city: 'Nairobi', county: 'Nairobi',
    latitude: -1.3000, longitude: 36.7500, status: 'AVAILABLE' as const, description: null, rating: 4.3, reviewCount: 28,
    imageUrl: null, isOpen24h: false, amenities: ['Parking', 'Shopping'],
    connectors: [
      createConnector('n4-c1', 'nairobi-4', 'TYPE2', 22, 0.25),
      createConnector('n4-c2', 'nairobi-4', 'CCS2', 60, 0.32),
    ], distance: 4.8
  },
  {
    id: 'nairobi-5', name: 'Adlife, Kilimani', address: 'Kilimani Road', city: 'Nairobi', county: 'Nairobi',
    latitude: -1.2950, longitude: 36.7850, status: 'AVAILABLE' as const, description: null, rating: 4.4, reviewCount: 56,
    imageUrl: null, isOpen24h: false, amenities: ['Shopping', 'Restaurant', 'Parking'],
    connectors: [createConnector('n5-c1', 'nairobi-5', 'TYPE2', 22, 0.25)], distance: 3.2
  },
  {
    id: 'nairobi-6', name: 'Sarit Centre, Westlands', address: 'Westlands', city: 'Nairobi', county: 'Nairobi',
    latitude: -1.2634, longitude: 36.8030, status: 'AVAILABLE' as const, description: null, rating: 4.6, reviewCount: 156,
    imageUrl: null, isOpen24h: true, amenities: ['Shopping', 'Food Court', 'Cinema', 'WiFi', 'Parking'],
    connectors: [
      createConnector('n6-c1', 'nairobi-6', 'TYPE2', 22, 0.25),
      createConnector('n6-c2', 'nairobi-6', 'CHADEMO', 50, 0.35),
    ], distance: 2.5
  },
  {
    id: 'nairobi-7', name: 'Sarit Centre Car Park B', address: 'Westlands', city: 'Nairobi', county: 'Nairobi',
    latitude: -1.2638, longitude: 36.8035, status: 'AVAILABLE' as const, description: null, rating: 4.5, reviewCount: 78,
    imageUrl: null, isOpen24h: true, amenities: ['Shopping', 'Parking', 'Security'],
    connectors: [
      createConnector('n7-c1', 'nairobi-7', 'TYPE2', 22, 0.25),
      createConnector('n7-c2', 'nairobi-7', 'TYPE2', 22, 0.25),
    ], distance: 2.5
  },
  {
    id: 'nairobi-8', name: 'UNGA House, Westlands', address: 'Muthangari Drive, Westlands', city: 'Nairobi', county: 'Nairobi',
    latitude: -1.2610, longitude: 36.7980, status: 'AVAILABLE' as const, description: null, rating: 4.3, reviewCount: 42,
    imageUrl: null, isOpen24h: false, amenities: ['Office', 'Parking', 'Security'],
    connectors: [createConnector('n8-c1', 'nairobi-8', 'TYPE2', 22, 0.25)], distance: 2.8
  },
  {
    id: 'nairobi-9', name: 'ABC Place, Westlands', address: 'Waiyaki Way, Westlands', city: 'Nairobi', county: 'Nairobi',
    latitude: -1.2580, longitude: 36.7900, status: 'AVAILABLE' as const, description: null, rating: 4.4, reviewCount: 67,
    imageUrl: null, isOpen24h: true, amenities: ['Shopping', 'Restaurant', 'Parking'],
    connectors: [
      createConnector('n9-c1', 'nairobi-9', 'TYPE2', 22, 0.25),
      createConnector('n9-c2', 'nairobi-9', 'CCS2', 50, 0.35),
    ], distance: 3.1
  },
  {
    id: 'nairobi-10', name: 'Standard Chartered, Chiromo', address: 'Chiromo Road', city: 'Nairobi', county: 'Nairobi',
    latitude: -1.2650, longitude: 36.8100, status: 'AVAILABLE' as const, description: null, rating: 4.2, reviewCount: 23,
    imageUrl: null, isOpen24h: false, amenities: ['Office', 'Parking', 'Security'],
    connectors: [createConnector('n10-c1', 'nairobi-10', 'TYPE2', 22, 0.25)], distance: 2.2
  },
  {
    id: 'nairobi-11', name: 'Mövenpick, Westlands', address: 'Waiyaki Way', city: 'Nairobi', county: 'Nairobi',
    latitude: -1.2520, longitude: 36.7850, status: 'AVAILABLE' as const, description: null, rating: 4.7, reviewCount: 89,
    imageUrl: null, isOpen24h: true, amenities: ['Hotel', 'Restaurant', 'Pool', 'Parking'],
    connectors: [createConnector('n11-c1', 'nairobi-11', 'TYPE2', 22, 0.28)], distance: 3.5
  },
  {
    id: 'nairobi-12', name: 'Village Market, Gigiri', address: 'Limuru Road, Gigiri', city: 'Nairobi', county: 'Nairobi',
    latitude: -1.2420, longitude: 36.8120, status: 'AVAILABLE' as const, description: null, rating: 4.6, reviewCount: 134,
    imageUrl: null, isOpen24h: true, amenities: ['Shopping', 'Food Court', 'Cinema', 'WiFi', 'Parking'],
    connectors: [createConnector('n12-c1', 'nairobi-12', 'TYPE2', 22, 0.25)], distance: 6.8
  },
  {
    id: 'nairobi-13', name: 'Two Rivers Mall, Runda', address: 'Limuru Road, Runda', city: 'Nairobi', county: 'Nairobi',
    latitude: -1.2350, longitude: 36.8200, status: 'AVAILABLE' as const, description: null, rating: 4.8, reviewCount: 256,
    imageUrl: null, isOpen24h: true, amenities: ['Shopping', 'Food Court', 'Cinema', 'Kids Zone', 'WiFi', 'Parking'],
    connectors: [createConnector('n13-c1', 'nairobi-13', 'TYPE2', 22, 0.25)], distance: 7.5
  },
  {
    id: 'nairobi-14', name: 'KCB Towers, Upper Hill', address: 'Upper Hill', city: 'Nairobi', county: 'Nairobi',
    latitude: -1.2950, longitude: 36.8200, status: 'AVAILABLE' as const, description: null, rating: 4.3, reviewCount: 45,
    imageUrl: null, isOpen24h: false, amenities: ['Office', 'Parking', 'Security'],
    connectors: [createConnector('n14-c1', 'nairobi-14', 'TYPE2', 22, 0.25)], distance: 1.8
  },
  {
    id: 'nairobi-15', name: 'NCBA HQ, Ragati Road', address: 'Ragati Road, Upper Hill', city: 'Nairobi', county: 'Nairobi',
    latitude: -1.2980, longitude: 36.8180, status: 'AVAILABLE' as const, description: null, rating: 4.4, reviewCount: 38,
    imageUrl: null, isOpen24h: false, amenities: ['Office', 'Parking', 'Security'],
    connectors: [createConnector('n15-c1', 'nairobi-15', 'TYPE2', 22, 0.25)], distance: 2.0
  },
  {
    id: 'nairobi-16', name: 'NCBA Masaba, Upper Hill', address: 'Masaba Road, Upper Hill', city: 'Nairobi', county: 'Nairobi',
    latitude: -1.3000, longitude: 36.8150, status: 'AVAILABLE' as const, description: null, rating: 4.2, reviewCount: 29,
    imageUrl: null, isOpen24h: false, amenities: ['Office', 'Parking'],
    connectors: [createConnector('n16-c1', 'nairobi-16', 'TYPE2', 22, 0.25)], distance: 2.2
  },
  {
    id: 'nairobi-17', name: 'Britam Towers, Upper Hill', address: 'Hospital Road, Upper Hill', city: 'Nairobi', county: 'Nairobi',
    latitude: -1.2920, longitude: 36.8220, status: 'AVAILABLE' as const, description: null, rating: 4.5, reviewCount: 67,
    imageUrl: null, isOpen24h: false, amenities: ['Office', 'Parking', 'Security', 'Restaurant'],
    connectors: [createConnector('n17-c1', 'nairobi-17', 'TYPE2', 22, 0.25)], distance: 1.5
  },
  {
    id: 'nairobi-18', name: 'CPF House, CBD', address: 'Nairobi CBD', city: 'Nairobi', county: 'Nairobi',
    latitude: -1.2850, longitude: 36.8200, status: 'AVAILABLE' as const, description: null, rating: 4.1, reviewCount: 34,
    imageUrl: null, isOpen24h: false, amenities: ['Office', 'Parking', 'Shopping'],
    connectors: [createConnector('n18-c1', 'nairobi-18', 'CCS2', 50, 0.35)], distance: 0.8
  },
  {
    id: 'nairobi-19', name: 'JKIA Airport Station', address: 'Jomo Kenyatta International Airport', city: 'Nairobi', county: 'Nairobi',
    latitude: -1.3192, longitude: 36.9278, status: 'AVAILABLE' as const, description: null, rating: 4.7, reviewCount: 189,
    imageUrl: null, isOpen24h: true, amenities: ['Parking', 'Lounge', 'Restaurant', 'WiFi', 'Shuttle'],
    connectors: [
      createConnector('n19-c1', 'nairobi-19', 'TYPE2', 22, 0.30),
      createConnector('n19-c2', 'nairobi-19', 'CHADEMO', 50, 0.38),
    ], distance: 15.2
  },
  {
    id: 'nairobi-20', name: 'BasiGo Depot, Embakasi', address: 'Embakasi', city: 'Nairobi', county: 'Nairobi',
    latitude: -1.3150, longitude: 36.8900, status: 'AVAILABLE' as const, description: null, rating: 4.3, reviewCount: 56,
    imageUrl: null, isOpen24h: true, amenities: ['Parking', 'Fleet Services'],
    connectors: [createConnector('n20-c1', 'nairobi-20', 'CCS2', 60, 0.32)], distance: 10.5
  },
  {
    id: 'nairobi-21', name: 'Roam Hub, Kayole', address: 'Kayole', city: 'Nairobi', county: 'Nairobi',
    latitude: -1.2850, longitude: 36.9200, status: 'AVAILABLE' as const, description: null, rating: 4.4, reviewCount: 45,
    imageUrl: null, isOpen24h: true, amenities: ['Parking', 'Fleet Services'],
    connectors: [createConnector('n21-c1', 'nairobi-21', 'CCS2', 50, 0.35)], distance: 11.2
  },
  {
    id: 'nairobi-22', name: 'Roam Park, ICD Road', address: 'ICD Road', city: 'Nairobi', county: 'Nairobi',
    latitude: -1.3050, longitude: 36.8950, status: 'AVAILABLE' as const, description: null, rating: 4.2, reviewCount: 34,
    imageUrl: null, isOpen24h: true, amenities: ['Parking', 'Fleet Services'],
    connectors: [createConnector('n22-c1', 'nairobi-22', 'CCS2', 50, 0.35)], distance: 9.8
  },
  {
    id: 'nairobi-23', name: 'Total, Hurlingham', address: 'Argwings Kodhek Road', city: 'Nairobi', county: 'Nairobi',
    latitude: -1.2920, longitude: 36.8000, status: 'AVAILABLE' as const, description: null, rating: 4.3, reviewCount: 67,
    imageUrl: null, isOpen24h: true, amenities: ['Fuel Station', 'Convenience Store', 'Parking'],
    connectors: [
      createConnector('n23-c1', 'nairobi-23', 'CCS2', 50, 0.35),
      createConnector('n23-c2', 'nairobi-23', 'TYPE2', 22, 0.25),
    ], distance: 2.5
  },
  {
    id: 'nairobi-24', name: 'Stima Plaza, Parklands', address: 'Parklands', city: 'Nairobi', county: 'Nairobi',
    latitude: -1.2550, longitude: 36.8300, status: 'AVAILABLE' as const, description: null, rating: 4.5, reviewCount: 78,
    imageUrl: null, isOpen24h: false, amenities: ['Office', 'Parking', 'Security'],
    connectors: [
      createConnector('n24-c1', 'nairobi-24', 'CCS2', 50, 0.35),
      createConnector('n24-c2', 'nairobi-24', 'TYPE2', 22, 0.25),
    ], distance: 3.8
  },
  {
    id: 'nairobi-25', name: 'Atlas Auto, Thika Road', address: 'Thika Road', city: 'Nairobi', county: 'Nairobi',
    latitude: -1.2450, longitude: 36.8600, status: 'AVAILABLE' as const, description: null, rating: 4.2, reviewCount: 45,
    imageUrl: null, isOpen24h: true, amenities: ['Service Center', 'Parking', 'Waiting Lounge'],
    connectors: [
      createConnector('n25-c1', 'nairobi-25', 'TYPE2', 22, 0.25),
      createConnector('n25-c2', 'nairobi-25', 'CCS2', 60, 0.32),
    ], distance: 6.5
  },
  {
    id: 'nairobi-26', name: 'Strathmore University, Madaraka', address: 'Madaraka', city: 'Nairobi', county: 'Nairobi',
    latitude: -1.3100, longitude: 36.8100, status: 'AVAILABLE' as const, description: null, rating: 4.4, reviewCount: 89,
    imageUrl: null, isOpen24h: false, amenities: ['University', 'Parking', 'Security'],
    connectors: [createConnector('n26-c1', 'nairobi-26', 'TYPE2', 22, 0.22)], distance: 4.2
  },
  {
    id: 'nairobi-27', name: 'BasiGo Depot, Riruta', address: 'Riruta', city: 'Nairobi', county: 'Nairobi',
    latitude: -1.2950, longitude: 36.7500, status: 'AVAILABLE' as const, description: null, rating: 4.3, reviewCount: 34,
    imageUrl: null, isOpen24h: true, amenities: ['Parking', 'Fleet Services'],
    connectors: [createConnector('n27-c1', 'nairobi-27', 'CCS2', 60, 0.32)], distance: 5.5
  },
  {
    id: 'nairobi-28', name: 'BasiGo Depot, Komarock', address: 'Komarock', city: 'Nairobi', county: 'Nairobi',
    latitude: -1.2800, longitude: 36.9100, status: 'AVAILABLE' as const, description: null, rating: 4.2, reviewCount: 28,
    imageUrl: null, isOpen24h: true, amenities: ['Parking', 'Fleet Services'],
    connectors: [createConnector('n28-c1', 'nairobi-28', 'CCS2', 60, 0.32)], distance: 12.5
  },
  {
    id: 'nairobi-29', name: 'BasiGo Depot, Taj Mall Pipeline', address: 'Pipeline', city: 'Nairobi', county: 'Nairobi',
    latitude: -1.3150, longitude: 36.8700, status: 'AVAILABLE' as const, description: null, rating: 4.1, reviewCount: 23,
    imageUrl: null, isOpen24h: true, amenities: ['Parking', 'Fleet Services'],
    connectors: [createConnector('n29-c1', 'nairobi-29', 'CCS2', 60, 0.32)], distance: 8.8
  },
  {
    id: 'nairobi-30', name: 'BasiGo Station, Mountain View', address: 'Waiyaki Way', city: 'Nairobi', county: 'Nairobi',
    latitude: -1.2580, longitude: 36.7650, status: 'AVAILABLE' as const, description: null, rating: 4.4, reviewCount: 45,
    imageUrl: null, isOpen24h: true, amenities: ['Parking', 'Fleet Services'],
    connectors: [createConnector('n30-c1', 'nairobi-30', 'CCS2', 50, 0.35)], distance: 4.2
  },

  // ===== KIAMBU COUNTY =====
  {
    id: 'kiambu-1', name: 'Kamakis Corner Square, Ruiru', address: 'Ruiru', city: 'Ruiru', county: 'Kiambu',
    latitude: -1.1500, longitude: 36.9500, status: 'AVAILABLE' as const, description: null, rating: 4.3, reviewCount: 56,
    imageUrl: null, isOpen24h: true, amenities: ['Restaurant', 'Parking', 'Security'],
    connectors: [
      createConnector('k1-c1', 'kiambu-1', 'CCS2', 30, 0.30),
      createConnector('k1-c2', 'kiambu-1', 'CHADEMO', 30, 0.30),
      createConnector('k1-c3', 'kiambu-1', 'TYPE2', 22, 0.25),
    ], distance: 25.5
  },
  {
    id: 'kiambu-2', name: 'BasiGo Station, Kikuyu', address: 'Kikuyu', city: 'Kikuyu', county: 'Kiambu',
    latitude: -1.2500, longitude: 36.6700, status: 'AVAILABLE' as const, description: null, rating: 4.2, reviewCount: 34,
    imageUrl: null, isOpen24h: true, amenities: ['Parking', 'Fleet Services'],
    connectors: [createConnector('k2-c1', 'kiambu-2', 'CCS2', 50, 0.32)], distance: 18.5
  },
  {
    id: 'kiambu-3', name: 'BasiGo Station, Thika', address: 'Thika', city: 'Thika', county: 'Kiambu',
    latitude: -1.0500, longitude: 37.0800, status: 'AVAILABLE' as const, description: null, rating: 4.1, reviewCount: 28,
    imageUrl: null, isOpen24h: true, amenities: ['Parking', 'Fleet Services'],
    connectors: [createConnector('k3-c1', 'kiambu-3', 'CCS2', 50, 0.32)], distance: 42.5
  },
  {
    id: 'kiambu-4', name: 'Trinity Energy, Banana', address: 'Banana', city: 'Banana', county: 'Kiambu',
    latitude: -1.2000, longitude: 36.7200, status: 'AVAILABLE' as const, description: null, rating: 4.0, reviewCount: 18,
    imageUrl: null, isOpen24h: false, amenities: ['Fuel Station', 'Parking'],
    connectors: [createConnector('k4-c1', 'kiambu-4', 'TYPE2', 22, 0.25)], distance: 15.8
  },
  {
    id: 'kiambu-5', name: 'Thindigua, Kiambu Road', address: 'Kiambu Road', city: 'Kiambu', county: 'Kiambu',
    latitude: -1.2200, longitude: 36.8300, status: 'AVAILABLE' as const, description: null, rating: 4.4, reviewCount: 67,
    imageUrl: null, isOpen24h: true, amenities: ['Shopping', 'Parking', 'Restaurant'],
    connectors: [
      createConnector('k5-c1', 'kiambu-5', 'TYPE2', 22, 0.25),
      createConnector('k5-c2', 'kiambu-5', 'CCS2', 60, 0.32),
    ], distance: 10.5
  },
  {
    id: 'kiambu-6', name: 'BasiGo Station, Magana Flowers', address: 'Rungiri', city: 'Rungiri', county: 'Kiambu',
    latitude: -1.1800, longitude: 36.7800, status: 'AVAILABLE' as const, description: null, rating: 4.2, reviewCount: 23,
    imageUrl: null, isOpen24h: true, amenities: ['Parking', 'Fleet Services'],
    connectors: [createConnector('k6-c1', 'kiambu-6', 'CCS2', 50, 0.32)], distance: 22.5
  },
  {
    id: 'kiambu-7', name: 'Mkeka wa Mbao, Gitaru', address: 'Gitaru', city: 'Gitaru', county: 'Kiambu',
    latitude: -1.2300, longitude: 36.7000, status: 'AVAILABLE' as const, description: null, rating: 4.0, reviewCount: 15,
    imageUrl: null, isOpen24h: false, amenities: ['Parking', 'Restaurant'],
    connectors: [createConnector('k7-c1', 'kiambu-7', 'TYPE2', 22, 0.25)], distance: 16.2
  },

  // ===== NAKURU COUNTY =====
  {
    id: 'nakuru-1', name: 'Nakuwell, White House', address: 'Nakuru', city: 'Nakuru', county: 'Nakuru',
    latitude: -0.2800, longitude: 36.0700, status: 'AVAILABLE' as const, description: null, rating: 4.3, reviewCount: 45,
    imageUrl: null, isOpen24h: true, amenities: ['Parking', 'Security'],
    connectors: [createConnector('nk1-c1', 'nakuru-1', 'CCS2', 60, 0.30)], distance: 160.5
  },
  {
    id: 'nakuru-2', name: 'Buffalo Mall, Naivasha', address: 'Naivasha', city: 'Naivasha', county: 'Nakuru',
    latitude: -0.7200, longitude: 36.4300, status: 'AVAILABLE' as const, description: null, rating: 4.5, reviewCount: 89,
    imageUrl: null, isOpen24h: true, amenities: ['Shopping', 'Restaurant', 'Parking', 'WiFi'],
    connectors: [createConnector('nk2-c1', 'nakuru-2', 'TYPE2', 22, 0.25)], distance: 90.5
  },
  {
    id: 'nakuru-3', name: 'Safari Mall, Naivasha', address: 'Naivasha', city: 'Naivasha', county: 'Nakuru',
    latitude: -0.7150, longitude: 36.4250, status: 'AVAILABLE' as const, description: null, rating: 4.2, reviewCount: 45,
    imageUrl: null, isOpen24h: true, amenities: ['Shopping', 'Parking'],
    connectors: [createConnector('nk3-c1', 'nakuru-3', 'TYPE2', 22, 0.25)], distance: 91.2
  },
  {
    id: 'nakuru-4', name: 'Westside Mall, Nakuru', address: 'Nakuru', city: 'Nakuru', county: 'Nakuru',
    latitude: -0.2850, longitude: 36.0650, status: 'AVAILABLE' as const, description: null, rating: 4.4, reviewCount: 67,
    imageUrl: null, isOpen24h: true, amenities: ['Shopping', 'Food Court', 'Parking', 'Cinema'],
    connectors: [createConnector('nk4-c1', 'nakuru-4', 'TYPE2', 22, 0.25)], distance: 162.5
  },
  {
    id: 'nakuru-5', name: 'Hillcourt Resort, Nakuru', address: 'Nakuru', city: 'Nakuru', county: 'Nakuru',
    latitude: -0.2900, longitude: 36.0800, status: 'AVAILABLE' as const, description: null, rating: 4.6, reviewCount: 78,
    imageUrl: null, isOpen24h: true, amenities: ['Hotel', 'Restaurant', 'Pool', 'Parking'],
    connectors: [
      createConnector('nk5-c1', 'nakuru-5', 'CCS2', 60, 0.32),
      createConnector('nk5-c2', 'nakuru-5', 'CHADEMO', 60, 0.32),
    ], distance: 161.8
  },
  {
    id: 'nakuru-6', name: 'Crescent Lodge, Naivasha', address: 'Naivasha', city: 'Naivasha', county: 'Nakuru',
    latitude: -0.7100, longitude: 36.4100, status: 'AVAILABLE' as const, description: null, rating: 4.3, reviewCount: 34,
    imageUrl: null, isOpen24h: false, amenities: ['Hotel', 'Restaurant', 'Parking'],
    connectors: [createConnector('nk6-c1', 'nakuru-6', 'TYPE2', 7, 0.22)], distance: 92.5
  },
  {
    id: 'nakuru-7', name: 'Kwa Amos, Kinamba', address: 'Kinamba', city: 'Kinamba', county: 'Nakuru',
    latitude: -0.1000, longitude: 36.0500, status: 'AVAILABLE' as const, description: null, rating: 4.0, reviewCount: 12,
    imageUrl: null, isOpen24h: false, amenities: ['Parking'],
    connectors: [createConnector('nk7-c1', 'nakuru-7', 'TYPE2', 7, 0.22)], distance: 180.5
  },
  {
    id: 'nakuru-8', name: 'Kwa Amos, Karai', address: 'Karai', city: 'Karai', county: 'Nakuru',
    latitude: -0.6500, longitude: 36.3500, status: 'AVAILABLE' as const, description: null, rating: 4.1, reviewCount: 15,
    imageUrl: null, isOpen24h: false, amenities: ['Parking'],
    connectors: [createConnector('nk8-c1', 'nakuru-8', 'TYPE2', 22, 0.25)], distance: 110.5
  },
  {
    id: 'nakuru-9', name: 'Kwa Amos, Mirera', address: 'Mirera', city: 'Mirera', county: 'Nakuru',
    latitude: -0.6800, longitude: 36.3800, status: 'AVAILABLE' as const, description: null, rating: 4.0, reviewCount: 11,
    imageUrl: null, isOpen24h: false, amenities: ['Parking'],
    connectors: [createConnector('nk9-c1', 'nakuru-9', 'TYPE2', 22, 0.25)], distance: 108.5
  },

  // ===== KISUMU COUNTY =====
  {
    id: 'kisumu-1', name: 'Mega City Mall, Kisumu', address: 'Kisumu', city: 'Kisumu', county: 'Kisumu',
    latitude: -0.1020, longitude: 34.7500, status: 'AVAILABLE' as const, description: null, rating: 4.5, reviewCount: 89,
    imageUrl: null, isOpen24h: true, amenities: ['Shopping', 'Food Court', 'Parking', 'Cinema'],
    connectors: [createConnector('ks1-c1', 'kisumu-1', 'TYPE2', 22, 0.25)], distance: 350.5
  },

  // ===== MOMBASA COUNTY =====
  {
    id: 'mombasa-1', name: 'City Mall, Nyali', address: 'Nyali, Mombasa', city: 'Mombasa', county: 'Mombasa',
    latitude: -4.0500, longitude: 39.7200, status: 'AVAILABLE' as const, description: null, rating: 4.6, reviewCount: 156,
    imageUrl: null, isOpen24h: true, amenities: ['Shopping', 'Beach Access', 'Restaurant', 'Parking'],
    connectors: [createConnector('mb1-c1', 'mombasa-1', 'TYPE2', 22, 0.25)], distance: 480.5
  },

  // ===== LAIKIPIA COUNTY =====
  {
    id: 'laikipia-1', name: 'Sportsman Arms, Nanyuki', address: 'Baraburitto, Nanyuki', city: 'Nanyuki', county: 'Laikipia',
    latitude: 0.0200, longitude: 37.0700, status: 'AVAILABLE' as const, description: null, rating: 4.4, reviewCount: 45,
    imageUrl: null, isOpen24h: false, amenities: ['Hotel', 'Restaurant', 'Parking'],
    connectors: [createConnector('lp1-c1', 'laikipia-1', 'TYPE2', 22, 0.25)], distance: 195.5
  },
  {
    id: 'laikipia-2', name: 'K Energy, Nyahururu', address: 'Nyahururu', city: 'Nyahururu', county: 'Laikipia',
    latitude: 0.0400, longitude: 36.3600, status: 'AVAILABLE' as const, description: null, rating: 4.2, reviewCount: 28,
    imageUrl: null, isOpen24h: false, amenities: ['Fuel Station', 'Parking'],
    connectors: [createConnector('lp2-c1', 'laikipia-2', 'TYPE2', 22, 0.25)], distance: 185.5
  },
  {
    id: 'laikipia-3', name: 'GMax Motors, Nanyuki', address: 'Nanyuki', city: 'Nanyuki', county: 'Laikipia',
    latitude: 0.0150, longitude: 37.0750, status: 'AVAILABLE' as const, description: null, rating: 4.3, reviewCount: 34,
    imageUrl: null, isOpen24h: false, amenities: ['Service Center', 'Parking'],
    connectors: [createConnector('lp3-c1', 'laikipia-3', 'TYPE2', 22, 0.25)], distance: 196.5
  },
  {
    id: 'laikipia-4', name: '4NTE Stage, Nyahururu', address: 'Nyahururu', city: 'Nyahururu', county: 'Laikipia',
    latitude: 0.0420, longitude: 36.3650, status: 'AVAILABLE' as const, description: null, rating: 4.0, reviewCount: 18,
    imageUrl: null, isOpen24h: false, amenities: ['Parking'],
    connectors: [createConnector('lp4-c1', 'laikipia-4', 'CCS2', 50, 0.32)], distance: 186.5
  },

  // ===== MACHAKOS COUNTY =====
  {
    id: 'machakos-1', name: 'Green Park, Athi River', address: 'Athi River', city: 'Athi River', county: 'Machakos',
    latitude: -1.4500, longitude: 36.9800, status: 'AVAILABLE' as const, description: null, rating: 4.3, reviewCount: 56,
    imageUrl: null, isOpen24h: true, amenities: ['Shopping', 'Parking', 'Restaurant'],
    connectors: [createConnector('mc1-c1', 'machakos-1', 'TYPE2', 22, 0.25)], distance: 22.5
  },
  {
    id: 'machakos-2', name: 'Petrocity, Mavoko', address: 'Mavoko', city: 'Mavoko', county: 'Machakos',
    latitude: -1.4200, longitude: 36.9500, status: 'AVAILABLE' as const, description: null, rating: 4.1, reviewCount: 23,
    imageUrl: null, isOpen24h: true, amenities: ['Fuel Station', 'Convenience Store', 'Parking'],
    connectors: [createConnector('mc2-c1', 'machakos-2', 'TYPE2', 22, 0.25)], distance: 25.5
  },
  {
    id: 'machakos-3', name: 'Petrocam, Machakos', address: 'Machakos', city: 'Machakos', county: 'Machakos',
    latitude: -1.5200, longitude: 37.2600, status: 'AVAILABLE' as const, description: null, rating: 4.2, reviewCount: 34,
    imageUrl: null, isOpen24h: true, amenities: ['Fuel Station', 'Parking'],
    connectors: [
      createConnector('mc3-c1', 'machakos-3', 'CCS2', 40, 0.30),
      createConnector('mc3-c2', 'machakos-3', 'CHADEMO', 40, 0.30),
    ], distance: 65.5
  },
  {
    id: 'machakos-4', name: 'Bellways Business Park, Syokimau', address: 'Syokimau', city: 'Syokimau', county: 'Machakos',
    latitude: -1.3800, longitude: 36.9200, status: 'AVAILABLE' as const, description: null, rating: 4.3, reviewCount: 45,
    imageUrl: null, isOpen24h: false, amenities: ['Office', 'Parking', 'Security'],
    connectors: [createConnector('mc4-c1', 'machakos-4', 'TYPE2', 22, 0.25)], distance: 18.5
  },
  {
    id: 'machakos-5', name: 'KAIST, Konza City', address: 'Konza', city: 'Konza', county: 'Machakos',
    latitude: -1.6500, longitude: 37.0000, status: 'AVAILABLE' as const, description: null, rating: 4.5, reviewCount: 28,
    imageUrl: null, isOpen24h: false, amenities: ['University', 'Parking', 'Security'],
    connectors: [createConnector('mc5-c1', 'machakos-5', 'TYPE2', 11, 0.22)], distance: 60.5
  },
  {
    id: 'machakos-6', name: 'Sabaki Green Estate', address: 'Behind Signature Mall', city: 'Athi River', county: 'Machakos',
    latitude: -1.4100, longitude: 36.9600, status: 'AVAILABLE' as const, description: null, rating: 4.4, reviewCount: 34,
    imageUrl: null, isOpen24h: true, amenities: ['Parking', 'Security'],
    connectors: [createConnector('mc6-c1', 'machakos-6', 'CCS2', 80, 0.32)], distance: 20.5
  },
  {
    id: 'machakos-7', name: 'BasiGo Station, Shell Athi River', address: 'Athi River', city: 'Athi River', county: 'Machakos',
    latitude: -1.4400, longitude: 36.9900, status: 'AVAILABLE' as const, description: null, rating: 4.3, reviewCount: 45,
    imageUrl: null, isOpen24h: true, amenities: ['Fuel Station', 'Parking', 'Fleet Services'],
    connectors: [createConnector('mc7-c1', 'machakos-7', 'CCS2', 50, 0.32)], distance: 24.5
  },

  // ===== NAROK COUNTY =====
  {
    id: 'narok-1', name: 'Dallas Lounge, Narok Town', address: 'Narok Town', city: 'Narok', county: 'Narok',
    latitude: -1.0800, longitude: 35.8700, status: 'AVAILABLE' as const, description: null, rating: 4.2, reviewCount: 34,
    imageUrl: null, isOpen24h: true, amenities: ['Restaurant', 'Parking', 'Lounge'],
    connectors: [
      createConnector('nr1-c1', 'narok-1', 'TYPE2', 22, 0.25),
      createConnector('nr1-c2', 'narok-1', 'CCS2', 60, 0.32),
    ], distance: 145.5
  },
  {
    id: 'narok-2', name: 'Super Duka Choma Tayari', address: 'Narok', city: 'Narok', county: 'Narok',
    latitude: -1.0850, longitude: 35.8750, status: 'AVAILABLE' as const, description: null, rating: 4.0, reviewCount: 23,
    imageUrl: null, isOpen24h: true, amenities: ['Restaurant', 'Parking'],
    connectors: [createConnector('nr2-c1', 'narok-2', 'CCS2', 60, 0.30)], distance: 146.5
  },

  // ===== KISII COUNTY =====
  {
    id: 'kisii-1', name: 'Kisii Town, Daraja Mbili', address: 'Kisii', city: 'Kisii', county: 'Kisii',
    latitude: -0.6800, longitude: 34.7700, status: 'AVAILABLE' as const, description: null, rating: 4.3, reviewCount: 45,
    imageUrl: null, isOpen24h: true, amenities: ['Parking', 'Security'],
    connectors: [createConnector('kg1-c1', 'kisii-1', 'CCS2', 80, 0.30)], distance: 310.5
  },
  {
    id: 'kisii-2', name: 'Ogembo', address: 'Ogembo', city: 'Ogembo', county: 'Kisii',
    latitude: -0.7800, longitude: 34.8500, status: 'AVAILABLE' as const, description: null, rating: 4.0, reviewCount: 15,
    imageUrl: null, isOpen24h: false, amenities: ['Parking'],
    connectors: [createConnector('kg2-c1', 'kisii-2', 'TYPE2', 7, 0.22)], distance: 325.5
  },

  // ===== NYERI COUNTY =====
  {
    id: 'nyeri-1', name: 'Nyeri National Polytechnic', address: 'Nyeri', city: 'Nyeri', county: 'Nyeri',
    latitude: -0.4200, longitude: 37.0400, status: 'AVAILABLE' as const, description: null, rating: 4.4, reviewCount: 45,
    imageUrl: null, isOpen24h: false, amenities: ['University', 'Parking', 'Security'],
    connectors: [createConnector('ny1-c1', 'nyeri-1', 'TYPE2', 7.4, 0.22)], distance: 155.5
  },

  // ===== UASIN GISHU COUNTY =====
  {
    id: 'eldoret-1', name: 'Eldoret National Polytechnic', address: 'Eldoret', city: 'Eldoret', county: 'Uasin Gishu',
    latitude: 0.5200, longitude: 35.2700, status: 'AVAILABLE' as const, description: null, rating: 4.3, reviewCount: 56,
    imageUrl: null, isOpen24h: false, amenities: ['University', 'Parking', 'Security'],
    connectors: [createConnector('el1-c1', 'eldoret-1', 'TYPE2', 22, 0.25)], distance: 310.5
  },
];

export const mockUsers: User[] = [
  {
    id: 'user-1',
    email: 'john.doe@email.com',
    name: 'John Doe',
    role: 'DRIVER',
    avatar: null,
    phone: '+254 712 345 678',
    createdAt: new Date('2024-01-15')
  },
  {
    id: 'user-2',
    email: 'admin@safaricharge.com',
    name: 'Admin User',
    role: 'ADMIN',
    avatar: null,
    phone: '+254 720 000 000',
    createdAt: new Date('2023-06-01')
  },
  {
    id: 'user-3',
    email: 'fleet@logistics.com',
    name: 'Fleet Manager',
    role: 'FLEET_MANAGER',
    avatar: null,
    phone: '+254 733 222 111',
    createdAt: new Date('2024-03-20')
  }
];

export const mockSessions: ChargingSession[] = [
  {
    id: 'session-1',
    userId: 'user-1',
    stationId: 'nairobi-6',
    connectorId: 'n6-c1',
    status: 'COMPLETED',
    startTime: new Date('2024-12-01T10:30:00'),
    endTime: new Date('2024-12-01T11:45:00'),
    energyDelivered: 45.5,
    cost: 11.38,
    station: mockStations[5],
    connector: mockStations[5].connectors[0]
  },
  {
    id: 'session-2',
    userId: 'user-1',
    stationId: 'nairobi-13',
    connectorId: 'n13-c1',
    status: 'COMPLETED',
    startTime: new Date('2024-11-28T14:00:00'),
    endTime: new Date('2024-11-28T15:30:00'),
    energyDelivered: 38.2,
    cost: 9.55,
    station: mockStations[12],
    connector: mockStations[12].connectors[0]
  },
  {
    id: 'session-3',
    userId: 'user-1',
    stationId: 'nairobi-2',
    connectorId: 'n2-c2',
    status: 'COMPLETED',
    startTime: new Date('2024-11-20T09:00:00'),
    endTime: new Date('2024-11-20T10:15:00'),
    energyDelivered: 55.8,
    cost: 19.53,
    station: mockStations[1],
    connector: mockStations[1].connectors[1]
  }
];

export const mockAIInsights: AIInsight[] = [
  {
    id: 'insight-1',
    type: 'prediction',
    title: 'High Demand Expected',
    description: 'Sarit Centre station is predicted to experience 85% utilization between 5-7 PM today. Consider dynamic pricing or redirecting users.',
    severity: 'medium',
    actionable: true,
    createdAt: new Date()
  },
  {
    id: 'insight-2',
    type: 'alert',
    title: 'Maintenance Required',
    description: 'CHAdeMO connector at JKIA Station shows degraded performance. Health score: 72%. Schedule maintenance within 2 weeks.',
    severity: 'high',
    actionable: true,
    createdAt: new Date()
  },
  {
    id: 'insight-3',
    type: 'recommendation',
    title: 'Optimal Charging Window',
    description: 'Based on historical data, the best time to charge at Two Rivers Mall is between 2-4 PM with average wait times under 5 minutes.',
    severity: 'low',
    actionable: false,
    createdAt: new Date()
  },
  {
    id: 'insight-4',
    type: 'prediction',
    title: 'Energy Optimization',
    description: 'Shifting 15% of charging load to off-peak hours could save $2,400 monthly across the network.',
    severity: 'medium',
    actionable: true,
    createdAt: new Date()
  }
];

export const mockStationAnalytics: StationAnalytics = {
  stationId: 'nairobi-6',
  peakHours: [
    { hour: 6, utilization: 25 },
    { hour: 7, utilization: 45 },
    { hour: 8, utilization: 72 },
    { hour: 9, utilization: 65 },
    { hour: 10, utilization: 55 },
    { hour: 11, utilization: 48 },
    { hour: 12, utilization: 52 },
    { hour: 13, utilization: 58 },
    { hour: 14, utilization: 62 },
    { hour: 15, utilization: 70 },
    { hour: 16, utilization: 78 },
    { hour: 17, utilization: 85 },
    { hour: 18, utilization: 80 },
    { hour: 19, utilization: 65 },
    { hour: 20, utilization: 45 },
    { hour: 21, utilization: 30 },
    { hour: 22, utilization: 20 },
  ],
  dailyUsage: Array.from({ length: 30 }, (_, i) => ({
    timestamp: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000),
    value: Math.floor(Math.random() * 200) + 150
  })),
  revenue: Array.from({ length: 30 }, (_, i) => ({
    timestamp: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000),
    value: Math.floor(Math.random() * 500) + 300
  })),
  maintenancePredictions: [
    { component: 'CCS2 Connector #1', healthScore: 94, nextMaintenance: new Date('2025-03-15') },
    { component: 'CCS2 Connector #2', healthScore: 88, nextMaintenance: new Date('2025-02-20') },
    { component: 'CHAdeMO Connector', healthScore: 91, nextMaintenance: new Date('2025-03-01') },
    { component: 'Type 2 Connector', healthScore: 96, nextMaintenance: new Date('2025-04-10') },
    { component: 'Power Unit', healthScore: 85, nextMaintenance: new Date('2025-01-30') },
  ]
};

// County statistics
export const countyStats = [
  { county: 'Nairobi', stations: 30, color: 'from-emerald-500 to-emerald-600' },
  { county: 'Kiambu', stations: 7, color: 'from-cyan-500 to-cyan-600' },
  { county: 'Nakuru', stations: 9, color: 'from-blue-500 to-blue-600' },
  { county: 'Machakos', stations: 7, color: 'from-amber-500 to-amber-600' },
  { county: 'Laikipia', stations: 4, color: 'from-purple-500 to-purple-600' },
  { county: 'Narok', stations: 2, color: 'from-rose-500 to-rose-600' },
  { county: 'Kisumu', stations: 1, color: 'from-teal-500 to-teal-600' },
  { county: 'Mombasa', stations: 1, color: 'from-orange-500 to-orange-600' },
  { county: 'Kisii', stations: 2, color: 'from-lime-500 to-lime-600' },
  { county: 'Nyeri', stations: 1, color: 'from-indigo-500 to-indigo-600' },
  { county: 'Uasin Gishu', stations: 1, color: 'from-pink-500 to-pink-600' },
];

// Network stats
export const networkStats = {
  totalStations: 65,
  totalConnectors: 254,
  counties: 11,
  uptime: 98.5,
};
