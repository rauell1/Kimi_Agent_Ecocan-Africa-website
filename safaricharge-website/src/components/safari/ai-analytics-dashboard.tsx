'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { AIInsight, StationAnalytics, ChargingStation } from '@/types';
import { mockAIInsights, mockStationAnalytics, mockStations } from '@/data/mock-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Brain,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Activity,
  DollarSign,
  Battery,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Cpu,
  Sparkles,
  Wrench
} from 'lucide-react';
import { toast } from 'sonner';

const insightIcons = {
  prediction: TrendingUp,
  alert: AlertTriangle,
  recommendation: Lightbulb,
};

const insightColors = {
  prediction: 'bg-blue-50 text-blue-700',
  alert: 'bg-red-50 text-red-700',
  recommendation: 'bg-emerald-50 text-emerald-700',
};

const severityColors = {
  low: 'bg-gray-50 text-gray-700',
  medium: 'bg-amber-50 text-amber-700',
  high: 'bg-red-50 text-red-700',
};

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export function AIAnalyticsDashboard() {
  const [selectedStation, setSelectedStation] = useState<string>('station-1');
  const insights = mockAIInsights;
  const analytics = mockStationAnalytics;
  const stations = mockStations;

  // Format data for charts
  const dailyUsageData = analytics.dailyUsage.map((d) => ({
    date: new Date(d.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    value: d.value,
  }));

  const revenueData = analytics.revenue.map((d) => ({
    date: new Date(d.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    value: d.value,
  }));

  const peakHoursData = analytics.peakHours.map((d) => ({
    hour: `${d.hour}:00`,
    utilization: d.utilization,
  }));

  const stats = [
    { label: 'Network Utilization', value: '78.5%', change: '+12.3%', trend: 'up', icon: Activity, bgColor: 'bg-white', iconBg: 'bg-[#235347]' },
    { label: 'Daily Revenue', value: '$4,285', change: '+8.7%', trend: 'up', icon: DollarSign, bgColor: 'bg-white', iconBg: 'bg-[#052659]' },
    { label: 'Energy Delivered', value: '12.4 MWh', change: '+15.2%', trend: 'up', icon: Battery, bgColor: 'bg-white', iconBg: 'bg-[#8EB69B]' },
    { label: 'Active Stations', value: '24/28', change: '4 offline', trend: 'down', icon: Zap, bgColor: 'bg-white', iconBg: 'bg-[#5483B3]' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <motion.div 
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#235347]">
              <Brain className="h-6 w-6 text-white" />
            </div>
            AI Analytics Dashboard
          </h1>
          <p className="text-gray-500">
            Predictive insights and network optimization
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={selectedStation} onValueChange={setSelectedStation}>
            <SelectTrigger className="w-[220px] bg-white border-gray-200">
              <SelectValue placeholder="Select station" />
            </SelectTrigger>
            <SelectContent>
              {stations.map((station) => (
                <SelectItem key={station.id} value={station.id}>
                  {station.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2 bg-white border-gray-200">
            <Calendar className="h-4 w-4" />
            Last 30 Days
          </Button>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`border-0 shadow-lg ${stat.bgColor}`}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className={`h-12 w-12 rounded-xl ${stat.iconBg} flex items-center justify-center`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <Badge variant="secondary" className="bg-gray-50 text-gray-600 font-medium">
                    {stat.change}
                  </Badge>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* AI Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="border-0 shadow-lg bg-white overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-[#235347] via-[#052659] to-[#5483B3]" />
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <Sparkles className="h-5 w-5 text-[#235347]" />
                  AI-Generated Insights
                </CardTitle>
                <CardDescription className="text-gray-500">
                  Real-time predictions and recommendations based on network data
                </CardDescription>
              </div>
              <Badge className="bg-[#235347] text-white">
                <span className="animate-pulse mr-1">●</span> Live
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {insights.map((insight, index) => {
                const Icon = insightIcons[insight.type];
                return (
                  <motion.div
                    key={insight.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                  >
                    <Card className="overflow-hidden hover:shadow-md transition-shadow bg-gray-50 border-0">
                      <div className={`h-1 ${insight.type === 'alert' ? 'bg-red-500' : insight.type === 'prediction' ? 'bg-blue-500' : 'bg-emerald-500'}`} />
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`p-2.5 rounded-xl ${insightColors[insight.type]}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-gray-900">{insight.title}</h4>
                              <Badge className={severityColors[insight.severity]}>
                                {insight.severity}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-500 mb-3">
                              {insight.description}
                            </p>
                            {insight.actionable && (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="border-[#235347] text-[#235347] hover:bg-[#f0f7f5]"
                                onClick={() => {
                                  toast.success('Action initiated', {
                                    description: `Processing action for: ${insight.title}`
                                  });
                                }}
                              >
                                Take Action
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Charts Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Tabs defaultValue="usage" className="space-y-4">
          <TabsList className="bg-gray-100">
            <TabsTrigger value="usage" className="data-[state=active]:bg-white data-[state=active]:text-gray-900">Usage Patterns</TabsTrigger>
            <TabsTrigger value="revenue" className="data-[state=active]:bg-white data-[state=active]:text-gray-900">Revenue</TabsTrigger>
            <TabsTrigger value="maintenance" className="data-[state=active]:bg-white data-[state=active]:text-gray-900">Maintenance</TabsTrigger>
          </TabsList>

          <TabsContent value="usage" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Peak Hours Chart */}
              <Card className="border-0 shadow-lg bg-white">
                <CardHeader>
                  <CardTitle className="text-base text-gray-900">Peak Hours Analysis</CardTitle>
                  <CardDescription className="text-gray-500">Hourly utilization patterns</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={peakHoursData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="hour" className="text-xs" tick={{ fill: '#6b7280' }} />
                        <YAxis className="text-xs" tick={{ fill: '#6b7280' }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#ffffff',
                            borderColor: '#e5e7eb',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                          }}
                        />
                        <Bar dataKey="utilization" fill="#235347" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Daily Usage Chart */}
              <Card className="border-0 shadow-lg bg-white">
                <CardHeader>
                  <CardTitle className="text-base text-gray-900">Daily Charging Sessions</CardTitle>
                  <CardDescription className="text-gray-500">30-day rolling average</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={dailyUsageData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="date" className="text-xs" tick={{ fill: '#6b7280' }} />
                        <YAxis className="text-xs" tick={{ fill: '#6b7280' }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#ffffff',
                            borderColor: '#e5e7eb',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke="#235347"
                          fill="#8EB69B"
                          fillOpacity={0.3}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-4">
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader>
                <CardTitle className="text-base text-gray-900">Revenue Trends</CardTitle>
                <CardDescription className="text-gray-500">Daily revenue over the past 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="date" className="text-xs" tick={{ fill: '#6b7280' }} />
                      <YAxis className="text-xs" tick={{ fill: '#6b7280' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          borderColor: '#e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                        }}
                        formatter={(value: number) => [`$${value}`, 'Revenue']}
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#235347"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="maintenance" className="space-y-4">
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader>
                <CardTitle className="text-base text-gray-900">Equipment Health Monitoring</CardTitle>
                <CardDescription className="text-gray-500">AI-predicted maintenance needs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.maintenancePredictions.map((item, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-[#f0f7f5] transition-colors"
                    >
                      <div className={`p-3 rounded-xl ${
                        item.healthScore >= 90 ? 'bg-emerald-50' :
                        item.healthScore >= 70 ? 'bg-amber-50' :
                        'bg-red-50'
                      }`}>
                        <Cpu className={`h-5 w-5 ${
                          item.healthScore >= 90 ? 'text-emerald-600' :
                          item.healthScore >= 70 ? 'text-amber-600' :
                          'text-red-600'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900">{item.component}</span>
                          <span className={`text-sm font-medium ${
                            item.healthScore >= 90 ? 'text-emerald-600' :
                            item.healthScore >= 70 ? 'text-amber-600' :
                            'text-red-600'
                          }`}>
                            {item.healthScore}% Health
                          </span>
                        </div>
                        <Progress value={item.healthScore} className={`h-2 [&>div]:${
                          item.healthScore >= 90 ? 'bg-emerald-500' :
                          item.healthScore >= 70 ? 'bg-amber-500' :
                          'bg-red-500'
                        }`} />
                        <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                          <Calendar className="h-4 w-4" />
                          Next maintenance: {new Date(item.nextMaintenance).toLocaleDateString()}
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-[#235347] text-[#235347] hover:bg-[#f0f7f5]"
                        onClick={() => {
                          toast.success('Maintenance Scheduled', {
                            description: `Maintenance scheduled for ${item.component}`
                          });
                        }}
                      >
                        <Wrench className="h-4 w-4 mr-1" />
                        Schedule
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
