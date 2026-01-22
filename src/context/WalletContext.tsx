import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useNotifications } from './NotificationsContext';

interface Transaction {
  id: string;
  type: 'poke' | 'reward' | 'withdrawal' | 'bonus' | 'signup' | 'referral';
  amount: number;
  description: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
}

interface WalletContextType {
  balance: number;
  totalEarned: number;
  transactions: Transaction[];
  addTransaction: (type: Transaction['type'], amount: number, description: string) => void;
  withdrawPoints: (amount: number) => Promise<boolean>;
  addSignupBonus: () => void;
  addReferralBonus: (referrerId: string, referredUsername: string) => void;
  refreshWallet: () => void;
  canWithdrawToday: () => boolean;
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
  const { addNotification } = useNotifications();
  
  // Load initial data from localStorage or use defaults
  const getInitialBalance = () => {
    const saved = localStorage.getItem('wallet');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.balance || 12500;
      } catch {
        return 12500;
      }
    }
    return 12500;
  };

  const getInitialTotalEarned = () => {
    const saved = localStorage.getItem('wallet');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.totalEarned || 15600;
      } catch {
        return 15600;
      }
    }
    return 15600;
  };

  const [balance, setBalance] = useState(getInitialBalance);
  const [totalEarned, setTotalEarned] = useState(getInitialTotalEarned);
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: '1',
      type: 'poke',
      amount: 50,
      description: 'Poked ZapZap',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      status: 'completed'
    },
    {
      id: '2',
      amount: 50,
      type: 'reward',
      description: 'Daily login bonus',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      status: 'completed'
    },
    {
      id: '3',
      amount: 100,
      type: 'bonus',
      description: 'Weekly streak bonus',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      status: 'completed'
    },
    {
      id: '4',
      amount: -5000,
      type: 'withdrawal',
      description: 'Withdrawal request',
      timestamp: new Date(Date.now() - 172800000).toISOString(),
      status: 'pending'
    },
    {
      id: '5',
      amount: 500,
      type: 'signup',
      description: 'Welcome bonus',
      timestamp: new Date(Date.now() - 259200000).toISOString(),
      status: 'completed'
    }
  ]);

  // Check withdrawal days and times (Mon, Wed, Fri, 4pm-5pm)
  const canWithdrawToday = (): boolean => {
    const now = new Date();
    const day = now.getDay(); // 0 = Sunday, 1 = Monday, 2 = Tuesday, etc.
    const hour = now.getHours();
    
    // Check if it's Monday (1), Wednesday (3), or Friday (5)
    const isWithdrawalDay = day === 1 || day === 3 || day === 5;
    
    // Check if it's between 4 PM (16) and 5 PM (17)
    const isWithdrawalTime = hour >= 16 && hour < 17;
    
    return isWithdrawalDay && isWithdrawalTime;
  };

  // Save to localStorage when balance changes
  useEffect(() => {
    localStorage.setItem('wallet', JSON.stringify({
      balance,
      totalEarned,
      lastUpdated: new Date().toISOString()
    }));
  }, [balance, totalEarned]);

  const addTransaction = (type: Transaction['type'], amount: number, description: string) => {
    const newTransaction: Transaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      amount,
      description,
      timestamp: new Date().toISOString(),
      status: type === 'withdrawal' ? 'pending' : 'completed'
    };

    setTransactions(prev => [newTransaction, ...prev]);
    
    // Update balance
    setBalance(prev => prev + amount);
    if (amount > 0) {
      setTotalEarned(prev => prev + amount);
    }

    // Add notification for significant transactions
    if (amount >= 50) {
      addNotification({
        userId: '1',
        type: 'reward',
        title: 'Points Earned!',
        message: `You earned ${amount} points: ${description}`
      });
    }
  };

  const addSignupBonus = () => {
    addTransaction('signup', 500, 'Welcome signup bonus');
    addNotification({
      userId: '1',
      type: 'milestone',
      title: 'Welcome Bonus!',
      message: 'You received 500 points as a welcome bonus!'
    });
  };

  const addReferralBonus = (referrerId: string, referredUsername: string) => {
    addTransaction('referral', 300, `Referral bonus for ${referredUsername}`);
    addNotification({
      userId: '1',
      type: 'milestone',
      title: 'Referral Bonus!',
      message: `You earned ₦300 for referring ${referredUsername}!`
    });
  };

  const withdrawPoints = async (amount: number): Promise<boolean> => {
    // Check minimum withdrawal (2,000 points) - CHANGED from 10,000
    if (amount < 2000) {
      addNotification({
        userId: '1',
        type: 'system',
        title: 'Withdrawal Failed',
        message: 'Minimum withdrawal is 2,000 points'
      });
      return false;
    }

    if (amount > balance) {
      addNotification({
        userId: '1',
        type: 'system',
        title: 'Withdrawal Failed',
        message: 'Insufficient balance for withdrawal'
      });
      return false;
    }

    // Check withdrawal days and times
    if (!canWithdrawToday()) {
      addNotification({
        userId: '1',
        type: 'system',
        title: 'Withdrawal Failed',
        message: 'Withdrawals only allowed Mon, Wed, Fri, 4pm-5pm'
      });
      return false;
    }

    // Check if user has account details
    const accountDetails = localStorage.getItem('accountDetails');
    if (!accountDetails) {
      addNotification({
        userId: '1',
        type: 'system',
        title: 'Withdrawal Failed',
        message: 'Please set your account details in Profile first'
      });
      return false;
    }

    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        addTransaction('withdrawal', -amount, 'Withdrawal request');
        addNotification({
          userId: '1',
          type: 'system',
          title: 'Withdrawal Initiated',
          message: `${amount.toLocaleString()} points withdrawal request submitted`
        });
        resolve(true);
      }, 1500);
    });
  };

  const refreshWallet = () => {
    console.log('Refreshing wallet data...');
    // In real app, this would fetch from API
  };

  return (
    <WalletContext.Provider
      value={{
        balance,
        totalEarned,
        transactions,
        addTransaction,
        withdrawPoints,
        addSignupBonus,
        addReferralBonus,
        refreshWallet,
        canWithdrawToday
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
