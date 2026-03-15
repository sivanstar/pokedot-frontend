import React, { useState } from 'react';
import { Zap, Lock } from 'lucide-react';
import { usePoke } from '../../context/PokeContext';
import toast from 'react-hot-toast';

interface PokeButtonProps {
  userId: string;
  username: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'ghost';
  onPokeSuccess?: (pointsEarned: number) => void;
  onPokeError?: (error: any) => void;
}

export const PokeButton: React.FC<PokeButtonProps> = ({
  userId,
  username,
  size = 'md',
  variant = 'primary',
  onPokeSuccess,
  onPokeError,
}) => {
  const [isPoking, setIsPoking] = useState(false);
  const { sendPoke, dailyLimits, getDailyLimits } = usePoke();

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
    if (isPoking || dailyLimits.remainingSends <= 0 || !userId) {
      console.log('Cannot poke:', { isPoking, remainingSends: dailyLimits.remainingSends, userId });
      return;
    }
    
    console.log('Starting poke to:', username, 'with ID:', userId);
    setIsPoking(true);
    
    try {
      const adTaskId = `ad_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      console.log('Sending poke with task ID:', adTaskId);
      
      const response = await sendPoke(userId, adTaskId);
      console.log('Poke response:', response);
      
      if (response.success) {
        toast.success(`Poked ${username}! +50 points earned`, { icon: '⚡' });
        await getDailyLimits();
        if (onPokeSuccess) onPokeSuccess(50);
      }
    } catch (error: any) {
      console.error('Poke error:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to send poke';
      toast.error(errorMsg);
      if (onPokeError) onPokeError(error);
    } finally {
      setIsPoking(false);
    }
  };

  const getButtonText = () => {
    if (dailyLimits.remainingSends <= 0) return 'Daily Limit Reached';
    return `Poke for 50 points!`;
  };

  const getButtonIcon = () => {
    if (dailyLimits.remainingSends <= 0) return <Lock className="w-4 h-4" />;
    return <Zap className="w-4 h-4" />;
  };

  const isButtonDisabled = isPoking || dailyLimits.remainingSends <= 0 || !userId;

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
          {getButtonIcon()}
          <span>{getButtonText()}</span>
          {dailyLimits.remainingSends > 0 && (
            <span className="text-xs opacity-80">({dailyLimits.remainingSends} left)</span>
          )}
        </>
      )}
    </button>
  );
};
