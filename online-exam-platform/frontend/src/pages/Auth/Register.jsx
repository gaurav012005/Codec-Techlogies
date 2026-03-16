// ============================================
// Register Page
// ============================================

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { HiUser, HiMail, HiLockClosed, HiEye, HiEyeOff } from 'react-icons/hi';
import './Auth.css';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name || !email || !password) return toast.error('Please fill all fields');
        if (password.length < 6) return toast.error('Password must be at least 6 characters');
        if (password !== confirmPassword) return toast.error('Passwords do not match');

        setLoading(true);
        try {
            await register(name, email, password);
            toast.success('Account created! Welcome!');
            navigate('/dashboard', { replace: true });
        } catch (err) {
            toast.error(err.response?.data?.error || 'Registration failed');
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

                <h1 className="auth-title">Create Account</h1>
                <p className="auth-subtitle text-muted">Join the next-gen exam platform</p>

                <form onSubmit={handleSubmit} className="auth-form">
                    {/* Name */}
                    <div className="input-group">
                        <label htmlFor="reg-name">Full Name</label>
                        <div className="input-with-icon">
                            <HiUser className="input-icon" />
                            <input
                                id="reg-name"
                                type="text"
                                className="input-field"
                                placeholder="John Doe"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div className="input-group">
                        <label htmlFor="reg-email">Email</label>
                        <div className="input-with-icon">
                            <HiMail className="input-icon" />
                            <input
                                id="reg-email"
                                type="email"
                                className="input-field"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div className="input-group">
                        <label htmlFor="reg-password">Password</label>
                        <div className="input-with-icon">
                            <HiLockClosed className="input-icon" />
                            <input
                                id="reg-password"
                                type={showPassword ? 'text' : 'password'}
                                className="input-field"
                                placeholder="Min 6 characters"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
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

                    {/* Confirm Password */}
                    <div className="input-group">
                        <label htmlFor="reg-confirm">Confirm Password</label>
                        <div className="input-with-icon">
                            <HiLockClosed className="input-icon" />
                            <input
                                id="reg-confirm"
                                type={showPassword ? 'text' : 'password'}
                                className="input-field"
                                placeholder="Re-enter password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        className="btn btn-primary btn-lg auth-submit"
                        disabled={loading}
                    >
                        {loading ? <span className="spinner" /> : 'Create Account'}
                    </button>
                </form>

                <p className="auth-footer text-muted">
                    Already have an account?{' '}
                    <Link to="/login" className="auth-link">Sign in</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
