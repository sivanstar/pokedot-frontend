import React, { useState } from 'react';
import { Zap, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/index';

interface SimplePokeButtonProps {
  userId: string;
  username: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'ghost';
  onPokeSuccess?: (pointsEarned: number) => void;
  onPokeError?: (error: any) => void;
}

export const SimplePokeButton: React.FC<SimplePokeButtonProps> = ({
  userId,
  username,
  size = 'md',
  variant = 'primary',
  onPokeSuccess,
  onPokeError,
}) => {
  const [isPoking, setIsPoking] = useState(false);
  const [remainingSends, setRemainingSends] = useState(2);

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const variants = {
    primary: 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white hover:opacity-90',
    secondary: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
    ghost: 'bg-transparent text-primary-600 hover:bg-primary-50',
  };

  const handlePoke = async () => {
    if (isPoking || remainingSends <= 0) return;
    
    setIsPoking(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await api.post(`/poke/users/${userId}/poke`, {
        adTaskId: `ad_${Date.now()}`
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        toast.success(`Poked ${username}! +50 points earned`, { icon: '⚡' });
        setRemainingSends(prev => prev - 1);
        if (onPokeSuccess) onPokeSuccess(50);
      }
    } catch (error: any) {
      console.error('Poke error:', error);
      toast.error(error.response?.data?.message || 'Failed to send poke');
      if (onPokeError) onPokeError(error);
    } finally {
      setIsPoking(false);
    }
  };

  const isButtonDisabled = isPoking || remainingSends <= 0;

  return (
    <button
      onClick={handlePoke}
      disabled={isButtonDisabled}
      className={`${sizes[size]} ${variants[variant]} rounded-lg font-semibold flex items-center justify-center space-x-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 w-full`}
    >
      {isPoking ? (
        <>
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span>Poking...</span>
        </>
      ) : (
        <>
          {remainingSends <= 0 ? <Lock className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
          <span>{remainingSends <= 0 ? 'Daily Limit Reached' : 'Poke for 50 points!'}</span>
        </>
      )}
    </button>
  );
};
