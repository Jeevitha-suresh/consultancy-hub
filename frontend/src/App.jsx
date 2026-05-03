import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import ProtectedRoute from './components/ProtectedRoute';
import Profile from './pages/Profile';
import Connections from './pages/Connections';
import Jobs from './pages/Jobs';
import Messaging from './pages/Messaging';
import Admin from './pages/Admin';
import Notifications from './pages/Notifications';
import CandidateDashboard from './pages/CandidateDashboard';
import RecruiterDashboard from './pages/RecruiterDashboard';
import ForcePasswordChange from './pages/ForcePasswordChange';
import { useAuthStore } from './store/authStore';
import SidebarLayout from './components/layout/SidebarLayout';

// Recruiter route: blocks access if mustChangePassword is true
const RecruiterRoute = ({ children }) => {
  const { user } = useAuthStore();
  if (!user) return <Login />;
  if (user.role === 'Recruiter' && user.mustChangePassword) {
    return (
      <ForcePasswordChange onSuccess={() => {
        window.location.href = '/recruiter-dashboard';
      }} />
    );
  }
  return children;
};

// Layout Wrapper to keep code clean
const ProtectedLayout = ({ children, role = null }) => {
  return (
    <ProtectedRoute>
      <RecruiterRoute>
        <SidebarLayout>
          {children}
        </SidebarLayout>
      </RecruiterRoute>
    </ProtectedRoute>
  );
};

function AppContent() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Authenticated Routes with Sidebar */}
      <Route path="/" element={<ProtectedLayout><Home /></ProtectedLayout>} />
      <Route path="/jobs" element={<ProtectedLayout><Jobs /></ProtectedLayout>} />
      <Route path="/connections" element={<ProtectedLayout><Connections /></ProtectedLayout>} />
      <Route path="/messaging" element={<ProtectedLayout><Messaging /></ProtectedLayout>} />
      <Route path="/notifications" element={<ProtectedLayout><Notifications /></ProtectedLayout>} />
      <Route path="/profile/:id" element={<ProtectedLayout><Profile /></ProtectedLayout>} />
      
      {/* Role-Specific Dashboards */}
      <Route path="/candidate-dashboard" element={<ProtectedLayout><CandidateDashboard /></ProtectedLayout>} />
      <Route path="/recruiter-dashboard" element={<ProtectedLayout><RecruiterDashboard /></ProtectedLayout>} />
      <Route path="/admin" element={<ProtectedLayout><Admin /></ProtectedLayout>} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
