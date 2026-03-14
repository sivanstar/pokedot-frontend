import React from 'react';
import { usePoke } from '../context/PokeContext';
import { useWallet } from '../context/WalletContext';

export const TestPage: React.FC = () => {
  const { user } = usePoke();
  const { balance } = useWallet();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Page</h1>
      <p>User: {user?.username || 'Not logged in'}</p>
      <p>Balance: {balance} points</p>
    </div>
  );
};
