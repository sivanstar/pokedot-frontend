import React, { useState } from 'react';
import { Zap, Lock, Eye, AlertCircle } from 'lucide-react';
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
  const [showAdModal, setShowAdModal] = useState(false);
  const [adCompleted, setAdCompleted] = useState(false);
  const [remainingSends, setRemainingSends] = useState(2);

  const AD_URL = import.meta.env.VITE_AD_URL || 'https://otieu.com/4/10381267';

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

  const handlePokeClick = () => {
    if (isPoking || remainingSends <= 0) return;
    setShowAdModal(true);
  };

  const handleAdWatch = () => {
    window.open(AD_URL, '_blank', 'width=800,height=600');
    
    // Simulate ad completion after 5 seconds
    setTimeout(() => {
      setAdCompleted(true);
      toast.success('Ad completed! You can now poke.', { duration: 2000 });
    }, 5000);
  };

  const handleCompletePoke = async () => {
    setShowAdModal(false);
    setAdCompleted(false);
    setIsPoking(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await api.post(`/poke/users/${userId}/poke`, {
        adTaskId: `ad_${Date.now()}`
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        toast.success(`Poked ${username}! +50 points earned`, { 
          icon: '⚡',
          duration: 3000
        });
        setRemainingSends(prev => prev - 1);
        if (onPokeSuccess) onPokeSuccess(50);
        
        // Refresh the page to update user list after successful poke
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch (error: any) {
      console.error('Poke error:', error);
      const errorMsg = error.response?.data?.message || 'Failed to send poke';
      toast.error(errorMsg, { duration: 4000 });
      if (onPokeError) onPokeError(error);
    } finally {
      setIsPoking(false);
    }
  };

  const handleSkipAd = () => {
    setShowAdModal(false);
    setAdCompleted(false);
    toast.info('You must watch an ad to poke and earn points');
  };

  const isButtonDisabled = isPoking || remainingSends <= 0;

  return (
    <>
      <button
        onClick={handlePokeClick}
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
            <span>Poke</span>
            {remainingSends > 0 && remainingSends <= 2 && (
              <span className="text-xs opacity-80">({remainingSends})</span>
            )}
          </>
        )}
      </button>

      {/* Ad Modal */}
      {showAdModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">Complete Ad to Poke</h3>
              <button
                onClick={handleSkipAd}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 text-center mb-6">
              <Eye className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Watch Ad to Earn Points</h4>
              <p className="text-gray-600 mb-4">
                Complete the ad to poke {username} and earn 50 points.
                This helps support the platform.
              </p>
              
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 mb-4">
                <AlertCircle className="w-4 h-4" />
                <span>Daily limit: 2 pokes • Remaining: {remainingSends}</span>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-yellow-800">
                  <span className="font-semibold">Note:</span> The ad will open in a new window. 
                  Please complete it to continue.
                </p>
              </div>
              
              {!adCompleted ? (
                <button
                  onClick={handleAdWatch}
                  className="w-full btn-primary py-3 flex items-center justify-center space-x-2"
                >
                  <Eye className="w-5 h-5" />
                  <span>Watch Ad</span>
                </button>
              ) : (
                <button
                  onClick={handleCompletePoke}
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 flex items-center justify-center space-x-2"
                >
                  <Zap className="w-5 h-5" />
                  <span>Complete Poke Now</span>
                </button>
              )}
            </div>
            
            <div className="text-center text-sm text-gray-500">
              <p>Ad revenue helps keep POKEDOT free for everyone!</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
