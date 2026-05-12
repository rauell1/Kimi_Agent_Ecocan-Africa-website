// User roles
export type UserRole = 'DRIVER' | 'ADMIN' | 'FLEET_MANAGER' | 'EMPLOYEE';

// Station types
export type StationStatus = 'AVAILABLE' | 'OCCUPIED' | 'OFFLINE' | 'MAINTENANCE';
export type ConnectorType = 'CCS2' | 'CHADEMO' | 'TYPE2' | 'TESLA';

// Session types
export type SessionStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

// Subscription types
export type SubscriptionPlan = 'FREE' | 'BASIC' | 'PREMIUM' | 'ENTERPRISE';

// Security levels for employees
export type SecurityLevel = 'BASIC' | 'STANDARD' | 'ELEVATED' | 'MANAGER' | 'SUPERVISOR';

// Fleet categories
export type FleetCategory = 'TAXI' | 'DELIVERY' | 'CORPORATE' | 'PUBLIC_TRANSPORT' | 'RENTAL' | 'PERSONAL' | 'OTHER';

// Fleet vehicle status
export type FleetVehicleStatus = 'ACTIVE' | 'CHARGING' | 'MAINTENANCE' | 'OFFLINE';

// Connector interface
export interface Connector {
  id: string;
  stationId: string;
  type: ConnectorType;
  powerOutput: number; // kW
  currentPrice: number; // price per kWh
  status: StationStatus;
}

// Charging Station interface
export interface ChargingStation {
  id: string;
  name: string;
  description: string | null;
  address: string;
  city: string;
  county?: string;
  latitude: number;
  longitude: number;
  status: StationStatus;
  rating: number;
  reviewCount: number;
  imageUrl: string | null;
  isOpen24h: boolean;
  amenities: string[];
  connectors: Connector[];
  distance?: number; // in km, calculated dynamically
}

// Charging Session interface
export interface ChargingSession {
  id: string;
  userId: string;
  stationId: string;
  connectorId: string;
  status: SessionStatus;
  startTime: Date | string;
  endTime: Date | string | null;
  energyDelivered: number | null;
  cost: number | null;
  station?: ChargingStation;
  connector?: Connector;
}

// User interface
export interface User {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  avatar: string | null;
  phone: string | null;
  createdAt?: Date | string;
}

// Notification interface
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  type: 'info' | 'warning' | 'success';
  createdAt: Date | string;
}

// Analytics types
export interface AnalyticsDataPoint {
  timestamp: Date | string;
  value: number;
  label?: string;
}

export interface StationAnalytics {
  stationId: string;
  peakHours: { hour: number; utilization: number }[];
  dailyUsage: AnalyticsDataPoint[];
  revenue: AnalyticsDataPoint[];
  maintenancePredictions: {
    component: string;
    healthScore: number;
    nextMaintenance: Date | string;
  }[];
}

export interface AIInsight {
  id: string;
  type: 'prediction' | 'alert' | 'recommendation';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  actionable: boolean;
  createdAt: Date | string;
}

// Fleet interfaces
export interface Fleet {
  id: string;
  name: string;
  description?: string | null;
  category: FleetCategory;
  ownerId: string;
  contactEmail?: string | null;
  contactPhone?: string | null;
  address?: string | null;
  city?: string | null;
  totalVehicles: number;
  totalEnergy: number;
  totalDistance: number;
  createdAt: string;
  owner?: {
    id: string;
    name?: string | null;
    email: string;
    phone?: string | null;
  };
  _count?: { vehicles: number };
}

export interface FleetVehicle {
  id: string;
  fleetId: string;
  plateNumber: string;
  make?: string | null;
  model?: string | null;
  year?: number | null;
  color?: string | null;
  batteryCapacity?: number | null;
  maxRange?: number | null;
  currentBatteryLevel?: number | null;
  odometer?: number | null;
  status: FleetVehicleStatus;
  assignedDriver?: string | null;
  createdAt: string;
  _count?: { chargingSessions: number };
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Pagination types
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
