import React, { useState } from 'react';
import { Trophy, Medal, Crown, TrendingUp, Clock, Calendar, Star, Zap, ChevronRight } from 'lucide-react';
import { usePoke } from '../../context/PokeContext';

export const Leaderboard: React.FC = () => {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'all-time'>('all-time');
  const { user, topUsers } = usePoke();

  // Use topUsers from context as the leaders
  const leaders = topUsers;

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'from-yellow-400 to-yellow-600';
    if (rank === 2) return 'from-gray-300 to-gray-400';
    if (rank === 3) return 'from-amber-600 to-amber-800';
    return 'from-primary-400 to-secondary-400';
  };

  const getMedal = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 md:w-6 md:h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 md:w-6 md:h-6 text-gray-400" />;
    if (rank === 3) return <Medal className="w-5 h-5 md:w-6 md:h-6 text-amber-700" />;
    return <span className="text-gray-500 font-bold text-sm md:text-base">{rank}</span>;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 md:py-8">
      <div className="container mx-auto px-3 md:px-4">
        {/* Header */}
        <div className="text-center mb-6 md:mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-3 md:mb-4 animate-float">
            <Trophy className="w-8 h-8 md:w-10 md:h-10 text-white" />
          </div>
          <h1 className="text-2xl md:text-4xl font-bold text-gray-800 mb-2 md:mb-4">Global Leaderboard</h1>
          <p className="text-sm md:text-base text-gray-600">See who's on top of the poke game</p>
        </div>

        {/* Period Selector - Horizontal scroll on mobile */}
        <div className="flex overflow-x-auto pb-2 md:pb-0 md:flex-wrap md:justify-center gap-2 md:gap-4 mb-6 md:mb-8 hide-scrollbar">
          <button
            onClick={() => setPeriod('daily')}
            className={`flex items-center space-x-1 md:space-x-2 px-4 md:px-6 py-2 md:py-3 rounded-lg transition-all whitespace-nowrap ${
              period === 'daily'
                ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100 shadow'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span className="font-semibold text-sm md:text-base">Daily</span>
          </button>
          <button
            onClick={() => setPeriod('weekly')}
            className={`flex items-center space-x-1 md:space-x-2 px-4 md:px-6 py-2 md:py-3 rounded-lg transition-all whitespace-nowrap ${
              period === 'weekly'
                ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100 shadow'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span className="font-semibold text-sm md:text-base">Weekly</span>
          </button>
          <button
            onClick={() => setPeriod('all-time')}
            className={`flex items-center space-x-1 md:space-x-2 px-4 md:px-6 py-2 md:py-3 rounded-lg transition-all whitespace-nowrap ${
              period === 'all-time'
                ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100 shadow'
            }`}
          >
            <Star className="w-4 h-4" />
            <span className="font-semibold text-sm md:text-base">All Time</span>
          </button>
        </div>

        {/* Your Rank Card - Mobile Optimized */}
        <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl p-4 md:p-6 text-white mb-6 md:mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg md:text-xl font-bold mb-2">Your Position</h3>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl md:text-5xl font-bold">#{user?.rank || 999}</span>
                <span className="text-xs md:text-lg opacity-90">of {leaders.length.toLocaleString()} users</span>
              </div>
              <div className="mt-3 md:mt-4 flex flex-wrap gap-3 md:gap-6">
                <div className="flex items-center space-x-1 md:space-x-2">
                  <span className="text-xs md:text-sm opacity-90">Points:</span>
                  <span className="font-bold text-sm md:text-xl">{user?.points?.toLocaleString() || 0}</span>
                </div>
                <div className="flex items-center space-x-1 md:space-x-2">
                  <span className="text-xs md:text-sm opacity-90">Streak:</span>
                  <span className="font-bold text-sm md:text-xl">{user?.streak || 0}d</span>
                </div>
                <div className="flex items-center space-x-1 md:space-x-2">
                  <span className="text-xs md:text-sm opacity-90">Pokes:</span>
                  <span className="font-bold text-sm md:text-xl">{user?.pokesSent || 0}</span>
                </div>
              </div>
            </div>
            <TrendingUp className="w-12 h-12 md:w-16 md:h-16 opacity-50 hidden sm:block" />
          </div>
        </div>

        {/* Leaderboard - Mobile Card View */}
        <div className="lg:hidden space-y-3">
          {leaders.map((leader, index) => {
            const rank = index + 1;
            return (
              <div key={leader.id || index} className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8">
                      {getMedal(rank)}
                    </div>
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getRankColor(rank)} flex items-center justify-center text-white font-bold`}>
                      {leader.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{leader.username}</p>
                      {rank === 1 && (
                        <span className="inline-flex items-center text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                          <Trophy className="w-3 h-3 mr-1" />
                          Top Poker
                        </span>
                      )}
                    </div>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${leader.isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
                </div>
                
                <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-gray-100">
                  <div className="text-center">
                    <p className="text-sm font-bold text-primary-600">{leader.points?.toLocaleString() || 0}</p>
                    <p className="text-xs text-gray-500">Points</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-gray-700">{leader.pokesSent || 0}</p>
                    <p className="text-xs text-gray-500">Sent</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {leader.streak || 0}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">Streak</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Leaderboard Table - Desktop View */}
        <div className="hidden lg:block card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-4 px-6 text-left">Rank</th>
                  <th className="py-4 px-6 text-left">User</th>
                  <th className="py-4 px-6 text-left">Points</th>
                  <th className="py-4 px-6 text-left">Pokes</th>
                  <th className="py-4 px-6 text-left">Streak</th>
                  <th className="py-4 px-6 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {leaders.map((leader, index) => {
                  const rank = index + 1;
                  return (
                    <tr key={leader.id} className="border-t hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center w-10 h-10">
                          {getMedal(rank)}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-10 h-10 rounded-full bg-gradient-to-br ${getRankColor(rank)} flex items-center justify-center text-white font-bold`}
                          >
                            {leader.username?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div>
                            <p className="font-semibold">{leader.username}</p>
                            {rank === 1 && (
                              <span className="inline-flex items-center text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                                <Trophy className="w-3 h-3 mr-1" />
                                Top Poker
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-bold text-lg">
                          {leader.points?.toLocaleString() || 0}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold">{leader.pokesSent || 0}</span>
                          <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                          <span className="text-gray-600">{leader.pokesReceived || 0}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
                            {leader.streak || 0}
                          </div>
                          <span className="text-gray-600">days</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${leader.isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
                          <span className="text-gray-600">{leader.isOnline ? 'Online' : 'Offline'}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {leaders.length === 0 && (
          <div className="text-center py-8 md:py-12 bg-white rounded-xl shadow-lg">
            <Trophy className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 text-gray-300" />
            <h3 className="text-base md:text-lg font-medium text-gray-900 mb-2">No Leaderboard Data</h3>
            <p className="text-sm md:text-base text-gray-500 px-4">Be the first to start poking and climb the ranks!</p>
          </div>
        )}
      </div>

      {/* Hide scrollbar styles */}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};
