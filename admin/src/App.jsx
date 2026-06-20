import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Staff from './pages/Staff';
import Modules from './pages/Modules';
import ModuleBuilder from './pages/ModuleBuilder';
import Analytics from './pages/Analytics';
import Rewards from './pages/Rewards';
import Reports from './pages/Reports';
import Entries from './pages/Entries';
import SuperAdmin from './pages/SuperAdmin';
import Onboarding from './pages/Onboarding';
import ForgotPassword from './pages/ForgotPassword';
import Settings from './pages/Settings';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }
  return user ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="staff" element={<Staff />} />
        <Route path="modules" element={<Modules />} />
        <Route path="modules/new" element={<ModuleBuilder />} />
        <Route path="modules/:id/edit" element={<ModuleBuilder />} />
        <Route path="entries" element={<Entries />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="rewards" element={<Rewards />} />
        <Route path="reports" element={<Reports />} />
        <Route path="super-admin" element={<SuperAdmin />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}
