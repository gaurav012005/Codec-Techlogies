import { useState } from 'react';
import { Link } from 'react-router-dom';
import '../components/auth/Auth.css';

const RegisterPage = () => {
    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        company: '',
        password: '',
        confirmPassword: '',
        role: '',
        agreeTerms: false,
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const updateField = (field: string, value: string | boolean) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const getPasswordStrength = (pw: string): { label: string; width: string; color: string } => {
        if (pw.length === 0) return { label: '', width: '0%', color: 'transparent' };
        if (pw.length < 6) return { label: 'Weak', width: '25%', color: '#e17055' };
        if (pw.length < 10) return { label: 'Fair', width: '50%', color: '#fdcb6e' };
        if (/(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%])/.test(pw)) return { label: 'Strong', width: '100%', color: '#00b894' };
        return { label: 'Good', width: '75%', color: '#00cec9' };
    };

    const strength = getPasswordStrength(form.password);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (form.password !== form.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (!form.agreeTerms) {
            setError('Please agree to the Terms of Service');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    firstName: form.firstName,
                    lastName: form.lastName,
                    email: form.email,
                    company: form.company,
                    password: form.password,
                    role: form.role,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Registration failed');
            }

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            window.location.href = '/dashboard';
        } catch (err: any) {
            setError(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-page__left">
                <div className="auth-page__left-content">
                    <Link to="/" className="auth-page__logo">
                        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                            <circle cx="16" cy="16" r="14" stroke="url(#reg-logo-grad)" strokeWidth="2.5" fill="none" />
                            <path d="M10 16l4 4 8-8" stroke="url(#reg-logo-grad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            <defs>
                                <linearGradient id="reg-logo-grad" x1="0" y1="0" x2="32" y2="32">
                                    <stop stopColor="#6c5ce7" /><stop offset="1" stopColor="#00cec9" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <span>HireAI</span>
                    </Link>

                    <h2 className="auth-page__left-title gradient-text">
                        Start Hiring<br />Smarter Today
                    </h2>

                    <div className="auth-page__floating-cards">
                        <div className="auth-floating-card auth-floating-card--1">
                            <div className="auth-floating-card__icon">🚀</div>
                            <div>
                                <div className="auth-floating-card__title">Setup Time</div>
                                <div className="auth-floating-card__value" style={{ color: '#00cec9' }}>5 min</div>
                            </div>
                        </div>
                        <div className="auth-floating-card auth-floating-card--2">
                            <div className="auth-floating-card__icon">🎯</div>
                            <div>
                                <div className="auth-floating-card__title">First AI Match</div>
                                <div className="auth-floating-card__value" style={{ color: '#6c5ce7' }}>Instant</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="auth-page__mesh">
                    <div className="auth-mesh-orb auth-mesh-orb--1"></div>
                    <div className="auth-mesh-orb auth-mesh-orb--2"></div>
                </div>
            </div>

            <div className="auth-page__right">
                <div className="auth-form-wrapper auth-form-wrapper--register">
                    <h2 className="auth-form__heading">Create Your Account</h2>
                    <p className="auth-form__subtext">Start hiring smarter with AI</p>

                    {error && (
                        <div className="auth-form__error" id="register-error">
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="auth-form" id="register-form">
                        <div className="auth-field-row">
                            <div className="auth-field">
                                <label className="auth-field__label">First Name</label>
                                <input
                                    type="text"
                                    className="input auth-input"
                                    placeholder="John"
                                    value={form.firstName}
                                    onChange={(e) => updateField('firstName', e.target.value)}
                                    required
                                    id="register-firstname"
                                />
                            </div>
                            <div className="auth-field">
                                <label className="auth-field__label">Last Name</label>
                                <input
                                    type="text"
                                    className="input auth-input"
                                    placeholder="Doe"
                                    value={form.lastName}
                                    onChange={(e) => updateField('lastName', e.target.value)}
                                    required
                                    id="register-lastname"
                                />
                            </div>
                        </div>

                        <div className="auth-field">
                            <label className="auth-field__label">Work Email</label>
                            <div className="input-with-icon">
                                <span className="input-icon">✉️</span>
                                <input
                                    type="email"
                                    className="input auth-input"
                                    placeholder="you@company.com"
                                    value={form.email}
                                    onChange={(e) => updateField('email', e.target.value)}
                                    required
                                    id="register-email"
                                />
                            </div>
                        </div>

                        <div className="auth-field">
                            <label className="auth-field__label">Company Name</label>
                            <div className="input-with-icon">
                                <span className="input-icon">🏢</span>
                                <input
                                    type="text"
                                    className="input auth-input"
                                    placeholder="Your company"
                                    value={form.company}
                                    onChange={(e) => updateField('company', e.target.value)}
                                    required
                                    id="register-company"
                                />
                            </div>
                        </div>

                        <div className="auth-field">
                            <label className="auth-field__label">Password</label>
                            <div className="input-with-icon">
                                <span className="input-icon">🔒</span>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    className="input auth-input"
                                    placeholder="Create a strong password"
                                    value={form.password}
                                    onChange={(e) => updateField('password', e.target.value)}
                                    required
                                    id="register-password"
                                />
                                <button
                                    type="button"
                                    className="auth-field__toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                    tabIndex={-1}
                                >
                                    {showPassword ? '🙈' : '👁️'}
                                </button>
                            </div>
                            {form.password && (
                                <div className="auth-password-strength">
                                    <div className="auth-password-strength__bar">
                                        <div
                                            className="auth-password-strength__fill"
                                            style={{ width: strength.width, background: strength.color }}
                                        ></div>
                                    </div>
                                    <span className="auth-password-strength__label" style={{ color: strength.color }}>
                                        {strength.label}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="auth-field">
                            <label className="auth-field__label">Confirm Password</label>
                            <div className="input-with-icon">
                                <span className="input-icon">🔒</span>
                                <input
                                    type="password"
                                    className="input auth-input"
                                    placeholder="Confirm your password"
                                    value={form.confirmPassword}
                                    onChange={(e) => updateField('confirmPassword', e.target.value)}
                                    required
                                    id="register-confirm-password"
                                />
                            </div>
                        </div>

                        <div className="auth-field">
                            <label className="auth-field__label">I am a...</label>
                            <select
                                className="input auth-input auth-select"
                                value={form.role}
                                onChange={(e) => updateField('role', e.target.value)}
                                required
                                id="register-role"
                            >
                                <option value="" disabled>Select your role</option>
                                <option value="recruiter">Recruiter</option>
                                <option value="hr_admin">HR Admin</option>
                                <option value="hiring_manager">Hiring Manager</option>
                                <option value="candidate">Candidate</option>
                            </select>
                        </div>

                        <label className="auth-checkbox">
                            <input
                                type="checkbox"
                                checked={form.agreeTerms}
                                onChange={(e) => updateField('agreeTerms', e.target.checked)}
                            />
                            <span className="auth-checkbox__mark"></span>
                            I agree to the <a href="/terms" className="auth-form__link">Terms of Service</a> and <a href="/privacy" className="auth-form__link">Privacy Policy</a>
                        </label>

                        <button
                            type="submit"
                            className="btn btn-primary btn-lg auth-form__submit"
                            disabled={loading}
                            id="register-submit"
                        >
                            {loading ? <span className="auth-spinner"></span> : 'Create Account'}
                        </button>

                        <div className="auth-divider">
                            <span>or sign up with</span>
                        </div>

                        <div className="auth-social-buttons">
                            <button type="button" className="btn btn-secondary auth-social-btn" id="google-register"
                                onClick={() => window.open('https://accounts.google.com/signin', '_blank')}>
                                <svg width="18" height="18" viewBox="0 0 18 18"><path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4" /><path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853" /><path d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z" fill="#FBBC05" /><path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z" fill="#EA4335" /></svg>
                                Google
                            </button>
                            <button type="button" className="btn btn-secondary auth-social-btn" id="linkedin-register"
                                onClick={() => window.open('https://www.linkedin.com/login', '_blank')}>
                                <svg width="18" height="18" viewBox="0 0 18 18" fill="#0A66C2"><path d="M15.335 15.335H12.67v-4.181c0-.997-.02-2.28-1.39-2.28-1.39 0-1.601 1.086-1.601 2.207v4.254H7.014V6.75h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.2 1.778 3.2 4.091v4.707zM4.003 5.575a1.546 1.546 0 110-3.092 1.546 1.546 0 010 3.092zM5.336 15.335H2.67V6.75h2.666v8.585zM16.67 0H1.329C.593 0 0 .593 0 1.325v15.35C0 17.407.593 18 1.325 18h15.35c.73 0 1.325-.593 1.325-1.325V1.325C18 .593 17.407 0 16.675 0h-.005z" /></svg>
                                LinkedIn
                            </button>
                        </div>

                        <p className="auth-form__footer-text">
                            Already have an account? <Link to="/login" className="auth-form__link">Sign in</Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
