import React, { useState } from 'react';
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

export const Dashboard: React.FC = () => {
  const {
    user,
    points,
    pokesSent,
    pokesReceived,
    streak,
    recentPokes,
    topUsers,
    refreshData,
  } = usePoke();

  const { balance, totalEarned } = useWallet();

  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    refreshData();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

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
      title: 'Current Streak', 
      value: `${streak} days`, 
      icon: <TrendingUp className="w-6 h-6" />, 
      color: 'from-purple-400 to-pink-500',
      trend: 'í´¥',
      description: 'Daily poke streak' 
    },
  ];

  const filteredUsers = topUsers.filter(user =>
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
                <h1 className="text-2xl font-bold">Welcome back, {user?.username}! í¾‰</h1>
              </div>
              <p className="opacity-90">Ready to poke and earn more points today?</p>
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

        {/* Rank Card - Using user's actual rank and points */}
        <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl p-6 text-white mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Your Global Rank</h2>
              <div className="flex items-baseline space-x-2">
                <span className="text-5xl font-bold">#{user?.rank}</span>
                <span className="text-lg opacity-90">out of {topUsers.length.toLocaleString()} users</span>
              </div>
              <p className="mt-4 opacity-90">
                Current Points: {points.toLocaleString()} â€¢ Position among top pokes
              </p>
            </div>
            <Trophy className="w-24 h-24 opacity-50 hidden md:block" />
          </div>
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
                  <span>Quick Poke</span>
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
              
              {filteredUsers.length === 0 ? (
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
                    .filter(u => u.id !== user?.id) // Don't show current user
                    .slice(0, 3)
                    .map((user) => (
                      <UserCard key={user.id} user={user} />
                    ))}
                  
                  {filteredUsers.length > 3 && (
                    <div className="text-center">
                      <Link to="/poke" className="text-primary-600 hover:text-primary-500 font-medium">
                        View {filteredUsers.length - 3} more users â†’
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Recent Activity */}
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold flex items-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span>Recent Activity</span>
                </h3>
                <span className="text-sm text-gray-500">
                  {recentPokes.length} activities
                </span>
              </div>
              
              {recentPokes.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No recent activity</p>
                  <p className="text-sm mt-2">Start poking users to see activity here!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentPokes.map((poke) => (
                    <div
                      key={poke.id}
                      className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg border transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center text-white">
                          {poke.fromUser?.username?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="font-semibold">
                            {poke.fromUser?.username || 'Unknown User'} poked{' '}
                            {poke.toUser?.id === user?.id ? 'you' : poke.toUser?.username}
                          </p>
                          <p className="text-sm text-gray-500 flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {formatDistanceToNow(new Date(poke.timestamp), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">+{poke.pointsEarned}</p>
                        <p className="text-sm text-gray-500">points</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Leaderboard Preview - Using topUsers from context */}
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
                      <div key={user.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
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
                    View Full Leaderboard â†’
                  </Link>
                </>
              )}
            </div>

            {/* Milestones */}
            <div className="card">
              <h3 className="text-xl font-bold mb-4 flex items-center space-x-2">
                <Award className="w-5 h-5" />
                <span>Next Milestones</span>
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                      1
                    </div>
                    <div>
                      <span className="font-medium">500 Pokes Sent</span>
                      <p className="text-sm text-gray-600">{500 - pokesSent} more to go</p>
                    </div>
                  </div>
                  <span className="text-blue-600 font-semibold">+100 points</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
                      2
                    </div>
                    <div>
                      <span className="font-medium">30 Day Streak</span>
                      <p className="text-sm text-gray-600">{30 - streak} more days</p>
                    </div>
                  </div>
                  <span className="text-purple-600 font-semibold">+500 points</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                      3
                    </div>
                    <div>
                      <span className="font-medium">20K Total Points</span>
                      <p className="text-sm text-gray-600">{20000 - totalEarned} more points</p>
                    </div>
                  </div>
                  <span className="text-green-600 font-semibold">+250 points</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
