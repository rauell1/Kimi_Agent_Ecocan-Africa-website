'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users,
  Search,
  Shield,
  UserCheck,
  UserX,
  Clock,
  CheckCircle,
  XCircle,
  Mail,
  Phone,
  Calendar,
  Lock,
  AlertCircle,
  Loader2,
  Building,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';

interface Employee {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  role: string;
  isApproved: boolean;
  securityLevel: string | null;
  requestedRole: string | null;
  createdAt: string;
  approvedAt: string | null;
  approvedBy: string | null;
}

interface EmployeeStats {
  total: number;
  pending: number;
  approved: number;
}

const securityLevelConfig: Record<string, { label: string; color: string; description: string }> = {
  BASIC: { label: 'Basic', color: 'bg-gray-100 text-gray-700 border-gray-200', description: 'View stations, own profile' },
  STANDARD: { label: 'Standard', color: 'bg-blue-50 text-blue-700 border-blue-200', description: 'Handle customer queries' },
  ELEVATED: { label: 'Elevated', color: 'bg-purple-50 text-purple-700 border-purple-200', description: 'Manage stations, view reports' },
  MANAGER: { label: 'Manager', color: 'bg-amber-50 text-amber-700 border-amber-200', description: 'Full station management' },
  SUPERVISOR: { label: 'Supervisor', color: 'bg-red-50 text-red-700 border-red-200', description: 'Team management' },
};

export function EmployeeApprovalDashboard() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [stats, setStats] = useState<EmployeeStats>({ total: 0, pending: 0, approved: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [selectedSecurityLevel, setSelectedSecurityLevel] = useState('BASIC');
  const [processing, setProcessing] = useState(false);

  const fetchEmployees = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/employees?status=${activeTab}`);
      const responseData = await response.json();
      
      if (response.ok) {
        setEmployees(responseData.employees);
        setStats(responseData.stats);
      } else {
        toast.error('Failed to fetch employees');
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch = 
      emp.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.phone?.includes(searchQuery);
    return matchesSearch;
  });

  const handleApprove = async () => {
    if (!selectedEmployee) return;
    
    setProcessing(true);
    try {
      const response = await fetch('/api/admin/employees/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: selectedEmployee.id,
          securityLevel: selectedSecurityLevel,
        }),
      });

      const responseData = await response.json();

      if (response.ok) {
        toast.success('Employee approved successfully');
        setIsApproveDialogOpen(false);
        fetchEmployees();
      } else {
        toast.error(responseData.error || 'Failed to approve employee');
      }
    } catch (error) {
      console.error('Error approving employee:', error);
      toast.error('Failed to approve employee');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedEmployee) return;
    
    setProcessing(true);
    try {
      const response = await fetch('/api/admin/employees/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId: selectedEmployee.id }),
      });

      const responseData = await response.json();

      if (response.ok) {
        toast.success('Employee application rejected');
        setIsRejectDialogOpen(false);
        fetchEmployees();
      } else {
        toast.error(responseData.error || 'Failed to reject employee');
      }
    } catch (error) {
      console.error('Error rejecting employee:', error);
      toast.error('Failed to reject employee');
    } finally {
      setProcessing(false);
    }
  };

  const handleUpdateSecurityLevel = async (employeeId: string, securityLevel: string) => {
    try {
      const response = await fetch(`/api/admin/employees/${employeeId}/security`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ securityLevel }),
      });

      const responseData = await response.json();

      if (response.ok) {
        toast.success('Security level updated');
        fetchEmployees();
      } else {
        toast.error(responseData.error || 'Failed to update security level');
      }
    } catch (error) {
      console.error('Error updating security level:', error);
      toast.error('Failed to update security level');
    }
  };

  const openApproveDialog = (employee: Employee) => {
    setSelectedEmployee(employee);
    setSelectedSecurityLevel('BASIC');
    setIsApproveDialogOpen(true);
  };

  const openRejectDialog = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsRejectDialogOpen(true);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#051F20] flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#235347]">
              <Building className="h-6 w-6 text-white" />
            </div>
            Employee Management
          </h1>
          <p className="text-[#235347]">
            Review and approve employee registrations
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-lg bg-white">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-[#235347]">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#051F20]">{stats.total}</p>
                <p className="text-sm text-[#235347]">Total Employees</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg bg-white cursor-pointer hover:shadow-xl transition-shadow" onClick={() => setActiveTab('pending')}>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-amber-500">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#051F20]">{stats.pending}</p>
                <p className="text-sm text-[#235347]">Pending Approval</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg bg-white cursor-pointer hover:shadow-xl transition-shadow" onClick={() => setActiveTab('approved')}>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-[#8EB69B]">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#051F20]">{stats.approved}</p>
                <p className="text-sm text-[#235347]">Approved</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Card */}
      <Card className="border-0 shadow-lg bg-white">
        <CardHeader className="border-b border-gray-100">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-[#051F20]">
                <UserCheck className="w-5 h-5 text-[#235347]" />
                Employee Registrations
              </CardTitle>
              <CardDescription className="text-[#235347]">
                Review and manage employee accounts
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#235347]" />
                <Input
                  placeholder="Search employees..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-full sm:w-64 border-[#8EB69B] focus:border-[#235347]"
                />
              </div>
            </div>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
            <TabsList className="bg-[#DAF1DE]">
              <TabsTrigger value="pending" className="data-[state=active]:bg-[#235347] data-[state=active]:text-white">
                <Clock className="h-4 w-4 mr-2" />
                Pending ({stats.pending})
              </TabsTrigger>
              <TabsTrigger value="approved" className="data-[state=active]:bg-[#235347] data-[state=active]:text-white">
                <CheckCircle className="h-4 w-4 mr-2" />
                Approved ({stats.approved})
              </TabsTrigger>
              <TabsTrigger value="all" className="data-[state=active]:bg-[#235347] data-[state=active]:text-white">
                <Users className="h-4 w-4 mr-2" />
                All ({stats.total})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#235347]" />
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="text-center py-12">
              <div className="flex justify-center mb-4">
                <div className="p-4 rounded-full bg-[#DAF1DE]">
                  <Users className="h-8 w-8 text-[#235347]" />
                </div>
              </div>
              <p className="text-[#235347] text-lg font-medium">No employees found</p>
              <p className="text-[#235347]/60 text-sm">
                {activeTab === 'pending' 
                  ? 'No pending employee registrations'
                  : activeTab === 'approved'
                  ? 'No approved employees yet'
                  : 'No employees registered'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-b border-gray-100">
                    <TableHead className="text-[#235347] font-medium">Employee</TableHead>
                    <TableHead className="text-[#235347] font-medium">Contact</TableHead>
                    <TableHead className="text-[#235347] font-medium">Applied</TableHead>
                    <TableHead className="text-[#235347] font-medium">Security Level</TableHead>
                    <TableHead className="text-[#235347] font-medium">Status</TableHead>
                    <TableHead className="text-[#235347] font-medium">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {filteredEmployees.map((employee, index) => (
                      <motion.tr 
                        key={employee.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-gray-50 hover:bg-[#f0f7f5]/50"
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 ring-2 ring-[#8EB69B]/20">
                              <AvatarImage src={undefined} />
                              <AvatarFallback className="bg-[#235347] text-white font-medium text-sm">
                                {employee.name?.charAt(0) || employee.email.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-[#051F20]">{employee.name || 'No name'}</p>
                              <p className="text-sm text-[#235347]">{employee.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {employee.phone && (
                              <div className="flex items-center gap-1.5 text-sm text-[#235347]">
                                <Phone className="h-3.5 w-3.5" />
                                {employee.phone}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-sm text-[#235347]">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(employee.createdAt).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          {employee.isApproved ? (
                            <Select 
                              value={employee.securityLevel || 'BASIC'} 
                              onValueChange={(value) => handleUpdateSecurityLevel(employee.id, value)}
                            >
                              <SelectTrigger className="w-[140px] border-[#8EB69B]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(securityLevelConfig).map(([level, config]) => (
                                  <SelectItem key={level} value={level}>
                                    <div className="flex items-center gap-2">
                                      <Lock className="h-3 w-3" />
                                      {config.label}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <span className="text-sm text-[#235347]/60">Not set</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={
                            employee.isApproved 
                              ? 'bg-[#DAF1DE] text-[#235347] border border-[#8EB69B]' 
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }>
                            {employee.isApproved ? (
                              <>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Approved
                              </>
                            ) : (
                              <>
                                <Clock className="h-3 w-3 mr-1" />
                                Pending
                              </>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {!employee.isApproved ? (
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                className="bg-[#235347] hover:bg-[#163832] text-white"
                                onClick={() => openApproveDialog(employee)}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => openRejectDialog(employee)}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          ) : (
                            <div className="text-sm text-[#235347]/60">
                              {employee.approvedAt && (
                                <span>Approved {new Date(employee.approvedAt).toLocaleDateString()}</span>
                              )}
                            </div>
                          )}
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approve Dialog */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-[#235347]" />
              Approve Employee
            </DialogTitle>
            <DialogDescription>
              Set the security level for this employee account
            </DialogDescription>
          </DialogHeader>
          
          {selectedEmployee && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-[#f0f7f5]">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-[#235347] text-white">
                    {selectedEmployee.name?.charAt(0) || selectedEmployee.email.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-[#051F20]">{selectedEmployee.name}</p>
                  <p className="text-sm text-[#235347]">{selectedEmployee.email}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#051F20]">Security Level</label>
                <Select value={selectedSecurityLevel} onValueChange={setSelectedSecurityLevel}>
                  <SelectTrigger className="border-[#8EB69B]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(securityLevelConfig).map(([level, config]) => (
                      <SelectItem key={level} value={level}>
                        <div className="flex flex-col items-start">
                          <span className="font-medium">{config.label}</span>
                          <span className="text-xs text-[#235347]/60">{config.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">Security Level Explained</p>
                    <p className="text-xs text-amber-700 mt-1">
                      {securityLevelConfig[selectedSecurityLevel]?.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsApproveDialogOpen(false)}
              className="border-[#8EB69B]"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleApprove}
              disabled={processing}
              className="bg-[#235347] hover:bg-[#163832] text-white"
            >
              {processing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              Approve Employee
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <XCircle className="h-5 w-5" />
              Reject Employee Application
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. The employee will need to register again.
            </DialogDescription>
          </DialogHeader>
          
          {selectedEmployee && (
            <div className="py-4">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-red-600 text-white">
                    {selectedEmployee.name?.charAt(0) || selectedEmployee.email.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-[#051F20]">{selectedEmployee.name}</p>
                  <p className="text-sm text-[#235347]">{selectedEmployee.email}</p>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsRejectDialogOpen(false)}
              className="border-[#8EB69B]"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleReject}
              disabled={processing}
            >
              {processing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <XCircle className="h-4 w-4 mr-2" />
              )}
              Reject Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
