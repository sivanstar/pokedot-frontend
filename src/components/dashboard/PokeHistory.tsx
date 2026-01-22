import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Clock, ArrowRight } from 'lucide-react';
import { userApi } from '../../api/user';

export const PokeHistory: React.FC = () => {
  const { data: pokeHistory } = useQuery({
    queryKey: ['pokeHistory'],
    queryFn: () => userApi.getPokeHistory().then(res => res.data),
  });

  if (!pokeHistory?.pokes || pokeHistory.pokes.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p>No poke history yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {pokeHistory.pokes.slice(0, 10).map((poke: any) => (
        <div
          key={poke.id}
          className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg border"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center text-white">
              {poke.fromUser?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <p className="font-semibold">
                {poke.fromUser?.username || 'Unknown User'}
              </p>
              <p className="text-sm text-gray-500 flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                {new Date(poke.timestamp).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <ArrowRight className="w-4 h-4 text-gray-400" />
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white">
              {poke.toUser?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="text-right">
              <p className="font-semibold">+{poke.pointsEarned}</p>
              <p className="text-sm text-gray-500">points</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};