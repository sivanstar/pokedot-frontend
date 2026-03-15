import React, { useState } from 'react';
import { Eye, X, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

interface TaskModalProps {
  isOpen: boolean;
  onComplete: () => void;
  onClose?: () => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onComplete, onClose }) => {
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const [adCompleted, setAdCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const AD_URL = import.meta.env.VITE_AD_URL || 'https://otieu.com/4/10381267';

  if (!isOpen) return null;

  const openAdWindow = () => {
    const adWindow = window.open(AD_URL, '_blank', 'width=800,height=600');
    
    if (!adWindow) {
      toast.error('Please allow popups to watch ads');
      return;
    }
    
    setIsWatchingAd(true);
    
    // Simulate ad completion after 5 seconds
    setTimeout(() => {
      setIsWatchingAd(false);
      setAdCompleted(true);
      toast.success('Ad completed! You can now continue.', { duration: 3000 });
    }, 5000);
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
        toast.success('Task completed! You can now access your dashboard.');
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
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Quick Task</h2>
          {!isWatchingAd && !adCompleted && onClose && (
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          )}
        </div>

        {adCompleted ? (
          <div className="text-center py-6">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Task Completed!</h3>
            <p className="text-gray-600 mb-6">Click continue to access your dashboard.</p>
            <button
              onClick={handleComplete}
              disabled={isSubmitting}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Processing...' : 'Continue to Dashboard'}
            </button>
          </div>
        ) : isWatchingAd ? (
          <div className="text-center py-6">
            <Loader className="w-16 h-16 text-primary-600 mx-auto mb-4 animate-spin" />
            <h3 className="text-xl font-bold mb-2">Watching Ad...</h3>
            <p className="text-gray-600">Please wait while the ad completes.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <p className="text-gray-700">
                  Complete this task to access your dashboard. It only takes a few seconds.
                </p>
              </div>
            </div>

            <div className="bg-gray-100 h-32 rounded-lg flex items-center justify-center">
              <Eye className="w-12 h-12 text-gray-400" />
            </div>

            <button
              onClick={openAdWindow}
              className="w-full bg-primary-600 text-white py-3 rounded-lg font-bold hover:bg-primary-700"
            >
              Watch Ad to Continue
            </button>

            {onClose && (
              <button
                onClick={onClose}
                className="w-full text-sm text-gray-500 hover:text-gray-700"
              >
                Not now (you'll be logged out)
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
