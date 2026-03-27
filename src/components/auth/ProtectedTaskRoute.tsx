import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { LoginTaskModal } from '../task/LoginTaskModal';
import { Loader } from 'lucide-react';

interface ProtectedTaskRouteProps {
  children: React.ReactNode;
}

export const ProtectedTaskRoute: React.FC<ProtectedTaskRouteProps> = ({ children }) => {
  const [needsTask, setNeedsTask] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const location = useLocation();

  const checkTaskStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setNeedsTask(false);
        setLoading(false);
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/task/status`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setNeedsTask(data.needsTask);
        if (data.needsTask) {
          setShowTaskModal(true);
        }
      } else {
        setNeedsTask(false);
      }
    } catch (error) {
      console.error('Error checking task status:', error);
      setNeedsTask(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkTaskStatus();
  }, [location.pathname]);

  const handleTaskComplete = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/task/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ adTaskId: `login_task_${Date.now()}` })
      });

      const data = await response.json();
      
      if (data.success) {
        setShowTaskModal(false);
        setNeedsTask(false);
        window.location.reload();
      } else {
        console.error('Failed to complete task:', data.message);
      }
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  const handleTaskClose = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login?task=required';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking requirements...</p>
        </div>
      </div>
    );
  }

  if (needsTask) {
    return (
      <>
        <LoginTaskModal 
          isOpen={showTaskModal} 
          onComplete={handleTaskComplete}
          onClose={handleTaskClose}
        />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Loader className="w-8 h-8 text-white animate-spin" />
              </div>
            </div>
            <p className="text-gray-600">Please complete the task to continue...</p>
          </div>
        </div>
      </>
    );
  }

  return <>{children}</>;
};
