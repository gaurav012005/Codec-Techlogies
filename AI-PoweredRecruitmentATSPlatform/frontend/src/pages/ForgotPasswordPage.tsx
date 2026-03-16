import { useState } from 'react';
import { Link } from 'react-router-dom';
import '../components/auth/Auth.css';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to send reset link');

            setSent(true);
        } catch (err: any) {
            setError(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page auth-page--centered">
            <div className="auth-page__mesh auth-page__mesh--full">
                <div className="auth-mesh-orb auth-mesh-orb--1"></div>
                <div className="auth-mesh-orb auth-mesh-orb--2"></div>
            </div>

            <div className="auth-forgot-card glass-card">
                <div className="auth-forgot-card__icon">
                    <span>🔒</span>
                </div>

                {sent ? (
                    <div className="auth-forgot-card__success">
                        <div className="auth-forgot-card__success-icon">✅</div>
                        <h3>Check Your Email</h3>
                        <p className="text-muted">
                            We've sent a password reset link to <strong>{email}</strong>.
                            Please check your inbox and follow the instructions.
                        </p>
                        <Link to="/login" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '24px' }}>
                            Back to Login
                        </Link>
                    </div>
                ) : (
                    <>
                        <h3 className="auth-forgot-card__title">Reset Password</h3>
                        <p className="auth-forgot-card__desc text-muted">
                            Enter your email address and we'll send you a link to reset your password.
                        </p>

                        {error && (
                            <div className="auth-form__error" id="forgot-error">
                                <span>⚠️</span> {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="auth-form" id="forgot-form">
                            <div className="auth-field">
                                <label className="auth-field__label">Email Address</label>
                                <div className="input-with-icon">
                                    <span className="input-icon">✉️</span>
                                    <input
                                        type="email"
                                        className="input auth-input"
                                        placeholder="you@company.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        id="forgot-email"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary btn-lg auth-form__submit"
                                disabled={loading}
                                id="forgot-submit"
                            >
                                {loading ? <span className="auth-spinner"></span> : 'Send Reset Link'}
                            </button>
                        </form>

                        <Link to="/login" className="auth-form__back-link">
                            ← Back to login
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
