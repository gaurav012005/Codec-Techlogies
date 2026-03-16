import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import {
    HiOutlineLightningBolt,
    HiOutlineMail,
    HiOutlineLockClosed,
    HiOutlineEye,
    HiOutlineEyeOff,
} from 'react-icons/hi';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const user = await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError('Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    const quickLogin = async (role) => {
        setLoading(true);
        try {
            await login(`${role}@examplatform.com`, 'password');
            navigate('/dashboard');
        } catch (err) {
            setError('Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <motion.div
                className="auth-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="auth-logo">
                    <HiOutlineLightningBolt />
                </div>
                <h1 className="auth-title">Welcome back</h1>
                <p className="auth-subtitle">Sign in to your ExamForge account</p>

                {error && (
                    <div style={{
                        background: 'rgba(244, 63, 94, 0.1)',
                        border: '1px solid rgba(244, 63, 94, 0.2)',
                        borderRadius: 'var(--radius-md)',
                        padding: '10px 14px',
                        marginBottom: 'var(--space-4)',
                        fontSize: 'var(--font-sm)',
                        color: 'var(--danger-400)',
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="auth-input-group">
                        <span className="auth-input-icon"><HiOutlineMail /></span>
                        <input
                            type="email"
                            className="form-input"
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="auth-input-group" style={{ position: 'relative' }}>
                        <span className="auth-input-icon"><HiOutlineLockClosed /></span>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            className="form-input"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{ paddingRight: 40 }}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            style={{
                                position: 'absolute',
                                right: 10,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: 'var(--text-tertiary)',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                            }}
                        >
                            {showPassword ? <HiOutlineEyeOff /> : <HiOutlineEye />}
                        </button>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-5)' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--font-sm)', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                            <input type="checkbox" className="form-checkbox" style={{ width: 14, height: 14 }} />
                            Remember me
                        </label>
                        <a href="#" style={{ fontSize: 'var(--font-sm)', color: 'var(--primary-400)', fontWeight: 500 }}>Forgot password?</a>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-lg w-full"
                        disabled={loading}
                        style={{ width: '100%' }}
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                {/* Quick Login Buttons */}
                <div style={{ marginTop: 'var(--space-6)' }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-3)',
                        marginBottom: 'var(--space-4)',
                    }}>
                        <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }}></div>
                        <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)' }}>Quick Login (Demo)</span>
                        <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }}></div>
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                        <button className="btn btn-secondary" style={{ flex: 1, fontSize: 'var(--font-xs)' }} onClick={() => quickLogin('admin')}>
                            👑 Admin
                        </button>
                        <button className="btn btn-secondary" style={{ flex: 1, fontSize: 'var(--font-xs)' }} onClick={() => quickLogin('examiner')}>
                            📝 Examiner
                        </button>
                        <button className="btn btn-secondary" style={{ flex: 1, fontSize: 'var(--font-xs)' }} onClick={() => quickLogin('student')}>
                            🎓 Student
                        </button>
                    </div>
                </div>

                <div className="auth-footer">
                    Don't have an account? <Link to="/register">Sign up</Link>
                </div>
            </motion.div>
        </div>
    );
}
