// ============================================
// App — Root Component with Full Routing
// ============================================

import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Pages
import Landing from './pages/Landing/Landing';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import DashboardHome from './pages/Dashboard/DashboardHome';
import UserManagement from './pages/Admin/UserManagement';
import QuestionBank from './pages/Dashboard/QuestionBank';
import ExamBuilder from './pages/Dashboard/ExamBuilder';
import Unauthorized from './pages/Unauthorized';
import NotFound from './pages/NotFound';

// Layout
import DashboardLayout from './components/Layout/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
    const { loading, isAuthenticated } = useAuth();

    if (loading) {
        return (
            <div className="flex-center" style={{ minHeight: '100vh' }}>
                <div className="spinner spinner-lg" />
            </div>
        );
    }

    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route
                path="/login"
                element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
            />
            <Route
                path="/register"
                element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />}
            />

            {/* Dashboard Routes (Protected) */}
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <DashboardLayout />
                    </ProtectedRoute>
                }
            >
                {/* Default dashboard home */}
                <Route index element={<DashboardHome />} />

                {/* Admin-only routes */}
                <Route
                    path="users"
                    element={
                        <ProtectedRoute roles={['ADMIN']}>
                            <UserManagement />
                        </ProtectedRoute>
                    }
                />

                {/* Placeholder routes for future features */}
                <Route
                    path="questions"
                    element={
                        <ProtectedRoute roles={['ADMIN', 'EXAMINER']}>
                            <QuestionBank />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="exams"
                    element={
                        <ProtectedRoute roles={['ADMIN', 'EXAMINER']}>
                            <ExamBuilder />
                        </ProtectedRoute>
                    }
                />
                <Route path="analytics" element={<ComingSoon feature="12" title="Analytics" />} />
            </Route>

            {/* Error Routes */}
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
};

// Placeholder component for upcoming features
const ComingSoon = ({ feature, title }) => (
    <div className="animate-fade-in" style={{ textAlign: 'center', paddingTop: '80px' }}>
        <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🚧</div>
        <h2 className="heading-lg" style={{ marginBottom: '8px' }}>{title}</h2>
        <p className="text-muted">This module will be built in <strong>Feature {feature}</strong>.</p>
    </div>
);

export default App;
