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
import {
  Users,
  Search,
  Shield,
  UserCog,
  Calendar,
  Download,
  UserPlus,
  Loader2,
  Check,
  X,
  Mail,
  Phone,
  Ban,
  Unlock,
  Trash2,
  AlertTriangle,
  Building,
} from 'lucide-react';
import { toast } from 'sonner';

interface DbUser {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  role: string;
  avatar: string | null;
  isEmailVerified: boolean;
  isApproved: boolean;
  isBlocked: boolean;
  securityLevel: string | null;
  subscriptionPlan: string;
  createdAt: string;
  blockedAt: string | null;
  blockReason: string | null;
}

interface UserStats {
  total: number;
  drivers: number;
  admins: number;
  fleetManagers: number;
  employees: number;
  blocked: number;
}

const roleConfig: Record<string, { label: string; icon: React.ReactNode; color: string; description: string }> = {
  DRIVER: { 
    label: 'Driver', 
    icon: <Users className="h-3.5 w-3.5" />,
    color: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    description: 'Basic user access to charging stations'
  },
  ADMIN: { 
    label: 'Administrator', 
    icon: <Shield className="h-3.5 w-3.5" />,
    color: 'bg-red-50 text-red-700 border border-red-200',
    description: 'Full access to all features'
  },
  FLEET_MANAGER: { 
    label: 'Fleet Manager', 
    icon: <UserCog className="h-3.5 w-3.5" />,
    color: 'bg-blue-50 text-blue-700 border border-blue-200',
    description: 'Access to dashboard and fleet analytics'
  },
  EMPLOYEE: { 
    label: 'Employee', 
    icon: <Building className="h-3.5 w-3.5" />,
    color: 'bg-purple-50 text-purple-700 border border-purple-200',
    description: 'SafariCharge staff member'
  },
};

export function AdminUserManagement() {
  const [users, setUsers] = useState<DbUser[]>([]);
  const [stats, setStats] = useState<UserStats>({ total: 0, drivers: 0, admins: 0, fleetManagers: 0, employees: 0, blocked: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  
  // Dialog states
  const [selectedUser, setSelectedUser] = useState<DbUser | null>(null);
  const [isManageDialogOpen, setIsManageDialogOpen] = useState(false);
  const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [blockReason, setBlockReason] = useState('');

  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/users');
      const responseData = await response.json();
      
      if (response.ok) {
        setUsers(responseData.users);
        setStats(responseData.stats);
      } else {
        toast.error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone?.includes(searchQuery);
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdating(userId);
    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      const responseData = await response.json();

      if (response.ok) {
        toast.success(`Role updated to ${roleConfig[newRole]?.label || newRole}`);
        fetchUsers();
      } else {
        toast.error(responseData.error || 'Failed to update role');
      }
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Failed to update role');
    } finally {
      setUpdating(null);
    }
  };

  const handleBlockUser = async () => {
    if (!selectedUser) return;
    
    setUpdating(selectedUser.id);
    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}/block`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: blockReason }),
      });

      const responseData = await response.json();

      if (response.ok) {
        toast.success('User blocked successfully');
        setIsBlockDialogOpen(false);
        setBlockReason('');
        fetchUsers();
      } else {
        toast.error(responseData.error || 'Failed to block user');
      }
    } catch (error) {
      console.error('Error blocking user:', error);
      toast.error('Failed to block user');
    } finally {
      setUpdating(null);
    }
  };

  const handleUnblockUser = async (userId: string) => {
    setUpdating(userId);
    try {
      const response = await fetch(`/api/admin/users/${userId}/unblock`, {
        method: 'POST',
      });

      const responseData = await response.json();

      if (response.ok) {
        toast.success('User unblocked successfully');
        fetchUsers();
      } else {
        toast.error(responseData.error || 'Failed to unblock user');
      }
    } catch (error) {
      console.error('Error unblocking user:', error);
      toast.error('Failed to unblock user');
    } finally {
      setUpdating(null);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    setUpdating(selectedUser.id);
    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'DELETE',
      });

      const responseData = await response.json();

      if (response.ok) {
        toast.success('User and all associated data deleted');
        setIsDeleteDialogOpen(false);
        fetchUsers();
      } else {
        toast.error(responseData.error || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    } finally {
      setUpdating(null);
    }
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
              <Shield className="h-6 w-6 text-white" />
            </div>
            User Management
          </h1>
          <p className="text-[#235347]">
            Manage all registered users, roles, and permissions
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <Card className="border-0 shadow-lg bg-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#235347]">
                <Users className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-xl font-bold text-[#051F20]">{stats.total}</p>
                <p className="text-xs text-[#235347]">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg bg-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#8EB69B]">
                <Users className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-xl font-bold text-[#051F20]">{stats.drivers}</p>
                <p className="text-xs text-[#235347]">Drivers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg bg-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#5483B3]">
                <UserCog className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-xl font-bold text-[#051F20]">{stats.fleetManagers}</p>
                <p className="text-xs text-[#235347]">Fleet</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg bg-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-500">
                <Building className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-xl font-bold text-[#051F20]">{stats.employees}</p>
                <p className="text-xs text-[#235347]">Employees</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg bg-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-red-500">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-xl font-bold text-[#051F20]">{stats.admins}</p>
                <p className="text-xs text-[#235347]">Admins</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg bg-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gray-500">
                <Ban className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-xl font-bold text-[#051F20]">{stats.blocked}</p>
                <p className="text-xs text-[#235347]">Blocked</p>
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
                <UserCog className="w-5 h-5 text-[#235347]" />
                User Accounts
              </CardTitle>
              <CardDescription className="text-[#235347]">Manage user roles, permissions, and access</CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#235347]" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-full sm:w-64 border-[#8EB69B] focus:border-[#235347]"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full sm:w-[140px] border-[#8EB69B] focus:border-[#235347]">
                  <SelectValue placeholder="All roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="DRIVER">Drivers</SelectItem>
                  <SelectItem value="FLEET_MANAGER">Fleet</SelectItem>
                  <SelectItem value="EMPLOYEE">Employees</SelectItem>
                  <SelectItem value="ADMIN">Admins</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#235347]" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-[#8EB69B] mx-auto mb-4" />
              <p className="text-[#235347] font-medium">No users found</p>
              <p className="text-sm text-[#235347]/60">
                {searchQuery ? 'Try adjusting your search' : 'Users will appear here when they register'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-b border-gray-100">
                    <TableHead className="text-[#235347] font-medium">User</TableHead>
                    <TableHead className="text-[#235347] font-medium">Contact</TableHead>
                    <TableHead className="text-[#235347] font-medium">Joined</TableHead>
                    <TableHead className="text-[#235347] font-medium">Role</TableHead>
                    <TableHead className="text-[#235347] font-medium">Status</TableHead>
                    <TableHead className="text-[#235347] font-medium">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {filteredUsers.map((user, index) => (
                      <motion.tr 
                        key={user.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ delay: index * 0.03 }}
                        className={`border-b border-gray-50 hover:bg-[#f0f7f5]/50 ${user.isBlocked ? 'bg-red-50/30' : ''}`}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 ring-2 ring-[#8EB69B]/20">
                              <AvatarImage src={user.avatar || undefined} />
                              <AvatarFallback className={`font-medium text-sm ${user.isBlocked ? 'bg-gray-400' : 'bg-[#235347]'} text-white`}>
                                {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-[#051F20]">{user.name || 'No name'}</p>
                              <p className="text-sm text-[#235347]">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {user.phone && (
                              <div className="flex items-center gap-1.5 text-sm text-[#235347]">
                                <Phone className="h-3.5 w-3.5" />
                                {user.phone}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-sm text-[#235347]">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(user.createdAt).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={roleConfig[user.role]?.color || 'bg-gray-100 text-gray-700'}>
                            {roleConfig[user.role]?.icon}
                            <span className="ml-1">{roleConfig[user.role]?.label || user.role}</span>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.isBlocked ? (
                            <Badge className="bg-red-100 text-red-700 border border-red-200">
                              <Ban className="h-3 w-3 mr-1" />
                              Blocked
                            </Badge>
                          ) : !user.isApproved ? (
                            <Badge className="bg-amber-100 text-amber-700 border border-amber-200">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Pending
                            </Badge>
                          ) : (
                            <Badge className="bg-green-100 text-green-700 border border-green-200">
                              <Check className="h-3 w-3 mr-1" />
                              Active
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {/* Manage Role Button */}
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={updating === user.id}
                              onClick={() => {
                                setSelectedUser(user);
                                setIsManageDialogOpen(true);
                              }}
                              className="border-[#8EB69B] text-[#235347] hover:bg-[#f0f7f5]"
                            >
                              {updating === user.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <UserCog className="h-4 w-4" />
                              )}
                            </Button>
                            
                            {/* Block/Unblock Button */}
                            {user.isBlocked ? (
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={updating === user.id}
                                onClick={() => handleUnblockUser(user.id)}
                                className="border-green-500 text-green-600 hover:bg-green-50"
                                title="Unblock user"
                              >
                                <Unlock className="h-4 w-4" />
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={updating === user.id}
                                onClick={() => {
                                  setSelectedUser(user);
                                  setBlockReason('');
                                  setIsBlockDialogOpen(true);
                                }}
                                className="border-amber-500 text-amber-600 hover:bg-amber-50"
                                title="Block user"
                              >
                                <Ban className="h-4 w-4" />
                              </Button>
                            )}
                            
                            {/* Delete Button */}
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={updating === user.id}
                              onClick={() => {
                                setSelectedUser(user);
                                setIsDeleteDialogOpen(true);
                              }}
                              className="border-red-500 text-red-600 hover:bg-red-50"
                              title="Delete user permanently"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
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

      {/* Manage Role Dialog */}
      <Dialog open={isManageDialogOpen} onOpenChange={setIsManageDialogOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Manage User Role</DialogTitle>
            <DialogDescription>
              {selectedUser?.name || selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-3 py-4">
              {Object.entries(roleConfig).map(([role, config]) => {
                const hasRole = selectedUser.role === role;
                return (
                  <div 
                    key={role} 
                    className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${
                      hasRole 
                        ? 'border-[#235347] bg-[#f0f7f5]' 
                        : 'border-gray-100 bg-gray-50 hover:bg-[#f0f7f5]/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Badge className={config.color}>
                        {config.label}
                      </Badge>
                      <span className="text-sm text-[#235347]">
                        {config.description}
                      </span>
                    </div>
                    {hasRole ? (
                      <Badge className="bg-[#235347] text-white">
                        <Check className="w-3 h-3 mr-1" />
                        Current
                      </Badge>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          handleRoleChange(selectedUser.id, role);
                          setIsManageDialogOpen(false);
                        }}
                        disabled={updating === selectedUser.id}
                        className="border-[#235347] text-[#235347] hover:bg-[#235347] hover:text-white"
                      >
                        Change
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsManageDialogOpen(false)}
              className="border-[#8EB69B] text-[#235347]"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Block User Dialog */}
      <Dialog open={isBlockDialogOpen} onOpenChange={setIsBlockDialogOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Ban className="h-5 w-5" />
              Block User Account
            </DialogTitle>
            <DialogDescription>
              This will prevent the user from logging in. They will see a message explaining their account is blocked.
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="py-4 space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-red-500 text-white">
                    {selectedUser.name?.charAt(0) || selectedUser.email.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-[#051F20]">{selectedUser.name}</p>
                  <p className="text-sm text-[#235347]">{selectedUser.email}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#051F20]">Reason for blocking (optional)</label>
                <Input
                  placeholder="e.g., Violation of terms of service"
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  className="border-[#8EB69B] focus:border-[#235347]"
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsBlockDialogOpen(false)}
              className="border-[#8EB69B] text-[#235347]"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleBlockUser}
              disabled={updating === selectedUser?.id}
              className="bg-red-500 hover:bg-red-600"
            >
              {updating === selectedUser?.id ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Ban className="h-4 w-4 mr-2" />
              )}
              Block User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Delete User Permanently
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. All user data including charging sessions, notifications, and account information will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="py-4">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-red-500 text-white">
                    {selectedUser.name?.charAt(0) || selectedUser.email.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-[#051F20]">{selectedUser.name}</p>
                  <p className="text-sm text-[#235347]">{selectedUser.email}</p>
                </div>
              </div>
              
              <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800">Warning</p>
                    <p className="text-sm text-amber-700 mt-1">
                      All associated data will be deleted:
                    </p>
                    <ul className="text-sm text-amber-700 mt-2 space-y-1 list-disc list-inside">
                      <li>Charging session history</li>
                      <li>Notifications</li>
                      <li>Account credentials</li>
                      <li>Profile information</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
              className="border-[#8EB69B] text-[#235347]"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeleteUser}
              disabled={updating === selectedUser?.id}
              className="bg-red-500 hover:bg-red-600"
            >
              {updating === selectedUser?.id ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
