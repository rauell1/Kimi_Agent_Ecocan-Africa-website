'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  Users,
  Car,
  Battery,
  MapPin,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Zap,
  Clock,
  Navigation,
  Fuel,
  Truck,
  Bike,
  Bus,
  Package,
  Building2,
  User,
  Edit,
  Trash2,
  TrendingUp,
  Activity,
  Gauge,
  Calendar,
  DollarSign
} from 'lucide-react';

interface FleetManagementProps {
  user: {
    id: string;
    name?: string | null;
    email: string;
    role: string;
  } | null;
}

interface Fleet {
  id: string;
  name: string;
  description?: string | null;
  category: string;
  ownerId: string;
  contactEmail?: string | null;
  contactPhone?: string | null;
  address?: string | null;
  city?: string | null;
  totalVehicles: number;
  totalEnergy: number;
  totalDistance: number;
  createdAt: string;
  owner: {
    id: string;
    name?: string | null;
    email: string;
    phone?: string | null;
  };
  _count?: { vehicles: number };
}

interface Vehicle {
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
  status: string;
  assignedDriver?: string | null;
  createdAt: string;
  _count?: { chargingSessions: number };
}

const categoryIcons: Record<string, React.ElementType> = {
  TAXI: Car,
  DELIVERY: Package,
  CORPORATE: Building2,
  PUBLIC_TRANSPORT: Bus,
  RENTAL: Car,
  PERSONAL: User,
  OTHER: Truck,
};

const categoryColors: Record<string, string> = {
  TAXI: 'bg-yellow-500',
  DELIVERY: 'bg-orange-500',
  CORPORATE: 'bg-purple-500',
  PUBLIC_TRANSPORT: 'bg-blue-500',
  RENTAL: 'bg-green-500',
  PERSONAL: 'bg-pink-500',
  OTHER: 'bg-gray-500',
};

export function FleetManagement({ user }: FleetManagementProps) {
  const [fleets, setFleets] = useState<Fleet[]>([]);
  const [selectedFleet, setSelectedFleet] = useState<Fleet | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [stats, setStats] = useState({
    totalFleets: 0,
    totalVehicles: 0,
    totalEnergy: 0,
    totalDistance: 0,
    categoryCounts: [] as { category: string; _count: { id: number } }[]
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [showCreateFleet, setShowCreateFleet] = useState(false);
  const [isCreatingFleet, setIsCreatingFleet] = useState(false);
  
  // New vehicle form
  const [newVehicle, setNewVehicle] = useState({
    plateNumber: '',
    make: '',
    model: '',
    year: '',
    color: '',
    batteryCapacity: '',
    maxRange: '',
    assignedDriver: ''
  });
  
  // New fleet form
  const [newFleet, setNewFleet] = useState({
    name: '',
    description: '',
    category: 'PERSONAL',
    contactEmail: '',
    contactPhone: '',
    address: '',
    city: ''
  });

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'EMPLOYEE';
  const isFleetManager = user?.role === 'FLEET_MANAGER';

  // Fetch fleets
  const fetchFleets = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/fleet');
      const responseData = await response.json();
      
      if (response.ok) {
        setFleets(responseData.fleets || []);
        setStats(responseData.stats || stats);
      } else {
        toast.error('Failed to load fleets');
      }
    } catch (error) {
      console.error('Error fetching fleets:', error);
      toast.error('Failed to load fleets');
    } finally {
      setLoading(false);
    }
  };

  // Fetch vehicles for selected fleet
  const fetchVehicles = async (fleetId: string) => {
    try {
      const response = await fetch(`/api/fleet/vehicles?fleetId=${fleetId}`);
      const responseData = await response.json();
      
      if (response.ok) {
        setVehicles(responseData.vehicles || []);
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    }
  };

  useEffect(() => {
    fetchFleets();
  }, [user?.id, user?.role]);

  useEffect(() => {
    if (selectedFleet) {
      fetchVehicles(selectedFleet.id);
    }
  }, [selectedFleet]);

  // Create fleet
  const handleCreateFleet = async () => {
    if (!newFleet.name) {
      toast.error('Fleet name is required');
      return;
    }

    if (!user?.id) {
      toast.error('Please log in to create a fleet');
      return;
    }

    setIsCreatingFleet(true);

    try {
      const response = await fetch('/api/fleet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newFleet,
          ownerId: user.id
        })
      });

      const responseData = await response.json();

      if (response.ok) {
        toast.success('Fleet created successfully!', {
          description: `${newFleet.name} is now ready for vehicle management.`
        });
        setShowCreateFleet(false);
        setNewFleet({
          name: '',
          description: '',
          category: 'PERSONAL',
          contactEmail: '',
          contactPhone: '',
          address: '',
          city: ''
        });
        fetchFleets();
      } else {
        if (responseData.fleet) {
          // User already has a fleet
          toast.info('You already have a fleet', {
            description: 'Redirecting to your fleet...'
          });
          fetchFleets();
        } else {
          toast.error(responseData.error || 'Failed to create fleet');
        }
      }
    } catch (error) {
      console.error('Error creating fleet:', error);
      toast.error('Failed to create fleet', {
        description: 'Please try again later.'
      });
    } finally {
      setIsCreatingFleet(false);
    }
  };

  // Add vehicle
  const handleAddVehicle = async () => {
    if (!newVehicle.plateNumber || !selectedFleet) {
      toast.error('Plate number is required');
      return;
    }

    try {
      const response = await fetch('/api/fleet/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fleetId: selectedFleet.id,
          plateNumber: newVehicle.plateNumber,
          make: newVehicle.make,
          model: newVehicle.model,
          year: newVehicle.year ? parseInt(newVehicle.year) : null,
          color: newVehicle.color,
          batteryCapacity: newVehicle.batteryCapacity ? parseFloat(newVehicle.batteryCapacity) : null,
          maxRange: newVehicle.maxRange ? parseFloat(newVehicle.maxRange) : null,
          assignedDriver: newVehicle.assignedDriver
        })
      });

      const responseData = await response.json();

      if (response.ok) {
        toast.success('Vehicle added successfully!');
        setShowAddVehicle(false);
        setNewVehicle({
          plateNumber: '',
          make: '',
          model: '',
          year: '',
          color: '',
          batteryCapacity: '',
          maxRange: '',
          assignedDriver: ''
        });
        fetchVehicles(selectedFleet.id);
        fetchFleets();
      } else {
        toast.error(responseData.error || 'Failed to add vehicle');
      }
    } catch (error) {
      toast.error('Failed to add vehicle');
    }
  };

  // Delete vehicle
  const handleDeleteVehicle = async (vehicleId: string) => {
    if (!confirm('Are you sure you want to remove this vehicle?')) return;

    try {
      const response = await fetch(`/api/fleet/vehicles?vehicleId=${vehicleId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Vehicle removed');
        fetchVehicles(selectedFleet!.id);
        fetchFleets();
      }
    } catch (error) {
      toast.error('Failed to remove vehicle');
    }
  };

  // Filter fleets
  const filteredFleets = fleets.filter(fleet => {
    const matchesSearch = fleet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fleet.owner?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fleet.owner?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || fleet.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#235347] border-t-transparent" />
      </div>
    );
  }

  // Fleet Manager without a fleet - show onboarding
  if (isFleetManager && fleets.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        <Card className="border-0 shadow-xl bg-white">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-[#5483B3] to-[#235347] flex items-center justify-center mb-4">
              <Truck className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Welcome to Fleet Management</CardTitle>
            <CardDescription>
              Create your fleet to start managing your electric vehicles
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Fleet Name *</Label>
              <Input
                placeholder="e.g., City Taxi EV Fleet"
                value={newFleet.name}
                onChange={(e) => setNewFleet({ ...newFleet, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                placeholder="Brief description of your fleet"
                value={newFleet.description}
                onChange={(e) => setNewFleet({ ...newFleet, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Fleet Category</Label>
              <Select value={newFleet.category} onValueChange={(v) => setNewFleet({ ...newFleet, category: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TAXI">🚕 Taxi / Ride-hailing</SelectItem>
                  <SelectItem value="DELIVERY">📦 Delivery Services</SelectItem>
                  <SelectItem value="CORPORATE">🏢 Corporate Fleet</SelectItem>
                  <SelectItem value="PUBLIC_TRANSPORT">🚌 Public Transport</SelectItem>
                  <SelectItem value="RENTAL">🚗 Car Rental</SelectItem>
                  <SelectItem value="PERSONAL">👤 Personal Vehicles</SelectItem>
                  <SelectItem value="OTHER">🚚 Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Contact Email</Label>
                <Input
                  type="email"
                  placeholder="fleet@company.com"
                  value={newFleet.contactEmail}
                  onChange={(e) => setNewFleet({ ...newFleet, contactEmail: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Contact Phone</Label>
                <Input
                  placeholder="+254 700 000 000"
                  value={newFleet.contactPhone}
                  onChange={(e) => setNewFleet({ ...newFleet, contactPhone: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>City</Label>
              <Input
                placeholder="Nairobi"
                value={newFleet.city}
                onChange={(e) => setNewFleet({ ...newFleet, city: e.target.value })}
              />
            </div>
            <Button
              className="w-full bg-gradient-to-r from-[#235347] to-[#163832] hover:from-[#163832] hover:to-[#0B2B26] text-white h-12"
              onClick={handleCreateFleet}
              disabled={isCreatingFleet || !newFleet.name}
            >
              {isCreatingFleet ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  Creating Fleet...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create My Fleet
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#5483B3] to-[#235347] shadow-lg">
              <Truck className="h-6 w-6 text-white" />
            </div>
            Fleet Management
          </h1>
          <p className="text-gray-500 mt-1">
            {isAdmin ? 'Overview of all registered fleets' : 'Manage your electric vehicle fleet'}
          </p>
        </div>
        
        {isFleetManager && fleets.length > 0 && (
          <Button
            onClick={() => setShowAddVehicle(true)}
            className="bg-gradient-to-r from-[#235347] to-[#163832] text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Vehicle
          </Button>
        )}
      </div>

      {/* Stats Grid - Admin/Employee View */}
      {isAdmin && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Fleets', value: stats.totalFleets, icon: Truck, color: 'bg-[#235347]' },
            { label: 'Total Vehicles', value: stats.totalVehicles, icon: Car, color: 'bg-[#5483B3]' },
            { label: 'Energy Used', value: `${(stats.totalEnergy / 1000).toFixed(1)} MWh`, icon: Zap, color: 'bg-[#8EB69B]' },
            { label: 'Distance', value: `${(stats.totalDistance / 1000).toFixed(1)}k km`, icon: Navigation, color: 'bg-[#052659]' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="border-0 shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${stat.color}`}>
                      <stat.icon className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      <p className="text-xs text-gray-500">{stat.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Fleet Categories - Admin View */}
      {isAdmin && stats.categoryCounts.length > 0 && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Fleet Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {stats.categoryCounts.map((cat) => {
                const Icon = categoryIcons[cat.category] || Truck;
                return (
                  <div key={cat.category} className="flex items-center gap-2 p-3 rounded-lg bg-gray-50">
                    <div className={`p-1.5 rounded ${categoryColors[cat.category] || 'bg-gray-500'}`}>
                      <Icon className="h-3 w-3 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{cat.category.replace('_', ' ')}</p>
                      <p className="text-xs text-gray-500">{cat._count.id} fleets</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search fleets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        {isAdmin && (
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="TAXI">🚕 Taxi</SelectItem>
              <SelectItem value="DELIVERY">📦 Delivery</SelectItem>
              <SelectItem value="CORPORATE">🏢 Corporate</SelectItem>
              <SelectItem value="PUBLIC_TRANSPORT">🚌 Public Transport</SelectItem>
              <SelectItem value="RENTAL">🚗 Rental</SelectItem>
              <SelectItem value="PERSONAL">👤 Personal</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Fleet List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fleets */}
        <div className={selectedFleet ? 'lg:col-span-1' : 'lg:col-span-3'}>
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">
                {isAdmin ? 'All Registered Fleets' : 'My Fleet'}
              </CardTitle>
              <CardDescription>
                {filteredFleets.length} fleet{filteredFleets.length !== 1 ? 's' : ''} found
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {filteredFleets.map((fleet) => {
                  const CategoryIcon = categoryIcons[fleet.category] || Truck;
                  return (
                    <motion.div
                      key={fleet.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        selectedFleet?.id === fleet.id
                          ? 'border-[#5483B3] bg-[#5483B3]/5'
                          : 'border-gray-100 hover:border-[#8EB69B] hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedFleet(fleet)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${categoryColors[fleet.category] || 'bg-gray-500'}`}>
                            <CategoryIcon className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{fleet.name}</p>
                            <p className="text-sm text-gray-500">{fleet.category.replace('_', ' ')}</p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {fleet._count?.vehicles || 0} vehicles
                        </Badge>
                      </div>
                      {isAdmin && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="text-xs text-gray-400">
                            Owner: {fleet.owner?.name || fleet.owner?.email}
                          </p>
                          <p className="text-xs text-gray-400">
                            Joined: {new Date(fleet.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Fleet Details / Vehicles */}
        {selectedFleet && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{selectedFleet.name}</CardTitle>
                    <CardDescription>
                      {selectedFleet.description || 'No description'}
                    </CardDescription>
                  </div>
                  {isFleetManager && (
                    <Button size="sm" onClick={() => setShowAddVehicle(true)}>
                      <Plus className="w-4 h-4 mr-1" />
                      Add Vehicle
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {/* Fleet Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-3 rounded-lg bg-gray-50">
                    <Car className="h-5 w-5 mx-auto mb-1 text-[#235347]" />
                    <p className="text-xl font-bold text-gray-900">{vehicles.length}</p>
                    <p className="text-xs text-gray-500">Vehicles</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-gray-50">
                    <Zap className="h-5 w-5 mx-auto mb-1 text-[#8EB69B]" />
                    <p className="text-xl font-bold text-gray-900">{selectedFleet.totalEnergy.toFixed(0)}</p>
                    <p className="text-xs text-gray-500">kWh Used</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-gray-50">
                    <Navigation className="h-5 w-5 mx-auto mb-1 text-[#5483B3]" />
                    <p className="text-xl font-bold text-gray-900">{selectedFleet.totalDistance.toFixed(0)}</p>
                    <p className="text-xs text-gray-500">km Traveled</p>
                  </div>
                </div>

                {/* Vehicle List */}
                <div className="space-y-3">
                  {vehicles.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <Car className="h-12 w-12 mx-auto mb-2 opacity-30" />
                      <p>No vehicles registered yet</p>
                    </div>
                  ) : (
                    vehicles.map((vehicle) => (
                      <div
                        key={vehicle.id}
                        className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-[#8EB69B]"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-gray-100">
                            <Car className="h-4 w-4 text-gray-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{vehicle.plateNumber}</p>
                            <p className="text-sm text-gray-500">
                              {vehicle.make} {vehicle.model} {vehicle.year}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="flex items-center gap-1">
                              <Battery className="h-3 w-3 text-[#8EB69B]" />
                              <span className="text-sm font-medium">{vehicle.currentBatteryLevel || 0}%</span>
                            </div>
                            <p className="text-xs text-gray-400">
                              {vehicle.odometer?.toFixed(0) || 0} km
                            </p>
                          </div>
                          <Badge className={
                            vehicle.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                            vehicle.status === 'CHARGING' ? 'bg-blue-100 text-blue-700' :
                            vehicle.status === 'MAINTENANCE' ? 'bg-orange-100 text-orange-700' :
                            'bg-gray-100 text-gray-700'
                          }>
                            {vehicle.status}
                          </Badge>
                          {isFleetManager && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500 hover:bg-red-50"
                              onClick={() => handleDeleteVehicle(vehicle.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Add Vehicle Dialog */}
      <Dialog open={showAddVehicle} onOpenChange={setShowAddVehicle}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Vehicle</DialogTitle>
            <DialogDescription>
              Register a new vehicle to your fleet
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Plate Number *</Label>
                <Input
                  placeholder="KAA 123A"
                  value={newVehicle.plateNumber}
                  onChange={(e) => setNewVehicle({ ...newVehicle, plateNumber: e.target.value.toUpperCase() })}
                />
              </div>
              <div className="space-y-2">
                <Label>Year</Label>
                <Input
                  placeholder="2024"
                  type="number"
                  value={newVehicle.year}
                  onChange={(e) => setNewVehicle({ ...newVehicle, year: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Make</Label>
                <Input
                  placeholder="e.g., Nissan"
                  value={newVehicle.make}
                  onChange={(e) => setNewVehicle({ ...newVehicle, make: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Model</Label>
                <Input
                  placeholder="e.g., Leaf"
                  value={newVehicle.model}
                  onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Battery Capacity (kWh)</Label>
                <Input
                  placeholder="e.g., 62"
                  type="number"
                  value={newVehicle.batteryCapacity}
                  onChange={(e) => setNewVehicle({ ...newVehicle, batteryCapacity: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Max Range (km)</Label>
                <Input
                  placeholder="e.g., 385"
                  type="number"
                  value={newVehicle.maxRange}
                  onChange={(e) => setNewVehicle({ ...newVehicle, maxRange: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Assigned Driver</Label>
              <Input
                placeholder="Driver name"
                value={newVehicle.assignedDriver}
                onChange={(e) => setNewVehicle({ ...newVehicle, assignedDriver: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddVehicle(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddVehicle} className="bg-[#235347] hover:bg-[#163832] text-white">
              Add Vehicle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
