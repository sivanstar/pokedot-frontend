import React, { useState, useEffect } from 'react';
import { Eye, Clock, Zap, CheckCircle, AlertCircle, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface TaskModalProps {
  isOpen: boolean;
  onComplete: () => void;
  onSkip?: () => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onComplete, onSkip }) => {
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const [adCompleted, setAdCompleted] = useState(false);
  const [countdown, setCountdown] = useState(5);

  const AD_URL = 'https://otieu.com/4/10381267'; // Replace with actual ad URL

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isWatchingAd && !adCompleted) {
      timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsWatchingAd(false);
            setAdCompleted(true);
            toast.success('Ad completed! You can now access the platform.', { duration: 3000 });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isWatchingAd, adCompleted]);

  const openAdWindow = () => {
    const adWindow = window.open(AD_URL, '_blank', 'width=800,height=600');
    
    if (!adWindow) {
      toast.error('Please allow popups to watch ads');
      return;
    }
    
    setIsWatchingAd(true);
    
    // Simulate ad watching time
    setTimeout(() => {
      if (adWindow && !adWindow.closed) {
        // Ad window will close automatically after 5 seconds
        setTimeout(() => {
          if (adWindow && !adWindow.closed) {
            adWindow.close();
          }
        }, 5000);
      }
    }, 1000);
    
    // Check if window closed
    const checkClosed = setInterval(() => {
      if (adWindow.closed) {
        clearInterval(checkClosed);
        if (!adCompleted && !isWatchingAd) {
          toast.error('Please complete the ad to continue');
        }
      }
    }, 500);
  };

  const handleComplete = () => {
    if (adCompleted) {
      onComplete();
    }
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl animate-fadeIn">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-primary-100 rounded-lg">
                <Eye className="w-5 h-5 text-primary-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Complete Your Login Task</h2>
            </div>
            {!isWatchingAd && !adCompleted && onSkip && (
              <button
                onClick={handleSkip}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="space-y-6">
            <p className="text-gray-600">
              To access your dashboard, please complete this quick task. This helps us keep POKEDOT free for everyone!
            </p>

            {!isWatchingAd && !adCompleted && (
              <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl p-6 text-center">
                <Clock className="w-12 h-12 text-primary-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Quick Task</h3>
                <p className="text-gray-600 mb-4">
                  Watch a short ad (5 seconds) to verify you're a real user
                </p>
                <button
                  onClick={openAdWindow}
                  className="w-full btn-primary py-3 flex items-center justify-center space-x-2"
                >
                  <Eye className="w-5 h-5" />
                  <span>Complete Task Now</span>
                </button>
              </div>
            )}

            {isWatchingAd && !adCompleted && (
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Watching Ad...</h3>
                <p className="text-gray-600 mb-4">
                  Please wait {countdown} seconds while the ad plays
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary-600 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${((5 - countdown) / 5) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}

            {adCompleted && (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Task Completed!</h3>
                <p className="text-gray-600 mb-4">
                  You've successfully completed the task. Click below to continue.
                </p>
                <button
                  onClick={handleComplete}
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Zap className="w-5 h-5" />
                  <span>Continue to Dashboard</span>
                </button>
              </div>
            )}
          </div>

          <div className="mt-6 text-center text-xs text-gray-500">
            <p>This task helps verify real users and supports our platform</p>
          </div>
        </div>
      </div>
    </div>
  );
};
