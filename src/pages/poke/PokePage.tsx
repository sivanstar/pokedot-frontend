import React, { useState, useEffect } from 'react';
import { Search, Users, Zap, TrendingUp, Filter, Clock, RefreshCw, AlertCircle } from 'lucide-react';
import { usePoke } from '../../context/PokeContext';
import { PokeButton } from '../../components/poke';
import { DailyLimitsDisplay } from '../../components/poke';
import toast from 'react-hot-toast';

export const PokePage: React.FC = () => {
  const { user, dailyLimits, getAvailableUsers } = usePoke();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'online' | 'top'>('all');
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAvailableUsers(searchQuery);
      
      if (response.success) {
        const usersWithIds = (response.users || []).map((user: any) => ({
          ...user,
          id: user._id || user.id || `user_${Date.now()}_${Math.random()}`,
          _id: user._id || user.id || `user_${Date.now()}_${Math.random()}`
        }));
        
        setAvailableUsers(usersWithIds);
      } else {
        setError(response.message || 'Failed to load users');
        toast.error(response.message || 'Failed to load users');
      }
    } catch (error: any) {
      console.error('Error loading users:', error);
      setError(error.response?.data?.message || 'Network error');
      toast.error('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadUsers();
    setTimeout(() => setRefreshing(false), 500);
  };

  useEffect(() => {
    loadUsers();
  }, [searchQuery]);

  const filteredUsers = availableUsers.filter(u => {
    if (filter === 'online') return u.isOnline;
    if (filter === 'top') return u.rank <= 10;
    return true;
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (a.isOnline && !b.isOnline) return -1;
    if (!a.isOnline && b.isOnline) return 1;
    return b.points - a.points;
  });

  const handlePokeSuccess = (pointsEarned: number) => {
    toast.success(`Poke successful! +${pointsEarned} points earned!`, {
      duration: 3000,
      icon: '⚡',
    });
    loadUsers();
  };

  const handlePokeError = (error: any) => {
    console.error('Poke error from button:', error);
    toast.error(error.message || 'Poke failed');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="container mx-auto px-4 py-4 md:py-8">
        {/* Header - Mobile Optimized */}
        <div className="text-center mb-6 md:mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full mb-3 md:mb-4 animate-float">
            <Zap className="w-8 h-8 md:w-10 md:h-10 text-white" />
          </div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">Poke & Earn</h1>
          <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto">
            Poke other users to earn 50 points each! Daily limit: 2 sends, 2 receives.
          </p>
          <div className="mt-3 md:mt-4 inline-flex items-center space-x-2 bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 px-3 py-1.5 md:px-4 md:py-2 rounded-lg border border-yellow-200">
            <Clock className="w-4 h-4" />
            <span className="font-bold text-sm md:text-base">Today: {dailyLimits.remainingSends}/2 pokes</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8">
          {/* Left Column - Search and Users */}
          <div className="lg:col-span-3 space-y-6">
            {/* Search and Filter */}
            <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 md:pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  />
                </div>
                
                <div className="flex items-center space-x-2 md:space-x-3">
                  <div className="flex gap-1 md:gap-2">
                    <button
                      onClick={() => setFilter('all')}
                      className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg font-medium transition-colors text-xs md:text-sm whitespace-nowrap ${
                        filter === 'all'
                          ? 'bg-primary-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setFilter('online')}
                      className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg font-medium transition-colors text-xs md:text-sm whitespace-nowrap ${
                        filter === 'online'
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <span className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-500 rounded-full"></div>
                        Online
                      </span>
                    </button>
                    <button
                      onClick={() => setFilter('top')}
                      className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg font-medium transition-colors text-xs md:text-sm whitespace-nowrap ${
                        filter === 'top'
                          ? 'bg-yellow-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Top
                    </button>
                  </div>
                  
                  <button
                    onClick={handleRefresh}
                    disabled={refreshing || loading}
                    className="p-1.5 md:p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors disabled:opacity-50"
                    title="Refresh"
                  >
                    <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>
              
              <div className="mt-3 flex items-center justify-between text-xs md:text-sm text-gray-500">
                <span>
                  {sortedUsers.length} user{sortedUsers.length !== 1 ? 's' : ''} found
                  {searchQuery && ` for "${searchQuery}"`}
                </span>
                <span className="flex items-center gap-1">
                  <Zap className="w-3 h-3 md:w-4 md:h-4" />
                  50 pts each
                </span>
              </div>
            </div>

            {/* Users Grid */}
            {error ? (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6 md:p-8 text-center">
                <AlertCircle className="w-12 h-12 md:w-16 md:h-16 text-red-300 mx-auto mb-3 md:mb-4" />
                <h3 className="text-lg md:text-xl font-bold text-red-800 mb-2">Error Loading Users</h3>
                <p className="text-sm md:text-base text-red-600 mb-4">{error}</p>
                <button
                  onClick={loadUsers}
                  className="px-4 md:px-6 py-2 bg-red-600 text-white rounded-lg text-sm md:text-base hover:bg-red-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : loading ? (
              <div className="text-center py-8 md:py-12">
                <div className="animate-spin rounded-full h-8 w-8 md:h-12 md:w-12 border-b-2 border-primary-600 mx-auto"></div>
                <p className="mt-3 md:mt-4 text-sm md:text-base text-gray-600">Loading users...</p>
              </div>
            ) : sortedUsers.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-8 md:p-12 text-center">
                <Users className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-3 md:mb-4" />
                <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-2">No users found</h3>
                <p className="text-sm md:text-base text-gray-600">
                  {searchQuery 
                    ? `No users found matching "${searchQuery}"`
                    : 'No users available to poke. Try again later!'}
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="mt-3 md:mt-4 text-primary-600 hover:text-primary-500 text-sm md:text-base font-medium"
                  >
                    Clear search
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {sortedUsers.map((userData, index) => {
                  const userId = userData._id || userData.id;
                  const currentUserId = user?._id || user?.id;
                  
                  return (
                    <div
                      key={userId || index}
                      className="bg-white rounded-xl shadow-lg p-4 md:p-5 hover:shadow-xl transition-shadow border border-gray-100"
                    >
                      <div className="flex items-start justify-between mb-3 md:mb-4">
                        <div className="flex items-center space-x-3 md:space-x-4">
                          <div className="relative">
                            <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center text-white text-lg md:text-xl font-bold">
                              {userData.username?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            {userData.isOnline && (
                              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 md:w-4 md:h-4 bg-green-500 rounded-full border-2 border-white"></div>
                            )}
                          </div>
                          <div>
                            <h3 className="text-base md:text-lg font-bold text-gray-800">{userData.username}</h3>
                            <p className="text-xs md:text-sm text-gray-600">{userData.points?.toLocaleString() || 0} pts</p>
                            <div className="flex items-center gap-2 mt-0.5 md:mt-1">
                              <span className="text-xs text-gray-500">
                                #{userData.rank || 999}
                              </span>
                              <span className="text-xs text-green-600">
                                {userData.streak || 0}d
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 md:gap-3 mb-4 md:mb-5">
                        <div className="text-center p-2 bg-gray-50 rounded-lg">
                          <div className="text-base md:text-lg font-bold text-primary-600">
                            {userData.pokesSent || 0}
                          </div>
                          <div className="text-xs text-gray-600">Sent</div>
                        </div>
                        <div className="text-center p-2 bg-gray-50 rounded-lg">
                          <div className="text-base md:text-lg font-bold text-secondary-600">
                            {userData.pokesReceived || 0}
                          </div>
                          <div className="text-xs text-gray-600">Received</div>
                        </div>
                      </div>
                      
                      {userId && userId !== currentUserId ? (
                        <PokeButton
                          userId={userId}
                          username={userData.username}
                          size="md"
                          variant="primary"
                          onPokeSuccess={handlePokeSuccess}
                          onPokeError={handlePokeError}
                        />
                      ) : (
                        <div className="text-center py-2 text-xs md:text-sm text-gray-500 bg-gray-50 rounded-lg">
                          This is you!
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column - Limits and Info */}
          <div className="space-y-6">
            <DailyLimitsDisplay />
            
            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
              <h3 className="text-base md:text-lg font-bold mb-3 md:mb-4 text-gray-800">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs md:text-sm text-gray-600">Total Users</span>
                  <span className="font-bold text-sm md:text-base">{availableUsers.length + 1}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs md:text-sm text-gray-600">Online Now</span>
                  <span className="font-bold text-sm md:text-base text-green-600">
                    {availableUsers.filter(u => u.isOnline).length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs md:text-sm text-gray-600">Avg Points</span>
                  <span className="font-bold text-sm md:text-base">
                    {availableUsers.length > 0 
                      ? Math.round(availableUsers.reduce((sum, u) => sum + (u.points || 0), 0) / availableUsers.length).toLocaleString()
                      : '0'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
