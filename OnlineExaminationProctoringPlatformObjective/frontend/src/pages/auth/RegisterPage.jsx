import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import {
    HiOutlineLightningBolt,
    HiOutlineMail,
    HiOutlineLockClosed,
    HiOutlineUser,
} from 'react-icons/hi';

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await register(name, email, password);
            navigate('/dashboard');
        } catch (err) {
            setError('Registration failed');
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
                <h1 className="auth-title">Create an account</h1>
                <p className="auth-subtitle">Join ExamForge to get started</p>

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
                        <span className="auth-input-icon"><HiOutlineUser /></span>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Full name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

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

                    <div className="auth-input-group">
                        <span className="auth-input-icon"><HiOutlineLockClosed /></span>
                        <input
                            type="password"
                            className="form-input"
                            placeholder="Password (min 8 characters)"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={8}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-lg w-full"
                        disabled={loading}
                        style={{ width: '100%', marginTop: 'var(--space-2)' }}
                    >
                        {loading ? 'Creating account...' : 'Create Account'}
                    </button>
                </form>

                <div className="auth-footer">
                    Already have an account? <Link to="/login">Sign in</Link>
                </div>
            </motion.div>
        </div>
    );
}
