import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Trophy, User, Zap, LogOut, Bell, DollarSign } from 'lucide-react';
import { usePoke } from '../../context/PokeContext';
import { NotificationsDropdown } from './NotificationsDropdown';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { user } = usePoke();

  const isActive = (path: string) => {
    return location.pathname === path ? 'text-primary-600 bg-primary-50' : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50';
  };

  const navItems = [
    { path: '/dashboard', icon: <Home className="w-5 h-5" />, label: 'Dashboard' },
    { path: '/poke', icon: <Zap className="w-5 h-5" />, label: 'Poke' },
    { path: '/wallet', icon: <DollarSign className="w-5 h-5" />, label: 'Wallet' },
    { path: '/leaderboard', icon: <Trophy className="w-5 h-5" />, label: 'Leaderboard' },
    { path: '/profile', icon: <User className="w-5 h-5" />, label: 'Profile' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-800">POKEDOT</span>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${isActive(item.path)}`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <NotificationsDropdown />

            {/* User Profile */}
            <div className="flex items-center space-x-3">
              <div className="text-right hidden md:block">
                <p className="font-semibold text-gray-800">{user?.username}</p>
                <p className="text-sm text-gray-500">{user?.points.toLocaleString()} points</p>
              </div>
              <Link
                to="/profile"
                className="w-10 h-10 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center text-white font-bold hover:opacity-90 transition-opacity"
              >
                {user?.username?.charAt(0) || 'U'}
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t mt-2 pt-2">
          <div className="flex justify-around">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center p-2 rounded-lg ${isActive(item.path)}`}
              >
                {item.icon}
                <span className="text-xs mt-1">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};
