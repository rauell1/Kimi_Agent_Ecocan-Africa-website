'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore, User } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  Zap,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  MapPin,
  Battery,
  Shield,
  Users,
  ArrowLeft,
  User as UserIcon,
  Phone,
  Building,
  CheckCircle,
  KeyRound,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

interface LoginProps {
  onBack?: () => void;
}

type AuthStep = 'credentials' | 'verification';

export function Login({ onBack }: LoginProps) {
  const login = useAuthStore((state) => state.login);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const [error, setError] = useState<string | null>(null);
  
  // Auth step for 2FA
  const [authStep, setAuthStep] = useState<AuthStep>('credentials');
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  
  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Verification form
  const [verificationCode, setVerificationCode] = useState('');
  
  // Registration form
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regAccountType, setRegAccountType] = useState<'PUBLIC' | 'EMPLOYEE' | 'FLEET'>('PUBLIC');

  // Handle login with API
  const handleLogin = async () => {
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        // Check for pending approval error
        if (responseData.pendingApproval) {
          setError(responseData.error);
        } else {
          setError(responseData.error || 'Login failed');
        }
        setIsLoading(false);
        return;
      }

      // Check if user can skip verification (already verified email)
      if (responseData.skipVerification && responseData.user) {
        // Log in directly without 2FA
        login(responseData.user as User);
        setIsLoading(false);
        return;
      }

      // Show verification step for users who need it
      setPendingUserId(responseData.userId);
      setPendingEmail(responseData.email);
      setAuthStep('verification');
      setIsLoading(false);
    } catch (err) {
      setError('Failed to connect to server');
      setIsLoading(false);
    }
  };

  // Handle verification code submission
  const handleVerify = async () => {
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: pendingEmail,
          code: verificationCode,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        setError(responseData.error || 'Verification failed');
        setIsLoading(false);
        return;
      }

      // Log in the user
      login(responseData.user as User);
      setIsLoading(false);
    } catch (err) {
      setError('Failed to verify code');
      setIsLoading(false);
    }
  };

  // Handle registration with API
  const handleRegister = async () => {
    if (regPassword !== regConfirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          phone: regPhone,
          password: regPassword,
          accountType: regAccountType,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        setError(responseData.error || 'Registration failed');
        setIsLoading(false);
        return;
      }

      // Check if this is an employee registration pending approval
      if (responseData.isApproved === false && responseData.role === 'EMPLOYEE') {
        setError(null);
        // Show success message for employee pending approval
        toast.success('Employee account created! Pending admin approval.');
        // Redirect to a success/pending message
        setAuthStep('verification'); // Keep in verification flow to show message
        setPendingEmail(responseData.email);
        setPendingUserId(responseData.userId);
        setIsLoading(false);
        return;
      }

      // Show verification step for new account
      setPendingUserId(responseData.userId);
      setPendingEmail(responseData.email);
      setAuthStep('verification');
      setIsLoading(false);
    } catch (err) {
      setError('Failed to create account');
      setIsLoading(false);
    }
  };

  const features = [
    { icon: MapPin, label: 'Real-time station finder' },
    { icon: Battery, label: 'Battery health toolkit (Premium)' },
    { icon: Shield, label: 'Secure payments' },
    { icon: Users, label: 'Fleet management' },
  ];

  // Verification step UI
  if (authStep === 'verification') {
    return (
      <div className="min-h-screen flex flex-col lg:flex-row">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#051F20] via-[#163832] to-[#235347] p-8 flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '50px 50px'
            }} />
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#8EB69B] to-[#235347] shadow-xl">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <div>
                <span className="text-2xl font-bold text-white">SafariCharge</span>
                <p className="text-xs text-[#8EB69B] tracking-wide">POWERING AFRICA'S FUTURE</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 space-y-8"
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-[#8EB69B]/20">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-xl bg-[#8EB69B]">
                  <KeyRound className="h-6 w-6 text-[#051F20]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Two-Factor Authentication</h3>
                  <p className="text-sm text-white/60">Keeping your account secure</p>
                </div>
              </div>
              <p className="text-white/80 text-sm leading-relaxed">
                We've sent a verification code to your email. Enter the 6-digit code below to complete your login.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: Shield, value: '256-bit', label: 'Encryption' },
                { icon: KeyRound, value: '2FA', label: 'Protection' },
                { icon: CheckCircle, value: 'Secure', label: 'Login' },
              ].map((item, idx) => (
                <div key={idx} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                  <item.icon className="h-5 w-5 text-[#8EB69B] mx-auto mb-2" />
                  <div className="text-sm font-medium text-white">{item.value}</div>
                  <div className="text-xs text-white/60">{item.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="relative z-10 text-sm text-white/60">
            © 2025 SafariCharge Ltd. All rights reserved.
          </div>
        </div>

        {/* Right Side - Verification Form */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-8 bg-white">
          <div className="w-full max-w-md space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key="verification"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center"
              >
                <div className="flex justify-center mb-4">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-[#235347] to-[#163832]">
                    <Mail className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-[#051F20]">Check your email</h2>
                <p className="text-[#235347] mt-2">
                  We sent a verification code to<br />
                  <span className="font-medium">{pendingEmail}</span>
                </p>
              </motion.div>
            </AnimatePresence>

            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6 space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-red-600 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-[#051F20]">Verification Code</Label>
                  <Input
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="text-center text-2xl tracking-widest h-14 border-[#8EB69B] focus:border-[#235347] font-mono"
                    maxLength={6}
                  />
                </div>

                <Button 
                  className="w-full bg-gradient-to-r from-[#235347] to-[#163832] hover:from-[#163832] hover:to-[#0B2B26] text-white h-12" 
                  onClick={handleVerify}
                  disabled={isLoading || verificationCode.length !== 6}
                >
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                  Verify & Sign In
                </Button>

                <div className="text-center space-y-2">
                  <p className="text-sm text-[#235347]">
                    Didn't receive the code?
                  </p>
                  <Button 
                    variant="ghost" 
                    onClick={() => {
                      setAuthStep('credentials');
                      setError(null);
                    }}
                    className="text-[#235347] hover:bg-[#f0f7f5]"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try again
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Main login/register UI
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#051F20] via-[#163832] to-[#235347] p-8 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }} />
        </div>
        
        {/* Animated Background Elements */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2]
          }}
          transition={{ duration: 5, repeat: Infinity }}
          className="absolute top-20 right-20 w-64 h-64 rounded-full bg-[#8EB69B]/20 blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.15, 0.25, 0.15]
          }}
          transition={{ duration: 6, repeat: Infinity, delay: 2 }}
          className="absolute bottom-40 left-10 w-80 h-80 rounded-full bg-[#235347]/30 blur-3xl"
        />
        
        {/* Logo */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#8EB69B] to-[#235347] shadow-xl">
              <Zap className="h-8 w-8 text-white" />
            </div>
            <div>
              <span className="text-2xl font-bold text-white">SafariCharge</span>
              <p className="text-xs text-[#8EB69B] tracking-wide">POWERING AFRICA'S FUTURE</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative z-10 space-y-8"
        >
          <div>
            <h1 className="text-4xl font-bold text-white leading-tight mb-4">
              Your Gateway to<br />
              <span className="text-[#8EB69B]">Electric Mobility</span>
            </h1>
            <p className="text-lg text-white/80 leading-relaxed">
              Access Kenya's largest EV charging network. Find stations, monitor your charging sessions, 
              manage your fleet, and track your carbon footprint - all in one place.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: MapPin, value: '254+', label: 'Charging Points' },
              { icon: Battery, value: '11', label: 'Counties' },
              { icon: Shield, value: '24/7', label: 'Support' },
              { icon: Users, value: '10K+', label: 'Members' },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + idx * 0.1 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-[#8EB69B]/20"
              >
                <stat.icon className="h-5 w-5 text-[#8EB69B] mb-2" />
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-white/60">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="relative z-10 text-sm text-white/60"
        >
          © 2025 SafariCharge Ltd. All rights reserved.
        </motion.div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-8 bg-white">
        <div className="w-full max-w-md space-y-6">
          {/* Back Button */}
          {onBack && (
            <Button variant="ghost" onClick={onBack} className="gap-2 -ml-2 text-[#051F20]">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          )}

          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#8EB69B] to-[#235347] shadow-lg">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-[#051F20]">SafariCharge</span>
              <p className="text-[10px] text-[#235347]">POWERING AFRICA</p>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center lg:text-left"
          >
            <h2 className="text-2xl font-bold text-[#051F20]">Welcome</h2>
            <p className="text-[#235347] mt-1">
              Sign in to access your dashboard
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardContent className="p-0">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <div className="p-6 pb-0">
                    <TabsList className="grid w-full grid-cols-2 bg-[#DAF1DE]">
                      <TabsTrigger value="login" className="data-[state=active]:bg-[#235347] data-[state=active]:text-white">Sign In</TabsTrigger>
                      <TabsTrigger value="register" className="data-[state=active]:bg-[#235347] data-[state=active]:text-white">Register</TabsTrigger>
                    </TabsList>
                  </div>
                  
                  <TabsContent value="login" className="p-6 pt-4 space-y-4">
                    {error && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-red-600 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        {error}
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-[#051F20]">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#235347]" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          className="pl-10 border-[#8EB69B] focus:border-[#235347]"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-[#051F20]">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#235347]" />
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter your password"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          className="pl-10 pr-10 border-[#8EB69B] focus:border-[#235347]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#235347] hover:text-[#051F20]"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="rounded border-[#8EB69B] accent-[#235347]" />
                        <span className="text-[#235347]">Remember me</span>
                      </label>
                      <a href="#" className="text-[#235347] hover:text-[#051F20] hover:underline">
                        Forgot password?
                      </a>
                    </div>

                    <Button 
                      className="w-full bg-gradient-to-r from-[#235347] to-[#163832] hover:from-[#163832] hover:to-[#0B2B26] text-white h-11" 
                      onClick={handleLogin}
                      disabled={isLoading || !loginEmail || !loginPassword}
                    >
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Sign In
                    </Button>

                  </TabsContent>

                  <TabsContent value="register" className="p-6 pt-4 space-y-4">
                    {error && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-red-600 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        {error}
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label className="text-[#051F20]">Account Type</Label>
                      <div className="flex gap-2 flex-wrap">
                        <Button
                          type="button"
                          variant={regAccountType === 'PUBLIC' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setRegAccountType('PUBLIC')}
                          className={regAccountType === 'PUBLIC' ? 'bg-[#235347] text-white' : 'border-[#8EB69B]'}
                        >
                          <UserIcon className="h-3 w-3 mr-1" />
                          Public
                        </Button>
                        <Button
                          type="button"
                          variant={regAccountType === 'FLEET' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setRegAccountType('FLEET')}
                          className={regAccountType === 'FLEET' ? 'bg-[#5483B3] text-white' : 'border-[#8EB69B]'}
                        >
                          <Users className="h-3 w-3 mr-1" />
                          Fleet
                        </Button>
                        <Button
                          type="button"
                          variant={regAccountType === 'EMPLOYEE' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setRegAccountType('EMPLOYEE')}
                          className={regAccountType === 'EMPLOYEE' ? 'bg-[#235347] text-white' : 'border-[#8EB69B]'}
                        >
                          <Building className="h-3 w-3 mr-1" />
                          Employee
                        </Button>
                      </div>
                      <p className="text-xs text-[#235347]/70 mt-1">
                        {regAccountType === 'PUBLIC' && 'For individual EV owners and drivers'}
                        {regAccountType === 'FLEET' && 'For fleet managers to manage multiple vehicles'}
                        {regAccountType === 'EMPLOYEE' && 'For SafariCharge staff and partners (requires admin approval)'}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reg-name" className="text-[#051F20]">Full Name</Label>
                      <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#235347]" />
                        <Input
                          id="reg-name"
                          placeholder="Your full name"
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          className="pl-10 border-[#8EB69B] focus:border-[#235347]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="reg-email" className="text-[#051F20]">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#235347]" />
                          <Input
                            id="reg-email"
                            type="email"
                            placeholder="Email"
                            value={regEmail}
                            onChange={(e) => setRegEmail(e.target.value)}
                            className="pl-10 border-[#8EB69B] focus:border-[#235347]"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reg-phone" className="text-[#051F20]">Phone</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#235347]" />
                          <Input
                            id="reg-phone"
                            placeholder="+254"
                            value={regPhone}
                            onChange={(e) => setRegPhone(e.target.value)}
                            className="pl-10 border-[#8EB69B] focus:border-[#235347]"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="reg-password" className="text-[#051F20]">Password</Label>
                        <Input
                          id="reg-password"
                          type="password"
                          placeholder="Create password"
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          className="border-[#8EB69B] focus:border-[#235347]"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reg-confirm" className="text-[#051F20]">Confirm</Label>
                        <Input
                          id="reg-confirm"
                          type="password"
                          placeholder="Confirm password"
                          value={regConfirmPassword}
                          onChange={(e) => setRegConfirmPassword(e.target.value)}
                          className="border-[#8EB69B] focus:border-[#235347]"
                        />
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <input type="checkbox" className="mt-1 rounded border-[#8EB69B] accent-[#235347]" />
                      <span className="text-xs text-[#235347]">
                        I agree to the <a href="#" className="text-[#051F20] hover:underline font-medium">Terms of Service</a> and{' '}
                        <a href="#" className="text-[#051F20] hover:underline font-medium">Privacy Policy</a>
                      </span>
                    </div>

                    <Button 
                      className="w-full bg-gradient-to-r from-[#235347] to-[#163832] hover:from-[#163832] hover:to-[#0B2B26] text-white h-11" 
                      onClick={handleRegister}
                      disabled={isLoading || !regName || !regEmail || !regPassword}
                    >
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Create Account
                    </Button>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>

          {/* Member Benefits */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-dashed border-[#8EB69B] bg-white/50">
              <CardContent className="p-4">
                <p className="text-sm font-medium text-center mb-3 text-[#051F20]">Member Benefits</p>
                <div className="grid grid-cols-2 gap-2">
                  {features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs">
                      <CheckCircle className="h-3.5 w-3.5 text-[#235347]" />
                      <span className="text-[#235347]">{feature.label}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
