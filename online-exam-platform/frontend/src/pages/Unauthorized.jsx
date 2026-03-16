// ============================================
// Unauthorized Page (403)
// ============================================

import { Link } from 'react-router-dom';

const Unauthorized = () => {
    return (
        <div className="auth-page">
            <div className="auth-card animate-fade-in" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🚫</div>
                <h1 className="heading-lg" style={{ marginBottom: '12px' }}>Access Denied</h1>
                <p className="text-muted" style={{ marginBottom: '28px' }}>
                    You don't have permission to access this page.
                </p>
                <Link to="/dashboard" className="btn btn-primary">
                    Go to Dashboard
                </Link>
            </div>
        </div>
    );
};

export default Unauthorized;
