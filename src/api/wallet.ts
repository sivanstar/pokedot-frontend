import api from './index';

export const walletApi = {
  // Get wallet balance
  getBalance: async () => {
    try {
      const response = await api.get('/wallet/balance');
      return response.data;
    } catch (error) {
      console.error('Error fetching balance:', error);
      throw error;
    }
  },

  // Request withdrawal
  requestWithdrawal: async (amount: number) => {
    try {
      const response = await api.post('/wallet/withdraw', { amount });
      return response.data;
    } catch (error) {
      console.error('Error requesting withdrawal:', error);
      throw error;
    }
  },

  // Update bank details - PER USER (stored in database)
  updateBankDetails: async (bankDetails: {
    bankName: string;
    accountName: string;
    accountNumber: string;
  }) => {
    try {
      console.log('Sending bank details to backend:', bankDetails);
      
      // Make sure we're sending to the correct endpoint
      const response = await api.put('/wallet/bank-details', bankDetails);
      
      console.log('Bank details update response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error updating bank details:', error);
      console.error('Error response:', error.response?.data);
      
      // Re-throw with better error message
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw error;
      } else {
        throw new Error('Failed to update bank details');
      }
    }
  },

  // Get transaction history
  getTransactions: async (page = 1, limit = 20) => {
    try {
      const response = await api.get(`/wallet/transactions?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  },

  // Get withdrawal history
  getWithdrawals: async (page = 1, limit = 20, status = '') => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      if (status) params.append('status', status);
      
      const response = await api.get(`/wallet/withdrawals?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
      throw error;
    }
  }
};
