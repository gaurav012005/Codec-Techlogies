// ============================================
// Login Page
// ============================================

import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { HiMail, HiLockClosed, HiEye, HiEyeOff } from 'react-icons/hi';
import './Auth.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || '/dashboard';

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) return toast.error('Please fill all fields');

        setLoading(true);
        try {
            await login(email, password);
            toast.success('Welcome back!');
            navigate(from, { replace: true });
        } catch (err) {
            toast.error(err.response?.data?.error || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card animate-fade-in">
                {/* Logo */}
                <div className="auth-logo">
                    <span className="logo-icon">🛡️</span>
                    <span className="logo-text text-gradient">ExamGuard</span>
                </div>

                <h1 className="auth-title">Welcome Back</h1>
                <p className="auth-subtitle text-muted">Sign in to your account</p>

                <form onSubmit={handleSubmit} className="auth-form">
                    {/* Email */}
                    <div className="input-group">
                        <label htmlFor="login-email">Email</label>
                        <div className="input-with-icon">
                            <HiMail className="input-icon" />
                            <input
                                id="login-email"
                                type="email"
                                className="input-field"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                autoComplete="email"
                                required
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div className="input-group">
                        <label htmlFor="login-password">Password</label>
                        <div className="input-with-icon">
                            <HiLockClosed className="input-icon" />
                            <input
                                id="login-password"
                                type={showPassword ? 'text' : 'password'}
                                className="input-field"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="current-password"
                                required
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                                tabIndex={-1}
                            >
                                {showPassword ? <HiEyeOff /> : <HiEye />}
                            </button>
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        className="btn btn-primary btn-lg auth-submit"
                        disabled={loading}
                    >
                        {loading ? <span className="spinner" /> : 'Sign In'}
                    </button>
                </form>

                <p className="auth-footer text-muted">
                    Don't have an account?{' '}
                    <Link to="/register" className="auth-link">Create one</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
