import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { PokeProvider } from './context/PokeContext';
import { WalletProvider } from './context/WalletContext';
import { NotificationsProvider } from './context/NotificationsContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { ProtectedTaskRoute } from './components/auth/ProtectedTaskRoute';
import { AdminRoute } from './components/auth/AdminRoute';
import { Navbar } from './components/layout/Navbar';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';

// Main Pages
import { Dashboard } from './pages/dashboard/Dashboard';
import { PokePage } from './pages/poke/PokePage';
import { ProfilePage } from './pages/profile/ProfilePage';
import { WalletPage } from './pages/wallet/WalletPage';
import { Leaderboard } from './pages/leaderboard/Leaderboard';
import { SocialBoost } from './pages/social/SocialBoost';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminSocial } from './pages/admin/AdminSocial';

// Home Page
import { HomePage } from './pages/home/HomePage';

// Component to conditionally show Navbar
const LayoutWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const isAuthPage = ['/login', '/register', '/forgot-password', '/'].includes(location.pathname);
  const isAdminPage = location.pathname.startsWith('/admin');
  
  return (
    <>
      {!isAuthPage && !isAdminPage && <Navbar />}
      {children}
    </>
  );
};

function App() {
  return (
    <Router>
      <PokeProvider>
        <WalletProvider>
          <NotificationsProvider>
            <div className="min-h-screen bg-gray-50">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={
                  <>
                    <Navbar />
                    <HomePage />
                  </>
                } />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                
                {/* Protected Routes with Task Requirement */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <ProtectedTaskRoute>
                      <LayoutWrapper>
                        <Dashboard />
                      </LayoutWrapper>
                    </ProtectedTaskRoute>
                  </ProtectedRoute>
                } />
                
                <Route path="/poke" element={
                  <ProtectedRoute>
                    <ProtectedTaskRoute>
                      <LayoutWrapper>
                        <PokePage />
                      </LayoutWrapper>
                    </ProtectedTaskRoute>
                  </ProtectedRoute>
                } />
                
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <ProtectedTaskRoute>
                      <LayoutWrapper>
                        <ProfilePage />
                      </LayoutWrapper>
                    </ProtectedTaskRoute>
                  </ProtectedRoute>
                } />
                
                <Route path="/wallet" element={
                  <ProtectedRoute>
                    <ProtectedTaskRoute>
                      <LayoutWrapper>
                        <WalletPage />
                      </LayoutWrapper>
                    </ProtectedTaskRoute>
                  </ProtectedRoute>
                } />
                
                <Route path="/leaderboard" element={
                  <ProtectedRoute>
                    <ProtectedTaskRoute>
                      <LayoutWrapper>
                        <Leaderboard />
                      </LayoutWrapper>
                    </ProtectedTaskRoute>
                  </ProtectedRoute>
                } />
                
                <Route path="/social-boost" element={
                  <ProtectedRoute>
                    <ProtectedTaskRoute>
                      <LayoutWrapper>
                        <SocialBoost />
                      </LayoutWrapper>
                    </ProtectedTaskRoute>
                  </ProtectedRoute>
                } />
                
                {/* Admin Routes */}
                <Route path="/admin" element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                } />
                
                <Route path="/admin/social" element={
                  <AdminRoute>
                    <AdminSocial />
                  </AdminRoute>
                } />
                
                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </NotificationsProvider>
        </WalletProvider>
      </PokeProvider>
    </Router>
  );
}

export default App;
