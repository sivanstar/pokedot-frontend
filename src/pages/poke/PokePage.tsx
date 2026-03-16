import React, { useState, useEffect } from 'react';
import { Search, Users, Zap, TrendingUp, Filter, Clock, RefreshCw, AlertCircle } from 'lucide-react';
import { usePoke } from '../../context/PokeContext';
import { PokeButton } from '../../components/poke/PokeButton';
import { DailyLimitsDisplay } from '../../components/poke/DailyLimitsDisplay';
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
      console.log('API Response:', response); // Debug log
      
      if (response.success) {
        // Ensure each user has a valid ID
        const usersWithIds = (response.users || []).map((user: any) => ({
          ...user,
          // Use _id if available, otherwise generate a fallback
          id: user._id || user.id || `user_${Date.now()}_${Math.random()}`,
          _id: user._id || user.id || `user_${Date.now()}_${Math.random()}`
        }));
        
        console.log('Processed users:', usersWithIds.map(u => ({ 
          username: u.username, 
          id: u.id, 
          _id: u._id 
        }))); // Debug log
        
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

  // Filter users based on selected filter
  const filteredUsers = availableUsers.filter(u => {
    if (filter === 'online') return u.isOnline;
    if (filter === 'top') return u.rank <= 10;
    return true;
  });

  // Sort users: online first, then by points
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
    // Refresh users list after successful poke
    loadUsers();
  };

  const handlePokeError = (error: any) => {
    console.error('Poke error from button:', error);
    toast.error(error.message || 'Poke failed');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full mb-4 animate-float">
            <Zap className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Poke & Earn</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Poke other users to earn 50 points each! Daily limit: 2 sends, 2 receives.
          </p>
          <div className="mt-4 inline-flex items-center space-x-2 bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 px-4 py-2 rounded-lg border border-yellow-200">
            <Clock className="w-4 h-4" />
            <span className="font-bold">Remaining today: {dailyLimits.remainingSends} pokes</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column - Search and Users */}
          <div className="lg:col-span-3">
            {/* Search and Filter */}
            <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search users by username..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input-field pl-12"
                  />
                </div>
                
                <div className="flex items-center space-x-3">
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
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <span className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        Online
                      </span>
                    </button>
                    <button
                      onClick={() => setFilter('top')}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        filter === 'top'
                          ? 'bg-yellow-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Top 10
                    </button>
                  </div>
                  
                  <button
                    onClick={handleRefresh}
                    disabled={refreshing || loading}
                    className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors disabled:opacity-50"
                    title="Refresh"
                  >
                    <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>
              
              <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                <span>
                  {sortedUsers.length} user{sortedUsers.length !== 1 ? 's' : ''} found
                  {searchQuery && ` for "${searchQuery}"`}
                </span>
                <span className="flex items-center gap-1">
                  <Zap className="w-4 h-4" />
                  50 points per poke
                </span>
              </div>
            </div>

            {/* Users Grid */}
            {error ? (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
                <AlertCircle className="w-16 h-16 text-red-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-red-800 mb-2">Error Loading Users</h3>
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={loadUsers}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading users...</p>
              </div>
            ) : sortedUsers.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">No users found</h3>
                <p className="text-gray-600">
                  {searchQuery 
                    ? `No users found matching "${searchQuery}"`
                    : 'No users available to poke at the moment. Try again later!'}
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="mt-4 text-primary-600 hover:text-primary-500 font-medium"
                  >
                    Clear search
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedUsers.map((userData, index) => {
                  // Get the userId - prefer _id, then id
                  const userId = userData._id || userData.id;
                  const currentUserId = user?._id || user?.id;
                  
                  console.log(`User ${index}:`, { 
                    username: userData.username, 
                    userId, 
                    currentUserId,
                    isSameUser: userId === currentUserId 
                  }); // Debug log
                  
                  return (
                    <div
                      key={userId || index}
                      className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="relative">
                            <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                              {userData.username?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            {userData.isOnline && (
                              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
                            )}
                          </div>
                          <div>
                            <h3 className="text-xl font-bold">{userData.username}</h3>
                            <p className="text-gray-600">{userData.points?.toLocaleString() || 0} points</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-sm text-gray-500">
                                #{userData.rank || 999}
                              </span>
                              <span className="text-sm text-green-600">
                                {userData.streak || 0} day streak
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className="text-2xl font-bold text-primary-600">
                            {userData.pokesSent || 0}
                          </div>
                          <div className="text-sm text-gray-600">Pokes Sent</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className="text-2xl font-bold text-secondary-600">
                            {userData.pokesReceived || 0}
                          </div>
                          <div className="text-sm text-gray-600">Pokes Received</div>
                        </div>
                      </div>
                      
                      {userId && userId !== currentUserId ? (
                        <div className="space-y-3">
                          {userData.canPoke === false && userData.reason && (
                            <div className="text-sm text-yellow-600 bg-yellow-50 p-2 rounded-lg">
                              {userData.reason}
                            </div>
                          )}
                          <PokeButton
                            userId={userId}
                            username={userData.username}
                            size="lg"
                            variant="primary"
                            onPokeSuccess={handlePokeSuccess}
                            onPokeError={handlePokeError}
                          />
                        </div>
                      ) : (
                        <div className="text-center py-3 text-gray-500 bg-gray-50 rounded-lg">
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
          <div className="space-y-8">
            <DailyLimitsDisplay />
            
            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4 text-gray-800">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Users</span>
                  <span className="font-bold">{availableUsers.length + 1}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Online Now</span>
                  <span className="font-bold text-green-600">
                    {availableUsers.filter(u => u.isOnline).length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Avg Points</span>
                  <span className="font-bold">
                    {availableUsers.length > 0 
                      ? Math.round(availableUsers.reduce((sum, u) => sum + (u.points || 0), 0) / availableUsers.length).toLocaleString()
                      : '0'}
                  </span>
                </div>
              </div>
            </div>
            
            {/* How It Works */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4 text-gray-800">How Poking Works</h3>
              <ul className="space-y-4">
                <li className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Find Users</p>
                    <p className="text-sm text-gray-600">Browse or search for users to poke</p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                    2
                  </div>
                  <div>
                    <p className="font-medium">Watch Ad</p>
                    <p className="text-sm text-gray-600">Complete a short ad to earn points</p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Send Poke</p>
                    <p className="text-sm text-gray-600">Earn 50 points for both users</p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                    4
                  </div>
                  <div>
                    <p className="font-medium">Withdraw</p>
                    <p className="text-sm text-gray-600">Convert points to cash (min 2000)</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
