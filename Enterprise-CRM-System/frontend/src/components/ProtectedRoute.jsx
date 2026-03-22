import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--bg-primary)',
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div className="spinner" style={{
                        width: 40, height: 40,
                        borderWidth: 3,
                        margin: '0 auto var(--space-4)',
                        borderColor: 'rgba(99,102,241,0.2)',
                        borderTopColor: 'var(--primary-400)',
                    }} />
                    <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-sm)' }}>
                        Loading...
                    </p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
