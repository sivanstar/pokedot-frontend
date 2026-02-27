import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Zap, Trophy, Users, TrendingUp, 
  Clock, Award, Coins, Sparkles,
  Search, RefreshCw, Wallet, ArrowRight
} from 'lucide-react';
import { usePoke } from '../../context/PokeContext';
import { useWallet } from '../../context/WalletContext';
import { StatsCard } from '../../components/dashboard/StatsCard';
import { UserCard } from '../../components/dashboard/UserCard';
import toast from 'react-hot-toast';

export const Dashboard: React.FC = () => {
  const {
    user,
    points,
    pokesSent,
    pokesReceived,
    streak,
    topUsers,
    refreshData,
    dailyLimits,
    getAvailableUsers,
    syncUserFromBackend,
  } = usePoke();

  const { balance, totalEarned, syncWalletFromBackend } = useWallet();

  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Sync data on component mount
  useEffect(() => {
    const syncData = async () => {
      if (syncUserFromBackend) {
        await syncUserFromBackend();
      }
      if (syncWalletFromBackend) {
        await syncWalletFromBackend();
      }
    };
    syncData();
  }, [syncUserFromBackend, syncWalletFromBackend]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshData();
      if (syncWalletFromBackend) {
        await syncWalletFromBackend();
      }
      toast.success('Dashboard refreshed!', { duration: 2000 });
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setTimeout(() => setIsRefreshing(false), 1000);
    }
  };

  const loadAvailableUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await getAvailableUsers(searchQuery);
      if (response.success) {
        setAvailableUsers(response.users || []);
      }
    } catch (error) {
      console.error('Error loading available users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    loadAvailableUsers();
  }, [searchQuery]);

  const stats = [
    { 
      title: 'Total Points Earned', 
      value: totalEarned.toLocaleString(), 
      icon: <Coins className="w-6 h-6" />, 
      color: 'from-yellow-400 to-orange-500',
      description: 'All-time earnings' 
    },
    { 
      title: 'Current Balance', 
      value: balance.toLocaleString(), 
      icon: <Wallet className="w-6 h-6" />, 
      color: 'from-blue-400 to-cyan-500',
      description: 'Available for withdrawal' 
    },
    { 
      title: 'Pokes Sent', 
      value: pokesSent.toLocaleString(), 
      icon: <Zap className="w-6 h-6" />, 
      color: 'from-green-400 to-emerald-500',
      description: 'Total pokes sent' 
    },
    { 
      title: 'Daily Pokes', 
      value: `${dailyLimits.remainingSends}/${dailyLimits.remainingReceives}`,
      icon: <TrendingUp className="w-6 h-6" />, 
      color: 'from-purple-400 to-pink-500',
      description: 'Sends/Receives left' 
    },
  ];

  const filteredUsers = availableUsers.filter(u =>
    u.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="container mx-auto px-4 py-4 md:py-8">
        {/* Welcome Banner - Mobile Optimized */}
        <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl p-6 md:p-8 text-white mb-6 md:mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Sparkles className="w-5 h-5 md:w-6 md:h-6" />
                <h1 className="text-xl md:text-2xl font-bold truncate">
                  Welcome back, {user?.username?.split(' ')[0]}!
                </h1>
              </div>
              <p className="text-sm md:text-base opacity-90 mb-2">
                Ready to poke and earn today?
              </p>
              <div className="flex flex-wrap gap-3 text-xs md:text-sm opacity-80">
                <span className="bg-white/20 px-3 py-1 rounded-full">
                  Sends: {dailyLimits.remainingSends}/2
                </span>
                <span className="bg-white/20 px-3 py-1 rounded-full">
                  Receives: {dailyLimits.remainingReceives}/2
                </span>
                <span className="bg-white/20 px-3 py-1 rounded-full">
                  Balance: {balance.toLocaleString()} pts
                </span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors disabled:opacity-50 text-sm"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
                <span className="sm:hidden">Refresh</span>
              </button>
              <Link 
                to="/poke" 
                className="bg-white text-primary-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center justify-center space-x-2 text-sm"
              >
                <Zap className="w-4 h-4" />
                <span>Poke</span>
                <ArrowRight className="w-4 h-4 sm:hidden" />
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Grid - Mobile: 2 columns, Desktop: 4 columns */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
          {stats.map((stat, index) => (
            <StatsCard
              key={index}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
              description={stat.description}
            />
          ))}
        </div>

        {/* Main Content Grid - Mobile: Stacked, Desktop: 3 columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Left Column - Quick Poke (Mobile: Full width, Desktop: 2/3) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Poke Section */}
            <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <h3 className="text-lg md:text-xl font-bold flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-primary-500" />
                  <span>Quick Poke ({dailyLimits.remainingSends} left)</span>
                </h3>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>
              
              {loadingUsers ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-500">Loading users...</p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">No users found</p>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="text-primary-600 hover:text-primary-500 text-sm mt-2"
                    >
                      Clear search
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredUsers
                    .filter(u => u._id !== user?._id)
                    .slice(0, 3)
                    .map((user) => (
                      <UserCard key={user._id} user={user} />
                    ))}
                  
                  {filteredUsers.length > 3 && (
                    <div className="text-center">
                      <Link to="/poke" className="text-primary-600 hover:text-primary-500 font-medium text-sm inline-flex items-center">
                        View {filteredUsers.length - 3} more users
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Leaderboard (Mobile: Full width, Desktop: 1/3) */}
          <div className="space-y-6">
            {/* Leaderboard Preview */}
            <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
              <h3 className="text-lg md:text-xl font-bold mb-4 flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <span>Top Pokers</span>
              </h3>
              
              {topUsers.length === 0 ? (
                <div className="text-center py-4 text-gray-500 text-sm">
                  <p>No data yet</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {topUsers.slice(0, 5).map((user, index) => (
                      <div key={user._id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{user.username}</p>
                            <p className="text-xs text-gray-500">{user.points.toLocaleString()} pts</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-sm">{user.pokesSent}</p>
                          <p className="text-xs text-gray-500">pokes</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <Link to="/leaderboard" className="block text-center mt-4 text-primary-600 hover:text-primary-500 text-sm font-medium">
                    View Full Leaderboard →
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Quick Stats Card - Visible only on mobile */}
            <div className="lg:hidden bg-white rounded-xl shadow-lg p-4">
              <h3 className="text-lg font-bold mb-3">Quick Stats</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-xs text-blue-600">Rank</p>
                  <p className="text-lg font-bold text-gray-800">#{user?.rank || 999}</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-xs text-green-600">Streak</p>
                  <p className="text-lg font-bold text-gray-800">{streak} days</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
