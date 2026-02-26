import api from './index';

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalPokes: number;
  totalPoints: number;
  totalEarned: number;
  pendingWithdrawals: number;
  admins: number;
  averagePointsPerUser: number;
}

export interface AdminUser {
  _id: string;
  username: string;
  email: string;
  points: number;
  totalEarned: number;
  totalWithdrawn: number;
  pokesSent: number;
  pokesReceived: number;
  streak: number;
  loginStreak: number;
  rank: number;
  role: 'user' | 'admin';
  isOnline: boolean;
  isActive: boolean;
  referralCode: string;
  referralBonusEarned: number;
  bio: string;
  avatar: string;
  bankDetails?: {
    bankName: string;
    accountName: string;
    accountNumber: string;
    verified: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PokeTransaction {
  _id: string;
  sender: {
    _id: string;
    username: string;
    email: string;
  };
  receiver: {
    _id: string;
    username: string;
    email: string;
  };
  points: number;
  senderPointsBefore: number;
  senderPointsAfter: number;
  receiverPointsBefore: number;
  receiverPointsAfter: number;
  timestamp: string;
  createdAt: string;
}

export interface WalletDetails {
  balance: number;
  totalEarned: number;
  totalWithdrawn: number;
  bankDetails: {
    bankName: string;
    accountName: string;
    accountNumber: string;
    verified: boolean;
  } | null;
}

export interface Withdrawal {
  _id: string;
  user: {
    _id: string;
    username: string;
    email: string;
    bankDetails?: {
      bankName: string;
      accountName: string;
      accountNumber: string;
    };
  };
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'processing';
  reference: string;
  bankDetails: {
    bankName: string;
    accountName: string;
    accountNumber: string;
  };
  adminNotes: string;
  processedBy?: {
    _id: string;
    username: string;
  };
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: string;
  type: 'user' | 'withdrawal' | 'poke';
  username: string;
  email?: string;
  action: string;
  details: any;
  timestamp: string;
}

export interface WalletUpdateData {
  points?: number;
  totalEarned?: number;
  totalWithdrawn?: number;
  action?: 'add_points' | 'subtract_points' | 'set_points';
  amount?: number;
  reason?: string;
}

export const adminApi = {
  // Get admin dashboard statistics
  getStats: async (): Promise<{ success: boolean; stats: AdminStats }> => {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  // Get all users with pagination
  getUsers: async (
    page = 1,
    limit = 10,
    search = ''
  ): Promise<{
    success: boolean;
    users: AdminUser[];
    pagination: {
      page: number;
      limit: number;
      totalUsers: number;
      totalPages: number;
    };
  }> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    if (search) params.append('search', search);

    const response = await api.get(`/admin/users?${params}`);
    return response.data;
  },

  // Get single user details
  getUser: async (userId: string): Promise<{
    success: boolean;
    user: AdminUser;
    withdrawals: Withdrawal[];
    pokeTransactions: PokeTransaction[];
  }> => {
    const response = await api.get(`/admin/users/${userId}`);
    return response.data;
  },

  // Update user
  updateUser: async (
    userId: string,
    updates: Partial<{
      isActive: boolean;
      role: 'user' | 'admin';
      points: number;
      totalEarned: number;
      totalWithdrawn: number;
      username: string;
      email: string;
      bio: string;
      avatar: string;
      bankDetails: {
        bankName: string;
        accountName: string;
        accountNumber: string;
        verified: boolean;
      };
    }>
  ): Promise<{
    success: boolean;
    message: string;
    user: AdminUser;
  }> => {
    const response = await api.put(`/admin/users/${userId}`, updates);
    return response.data;
  },

  // Change user password
  changeUserPassword: async (
    userId: string,
    newPassword: string
  ): Promise<{
    success: boolean;
    message: string;
  }> => {
    const response = await api.put(`/admin/users/${userId}/password`, { newPassword });
    return response.data;
  },

  // Delete user (soft or permanent)
  deleteUser: async (
    userId: string,
    permanent: boolean = false
  ): Promise<{
    success: boolean;
    message: string;
  }> => {
    const response = await api.delete(`/admin/users/${userId}?permanent=${permanent}`);
    return response.data;
  },

  // Get user wallet details
  getUserWallet: async (
    userId: string
  ): Promise<{
    success: boolean;
    wallet: WalletDetails;
    recentWithdrawals: Withdrawal[];
  }> => {
    const response = await api.get(`/admin/users/${userId}/wallet`);
    return response.data;
  },

  // Update user wallet
  updateUserWallet: async (
    userId: string,
    data: WalletUpdateData
  ): Promise<{
    success: boolean;
    message: string;
    wallet: {
      balance: number;
      totalEarned: number;
      totalWithdrawn: number;
    };
  }> => {
    const response = await api.put(`/admin/users/${userId}/wallet`, data);
    return response.data;
  },

  // Get all withdrawals
  getWithdrawals: async (
    page = 1,
    limit = 10,
    status = ''
  ): Promise<{
    success: boolean;
    withdrawals: Withdrawal[];
    stats: Record<string, { count: number; totalAmount: number }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    if (status) params.append('status', status);

    const response = await api.get(`/admin/withdrawals?${params}`);
    return response.data;
  },

  // Update withdrawal status
  updateWithdrawal: async (
    withdrawalId: string,
    status: 'approved' | 'rejected' | 'processing',
    adminNotes?: string
  ): Promise<{
    success: boolean;
    message: string;
    withdrawal: Withdrawal;
  }> => {
    const response = await api.put(`/admin/withdrawals/${withdrawalId}`, {
      status,
      adminNotes
    });
    return response.data;
  },

  // NEW: Get all poke transactions
  getPokeTransactions: async (
    page = 1,
    limit = 20,
    search = ''
  ): Promise<{
    success: boolean;
    pokes: PokeTransaction[];
    stats: {
      total: number;
      today: number;
      totalPointsExchanged: number;
    };
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    if (search) params.append('search', search);

    const response = await api.get(`/admin/pokes?${params}`);
    return response.data;
  },

  // Get recent activities
  getActivities: async (limit = 20): Promise<{
    success: boolean;
    activities: Activity[];
  }> => {
    const response = await api.get(`/admin/activities?limit=${limit}`);
    return response.data;
  },

  // Create admin user
  createAdmin: async (): Promise<{
    success: boolean;
    message: string;
  }> => {
    const response = await api.post('/admin/create-admin');
    return response.data;
  },

  // Check if user is admin
  checkAdmin: async (): Promise<{ success: boolean; isAdmin: boolean }> => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user.role === 'admin') {
          return { success: true, isAdmin: true };
        }
      }

      await api.get('/admin/stats');
      return { success: true, isAdmin: true };
    } catch (error: any) {
      if (error.response?.status === 403) {
        return { success: false, isAdmin: false };
      }
      throw error;
    }
  }
};
