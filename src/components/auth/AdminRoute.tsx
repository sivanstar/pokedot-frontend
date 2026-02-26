import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { adminApi } from '../../api/admin';

interface AdminRouteProps {
  children: React.ReactNode;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('No token found, redirecting to login');
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        // First get user profile to check role
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          console.log('User from localStorage:', user);
          
          if (user.role === 'admin') {
            console.log('User is admin from localStorage');
            setIsAdmin(true);
            setLoading(false);
            return;
          }
        }

        // If not in localStorage, check with API
        try {
          const response = await adminApi.checkAdmin();
          console.log('Admin check response:', response);
          setIsAdmin(response.isAdmin);
        } catch (error) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Error in admin check:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminAccess();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAdmin) {
    console.log('Not admin, redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  console.log('Admin access granted');
  return <>{children}</>;
};
