import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Zap, Trophy, Users, TrendingUp, 
  Clock, Award, Coins, Sparkles,
  Search, RefreshCw, Wallet
} from 'lucide-react';
import { usePoke } from '../../context/PokeContext';
import { useWallet } from '../../context/WalletContext';
import { StatsCard } from '../../components/dashboard/StatsCard';
import { UserCard } from '../../components/dashboard/UserCard';
import { formatDistanceToNow } from 'date-fns';
import { pokeApi } from '../../api/poke';
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

  // CRITICAL: Sync data on component mount
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
      trend: '+12%',
      description: 'All-time earnings' 
    },
    { 
      title: 'Current Balance', 
      value: balance.toLocaleString(), 
      icon: <Wallet className="w-6 h-6" />, 
      color: 'from-blue-400 to-cyan-500',
      trend: '+8%',
      description: 'Available for withdrawal' 
    },
    { 
      title: 'Pokes Sent', 
      value: pokesSent.toLocaleString(), 
      icon: <Zap className="w-6 h-6" />, 
      color: 'from-green-400 to-emerald-500',
      trend: '+15%',
      description: 'Total pokes sent' 
    },
    { 
      title: 'Daily Pokes Remaining', 
      value: `${dailyLimits.remainingSends}/${dailyLimits.remainingReceives}`,
      icon: <TrendingUp className="w-6 h-6" />, 
      color: 'from-purple-400 to-pink-500',
      trend: dailyLimits.remainingSends > 0 ? 'Available' : 'Limit Reached',
      description: 'Sends/Receives left today' 
    },
  ];

  const filteredUsers = availableUsers.filter(user =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl p-8 text-white mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <Sparkles className="w-6 h-6" />
                <h1 className="text-2xl font-bold">Welcome back, {user?.username}!</h1>
              </div>
              <p className="opacity-90">Ready to poke and earn more points today?</p>
              <div className="mt-2 text-sm opacity-80">
                Daily Limits: {dailyLimits.remainingSends} sends, {dailyLimits.remainingReceives} receives left
              </div>
              <div className="mt-1 text-sm">
                Balance: <span className="font-bold">{balance.toLocaleString()} points</span>
              </div>
            </div>
            <div className="flex space-x-3 mt-4 md:mt-0">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
              </button>
              <Link to="/poke" className="bg-white text-primary-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center">
                <Zap className="w-4 h-4 mr-2" />
                <span>Poke Someone</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <StatsCard
              key={index}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
              trend={stat.trend}
              description={stat.description}
            />
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Poke Section */}
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold flex items-center space-x-2">
                  <Zap className="w-5 h-5" />
                  <span>Quick Poke ({dailyLimits.remainingSends} sends left)</span>
                </h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>
              
              {loadingUsers ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                  <p className="mt-4 text-gray-500">Loading users...</p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No users found</p>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="text-primary-600 hover:text-primary-500 mt-2"
                    >
                      Clear search
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredUsers
                    .filter(u => u._id !== user?._id)
                    .slice(0, 3)
                    .map((user) => (
                      <UserCard key={user._id} user={user} />
                    ))}
                  
                  {filteredUsers.length > 3 && (
                    <div className="text-center">
                      <Link to="/poke" className="text-primary-600 hover:text-primary-500 font-medium">
                        View {filteredUsers.length - 3} more users →
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Leaderboard Preview */}
            <div className="card">
              <h3 className="text-xl font-bold mb-4 flex items-center space-x-2">
                <Trophy className="w-5 h-5" />
                <span>Top Pokers</span>
              </h3>
              
              {topUsers.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <p>No top users data</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {topUsers.slice(0, 5).map((user, index) => (
                      <div key={user._id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center text-white font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-semibold">{user.username}</p>
                            <p className="text-sm text-gray-500">{user.points.toLocaleString()} points</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{user.pokesSent}</p>
                          <p className="text-sm text-gray-500">pokes</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <Link to="/leaderboard" className="block text-center mt-4 text-primary-600 hover:text-primary-500 font-medium">
                    View Full Leaderboard →
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
