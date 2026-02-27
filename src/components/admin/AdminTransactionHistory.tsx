import React, { useState, useEffect } from 'react';
import {
  Coins, ArrowUpRight, ArrowDownRight, Zap, Gift, Award,
  Search, RefreshCw, Filter, Download, ChevronLeft, ChevronRight,
  Users, Wallet, AlertCircle, CheckCircle, XCircle, Clock, Eye
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import toast from 'react-hot-toast';

interface AdminTransaction {
  _id: string;
  id?: string;
  user: {
    _id: string;
    username: string;
    email: string;
  };
  type: 'poke' | 'withdrawal' | 'signup_bonus' | 'referral_bonus' | 'milestone_reward' | 'admin_adjustment';
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  status: 'pending' | 'completed' | 'failed' | 'reversed';
  reference?: string;
  metadata?: any;
  createdAt: string;
}

interface AdminTransactionHistoryProps {
  onRefresh?: () => void;
}

export const AdminTransactionHistory: React.FC<AdminTransactionHistoryProps> = ({ onRefresh }) => {
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    totalPointsCredited: 0,
    totalPointsDebited: 0,
    totalWithdrawals: 0
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1
  });
  const [filter, setFilter] = useState({
    type: '',
    search: '',
    status: ''
  });
  const [selectedTransaction, setSelectedTransaction] = useState<AdminTransaction | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const loadTransactions = async (page = 1) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString()
      });
      if (filter.type) params.append('type', filter.type);
      if (filter.search) params.append('search', filter.search);
      if (filter.status) params.append('status', filter.status);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/transactions?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        // Ensure each transaction has an id field
        const transactionsWithId = (data.transactions || []).map((tx: AdminTransaction) => ({
          ...tx,
          id: tx._id || `tx-${Date.now()}-${Math.random()}`
        }));
        setTransactions(transactionsWithId);
        setStats(data.stats);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
      toast.error('Failed to load transaction history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [filter.type, filter.status]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadTransactions(1);
  };

  const handleRefresh = () => {
    loadTransactions(pagination.page);
    if (onRefresh) onRefresh();
    toast.success('Transactions refreshed');
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'poke': return <Zap className="w-5 h-5 text-primary-600" />;
      case 'withdrawal': return <ArrowUpRight className="w-5 h-5 text-red-600" />;
      case 'signup_bonus': return <Gift className="w-5 h-5 text-green-600" />;
      case 'referral_bonus': return <Users className="w-5 h-5 text-purple-600" />;
      case 'milestone_reward': return <Award className="w-5 h-5 text-yellow-600" />;
      case 'admin_adjustment': return <Wallet className="w-5 h-5 text-blue-600" />;
      default: return <Coins className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
      reversed: 'bg-gray-100 text-gray-800'
    };
    return styles[status] || styles.pending;
  };

  const formatPoints = (points: number) => {
    return points.toLocaleString() + ' pts';
  };

  const formatCurrency = (points: number) => {
    return (points / 10).toLocaleString('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    });
  };

  // Custom ArrowRight component
  const ArrowRight = (props: any) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-4 md:p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Coins className="w-6 h-6 md:w-8 md:h-8 opacity-80" />
            <span className="text-xs opacity-80">Total</span>
          </div>
          <div className="text-xl md:text-2xl font-bold">{stats.total.toLocaleString()}</div>
          <div className="text-xs opacity-90 mt-1">Transactions</div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl p-4 md:p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <ArrowDownRight className="w-6 h-6 md:w-8 md:h-8 opacity-80" />
            <span className="text-xs opacity-80">Credited</span>
          </div>
          <div className="text-xl md:text-2xl font-bold">{formatPoints(stats.totalPointsCredited)}</div>
          <div className="text-xs opacity-90 mt-1">Points In</div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-rose-500 rounded-xl p-4 md:p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <ArrowUpRight className="w-6 h-6 md:w-8 md:h-8 opacity-80" />
            <span className="text-xs opacity-80">Debited</span>
          </div>
          <div className="text-xl md:text-2xl font-bold">{formatPoints(stats.totalPointsDebited)}</div>
          <div className="text-xs opacity-90 mt-1">Points Out</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-4 md:p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Wallet className="w-6 h-6 md:w-8 md:h-8 opacity-80" />
            <span className="text-xs opacity-80">Withdrawn</span>
          </div>
          <div className="text-xl md:text-2xl font-bold">{formatCurrency(stats.totalWithdrawals)}</div>
          <div className="text-xs opacity-90 mt-1">Cash Out</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={filter.search}
              onChange={(e) => setFilter({ ...filter, search: e.target.value })}
              placeholder="Search by username or email..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            />
          </div>
          
          <select
            value={filter.type}
            onChange={(e) => setFilter({ ...filter, type: e.target.value })}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
          >
            <option value="">All Types</option>
            <option value="poke">Pokes</option>
            <option value="withdrawal">Withdrawals</option>
            <option value="signup_bonus">Signup Bonus</option>
            <option value="referral_bonus">Referrals</option>
            <option value="admin_adjustment">Admin Adjustments</option>
          </select>

          <select
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
          >
            <option value="">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="reversed">Reversed</option>
          </select>

          <button
            type="submit"
            className="px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors text-sm"
          >
            Search
          </button>
          
          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading}
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2 text-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </form>
      </div>

      {/* Transactions Table - Desktop */}
      <div className="hidden md:block bg-white rounded-xl shadow-lg overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading transactions...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-12">
            <Coins className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Transactions Found</h3>
            <p className="text-gray-500">No transactions match your criteria.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Balance
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
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {format(new Date(tx.createdAt), 'MMM dd, yyyy')}
                        </div>
                        <div className="text-xs text-gray-500">
                          {format(new Date(tx.createdAt), 'hh:mm a')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
                            <span className="text-primary-600 font-bold text-sm">
                              {tx.user?.username?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {tx.user?.username}
                            </div>
                            <div className="text-xs text-gray-500">{tx.user?.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <div className="p-1.5 bg-gray-100 rounded-lg">
                            {getTransactionIcon(tx.type)}
                          </div>
                          <span className="text-sm capitalize">{tx.type.replace('_', ' ')}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-lg font-bold ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {tx.amount > 0 ? '+' : ''}{tx.amount}
                        </div>
                        {tx.type === 'withdrawal' && (
                          <div className="text-xs text-gray-500">
                            {formatCurrency(Math.abs(tx.amount))}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {tx.balanceBefore?.toLocaleString() || 0} → {tx.balanceAfter?.toLocaleString() || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(tx.status)}`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => {
                            setSelectedTransaction(tx);
                            setShowDetails(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
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
                {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => loadTransactions(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-3 py-1 border rounded text-sm disabled:opacity-50 hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => loadTransactions(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-3 py-1 border rounded text-sm disabled:opacity-50 hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Transactions Cards - Mobile */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-xl shadow-lg">
            <Coins className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500">No transactions</p>
          </div>
        ) : (
          transactions.map((tx) => (
            <div key={tx.id} className="bg-white rounded-xl shadow-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    {getTransactionIcon(tx.type)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{tx.user?.username}</p>
                    <p className="text-xs text-gray-500">{tx.user?.email}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(tx.status)}`}>
                  {tx.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <div>
                  <p className="text-xs text-gray-500">Type</p>
                  <p className="text-sm font-medium capitalize">{tx.type.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Amount</p>
                  <p className={`text-sm font-bold ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount} pts
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Balance</p>
                  <p className="text-sm">{tx.balanceAfter?.toLocaleString() || 0} pts</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Date</p>
                  <p className="text-xs text-gray-600">
                    {format(new Date(tx.createdAt), 'MMM dd, hh:mm a')}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedTransaction(tx);
                  setShowDetails(true);
                }}
                className="w-full text-center text-primary-600 hover:text-primary-500 text-sm font-medium py-2 border-t"
              >
                View Details
              </button>
            </div>
          ))
        )}
      </div>

      {/* Transaction Details Modal */}
      {showDetails && selectedTransaction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">Transaction Details</h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                {/* Type Badge */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Type</span>
                  <div className="flex items-center space-x-2">
                    <div className="p-1.5 bg-gray-200 rounded-lg">
                      {getTransactionIcon(selectedTransaction.type)}
                    </div>
                    <span className="font-medium capitalize">{selectedTransaction.type.replace('_', ' ')}</span>
                  </div>
                </div>

                {/* User Info */}
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">User</p>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-600 font-bold">
                        {selectedTransaction.user?.username?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{selectedTransaction.user?.username}</p>
                      <p className="text-sm text-gray-500">{selectedTransaction.user?.email}</p>
                    </div>
                  </div>
                </div>

                {/* Amount */}
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Amount</p>
                  <p className={`text-3xl font-bold ${selectedTransaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedTransaction.amount > 0 ? '+' : ''}{selectedTransaction.amount} pts
                  </p>
                  {selectedTransaction.type === 'withdrawal' && (
                    <p className="text-sm text-gray-500 mt-1">
                      ≈ {formatCurrency(Math.abs(selectedTransaction.amount))}
                    </p>
                  )}
                </div>

                {/* Balance Change */}
                {selectedTransaction.balanceBefore !== undefined && selectedTransaction.balanceAfter !== undefined && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">Balance Change</p>
                    <div className="flex items-center justify-between">
                      <span>Before: {selectedTransaction.balanceBefore.toLocaleString()} pts</span>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                      <span className="font-bold">After: {selectedTransaction.balanceAfter.toLocaleString()} pts</span>
                    </div>
                  </div>
                )}

                {/* Description */}
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Description</p>
                  <p className="text-gray-800">{selectedTransaction.description}</p>
                </div>

                {/* Status */}
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Status</p>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(selectedTransaction.status)}`}>
                    {selectedTransaction.status}
                  </span>
                </div>

                {/* Reference (if available) */}
                {selectedTransaction.reference && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Reference</p>
                    <p className="text-sm font-mono">{selectedTransaction.reference}</p>
                  </div>
                )}

                {/* Timestamps */}
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Created</p>
                  <p>{format(new Date(selectedTransaction.createdAt), 'MMMM dd, yyyy hh:mm a')}</p>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={() => setShowDetails(false)}
                  className="w-full btn-primary py-3"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
