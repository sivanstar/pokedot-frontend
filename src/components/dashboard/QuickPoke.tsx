import React, { useState } from 'react';
import { Search, User, Zap } from 'lucide-react';
import { PokeButton } from '../poke/PokeButton';

interface QuickUser {
  id: string;
  username: string;
  points: number;
  pokesSent: number;
  pokesReceived: number;
  streak: number;
  rank: number;
  isOnline: boolean;
}

export const QuickPoke: React.FC = () => {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<QuickUser[]>([
    { id: '2', username: 'ZapZap', points: 9800, pokesSent: 320, pokesReceived: 280, streak: 7, rank: 2, isOnline: true },
    { id: '3', username: 'Sparky', points: 7600, pokesSent: 280, pokesReceived: 240, streak: 21, rank: 3, isOnline: false },
    { id: '4', username: 'Thunder', points: 5400, pokesSent: 210, pokesReceived: 180, streak: 3, rank: 4, isOnline: true },
    { id: '5', username: 'Volt', points: 4300, pokesSent: 180, pokesReceived: 150, streak: 5, rank: 5, isOnline: true },
    { id: '6', username: 'Lightning', points: 3800, pokesSent: 150, pokesReceived: 120, streak: 2, rank: 6, isOnline: false },
    { id: '7', username: 'Shock', points: 3200, pokesSent: 130, pokesReceived: 100, streak: 8, rank: 7, isOnline: true },
  ]);

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(search.toLowerCase())
  );

  const handlePokeSuccess = (userId: string, pointsEarned: number) => {
    // Update user points when poked successfully
    setUsers(prevUsers =>
      prevUsers.map(user =>
        user.id === userId
          ? { ...user, points: user.points + pointsEarned, pokesReceived: user.pokesReceived + 1 }
          : user
      )
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold mb-4 flex items-center space-x-2">
        <Zap className="w-5 h-5" />
        <span>Quick Poke</span>
      </h3>
      
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search users to poke..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-10"
        />
      </div>

      {filteredUsers.length > 0 ? (
        <div className="space-y-3">
          {filteredUsers.slice(0, 5).map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg border"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center text-white">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold">{user.username}</p>
                  <p className="text-sm text-gray-500">
                    {user.points.toLocaleString()} points
                  </p>
                </div>
              </div>
              <PokeButton
                userId={user.id}
                username={user.username}
                size="sm"
                variant="primary"
                onPokeSuccess={(pointsEarned) => handlePokeSuccess(user.id, pointsEarned)}
              />
            </div>
          ))}
        </div>
      ) : search.length > 0 ? (
        <p className="text-center text-gray-500 py-4">No users found</p>
      ) : (
        <p className="text-center text-gray-500 py-4">
          Type to search for users
        </p>
      )}
    </div>
  );
};
