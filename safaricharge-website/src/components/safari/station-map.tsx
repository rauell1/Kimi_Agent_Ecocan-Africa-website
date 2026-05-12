'use client';

import { useState, useMemo, useEffect, useRef, useSyncExternalStore } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { ChargingStation, StationStatus } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { StationCard } from '@/components/safari/station-card';
import { 
  MapPin, 
  Zap, 
  Search, 
  Navigation,
  Clock,
  Star,
  Battery,
  Gauge,
  Plug,
  Activity,
  Loader2,
  Car,
  Route,
  ArrowRight,
  ExternalLink,
  X,
  Home,
  ChevronRight,
  Timer,
  Fuel
} from 'lucide-react';

interface StationMapProps {
  stations: ChargingStation[];
  onStationSelect: (station: ChargingStation) => void;
}

const statusColors: Record<StationStatus, string> = {
  AVAILABLE: 'bg-gradient-to-br from-[#8EB69B] to-[#235347]',
  OCCUPIED: 'bg-gradient-to-br from-amber-400 to-amber-600',
  OFFLINE: 'bg-gradient-to-br from-gray-400 to-gray-600',
  MAINTENANCE: 'bg-gradient-to-br from-red-400 to-red-600',
};

const statusLabels: Record<StationStatus, string> = {
  AVAILABLE: 'Available',
  OCCUPIED: 'Occupied',
  OFFLINE: 'Offline',
  MAINTENANCE: 'Maintenance',
};

// Dynamic import for Leaflet map (SSR disabled)
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);

const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);

const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

const Polyline = dynamic(
  () => import('react-leaflet').then((mod) => mod.Polyline),
  { ssr: false }
);

// Simulated route data (in a real app, this would come from a routing API)
interface RouteInfo {
  distance: string;
  duration: string;
  traffic: 'light' | 'moderate' | 'heavy';
  polyline: [number, number][];
}

function StationMapContent({ stations, onStationSelect }: StationMapProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [connectorFilter, setConnectorFilter] = useState<string>('all');
  const [selectedStation, setSelectedStation] = useState<ChargingStation | null>(null);
  const [routeDestination, setRouteDestination] = useState<ChargingStation | null>(null);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [showDirections, setShowDirections] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const [L, setL] = useState<typeof import('leaflet') | null>(null);

  useEffect(() => {
    import('leaflet').then((leaflet) => {
      setL(leaflet.default);
    });
  }, []);

  // Simulate getting user location
  useEffect(() => {
    // Simulated Nairobi location
    setUserLocation([-1.286389, 36.817223]);
  }, []);

  const filteredStations = useMemo(() => {
    return stations.filter((station) => {
      const matchesSearch = station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        station.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        station.address.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || station.status === statusFilter;
      
      const matchesConnector = connectorFilter === 'all' || 
        station.connectors.some(c => c.type === connectorFilter);
      
      return matchesSearch && matchesStatus && matchesConnector;
    });
  }, [stations, searchQuery, statusFilter, connectorFilter]);

  // Stats
  const availableCount = stations.filter(s => s.status === 'AVAILABLE').length;
  const totalConnectors = stations.reduce((sum, s) => sum + s.connectors.length, 0);
  const availableConnectors = stations.reduce((sum, s) => sum + s.connectors.filter(c => c.status === 'AVAILABLE').length, 0);

  const handleStationClick = (station: ChargingStation) => {
    setSelectedStation(station);
    onStationSelect(station);
  };

  // Calculate route to station
  const handleNavigate = (station: ChargingStation) => {
    setRouteDestination(station);
    
    // Simulate route calculation
    const distance = (Math.random() * 50 + 5).toFixed(1);
    const duration = Math.floor(Math.random() * 60 + 10);
    const trafficOptions: Array<'light' | 'moderate' | 'heavy'> = ['light', 'moderate', 'heavy'];
    const traffic = trafficOptions[Math.floor(Math.random() * 3)];

    // Generate a simulated polyline (straight line for demo)
    const polyline: [number, number][] = userLocation 
      ? [userLocation, [station.latitude, station.longitude]]
      : [[-1.286389, 36.817223], [station.latitude, station.longitude]];

    setRouteInfo({
      distance: `${distance} km`,
      duration: `${duration} min`,
      traffic,
      polyline,
    });
    setShowDirections(true);
  };

  // Open in Google Maps
  const openInGoogleMaps = (station: ChargingStation) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${station.latitude},${station.longitude}`;
    window.open(url, '_blank');
  };

  // Create custom marker icon
  const createMarkerIcon = (isActive: boolean, status: StationStatus) => {
    if (!L) return null;
    
    const colors: Record<StationStatus, string> = {
      AVAILABLE: 'linear-gradient(135deg, #8EB69B, #235347)',
      OCCUPIED: 'linear-gradient(135deg, #f59e0b, #d97706)',
      OFFLINE: 'linear-gradient(135deg, #6b7280, #9ca3af)',
      MAINTENANCE: 'linear-gradient(135deg, #ef4444, #dc2626)',
    };
    
    return L.divIcon({
      html: `
        <div style="
          width: 36px;
          height: 36px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          background: ${colors[status]};
          border: 3px solid white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          position: relative;
          ${isActive ? 'animation: pulse 1.5s ease-in-out infinite;' : ''}
        ">
          <span style="
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%) rotate(45deg);
            font-size: 14px;
          ">⚡</span>
        </div>
      `,
      className: "",
      iconSize: [36, 36],
      iconAnchor: [18, 36],
      popupAnchor: [0, -36],
    });
  };

  // User location marker
  const createUserIcon = () => {
    if (!L) return null;
    return L.divIcon({
      html: `
        <div style="
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #3b82f6;
          border: 4px solid white;
          box-shadow: 0 0 0 8px rgba(59, 130, 246, 0.3);
        " />
      `,
      className: "",
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });
  };

  // Kenya center coordinates
  const kenyaCenter: [number, number] = [-1.286389, 36.817223];

  if (!L) {
    return (
      <div className="h-[500px] flex items-center justify-center bg-[#DAF1DE]/50 rounded-xl">
        <Loader2 className="w-8 h-8 animate-spin text-[#235347]" />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-0 shadow-md bg-gradient-to-br from-[#235347] to-[#163832] text-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/20">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{availableCount}</p>
                  <p className="text-xs text-white/70">Available Stations</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-0 shadow-md bg-gradient-to-br from-[#8EB69B] to-[#235347] text-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/20">
                  <Plug className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{availableConnectors}/{totalConnectors}</p>
                  <p className="text-xs text-white/70">Connectors Free</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#235347]/10">
                  <Gauge className="h-5 w-5 text-[#235347]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#051F20]">350kW</p>
                  <p className="text-xs text-[#235347]">Max Speed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#8EB69B]/10">
                  <Activity className="h-5 w-5 text-[#235347]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#051F20]">98.5%</p>
                  <p className="text-xs text-[#235347]">Network Uptime</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Search and Filters */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#235347]" />
              <Input
                placeholder="Search stations by name, location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-[#8EB69B] focus:border-[#235347]"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[160px] border-[#8EB69B]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="AVAILABLE">Available</SelectItem>
                <SelectItem value="OCCUPIED">Occupied</SelectItem>
                <SelectItem value="OFFLINE">Offline</SelectItem>
              </SelectContent>
            </Select>
            <Select value={connectorFilter} onValueChange={setConnectorFilter}>
              <SelectTrigger className="w-full md:w-[160px] border-[#8EB69B]">
                <SelectValue placeholder="Connector" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="CCS2">CCS2</SelectItem>
                <SelectItem value="CHADEMO">CHAdeMO</SelectItem>
                <SelectItem value="TYPE2">Type 2</SelectItem>
                <SelectItem value="TESLA">Tesla</SelectItem>
              </SelectContent>
            </Select>
            <Button className="bg-gradient-to-r from-[#235347] to-[#163832] hover:from-[#163832] hover:to-[#0B2B26] text-white gap-2">
              <Navigation className="h-4 w-4" />
              My Location
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content - Map + Stations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Map */}
        <div className="lg:col-span-2">
          <Card className="overflow-hidden border-0 shadow-lg h-[500px]">
            <MapContainer
              center={kenyaCenter}
              zoom={7}
              style={{ height: '100%', width: '100%' }}
              className="z-0"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              {/* User location marker */}
              {userLocation && (
                <Marker
                  position={userLocation}
                  icon={createUserIcon()!}
                />
              )}
              
              {/* Route polyline */}
              {routeInfo && routeDestination && (
                <Polyline
                  positions={routeInfo.polyline}
                  color="#235347"
                  weight={4}
                  opacity={0.8}
                />
              )}
              
              {filteredStations.map((station) => (
                <Marker
                  key={station.id}
                  position={[station.latitude, station.longitude]}
                  icon={createMarkerIcon(selectedStation?.id === station.id, station.status)!}
                  eventHandlers={{
                    click: () => handleStationClick(station),
                  }}
                >
                  <Popup>
                    <div className="p-2 min-w-[220px]">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <strong className="text-sm block">{station.name}</strong>
                          <small className="text-muted-foreground block">{station.city}</small>
                        </div>
                        <Badge className={`${statusColors[station.status]} text-white text-[10px]`}>
                          {statusLabels[station.status]}
                        </Badge>
                      </div>
                      <div className="mb-3">
                        {station.connectors.slice(0, 3).map((c, idx) => (
                          <span key={idx} className="inline-block bg-[#235347]/10 text-[#235347] px-2 py-0.5 rounded text-xs mr-1 mb-1">
                            {c.type} • {c.powerOutput}kW
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          {station.rating}
                        </div>
                        <span className="text-xs text-muted-foreground">({station.reviewCount} reviews)</span>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          className="flex-1 bg-gradient-to-r from-[#235347] to-[#163832] text-white"
                          onClick={() => handleNavigate(station)}
                        >
                          <Navigation className="h-3 w-3 mr-1" />
                          Directions
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="border-[#8EB69B]"
                          onClick={() => openInGoogleMaps(station)}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </Card>
        </div>

        {/* Station List */}
        <div className="lg:col-span-1">
          <Card className="border-0 shadow-lg h-[500px] bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-2 pt-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-[#051F20]">Nearby Stations</CardTitle>
                <Badge className="bg-[#235347] text-white">{filteredStations.length} found</Badge>
              </div>
            </CardHeader>
            <ScrollArea className="h-[420px]">
              <CardContent className="pt-0 space-y-3">
                {filteredStations.map((station, index) => (
                  <motion.div
                    key={station.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <StationCard
                      station={station}
                      isSelected={selectedStation?.id === station.id}
                      onClick={() => handleStationClick(station)}
                      onNavigate={() => handleNavigate(station)}
                    />
                  </motion.div>
                ))}
                
                {filteredStations.length === 0 && (
                  <div className="text-center py-12 text-[#235347]">
                    <MapPin className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="font-medium">No stations found</p>
                    <p className="text-sm">Try adjusting your filters</p>
                  </div>
                )}
              </CardContent>
            </ScrollArea>
          </Card>
        </div>
      </div>

      {/* Directions Dialog */}
      <Dialog open={showDirections} onOpenChange={setShowDirections}>
        <DialogContent className="max-w-md bg-white/95 backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#051F20]">
              <Route className="w-5 h-5 text-[#235347]" />
              Directions to Station
            </DialogTitle>
            <DialogDescription className="text-[#235347]">
              {routeDestination?.name}
            </DialogDescription>
          </DialogHeader>
          
          {routeInfo && routeDestination && (
            <div className="space-y-4">
              {/* Route Summary */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-[#DAF1DE] rounded-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <Timer className="w-4 h-4 text-[#235347]" />
                    <span className="text-xs text-[#235347]">Duration</span>
                  </div>
                  <p className="text-xl font-bold text-[#051F20]">{routeInfo.duration}</p>
                </div>
                <div className="p-4 bg-[#DAF1DE] rounded-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <Car className="w-4 h-4 text-[#235347]" />
                    <span className="text-xs text-[#235347]">Distance</span>
                  </div>
                  <p className="text-xl font-bold text-[#051F20]">{routeInfo.distance}</p>
                </div>
              </div>

              {/* Traffic Status */}
              <div className={`p-3 rounded-lg flex items-center gap-3 ${
                routeInfo.traffic === 'light' ? 'bg-green-100 text-green-700' :
                routeInfo.traffic === 'moderate' ? 'bg-amber-100 text-amber-700' :
                'bg-red-100 text-red-700'
              }`}>
                <Activity className="w-4 h-4" />
                <span className="text-sm font-medium capitalize">{routeInfo.traffic} traffic</span>
              </div>

              {/* Station Info */}
              <div className="p-4 bg-[#051F20] rounded-xl text-white">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-[#8EB69B]/20">
                    <Zap className="w-5 h-5 text-[#8EB69B]" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{routeDestination.name}</p>
                    <p className="text-sm text-[#8EB69B]">{routeDestination.address}, {routeDestination.city}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className="bg-[#8EB69B] text-[#051F20]">
                        {routeDestination.connectors.length} connectors
                      </Badge>
                      <Badge className={`${statusColors[routeDestination.status]} text-white`}>
                        {statusLabels[routeDestination.status]}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Turn-by-turn Preview */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-[#051F20]">Route Preview</p>
                <div className="space-y-2">
                  {[
                    { icon: Home, text: 'Start from your location', subtext: 'Current position' },
                    { icon: ArrowRight, text: 'Head towards station', subtext: routeInfo.distance },
                    { icon: Zap, text: 'Arrive at charging station', subtext: routeDestination.name },
                  ].map((step, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-2 rounded-lg bg-[#DAF1DE]/50">
                      <div className="p-1.5 rounded bg-[#235347]">
                        <step.icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-[#051F20]">{step.text}</p>
                        <p className="text-xs text-[#235347]">{step.subtext}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button 
                  className="flex-1 bg-gradient-to-r from-[#235347] to-[#163832] text-white"
                  onClick={() => openInGoogleMaps(routeDestination)}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open in Google Maps
                </Button>
                <Button 
                  variant="outline"
                  className="border-[#8EB69B] text-[#235347]"
                  onClick={() => setShowDirections(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

export function StationMap(props: StationMapProps) {
  // Use useSyncExternalStore for client-side hydration
  const emptySubscribe = () => () => {};
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  if (!mounted) {
    return (
      <div className="h-[500px] flex items-center justify-center bg-[#DAF1DE]/50 rounded-xl">
        <Loader2 className="w-8 h-8 animate-spin text-[#235347]" />
      </div>
    );
  }

  return <StationMapContent {...props} />;
}
