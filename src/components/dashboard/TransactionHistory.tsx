import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Coins, ArrowUpRight, ArrowDownRight, Zap, Gift, Award, Users as UsersIcon,
  Clock, Filter, RefreshCw, ChevronRight, Wallet, AlertCircle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

interface Transaction {
  _id: string;
  id?: string;
  type: 'poke' | 'withdrawal' | 'signup_bonus' | 'referral_bonus' | 'milestone_reward' | 'admin_adjustment';
  amount: number;
  description: string;
  createdAt: string;
  timestamp?: string;
  status: 'pending' | 'completed' | 'failed' | 'reversed';
  balanceBefore?: number;
  balanceAfter?: number;
}

interface TransactionHistoryProps {
  limit?: number;
  showViewAll?: boolean;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({ 
  limit = 5,
  showViewAll = true 
}) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/wallet/transactions?limit=20`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        // Ensure each transaction has an id field
        const transactionsWithId = (data.transactions || []).map((tx: Transaction) => ({
          ...tx,
          id: tx._id || `tx-${Date.now()}-${Math.random()}`
        }));
        setTransactions(transactionsWithId);
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
  }, []);

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'poke':
        return <Zap className="w-4 h-4 text-primary-500" />;
      case 'withdrawal':
        return <ArrowUpRight className="w-4 h-4 text-red-500" />;
      case 'signup_bonus':
        return <Gift className="w-4 h-4 text-green-500" />;
      case 'referral_bonus':
        return <UsersIcon className="w-4 h-4 text-purple-500" />;
      case 'milestone_reward':
        return <Award className="w-4 h-4 text-yellow-500" />;
      case 'admin_adjustment':
        return <Wallet className="w-4 h-4 text-blue-500" />;
      default:
        return <Coins className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'failed':
        return 'text-red-600 bg-red-50';
      case 'reversed':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const filteredTransactions = filter === 'all' 
    ? transactions 
    : transactions.filter(t => t.type === filter);

  const displayedTransactions = filteredTransactions.slice(0, limit);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800">Transaction History</h3>
          <RefreshCw className="w-5 h-5 text-gray-400 animate-spin" />
        </div>
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h3 className="text-lg md:text-xl font-bold text-gray-800">Transaction History</h3>
        
        {/* Filter Dropdown */}
        <div className="flex items-center space-x-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Transactions</option>
            <option value="poke">Pokes</option>
            <option value="withdrawal">Withdrawals</option>
            <option value="signup_bonus">Signup Bonus</option>
            <option value="referral_bonus">Referrals</option>
            <option value="admin_adjustment">Admin</option>
          </select>
          <button
            onClick={loadTransactions}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Transaction List */}
      {displayedTransactions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Coins className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm">No transactions yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayedTransactions.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                  {getTransactionIcon(tx.type)}
                </div>
                <div>
                  <p className="font-medium text-gray-800 text-sm md:text-base">
                    {tx.description}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(tx.status)}`}>
                      {tx.status}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatDistanceToNow(new Date(tx.createdAt || tx.timestamp || Date.now()), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-bold text-sm md:text-base ${
                  tx.amount > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {tx.amount > 0 ? '+' : ''}{tx.amount} pts
                </p>
                <p className="text-xs text-gray-400 capitalize">{tx.type.replace('_', ' ')}</p>
              </div>
            </div>
          ))}

          {/* View All Link */}
          {showViewAll && transactions.length > limit && (
            <Link
              to="/wallet?tab=transactions"
              className="block text-center mt-4 text-primary-600 hover:text-primary-500 text-sm font-medium"
            >
              View All Transactions ({transactions.length - limit} more)
              <ChevronRight className="w-4 h-4 inline ml-1" />
            </Link>
          )}
        </div>
      )}
    </div>
  );
};
