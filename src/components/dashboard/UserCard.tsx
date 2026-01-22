import React from 'react';
import { TrendingUp, Zap, Users } from 'lucide-react';
import { PokeButton } from '../poke/PokeButton';

interface User {
  id: string;
  username: string;
  points: number;
  pokesSent: number;
  pokesReceived: number;
  streak: number;
  rank: number;
  isOnline: boolean;
}

interface UserCardProps {
  user: User;
  showDetails?: boolean;
}

export const UserCard: React.FC<UserCardProps> = ({ user, showDetails = true }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
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
            <h3 className="text-xl font-bold text-gray-800">{user.username}</h3>
            <p className="text-gray-600">{user.points.toLocaleString()} points</p>
            {user.streak > 0 && (
              <div className="flex items-center space-x-1 mt-1">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-600">{user.streak} day streak</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {showDetails && (
        <>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center space-x-2 mb-1">
                <Zap className="w-4 h-4 text-primary-600" />
                <div className="text-2xl font-bold text-primary-600">{user.pokesSent}</div>
              </div>
              <div className="text-sm text-gray-600">Pokes Sent</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center space-x-2 mb-1">
                <Users className="w-4 h-4 text-secondary-600" />
                <div className="text-2xl font-bold text-secondary-600">{user.pokesReceived}</div>
              </div>
              <div className="text-sm text-gray-600">Pokes Received</div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <span className="text-gray-500">Rank:</span>
              <span className="font-semibold ml-2">#{user.rank}</span>
            </div>
            <PokeButton
              userId={user.id}
              username={user.username}
              size="md"
              variant="primary"
            />
          </div>
        </>
      )}
    </div>
  );
};
