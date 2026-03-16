import { useState } from 'react';
import { Link } from 'react-router-dom';
import '../components/auth/Auth.css';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [remember, setRemember] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Login failed');
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
                            <circle cx="16" cy="16" r="14" stroke="url(#auth-logo-grad)" strokeWidth="2.5" fill="none" />
                            <path d="M10 16l4 4 8-8" stroke="url(#auth-logo-grad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            <defs>
                                <linearGradient id="auth-logo-grad" x1="0" y1="0" x2="32" y2="32">
                                    <stop stopColor="#6c5ce7" />
                                    <stop offset="1" stopColor="#00cec9" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <span>HireAI</span>
                    </Link>

                    <h2 className="auth-page__left-title gradient-text">
                        AI-Powered Hiring<br />Starts Here
                    </h2>

                    {/* Floating UI previews */}
                    <div className="auth-page__floating-cards">
                        <div className="auth-floating-card auth-floating-card--1">
                            <div className="auth-floating-card__icon">🎯</div>
                            <div>
                                <div className="auth-floating-card__title">Match Score</div>
                                <div className="auth-floating-card__value" style={{ color: '#00cec9' }}>94%</div>
                            </div>
                        </div>
                        <div className="auth-floating-card auth-floating-card--2">
                            <div className="auth-floating-card__icon">📊</div>
                            <div>
                                <div className="auth-floating-card__title">Candidates Ranked</div>
                                <div className="auth-floating-card__value" style={{ color: '#6c5ce7' }}>1,284</div>
                            </div>
                        </div>
                        <div className="auth-floating-card auth-floating-card--3">
                            <div className="auth-floating-card__icon">⚡</div>
                            <div>
                                <div className="auth-floating-card__title">Time Saved</div>
                                <div className="auth-floating-card__value" style={{ color: '#fd79a8' }}>85%</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Background mesh */}
                <div className="auth-page__mesh">
                    <div className="auth-mesh-orb auth-mesh-orb--1"></div>
                    <div className="auth-mesh-orb auth-mesh-orb--2"></div>
                </div>
            </div>

            <div className="auth-page__right">
                <div className="auth-form-wrapper">
                    <h2 className="auth-form__heading">Welcome Back</h2>
                    <p className="auth-form__subtext">Sign in to continue to HireAI</p>

                    {error && (
                        <div className="auth-form__error" id="login-error">
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="auth-form" id="login-form">
                        <div className="auth-field">
                            <label className="auth-field__label">Email</label>
                            <div className="input-with-icon">
                                <span className="input-icon">✉️</span>
                                <input
                                    type="email"
                                    className="input auth-input"
                                    placeholder="you@company.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    id="login-email"
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
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    id="login-password"
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
                        </div>

                        <div className="auth-form__row">
                            <label className="auth-checkbox">
                                <input
                                    type="checkbox"
                                    checked={remember}
                                    onChange={(e) => setRemember(e.target.checked)}
                                />
                                <span className="auth-checkbox__mark"></span>
                                Remember me
                            </label>
                            <Link to="/forgot-password" className="auth-form__link">Forgot Password?</Link>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-lg auth-form__submit"
                            disabled={loading}
                            id="login-submit"
                        >
                            {loading ? (
                                <span className="auth-spinner"></span>
                            ) : (
                                'Sign In'
                            )}
                        </button>

                        <div className="auth-divider">
                            <span>or continue with</span>
                        </div>

                        <div className="auth-social-buttons">
                            <button type="button" className="btn btn-secondary auth-social-btn" id="google-login"
                                onClick={() => window.open('https://accounts.google.com/signin', '_blank')}>
                                <svg width="18" height="18" viewBox="0 0 18 18"><path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4" /><path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853" /><path d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z" fill="#FBBC05" /><path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z" fill="#EA4335" /></svg>
                                Google
                            </button>
                            <button type="button" className="btn btn-secondary auth-social-btn" id="linkedin-login"
                                onClick={() => window.open('https://www.linkedin.com/login', '_blank')}>
                                <svg width="18" height="18" viewBox="0 0 18 18" fill="#0A66C2"><path d="M15.335 15.335H12.67v-4.181c0-.997-.02-2.28-1.39-2.28-1.39 0-1.601 1.086-1.601 2.207v4.254H7.014V6.75h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.2 1.778 3.2 4.091v4.707zM4.003 5.575a1.546 1.546 0 110-3.092 1.546 1.546 0 010 3.092zM5.336 15.335H2.67V6.75h2.666v8.585zM16.67 0H1.329C.593 0 0 .593 0 1.325v15.35C0 17.407.593 18 1.325 18h15.35c.73 0 1.325-.593 1.325-1.325V1.325C18 .593 17.407 0 16.675 0h-.005z" /></svg>
                                LinkedIn
                            </button>
                        </div>

                        <p className="auth-form__footer-text">
                            Don't have an account? <Link to="/register" className="auth-form__link">Sign up</Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
