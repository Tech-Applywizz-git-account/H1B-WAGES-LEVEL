import React, { useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Homepage from './pages/Homepage';
import Pricing from './pages/Pricing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import JobSearch from './pages/JobSearch';
import AuthCallback from './pages/AuthCallback';
import AdminDashboard from './pages/AdminDashboard';
import { AuthProvider } from './hooks/useAuth';
import useAuth from './hooks/useAuth';
import useDataSync from './hooks/useDataSync';
import { supabase } from './supabaseClient';
import './output.css';

// Site Visit Tracker - Logs activity to Supabase
const VisitTracker = () => {
  const location = useLocation();
  const { user } = useAuth();
  const lastPath = useRef('');

  useEffect(() => {
    const logVisit = async () => {
      // Avoid duplicate logs for the same page on re-renders
      if (lastPath.current === location.pathname) return;
      lastPath.current = location.pathname;

      // Get or create a session ID for unique visitor tracking
      let sessionId = sessionStorage.getItem('site_session_id');
      if (!sessionId) {
        sessionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        sessionStorage.setItem('site_session_id', sessionId);
      }

      try {
        await supabase.from('site_visits').insert([{
          path: location.pathname,
          user_email: user?.email || null,
          session_id: sessionId,
          user_agent: navigator.userAgent
        }]);
      } catch (err) {
        // Silently fail to not interrupt user experience
        console.error('Visit log error:', err);
      }
    };

    logVisit();
  }, [location.pathname, user]);

  return null;
};

// Silent background sync component — auto-syncs external DB data daily
const DataSyncWrapper = ({ children }) => {
  const { syncing } = useDataSync();
  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <VisitTracker />
        <DataSyncWrapper>
          <Routes>
            {/* Landing page — public marketing page */}
            <Route path="/" element={<LandingPage />} />

            {/* App pages */}
            <Route path="/app" element={<Homepage />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/search" element={<Homepage />} />
            <Route path="/jobs" element={<Homepage />} />

            {/* OAuth callback */}
            <Route path="/auth/callback" element={<AuthCallback />} />

            {/* Admin Dashboard */}
            <Route path="/admin" element={<AdminDashboard />} />

            {/* Redirect old /dashboard to new /app */}
            <Route path="/dashboard" element={<Navigate to="/app" replace />} />

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </DataSyncWrapper>
      </AuthProvider>
    </Router>
  );
}

export default App;
