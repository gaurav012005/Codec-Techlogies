// ============================================
// Landing / Home Page
// ============================================

import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { HiShieldCheck, HiAcademicCap, HiChartBar, HiLightningBolt } from 'react-icons/hi';
import { motion } from 'framer-motion';
import { HeroGeometric } from '../../components/ui/shape-landing-hero';
import './Landing.css';

const features = [
    {
        icon: <HiShieldCheck />,
        title: 'AI Proctoring',
        desc: 'Real-time webcam monitoring with face detection and tab-switch alerts.',
    },
    {
        icon: <HiAcademicCap />,
        title: 'Smart Exams',
        desc: 'Adaptive difficulty engine that adjusts questions to your level.',
    },
    {
        icon: <HiChartBar />,
        title: 'Rich Analytics',
        desc: 'Detailed performance dashboards with exportable reports.',
    },
    {
        icon: <HiLightningBolt />,
        title: 'Auto Grading',
        desc: 'Instant scoring for MCQ, True/False, and fill-in-the-blank questions.',
    },
];

// Line-level animation — entire line slides up at once, no word splitting
const lineAnim = {
    hidden: { opacity: 0, y: 50, filter: 'blur(12px)' },
    show: {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        transition: { ease: 'easeOut', duration: 0.7 },
    },
};

const descriptionText =
    'Conduct tamper-proof remote examinations with webcam proctoring, adaptive difficulty, and instant analytics — all in one platform.';

const typeWriterContainer = {
    hidden: { opacity: 1 },
    show: {
        opacity: 1,
        transition: {
            delayChildren: 2.4,
            staggerChildren: 0.022,
        },
    },
};

const letterAnim = {
    hidden: { opacity: 0 },
    show: { opacity: 1 },
};

const Landing = () => {
    const { isAuthenticated } = useAuth();

    return (
        <div className="landing">
            {/* Nav */}
            <nav className="landing-nav">
                <div className="container mx-auto flex justify-between items-center px-4 md:px-8 max-w-7xl">
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

            {/* Hero */}
            <HeroGeometric
                badge="🚀 Next-Gen Exam Platform"
                title1="Secure Online Exams"
                title2="Powered by AI"
                actionBtns={
                    <>
                        <Link to="/register" className="btn btn-primary btn-lg" style={{ minWidth: '180px' }}>
                            Start Free Trial
                        </Link>
                        <Link to="/login" className="btn btn-secondary btn-lg" style={{ minWidth: '180px' }}>
                            Sign In →
                        </Link>
                    </>
                }
            />

            {/* Features */}
            <section className="landing-features">
                <div className="container">
                    <h2 className="heading-lg" style={{ textAlign: 'center', marginBottom: '48px' }}>
                        Everything You Need
                    </h2>
                    <div className="features-grid">
                        {features.map((f, i) => (
                            <div
                                key={i}
                                className="feature-card card animate-fade-in"
                                style={{ animationDelay: `${i * 0.1}s` }}
                            >
                                <div className="feature-icon">{f.icon}</div>
                                <h3 className="heading-md">{f.title}</h3>
                                <p className="text-muted">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="container" style={{ textAlign: 'center' }}>
                    <p className="text-muted text-sm">
                        © 2026 ExamGuard. Built for secure, scalable online examinations.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
