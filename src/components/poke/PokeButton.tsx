import React, { useState } from 'react';
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
  onPokeSuccess,
  onPokeError,
}) => {
  const [isPoking, setIsPoking] = useState(false);
  const { sendPoke, dailyLimits } = usePoke();

  const handleClick = async () => {
    if (isPoking || !userId) return;
    
    // Check daily limit
    if (dailyLimits.remainingSends <= 0) {
      toast.error('Daily limit reached! You can only poke 2 users per day.');
      return;
    }

    setIsPoking(true);
    
    try {
      // Generate a unique ad task ID
      const adTaskId = `ad_${Date.now()}`;
      
      // Call the API
      const response = await sendPoke(userId, adTaskId);
      
      if (response?.success) {
        toast.success(`Poked ${username}! +50 points earned`);
        if (onPokeSuccess) onPokeSuccess(50);
      } else {
        throw new Error(response?.message || 'Failed to poke');
      }
    } catch (error: any) {
      console.error('Poke error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to send poke';
      toast.error(errorMessage);
      if (onPokeError) onPokeError(error);
    } finally {
      setIsPoking(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPoking || dailyLimits.remainingSends <= 0}
      className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 text-white py-3 px-4 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isPoking ? (
        <span className="flex items-center justify-center">
          <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Poking...
        </span>
      ) : (
        `Poke ${username} for 50 points`
      )}
    </button>
  );
};
