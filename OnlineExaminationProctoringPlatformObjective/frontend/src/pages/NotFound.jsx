// ============================================
// 404 Not Found Page
// ============================================

import { Link } from 'react-router-dom';

const NotFound = () => {
    return (
        <div className="auth-page">
            <div className="auth-card animate-fade-in" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🔍</div>
                <h1 className="heading-lg" style={{ marginBottom: '12px' }}>404 — Page Not Found</h1>
                <p className="text-muted" style={{ marginBottom: '28px' }}>
                    The page you're looking for doesn't exist.
                </p>
                <Link to="/" className="btn btn-primary">
                    Go Home
                </Link>
            </div>
        </div>
    );
};

export default NotFound;
