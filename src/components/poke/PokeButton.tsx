import React, { useState, useEffect } from 'react';
import { Zap, Clock, Check, Eye, AlertCircle, Lock } from 'lucide-react';
import { useNotifications } from '../../context/NotificationsContext';
import { useWallet } from '../../context/WalletContext';
import { usePoke } from '../../context/PokeContext';
import { pokeApi } from '../../api/poke';
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
  const [showAdModal, setShowAdModal] = useState(false);
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const [adCompleted, setAdCompleted] = useState(false);
  const [adWindow, setAdWindow] = useState<Window | null>(null);
  const { addNotification } = useNotifications();
  const { addTransaction, syncWalletFromBackend } = useWallet();
  const { sendPoke, dailyLimits, getDailyLimits, syncUserFromBackend } = usePoke();

  // AD URL - Can be configured in .env
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

  const handlePoke = async () => {
    if (isPoking || dailyLimits.remainingSends <= 0) return;
    
    if (!userId) {
      toast.error('Cannot poke: User ID is missing');
      return;
    }
    
    // Show ad modal first
    setShowAdModal(true);
  };

  const handleAdComplete = async () => {
    setShowAdModal(false);
    setAdCompleted(false);
    
    if (!userId) {
      toast.error('Cannot poke: User ID is missing');
      return;
    }
    
    if (dailyLimits.remainingSends <= 0) {
      toast.error(`Daily limit reached! You can only poke 2 users per day.`);
      return;
    }
    
    setIsPoking(true);
    
    try {
      const adTaskId = `ad_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const response = await sendPoke(userId, adTaskId);
      
      if (response.success) {
        if (syncWalletFromBackend) await syncWalletFromBackend();
        if (syncUserFromBackend) await syncUserFromBackend();
        
        toast.success(`Poked ${username}! +50 points earned`, {
          icon: '⚡',
          duration: 3000,
        });
        
        addNotification({
          userId: '1',
          type: 'poke',
          title: 'Poke Successful!',
          message: `You poked ${username} and earned 50 points!`
        });
        
        addTransaction({
          id: `tx_${Date.now()}`,
          type: 'poke',
          amount: 50,
          description: `Poked ${username}`,
          timestamp: new Date().toISOString(),
          status: 'completed'
        });
        
        await getDailyLimits();
        
        if (onPokeSuccess) onPokeSuccess(50);
      }
    } catch (error: any) {
      console.error('Poke error:', error);
      
      if (error.response?.data?.message) {
        const errorMsg = error.response.data.message;
        toast.error(errorMsg, { duration: 4000 });
        if (errorMsg.includes('Daily send limit reached')) await getDailyLimits();
      } else {
        toast.error('Failed to send poke. Please try again.', { duration: 4000 });
      }
      
      if (onPokeError) onPokeError(error);
      
      addNotification({
        userId: '1',
        type: 'system',
        title: 'Poke Failed',
        message: error.response?.data?.message || 'Could not poke user'
      });
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
    toast.info('You must watch an ad to poke and earn points');
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
    <>
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
                <span>Daily limit: 2 pokes • Remaining: {dailyLimits.remainingSends}</span>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-yellow-800">
                  <span className="font-semibold">Note:</span> The ad will open in a new window. 
                  Please complete it to continue.
                </p>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={handleSkipAd}
                  className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={openAdWindow}
                  disabled={isWatchingAd}
                  className="flex-1 btn-primary py-3 flex items-center justify-center space-x-2"
                >
                  {isWatchingAd ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Watching Ad...</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-5 h-5" />
                      <span>Watch Ad</span>
                    </>
                  )}
                </button>
              </div>
              
              {adCompleted && (
                <div className="mt-4">
                  <button
                    onClick={handleAdComplete}
                    className="w-full btn-primary py-3 flex items-center justify-center space-x-2"
                  >
                    <Zap className="w-5 h-5" />
                    <span>Complete Poke Now</span>
                  </button>
                </div>
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
