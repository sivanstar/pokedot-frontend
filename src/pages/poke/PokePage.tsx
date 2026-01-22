import React, { useState } from 'react';
import { Search, Users, Zap, TrendingUp, Filter, Clock } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '../../api/user';
import { PokeAnimation } from '../../components/poke/PokeAnimation';
import toast from 'react-hot-toast';

export const PokePage: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [showAnimation, setShowAnimation] = useState(false);
  const [animationPoints, setAnimationPoints] = useState(0);
  const [filter, setFilter] = useState<'all' | 'online' | 'recent'>('all');

  const { data: users, isLoading } = useQuery({
    queryKey: ['availableUsers', search, filter],
    queryFn: () => userApi.getAvailableUsers(search, 1, 20).then(res => res.data),
  });

  const pokeMutation = useMutation({
    mutationFn: (userId: string) => userApi.sendPoke(userId),
    onSuccess: (response) => {
      setAnimationPoints(response.data.pointsEarned);
      setShowAnimation(true);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success(`Poke sent! +${response.data.pointsEarned} points`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to send poke');
    },
  });

  const handlePoke = (userId: string, username: string) => {
    if (window.confirm(`Poke ${username}?`)) {
      pokeMutation.mutate(userId);
    }
  };

  const filteredUsers = users?.users?.filter(user => {
    if (filter === 'online') return user.isOnline;
    if (filter === 'recent') {
      const lastActive = user.lastActiveAt ? new Date(user.lastActiveAt) : new Date();
      const hoursSinceActive = (Date.now() - lastActive.getTime()) / (1000 * 60 * 60);
      return hoursSinceActive < 24;
    }
    return true;
  }) || [];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <PokeAnimation
        isVisible={showAnimation}
        pointsEarned={animationPoints}
        onComplete={() => setShowAnimation(false)}
      />
      
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full mb-6 animate-float">
            <Zap className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Poke & Earn</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Poke other users to earn points, climb the leaderboard, and unlock rewards!
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search users by username..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-12"
              />
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Users
              </button>
              <button
                onClick={() => setFilter('online')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'online'
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Online
                </span>
              </button>
              <button
                onClick={() => setFilter('recent')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'recent'
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Recent
                </span>
              </button>
            </div>
          </div>
          
          <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
            <span>{filteredUsers.length} users found</span>
            <span>Each poke earns 10 points</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main User List */}
          <div className="lg:col-span-2">
            {isLoading ? (
              <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading users...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">No users found</h3>
                <p className="text-gray-600">Try a different search or filter</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                          {user.isOnline && (
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
                          )}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">{user.username}</h3>
                          <p className="text-gray-600">{user.points.toLocaleString()} points</p>
                          {user.lastActiveAt && (
                            <p className="text-sm text-gray-500">
                              Active {new Date(user.lastActiveAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-primary-600">{user.pokesSent}</div>
                        <div className="text-sm text-gray-600">Pokes Sent</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-secondary-600">{user.pokesReceived}</div>
                        <div className="text-sm text-gray-600">Pokes Received</div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handlePoke(user.id, user.username)}
                      disabled={pokeMutation.isPending}
                      className="btn-primary w-full py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {pokeMutation.isPending ? (
                        <span className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Poking...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center">
                          <Zap className="mr-2 w-5 h-5" />
                          Poke for Points!
                        </span>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* How it Works */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold mb-4 text-gray-800">How It Works</h3>
              <ul className="space-y-4">
                <li className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Find Users</p>
                    <p className="text-sm text-gray-600">Search for users to poke</p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                    2
                  </div>
                  <div>
                    <p className="font-medium">Send Pokes</p>
                    <p className="text-sm text-gray-600">Click the poke button to earn points</p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Climb Leaderboard</p>
                    <p className="text-sm text-gray-600">Earn more points to rank higher</p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                    4
                  </div>
                  <div>
                    <p className="font-medium">Get Rewards</p>
                    <p className="text-sm text-gray-600">Unlock bonuses and rewards</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Top Pokers */}
            <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl p-6 text-white">
              <div className="flex items-center space-x-2 mb-4">
                <TrendingUp className="w-6 h-6" />
                <h3 className="text-xl font-bold">Top Pokers Today</h3>
              </div>
              
              {filteredUsers
                .sort((a, b) => b.pokesSent - a.pokesSent)
                .slice(0, 3)
                .map((user, index) => (
                  <div key={user.id} className="flex items-center justify-between mb-4 last:mb-0">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold">{user.username}</p>
                        <p className="text-sm opacity-80">{user.pokesSent} pokes</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{user.points.toLocaleString()}</p>
                      <p className="text-sm opacity-80">points</p>
                    </div>
                  </div>
                ))}
            </div>

            {/* Poke Rules */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold mb-4 text-gray-800">Poke Rules</h3>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="font-medium text-blue-800">• 10 points per poke</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="font-medium text-green-800">• 5 pokes per hour limit</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <p className="font-medium text-purple-800">• Daily streak bonuses</p>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg">
                  <p className="font-medium text-orange-800">• No spamming allowed</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};