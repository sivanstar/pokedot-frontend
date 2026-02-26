import React, { useState, useEffect } from 'react';
import { 
  DollarSign, ArrowUpRight, ArrowDownRight, 
  CreditCard, Gift, TrendingUp, History, RefreshCw,
  Upload, Coins, Wallet as WalletIcon, Banknote,
  AlertCircle, CheckCircle, Calendar, Clock
} from 'lucide-react';
import { useWallet } from '../../context/WalletContext';
import { usePoke } from '../../context/PokeContext';
import { formatDistanceToNow } from 'date-fns';
import { useNotifications } from '../../context/NotificationsContext';
import toast from 'react-hot-toast';

export const WalletPage: React.FC = () => {
  const { user } = usePoke();
  const { 
    balance, 
    totalEarned, 
    totalWithdrawn,
    transactions, 
    withdrawPoints, 
    refreshBalance,
    canWithdrawToday,
    syncWalletFromBackend
  } = useWallet();
  
  const { addNotification } = useNotifications();
  
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions'>('overview');
  const [hasAccountDetails, setHasAccountDetails] = useState(false);
  const [withdrawalSchedule, setWithdrawalSchedule] = useState({
    nextWithdrawalDay: '',
    nextWithdrawalTime: '',
    isWithinWindow: false
  });

  // CRITICAL: Sync wallet data on component mount
  useEffect(() => {
    if (syncWalletFromBackend) {
      syncWalletFromBackend();
    }
  }, [syncWalletFromBackend]);

  // Check if user has account details
  useEffect(() => {
    const accountDetails = localStorage.getItem('accountDetails');
    setHasAccountDetails(!!accountDetails);
  }, []);

  // Calculate next withdrawal window
  useEffect(() => {
    const calculateNextWithdrawal = () => {
      const now = new Date();
      const day = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const hour = now.getHours();
      
      const withdrawalDays = [1, 3, 5]; // Monday, Wednesday, Friday
      const withdrawalHourStart = 16; // 4 PM
      const withdrawalHourEnd = 17; // 5 PM
      
      // Check if currently within withdrawal window
      const isWithinWindow = canWithdrawToday ? canWithdrawToday() : false;
      
      // Find next withdrawal day
      let daysToAdd = 0;
      for (let i = 1; i <= 7; i++) {
        const nextDay = (day + i) % 7;
        if (withdrawalDays.includes(nextDay)) {
          daysToAdd = i;
          break;
        }
      }
      
      const nextWithdrawalDate = new Date(now);
      nextWithdrawalDate.setDate(now.getDate() + daysToAdd);
      nextWithdrawalDate.setHours(withdrawalHourStart, 0, 0, 0);
      
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const nextDayName = days[nextWithdrawalDate.getDay()];
      
      setWithdrawalSchedule({
        nextWithdrawalDay: nextDayName,
        nextWithdrawalTime: '4:00 PM - 5:00 PM',
        isWithinWindow
      });
    };
    
    calculateNextWithdrawal();
  }, [canWithdrawToday]);

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    
    // Validate amount
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    // Check minimum withdrawal (2,000 points) - CHANGED from 10,000
    if (amount < 2000) {
      toast.error('Minimum withdrawal is 2,000 points');
      return;
    }

    // Check if user has enough balance
    if (amount > balance) {
      toast.error('Insufficient balance for withdrawal');
      return;
    }

    // Check if user has account details set
    if (!hasAccountDetails) {
      toast.error('Please set your account details in Profile first');
      // Optionally redirect to profile
      window.location.href = '/profile#account';
      return;
    }

    // Check withdrawal window
    if (!canWithdrawToday || !canWithdrawToday()) {
      toast.error(`Withdrawals only allowed on Monday, Wednesday, Friday from 4pm-5pm. Next window: ${withdrawalSchedule.nextWithdrawalDay} 4pm-5pm`);
      return;
    }

    setIsWithdrawing(true);
    
    try {
      // Call the withdrawal function from WalletContext
      const success = await withdrawPoints(amount);
      
      if (success) {
        setWithdrawAmount('');
        toast.success(`Withdrawal request submitted for ${amount.toLocaleString()} points!`, {
          duration: 4000,
          icon: '✅',
        });
        
        // Refresh wallet data after successful withdrawal
        if (refreshBalance) {
          await refreshBalance();
        }
      }
    } catch (error) {
      toast.error('Failed to submit withdrawal request. Please try again.');
    } finally {
      setIsWithdrawing(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'poke':
        return <Coins className="w-4 h-4 text-blue-500" />;
      case 'reward':
        return <Gift className="w-4 h-4 text-yellow-500" />;
      case 'withdrawal':
        return <ArrowUpRight className="w-4 h-4 text-red-500" />;
      case 'deposit':
        return <ArrowDownRight className="w-4 h-4 text-green-500" />;
      case 'referral':
        return <CreditCard className="w-4 h-4 text-purple-500" />;
      default:
        return <CreditCard className="w-4 h-4 text-gray-500" />;
    }
  };

  const getDayStatus = () => {
    if (withdrawalSchedule.isWithinWindow) {
      return {
        text: 'Withdrawal Window OPEN',
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: <CheckCircle className="w-5 h-5 text-green-600" />
      };
    } else {
      return {
        text: `Next window: ${withdrawalSchedule.nextWithdrawalDay} 4pm-5pm`,
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: <Calendar className="w-5 h-5 text-blue-600" />
      };
    }
  };

  const dayStatus = getDayStatus();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mb-4 animate-float">
            <WalletIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">My Wallet</h1>
          <p className="text-gray-600">Manage your points and withdrawals</p>
        </div>

        {/* Withdrawal Schedule Banner */}
        <div className={`rounded-xl p-4 mb-8 border ${dayStatus.color}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {dayStatus.icon}
              <div>
                <h3 className="font-bold">Withdrawal Schedule</h3>
                <p className="text-sm">{dayStatus.text}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Clock className="w-4 h-4" />
              <span>Mon, Wed, Fri • 4pm-5pm</span>
            </div>
          </div>
        </div>

        {/* Account Details Warning */}
        {!hasAccountDetails && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-yellow-800 mb-2">Account Details Required</h3>
                <p className="text-yellow-700 mb-3">
                  You need to set up your account details before making withdrawals. 
                  Withdrawals will be credited to the bank account details you provide.
                </p>
                <a
                  href="/profile#account"
                  className="inline-flex items-center text-primary-600 hover:text-primary-500 font-medium"
                >
                  Set Account Details in Profile →
                </a>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Balance & Withdrawal */}
          <div className="lg:col-span-2 space-y-8">
            {/* Balance Card */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-8 text-white">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Current Balance</h2>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-5xl font-bold">{balance.toLocaleString()}</span>
                    <span className="text-lg opacity-90">points</span>
                  </div>
                  <p className="opacity-90 mt-4">Available for withdrawal</p>
                  <div className="mt-2 text-sm opacity-80">
                    Total Earned: {totalEarned.toLocaleString()} points • 
                    Total Withdrawn: {totalWithdrawn.toLocaleString()} points
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <button
                    onClick={() => {
                      if (refreshBalance) {
                        refreshBalance();
                        toast.success('Wallet refreshed!');
                      }
                    }}
                    className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Refresh</span>
                  </button>
                  <div className="mt-6 text-right">
                    <p className="text-sm opacity-80">Total Earned</p>
                    <p className="text-2xl font-bold">{totalEarned.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Withdrawal Card */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center space-x-2 mb-4">
                <div className="p-2 rounded-lg bg-gradient-to-br from-red-500 to-pink-500 text-white">
                  <Upload className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Withdraw Points</h3>
              </div>
              
              <div className="space-y-6">
                {/* Account Details Status */}
                <div className={`p-4 rounded-lg ${hasAccountDetails ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                  <div className="flex items-center space-x-3">
                    {hasAccountDetails ? (
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                    )}
                    <div>
                      <p className="font-medium">
                        {hasAccountDetails ? 'Account details are set' : 'Account details not set'}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {hasAccountDetails 
                          ? 'Withdrawals will be sent to your bank account'
                          : 'Set your bank account details in Profile to withdraw'
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {/* Amount Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount to Withdraw (points)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      placeholder="Enter amount"
                      className="input-field pl-4 pr-4"
                      min="2000"
                      max={balance}
                      step="100"
                    />
                    {!withdrawAmount && (
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <Banknote className="w-5 h-5 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between text-sm text-gray-500 mt-2">
                    <span>Min: 2,000 points</span>
                    <span>Max: {balance.toLocaleString()} points</span>
                  </div>
                </div>
                
                {/* Quick Amount Buttons */}
                <div>
                  <p className="text-sm text-gray-700 mb-2">Quick Amounts:</p>
                  <div className="flex flex-wrap gap-2">
                    {[2000, 5000, 10000, 25000, balance].map((amount) => (
                      <button
                        key={amount}
                        onClick={() => setWithdrawAmount(amount.toString())}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-sm font-medium transition-colors"
                        disabled={amount > balance}
                      >
                        {amount === balance ? 'All' : amount.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Withdrawal Info */}
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 mb-2">Withdrawal Information</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                      <span>Minimum withdrawal: 2,000 points</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                      <span>Processing time: 3-5 business days</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                      <span>Funds sent to your registered bank account</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                      <span>Withdrawal days: Monday, Wednesday, Friday (4pm-5pm only)</span>
                    </li>
                  </ul>
                </div>
                
                {/* Withdraw Button */}
                <button
                  onClick={handleWithdraw}
                  disabled={isWithdrawing || !withdrawAmount || !hasAccountDetails}
                  className="btn-primary w-full bg-gradient-to-r from-red-500 to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isWithdrawing ? (
                    <span className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Processing Withdrawal...</span>
                    </span>
                  ) : (
                    `Withdraw ${withdrawAmount ? withdrawAmount : ''} Points`
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Stats & Recent */}
          <div className="space-y-8">
            {/* Stats Card */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4 text-gray-800">Wallet Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Daily Average</p>
                      <p className="text-sm text-gray-600">Points earned per day</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-blue-600">
                    {Math.round(totalEarned / 30).toLocaleString()}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Coins className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Current Balance</p>
                      <p className="text-sm text-gray-600">Available for withdrawal</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-purple-600">
                    {balance.toLocaleString()}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Gift className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium">Total Earned</p>
                      <p className="text-sm text-gray-600">All-time earnings</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-green-600">
                    {totalEarned.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">Recent Transactions</h3>
                <button
                  onClick={() => setActiveTab('transactions')}
                  className="text-primary-600 hover:text-primary-500 text-sm font-medium"
                >
                  View all
                </button>
              </div>
              
              {transactions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <History className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No transactions yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.slice(0, 5).map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                          {getTransactionIcon(transaction.type)}
                        </div>
                        <div>
                          <p className="font-semibold">{transaction.description}</p>
                          <p className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(transaction.timestamp), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                        </p>
                        <p className="text-xs text-gray-500 capitalize">{transaction.type}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
