import React from 'react';
import { DollarSign, TrendingUp, ArrowUpRight } from 'lucide-react';
import { useWallet } from '../../context/WalletContext';
import { Link } from 'react-router-dom';

export const WalletBalance: React.FC = () => {
  const { balance } = useWallet();

  return (
    <Link to="/wallet" className="block">
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Wallet Balance</h3>
              <p className="text-sm opacity-90">Available points</p>
            </div>
          </div>
          <ArrowUpRight className="w-5 h-5 opacity-70" />
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-3xl font-bold">{balance.toLocaleString()}</span>
          <span className="opacity-90">points</span>
        </div>
        <div className="mt-4 flex items-center space-x-2 text-sm">
          <TrendingUp className="w-4 h-4" />
          <span>≈ ${(balance * 0.01).toFixed(2)} USD</span>
        </div>
      </div>
    </Link>
  );
};
