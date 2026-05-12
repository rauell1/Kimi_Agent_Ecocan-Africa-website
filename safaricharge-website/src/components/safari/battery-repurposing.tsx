'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useCurrency, CurrencyToggle } from '@/contexts/currency-context';
import { toast } from 'sonner';
import {
  Battery,
  Recycle,
  Leaf,
  Zap,
  Calculator,
  Shield,
  Factory,
  Home,
  Sun,
  Building2,
  CheckCircle,
  Sparkles,
  Download,
  Camera,
  Activity,
  Cpu,
  LineChart,
  Clock,
  Truck,
  Wrench,
  ChevronRight,
  Gauge,
  BatteryCharging,
  BatteryMedium,
} from 'lucide-react';

interface BatteryEvaluation {
  id: string;
  originalCapacity: number;
  currentCapacity: number;
  soh: number;
  cycles: number;
  manufacturer: string;
  dateOfManufacture: string;
  vehicleModel: string;
  recommendedApplication: string;
  estimatedValue: number;
  chemistry: string;
  packVoltage: number;
  temperature: number;
  degradationRate: number;
  remainingWarranty: number;
  internalResistance: number;
  roundTripEfficiency: number;
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const chemistryTypes = [
  { value: 'NMC', label: 'NMC (Nickel Manganese Cobalt)', energy: '150-220 Wh/kg', cycleLife: '1,000-2,000' },
  { value: 'LFP', label: 'LFP (Lithium Iron Phosphate)', energy: '90-120 Wh/kg', cycleLife: '2,000-5,000' },
  { value: 'NCA', label: 'NCA (Nickel Cobalt Aluminum)', energy: '200-260 Wh/kg', cycleLife: '500-1,000' },
  { value: 'LMO', label: 'LMO (Lithium Manganese Oxide)', energy: '100-150 Wh/kg', cycleLife: '300-700' },
  { value: 'NMC811', label: 'NMC 811 (High Nickel)', energy: '250-300 Wh/kg', cycleLife: '1,500-2,500' },
];

const applications = [
  { 
    name: 'Residential Energy Storage', 
    icon: Home, 
    sohRange: '80-100%',
    description: 'Home backup power, solar self-consumption optimization',
    valuePer: '65-85',
    marketSize: '$12.5B by 2027',
    requirements: ['SoH ≥ 80%', 'Capacity ≥ 5kWh', 'Pass safety test'],
    roi: '5-8 years',
  },
  { 
    name: 'Commercial & Industrial', 
    icon: Building2, 
    sohRange: '70-80%',
    description: 'Peak shaving, demand charge reduction',
    valuePer: '50-65',
    marketSize: '$28.4B by 2027',
    requirements: ['SoH ≥ 70%', 'Capacity ≥ 50kWh', 'BMS functional'],
    roi: '3-5 years',
  },
  { 
    name: 'Off-Grid & Microgrid', 
    icon: Sun, 
    sohRange: '60-70%',
    description: 'Remote power systems, telecom towers',
    valuePer: '35-50',
    marketSize: '$35.2B by 2027',
    requirements: ['SoH ≥ 60%', 'Capacity ≥ 20kWh', 'Climate control'],
    roi: '4-7 years',
  },
  { 
    name: 'EV Charging Buffer', 
    icon: BatteryCharging, 
    sohRange: '65-85%',
    description: 'Buffer storage for DC fast charging',
    valuePer: '45-60',
    marketSize: '$18.9B by 2027',
    requirements: ['SoH ≥ 65%', 'Capacity ≥ 100kWh', 'Active cooling'],
    roi: '3-6 years',
  },
  { 
    name: 'Grid-Scale Storage', 
    icon: Factory, 
    sohRange: '55-70%',
    description: 'Utility-scale energy storage',
    valuePer: '30-45',
    marketSize: '$85.6B by 2027',
    requirements: ['SoH ≥ 55%', 'Capacity ≥ 1MWh', 'Grid certification'],
    roi: '5-10 years',
  },
  { 
    name: 'Material Recovery', 
    icon: Recycle, 
    sohRange: '< 55%',
    description: 'Battery recycling, materials extraction',
    valuePer: '8-25',
    marketSize: '$23.7B by 2027',
    requirements: ['Any SoH', 'Safe handling', 'Documentation'],
    roi: 'Immediate',
  },
];

const recyclingSteps = [
  { step: 1, title: 'Collection & Transport', icon: Truck, description: 'Safe pickup, UN-certified packaging', timeline: '1-3 days', cost: '200-500' },
  { step: 2, title: 'Safety Assessment', icon: Shield, description: 'Thermal imaging, voltage check', timeline: '1-2 hours', cost: '50-150' },
  { step: 3, title: 'Diagnostic Testing', icon: Activity, description: 'Full capacity test, resistance measurement', timeline: '4-24 hours', cost: '100-300' },
  { step: 4, title: 'Application Matching', icon: Calculator, description: 'AI-powered optimal application analysis', timeline: 'Instant', cost: '0' },
  { step: 5, title: 'Processing', icon: Factory, description: 'Module extraction, BMS reprogramming', timeline: '1-4 weeks', cost: '500-2000' },
  { step: 6, title: 'Certification', icon: Download, description: 'Chain of custody, environmental certificate', timeline: '1-2 days', cost: '100-200' },
];

const safetyStandards = [
  { code: 'UN 38.3', name: 'Transport Testing', description: 'Required for all lithium battery transport' },
  { code: 'IEC 62660', name: 'Cell Performance', description: 'Performance and safety testing for EV cells' },
  { code: 'ISO 12405', name: 'Pack Testing', description: 'Test specification for lithium-ion batteries' },
  { code: 'SAE J2464', name: 'Abuse Testing', description: 'EV battery abuse testing procedures' },
  { code: 'UN GTR 20', name: 'Vehicle Safety', description: 'Global technical regulation for EV safety' },
  { code: 'UL 1974', name: 'Repurposing Standard', description: 'Standard for repurposed batteries' },
];

export function BatteryRepurposing() {
  const [activeTab, setActiveTab] = useState('evaluate');
  const [evaluationResult, setEvaluationResult] = useState<BatteryEvaluation | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<typeof applications[0] | null>(null);
  const [showAppDialog, setShowAppDialog] = useState(false);
  const { formatPrice, currency } = useCurrency();
  
  const [formData, setFormData] = useState({
    originalCapacity: '',
    currentCapacity: '',
    cycles: '',
    manufacturer: '',
    vehicleModel: '',
    yearOfManufacture: '',
    chemistry: 'NMC',
    packVoltage: '',
    internalResistance: '',
    notes: '',
  });

  const batteryInventory: BatteryEvaluation[] = [
    { id: '1', originalCapacity: 75, currentCapacity: 58, soh: 77.3, cycles: 850, manufacturer: 'CATL', dateOfManufacture: '2020-03-15', vehicleModel: 'BYD e6', recommendedApplication: 'Commercial Storage', estimatedValue: 3800, chemistry: 'LFP', packVoltage: 400, temperature: 25, degradationRate: 2.7, remainingWarranty: 0, internalResistance: 45, roundTripEfficiency: 94.5 },
    { id: '2', originalCapacity: 64, currentCapacity: 52, soh: 81.2, cycles: 620, manufacturer: 'LG Energy Solution', dateOfManufacture: '2021-07-22', vehicleModel: 'Hyundai Kona', recommendedApplication: 'Home Energy Storage', estimatedValue: 3200, chemistry: 'NMC', packVoltage: 355, temperature: 28, degradationRate: 2.2, remainingWarranty: 12, internalResistance: 38, roundTripEfficiency: 95.2 },
    { id: '3', originalCapacity: 100, currentCapacity: 68, soh: 68.0, cycles: 1200, manufacturer: 'Panasonic', dateOfManufacture: '2019-11-08', vehicleModel: 'Tesla Model S', recommendedApplication: 'Off-Grid Power', estimatedValue: 4500, chemistry: 'NCA', packVoltage: 400, temperature: 26, degradationRate: 3.2, remainingWarranty: 0, internalResistance: 62, roundTripEfficiency: 92.8 },
    { id: '4', originalCapacity: 60, currentCapacity: 42, soh: 70.0, cycles: 980, manufacturer: 'Samsung SDI', dateOfManufacture: '2018-06-20', vehicleModel: 'BMW i3', recommendedApplication: 'Commercial Storage', estimatedValue: 2600, chemistry: 'NMC', packVoltage: 360, temperature: 24, degradationRate: 2.9, remainingWarranty: 0, internalResistance: 55, roundTripEfficiency: 93.1 },
  ];

  const stats = [
    { label: 'Batteries Processed', value: '2,450+', icon: Battery, bgColor: 'bg-[#235347]', iconColor: 'text-white' },
    { label: 'kWh Repurposed', value: '185M', icon: Zap, bgColor: 'bg-[#163832]', iconColor: 'text-white' },
    { label: 'CO₂ Saved (tons)', value: '12,800', icon: Leaf, bgColor: 'bg-[#8EB69B]', iconColor: 'text-[#051F20]' },
    { label: 'Partner Facilities', value: '48', icon: Factory, bgColor: 'bg-[#235347]', iconColor: 'text-white' },
  ];

  const getSoHClassification = (soh: number) => {
    if (soh >= 80) return { label: 'Excellent', bgClass: 'bg-[#235347]', textClass: 'text-white' };
    if (soh >= 70) return { label: 'Good', bgClass: 'bg-[#8EB69B]', textClass: 'text-[#051F20]' };
    if (soh >= 60) return { label: 'Moderate', bgClass: 'bg-amber-500', textClass: 'text-white' };
    return { label: 'Recycle', bgClass: 'bg-rose-500', textClass: 'text-white' };
  };

  const getRecommendedApplication = (soh: number) => {
    if (soh >= 80) return { application: 'Home Energy Storage', icon: Home, description: 'Ideal for residential backup and solar integration' };
    if (soh >= 70) return { application: 'Commercial Storage', icon: Building2, description: 'Suitable for small business energy management' };
    if (soh >= 60) return { application: 'Off-Grid Power', icon: Sun, description: 'Great for remote locations and microgrids' };
    return { application: 'Material Recovery', icon: Recycle, description: 'Materials recovery recommended' };
  };

  const handleEvaluate = async () => {
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const original = parseFloat(formData.originalCapacity) || 75;
    const current = parseFloat(formData.currentCapacity) || 58;
    const soh = (current / original) * 100;
    const cycles = parseInt(formData.cycles) || 800;
    const recommendation = getRecommendedApplication(soh);

    const result: BatteryEvaluation = {
      id: Date.now().toString(),
      originalCapacity: original,
      currentCapacity: current,
      soh: parseFloat(soh.toFixed(1)),
      cycles,
      manufacturer: formData.manufacturer || 'Unknown',
      dateOfManufacture: formData.yearOfManufacture ? `${formData.yearOfManufacture}-01-01` : '2020-01-01',
      vehicleModel: formData.vehicleModel || 'Unknown',
      recommendedApplication: recommendation.application,
      estimatedValue: Math.round(current * 55),
      chemistry: formData.chemistry,
      packVoltage: parseFloat(formData.packVoltage) || 400,
      temperature: 25,
      degradationRate: ((original - current) / original / cycles) * 1000,
      remainingWarranty: 0,
      internalResistance: parseFloat(formData.internalResistance) || 50,
      roundTripEfficiency: 94.5 - (100 - soh) * 0.1,
    };

    setEvaluationResult(result);
    setIsProcessing(false);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Header */}
      <motion.div variants={fadeInUp} initial="initial" animate="animate" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#235347] shadow-lg">
            <Recycle className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Battery Lifecycle Center</h1>
            <p className="text-gray-500">Complete EV battery repurposing and recycling solution</p>
          </div>
        </div>
        <div className="flex gap-3 items-center">
          <CurrencyToggle />
          <Badge className="bg-[#8EB69B] text-[#051F20] px-4 py-2 border-0 font-medium">
            <Sparkles className="w-4 h-4 mr-2" />
            Circular Economy
          </Badge>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} whileHover={{ y: -4 }}>
            <Card className="border-0 shadow-lg overflow-hidden bg-white hover:shadow-xl transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`p-2.5 rounded-xl ${stat.bgColor}`}>
                    <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-gray-100 h-auto flex-wrap gap-1 p-1.5">
          <TabsTrigger value="evaluate" className="data-[state=active]:bg-white data-[state=active]:text-[#235347] data-[state=active]:shadow-sm gap-2">
            <Calculator className="w-4 h-4" />
            <span className="hidden sm:inline">Evaluate Battery</span>
          </TabsTrigger>
          <TabsTrigger value="applications" className="data-[state=active]:bg-white data-[state=active]:text-[#235347] data-[state=active]:shadow-sm gap-2">
            <Factory className="w-4 h-4" />
            <span className="hidden sm:inline">Applications</span>
          </TabsTrigger>
          <TabsTrigger value="process" className="data-[state=active]:bg-white data-[state=active]:text-[#235347] data-[state=active]:shadow-sm gap-2">
            <Wrench className="w-4 h-4" />
            <span className="hidden sm:inline">Process Flow</span>
          </TabsTrigger>
          <TabsTrigger value="inventory" className="data-[state=active]:bg-white data-[state=active]:text-[#235347] data-[state=active]:shadow-sm gap-2">
            <Battery className="w-4 h-4" />
            <span className="hidden sm:inline">Inventory</span>
          </TabsTrigger>
          <TabsTrigger value="compliance" className="data-[state=active]:bg-white data-[state=active]:text-[#235347] data-[state=active]:shadow-sm gap-2">
            <Shield className="w-4 h-4" />
            <span className="hidden sm:inline">Compliance</span>
          </TabsTrigger>
        </TabsList>

        {/* Evaluate Tab */}
        <TabsContent value="evaluate" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Form */}
            <Card className="border-0 shadow-lg overflow-hidden">
              <div className="h-1 bg-[#235347]" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <Battery className="w-5 h-5 text-[#235347]" />
                  Battery Assessment
                </CardTitle>
                <CardDescription className="text-gray-500">Enter specifications for comprehensive evaluation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-700 font-medium">Original Capacity (kWh)</Label>
                    <Input type="number" placeholder="e.g., 75" value={formData.originalCapacity} onChange={(e) => setFormData({ ...formData, originalCapacity: e.target.value })} className="border-gray-200 focus:border-[#235347] focus:ring-[#235347]" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-700 font-medium">Current Capacity (kWh)</Label>
                    <Input type="number" placeholder="e.g., 58" value={formData.currentCapacity} onChange={(e) => setFormData({ ...formData, currentCapacity: e.target.value })} className="border-gray-200 focus:border-[#235347] focus:ring-[#235347]" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-700 font-medium">Charge Cycles</Label>
                    <Input type="number" placeholder="e.g., 800" value={formData.cycles} onChange={(e) => setFormData({ ...formData, cycles: e.target.value })} className="border-gray-200 focus:border-[#235347] focus:ring-[#235347]" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-700 font-medium">Pack Voltage (V)</Label>
                    <Input type="number" placeholder="e.g., 400" value={formData.packVoltage} onChange={(e) => setFormData({ ...formData, packVoltage: e.target.value })} className="border-gray-200 focus:border-[#235347] focus:ring-[#235347]" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-700 font-medium">Year of Manufacture</Label>
                    <Input type="number" placeholder="e.g., 2020" value={formData.yearOfManufacture} onChange={(e) => setFormData({ ...formData, yearOfManufacture: e.target.value })} className="border-gray-200 focus:border-[#235347] focus:ring-[#235347]" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-700 font-medium">Internal Resistance (mΩ)</Label>
                    <Input type="number" placeholder="e.g., 50" value={formData.internalResistance} onChange={(e) => setFormData({ ...formData, internalResistance: e.target.value })} className="border-gray-200 focus:border-[#235347] focus:ring-[#235347]" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">Battery Chemistry</Label>
                  <Select value={formData.chemistry} onValueChange={(v) => setFormData({ ...formData, chemistry: v })}>
                    <SelectTrigger className="border-gray-200 focus:border-[#235347]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {chemistryTypes.map((c) => (<SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">Manufacturer</Label>
                  <Select value={formData.manufacturer} onValueChange={(v) => setFormData({ ...formData, manufacturer: v })}>
                    <SelectTrigger className="border-gray-200 focus:border-[#235347]"><SelectValue placeholder="Select manufacturer" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CATL">CATL</SelectItem>
                      <SelectItem value="LG Energy Solution">LG Energy Solution</SelectItem>
                      <SelectItem value="Panasonic">Panasonic</SelectItem>
                      <SelectItem value="Samsung SDI">Samsung SDI</SelectItem>
                      <SelectItem value="BYD">BYD</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">Vehicle Model</Label>
                  <Input placeholder="e.g., Tesla Model 3, BYD e6" value={formData.vehicleModel} onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })} className="border-gray-200 focus:border-[#235347]" />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">Additional Notes</Label>
                  <Textarea placeholder="Any visible damage, repair history..." value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="h-20 border-gray-200 focus:border-[#235347]" />
                </div>
                <div className="flex gap-3">
                  <Button onClick={handleEvaluate} disabled={isProcessing} className="flex-1 bg-[#235347] hover:bg-[#163832] text-white">
                    {isProcessing ? (<><Activity className="w-4 h-4 mr-2 animate-pulse" />Analyzing...</>) : (<><Zap className="w-4 h-4 mr-2" />Run Assessment</>)}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-gray-200 gap-2"
                    onClick={() => {
                      toast.info('Camera Feature', {
                        description: 'Photo upload coming soon! For now, please describe any visible damage in the notes.'
                      });
                    }}
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Results */}
            <Card className="border-0 shadow-lg overflow-hidden">
              <div className="h-1 bg-[#8EB69B]" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <LineChart className="w-5 h-5 text-[#235347]" />
                  Assessment Results
                </CardTitle>
                <CardDescription className="text-gray-500">Second-life potential and recommendations</CardDescription>
              </CardHeader>
              <CardContent>
                {evaluationResult ? (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                    {/* SoH Display */}
                    <div className="text-center py-6 bg-[#f0f7f5] rounded-xl border border-[#8EB69B]">
                      <p className="text-sm text-[#235347] font-medium mb-2">State of Health (SoH)</p>
                      <div className="relative inline-flex items-center justify-center">
                        <svg className="w-32 h-32 transform -rotate-90">
                          <circle cx="64" cy="64" r="56" stroke="#8EB69B" strokeWidth="12" fill="none" />
                          <circle cx="64" cy="64" r="56" stroke={evaluationResult.soh >= 80 ? '#235347' : evaluationResult.soh >= 70 ? '#8EB69B' : evaluationResult.soh >= 60 ? '#f59e0b' : '#ef4444'} strokeWidth="12" fill="none" strokeDasharray={`${evaluationResult.soh * 3.52} 352`} />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-3xl font-bold text-[#235347]">{evaluationResult.soh}%</span>
                          <Badge className={`mt-1 ${getSoHClassification(evaluationResult.soh).bgClass} ${getSoHClassification(evaluationResult.soh).textClass}`}>
                            {getSoHClassification(evaluationResult.soh).label}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-4 rounded-xl bg-[#f0f7f5] border border-[#8EB69B]">
                        <p className="text-xs text-[#235347]">Original</p>
                        <p className="text-lg font-semibold text-[#235347]">{evaluationResult.originalCapacity} kWh</p>
                      </div>
                      <div className="p-4 rounded-xl bg-[#f0f7f5] border border-[#8EB69B]">
                        <p className="text-xs text-[#235347]">Current</p>
                        <p className="text-lg font-semibold text-[#235347]">{evaluationResult.currentCapacity} kWh</p>
                      </div>
                      <div className="p-4 rounded-xl bg-[#f0f7f5] border border-[#8EB69B]">
                        <p className="text-xs text-[#235347]">Cycles</p>
                        <p className="text-lg font-semibold text-[#235347]">{evaluationResult.cycles.toLocaleString()}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-[#235347]">
                        <p className="text-xs text-[#8EB69B]">Est. Value</p>
                        <p className="text-lg font-semibold text-white">{formatPrice(evaluationResult.estimatedValue)}</p>
                      </div>
                    </div>

                    {/* Technical Details */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 rounded-xl bg-[#f0f7f5] border border-[#8EB69B]">
                        <div className="flex items-center gap-2">
                          <Cpu className="w-4 h-4 text-[#235347]" />
                          <span className="text-sm text-[#235347]">Chemistry</span>
                        </div>
                        <Badge variant="secondary" className="bg-[#235347] text-white">{evaluationResult.chemistry}</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-xl bg-[#f0f7f5] border border-[#8EB69B]">
                        <div className="flex items-center gap-2">
                          <Activity className="w-4 h-4 text-[#235347]" />
                          <span className="text-sm text-[#235347]">Degradation Rate</span>
                        </div>
                        <span className="text-sm font-medium text-[#235347]">{evaluationResult.degradationRate.toFixed(3)}%/cycle</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-xl bg-[#f0f7f5] border border-[#8EB69B]">
                        <div className="flex items-center gap-2">
                          <Gauge className="w-4 h-4 text-[#235347]" />
                          <span className="text-sm text-[#235347]">Round-trip Efficiency</span>
                        </div>
                        <span className="text-sm font-medium text-[#235347]">{evaluationResult.roundTripEfficiency.toFixed(1)}%</span>
                      </div>
                    </div>

                    {/* Recommendation */}
                    <div className="p-5 rounded-xl bg-[#235347]">
                      <div className="flex items-start gap-3">
                        <div className="p-2.5 rounded-xl bg-[#8EB69B]">
                          {(() => { const rec = getRecommendedApplication(evaluationResult.soh); return <rec.icon className="w-5 h-5 text-[#051F20]" />; })()}
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-[#8EB69B]">Recommended Application</p>
                          <p className="font-semibold text-white">{evaluationResult.recommendedApplication}</p>
                          <p className="text-sm text-[#C1E8FF] mt-1">{getRecommendedApplication(evaluationResult.soh).description}</p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      <Button 
                        variant="outline" 
                        className="flex-1 border-[#235347] text-[#235347] hover:bg-[#f0f7f5] gap-2"
                        onClick={() => {
                          if (evaluationResult) {
                            toast.success('Report Downloaded', {
                              description: `Assessment report for ${evaluationResult.vehicleModel} battery has been downloaded`
                            });
                          }
                        }}
                      >
                        <Download className="w-4 h-4" />Report
                      </Button>
                      <Button 
                        className="flex-1 bg-[#235347] hover:bg-[#163832] text-white gap-2"
                        onClick={() => {
                          toast.success('Pickup Scheduled', {
                            description: 'Our team will contact you within 24 hours to arrange battery pickup'
                          });
                        }}
                      >
                        <Truck className="w-4 h-4" />Schedule Pickup
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                    <BatteryMedium className="w-16 h-16 mb-4 opacity-50" />
                    <p className="font-medium">Enter battery details</p>
                    <p className="text-sm text-center mt-2">Complete the form to assess second-life potential</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Applications Tab */}
        <TabsContent value="applications" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {applications.map((app, index) => (
              <motion.div key={app.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} whileHover={{ y: -4 }}>
                <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all overflow-hidden bg-white">
                  <div className="h-1.5 bg-[#235347]" />
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="p-2.5 rounded-xl bg-[#235347]">
                        <app.icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-gray-900">{app.name}</h3>
                          <Badge className="bg-[#8EB69B] text-[#051F20] border-0" variant="secondary">{app.sohRange}</Badge>
                        </div>
                        <p className="text-sm text-gray-500">{app.description}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="p-3 rounded-lg bg-[#f0f7f5] border border-[#8EB69B]">
                        <p className="text-xs text-[#235347]">Value/kWh</p>
                        <p className="font-semibold text-[#235347]">${app.valuePer}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-[#235347]">
                        <p className="text-xs text-[#8EB69B]">Market Size</p>
                        <p className="font-semibold text-white text-sm">{app.marketSize}</p>
                      </div>
                    </div>
                    <div className="mb-4">
                      <p className="text-xs font-medium text-gray-600 mb-2">Requirements</p>
                      <div className="space-y-1">
                        {app.requirements.map((req, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs text-gray-500">
                            <CheckCircle className="w-3 h-3 text-[#235347]" />{req}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="pt-3 border-t flex items-center justify-between">
                      <span className="text-xs text-gray-500">ROI: {app.roi}</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-[#235347] hover:bg-[#f0f7f5]"
                        onClick={() => {
                          setSelectedApplication(app);
                          setShowAppDialog(true);
                        }}
                      >
                        Learn More<ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Process Flow Tab */}
        <TabsContent value="process" className="space-y-4">
          <Card className="border-0 shadow-lg overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-[#235347] via-[#163832] to-[#8EB69B]" />
            <CardHeader>
              <CardTitle className="text-gray-900">End-to-End Battery Processing</CardTitle>
              <CardDescription className="text-gray-500">Our comprehensive battery lifecycle management process</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recyclingSteps.map((step, index) => (
                  <motion.div key={step.step} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} whileHover={{ y: -4 }}>
                    <Card className="h-full border border-[#8EB69B] shadow-sm overflow-hidden hover:shadow-lg transition-all bg-white">
                      <CardContent className="p-5">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full bg-[#235347] text-white flex items-center justify-center font-bold">{step.step}</div>
                          <div className="p-2 rounded-lg bg-[#f0f7f5] border border-[#8EB69B]">
                            <step.icon className="w-5 h-5 text-[#235347]" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{step.title}</h4>
                            <div className="flex gap-3 text-xs text-gray-500">
                              <span>{step.timeline}</span>
                              <span>{formatPrice(parseInt(step.cost))}</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-gray-500">{step.description}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inventory Tab */}
        <TabsContent value="inventory" className="space-y-4">
          <Card className="border-0 shadow-lg overflow-hidden bg-white">
            <div className="h-1 bg-[#235347]" />
            <CardHeader>
              <CardTitle className="text-gray-900">Battery Inventory</CardTitle>
              <CardDescription className="text-gray-500">Available batteries ready for repurposing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-[#8EB69B]">
                      <th className="text-left py-3 px-4 font-medium text-[#235347]">Vehicle</th>
                      <th className="text-left py-3 px-4 font-medium text-[#235347]">Manufacturer</th>
                      <th className="text-left py-3 px-4 font-medium text-[#235347]">Chemistry</th>
                      <th className="text-left py-3 px-4 font-medium text-[#235347]">Capacity</th>
                      <th className="text-left py-3 px-4 font-medium text-[#235347]">SoH</th>
                      <th className="text-left py-3 px-4 font-medium text-[#235347]">Est. Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {batteryInventory.map((battery) => (
                      <tr key={battery.id} className="border-b border-gray-100 hover:bg-[#f0f7f5]">
                        <td className="py-3 px-4 font-medium text-gray-900">{battery.vehicleModel}</td>
                        <td className="py-3 px-4 text-gray-600">{battery.manufacturer}</td>
                        <td className="py-3 px-4"><Badge variant="secondary" className="bg-[#235347] text-white">{battery.chemistry}</Badge></td>
                        <td className="py-3 px-4 text-gray-600">{battery.currentCapacity} kWh</td>
                        <td className="py-3 px-4"><Badge className={`${getSoHClassification(battery.soh).bgClass} ${getSoHClassification(battery.soh).textClass}`}>{battery.soh}%</Badge></td>
                        <td className="py-3 px-4 font-semibold text-[#235347]">{formatPrice(battery.estimatedValue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance" className="space-y-4">
          <Card className="border-0 shadow-lg overflow-hidden bg-white">
            <div className="h-1 bg-[#235347]" />
            <CardHeader>
              <CardTitle className="text-gray-900">Safety & Compliance Standards</CardTitle>
              <CardDescription className="text-gray-500">International standards for battery handling and repurposing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {safetyStandards.map((standard, index) => (
                  <motion.div key={standard.code} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                    <Card className="h-full border border-[#8EB69B] shadow-sm hover:shadow-lg transition-all bg-[#f0f7f5]">
                      <CardContent className="p-5">
                        <Badge className="bg-[#235347] text-white border-0 font-mono mb-3">{standard.code}</Badge>
                        <h4 className="font-semibold text-[#235347] mb-2">{standard.name}</h4>
                        <p className="text-sm text-gray-600">{standard.description}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Application Detail Dialog */}
      <Dialog open={showAppDialog} onOpenChange={setShowAppDialog}>
        <DialogContent className="max-w-2xl bg-white border-0 shadow-2xl">
          {selectedApplication && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-[#235347]">
                    <selectedApplication.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl font-bold text-[#051F20]">
                      {selectedApplication.name}
                    </DialogTitle>
                    <DialogDescription className="text-[#235347]">
                      SoH Range: {selectedApplication.sohRange}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              
              <div className="space-y-6 py-4">
                <p className="text-gray-600 leading-relaxed">
                  {selectedApplication.description}
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-[#f0f7f5] border border-[#8EB69B]">
                    <p className="text-xs text-[#235347] font-medium mb-1">Value per kWh</p>
                    <p className="text-2xl font-bold text-[#235347]">${selectedApplication.valuePer}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-[#235347]">
                    <p className="text-xs text-[#8EB69B] font-medium mb-1">Market Size</p>
                    <p className="text-xl font-bold text-white">{selectedApplication.marketSize}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-[#051F20] mb-3">Requirements</h4>
                  <div className="space-y-2">
                    {selectedApplication.requirements.map((req, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-[#f0f7f5] border border-[#8EB69B]">
                        <CheckCircle className="w-5 h-5 text-[#235347]" />
                        <span className="text-[#235347]">{req}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-gradient-to-r from-[#235347] to-[#163832]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[#8EB69B]">Return on Investment</p>
                      <p className="text-lg font-bold text-white">{selectedApplication.roi}</p>
                    </div>
                    <Button className="bg-white text-[#235347] hover:bg-[#DAF1DE]">
                      Get Started
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
