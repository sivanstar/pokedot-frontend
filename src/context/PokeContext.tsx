import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { authApi } from '../api/auth';
import { pokeApi } from '../api/poke';

interface User {
  _id: string;
  username: string;
  email: string;
  points: number;
  pokesSent: number;
  pokesReceived: number;
  streak: number;
  loginStreak: number;
  rank: number;
  isOnline: boolean;
  avatar?: string;
  bio?: string;
  referralCode?: string;
  referralBonusEarned: number;
  totalEarned: number;
  totalWithdrawn: number;
  createdAt: string;
  updatedAt: string;
}

interface DailyLimits {
  remainingSends: number;
  remainingReceives: number;
  date: string;
}

interface PokeContextType {
  user: User | null;
  points: number;
  pokesSent: number;
  pokesReceived: number;
  streak: number;
  loginStreak: number;
  topUsers: User[];
  dailyLimits: DailyLimits;
  refreshData: () => Promise<void>;
  updateUserPoints: (points: number) => void;
  incrementPokesSent: () => void;
  updateUserProfile: (updates: { username?: string; email?: string; bio?: string }) => void;
  sendPoke: (userId: string, adTaskId?: string) => Promise<any>;
  getAvailableUsers: (search?: string) => Promise<any>;
  getDailyLimits: () => Promise<any>;
  syncUserFromBackend: () => Promise<void>;
}

const PokeContext = createContext<PokeContextType | undefined>(undefined);

export const usePoke = () => {
  const context = useContext(PokeContext);
  if (!context) {
    throw new Error('usePoke must be used within a PokeProvider');
  }
  return context;
};

interface PokeProviderProps {
  children: ReactNode;
}

export const PokeProvider: React.FC<PokeProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [topUsers, setTopUsers] = useState<User[]>([]);
  const [dailyLimits, setDailyLimits] = useState<DailyLimits>({
    remainingSends: 2,
    remainingReceives: 2,
    date: new Date().toISOString().split('T')[0]
  });

  const syncUserFromBackend = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await authApi.getProfile();
      if (response.success && response.user) {
        setUser(response.user);
        localStorage.setItem('user', JSON.stringify(response.user));
      }
    } catch (error) {
      console.error('Error syncing user:', error);
    }
  }, []);

  const loadUserData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await syncUserFromBackend();

      const leaderboardResponse = await pokeApi.getLeaderboard();
      if (leaderboardResponse.success) {
        setTopUsers(leaderboardResponse.users || []);
      }

      await getDailyLimits();
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  }, [syncUserFromBackend]);

  useEffect(() => {
    if (localStorage.getItem('token')) {
      loadUserData();
    }
    
    const syncInterval = setInterval(() => {
      if (localStorage.getItem('token')) {
        syncUserFromBackend();
      }
    }, 30000);
    
    return () => clearInterval(syncInterval);
  }, [loadUserData, syncUserFromBackend]);

  const refreshData = useCallback(async () => {
    await loadUserData();
  }, [loadUserData]);

  const updateUserPoints = useCallback((points: number) => {
    setUser(prev => prev ? { 
      ...prev, 
      points: prev.points + points,
      totalEarned: (prev.totalEarned || 0) + points
    } : null);
  }, []);

  const incrementPokesSent = useCallback(() => {
    setUser(prev => prev ? { ...prev, pokesSent: prev.pokesSent + 1 } : null);
  }, []);

  const updateUserProfile = useCallback((updates: { username?: string; email?: string; bio?: string }) => {
    setUser(prev => prev ? { ...prev, ...updates } : null);
  }, []);

  const sendPoke = useCallback(async (userId: string, adTaskId: string = 'demo-ad-task-id') => {
    try {
      const response = await pokeApi.sendPoke(userId, adTaskId);
      if (response.success) {
        await syncUserFromBackend();
        
        if (response.remainingSends !== undefined) {
          setDailyLimits(prev => ({
            ...prev,
            remainingSends: response.remainingSends
          }));
        } else {
          await getDailyLimits();
        }
      }
      return response;
    } catch (error) {
      console.error('Error sending poke:', error);
      throw error;
    }
  }, [syncUserFromBackend]);

  const getAvailableUsers = useCallback(async (search?: string) => {
    try {
      const response = await pokeApi.getAvailableUsers(search);
      return response;
    } catch (error) {
      console.error('Error getting available users:', error);
      throw error;
    }
  }, []);

  const getDailyLimits = useCallback(async () => {
    try {
      const response = await pokeApi.getDailyLimits();
      if (response.success) {
        setDailyLimits({
          remainingSends: response.limits.remainingSends,
          remainingReceives: response.limits.remainingReceives,
          date: response.limits.date
        });
      }
      return response;
    } catch (error) {
      console.error('Error getting daily limits:', error);
      throw error;
    }
  }, []);

  const value = {
    user,
    points: user?.points || 0,
    pokesSent: user?.pokesSent || 0,
    pokesReceived: user?.pokesReceived || 0,
    streak: user?.streak || 0,
    loginStreak: user?.loginStreak || 0,
    topUsers,
    dailyLimits,
    refreshData,
    updateUserPoints,
    incrementPokesSent,
    updateUserProfile,
    sendPoke,
    getAvailableUsers,
    getDailyLimits,
    syncUserFromBackend,
  };

  return (
    <PokeContext.Provider value={value}>
      {children}
    </PokeContext.Provider>
  );
};
