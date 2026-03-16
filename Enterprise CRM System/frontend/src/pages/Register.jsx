import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, Zap, User, Building2, AlertCircle } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        companyName: '',
        industry: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await register(formData);
            navigate('/dashboard');
        } catch (err) {
            const msg = err.response?.data?.errors?.[0] || err.response?.data?.message || 'Registration failed';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-layout">
            <div style={{
                position: 'absolute', top: '10%', right: '10%',
                width: 280, height: 280, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(139,92,246,0.08), transparent 70%)',
                pointerEvents: 'none',
            }} />
            <div style={{
                position: 'absolute', bottom: '15%', left: '8%',
                width: 220, height: 220, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(16,185,129,0.06), transparent 70%)',
                pointerEvents: 'none',
            }} />

            <div className="auth-container">
                <div className="auth-card">
                    <div className="auth-logo">
                        <div className="auth-logo-icon">
                            <Zap />
                        </div>
                        <h1 className="auth-title">Create Your CRM</h1>
                        <p className="auth-subtitle">Set up your organization in 30 seconds</p>
                    </div>

                    {error && (
                        <div className="alert alert-error">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label" htmlFor="reg-company">Company Name</label>
                            <div className="form-input-wrapper">
                                <input
                                    id="reg-company"
                                    type="text"
                                    name="companyName"
                                    className="form-input"
                                    placeholder="Acme Corporation"
                                    value={formData.companyName}
                                    onChange={handleChange}
                                    required
                                />
                                <Building2 className="form-input-icon" />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="reg-name">Your Full Name</label>
                            <div className="form-input-wrapper">
                                <input
                                    id="reg-name"
                                    type="text"
                                    name="name"
                                    className="form-input"
                                    placeholder="John Smith"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                                <User className="form-input-icon" />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="reg-email">Work Email</label>
                            <div className="form-input-wrapper">
                                <input
                                    id="reg-email"
                                    type="email"
                                    name="email"
                                    className="form-input"
                                    placeholder="john@acme.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                                <Mail className="form-input-icon" />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="reg-password">Password</label>
                            <div className="form-input-wrapper">
                                <input
                                    id="reg-password"
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    className="form-input"
                                    placeholder="Min 6 characters"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    minLength={6}
                                />
                                <Lock className="form-input-icon" />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="reg-industry">Industry (Optional)</label>
                            <div className="form-input-wrapper">
                                <select
                                    id="reg-industry"
                                    name="industry"
                                    className="form-input form-input-no-icon"
                                    value={formData.industry}
                                    onChange={handleChange}
                                    style={{ paddingLeft: '0.75rem' }}
                                >
                                    <option value="">Select your industry...</option>
                                    <option value="Technology">Technology</option>
                                    <option value="Finance">Finance</option>
                                    <option value="Healthcare">Healthcare</option>
                                    <option value="Education">Education</option>
                                    <option value="Real Estate">Real Estate</option>
                                    <option value="Manufacturing">Manufacturing</option>
                                    <option value="Consulting">Consulting</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-full btn-lg"
                            disabled={loading}
                        >
                            {loading ? <span className="spinner" /> : 'Create Account'}
                        </button>
                    </form>

                    <div className="auth-footer">
                        Already have an account?{' '}
                        <Link to="/login">Sign in</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
