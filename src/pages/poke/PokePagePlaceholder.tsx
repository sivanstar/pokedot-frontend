import React, { useState } from 'react';
import { Search, User, Zap, Filter } from 'lucide-react';
import { PokeButton } from '../../components/poke/PokeButton';

interface PokeUser {
  id: string;
  username: string;
  points: number;
  pokesSent: number;
  pokesReceived: number;
  streak: number;
  rank: number;
  isOnline: boolean;
}

export const PokePagePlaceholder = () => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'online' | 'top'>('all');
  
  const users: PokeUser[] = [
    { id: '2', username: 'ZapZap', points: 9800, pokesSent: 320, pokesReceived: 280, streak: 7, rank: 2, isOnline: true },
    { id: '3', username: 'Sparky', points: 7600, pokesSent: 280, pokesReceived: 240, streak: 21, rank: 3, isOnline: false },
    { id: '4', username: 'Thunder', points: 5400, pokesSent: 210, pokesReceived: 180, streak: 3, rank: 4, isOnline: true },
    { id: '5', username: 'Volt', points: 4300, pokesSent: 180, pokesReceived: 150, streak: 5, rank: 5, isOnline: true },
    { id: '6', username: 'Lightning', points: 3800, pokesSent: 150, pokesReceived: 120, streak: 2, rank: 6, isOnline: false },
    { id: '7', username: 'Shock', points: 3200, pokesSent: 130, pokesReceived: 100, streak: 8, rank: 7, isOnline: true },
    { id: '8', username: 'Jolt', points: 2800, pokesSent: 110, pokesReceived: 90, streak: 1, rank: 8, isOnline: true },
    { id: '9', username: 'Bolt', points: 2400, pokesSent: 95, pokesReceived: 80, streak: 4, rank: 9, isOnline: false },
    { id: '10', username: 'Spark', points: 2100, pokesSent: 85, pokesReceived: 70, streak: 6, rank: 10, isOnline: true },
  ];

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = 
      filter === 'all' ? true :
      filter === 'online' ? user.isOnline :
      filter === 'top' ? user.rank <= 5 : true;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full mb-4 animate-float">
            <Zap className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Poke Users</h1>
          <p className="text-gray-600">Find and poke other users to earn points</p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search users by username..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-10 w-full"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-primary-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                All Users
              </button>
              <button
                onClick={() => setFilter('online')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'online'
                    ? 'bg-green-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Online
              </button>
              <button
                onClick={() => setFilter('top')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'top'
                    ? 'bg-yellow-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Top 5
              </button>
            </div>
          </div>
        </div>

        {/* Users Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredUsers.map((user) => (
            <div key={user.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center text-white font-bold">
                      {user.username.charAt(0)}
                    </div>
                    {user.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">{user.username}</h3>
                    <p className="text-sm text-gray-500">#{user.rank} • {user.points.toLocaleString()} pts</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Pokes Sent:</span>
                  <span className="font-semibold">{user.pokesSent}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Pokes Received:</span>
                  <span className="font-semibold">{user.pokesReceived}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Streak:</span>
                  <span className="font-semibold text-green-600">{user.streak} days</span>
                </div>
              </div>
              
              <PokeButton
                userId={user.id}
                username={user.username}
                size="md"
                variant="primary"
              />
            </div>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No users found matching your search</p>
            {search && (
              <button
                onClick={() => setSearch('')}
                className="text-primary-600 hover:text-primary-500 mt-2"
              >
                Clear search
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
