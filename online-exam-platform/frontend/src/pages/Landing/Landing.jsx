// ============================================
// Landing / Home Page — Enhanced Hero Animation
// ============================================

import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Landing.css';

const features = [
    {
        icon: '🛡️',
        title: 'AI Proctoring',
        desc: 'Real-time webcam monitoring with face detection, multi-face alerts, and tab-switch tracking.',
        tag: 'Feature 8–10',
        color: 'indigo',
    },
    {
        icon: '🎓',
        title: 'Smart Exams',
        desc: 'Adaptive difficulty engine that dynamically adjusts questions based on student performance.',
        tag: 'Feature 11',
        color: 'emerald',
    },
    {
        icon: '📊',
        title: 'Rich Analytics',
        desc: 'Detailed performance dashboards with exportable reports, topper boards, and question stats.',
        tag: 'Feature 12',
        color: 'amber',
    },
    {
        icon: '⚡',
        title: 'Auto Grading',
        desc: 'Instant scoring for MCQ, True/False, and fill-in-the-blank questions with negative marking.',
        tag: 'Feature 7',
        color: 'indigo',
    },
    {
        icon: '📝',
        title: 'Question Bank',
        desc: 'Rich-text editor with MCQ, short answer, and fill-in-the-blank questions. Full CRUD support.',
        tag: 'Feature 4',
        color: 'emerald',
    },
    {
        icon: '🔔',
        title: 'Live Notifications',
        desc: 'Real-time Socket.IO toasts, email reminders, and exam-countdown alerts for all users.',
        tag: 'Feature 14',
        color: 'amber',
    },
];

const Landing = () => {
    const { isAuthenticated } = useAuth();

    return (
        <div className="landing">
            {/* Nav */}
            <nav className="landing-nav">
                <div className="container flex-between">
                    <div className="landing-logo">
                        <span className="logo-icon">🛡️</span>
                        <span className="logo-text text-gradient">ExamGuard</span>
                    </div>
                    <div className="landing-nav-links">
                        {isAuthenticated ? (
                            <Link to="/dashboard" className="btn btn-primary">Dashboard</Link>
                        ) : (
                            <>
                                <Link to="/login" className="btn btn-ghost">Log In</Link>
                                <Link to="/register" className="btn btn-primary">Get Started</Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* ===== HERO ===== */}
            <section className="landing-hero">
                <div className="container">
                    <div className="hero-content">

                        {/* Line 1: Badge — animates at 0.3s */}
                        <span className="hero-badge anim-line anim-delay-1">
                            🚀 Next-Gen Exam Platform
                        </span>

                        {/* Lines 2-3: Main heading */}
                        <h1 className="heading-xl hero-title">
                            <span className="anim-word anim-delay-2">Secure</span>{' '}
                            <span className="anim-word anim-delay-3">Online</span>{' '}
                            <span className="anim-word anim-delay-4">Exams</span>
                            <br />
                            {/* "Powered by AI" gradient */}
                            <span className="hero-gradient-line anim-line anim-delay-5">
                                <span className="text-gradient hero-ai-text">Powered by AI</span>
                            </span>
                        </h1>

                        {/* Line 4: Description — typewriter at ~6.5s */}
                        <p className="hero-description anim-line anim-delay-6">
                            <span className="typewriter-text">
                                Conduct tamper-proof remote examinations with webcam proctoring,
                                adaptive difficulty, and instant analytics — all in one platform.
                            </span>
                        </p>

                        {/* Line 5: Buttons — slide up at ~8.5s */}
                        <div className="hero-actions anim-line anim-delay-7">
                            <Link to="/register" className="btn btn-primary btn-lg hero-btn-pulse">
                                Start Free Trial
                            </Link>
                            <Link to="/login" className="btn btn-secondary btn-lg">
                                Sign In →
                            </Link>
                        </div>

                        {/* Stats bar — animates at ~9.5s */}
                        <div className="hero-stats">
                            <div className="hero-stat">
                                <span className="hero-stat-value">10K+</span>
                                <span className="hero-stat-label">Exams Conducted</span>
                            </div>
                            <div className="hero-stat-divider" />
                            <div className="hero-stat">
                                <span className="hero-stat-value">99.9%</span>
                                <span className="hero-stat-label">Uptime</span>
                            </div>
                            <div className="hero-stat-divider" />
                            <div className="hero-stat">
                                <span className="hero-stat-value">50K+</span>
                                <span className="hero-stat-label">Students Proctored</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Background effects */}
                <div className="hero-glow" />
                <div className="hero-glow-2" />
                <div className="hero-glow-3" />
                <div className="hero-scan-line" />
                <div className="hero-particles">
                    <div className="particle particle-1" />
                    <div className="particle particle-2" />
                    <div className="particle particle-3" />
                    <div className="particle particle-4" />
                    <div className="particle particle-5" />
                    <div className="particle particle-6" />
                    <div className="particle particle-7" />
                    <div className="particle particle-8" />
                </div>
            </section>

            {/* ===== FEATURES ===== */}
            <section className="landing-features">
                <div className="container">
                    <p className="features-section-label">Platform Capabilities</p>
                    <h2 className="features-section-title">Everything You Need</h2>
                    <p className="features-section-desc">
                        A complete end-to-end examination suite — from question creation
                        to AI-powered proctoring and detailed analytics.
                    </p>
                    <div className="features-grid">
                        {features.map((f, i) => (
                            <div
                                key={i}
                                className="feature-card animate-fade-in"
                                style={{ animationDelay: `${0.1 + i * 0.12}s` }}
                            >
                                <div className="feature-icon-wrap">{f.icon}</div>
                                <h3>{f.title}</h3>
                                <p>{f.desc}</p>
                                <span className="feature-tag">{f.tag}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== CTA ===== */}
            <section className="landing-cta">
                <div className="container">
                    <span className="cta-badge">✦ Start Today — Free</span>
                    <h2 className="cta-title">Ready to Secure Your Exams?</h2>
                    <p className="cta-desc">
                        Join thousands of institutions running tamper-proof, AI-monitored
                        examinations with instant results.
                    </p>
                    <div className="cta-actions">
                        <Link to="/register" className="btn btn-primary btn-lg">
                            Create Free Account
                        </Link>
                        <Link to="/login" className="btn btn-secondary btn-lg">
                            Sign In →
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="container">
                    <div className="footer-inner">
                        <div className="footer-logo">
                            <span style={{ fontSize: '1.2rem' }}>🛡️</span>
                            <span className="text-gradient" style={{ fontWeight: 700, fontSize: '1rem' }}>ExamGuard</span>
                        </div>
                        <p className="text-muted text-sm" style={{ textAlign: 'center' }}>
                            © 2026 ExamGuard. Built for secure, scalable online examinations.
                        </p>
                        <div className="footer-links">
                            <a href="#">Privacy</a>
                            <a href="#">Terms</a>
                            <a href="#">Support</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
