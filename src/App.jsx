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
  const { user, isAdmin } = useAuth();
  const lastPath = useRef('');

  useEffect(() => {
    const logVisit = async () => {
      // 🛑 DON'T log visits if the user is an admin
      if (isAdmin) return;

      // Avoid duplicate logs for the same page on re-renders
      if (lastPath.current === location.pathname) return;
      lastPath.current = location.pathname;

      let session_id = sessionStorage.getItem('visit_session_id');
      if (!session_id) {
        session_id = crypto.randomUUID();
        sessionStorage.setItem('visit_session_id', session_id);
      }

      try {
                // Determine country via free Geo-IP API
                let country = 'Unknown';
                try {
                    const geoRes = await fetch('https://ipapi.co/json/');
                    if (geoRes.ok) {
                        const geoData = await geoRes.json();
                        country = geoData.country_name || 'Unknown';
                    } else {
                        // Backup Service
                        const backupRes = await fetch('http://ip-api.com/json/');
                        const backupData = await backupRes.json();
                        country = backupData.country || 'Unknown';
                    }
                } catch (geoErr) {
                    console.error("Geo-IP detection failed", geoErr);
                }

        await supabase.from('site_visits').insert([{
          path: location.pathname,
          user_email: user?.email || null,
          session_id: session_id,
          user_agent: navigator.userAgent,
          country: country
        }]);
      } catch (err) {
        console.error("Visit tracking failed", err);
      }
    };

    logVisit();
  }, [location.pathname, user?.email]);

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
