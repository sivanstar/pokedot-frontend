// Mock data for development
const mockUsers = [
  { id: '1', username: 'PokeMaster', email: 'poke@example.com', points: 12500, pokesSent: 450, pokesReceived: 320, streak: 14, rank: 1, createdAt: '2024-01-01', updatedAt: '2024-01-20', isOnline: true },
  { id: '2', username: 'ZapZap', email: 'zap@example.com', points: 9800, pokesSent: 320, pokesReceived: 280, streak: 7, rank: 2, createdAt: '2024-01-05', updatedAt: '2024-01-20', isOnline: true },
  { id: '3', username: 'Sparky', email: 'spark@example.com', points: 7600, pokesSent: 280, pokesReceived: 240, streak: 21, rank: 3, createdAt: '2024-01-10', updatedAt: '2024-01-20', isOnline: false },
  { id: '4', username: 'Thunder', email: 'thunder@example.com', points: 5400, pokesSent: 210, pokesReceived: 180, streak: 3, rank: 4, createdAt: '2024-01-12', updatedAt: '2024-01-20', isOnline: true },
  { id: '5', username: 'Volt', email: 'volt@example.com', points: 4300, pokesSent: 180, pokesReceived: 150, streak: 5, rank: 5, createdAt: '2024-01-15', updatedAt: '2024-01-20', isOnline: true },
];

export const userApi = {
  getProfile: async () => {
    return { data: mockUsers[0] };
  },
  
  sendPoke: async (userId: string) => {
    return { 
      data: { 
        id: 'new-poke',
        fromUserId: '1',
        toUserId: userId,
        pointsEarned: 10,
        timestamp: new Date().toISOString()
      }
    };
  },
  
  getLeaderboard: async () => {
    const entries = mockUsers.map(user => ({
      userId: user.id,
      username: user.username,
      points: user.points,
      pokesSent: user.pokesSent,
      pokesReceived: user.pokesReceived,
      rank: user.rank,
      streak: user.streak,
      isOnline: user.isOnline,
    }));
    
    return {
      data: { 
        entries,
        total: entries.length,
        userRank: 1,
        userEntry: entries[0],
      }
    };
  },
  
  getAvailableUsers: async (search?: string) => {
    let filteredUsers = mockUsers;
    
    if (search) {
      filteredUsers = mockUsers.filter(user => 
        user.username.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    return {
      data: { 
        users: filteredUsers,
        total: filteredUsers.length,
      }
    };
  },
};
