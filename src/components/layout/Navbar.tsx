import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, User, LogOut, Settings, Shield, Menu, X } from 'lucide-react';
import { usePoke } from '../../context/PokeContext';
import { authApi } from '../../api/auth';
import toast from 'react-hot-toast';

interface UserWithRole {
  _id: string;
  username: string;
  email: string;
  role?: 'user' | 'admin';
}

export const Navbar: React.FC = () => {
  const { user } = usePoke();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await authApi.logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Type assertion for user
  const typedUser = user as UserWithRole | null;
  const isAdmin = typedUser?.role === 'admin';

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2" onClick={closeMobileMenu}>
            <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-800">POKEDOT</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-lg font-medium transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  to="/poke"
                  className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-lg font-medium transition-colors"
                >
                  Poke
                </Link>
                <Link
                  to="/leaderboard"
                  className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-lg font-medium transition-colors"
                >
                  Leaderboard
                </Link>
                <Link
                  to="/wallet"
                  className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-lg font-medium transition-colors"
                >
                  Wallet
                </Link>
                
                {/* Admin Link - Only visible to admin users */}
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="flex items-center space-x-1 bg-purple-100 text-purple-700 hover:bg-purple-200 px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    <Shield className="w-4 h-4" />
                    <span>Admin</span>
                  </Link>
                )}

                {/* Profile Dropdown */}
                <div className="relative group">
                  <button className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors">
                    <div className="w-6 h-6 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {user?.username?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-gray-700">{user?.username}</span>
                  </button>
                  
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 py-2 hidden group-hover:block">
                    <Link
                      to="/profile"
                      className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <User className="w-4 h-4" />
                      <span>Profile</span>
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </Link>
                    <hr className="my-2 border-gray-100" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 w-full text-left transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-primary-600 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-colors"
                >
                  Sign Up Free
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-600" />
            ) : (
              <Menu className="w-6 h-6 text-gray-600" />
            )}
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 animate-slideDown">
            {user ? (
              <div className="space-y-2">
                {/* User Info */}
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg mb-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-bold">
                    {user?.username?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{user?.username}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                </div>

                {/* Navigation Links */}
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-3 p-3 text-gray-700 hover:bg-primary-50 rounded-lg transition-colors"
                  onClick={closeMobileMenu}
                >
                  <Zap className="w-5 h-5 text-primary-500" />
                  <span className="font-medium">Dashboard</span>
                </Link>
                <Link
                  to="/poke"
                  className="flex items-center space-x-3 p-3 text-gray-700 hover:bg-primary-50 rounded-lg transition-colors"
                  onClick={closeMobileMenu}
                >
                  <Zap className="w-5 h-5 text-primary-500" />
                  <span className="font-medium">Poke</span>
                </Link>
                <Link
                  to="/leaderboard"
                  className="flex items-center space-x-3 p-3 text-gray-700 hover:bg-primary-50 rounded-lg transition-colors"
                  onClick={closeMobileMenu}
                >
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  <span className="font-medium">Leaderboard</span>
                </Link>
                <Link
                  to="/wallet"
                  className="flex items-center space-x-3 p-3 text-gray-700 hover:bg-primary-50 rounded-lg transition-colors"
                  onClick={closeMobileMenu}
                >
                  <Wallet className="w-5 h-5 text-green-500" />
                  <span className="font-medium">Wallet</span>
                </Link>
                <Link
                  to="/profile"
                  className="flex items-center space-x-3 p-3 text-gray-700 hover:bg-primary-50 rounded-lg transition-colors"
                  onClick={closeMobileMenu}
                >
                  <User className="w-5 h-5 text-blue-500" />
                  <span className="font-medium">Profile</span>
                </Link>
                
                {/* Admin Link for Mobile */}
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="flex items-center space-x-3 p-3 text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                    onClick={closeMobileMenu}
                  >
                    <Shield className="w-5 h-5" />
                    <span className="font-medium">Admin Dashboard</span>
                  </Link>
                )}

                {/* Logout Button */}
                <button
                  onClick={() => {
                    handleLogout();
                    closeMobileMenu();
                  }}
                  className="flex items-center space-x-3 p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors w-full text-left"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <Link
                  to="/login"
                  className="block w-full text-center px-4 py-3 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors"
                  onClick={closeMobileMenu}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block w-full text-center px-4 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg font-medium hover:opacity-90 transition-colors"
                  onClick={closeMobileMenu}
                >
                  Sign Up Free
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add animation styles */}
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.2s ease-out;
        }
      `}</style>
    </nav>
  );
};
