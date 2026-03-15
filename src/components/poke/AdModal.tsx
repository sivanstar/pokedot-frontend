import React from 'react';
import { Eye } from 'lucide-react';

interface AdModalProps {
  isOpen: boolean;
  username: string;
  onAdComplete: () => void;
  onClose: () => void;
}

export const AdModal: React.FC<AdModalProps> = ({ 
  isOpen, 
  username, 
  onAdComplete, 
  onClose 
}) => {
  const [isWatching, setIsWatching] = React.useState(false);
  const [adCompleted, setAdCompleted] = React.useState(false);

  if (!isOpen) return null;

  const AD_URL = import.meta.env.VITE_AD_URL || 'https://otieu.com/4/10381267';

  const handleWatchAd = () => {
    const adWindow = window.open(AD_URL, '_blank', 'width=800,height=600');
    
    if (!adWindow) {
      alert('Please allow popups to watch ads');
      return;
    }
    
    setIsWatching(true);
    
    // Simulate ad completion after 5 seconds
    setTimeout(() => {
      setIsWatching(false);
      setAdCompleted(true);
    }, 5000);
  };

  const handleComplete = () => {
    setAdCompleted(false);
    onAdComplete();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Watch Ad to Poke</h3>
        
        <div className="bg-blue-50 rounded-xl p-6 text-center mb-4">
          <Eye className="w-12 h-12 text-blue-500 mx-auto mb-3" />
          <p className="text-gray-700 mb-4">
            Watch a short ad to poke {username} and earn 50 points!
          </p>
          
          {adCompleted ? (
            <button
              onClick={handleComplete}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700"
            >
              Complete Poke Now
            </button>
          ) : isWatching ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-3"></div>
              <p className="text-gray-600">Watching ad... Please wait.</p>
            </div>
          ) : (
            <button
              onClick={handleWatchAd}
              className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700"
            >
              Watch Ad
            </button>
          )}
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
