import React, { useState, useEffect } from 'react';
import { Eye, AlertCircle } from 'lucide-react';
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
  const [showAdModal, setShowAdModal] = useState(false);
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const [adCompleted, setAdCompleted] = useState(false);
  const [adWindow, setAdWindow] = useState<Window | null>(null);
  const { sendPoke, dailyLimits } = usePoke();

  // AD URL - Can be configured in .env
  const AD_URL = import.meta.env.VITE_AD_URL || 'https://otieu.com/4/10381267';

  // Clean up ad window on unmount
  useEffect(() => {
    return () => {
      if (adWindow && !adWindow.closed) {
        adWindow.close();
      }
    };
  }, [adWindow]);

  // Check if ad window is closed
  useEffect(() => {
    if (!adWindow || adWindow.closed) return;

    const checkClosed = setInterval(() => {
      if (adWindow.closed) {
        clearInterval(checkClosed);
        if (!adCompleted) {
          setIsWatchingAd(false);
          toast.error('Please complete the ad to poke');
        }
      }
    }, 1000);

    return () => clearInterval(checkClosed);
  }, [adWindow, adCompleted]);

  const openAdWindow = () => {
    if (!userId) {
      toast.error('Cannot poke: User ID is missing');
      return;
    }
    
    // Open ad in new window
    const window = window.open(AD_URL, '_blank', 'width=800,height=600');
    
    if (!window) {
      toast.error('Please allow popups to watch ads');
      return;
    }
    
    setAdWindow(window);
    setIsWatchingAd(true);
    
    // Simulate 5 second ad watching
    setTimeout(() => {
      setIsWatchingAd(false);
      setAdCompleted(true);
      toast.success('Ad completed! You can now poke.', { duration: 2000 });
    }, 5000);
  };

  const handlePokeClick = () => {
    if (dailyLimits.remainingSends <= 0) {
      toast.error('Daily limit reached! You can only poke 2 users per day.');
      return;
    }
    setShowAdModal(true);
  };

  const handleAdComplete = async () => {
    setShowAdModal(false);
    setAdCompleted(false);
    
    if (dailyLimits.remainingSends <= 0) {
      toast.error('Daily limit reached! You can only poke 2 users per day.');
      return;
    }
    
    setIsPoking(true);
    
    try {
      const adTaskId = `ad_${Date.now()}`;
      const response = await sendPoke(userId, adTaskId);
      
      if (response?.success) {
        toast.success(`Poked ${username}! +50 points earned`);
        if (onPokeSuccess) onPokeSuccess(50);
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

  const handleSkipAd = () => {
    setShowAdModal(false);
    setAdCompleted(false);
    if (adWindow && !adWindow.closed) {
      adWindow.close();
    }
  };

  return (
    <>
      <button
        onClick={handlePokeClick}
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
          `Poke ${username} for 50 points (${dailyLimits.remainingSends} left)`
        )}
      </button>

      {/* Ad Modal */}
      {showAdModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Watch Ad to Poke</h3>
            
            <div className="bg-blue-50 rounded-xl p-6 text-center mb-4">
              <Eye className="w-12 h-12 text-blue-500 mx-auto mb-3" />
              <p className="text-gray-700 mb-4">
                Watch a short ad to poke {username} and earn 50 points!
              </p>
              
              {isWatchingAd ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-3"></div>
                  <p className="text-gray-600">Watching ad... Please wait.</p>
                </div>
              ) : adCompleted ? (
                <button
                  onClick={handleAdComplete}
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700"
                >
                  Complete Poke Now
                </button>
              ) : (
                <button
                  onClick={openAdWindow}
                  className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700"
                >
                  Watch Ad
                </button>
              )}
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSkipAd}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
