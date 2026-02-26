import React, { useState, useEffect } from 'react';
import {
  Zap, Search, RefreshCw, Calendar,
  ArrowRight, Filter, Download, TrendingUp,
  Users, Clock, ChevronLeft, ChevronRight
} from 'lucide-react';
import { adminApi, PokeTransaction } from '../../api/admin';
import { formatDistanceToNow, format } from 'date-fns';
import toast from 'react-hot-toast';

interface PokeHistoryProps {
  onRefresh?: () => void;
}

export const PokeHistory: React.FC<PokeHistoryProps> = ({ onRefresh }) => {
  const [pokes, setPokes] = useState<PokeTransaction[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    totalPointsExchanged: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1
  });

  const loadPokes = async (page = 1, search = '') => {
    setLoading(true);
    try {
      const response = await adminApi.getPokeTransactions(page, 20, search);
      if (response.success) {
        setPokes(response.pokes);
        setStats(response.stats);
        setPagination(response.pagination);
      }
    } catch (error) {
      console.error('Error loading pokes:', error);
      toast.error('Failed to load poke history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPokes();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadPokes(1, searchTerm);
  };

  const handleRefresh = () => {
    loadPokes(pagination.page, searchTerm);
    if (onRefresh) onRefresh();
    toast.success('Poke history refreshed');
  };

  const formatPoints = (points: number) => {
    return points.toLocaleString() + ' pts';
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Zap className="w-8 h-8 opacity-80" />
            <span className="text-sm opacity-80">All Time</span>
          </div>
          <div className="text-3xl font-bold mb-1">{stats.total.toLocaleString()}</div>
          <div className="text-sm opacity-90">Total Pokes</div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Calendar className="w-8 h-8 opacity-80" />
            <span className="text-sm opacity-80">Today</span>
          </div>
          <div className="text-3xl font-bold mb-1">{stats.today.toLocaleString()}</div>
          <div className="text-sm opacity-90">Pokes Today</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-8 h-8 opacity-80" />
            <span className="text-sm opacity-80">Points</span>
          </div>
          <div className="text-3xl font-bold mb-1">{formatPoints(stats.totalPointsExchanged)}</div>
          <div className="text-sm opacity-90">Total Points Exchanged</div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by username..."
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            Search
          </button>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </form>
      </div>

      {/* Pokes Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading poke history...</p>
          </div>
        ) : pokes.length === 0 ? (
          <div className="text-center py-12">
            <Zap className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Pokes Found</h3>
            <p className="text-gray-500">No poke transactions match your criteria.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sender
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Receiver
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Points
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Balance Change
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pokes.map((poke) => (
                    <tr key={poke._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {format(new Date(poke.timestamp), 'MMM dd, yyyy')}
                        </div>
                        <div className="text-xs text-gray-500">
                          {format(new Date(poke.timestamp), 'hh:mm a')}
                        </div>
                        <div className="text-xs text-gray-400">
                          {formatDistanceToNow(new Date(poke.timestamp), { addSuffix: true })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-bold text-sm">
                              {poke.sender?.username?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {poke.sender?.username}
                            </div>
                            <div className="text-xs text-gray-500">{poke.sender?.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-green-600 font-bold text-sm">
                              {poke.receiver?.username?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {poke.receiver?.username}
                            </div>
                            <div className="text-xs text-gray-500">{poke.receiver?.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-lg font-bold text-primary-600">
                          +{poke.points}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          <div>Sender: {poke.senderPointsBefore} → {poke.senderPointsAfter}</div>
                          <div>Receiver: {poke.receiverPointsBefore} → {poke.receiverPointsAfter}</div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t">
              <div className="text-sm text-gray-500">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} pokes
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => loadPokes(pagination.page - 1, searchTerm)}
                  disabled={pagination.page === 1}
                  className="px-3 py-1 border rounded text-sm disabled:opacity-50 flex items-center space-x-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>
                <button
                  onClick={() => loadPokes(pagination.page + 1, searchTerm)}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-3 py-1 border rounded text-sm disabled:opacity-50 flex items-center space-x-1"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Zap className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h4 className="font-medium text-blue-900 mb-2">Poke Transaction Summary</h4>
            <p className="text-blue-800 text-sm">
              Total of {stats.total.toLocaleString()} pokes have been exchanged between users,
              with {stats.today.toLocaleString()} pokes happening today alone.
              A total of {formatPoints(stats.totalPointsExchanged)} have been earned through poking.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
