'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChargingStation, StationStatus, ConnectorType } from '@/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  MapPin,
  Zap,
  Clock,
  Star,
  Navigation,
  Battery,
  Gauge,
  Wifi,
  Coffee,
  Car,
  ShoppingBag,
  Accessibility,
  ChevronDown,
  Plug,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCurrency } from '@/contexts/currency-context';

interface StationCardProps {
  station: ChargingStation;
  isSelected?: boolean;
  onClick: () => void;
  onNavigate?: () => void;
}

const statusStyles: Record<StationStatus, { bg: string; text: string; border: string }> = {
  AVAILABLE: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', border: 'border-green-200 dark:border-green-800' },
  OCCUPIED: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800' },
  OFFLINE: { bg: 'bg-gray-100 dark:bg-gray-900/30', text: 'text-gray-700 dark:text-gray-400', border: 'border-gray-200 dark:border-gray-800' },
  MAINTENANCE: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', border: 'border-red-200 dark:border-red-800' },
};

const connectorColors: Record<ConnectorType, string> = {
  CCS2: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  CHADEMO: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  TYPE2: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  TESLA: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const amenityIcons: Record<string, React.ReactNode> = {
  'WiFi': <Wifi className="h-3.5 w-3.5" />,
  'Cafe': <Coffee className="h-3.5 w-3.5" />,
  'Parking': <Car className="h-3.5 w-3.5" />,
  'Shopping': <ShoppingBag className="h-3.5 w-3.5" />,
  'Restrooms': <Accessibility className="h-3.5 w-3.5" />,
};

export function StationCard({ station, isSelected, onClick, onNavigate }: StationCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { formatPriceDual } = useCurrency();
  
  const availableConnectors = station.connectors.filter(c => c.status === 'AVAILABLE').length;
  const totalConnectors = station.connectors.length;
  const availabilityPercent = (availableConnectors / totalConnectors) * 100;
  
  const maxPower = Math.max(...station.connectors.map(c => c.powerOutput));
  const minPrice = Math.min(...station.connectors.map(c => c.currentPrice));
  
  // Format price in both USD and KES
  const prices = formatPriceDual(minPrice);

  return (
    <Card 
      className={cn(
        "overflow-hidden transition-all duration-300 cursor-pointer hover:shadow-lg",
        isSelected && "ring-2 ring-primary shadow-lg"
      )}
      onClick={onClick}
    >
      <div className="p-4">
        <div className="flex gap-3 items-start">
          {/* Icon */}
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-md">
            <Zap className="w-5 h-5 text-white" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm mb-1 text-foreground truncate">
              {station.name}
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
              <MapPin className="h-3 w-3" />
              <span>{station.city}</span>
            </div>

            {/* Connectors */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {station.connectors.slice(0, 3).map((connector) => (
                <Badge 
                  key={connector.id} 
                  variant="secondary" 
                  className={cn("text-xs px-2 py-0.5", connectorColors[connector.type])}
                >
                  {connector.type}
                </Badge>
              ))}
              {station.connectors.length > 3 && (
                <Badge variant="outline" className="text-xs px-2 py-0.5">
                  +{station.connectors.length - 3}
                </Badge>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 h-8 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
              >
                Learn More
                <ChevronDown
                  className={cn(
                    "w-3 h-3 ml-1 transition-transform duration-300",
                    isExpanded && "rotate-180"
                  )}
                />
              </Button>
              <Button
                size="sm"
                className="flex-1 h-8 text-xs bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate?.();
                }}
              >
                <Navigation className="w-3 h-3 mr-1" />
                Drive
              </Button>
            </div>
          </div>
        </div>

        {/* Expanded Details */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="mt-4 pt-4 border-t space-y-4">
                {/* Address */}
                <div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {station.address}, {station.city}
                  </p>
                </div>

                {/* Charging Details */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Gauge className="w-4 h-4 text-primary" />
                      <span className="text-xs font-medium">Power</span>
                    </div>
                    <p className="text-sm font-semibold text-foreground">
                      Up to {maxPower} kW
                    </p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Battery className="w-4 h-4 text-primary" />
                      <span className="text-xs font-medium">Price/kWh</span>
                    </div>
                    <p className="text-sm font-semibold text-foreground">
                      {prices.kes}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {prices.usd}
                    </p>
                  </div>
                </div>

                {/* Availability Bar */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground">Availability</span>
                    <span className="font-medium">{availableConnectors}/{totalConnectors} available</span>
                  </div>
                  <Progress 
                    value={availabilityPercent} 
                    className={cn(
                      "h-2",
                      availabilityPercent > 50 ? "[&>div]:bg-emerald-500" : 
                      availabilityPercent > 25 ? "[&>div]:bg-amber-500" : "[&>div]:bg-red-500"
                    )}
                  />
                </div>

                {/* Connectors Detail */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Plug className="w-4 h-4 text-primary" />
                    <span className="text-xs font-semibold">Connectors</span>
                  </div>
                  <TooltipProvider>
                    <div className="flex flex-wrap gap-1.5">
                      {station.connectors.map((connector) => (
                        <Tooltip key={connector.id}>
                          <TooltipTrigger asChild>
                            <Badge 
                              variant="outline" 
                              className={cn(
                                "text-xs",
                                connectorColors[connector.type],
                                connector.status !== 'AVAILABLE' && "opacity-50"
                              )}
                            >
                              {connector.type}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="space-y-1 text-xs">
                              <div className="font-medium">{connector.type}</div>
                              <div>{connector.powerOutput} kW</div>
                              <div>{formatPriceDual(connector.currentPrice).kes}/kWh</div>
                              <div className="text-muted-foreground">{formatPriceDual(connector.currentPrice).usd}/kWh</div>
                              <Badge className={cn(statusStyles[connector.status].bg, statusStyles[connector.status].text)}>
                                {connector.status}
                              </Badge>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </div>
                  </TooltipProvider>
                </div>

                {/* Amenities */}
                {station.amenities.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Coffee className="w-4 h-4 text-primary" />
                      <span className="text-xs font-semibold">Amenities</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {station.amenities.map((amenity, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs gap-1 px-2 py-0.5">
                          {amenityIcons[amenity] || <Zap className="h-3 w-3" />}
                          {amenity}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Stats */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
                  <div className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span>{station.rating} ({station.reviewCount} reviews)</span>
                  </div>
                  {station.isOpen24h && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      <span>24/7 Open</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
}
