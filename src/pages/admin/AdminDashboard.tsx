import React, { useState, useEffect } from 'react';
import {
  Users, TrendingUp, Zap, DollarSign,
  Shield, Activity, UserCheck, UserX,
  Search, Filter, RefreshCw, Eye,
  Edit, Trash2, CheckCircle, XCircle,
  BarChart3, CreditCard, Clock, ArrowUpRight,
  Download, Calendar, Globe, Target,
  Wallet, Banknote, AlertCircle, FileText,
  Check, X, Loader, Send, Receipt,
  Percent, Plus, Minus, Settings,
  ChevronDown, ChevronUp, Filter as FilterIcon,
  MoreVertical, History, Copy, Key, Trash
} from 'lucide-react';
import { adminApi, AdminStats, AdminUser, Withdrawal, WalletUpdateData, PokeTransaction } from '../../api/admin';
import { ConfirmationDialog } from '../../components/admin/ConfirmationDialog';
import { PokeHistory } from '../../components/admin/PokeHistory';
import toast from 'react-hot-toast';
import { formatDistanceToNow, format } from 'date-fns';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [withdrawalStats, setWithdrawalStats] = useState<Record<string, { count: number; totalAmount: number }>>({});
  const [pokes, setPokes] = useState<PokeTransaction[]>([]);
  const [pokeStats, setPokeStats] = useState({
    total: 0,
    today: 0,
    totalPointsExchanged: 0
  });
  const [loading, setLoading] = useState({
    stats: true,
    users: true,
    withdrawals: true,
    pokes: true,
    activities: true
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalUsers: 0,
    totalPages: 1
  });
  const [withdrawalPagination, setWithdrawalPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  });
  const [pokePagination, setPokePagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [pokeSearchTerm, setPokeSearchTerm] = useState('');
  const [withdrawalFilter, setWithdrawalFilter] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'withdrawals' | 'pokes' | 'activities'>('overview');
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [userUpdates, setUserUpdates] = useState<Record<string, Partial<AdminUser>>>({});
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [deletePermanent, setDeletePermanent] = useState(false);
  const [walletData, setWalletData] = useState<any>(null);
  const [walletAction, setWalletAction] = useState<'add' | 'subtract' | 'set'>('add');
  const [walletAmount, setWalletAmount] = useState('');
  const [walletReason, setWalletReason] = useState('');
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    type: string;
    title: string;
    message: string;
    data: any;
    onConfirm: () => Promise<void>;
  } | null>(null);

  // Load dashboard stats
  const loadStats = async () => {
    setLoading(prev => ({ ...prev, stats: true }));
    try {
      const response = await adminApi.getStats();
      if (response.success) {
        setStats(response.stats);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
      toast.error('Failed to load dashboard statistics');
    } finally {
      setLoading(prev => ({ ...prev, stats: false }));
    }
  };

  // Load users
  const loadUsers = async (page = 1, search = '') => {
    setLoading(prev => ({ ...prev, users: true }));
    try {
      const response = await adminApi.getUsers(page, pagination.limit, search);
      if (response.success) {
        setUsers(response.users);
        setPagination(response.pagination);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(prev => ({ ...prev, users: false }));
    }
  };

  // Load withdrawals
  const loadWithdrawals = async (page = 1, status = '') => {
    setLoading(prev => ({ ...prev, withdrawals: true }));
    try {
      const response = await adminApi.getWithdrawals(page, withdrawalPagination.limit, status);
      if (response.success) {
        setWithdrawals(response.withdrawals);
        setWithdrawalStats(response.stats);
        setWithdrawalPagination(response.pagination);
      }
    } catch (error) {
      console.error('Error loading withdrawals:', error);
      toast.error('Failed to load withdrawals');
    } finally {
      setLoading(prev => ({ ...prev, withdrawals: false }));
    }
  };

  // Load poke transactions
  const loadPokes = async (page = 1, search = '') => {
    setLoading(prev => ({ ...prev, pokes: true }));
    try {
      const response = await adminApi.getPokeTransactions(page, pokePagination.limit, search);
      if (response.success) {
        setPokes(response.pokes);
        setPokeStats(response.stats);
        setPokePagination(response.pagination);
      }
    } catch (error) {
      console.error('Error loading pokes:', error);
      toast.error('Failed to load poke history');
    } finally {
      setLoading(prev => ({ ...prev, pokes: false }));
    }
  };

  // Load user wallet details
  const loadUserWallet = async (userId: string) => {
    try {
      const response = await adminApi.getUserWallet(userId);
      if (response.success) {
        setWalletData(response);
        setShowWalletModal(true);
      }
    } catch (error) {
      console.error('Error loading user wallet:', error);
      toast.error('Failed to load wallet details');
    }
  };

  // Initial load
  useEffect(() => {
    loadStats();
    loadUsers();
    loadWithdrawals();
    loadPokes();
  }, []);

  // Handle user update
  const handleUpdateUser = async (userId: string) => {
    const updates = userUpdates[userId];
    if (!updates) return;

    try {
      const response = await adminApi.updateUser(userId, updates);
      if (response.success) {
        toast.success('User updated successfully');
        setEditingUser(null);
        setUserUpdates({});
        loadUsers(pagination.page, searchTerm);
        loadStats();
      }
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
    }
  };

  // Handle user status toggle
  const handleToggleStatus = async (user: AdminUser) => {
    setConfirmAction({
      type: 'toggle_status',
      title: user.isActive ? 'Deactivate User' : 'Activate User',
      message: `Are you sure you want to ${user.isActive ? 'deactivate' : 'activate'} ${user.username}?`,
      data: {
        username: user.username,
        currentStatus: user.isActive ? 'Active' : 'Inactive',
        newStatus: user.isActive ? 'Inactive' : 'Active'
      },
      onConfirm: async () => {
        try {
          const response = await adminApi.updateUser(user._id, {
            isActive: !user.isActive
          });
          if (response.success) {
            toast.success(`User ${!user.isActive ? 'activated' : 'deactivated'}`);
            loadUsers(pagination.page, searchTerm);
            loadStats();
          }
        } catch (error) {
          console.error('Error toggling user status:', error);
          toast.error('Failed to update user status');
        }
      }
    });
    setShowConfirmDialog(true);
  };

  // Handle role change
  const handleRoleChange = async (userId: string, role: 'user' | 'admin') => {
    setConfirmAction({
      type: 'change_role',
      title: role === 'admin' ? 'Make Admin' : 'Make Regular User',
      message: `Are you sure you want to change this user's role to ${role}?`,
      data: { newRole: role },
      onConfirm: async () => {
        try {
          const response = await adminApi.updateUser(userId, { role });
          if (response.success) {
            toast.success(`User role updated to ${role}`);
            loadUsers(pagination.page, searchTerm);
            loadStats();
          }
        } catch (error) {
          console.error('Error changing user role:', error);
          toast.error('Failed to update user role');
        }
      }
    });
    setShowConfirmDialog(true);
  };

  // Handle password change
  const handlePasswordChange = async (userId: string) => {
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setConfirmAction({
      type: 'change_password',
      title: 'Change User Password',
      message: `Are you sure you want to change the password for ${selectedUser?.username}?`,
      data: { username: selectedUser?.username },
      onConfirm: async () => {
        try {
          const response = await adminApi.changeUserPassword(userId, newPassword);
          if (response.success) {
            toast.success('Password changed successfully');
            setShowPasswordModal(false);
            setNewPassword('');
          }
        } catch (error) {
          console.error('Error changing password:', error);
          toast.error('Failed to change password');
        }
      }
    });
    setShowConfirmDialog(true);
  };

  // Handle user deletion
  const handleDeleteUser = async (userId: string) => {
    setConfirmAction({
      type: 'delete_user',
      title: deletePermanent ? 'Permanently Delete User' : 'Deactivate User',
      message: deletePermanent 
        ? `Are you sure you want to PERMANENTLY delete ${selectedUser?.username}? This action CANNOT be undone!`
        : `Are you sure you want to deactivate ${selectedUser?.username}?`,
      data: { 
        username: selectedUser?.username,
        action: deletePermanent ? 'Permanent Delete' : 'Deactivate'
      },
      onConfirm: async () => {
        try {
          const response = await adminApi.deleteUser(userId, deletePermanent);
          if (response.success) {
            toast.success(response.message);
            setShowDeleteModal(false);
            setShowUserDetails(false);
            loadUsers(pagination.page, searchTerm);
            loadStats();
          }
        } catch (error) {
          console.error('Error deleting user:', error);
          toast.error('Failed to delete user');
        }
      }
    });
    setShowConfirmDialog(true);
  };

  // Handle wallet update
  const handleWalletUpdate = async (userId: string) => {
    if (!walletAmount || !walletReason) {
      toast.error('Please enter amount and reason');
      return;
    }

    const amount = parseFloat(walletAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    const updateData: WalletUpdateData = {
      reason: walletReason
    };

    if (walletAction === 'add') {
      updateData.action = 'add_points';
      updateData.amount = amount;
    } else if (walletAction === 'subtract') {
      updateData.action = 'subtract_points';
      updateData.amount = amount;
    } else if (walletAction === 'set') {
      updateData.points = amount;
    }

    try {
      const response = await adminApi.updateUserWallet(userId, updateData);
      if (response.success) {
        toast.success('Wallet updated successfully');
        setShowWalletModal(false);
        setWalletAmount('');
        setWalletReason('');
        loadUsers(pagination.page, searchTerm);
        loadStats();
      }
    } catch (error) {
      console.error('Error updating wallet:', error);
      toast.error('Failed to update wallet');
    }
  };

  // Handle withdrawal approval
  const handleWithdrawalAction = async (withdrawalId: string, status: 'approved' | 'rejected' | 'processing') => {
    setConfirmAction({
      type: 'withdrawal_action',
      title: status === 'approved' ? 'Approve Withdrawal' : status === 'rejected' ? 'Reject Withdrawal' : 'Mark as Processing',
      message: `Are you sure you want to ${status} this withdrawal request?`,
      data: {
        status: status.charAt(0).toUpperCase() + status.slice(1),
        notes: adminNotes || 'No notes provided'
      },
      onConfirm: async () => {
        try {
          const response = await adminApi.updateWithdrawal(withdrawalId, status, adminNotes);
          if (response.success) {
            toast.success(`Withdrawal ${status} successfully`);
            setShowWithdrawalModal(false);
            setAdminNotes('');
            loadWithdrawals(withdrawalPagination.page, withdrawalFilter);
            loadStats();
          }
        } catch (error) {
          console.error('Error updating withdrawal:', error);
          toast.error('Failed to update withdrawal');
        }
      }
    });
    setShowConfirmDialog(true);
  };

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadUsers(1, searchTerm);
  };

  // Handle poke search
  const handlePokeSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadPokes(1, pokeSearchTerm);
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    });
  };

  // Format points
  const formatPoints = (points: number) => {
    return points.toLocaleString() + ' points';
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Stats cards data
  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: <Users className="w-6 h-6" />,
      color: 'from-blue-500 to-cyan-500',
      description: 'Registered users'
    },
    {
      title: 'Active Users',
      value: stats?.activeUsers || 0,
      icon: <UserCheck className="w-6 h-6" />,
      color: 'from-green-500 to-emerald-500',
      description: 'Currently active'
    },
    {
      title: 'Total Pokes',
      value: pokeStats?.total || 0,
      icon: <Zap className="w-6 h-6" />,
      color: 'from-yellow-500 to-orange-500',
      description: 'All-time pokes'
    },
    {
      title: 'Total Points',
      value: stats?.totalPoints?.toLocaleString() || '0',
      icon: <DollarSign className="w-6 h-6" />,
      color: 'from-purple-500 to-pink-500',
      description: 'Platform points'
    },
    {
      title: 'Total Earned',
      value: stats?.totalEarned?.toLocaleString() || '0',
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'from-indigo-500 to-violet-500',
      description: 'Total earned by users'
    },
    {
      title: 'Total Withdrawn',
      value: stats?.totalWithdrawn?.toLocaleString() || '0',
      icon: <Banknote className="w-6 h-6" />,
      color: 'from-red-500 to-rose-500',
      description: 'Total withdrawn'
    },
    {
      title: 'Pending Withdrawals',
      value: withdrawalStats?.pending?.count || 0,
      icon: <AlertCircle className="w-6 h-6" />,
      color: 'from-orange-500 to-amber-500',
      description: 'Awaiting approval'
    },
    {
      title: 'Today\'s Pokes',
      value: pokeStats?.today || 0,
      icon: <Activity className="w-6 h-6" />,
      color: 'from-teal-500 to-cyan-500',
      description: 'Pokes today'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white sticky top-0 z-40">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-white/10 rounded-xl">
                  <Shield className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                  <p className="text-gray-300">Manage your POKEDOT platform</p>
                </div>
              </div>
            </div>
            <div className="mt-4 md:mt-0">
              <button
                onClick={() => {
                  loadStats();
                  loadUsers(pagination.page, searchTerm);
                  loadWithdrawals(withdrawalPagination.page, withdrawalFilter);
                  loadPokes(pokePagination.page, pokeSearchTerm);
                  toast.success('Dashboard refreshed');
                }}
                className="bg-white/10 hover:bg-white/20 px-6 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh All</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white border-b sticky top-20 z-30">
        <div className="container mx-auto px-4">
          <div className="flex space-x-1 overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-3 font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4" />
                <span>Overview</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-6 py-3 font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'users'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>Users ({stats?.totalUsers || 0})</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('withdrawals')}
              className={`px-6 py-3 font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'withdrawals'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Banknote className="w-4 h-4" />
                <span>Withdrawals ({withdrawalStats?.pending?.count || 0} pending)</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('pokes')}
              className={`px-6 py-3 font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'pokes'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4" />
                <span>Poke History ({pokeStats?.total || 0})</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {statCards.map((stat, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color}`}>
                      <div className="text-white">{stat.icon}</div>
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-800">{stat.value}</h3>
                  <p className="text-gray-600 font-medium mt-1">{stat.title}</p>
                  <p className="text-sm text-gray-500 mt-2">{stat.description}</p>
                </div>
              ))}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* System Summary */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold mb-6 flex items-center space-x-2">
                  <Target className="w-5 h-5" />
                  <span>System Summary</span>
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Average Points per User</span>
                    <span className="font-bold">{stats?.averagePointsPerUser || 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Average Pokes per User</span>
                    <span className="font-bold">{Math.round((pokeStats?.total || 0) / (stats?.totalUsers || 1))}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Admin Users</span>
                    <span className="font-bold">{stats?.admins || 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Inactive Users</span>
                    <span className="font-bold">
                      {(stats?.totalUsers || 0) - (stats?.activeUsers || 0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Withdrawal Stats */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold mb-6 flex items-center space-x-2">
                  <Receipt className="w-5 h-5" />
                  <span>Withdrawal Statistics</span>
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {withdrawalStats?.approved?.count || 0}
                      </div>
                      <div className="text-sm text-green-700">Approved</div>
                      <div className="text-xs text-green-600">
                        {formatCurrency(withdrawalStats?.approved?.totalAmount * 0.1 || 0)}
                      </div>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">
                        {withdrawalStats?.pending?.count || 0}
                      </div>
                      <div className="text-sm text-yellow-700">Pending</div>
                      <div className="text-xs text-yellow-600">
                        {formatCurrency(withdrawalStats?.pending?.totalAmount * 0.1 || 0)}
                      </div>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">
                        {withdrawalStats?.rejected?.count || 0}
                      </div>
                      <div className="text-sm text-red-700">Rejected</div>
                      <div className="text-xs text-red-600">
                        {formatCurrency(withdrawalStats?.rejected?.totalAmount * 0.1 || 0)}
                      </div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {withdrawalStats?.processing?.count || 0}
                      </div>
                      <div className="text-sm text-blue-700">Processing</div>
                      <div className="text-xs text-blue-600">
                        {formatCurrency(withdrawalStats?.processing?.totalAmount * 0.1 || 0)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Search and Filter */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <form onSubmit={handleSearch} className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search users by username or email..."
                      className="input-field pl-10"
                    />
                  </div>
                </form>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => loadUsers(pagination.page, searchTerm)}
                    disabled={loading.users}
                    className="btn-primary px-6 py-2 flex items-center space-x-2"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading.users ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              {loading.users ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                  <p className="mt-4 text-gray-500">Loading users...</p>
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>No users found</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            User
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Wallet
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Activity
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => (
                          <tr key={user._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white font-bold">
                                    {user.username?.charAt(0).toUpperCase() || 'U'}
                                  </div>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {user.username}
                                  </div>
                                  <div className="text-sm text-gray-500">{user.email}</div>
                                  <div className="text-xs text-gray-400">
                                    Joined: {user.createdAt ? format(new Date(user.createdAt), 'MMM dd, yyyy') : 'N/A'}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-gray-600">Balance:</span>
                                  <span className="text-sm font-bold text-gray-900">
                                    {formatPoints(user.points)}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-gray-600">Earned:</span>
                                  <span className="text-sm font-medium text-green-600">
                                    {formatPoints(user.totalEarned)}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-gray-600">Withdrawn:</span>
                                  <span className="text-sm font-medium text-blue-600">
                                    {formatPoints(user.totalWithdrawn)}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-gray-600">Pokes:</span>
                                  <span className="text-sm font-medium">
                                    {user.pokesSent} sent, {user.pokesReceived} received
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-gray-600">Streak:</span>
                                  <span className="text-sm font-medium text-yellow-600">
                                    {user.streak} days
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-gray-600">Online:</span>
                                  <span className={`text-sm font-medium ${user.isOnline ? 'text-green-600' : 'text-gray-400'}`}>
                                    {user.isOnline ? 'Yes' : 'No'}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="space-y-2">
                                <div>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    user.role === 'admin'
                                      ? 'bg-purple-100 text-purple-800'
                                      : 'bg-blue-100 text-blue-800'
                                  }`}>
                                    {user.role}
                                  </span>
                                </div>
                                <div>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    user.isActive
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-red-100 text-red-800'
                                  }`}>
                                    {user.isActive ? 'Active' : 'Inactive'}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex flex-col space-y-2">
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => {
                                      setSelectedUser(user);
                                      loadUserWallet(user._id);
                                    }}
                                    className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded transition-colors"
                                    title="Manage Wallet"
                                  >
                                    <Wallet className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedUser(user);
                                      setShowPasswordModal(true);
                                    }}
                                    className="text-purple-600 hover:text-purple-900 p-2 hover:bg-purple-50 rounded transition-colors"
                                    title="Change Password"
                                  >
                                    <Key className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleToggleStatus(user)}
                                    className={`p-2 hover:bg-gray-100 rounded transition-colors ${
                                      user.isActive
                                        ? 'text-yellow-600 hover:text-yellow-900'
                                        : 'text-green-600 hover:text-green-900'
                                    }`}
                                    title={user.isActive ? 'Deactivate' : 'Activate'}
                                  >
                                    {user.isActive ? (
                                      <UserX className="w-4 h-4" />
                                    ) : (
                                      <UserCheck className="w-4 h-4" />
                                    )}
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (user.role === 'user') {
                                        handleRoleChange(user._id, 'admin');
                                      } else {
                                        handleRoleChange(user._id, 'user');
                                      }
                                    }}
                                    className={`p-2 hover:bg-gray-100 rounded transition-colors ${
                                      user.role === 'user'
                                        ? 'text-purple-600 hover:text-purple-900'
                                        : 'text-blue-600 hover:text-blue-900'
                                    }`}
                                    title={user.role === 'user' ? 'Make Admin' : 'Make User'}
                                  >
                                    <Shield className="w-4 h-4" />
                                  </button>
                                </div>
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => {
                                      setSelectedUser(user);
                                      setShowUserDetails(true);
                                    }}
                                    className="flex-1 text-gray-600 hover:text-gray-900 p-2 hover:bg-gray-100 rounded text-xs transition-colors"
                                  >
                                    View Details
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedUser(user);
                                      setShowDeleteModal(true);
                                      setDeletePermanent(false);
                                    }}
                                    className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded transition-colors"
                                    title="Delete/Deactivate"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t">
                    <div className="text-sm text-gray-500">
                      Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                      {Math.min(pagination.page * pagination.limit, pagination.totalUsers)} of{' '}
                      {pagination.totalUsers} users
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => loadUsers(pagination.page - 1, searchTerm)}
                        disabled={pagination.page === 1}
                        className="px-3 py-1 border rounded text-sm disabled:opacity-50 hover:bg-gray-50 transition-colors"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => loadUsers(pagination.page + 1, searchTerm)}
                        disabled={pagination.page === pagination.totalPages}
                        className="px-3 py-1 border rounded text-sm disabled:opacity-50 hover:bg-gray-50 transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Withdrawals Tab */}
        {activeTab === 'withdrawals' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      setWithdrawalFilter('');
                      loadWithdrawals(1, '');
                    }}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      !withdrawalFilter 
                        ? 'bg-primary-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    All ({withdrawalPagination.total})
                  </button>
                  <button
                    onClick={() => {
                      setWithdrawalFilter('pending');
                      loadWithdrawals(1, 'pending');
                    }}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      withdrawalFilter === 'pending' 
                        ? 'bg-yellow-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Pending ({withdrawalStats?.pending?.count || 0})
                  </button>
                  <button
                    onClick={() => {
                      setWithdrawalFilter('approved');
                      loadWithdrawals(1, 'approved');
                    }}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      withdrawalFilter === 'approved' 
                        ? 'bg-green-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Approved ({withdrawalStats?.approved?.count || 0})
                  </button>
                  <button
                    onClick={() => {
                      setWithdrawalFilter('rejected');
                      loadWithdrawals(1, 'rejected');
                    }}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      withdrawalFilter === 'rejected' 
                        ? 'bg-red-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Rejected ({withdrawalStats?.rejected?.count || 0})
                  </button>
                </div>
                <button
                  onClick={() => loadWithdrawals(withdrawalPagination.page, withdrawalFilter)}
                  disabled={loading.withdrawals}
                  className="btn-primary px-6 py-2 flex items-center space-x-2"
                >
                  <RefreshCw className={`w-4 h-4 ${loading.withdrawals ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            {/* Withdrawals Table */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              {loading.withdrawals ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                  <p className="mt-4 text-gray-500">Loading withdrawals...</p>
                </div>
              ) : withdrawals.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Banknote className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>No withdrawals found</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            User & Details
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {withdrawals.map((withdrawal) => (
                          <tr key={withdrawal._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div className="space-y-2">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {withdrawal.user?.username || 'Unknown'}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {withdrawal.user?.email || 'No email'}
                                  </div>
                                </div>
                                <div className="text-xs text-gray-500">
                                  <div>Ref: {withdrawal.reference}</div>
                                  <div>Bank: {withdrawal.bankDetails.bankName}</div>
                                  <div>Account: {withdrawal.bankDetails.accountNumber}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-2xl font-bold text-gray-900">
                                {formatPoints(withdrawal.amount)}
                              </div>
                              <div className="text-sm text-gray-500">
                                {formatCurrency(withdrawal.amount * 0.1)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(withdrawal.status)}`}>
                                {withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}
                              </span>
                              {withdrawal.processedBy && (
                                <div className="text-xs text-gray-500 mt-1">
                                  By: {withdrawal.processedBy.username}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {format(new Date(withdrawal.createdAt), 'MMM dd, yyyy')}
                              </div>
                              <div className="text-xs text-gray-500">
                                {format(new Date(withdrawal.createdAt), 'hh:mm a')}
                              </div>
                              <div className="text-xs text-gray-400">
                                {formatDistanceToNow(new Date(withdrawal.createdAt), { addSuffix: true })}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex space-x-2">
                                {withdrawal.status === 'pending' && (
                                  <>
                                    <button
                                      onClick={() => {
                                        setSelectedWithdrawal(withdrawal);
                                        setShowWithdrawalModal(true);
                                      }}
                                      className="text-green-600 hover:text-green-900 p-2 hover:bg-green-50 rounded transition-colors"
                                      title="Approve"
                                    >
                                      <Check className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => {
                                        setSelectedWithdrawal(withdrawal);
                                        setShowWithdrawalModal(true);
                                      }}
                                      className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded transition-colors"
                                      title="Reject"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </>
                                )}
                                <button
                                  onClick={() => {
                                    setSelectedWithdrawal(withdrawal);
                                    setShowWithdrawalModal(true);
                                  }}
                                  className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded transition-colors"
                                  title="View Details"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t">
                    <div className="text-sm text-gray-500">
                      Showing {(withdrawalPagination.page - 1) * withdrawalPagination.limit + 1} to{' '}
                      {Math.min(withdrawalPagination.page * withdrawalPagination.limit, withdrawalPagination.total)} of{' '}
                      {withdrawalPagination.total} withdrawals
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => loadWithdrawals(withdrawalPagination.page - 1, withdrawalFilter)}
                        disabled={withdrawalPagination.page === 1}
                        className="px-3 py-1 border rounded text-sm disabled:opacity-50 hover:bg-gray-50 transition-colors"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => loadWithdrawals(withdrawalPagination.page + 1, withdrawalFilter)}
                        disabled={withdrawalPagination.page === withdrawalPagination.totalPages}
                        className="px-3 py-1 border rounded text-sm disabled:opacity-50 hover:bg-gray-50 transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Poke History Tab */}
        {activeTab === 'pokes' && (
          <PokeHistory onRefresh={loadStats} />
        )}
      </div>

      {/* User Details Modal */}
      {showUserDetails && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">User Details</h3>
                <button
                  onClick={() => setShowUserDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Account Information</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Username:</span>
                        <span className="font-medium">{selectedUser.username}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email:</span>
                        <span className="font-medium">{selectedUser.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Role:</span>
                        <span className={`font-medium ${selectedUser.role === 'admin' ? 'text-purple-600' : 'text-blue-600'}`}>
                          {selectedUser.role}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className={`font-medium ${selectedUser.isActive ? 'text-green-600' : 'text-red-600'}`}>
                          {selectedUser.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Referral Code:</span>
                        <span className="font-mono text-sm">{selectedUser.referralCode || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Wallet Information</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Balance:</span>
                        <span className="font-bold">{formatPoints(selectedUser.points)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Earned:</span>
                        <span className="font-medium text-green-600">{formatPoints(selectedUser.totalEarned)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Withdrawn:</span>
                        <span className="font-medium text-blue-600">{formatPoints(selectedUser.totalWithdrawn)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Referral Bonus:</span>
                        <span className="font-medium text-purple-600">{formatPoints(selectedUser.referralBonusEarned)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Bank Details Section */}
                {selectedUser.bankDetails && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-3 flex items-center space-x-2">
                      <Banknote className="w-4 h-4" />
                      <span>Bank Account Details</span>
                      {selectedUser.bankDetails.verified && (
                        <span className="inline-flex items-center text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                          <CheckCircle className="w-3 h-3 mr-1" /> Verified
                        </span>
                      )}
                    </h4>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Bank Name</p>
                          <p className="font-medium text-gray-800">{selectedUser.bankDetails.bankName || 'Not set'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Account Name</p>
                          <p className="font-medium text-gray-800">{selectedUser.bankDetails.accountName || 'Not set'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Account Number</p>
                          <p className="font-medium text-gray-800">{selectedUser.bankDetails.accountNumber || 'Not set'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Bio Section */}
                {selectedUser.bio && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Bio</h4>
                    <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedUser.bio}</p>
                  </div>
                )}
                
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Activity Stats</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-blue-600">{selectedUser.pokesSent}</div>
                      <div className="text-sm text-blue-700">Pokes Sent</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-green-600">{selectedUser.pokesReceived}</div>
                      <div className="text-sm text-green-700">Pokes Received</div>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-yellow-600">{selectedUser.streak}</div>
                      <div className="text-sm text-yellow-700">Day Streak</div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-purple-600">{selectedUser.loginStreak || 0}</div>
                      <div className="text-sm text-purple-700">Login Streak</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                  <div>
                    <span className="font-medium">Created:</span>{' '}
                    {selectedUser.createdAt ? format(new Date(selectedUser.createdAt), 'MMM dd, yyyy HH:mm') : 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">Last Updated:</span>{' '}
                    {selectedUser.updatedAt ? format(new Date(selectedUser.updatedAt), 'MMM dd, yyyy HH:mm') : 'N/A'}
                  </div>
                </div>
              </div>
              
              <div className="mt-8 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowUserDetails(false);
                    setSelectedUser(selectedUser);
                    setShowPasswordModal(true);
                  }}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center space-x-2"
                >
                  <Key className="w-4 h-4" />
                  <span>Change Password</span>
                </button>
                <button
                  onClick={() => {
                    setShowUserDetails(false);
                    setSelectedUser(selectedUser);
                    loadUserWallet(selectedUser._id);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Wallet className="w-4 h-4" />
                  <span>Manage Wallet</span>
                </button>
                <button
                  onClick={() => setShowUserDetails(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Password Change Modal */}
      {showPasswordModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">Change Password</h3>
                <button
                  onClick={() => {
                    setShowPasswordModal(false);
                    setNewPassword('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <p className="text-gray-600 mb-4">
                    Changing password for <span className="font-bold">{selectedUser.username}</span>
                  </p>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="input-field"
                    placeholder="Enter new password (min 6 characters)"
                    minLength={6}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Password must be at least 6 characters long
                  </p>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowPasswordModal(false);
                      setNewPassword('');
                    }}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handlePasswordChange(selectedUser._id)}
                    className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
                    disabled={!newPassword || newPassword.length < 6}
                  >
                    Update Password
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">Delete User</h3>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeletePermanent(false);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trash2 className="w-8 h-8 text-red-600" />
                  </div>
                  <p className="text-gray-800 mb-2">
                    Are you sure you want to delete <span className="font-bold">{selectedUser.username}</span>?
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    This action can be permanent if you choose permanent deletion.
                  </p>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={deletePermanent}
                      onChange={(e) => setDeletePermanent(e.target.checked)}
                      className="w-4 h-4 text-red-600"
                    />
                    <div>
                      <span className="font-medium text-yellow-800">Permanent Deletion</span>
                      <p className="text-xs text-yellow-700">
                        Check this to permanently delete all user data. This cannot be undone!
                      </p>
                    </div>
                  </label>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setDeletePermanent(false);
                    }}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDeleteUser(selectedUser._id)}
                    className="flex-1 bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 transition-colors"
                  >
                    {deletePermanent ? 'Permanently Delete' : 'Deactivate'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Wallet Management Modal */}
      {showWalletModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">Manage Wallet - {selectedUser.username}</h3>
                <button
                  onClick={() => {
                    setShowWalletModal(false);
                    setWalletAmount('');
                    setWalletReason('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Current Wallet Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-700 mb-3">Current Wallet Status</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Balance:</span>
                      <span className="font-bold">{formatPoints(walletData?.wallet.balance || selectedUser.points)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Earned:</span>
                      <span className="font-medium text-green-600">{formatPoints(walletData?.wallet.totalEarned || selectedUser.totalEarned)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Withdrawn:</span>
                      <span className="font-medium text-blue-600">{formatPoints(walletData?.wallet.totalWithdrawn || selectedUser.totalWithdrawn)}</span>
                    </div>
                  </div>
                </div>
                
                {/* Action Selection */}
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">Select Action</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setWalletAction('add')}
                      className={`p-3 rounded-lg border text-center transition-colors ${
                        walletAction === 'add'
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <Plus className="w-5 h-5 mx-auto mb-1" />
                      <div className="text-sm">Add Points</div>
                    </button>
                    <button
                      onClick={() => setWalletAction('subtract')}
                      className={`p-3 rounded-lg border text-center transition-colors ${
                        walletAction === 'subtract'
                          ? 'border-red-500 bg-red-50 text-red-700'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <Minus className="w-5 h-5 mx-auto mb-1" />
                      <div className="text-sm">Subtract Points</div>
                    </button>
                    <button
                      onClick={() => setWalletAction('set')}
                      className={`p-3 rounded-lg border text-center transition-colors ${
                        walletAction === 'set'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <Settings className="w-5 h-5 mx-auto mb-1" />
                      <div className="text-sm">Set Points</div>
                    </button>
                  </div>
                </div>
                
                {/* Amount Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {walletAction === 'set' ? 'New Balance (points)' : 'Amount (points)'}
                  </label>
                  <input
                    type="number"
                    value={walletAmount}
                    onChange={(e) => setWalletAmount(e.target.value)}
                    className="input-field"
                    placeholder="Enter amount"
                    min="0"
                    step="1"
                  />
                </div>
                
                {/* Reason Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Adjustment
                  </label>
                  <textarea
                    value={walletReason}
                    onChange={(e) => setWalletReason(e.target.value)}
                    className="input-field"
                    placeholder="Enter reason for this adjustment..."
                    rows={3}
                  />
                </div>
                
                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowWalletModal(false);
                      setWalletAmount('');
                      setWalletReason('');
                    }}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleWalletUpdate(selectedUser._id)}
                    className="flex-1 btn-primary px-4 py-3"
                    disabled={!walletAmount || !walletReason}
                  >
                    Update Wallet
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Withdrawal Details Modal */}
      {showWithdrawalModal && selectedWithdrawal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">Withdrawal Details</h3>
                <button
                  onClick={() => setShowWithdrawalModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">User Information</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Username:</span>
                          <span className="font-medium">{selectedWithdrawal.user?.username}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Email:</span>
                          <span className="font-medium">{selectedWithdrawal.user?.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Reference:</span>
                          <span className="font-mono text-sm">{selectedWithdrawal.reference}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Withdrawal Information</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Amount:</span>
                          <span className="text-2xl font-bold">{formatPoints(selectedWithdrawal.amount)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Equivalent:</span>
                          <span className="font-medium">{formatCurrency(selectedWithdrawal.amount * 0.1)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status:</span>
                          <span className={`font-medium ${getStatusColor(selectedWithdrawal.status)} px-2 py-1 rounded-full`}>
                            {selectedWithdrawal.status.charAt(0).toUpperCase() + selectedWithdrawal.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Bank Details */}
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Bank Details</h4>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <div className="text-sm text-gray-600">Bank Name</div>
                        <div className="font-medium">{selectedWithdrawal.bankDetails.bankName}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Account Name</div>
                        <div className="font-medium">{selectedWithdrawal.bankDetails.accountName}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Account Number</div>
                        <div className="font-medium">{selectedWithdrawal.bankDetails.accountNumber}</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Admin Notes */}
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Admin Notes</h4>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    className="input-field w-full"
                    placeholder="Enter notes for this withdrawal..."
                    rows={4}
                  />
                  {selectedWithdrawal.adminNotes && (
                    <div className="mt-2 text-sm text-gray-500">
                      <span className="font-medium">Previous notes:</span> {selectedWithdrawal.adminNotes}
                    </div>
                  )}
                </div>
                
                {/* Action Buttons */}
                {selectedWithdrawal.status === 'pending' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      onClick={() => handleWithdrawalAction(selectedWithdrawal._id, 'approved')}
                      className="bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Check className="w-5 h-5" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => handleWithdrawalAction(selectedWithdrawal._id, 'rejected')}
                      className="bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <X className="w-5 h-5" />
                      <span>Reject</span>
                    </button>
                    <button
                      onClick={() => handleWithdrawalAction(selectedWithdrawal._id, 'processing')}
                      className="bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Loader className="w-5 h-5" />
                      <span>Processing</span>
                    </button>
                  </div>
                )}
                
                {/* History */}
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Processing History</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    {selectedWithdrawal.processedBy ? (
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Processed by:</span>
                          <span className="font-medium">{selectedWithdrawal.processedBy.username}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Processed at:</span>
                          <span className="font-medium">
                            {selectedWithdrawal.processedAt ? format(new Date(selectedWithdrawal.processedAt), 'MMM dd, yyyy HH:mm') : 'N/A'}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-gray-500 py-4">
                        No processing history available
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mt-8 flex justify-end">
                <button
                  onClick={() => setShowWithdrawalModal(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {confirmAction && (
        <ConfirmationDialog
          isOpen={showConfirmDialog}
          title={confirmAction.title}
          message={confirmAction.message}
          type={confirmAction.type.includes('reject') ? 'danger' : 
                confirmAction.type.includes('delete') ? 'danger' :
                confirmAction.type.includes('deactivate') ? 'warning' : 'info'}
          confirmText="Confirm"
          cancelText="Cancel"
          data={confirmAction.data}
          onConfirm={async () => {
            await confirmAction.onConfirm();
            setShowConfirmDialog(false);
            setConfirmAction(null);
          }}
          onCancel={() => {
            setShowConfirmDialog(false);
            setConfirmAction(null);
          }}
        />
      )}
    </div>
  );
};
