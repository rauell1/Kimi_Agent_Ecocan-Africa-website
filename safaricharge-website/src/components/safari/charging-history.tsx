'use client';

import { useState } from 'react';
import { ChargingSession } from '@/types';
import { mockSessions } from '@/data/mock-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  History,
  Search,
  Filter,
  Calendar,
  MapPin,
  Zap,
  Battery,
  DollarSign,
  Clock,
  ChevronRight,
  Download,
  TrendingUp
} from 'lucide-react';

const statusConfig = {
  ACTIVE: { label: 'In Progress', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  COMPLETED: { label: 'Completed', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  CANCELLED: { label: 'Cancelled', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
};

export function ChargingHistory() {
  const [sessions] = useState<ChargingSession[]>(mockSessions);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedSession, setSelectedSession] = useState<ChargingSession | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  const filteredSessions = sessions.filter((session) => {
    const matchesSearch = session.station?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.station?.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || session.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate stats
  const totalEnergy = sessions
    .filter(s => s.status === 'COMPLETED')
    .reduce((sum, s) => sum + (s.energyDelivered || 0), 0);
  
  const totalCost = sessions
    .filter(s => s.status === 'COMPLETED')
    .reduce((sum, s) => sum + (s.cost || 0), 0);

  const totalSessions = sessions.filter(s => s.status === 'COMPLETED').length;

  // Export function
  const handleExport = () => {
    const csvContent = [
      ['Date', 'Station', 'Address', 'Duration', 'Energy (kWh)', 'Cost ($)', 'Status'].join(','),
      ...sessions.map(s => [
        formatDate(s.startTime),
        s.station?.name || '',
        s.station?.address || '',
        formatDuration(s.startTime, s.endTime),
        s.energyDelivered?.toFixed(2) || '0',
        s.cost?.toFixed(2) || '0',
        s.status
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `charging-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Export Complete', {
      description: `Exported ${sessions.length} charging sessions to CSV`
    });
  };

  // View details handler
  const handleViewDetails = (session: ChargingSession) => {
    setSelectedSession(session);
    setShowDetailsDialog(true);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (date: Date | string) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (start: Date | string, end: Date | string | null) => {
    if (!end) return 'In progress';
    const diff = new Date(end).getTime() - new Date(start).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <History className="h-7 w-7 text-primary" />
          Charging History
        </h1>
        <p className="text-muted-foreground">
          View your past charging sessions and statistics
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Sessions</p>
                <p className="text-2xl font-bold">{totalSessions}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Zap className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Energy Charged</p>
                <p className="text-2xl font-bold">{totalEnergy.toFixed(1)} kWh</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Battery className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Spent</p>
                <p className="text-2xl font-bold">${totalCost.toFixed(2)}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by station name or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sessions</SelectItem>
                <SelectItem value="ACTIVE">In Progress</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2" onClick={handleExport}>
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sessions List */}
      <div className="space-y-4">
        {filteredSessions.length === 0 ? (
          <Card className="p-8 text-center">
            <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium mb-2">No charging sessions found</h3>
            <p className="text-sm text-muted-foreground">
              Start charging at a station to see your history here
            </p>
          </Card>
        ) : (
          filteredSessions.map((session) => (
            <Card key={session.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  {/* Status Indicator */}
                  <div className={`w-full md:w-2 ${
                    session.status === 'ACTIVE' ? 'bg-blue-500' :
                    session.status === 'COMPLETED' ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  
                  <div className="flex-1 p-4">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      {/* Session Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{session.station?.name}</h3>
                          <Badge className={statusConfig[session.status].color}>
                            {statusConfig[session.status].label}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3">
                          <MapPin className="h-3.5 w-3.5" />
                          <span>{session.station?.address}, {session.station?.city}</span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                          <div>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                              <Calendar className="h-3.5 w-3.5" />
                              Date
                            </div>
                            <p className="text-sm font-medium">{formatDate(session.startTime)}</p>
                          </div>
                          
                          <div>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                              <Clock className="h-3.5 w-3.5" />
                              Duration
                            </div>
                            <p className="text-sm font-medium">{formatDuration(session.startTime, session.endTime)}</p>
                          </div>
                          
                          <div>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                              <Battery className="h-3.5 w-3.5" />
                              Energy
                            </div>
                            <p className="text-sm font-medium">
                              {session.energyDelivered ? `${session.energyDelivered.toFixed(1)} kWh` : '-'}
                            </p>
                          </div>
                          
                          <div>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                              <DollarSign className="h-3.5 w-3.5" />
                              Cost
                            </div>
                            <p className="text-sm font-medium">
                              {session.cost ? `$${session.cost.toFixed(2)}` : '-'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Connector Info */}
                      <div className="flex flex-col items-end gap-2">
                        <Badge variant="outline" className="gap-1">
                          <Zap className="h-3.5 w-3.5" />
                          {session.connector?.type} • {session.connector?.powerOutput} kW
                        </Badge>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="gap-1 text-muted-foreground"
                          onClick={() => handleViewDetails(session)}
                        >
                          View Details
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Active Session Progress */}
                    {session.status === 'ACTIVE' && (
                      <div className="mt-4 pt-4 border-t">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-muted-foreground">Charging Progress</span>
                          <span className="font-medium">67%</span>
                        </div>
                        <Progress value={67} className="h-2" />
                        <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                          <span>Started at {formatTime(session.startTime)}</span>
                          <span>Est. completion: 25 min</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Session Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Session Details
            </DialogTitle>
            <DialogDescription>
              {selectedSession?.station?.name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedSession && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge className={statusConfig[selectedSession.status].color}>
                  {statusConfig[selectedSession.status].label}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Location</p>
                  <p className="text-sm font-medium">{selectedSession.station?.address}</p>
                  <p className="text-sm text-muted-foreground">{selectedSession.station?.city}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Connector</p>
                  <p className="text-sm font-medium">{selectedSession.connector?.type}</p>
                  <p className="text-sm text-muted-foreground">{selectedSession.connector?.powerOutput} kW</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Start Time</p>
                  <p className="text-sm font-medium">{formatDate(selectedSession.startTime)}</p>
                  <p className="text-sm text-muted-foreground">{formatTime(selectedSession.startTime)}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Duration</p>
                  <p className="text-sm font-medium">{formatDuration(selectedSession.startTime, selectedSession.endTime)}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Energy Delivered</p>
                  <p className="text-sm font-medium">
                    {selectedSession.energyDelivered ? `${selectedSession.energyDelivered.toFixed(1)} kWh` : 'N/A'}
                  </p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Total Cost</p>
                  <p className="text-sm font-medium">
                    {selectedSession.cost ? `$${selectedSession.cost.toFixed(2)}` : 'N/A'}
                  </p>
                </div>
              </div>
              
              <Button 
                className="w-full mt-4" 
                onClick={() => {
                  setShowDetailsDialog(false);
                  toast.success('Receipt Downloaded', {
                    description: `Receipt for session at ${selectedSession.station?.name} has been downloaded`
                  });
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Download Receipt
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
