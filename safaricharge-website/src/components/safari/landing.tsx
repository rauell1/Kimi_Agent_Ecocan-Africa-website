'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Zap,
  MapPin,
  Battery,
  BarChart3,
  ArrowRight,
  CheckCircle,
  Leaf,
  TrendingUp,
  Globe,
  Clock,
  Cpu,
  Recycle,
  Plug,
  Home,
  ChevronRight,
  Shield,
  Building2,
  Sun,
  BatteryCharging,
  Factory,
  Calculator,
  Activity,
  FileText,
  Truck,
  Wrench,
  Car,
  Gauge
} from 'lucide-react';

interface LandingProps {
  onGetStarted: () => void;
  onNavigate?: (tab: string) => void;
}

// Freely floating icon that moves like carried by water/air in all directions
function FloatingIcon({ 
  icon: Icon, 
  initialX, 
  initialY, 
  size = 32,
  color = "rgba(142, 182, 155, 0.6)",
  delay = 0
}: { 
  icon: React.ElementType; 
  initialX: number; 
  initialY: number; 
  size?: number;
  color?: string;
  delay?: number;
}) {
  // Generate unique random values for each icon
  const floatDurationX = 8 + Math.random() * 6;
  const floatDurationY = 7 + Math.random() * 5;
  const floatDistanceX = 30 + Math.random() * 40;
  const floatDistanceY = 25 + Math.random() * 35;
  const rotateDuration = 10 + Math.random() * 8;
  
  return (
    <div 
      className="absolute pointer-events-none select-none"
      style={{ 
        left: initialX, 
        top: initialY,
        transform: 'translate(-50%, -50%)'
      }}
    >
      <motion.div
        animate={{
          x: [0, floatDistanceX, 0, -floatDistanceX * 0.7, 0, floatDistanceX * 0.5, 0],
          y: [0, -floatDistanceY * 0.6, -floatDistanceY, -floatDistanceY * 0.4, 0, floatDistanceY * 0.8, floatDistanceY * 0.3, 0],
          rotate: [0, 8, -5, 10, -3, 5, 0],
          scale: [1, 1.05, 1, 0.95, 1.02, 1],
        }}
        transition={{
          x: {
            duration: floatDurationX,
            repeat: Infinity,
            ease: "easeInOut",
            delay: delay,
          },
          y: {
            duration: floatDurationY,
            repeat: Infinity,
            ease: "easeInOut",
            delay: delay * 0.7,
          },
          rotate: {
            duration: rotateDuration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: delay * 0.5,
          },
          scale: {
            duration: 5 + Math.random() * 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: delay * 0.3,
          }
        }}
      >
        <Icon 
          size={size} 
          style={{ color: color }}
          strokeWidth={1.5}
        />
      </motion.div>
    </div>
  );
}

// Animated electricity bolt
function ElectricBolt({ x, y, delay = 0 }: { x: string; y: string; delay?: number }) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ left: x, top: y }}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.4, 0.7, 0.4],
        rotate: [0, 10, -10, 0]
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        delay
      }}
    >
      <Zap size={18} style={{ color: '#FFD700' }} strokeWidth={2} />
    </motion.div>
  );
}

// Animated location dot
function LocationDot({ x, y, delay = 0, color = "#8EB69B" }: { x: string; y: string; delay?: number; color?: string }) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ left: x, top: y }}
      animate={{
        scale: [1, 1.4, 1],
        opacity: [0.4, 0.7, 0.4]
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        delay
      }}
    >
      <div 
        className="w-3 h-3 rounded-full" 
        style={{ backgroundColor: color }}
      />
      <div 
        className="absolute inset-0 w-3 h-3 rounded-full animate-ping" 
        style={{ backgroundColor: color, opacity: 0.3 }}
      />
    </motion.div>
  );
}

interface FeatureDetail {
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  gradient: string;
  features: { title: string; description: string; icon: React.ElementType }[];
  stats: { value: string; label: string }[];
  benefits: string[];
}

const featureDetails: Record<string, FeatureDetail> = {
  'charging-network': {
    title: 'Kenya\'s Largest EV Charging Network',
    description: 'Access 254+ public charging points across 11 counties in Kenya. Our network spans from Nairobi to Mombasa, Kisumu to Eldoret, ensuring you\'re never far from a reliable charging station.',
    icon: MapPin,
    color: 'text-[#235347]',
    gradient: 'from-[#235347] to-[#163832]',
    features: [
      { title: 'Real-time Availability', description: 'See which chargers are available before you arrive with live status updates', icon: Activity },
      { title: 'Multi-connector Support', description: 'CCS2, CHAdeMO, Type 2, and Tesla connectors available at various locations', icon: Plug },
      { title: 'High-Speed Charging', description: 'Up to 350kW DC fast charging for rapid top-ups in 15-30 minutes', icon: Zap },
      { title: 'Smart Routing', description: 'Get directions with distance, duration, and traffic conditions', icon: MapPin },
    ],
    stats: [
      { value: '254+', label: 'Public Chargers' },
      { value: '11', label: 'Counties' },
      { value: '350kW', label: 'Max Speed' },
      { value: '98.5%', label: 'Uptime' },
    ],
    benefits: [
      '24/7 customer support',
      'Contactless payment',
      'Mobile app integration',
      'Charging history tracking',
      'Carbon footprint reporting',
      'Fleet management tools',
    ],
  },
  'battery-toolkit': {
    title: 'Battery Lifecycle Management',
    description: 'Complete EV battery repurposing and recycling solution. Evaluate battery health, calculate second-life value, and find optimal applications for used EV batteries.',
    icon: Recycle,
    color: 'text-[#052659]',
    gradient: 'from-[#052659] to-[#141E30]',
    features: [
      { title: 'SoH Assessment', description: 'Comprehensive State of Health testing and degradation analysis', icon: Activity },
      { title: 'Value Calculator', description: 'AI-powered second-life value estimation based on current capacity', icon: Calculator },
      { title: 'Application Matching', description: 'Find optimal second-life applications: home storage, commercial, off-grid', icon: Building2 },
      { title: 'Compliance Tracking', description: 'UN 38.3, IEC 62660, and ISO 12405 certification management', icon: Shield },
    ],
    stats: [
      { value: '2,450+', label: 'Batteries Processed' },
      { value: '185M', label: 'kWh Repurposed' },
      { value: '85%', label: 'Material Recovery' },
      { value: '8-10yr', label: 'Extended Life' },
    ],
    benefits: [
      'Environmental impact certification',
      'Chain of custody documentation',
      'Safety testing & verification',
      'Transportation logistics',
      'Value recovery optimization',
      'Regulatory compliance',
    ],
  },
  'energy-intelligence': {
    title: 'AI-Powered Energy Analytics',
    description: 'Harness the power of artificial intelligence to optimize your energy usage, predict maintenance needs, and maximize the efficiency of your EV fleet or charging infrastructure.',
    icon: BarChart3,
    color: 'text-[#5483B3]',
    gradient: 'from-[#5483B3] to-[#7DA0CA]',
    features: [
      { title: 'Predictive Analytics', description: 'Machine learning models predict usage patterns and optimize charging schedules', icon: TrendingUp },
      { title: 'Grid Integration', description: 'Smart grid communication for load balancing and demand response', icon: Activity },
      { title: 'Fleet Optimization', description: 'Route planning and charging optimization for fleet operators', icon: Truck },
      { title: 'Maintenance Alerts', description: 'Predictive maintenance notifications before equipment failure', icon: Wrench },
    ],
    stats: [
      { value: '40%', label: 'Cost Reduction' },
      { value: '25%', label: 'Efficiency Gain' },
      { value: '99.2%', label: 'Prediction Accuracy' },
      { value: '24/7', label: 'Monitoring' },
    ],
    benefits: [
      'Real-time dashboards',
      'Customizable alerts',
      'API integrations',
      'Automated reporting',
      'Energy cost forecasting',
      'Carbon credit tracking',
    ],
  },
  'sustainability': {
    title: 'Carbon Tracking & Sustainability',
    description: 'Monitor your environmental impact, earn green certificates, and contribute to Kenya\'s clean energy transition. Every charge makes a difference.',
    icon: Leaf,
    color: 'text-[#8EB69B]',
    gradient: 'from-[#8EB69B] to-[#235347]',
    features: [
      { title: 'Carbon Calculator', description: 'Real-time CO2 savings tracking compared to fossil fuel vehicles', icon: Calculator },
      { title: 'Green Certificates', description: 'Downloadable sustainability certificates for corporate reporting', icon: FileText },
      { title: 'Impact Reports', description: 'Monthly and annual environmental impact summaries', icon: BarChart3 },
      { title: 'Tree Equivalents', description: 'Visualize your impact in trees saved and emissions avoided', icon: Leaf },
    ],
    stats: [
      { value: '12,800', label: 'Tons CO2 Saved' },
      { value: '580K', label: 'Trees Equivalent' },
      { value: '2.1M', label: 'Liters Fuel Saved' },
      { value: '100%', label: 'Renewable Options' },
    ],
    benefits: [
      'ESG reporting support',
      'Corporate sustainability goals',
      'Carbon credit generation',
      'Environmental compliance',
      'Public impact dashboard',
      'Green branding assets',
    ],
  },
};

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export function Landing({ onGetStarted }: LandingProps) {
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const features = [
    {
      id: 'charging-network',
      icon: MapPin,
      title: '254+ Charging Points',
      description: 'Kenya\'s largest EV charging network across 11 counties with real-time availability.',
      gradient: 'from-[#235347] to-[#163832]',
      iconBg: 'bg-gradient-to-br from-[#235347] to-[#163832]',
    },
    {
      id: 'battery-toolkit',
      icon: Recycle,
      title: 'Battery Repurposing',
      description: 'Complete lifecycle management from EV to stationary storage with SoH assessment.',
      gradient: 'from-[#052659] to-[#141E30]',
      iconBg: 'bg-gradient-to-br from-[#052659] to-[#141E30]',
    },
    {
      id: 'energy-intelligence',
      icon: BarChart3,
      title: 'Energy Intelligence',
      description: 'AI-powered analytics for grid optimization and predictive maintenance.',
      gradient: 'from-[#5483B3] to-[#7DA0CA]',
      iconBg: 'bg-gradient-to-br from-[#5483B3] to-[#7DA0CA]',
    },
    {
      id: 'sustainability',
      icon: Leaf,
      title: 'Carbon Tracking',
      description: 'Monitor your environmental impact and earn green certificates.',
      gradient: 'from-[#8EB69B] to-[#235347]',
      iconBg: 'bg-gradient-to-br from-[#8EB69B] to-[#235347]',
    },
  ];

  const stats = [
    { value: '254', label: 'Public Chargers', icon: Plug, suffix: '🇰🇪', color: 'from-[#235347] to-[#163832]' },
    { value: '11', label: 'Counties Covered', icon: MapPin, color: 'from-[#052659] to-[#141E30]' },
    { value: '1.2M+', label: 'kWh Delivered', icon: Zap, color: 'from-[#5483B3] to-[#7DA0CA]' },
    { value: '98.5%', label: 'Network Uptime', icon: TrendingUp, color: 'from-[#8EB69B] to-[#235347]' },
  ];

  const counties = [
    { name: 'Nairobi', stations: 30, color: 'from-[#235347] to-[#163832]' },
    { name: 'Kiambu', stations: 9, color: 'from-[#052659] to-[#141E30]' },
    { name: 'Nakuru', stations: 9, color: 'from-[#5483B3] to-[#7DA0CA]' },
    { name: 'Machakos', stations: 7, color: 'from-[#8EB69B] to-[#235347]' },
    { name: 'Laikipia', stations: 4, color: 'from-[#235347] to-[#8EB69B]' },
    { name: 'Others', stations: 195, color: 'from-[#141E30] to-[#052659]' },
  ];

  const handleLearnMore = (featureId: string) => {
    setSelectedFeature(featureId);
    setIsModalOpen(true);
  };

  const featureDetail = selectedFeature ? featureDetails[selectedFeature] : null;

  return (
    <div className="min-h-screen bg-[#fafcfc]">
      {/* Navigation */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-b border-gray-100 z-50"
      >
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          <motion.div 
            className="flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#235347] to-[#052659] flex items-center justify-center shadow-lg">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-[#235347] to-[#052659] bg-clip-text text-transparent">SafariCharge</span>
              <p className="text-[10px] text-[#8EB69B] -mt-0.5">POWERING AFRICA</p>
            </div>
          </motion.div>
          
          <div className="hidden md:flex items-center gap-6">
            <a href="#network" className="text-sm text-gray-600 hover:text-[#235347] transition-colors font-medium">Network</a>
            <a href="#features" className="text-sm text-gray-600 hover:text-[#235347] transition-colors font-medium">Features</a>
            <a href="#sustainability" className="text-sm text-gray-600 hover:text-[#235347] transition-colors font-medium">Sustainability</a>
            <a href="#about" className="text-sm text-gray-600 hover:text-[#235347] transition-colors font-medium">About</a>
            <Button onClick={onGetStarted} className="bg-gradient-to-r from-[#235347] to-[#052659] hover:from-[#163832] hover:to-[#141E30] text-white gap-2 shadow-lg">
              <Shield className="w-4 h-4" />
              Sign In
            </Button>
          </div>

          <Button onClick={onGetStarted} className="md:hidden bg-gradient-to-r from-[#235347] to-[#052659] text-white" size="sm">
            Sign In
          </Button>
        </div>
      </motion.nav>

      {/* Hero Section with Smooth Floating Animations */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#021024] via-[#052659] to-[#235347]" />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(rgba(142,182,155,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(142,182,155,0.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }} />
        </div>
        
        {/* Free-Floating Icons - carried by water/air effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none hidden lg:block">
          {/* Scattered across the section */}
          <FloatingIcon icon={Zap} initialX={80} initialY={120} size={36} color="rgba(255, 215, 0, 0.7)" delay={0} />
          <FloatingIcon icon={Battery} initialX={280} initialY={100} size={32} color="rgba(142, 182, 155, 0.6)" delay={0.5} />
          <FloatingIcon icon={Plug} initialX={480} initialY={150} size={28} color="rgba(35, 83, 71, 0.6)" delay={1} />
          <FloatingIcon icon={Car} initialX={680} initialY={110} size={34} color="rgba(142, 182, 155, 0.6)" delay={1.5} />
          <FloatingIcon icon={Gauge} initialX={880} initialY={130} size={30} color="rgba(35, 83, 71, 0.6)" delay={2} />
          
          {/* Row 2 - Middle */}
          <FloatingIcon icon={MapPin} initialX={130} initialY={350} size={28} color="rgba(35, 83, 71, 0.7)" delay={2.5} />
          <FloatingIcon icon={Activity} initialX={330} initialY={380} size={32} color="rgba(142, 182, 155, 0.6)" delay={3} />
          <FloatingIcon icon={BatteryCharging} initialX={530} initialY={360} size={30} color="rgba(35, 83, 71, 0.6)" delay={3.5} />
          <FloatingIcon icon={Zap} initialX={730} initialY={390} size={28} color="rgba(255, 215, 0, 0.6)" delay={4} />
          
          {/* Row 3 - Bottom */}
          <FloatingIcon icon={Leaf} initialX={180} initialY={580} size={34} color="rgba(142, 182, 155, 0.6)" delay={4.5} />
          <FloatingIcon icon={Sun} initialX={380} initialY={620} size={32} color="rgba(255, 215, 0, 0.6)" delay={5} />
          <FloatingIcon icon={Building2} initialX={580} initialY={600} size={28} color="rgba(35, 83, 71, 0.6)" delay={5.5} />
          <FloatingIcon icon={Factory} initialX={780} initialY={640} size={30} color="rgba(142, 182, 155, 0.6)" delay={6} />
          
          {/* Right Side */}
          <FloatingIcon icon={Zap} initialX={1100} initialY={180} size={40} color="rgba(255, 215, 0, 0.7)" delay={6.5} />
          <FloatingIcon icon={Battery} initialX={1050} initialY={380} size={36} color="rgba(142, 182, 155, 0.6)" delay={7} />
          <FloatingIcon icon={Plug} initialX={1120} initialY={580} size={32} color="rgba(35, 83, 71, 0.6)" delay={7.5} />
          
          {/* Left Side */}
          <FloatingIcon icon={Car} initialX={50} initialY={480} size={38} color="rgba(142, 182, 155, 0.6)" delay={8} />
          <FloatingIcon icon={Gauge} initialX={70} initialY={700} size={34} color="rgba(35, 83, 71, 0.6)" delay={8.5} />
          
          {/* Additional scattered icons */}
          <FloatingIcon icon={Recycle} initialX={950} initialY={280} size={28} color="rgba(142, 182, 155, 0.5)" delay={9} />
          <FloatingIcon icon={Leaf} initialX={200} initialY={200} size={26} color="rgba(142, 182, 155, 0.5)" delay={9.5} />
          <FloatingIcon icon={BatteryCharging} initialX={1150} initialY={450} size={24} color="rgba(35, 83, 71, 0.5)" delay={10} />
        </div>
        
        {/* Animated Orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none hidden md:block">
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.35, 0.2],
            }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-gradient-to-br from-[#5483B3] to-[#7DA0CA] blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.15, 0.3, 0.15],
            }}
            transition={{ duration: 10, repeat: Infinity, delay: 2 }}
            className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-[#8EB69B] to-[#235347] blur-3xl"
          />
        </div>
        
        <div className="relative z-10 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Badge */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-white text-sm mb-8 border border-white/20"
            >
              <Zap className="w-4 h-4 text-[#8EB69B]" />
              <span>254 Public Chargers Across Kenya</span>
              <Badge className="bg-[#8EB69B] text-[#051F20] border-0 ml-2 text-xs font-semibold">LIVE</Badge>
            </motion.div>
            
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-black leading-tight text-white mb-6">
              Kenya's Premier{' '}
              <span className="bg-gradient-to-r from-[#8EB69B] via-[#5483B3] to-[#C1E8FF] bg-clip-text text-transparent">
                EV Charging
              </span>
              <br />
              <span className="text-3xl md:text-4xl lg:text-5xl bg-gradient-to-r from-white to-[#C1E8FF] bg-clip-text text-transparent">Network & Energy Platform</span>
            </h1>
          </motion.div>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-lg md:text-xl text-white/70 max-w-3xl mx-auto mb-10 leading-relaxed"
          >
            Find charging stations, manage fleet energy, repurpose EV batteries, 
            and track your carbon footprint - all in one intelligent platform powering 
            Africa's electric mobility revolution.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex flex-wrap gap-4 justify-center mb-16"
          >
            <Button 
              size="lg"
              onClick={onGetStarted}
              className="bg-white text-[#051F20] hover:bg-[#DAF1DE] text-lg px-8 h-14 shadow-2xl font-semibold w-full sm:w-auto"
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg"
              variant="outline"
              onClick={() => {
                const networkSection = document.getElementById('network');
                if (networkSection) {
                  networkSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="bg-transparent text-white border-2 border-white/30 hover:bg-white/10 text-lg px-8 h-14 backdrop-blur-sm w-full sm:w-auto"
            >
              <Globe className="w-5 h-5 mr-2" />
              Explore Network
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="relative group cursor-pointer"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} rounded-2xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity`} />
                <div className="relative bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all">
                  <stat.icon className="w-6 h-6 text-[#8EB69B] mb-2 mx-auto" />
                  <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                    {stat.value}
                    {stat.suffix && <span className="text-xl ml-1">{stat.suffix}</span>}
                  </div>
                  <div className="text-sm text-white/60">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/40"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </motion.div>
      </section>

      {/* Network Coverage Section */}
      <section id="network" className="py-24 px-4 sm:px-6 lg:px-8 bg-[#fafcfc] scroll-mt-24">
        <div className="w-full max-w-[1600px] mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <Badge className="bg-[#235347] text-white mb-4">Network Coverage</Badge>
            <h2 className="text-3xl md:text-4xl font-bold max-w-3xl mx-auto mb-4 text-gray-900">
              Charging Infrastructure Across Kenya
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              From Nairobi to Eldoret, Mombasa to Kisumu - find charging stations wherever your journey takes you.
            </p>
          </motion.div>

          {/* County Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
            {counties.map((county, index) => (
              <motion.div
                key={county.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
              >
                <Card className="text-center hover:shadow-2xl transition-all duration-300 border-0 shadow-lg bg-white overflow-hidden group cursor-pointer">
                  <div className={`h-1 w-full bg-gradient-to-r ${county.color}`} />
                  <CardContent className="p-5">
                    <MapPin className="w-7 h-7 mx-auto mb-3 text-[#235347] group-hover:scale-110 transition-transform" />
                    <p className="font-semibold text-gray-900">{county.name}</p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-[#235347] to-[#052659] bg-clip-text text-transparent">{county.stations}</p>
                    <p className="text-sm text-gray-500">stations</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Interactive Map with Floating Animations */}
          <Card className="border-0 shadow-2xl overflow-hidden bg-gradient-to-br from-[#021024] via-[#052659] to-[#235347] relative">
            <div className="h-96 relative">
              {/* Animated Background Elements */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Rotating Earth */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                  className="absolute top-8 right-8"
                >
                  <Globe size={100} style={{ color: 'rgba(142, 182, 155, 0.2)' }} strokeWidth={1} />
                </motion.div>

                {/* Electricity Bolts */}
                <ElectricBolt x="15%" y="20%" delay={0} />
                <ElectricBolt x="25%" y="60%" delay={0.5} />
                <ElectricBolt x="70%" y="30%" delay={1} />
                <ElectricBolt x="80%" y="70%" delay={1.5} />
                <ElectricBolt x="40%" y="45%" delay={0.8} />

                {/* Location Dots */}
                <LocationDot x="20%" y="25%" delay={0.3} color="#8EB69B" />
                <LocationDot x="35%" y="55%" delay={0.6} color="#5483B3" />
                <LocationDot x="50%" y="35%" delay={0.9} color="#8EB69B" />
                <LocationDot x="65%" y="65%" delay={1.2} color="#5483B3" />
                <LocationDot x="75%" y="40%" delay={1.5} color="#8EB69B" />

                {/* Animated Rings */}
                <motion.div
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.3, 0.1, 0.3],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 border-2 border-[#8EB69B]/30 rounded-full"
                />
                <motion.div
                  animate={{
                    scale: [1, 1.8, 1],
                    opacity: [0.2, 0.05, 0.2],
                  }}
                  transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-60 h-60 border-2 border-[#5483B3]/20 rounded-full"
                />
              </div>

              {/* Center Content */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center z-10">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                  >
                    <Globe size={80} style={{ color: 'rgba(142, 182, 155, 0.4)' }} strokeWidth={1} />
                  </motion.div>
                  <p className="text-2xl font-semibold text-white mt-4">Interactive Map</p>
                  <p className="text-[#8EB69B] mt-1">Sign in to explore all 254 charging points</p>
                  <Button onClick={onGetStarted} className="mt-6 bg-white text-[#051F20] hover:bg-[#DAF1DE] shadow-lg">
                    <MapPin className="w-4 h-4 mr-2" />
                    View Full Map
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-white scroll-mt-24">
        <div className="w-full max-w-[1600px] mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <p className="text-[#235347] font-bold uppercase tracking-widest text-sm mb-4">Platform Features</p>
            <h2 className="text-3xl md:text-4xl font-bold max-w-3xl mx-auto text-gray-900">
              Everything You Need for Electric Mobility
            </h2>
            <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
              Click "Learn more" on any feature to discover detailed information about our comprehensive platform.
            </p>
          </motion.div>
          
          <motion.div 
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.id}
                variants={fadeInUp}
                whileHover={{ y: -10 }}
                className="group"
              >
                <Card className="hover:shadow-2xl transition-all duration-300 border-0 shadow-lg h-full bg-white overflow-hidden">
                  <div className={`h-2 bg-gradient-to-r ${feature.gradient}`} />
                  <CardContent className="p-6">
                    <div className={`w-14 h-14 rounded-2xl ${feature.iconBg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-lg`}>
                      <feature.icon className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-gray-900">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed mb-4">{feature.description}</p>
                    <Button 
                      variant="ghost" 
                      className="w-full text-[#235347] hover:bg-[#f0f7f5] font-semibold group/btn"
                      onClick={() => handleLearnMore(feature.id)}
                    >
                      Learn more
                      <ChevronRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Sustainability Section */}
      <section id="sustainability" className="py-24 px-4 bg-gradient-to-br from-[#021024] via-[#052659] to-[#235347] relative overflow-hidden scroll-mt-24">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(142,182,155,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(84,131,179,0.3) 0%, transparent 50%)'
          }} />
        </div>
        
        <div className="w-full max-w-[1600px] mx-auto relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Badge className="bg-[#8EB69B] text-[#051F20] mb-4">Sustainability</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
                Battery Repurposing & Circular Economy
              </h2>
              <p className="text-[#C1E8FF] mb-6 leading-relaxed text-lg">
                Give EV batteries a second life. Our comprehensive toolkit helps you evaluate, 
                repurpose, and deploy used EV batteries for stationary storage applications.
              </p>
              <div className="space-y-4 mb-8">
                {[
                  'State of Health (SoH) Assessment',
                  'Second-life Application Matching',
                  'Value Estimation Calculator',
                  'Environmental Impact Tracking',
                ].map((item, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="p-1.5 rounded-full bg-[#8EB69B]">
                      <CheckCircle className="h-4 w-4 text-[#051F20]" />
                    </div>
                    <span className="font-medium text-white text-lg">{item}</span>
                  </motion.div>
                ))}
              </div>
              <Button onClick={onGetStarted} size="lg" className="bg-white text-[#051F20] hover:bg-[#DAF1DE] shadow-xl">
                <Recycle className="w-5 h-5 mr-2" />
                Access Battery Toolkit
              </Button>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-2 gap-4"
            >
              {[
                { value: '85%', label: 'Material Recovery', icon: Recycle, gradient: 'from-[#235347] to-[#163832]' },
                { value: '5.2t', label: 'CO₂ Saved/Battery', icon: Leaf, gradient: 'from-[#8EB69B] to-[#235347]' },
                { value: '8-10yr', label: 'Extended Life', icon: Clock, gradient: 'from-[#5483B3] to-[#7DA0CA]' },
                { value: '2,450+', label: 'Batteries Processed', icon: Cpu, gradient: 'from-[#052659] to-[#141E30]' },
              ].map((stat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className={`bg-gradient-to-br ${stat.gradient} rounded-2xl p-6 text-white shadow-xl`}
                >
                  <stat.icon className="w-7 h-7 mb-3 opacity-80" />
                  <div className="text-3xl font-bold">{stat.value}</div>
                  <div className="text-white/70 text-sm mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 px-4 sm:px-6 lg:px-8 bg-[#f0f7f5] scroll-mt-24">
        <div className="w-full max-w-[1600px] mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto"
          >
            <p className="text-[#235347] font-bold uppercase tracking-widest text-sm mb-4">About SafariCharge</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
              Powering Africa's Electric Mobility Revolution
            </h2>
            <p className="text-gray-600 mb-4 leading-relaxed text-lg">
              SafariCharge is building the digital and physical backbone for East Africa's clean-mobility transition. 
              Our platform connects electric vehicles with reliable charging points, intelligent routing, 
              and distributed energy systems - including solar and second-life battery storage.
            </p>
            <p className="text-gray-600 mb-8 leading-relaxed text-lg">
              We exist to make clean mobility accessible, affordable, and resilient for drivers, businesses, 
              and communities - from major cities to rural locations where energy access is limited.
            </p>
            <Button onClick={onGetStarted} size="lg" className="bg-gradient-to-r from-[#235347] to-[#052659] hover:from-[#163832] hover:to-[#141E30] text-white shadow-xl">
              Join the Revolution
              <ArrowRight className="w-5 w-5 ml-2" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-gradient-to-r from-[#235347] via-[#052659] to-[#235347] relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(142,182,155,0.4) 0%, transparent 50%), radial-gradient(circle at 70% 50%, rgba(84,131,179,0.4) 0%, transparent 50%)'
          }} />
        </div>
        <div className="w-full max-w-[1600px] mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
              Ready to power your journey?
            </h2>
            <p className="text-lg text-[#C1E8FF] mb-8 max-w-2xl mx-auto">
              Sign in to access the full network map, battery toolkit, charging history, and exclusive member benefits.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button 
                size="lg"
                onClick={onGetStarted}
                className="bg-white text-[#051F20] hover:bg-[#DAF1DE] text-lg px-10 h-14 shadow-2xl"
              >
                <Zap className="w-5 h-5 mr-2" />
                Sign In to Dashboard
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="bg-transparent text-white border-2 border-white/30 hover:bg-white/10 text-lg px-10 h-14"
              >
                Contact Sales
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#051F20] text-gray-400 py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-[1600px] mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white text-sm font-semibold uppercase mb-4">Platform</h3>
              <ul className="space-y-2">
                <li><button onClick={() => handleLearnMore('charging-network')} className="hover:text-white transition-colors text-sm">Charging Map</button></li>
                <li><button onClick={() => handleLearnMore('battery-toolkit')} className="hover:text-white transition-colors text-sm">Battery Toolkit</button></li>
                <li><button onClick={() => handleLearnMore('energy-intelligence')} className="hover:text-white transition-colors text-sm">Analytics</button></li>
                <li><button onClick={() => handleLearnMore('sustainability')} className="hover:text-white transition-colors text-sm">Sustainability</button></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white text-sm font-semibold uppercase mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors text-sm">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors text-sm">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors text-sm">Press</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white text-sm font-semibold uppercase mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors text-sm">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors text-sm">Partner Program</a></li>
                <li><a href="#" className="hover:text-white transition-colors text-sm">API Docs</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white text-sm font-semibold uppercase mb-4">Contact</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <span>📧</span> info@safaricharge.co.ke
                </li>
                <li className="flex items-center gap-2">
                  <span>📞</span> +254 700 000 000
                </li>
                <li className="flex items-center gap-2">
                  <span>📍</span> Nairobi, Kenya
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-6 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#235347] to-[#052659] flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-white">SafariCharge</span>
            </div>
            <p className="text-sm text-gray-500">© 2025 SafariCharge. All rights reserved. Powering Africa's Electric Future.</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-white transition-colors text-sm">Privacy</a>
              <a href="#" className="hover:text-white transition-colors text-sm">Terms</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-xl border-t border-gray-100 md:hidden z-50">
        <Button 
          onClick={onGetStarted}
          className="w-full bg-gradient-to-r from-[#235347] to-[#052659] text-white h-12 shadow-lg"
        >
          <Zap className="w-4 h-4 mr-2" />
          Sign In
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>

      {/* Learn More Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
          {featureDetail && (
            <>
              <DialogHeader>
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-2xl bg-gradient-to-br ${featureDetail.gradient} shadow-lg`}>
                    <featureDetail.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <DialogTitle className="text-2xl font-bold text-gray-900">{featureDetail.title}</DialogTitle>
                    <DialogDescription className="text-gray-600 mt-2 text-base">
                      {featureDetail.description}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              
              <div className="space-y-6 mt-6">
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {featureDetail.stats.map((stat, idx) => (
                    <div key={idx} className="text-center p-4 rounded-xl bg-[#f0f7f5]">
                      <div className="text-2xl font-bold bg-gradient-to-r from-[#235347] to-[#052659] bg-clip-text text-transparent">{stat.value}</div>
                      <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* Features */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4 text-lg">Key Features</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {featureDetail.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 hover:bg-[#f0f7f5] transition-colors">
                        <div className={`p-2 rounded-lg bg-gradient-to-br ${featureDetail.gradient}`}>
                          <feature.icon className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{feature.title}</p>
                          <p className="text-sm text-gray-600 mt-1">{feature.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Benefits */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4 text-lg">Benefits</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {featureDetail.benefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-3 rounded-lg bg-[#f0f7f5]">
                        <CheckCircle className="w-4 h-4 text-[#235347]" />
                        <span className="text-sm text-gray-600">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Button 
                  onClick={onGetStarted} 
                  className="w-full bg-gradient-to-r from-[#235347] to-[#052659] hover:from-[#163832] hover:to-[#141E30] text-white"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
