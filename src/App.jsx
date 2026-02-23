import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Homepage from './pages/Homepage';
import Pricing from './pages/Pricing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import JobSearch from './pages/JobSearch';
import Dashboard from './pages/Dashboard';
import { AuthProvider } from './hooks/useAuth';
import useDataSync from './hooks/useDataSync';
import './index.css';

// Silent background sync component — auto-syncs external DB data daily
const DataSyncWrapper = ({ children }) => {
  const { syncing } = useDataSync();
  // Optionally log sync status in development

  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <AuthProvider>
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
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </DataSyncWrapper>
      </AuthProvider>
    </Router>
  );
}

export default App;
