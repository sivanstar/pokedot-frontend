import React, { useState } from 'react';
import { Eye, X, AlertCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface LoginTaskModalProps {
  isOpen: boolean;
  onComplete: () => void;
  onClose?: () => void;
}

export const LoginTaskModal: React.FC<LoginTaskModalProps> = ({ isOpen, onComplete, onClose }) => {
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const [adCompleted, setAdCompleted] = useState(false);
  const [adWindow, setAdWindow] = useState<Window | null>(null);

  const AD_URL = import.meta.env.VITE_AD_URL || 'https://otieu.com/4/10381267';

  if (!isOpen) return null;

  const openAdWindow = () => {
    const newWindow = window.open(AD_URL, '_blank', 'width=800,height=600');
    
    if (!newWindow) {
      toast.error('Please allow popups to watch ads');
      return;
    }
    
    setAdWindow(newWindow);
    setIsWatchingAd(true);
    
    // Simulate ad completion after 5 seconds
    setTimeout(() => {
      if (newWindow && !newWindow.closed) {
        newWindow.close();
      }
      setIsWatchingAd(false);
      setAdCompleted(true);
      toast.success('Ad completed! You can now access your dashboard.', { 
        duration: 3000,
        icon: '✅'
      });
    }, 5000);
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
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
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
            <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-xl font-bold mb-2">Watching Ad...</h3>
            <p className="text-gray-600 mb-2">Please wait while the ad completes.</p>
            <p className="text-sm text-gray-500">This will take about 5 seconds</p>
          </div>
        ) : (
          <div className="space-y-6">
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

            <div className="bg-gray-100 h-32 rounded-lg flex items-center justify-center">
              <Eye className="w-12 h-12 text-gray-400" />
            </div>

            <button
              onClick={openAdWindow}
              className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 text-white py-4 rounded-xl font-bold hover:opacity-90 transition-all flex items-center justify-center space-x-2"
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

        <p className="text-xs text-center text-gray-400 mt-6">
          This helps us keep POKEDOT free for everyone!
        </p>
      </div>
    </div>
  );
};
