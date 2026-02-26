import api from './index';

export const pokeApi = {
  // Get available users to poke
  getAvailableUsers: async (search?: string, page = 1, limit = 20) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    const response = await api.get(`/users/available?${params}`);
    return response.data;
  },

  // Send poke to user
  sendPoke: async (userId: string, adTaskId: string = 'demo-ad-task-id') => {
    const response = await api.post(`/poke/users/${userId}/poke`, { adTaskId });
    return response.data;
  },

  // Get daily limits
  getDailyLimits: async () => {
    const response = await api.get('/users/daily-limits');
    return response.data;
  },

  // Get leaderboard
  getLeaderboard: async (page = 1, limit = 50) => {
    const response = await api.get(`/users/leaderboard?page=${page}&limit=${limit}`);
    return response.data;
  }
};
