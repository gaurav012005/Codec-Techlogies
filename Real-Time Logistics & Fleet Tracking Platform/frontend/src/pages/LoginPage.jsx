import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api';

export default function LoginPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await login(email, password);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));

            if (res.data.user.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/driver');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const fillDemo = (role) => {
        if (role === 'admin') {
            setEmail('admin@fleettrack.com');
            setPassword('admin123');
        } else {
            setEmail('robert@fleettrack.com');
            setPassword('driver123');
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-logo">
                    <div className="login-logo-icon">
                        <span className="material-symbols-outlined">local_shipping</span>
                    </div>
                    <div className="login-logo-text">
                        <h1>FleetTrack Pro</h1>
                        <p>Command Center</p>
                    </div>
                </div>

                <h2 className="login-title">Welcome back</h2>
                <p className="login-subtitle">Sign in to your account to continue</p>

                {error && (
                    <div className="login-error">
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>error</span>
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label>Email address</label>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="login-btn" disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div className="login-demo">
                    <p>Quick demo access</p>
                    <div className="login-demo-credentials">
                        <button className="login-demo-btn" onClick={() => fillDemo('admin')}>
                            Admin Login
                        </button>
                        <button className="login-demo-btn" onClick={() => fillDemo('driver')}>
                            Driver Login
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
