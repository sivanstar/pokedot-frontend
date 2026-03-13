import React, { useState, useEffect } from 'react';
import { Eye, X, Zap, Award, Clock, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

interface TaskModalProps {
  isOpen: boolean;
  onComplete: () => void;
  onClose?: () => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onComplete, onClose }) => {
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const [adCompleted, setAdCompleted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(5);
  const [adWindow, setAdWindow] = useState<Window | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // AD URL - Can be configured in .env
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
      toast.success('Ad completed! You can now access your dashboard.', { 
        duration: 3000,
        icon: 'âœ…'
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
            icon: 'âŒ'
          });
        }
      }
    }, 1000);

    return () => clearInterval(checkClosed);
  }, [adWindow, adCompleted]);

  if (!isOpen) return null;

  const openAdWindow = () => {
    // Open ad in new window
    const window = window.open(AD_URL, '_blank', 'width=800,height=600');
    
    if (!window) {
      toast.error('Please allow popups to watch ads');
      return;
    }
    
    setAdWindow(window);
    setIsWatchingAd(true);
    setTimeRemaining(5);
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/task/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ adTaskId: `task_${Date.now()}` })
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(`Task completed! +${data.pointsEarned} points earned!`, {
          duration: 3000,
          icon: 'í¾¯'
        });
        onComplete();
      } else {
        toast.error(data.message || 'Failed to complete task');
      }
    } catch (error) {
      console.error('Error completing task:', error);
      toast.error('Failed to complete task. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 md:p-8 shadow-2xl transform animate-slideUp">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl">
              <Eye className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Quick Task</h2>
          </div>
          {onClose && !isWatchingAd && !adCompleted && !isSubmitting && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Info Box */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
            <div className="flex items-start space-x-3">
              <Award className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-gray-800 mb-2">Complete 1 Task to Continue</h3>
                <p className="text-sm text-gray-600">
                  Watch a short ad to unlock your dashboard and earn 
                  <span className="font-bold text-green-600 mx-1">10 bonus points!</span>
                </p>
              </div>
            </div>
          </div>

          {/* Ad Status */}
          {adCompleted ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-3" />
              <h4 className="text-lg font-bold text-gray-800 mb-2">Task Completed!</h4>
              <p className="text-sm text-gray-600 mb-4">
                You've earned 10 bonus points. Click continue to access your dashboard.
              </p>
              <button
                onClick={handleComplete}
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl font-bold hover:opacity-90 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center space-x-2">
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>Processing...</span>
                  </span>
                ) : (
                  'Continue to Dashboard'
                )}
              </button>
            </div>
          ) : isWatchingAd ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
              <Clock className="w-16 h-16 text-yellow-500 mx-auto mb-3 animate-spin-slow" />
              <h4 className="text-lg font-bold text-gray-800 mb-2">Watching Ad...</h4>
              <p className="text-sm text-gray-600 mb-4">
                Please complete the ad in the popup window.
              </p>
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse delay-100"></div>
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse delay-200"></div>
              </div>
              <p className="text-xs text-gray-500 mt-4">
                Time remaining: {timeRemaining}s
              </p>
            </div>
          ) : (
            <>
              {/* Ad Preview */}
              <div className="bg-gray-100 rounded-xl p-4 text-center">
                <div className="w-full h-32 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg mb-3 flex items-center justify-center">
                  <Eye className="w-12 h-12 text-gray-400" />
                </div>
                <p className="text-xs text-gray-500 mb-2">Advertisement</p>
                <div className="flex items-center justify-center space-x-1">
                  <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                  <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                  <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                </div>
              </div>

              {/* Task Info */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Reward:</span>
                  <span className="font-bold text-green-600">+10 points</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Duration:</span>
                  <span className="font-medium text-gray-700">~5 seconds</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={openAdWindow}
                  className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 text-white py-4 rounded-xl font-bold hover:opacity-90 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2"
                >
                  <Eye className="w-5 h-5" />
                  <span>Watch Ad to Continue</span>
                </button>
                {onClose && (
                  <button
                    onClick={onClose}
                    className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    Not now (you'll be logged out)
                  </button>
                )}
              </div>
            </>
          )}

          {/* Security Note */}
          <p className="text-xs text-center text-gray-400">
            This helps us keep POKEDOT free for everyone!
          </p>
        </div>
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
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
        .delay-100 {
          animation-delay: 0.1s;
        }
        .delay-200 {
          animation-delay: 0.2s;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
