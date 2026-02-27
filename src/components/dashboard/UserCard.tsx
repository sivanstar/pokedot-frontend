import React from 'react';
import { Link } from 'react-router-dom';
import { User, Zap } from 'lucide-react';

interface UserCardProps {
  user: any;
}

export const UserCard: React.FC<UserCardProps> = ({ user }) => {
  return (
    <div className="flex items-center justify-between p-3 md:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center text-white font-bold">
          {user.username?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div>
          <p className="font-semibold text-sm md:text-base">{user.username}</p>
          <p className="text-xs md:text-sm text-gray-500">
            {user.points?.toLocaleString() || 0} points
          </p>
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-xs text-gray-400">#{user.rank || 999}</span>
            {user.isOnline && (
              <span className="text-xs text-green-500">● Online</span>
            )}
          </div>
        </div>
      </div>
      <Link
        to={`/poke?user=${user._id}`}
        className="bg-primary-500 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors flex items-center space-x-1"
      >
        <Zap className="w-3 h-3 md:w-4 md:h-4" />
        <span>Poke</span>
      </Link>
    </div>
  );
};
