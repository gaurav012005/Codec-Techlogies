import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import FleetManagementPage from './pages/FleetManagementPage';
import DeliveriesPage from './pages/DeliveriesPage';
import DeliveryDetailPage from './pages/DeliveryDetailPage';
import AnalyticsPage from './pages/AnalyticsPage';
import LiveMapPage from './pages/LiveMapPage';
import DriverManagementPage from './pages/DriverManagementPage';
import DriverDashboard from './pages/DriverDashboard';
import './index.css';

function ProtectedRoute({ children, requiredRole }) {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* Admin routes */}
        <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/map" element={<ProtectedRoute requiredRole="admin"><LiveMapPage /></ProtectedRoute>} />
        <Route path="/admin/fleet" element={<ProtectedRoute requiredRole="admin"><FleetManagementPage /></ProtectedRoute>} />
        <Route path="/admin/drivers" element={<ProtectedRoute requiredRole="admin"><DriverManagementPage /></ProtectedRoute>} />
        <Route path="/admin/deliveries" element={<ProtectedRoute requiredRole="admin"><DeliveriesPage /></ProtectedRoute>} />
        <Route path="/admin/deliveries/:id" element={<ProtectedRoute requiredRole="admin"><DeliveryDetailPage /></ProtectedRoute>} />
        <Route path="/admin/analytics" element={<ProtectedRoute requiredRole="admin"><AnalyticsPage /></ProtectedRoute>} />

        {/* Driver routes */}
        <Route path="/driver" element={<ProtectedRoute requiredRole="driver"><DriverDashboard /></ProtectedRoute>} />

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
