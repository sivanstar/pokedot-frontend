import React, { useState, useEffect } from 'react';
import { Eye, X, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

interface LoginTaskModalProps {
  isOpen: boolean;
  onComplete: () => void;
  onClose?: () => void;
}

export const LoginTaskModal: React.FC<LoginTaskModalProps> = ({ isOpen, onComplete, onClose }) => {
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const [adCompleted, setAdCompleted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(5);
  const [adWindow, setAdWindow] = useState<Window | null>(null);

  const AD_URL = import.meta.env.VITE_AD_URL || 'https://otieu.com/4/10381267';

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isWatchingAd && timeRemaining > 0) {
      timer = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    } else if (isWatchingAd && timeRemaining === 0) {
      setIsWatchingAd(false);
      setAdCompleted(true);
      toast.success('Task completed! You can now access your dashboard.', { 
        duration: 3000,
        icon: '✅'
      });
    }
    return () => clearTimeout(timer);
  }, [isWatchingAd, timeRemaining]);

  useEffect(() => {
    // Check if ad window is closed
    const checkClosed = setInterval(() => {
      if (adWindow && adWindow.closed) {
        clearInterval(checkClosed);
        if (!adCompleted) {
          setIsWatchingAd(false);
          setTimeRemaining(5);
          toast.error('Please complete the ad to continue', {
            duration: 3000,
            icon: '❌'
          });
        }
      }
    }, 1000);

    return () => clearInterval(checkClosed);
  }, [adWindow, adCompleted]);

  if (!isOpen) return null;

  const openAdWindow = () => {
    const window = window.open(AD_URL, '_blank', 'width=800,height=600');
    
    if (!window) {
      toast.error('Please allow popups to watch ads');
      return;
    }
    
    setAdWindow(window);
    setIsWatchingAd(true);
    setTimeRemaining(5);
  };

  const handleComplete = () => {
    onComplete();
  };

  const handleSkip = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-slideUp">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl">
              <Eye className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Complete Login Task</h2>
          </div>
          {!isWatchingAd && !adCompleted && onClose && (
            <button onClick={handleSkip} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Content */}
        {adCompleted ? (
          <div className="text-center py-6">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Task Completed!</h3>
            <p className="text-gray-600 mb-6">You can now access your dashboard.</p>
            <button
              onClick={handleComplete}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700"
            >
              Continue to Dashboard
            </button>
          </div>
        ) : isWatchingAd ? (
          <div className="text-center py-6">
            <Loader className="w-16 h-16 text-primary-600 mx-auto mb-4 animate-spin" />
            <h3 className="text-xl font-bold mb-2">Watching Ad...</h3>
            <p className="text-gray-600 mb-2">Please complete the ad in the popup window.</p>
            <p className="text-sm text-gray-500">Time remaining: {timeRemaining}s</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Info Box */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-gray-800 mb-2">Complete this task to continue</h3>
                  <p className="text-sm text-gray-600">
                    Watch a short ad to verify you're a real user and access your dashboard.
                    This helps us keep POKEDOT free and secure!
                  </p>
                </div>
              </div>
            </div>

            {/* Ad Preview */}
            <div className="bg-gray-100 rounded-xl p-4 text-center">
              <div className="w-full h-32 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg mb-3 flex items-center justify-center">
                <Eye className="w-12 h-12 text-gray-400" />
              </div>
              <p className="text-xs text-gray-500 mb-2">Advertisement</p>
            </div>

            {/* Task Info */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Duration:</span>
                <span className="font-medium text-gray-700">~5 seconds</span>
              </div>
            </div>

            {/* Action Buttons */}
            <button
              onClick={openAdWindow}
              className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 text-white py-4 rounded-xl font-bold hover:opacity-90 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2"
            >
              <Eye className="w-5 h-5" />
              <span>Watch Ad to Continue</span>
            </button>

            {onClose && (
              <button
                onClick={handleSkip}
                className="w-full text-sm text-gray-500 hover:text-gray-700"
              >
                Not now (you'll be logged out)
              </button>
            )}
          </div>
        )}

        {/* Security Note */}
        <p className="text-xs text-center text-gray-400 mt-6">
          This helps us keep POKEDOT free for everyone!
        </p>
      </div>

      {/* Add animations */}
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};
