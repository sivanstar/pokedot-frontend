import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface User {
  id: string;
  username: string;
  email: string;
  points: number;
  pokesSent: number;
  pokesReceived: number;
  streak: number;
  rank: number;
  isOnline: boolean;
}

interface Poke {
  id: string;
  fromUser: User;
  toUser: User;
  pointsEarned: number;
  timestamp: string;
}

interface PokeContextType {
  user: User | null;
  points: number;
  pokesSent: number;
  pokesReceived: number;
  streak: number;
  recentPokes: Poke[];
  topUsers: User[];
  refreshData: () => void;
  updateUserPoints: (points: number) => void;
  incrementPokesSent: () => void;
  incrementPokesReceived: () => void;
  updateUserProfile: (updates: { username?: string; email?: string }) => void;
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
  const defaultUser: User = {
    id: '1',
    username: 'PokeMaster',
    email: 'poke@example.com',
    points: 12500,
    pokesSent: 450,
    pokesReceived: 320,
    streak: 14,
    rank: 1,
    isOnline: true,
  };

  const [user, setUser] = useState<User>(defaultUser);

  const [recentPokes, setRecentPokes] = useState<Poke[]>([
    {
      id: '1',
      fromUser: { 
        id: '2', 
        username: 'ZapZap', 
        points: 9800, 
        pokesSent: 320, 
        pokesReceived: 280, 
        streak: 7, 
        rank: 2, 
        isOnline: true, 
        email: 'zap@example.com' 
      },
      toUser: defaultUser,
      pointsEarned: 50,
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    },
    {
      id: '2',
      fromUser: { 
        id: '3', 
        username: 'Sparky', 
        points: 7600, 
        pokesSent: 280, 
        pokesReceived: 240, 
        streak: 21, 
        rank: 3, 
        isOnline: false, 
        email: 'spark@example.com' 
      },
      toUser: defaultUser,
      pointsEarned: 50,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    },
  ]);

  // Initialize topUsers with the default user
  const [topUsers, setTopUsers] = useState<User[]>([
    defaultUser,
    { 
      id: '2', 
      username: 'ZapZap', 
      points: 9800, 
      pokesSent: 320, 
      pokesReceived: 280, 
      streak: 7, 
      rank: 2, 
      isOnline: true, 
      email: 'zap@example.com' 
    },
    { 
      id: '3', 
      username: 'Sparky', 
      points: 7600, 
      pokesSent: 280, 
      pokesReceived: 240, 
      streak: 21, 
      rank: 3, 
      isOnline: false, 
      email: 'spark@example.com' 
    },
    { 
      id: '4', 
      username: 'Thunder', 
      points: 5400, 
      pokesSent: 210, 
      pokesReceived: 180, 
      streak: 3, 
      rank: 4, 
      isOnline: true, 
      email: 'thunder@example.com' 
    },
  ]);

  const updateUserPoints = (points: number) => {
    setUser(prev => {
      const updatedUser = {
        ...prev,
        points: prev.points + points
      };
      
      // Update topUsers to keep data consistent
      setTopUsers(prevTopUsers => 
        prevTopUsers.map(u => 
          u.id === updatedUser.id ? updatedUser : u
        )
      );
      
      return updatedUser;
    });
  };

  const incrementPokesSent = () => {
    setUser(prev => {
      const updatedUser = {
        ...prev,
        pokesSent: prev.pokesSent + 1
      };
      
      // Update topUsers to keep data consistent
      setTopUsers(prevTopUsers => 
        prevTopUsers.map(u => 
          u.id === updatedUser.id ? updatedUser : u
        )
      );
      
      return updatedUser;
    });
  };

  const incrementPokesReceived = () => {
    setUser(prev => {
      const updatedUser = {
        ...prev,
        pokesReceived: prev.pokesReceived + 1
      };
      
      // Update topUsers to keep data consistent
      setTopUsers(prevTopUsers => 
        prevTopUsers.map(u => 
          u.id === updatedUser.id ? updatedUser : u
        )
      );
      
      return updatedUser;
    });
  };

  const updateUserProfile = (updates: { username?: string; email?: string }) => {
    setUser(prev => {
      const updatedUser = {
        ...prev,
        ...updates
      };
      
      // Update topUsers to keep data consistent
      setTopUsers(prevTopUsers => 
        prevTopUsers.map(u => 
          u.id === updatedUser.id ? updatedUser : u
        )
      );
      
      return updatedUser;
    });
  };

  const refreshData = () => {
    console.log('Refreshing data...');
    // In real app, this would fetch fresh data from API
  };

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        
        // Also update topUsers to keep data consistent
        setTopUsers(prev => 
          prev.map(u => 
            u.id === parsedUser.id ? parsedUser : u
          )
        );
      } catch (error) {
        console.error('Error parsing saved user:', error);
      }
    }
  }, []);

  // Save user to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('user', JSON.stringify(user));
  }, [user]);

  // Update recentPokes when user changes
  useEffect(() => {
    setRecentPokes(prev => 
      prev.map(poke => ({
        ...poke,
        toUser: poke.toUser.id === user.id ? user : poke.toUser
      }))
    );
  }, [user]);

  return (
    <PokeContext.Provider
      value={{
        user,
        points: user.points,
        pokesSent: user.pokesSent,
        pokesReceived: user.pokesReceived,
        streak: user.streak,
        recentPokes,
        topUsers,
        refreshData,
        updateUserPoints,
        incrementPokesSent,
        incrementPokesReceived,
        updateUserProfile,
      }}
    >
      {children}
    </PokeContext.Provider>
  );
};
