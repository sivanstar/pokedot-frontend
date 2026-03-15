import React, { useState } from 'react';
import toast from 'react-hot-toast';

interface PokeButtonSimpleProps {
  userId: string;
  username: string;
  onPokeSuccess?: (pointsEarned: number) => void;
  onPokeError?: (error: any) => void;
}

export const PokeButtonSimple: React.FC<PokeButtonSimpleProps> = ({
  userId,
  username,
  onPokeSuccess,
  onPokeError,
}) => {
  const [isPoking, setIsPoking] = useState(false);
  const [showAdModal, setShowAdModal] = useState(false);

  // Simple AD URL
  const AD_URL = 'https://otieu.com/4/10381267';

  const handlePokeClick = () => {
    setShowAdModal(true);
  };

  const handleWatchAd = () => {
    window.open(AD_URL, '_blank');
    
    // Simulate ad completion after 3 seconds
    setTimeout(() => {
      setShowAdModal(false);
      completePoke();
    }, 3000);
  };

  const completePoke = async () => {
    setIsPoking(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/poke/users/${userId}/poke`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ adTaskId: `ad_${Date.now()}` })
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(`Poked ${username}! +50 points earned`);
        if (onPokeSuccess) onPokeSuccess(50);
      } else {
        throw new Error(data.message || 'Failed to poke');
      }
    } catch (error: any) {
      console.error('Poke error:', error);
      toast.error(error.message || 'Failed to send poke');
      if (onPokeError) onPokeError(error);
    } finally {
      setIsPoking(false);
    }
  };

  const handleCloseModal = () => {
    setShowAdModal(false);
  };

  return (
    <>
      <button
        onClick={handlePokeClick}
        disabled={isPoking}
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
          `Poke ${username}`
        )}
      </button>

      {/* Simple Ad Modal */}
      {showAdModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Watch Ad to Poke</h3>
            
            <div className="bg-blue-50 rounded-xl p-6 text-center mb-4">
              <p className="text-gray-700 mb-4">
                Watch a short ad to poke {username} and earn 50 points!
              </p>
              
              <button
                onClick={handleWatchAd}
                className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700"
              >
                Watch Ad
              </button>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleCloseModal}
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
