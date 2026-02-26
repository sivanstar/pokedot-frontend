import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { walletApi } from '../api/wallet';

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  timestamp: string;
  status: string;
}

interface WalletContextType {
  balance: number;
  totalEarned: number;
  totalWithdrawn: number;
  transactions: Transaction[];
  bankDetails: any;
  withdrawalInfo: any;
  refreshBalance: () => Promise<void>;
  requestWithdrawal: (amount: number) => Promise<any>;
  updateBankDetails: (details: any) => Promise<any>;
  addTransaction: (transaction: Transaction) => void;
  canWithdrawToday: () => boolean;
  syncWalletFromBackend: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [balance, setBalance] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [totalWithdrawn, setTotalWithdrawn] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [bankDetails, setBankDetails] = useState<any>(null);
  const [withdrawalInfo, setWithdrawalInfo] = useState<any>(null);

  const syncWalletFromBackend = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await walletApi.getBalance();
      if (response.success) {
        setBalance(response.balance);
        setTotalEarned(response.totalEarned || 0);
        setTotalWithdrawn(response.totalWithdrawn || 0);
        setBankDetails(response.bankDetails);
        setWithdrawalInfo(response.withdrawalInfo);
      }
    } catch (error) {
      console.error('Error syncing wallet:', error);
    }
  };

  const loadWalletData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await syncWalletFromBackend();
    } catch (error) {
      console.error('Error loading wallet:', error);
    }
  };

  useEffect(() => {
    loadWalletData();
    
    // Set up periodic sync every 30 seconds
    const syncInterval = setInterval(() => {
      if (localStorage.getItem('token')) {
        syncWalletFromBackend();
      }
    }, 30000);
    
    return () => clearInterval(syncInterval);
  }, []);

  const refreshBalance = async () => {
    await syncWalletFromBackend();
  };

  const requestWithdrawal = async (amount: number) => {
    try {
      const response = await walletApi.requestWithdrawal(amount);
      if (response.success) {
        await syncWalletFromBackend();
        
        const transaction: Transaction = {
          id: `tx-${Date.now()}`,
          type: 'withdrawal',
          amount: -amount,
          description: `Withdrawal request: ${response.reference || 'N/A'}`,
          timestamp: new Date().toISOString(),
          status: 'pending'
        };
        addTransaction(transaction);
      }
      return response;
    } catch (error) {
      console.error('Error requesting withdrawal:', error);
      throw error;
    }
  };

  const updateBankDetails = async (details: any) => {
    try {
      const response = await walletApi.updateBankDetails(details);
      if (response.success) {
        setBankDetails(response.bankDetails);
      }
      return response;
    } catch (error) {
      console.error('Error updating bank details:', error);
      throw error;
    }
  };

  const addTransaction = (transaction: Transaction) => {
    setTransactions(prev => [transaction, ...prev.slice(0, 9)]);
  };

  const canWithdrawToday = (): boolean => {
    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours();
    
    const isWithdrawalDay = day === 1 || day === 3 || day === 5;
    const isWithdrawalTime = hour >= 16 && hour < 17;
    
    return isWithdrawalDay && isWithdrawalTime;
  };

  return (
    <WalletContext.Provider
      value={{
        balance,
        totalEarned,
        totalWithdrawn,
        transactions,
        bankDetails,
        withdrawalInfo,
        refreshBalance,
        requestWithdrawal,
        updateBankDetails,
        addTransaction,
        canWithdrawToday,
        syncWalletFromBackend,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
