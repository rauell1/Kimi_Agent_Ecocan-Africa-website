'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Zap,
  MapPin,
  Battery,
  Users,
  TrendingUp,
  Activity,
  Clock,
  Leaf,
  Recycle,
  Plug,
  ArrowRight,
  ChevronRight,
  Star,
  Crown,
  Shield,
  Truck
} from 'lucide-react';

interface DashboardProps {
  onNavigate: (tab: string) => void;
  user: {
    name?: string | null;
    role: string;
    subscriptionPlan: string;
    hasPaidAccess: boolean;
  } | null;
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export function Dashboard({ onNavigate, user }: DashboardProps) {
  const isAdmin = user?.role === 'ADMIN';
  const isEmployee = user?.role === 'EMPLOYEE';
  const isFleetManager = user?.role === 'FLEET_MANAGER';
  
  // Battery access: ADMIN and EMPLOYEE always have it, others need PREMIUM subscription
  const canAccessBattery = isAdmin || isEmployee || user?.subscriptionPlan === 'PREMIUM';
  
  // Fleet access: ADMIN, EMPLOYEE (view all), FLEET_MANAGER (own fleet)
  const canAccessFleet = isAdmin || isEmployee || isFleetManager;
  
  // Analytics access: ADMIN and EMPLOYEE only
  const canAccessAnalytics = isAdmin || isEmployee;
  
  // Employee approval and User Management: ADMIN only
  const canAccessEmployeeApproval = isAdmin;
  const canAccessUserManagement = isAdmin;

  // Filter quick actions to only show those the user has access to
  const allQuickActions = [
    { 
      id: 'map', 
      label: 'Find Stations', 
      description: 'Locate nearby charging points',
      icon: MapPin, 
      color: 'bg-[#235347]',
      available: true,
      stats: '254 stations'
    },
    { 
      id: 'battery', 
      label: 'Battery Toolkit', 
      description: 'Evaluate & repurpose batteries',
      icon: Recycle, 
      color: 'bg-[#052659]',
      available: canAccessBattery,
      badge: 'PRO',
      stats: '2,450+ processed'
    },
    { 
      id: 'fleet', 
      label: 'Fleet Dashboard', 
      description: isAdmin || isEmployee ? 'Manage all fleet vehicles' : 'Manage your fleet vehicles',
      icon: Users, 
      color: 'bg-[#5483B3]',
      available: canAccessFleet,
      stats: 'Track vehicles',
      badge: 'FLEET'
    },
    { 
      id: 'employees', 
      label: 'Employee Approval', 
      description: 'Review & approve staff accounts',
      icon: Shield, 
      color: 'bg-purple-600',
      available: canAccessEmployeeApproval,
      stats: 'Manage access'
    },
    { 
      id: 'analytics', 
      label: 'AI Analytics', 
      description: 'Network insights & predictions',
      icon: Activity, 
      color: 'bg-[#5483B3]',
      available: canAccessAnalytics,
      stats: 'Real-time'
    },
    { 
      id: 'users', 
      label: 'User Management', 
      description: 'Manage members & access',
      icon: Users, 
      color: 'bg-[#8EB69B]',
      available: canAccessUserManagement,
      stats: '10K+ members'
    },
  ];

  // Only show actions the user has access to
  const quickActions = allQuickActions.filter(action => action.available);

  const stats = [
    { label: 'Active Chargers', value: '254', change: '+12', icon: Plug, bgColor: 'bg-[#f0f7f5]', iconBg: 'bg-[#235347]' },
    { label: 'Energy Delivered', value: '1.2M kWh', change: '+8.5%', icon: Zap, bgColor: 'bg-[#e8f4f0]', iconBg: 'bg-[#052659]' },
    { label: 'CO₂ Saved', value: '542 tons', change: '+15%', icon: Leaf, bgColor: 'bg-[#f0f7f5]', iconBg: 'bg-[#8EB69B]' },
    { label: 'Active Users', value: '10,245', change: '+234', icon: Users, bgColor: 'bg-[#e8f4f0]', iconBg: 'bg-[#5483B3]' },
  ];

  const recentActivity = [
    { type: 'charging', station: 'Sarit Centre EV Hub', duration: '45 min', energy: '32.5 kWh', time: '2 hours ago', iconBg: 'bg-[#235347]' },
    { type: 'battery', battery: 'Tesla Model 3 Pack', soh: '78%', action: 'Evaluated', time: '5 hours ago', iconBg: 'bg-[#052659]' },
    { type: 'charging', station: 'Two Rivers Mall', duration: '30 min', energy: '22.1 kWh', time: '1 day ago', iconBg: 'bg-[#5483B3]' },
    { type: 'user', action: 'New Premium subscriber', user: 'john@example.com', time: '2 days ago', iconBg: 'bg-[#8EB69B]' },
  ];

  const counties = [
    { name: 'Nairobi', stations: 30, percentage: 100, barColor: 'bg-[#235347]' },
    { name: 'Kiambu', stations: 9, percentage: 30, barColor: 'bg-[#052659]' },
    { name: 'Nakuru', stations: 9, percentage: 30, barColor: 'bg-[#5483B3]' },
    { name: 'Machakos', stations: 7, percentage: 23, barColor: 'bg-[#8EB69B]' },
    { name: 'Laikipia', stations: 4, percentage: 13, barColor: 'bg-[#163832]' },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Welcome Header */}
      <motion.div 
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#235347] shadow-lg">
              <Zap className="h-6 w-6 text-white" />
            </div>
            {getGreeting()}, {user?.name?.split(' ')[0] || 'User'}
          </h1>
          <p className="text-gray-500 mt-1">
            Here's what's happening with your charging network today
          </p>
        </div>
        
        <div className="flex gap-2">
          {/* Show upgrade for FREE users or Fleet Managers without battery access */}
          {(user?.subscriptionPlan === 'FREE' || (isFleetManager && !canAccessBattery)) && (
            <Button 
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg"
              onClick={() => toast.info('Upgrade to Premium', {
                description: 'Premium plans start at $9.99/month. Get access to Battery Toolkit and more!',
                action: {
                  label: 'Learn More',
                  onClick: () => toast.success('Premium includes: Battery Toolkit, Priority Support, and more!')
                }
              })}
            >
              <Star className="w-4 h-4 mr-2" />
              Upgrade to Premium
            </Button>
          )}
          {user?.subscriptionPlan === 'PREMIUM' && (
            <Button 
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg"
              onClick={() => toast.info('Enterprise Plans', {
                description: 'Get custom solutions for your fleet. Contact our sales team!',
                action: {
                  label: 'Contact Sales',
                  onClick: () => toast.success('Our team will reach out within 24 hours!')
                }
              })}
            >
              <Crown className="w-4 h-4 mr-2" />
              Go Enterprise
            </Button>
          )}
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -4 }}
          >
            <Card className="border-0 shadow-lg overflow-hidden hover:shadow-xl transition-all cursor-pointer bg-white">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-lg ${stat.iconBg}`}>
                    <stat.icon className="h-4 w-4 text-white" />
                  </div>
                  <Badge variant="secondary" className="text-xs font-semibold bg-[#f0f7f5] text-[#235347]">
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

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-0 shadow-lg overflow-hidden bg-white">
          <CardHeader>
            <CardTitle className="text-gray-900">Quick Actions</CardTitle>
            <CardDescription className="text-gray-500">
              Access key features from your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className={`grid gap-4 ${
              quickActions.length <= 2 ? 'grid-cols-1 sm:grid-cols-2' :
              quickActions.length <= 3 ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3' :
              quickActions.length <= 4 ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4' :
              'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6'
            }`}>
              {quickActions.map((action, index) => (
                <motion.div
                  key={action.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    variant="outline"
                    className="w-full h-auto flex-col gap-3 p-5 transition-all border-gray-200 hover:border-[#235347] hover:shadow-lg"
                    onClick={() => onNavigate(action.id)}
                  >
                    <div className={`p-3 rounded-xl ${action.color} shadow-lg relative`}>
                      <action.icon className="h-6 w-6 text-white" />
                      {action.badge && (
                        <span className="absolute -top-1 -right-1 text-[9px] bg-gradient-to-r from-amber-500 to-orange-500 text-white px-1.5 py-0.5 rounded-full font-semibold">
                          {action.badge}
                        </span>
                      )}
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-gray-900">{action.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{action.description}</p>
                      <p className="text-[10px] text-[#235347] mt-1 font-medium">{action.stats}</p>
                    </div>
                  </Button>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Network Coverage */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-0 shadow-lg h-full overflow-hidden bg-white">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center gap-2">
                <div className="p-2 rounded-lg bg-[#235347]">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                Network Coverage
              </CardTitle>
              <CardDescription className="text-gray-500">
                Charging stations by county
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {counties.map((county, index) => (
                <motion.div 
                  key={county.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{county.name}</span>
                    <span className="text-sm text-gray-500">{county.stations} stations</span>
                  </div>
                  <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${county.percentage}%` }}
                      transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                      className={`absolute inset-y-0 left-0 ${county.barColor} rounded-full`}
                    />
                  </div>
                </motion.div>
              ))}
              <Button 
                variant="outline" 
                className="w-full mt-4 border-[#8EB69B] text-[#235347] hover:bg-[#f0f7f5] font-medium"
                onClick={() => onNavigate('map')}
              >
                <MapPin className="w-4 h-4 mr-2" />
                View Full Map
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-0 shadow-lg h-full overflow-hidden bg-white">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center gap-2">
                <div className="p-2 rounded-lg bg-[#5483B3]">
                  <Activity className="w-4 h-4 text-white" />
                </div>
                Recent Activity
              </CardTitle>
              <CardDescription className="text-gray-500">
                Your latest interactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    whileHover={{ x: 4 }}
                    className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 hover:bg-[#f0f7f5] transition-colors cursor-pointer border border-transparent hover:border-[#8EB69B]/30"
                  >
                    <div className={`p-2 rounded-lg ${activity.iconBg}`}>
                      {activity.type === 'charging' && <Plug className="w-4 h-4 text-white" />}
                      {activity.type === 'battery' && <Battery className="w-4 h-4 text-white" />}
                      {activity.type === 'user' && <Users className="w-4 h-4 text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      {activity.type === 'charging' && (
                        <>
                          <p className="text-sm font-medium text-gray-900">{activity.station}</p>
                          <p className="text-xs text-gray-500">{activity.duration} • {activity.energy}</p>
                        </>
                      )}
                      {activity.type === 'battery' && (
                        <>
                          <p className="text-sm font-medium text-gray-900">{activity.battery}</p>
                          <p className="text-xs text-gray-500">SoH: {activity.soh} • {activity.action}</p>
                        </>
                      )}
                      {activity.type === 'user' && (
                        <>
                          <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                          <p className="text-xs text-gray-500">{activity.user}</p>
                        </>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 whitespace-nowrap">{activity.time}</span>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Battery Toolkit Promo (for non-premium users) */}
      {!canAccessBattery && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-0 shadow-xl bg-white overflow-hidden relative">
            <div className="h-1 w-full bg-gradient-to-r from-[#235347] via-[#052659] to-[#5483B3]" />
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1">
                  <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 mb-3 font-semibold">
                    <Star className="w-3 h-3 mr-1" />
                    Premium Feature
                  </Badge>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    Battery Repurposing Toolkit
                  </h3>
                  <p className="text-gray-600 text-base mb-5">
                    Evaluate EV batteries, calculate second-life value, and access our complete battery lifecycle management tools.
                  </p>
                  <ul className="space-y-2.5 mb-6">
                    {[
                      'State of Health (SoH) Assessment',
                      'Value Estimation Calculator',
                      'Application Matching AI',
                      'Environmental Impact Reports'
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-gray-700">
                        <ChevronRight className="w-4 h-4 text-[#235347]" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Button 
                    size="lg" 
                    className="bg-[#235347] hover:bg-[#163832] text-white shadow-xl"
                    onClick={() => toast.info('Upgrade to Premium', {
                      description: 'Get access to the Battery Repurposing Toolkit and more!',
                      action: {
                        label: 'View Plans',
                        onClick: () => toast.success('Premium plans start at $9.99/month')
                      }
                    })}
                  >
                    <Star className="w-4 h-4 mr-2" />
                    Upgrade to Premium
                  </Button>
                </div>
                <div className="hidden md:block">
                  <div className="relative">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                      className="w-36 h-36 rounded-full border-2 border-dashed border-[#8EB69B]/30"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="p-4 rounded-2xl bg-[#235347]">
                        <Battery className="w-10 h-10 text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
