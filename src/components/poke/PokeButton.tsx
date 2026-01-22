import React, { useState, useEffect } from 'react';
import { Zap, Clock, Check, Eye, AlertCircle, Users, Lock } from 'lucide-react';
import { useNotifications } from '../../context/NotificationsContext';
import { useWallet } from '../../context/WalletContext';
import { usePoke } from '../../context/PokeContext';
import toast from 'react-hot-toast';
import { getDailyPokes, incrementPokesSent, getRemainingPokes, incrementPokesReceived } from '../../utils/dailyPokes';

interface PokeButtonProps {
  userId: string;
  username: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'ghost';
  onPokeSuccess?: (pointsEarned: number) => void;
}

export const PokeButton: React.FC<PokeButtonProps> = ({
  userId,
  username,
  size = 'md',
  variant = 'primary',
  onPokeSuccess,
}) => {
  const [isPoking, setIsPoking] = useState(false);
  const [cooldown, setCooldown] = useState<number | null>(null);
  const [showAdModal, setShowAdModal] = useState(false);
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const [adCompleted, setAdCompleted] = useState(false);
  const [pokeStatus, setPokeStatus] = useState<'available' | 'poked' | 'limit_reached' | 'already_received'>('available');
  const { addNotification } = useNotifications();
  const { addTransaction } = useWallet();
  const { updateUserPoints, incrementPokesSent: incrementContextPokes, incrementPokesReceived: incrementContextReceived } = usePoke();

  // AD URL
  const AD_URL = 'https://otieu.com/4/10381267';

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

  // Check poke status on mount and when userId changes
  useEffect(() => {
    checkPokeStatus();
  }, [userId]);

  const checkPokeStatus = () => {
    const dailyRecord = getDailyPokes();
    
    // Check if already poked this user today
    if (dailyRecord.pokedUsers.includes(userId)) {
      setPokeStatus('poked');
      return;
    }
    
    // Check if daily send limit reached
    if (dailyRecord.pokesSent >= 2) {
      setPokeStatus('limit_reached');
      return;
    }
    
    // Check if already received from this user today
    if (dailyRecord.receivedFrom.includes(userId)) {
      setPokeStatus('already_received');
      return;
    }
    
    setPokeStatus('available');
  };

  const openAdWindow = () => {
    // Open ad in new window
    const adWindow = window.open(AD_URL, '_blank', 'width=800,height=600');
    
    if (!adWindow) {
      toast.error('Please allow popups to view ads');
      return;
    }
    
    setIsWatchingAd(true);
    
    // Simulate ad watching with timeout (in real app, you'd use postMessage or other methods)
    setTimeout(() => {
      setIsWatchingAd(false);
      setAdCompleted(true);
      toast.success('Ad completed! You can now poke.');
    }, 5000); // Simulate 5 second ad
    
    // Check if window is closed
    const checkClosed = setInterval(() => {
      if (adWindow.closed) {
        clearInterval(checkClosed);
        setIsWatchingAd(false);
        if (!adCompleted) {
          toast.error('Please complete the ad to poke');
        }
      }
    }, 1000);
  };

  const simulatePoke = async (): Promise<{ success: boolean; pointsEarned: number; cooldown?: number }> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Simulate 90% success rate
    const isSuccess = Math.random() > 0.1;
    
    if (isSuccess) {
      const pointsEarned = 50; // Fixed 50 points per poke
      // Simulate 20% chance of cooldown
      const hasCooldown = Math.random() > 0.8;
      const cooldown = hasCooldown ? Math.floor(Math.random() * 30) + 10 : undefined; // 10-40 seconds
      
      return { success: true, pointsEarned, cooldown };
    } else {
      // Simulate different failure reasons
      const reasons = [
        'User has reached their daily poke limit',
        'You have already poked this user recently',
        'User is currently offline',
        'Network error, please try again',
      ];
      throw new Error(reasons[Math.floor(Math.random() * reasons.length)]);
    }
  };

  const handlePoke = async () => {
    if (isPoking || cooldown || pokeStatus !== 'available') return;
    
    // Show ad modal first
    setShowAdModal(true);
  };

  const handleAdComplete = async () => {
    setShowAdModal(false);
    setAdCompleted(false);
    
    // Check daily limits again (in case changed during ad watching)
    const canSend = incrementPokesSent(userId);
    if (!canSend) {
      const remaining = getRemainingPokes();
      toast.error(`You can only poke 2 users per day. ${remaining.remainingSends} pokes remaining.`);
      checkPokeStatus();
      return;
    }
    
    setIsPoking(true);
    
    try {
      const result = await simulatePoke();
      
      if (result.success) {
        // Update user points in PokeContext
        updateUserPoints(result.pointsEarned);
        
        // Update pokes sent count
        incrementContextPokes();
        
        // Add points transaction to wallet
        addTransaction('poke', result.pointsEarned, `Poked ${username} (ad completed)`);
        
        // Add notification
        addNotification({
          userId: '1',
          type: 'poke',
          title: 'Poke Successful!',
          message: `You poked ${username} and earned ${result.pointsEarned} points!`
        });
        
        // Show success toast
        toast.success(`Successfully poked ${username}! +${result.pointsEarned} points`, {
          icon: '⚡',
          duration: 3000,
        });
        
        // Set cooldown if applicable
        if (result.cooldown) {
          setCooldown(result.cooldown);
          const interval = setInterval(() => {
            setCooldown(prev => {
              if (prev && prev > 1) {
                return prev - 1;
              } else {
                clearInterval(interval);
                return null;
              }
            });
          }, 1000);
        }
        
        // Update poke status
        setPokeStatus('poked');
        
        // Call success callback
        if (onPokeSuccess) {
          onPokeSuccess(result.pointsEarned);
        }
      }
    } catch (error: any) {
      // Show error toast
      toast.error(error.message || 'Failed to send poke. Please try again.', {
        duration: 4000,
      });
      
      // Add notification for failure
      addNotification({
        userId: '1',
        type: 'system',
        title: 'Poke Failed',
        message: error.message || 'Could not poke user'
      });
      
      // Reset poke status
      checkPokeStatus();
    } finally {
      setIsPoking(false);
    }
  };

  const handleSkipAd = () => {
    setShowAdModal(false);
    toast.info('You must watch the ad to poke and earn points');
  };

  const getButtonText = () => {
    switch (pokeStatus) {
      case 'poked':
        return 'Poked Today';
      case 'limit_reached':
        return 'Daily Limit Reached';
      case 'already_received':
        return 'Already Received';
      default:
        return 'Poke for 50 points!';
    }
  };

  const getButtonIcon = () => {
    switch (pokeStatus) {
      case 'poked':
        return <Check className="w-4 h-4" />;
      case 'limit_reached':
        return <Lock className="w-4 h-4" />;
      default:
        return <Zap className="w-4 h-4" />;
    }
  };

  const isButtonDisabled = isPoking || cooldown || pokeStatus !== 'available';

  if (cooldown) {
    return (
      <button
        disabled
        className={`${sizes[size]} ${variants[variant]} rounded-lg font-semibold flex items-center justify-center space-x-2 opacity-70 cursor-not-allowed`}
      >
        <Clock className="w-4 h-4" />
        <span>{cooldown}s</span>
      </button>
    );
  }

  return (
    <>
      <button
        onClick={handlePoke}
        disabled={isButtonDisabled}
        className={`${sizes[size]} ${variants[variant]} rounded-lg font-semibold flex items-center justify-center space-x-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95`}
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
                <span>You can only poke 2 users per day</span>
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
