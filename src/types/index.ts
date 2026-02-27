export interface User {
  _id: string;
  id?: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  points: number;
  pokesSent: number;
  pokesReceived: number;
  streak: number;
  loginStreak: number;
  rank: number;
  role?: 'user' | 'admin';
  isOnline?: boolean;
  isActive?: boolean;
  referralCode?: string;
  referralBonusEarned?: number;
  bankDetails?: {
    bankName: string;
    accountName: string;
    accountNumber: string;
    verified?: boolean;
  };
  totalEarned?: number;
  totalWithdrawn?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Poke {
  id: string;
  fromUserId: string;
  toUserId: string;
  pointsEarned: number;
  timestamp: string;
  fromUser?: User;
  toUser?: User;
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  avatar?: string;
  points: number;
  pokesSent: number;
  pokesReceived: number;
  rank: number;
  streak: number;
  loginStreak: number;
  isOnline?: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'poke' | 'reward' | 'milestone' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}
