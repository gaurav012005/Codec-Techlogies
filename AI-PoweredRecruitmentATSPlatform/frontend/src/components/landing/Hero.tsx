import { useEffect, useRef } from 'react';
import './Hero.css';

const PARTICLES = Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    left: `${(i * 17 + 3) % 100}%`,
    top: `${(i * 23 + 7) % 100}%`,
    delay: `${(i * 0.37) % 5}s`,
    duration: `${3 + (i * 0.51) % 4}s`,
}));

const Hero = () => {
    const heroRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!heroRef.current) return;
            const { clientX, clientY } = e;
            const { innerWidth, innerHeight } = window;
            const x = (clientX / innerWidth - 0.5) * 20;
            const y = (clientY / innerHeight - 0.5) * 20;

            heroRef.current.style.setProperty('--mouse-x', `${x}px`);
            heroRef.current.style.setProperty('--mouse-y', `${y}px`);
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <section className="hero" ref={heroRef} id="hero">
            {/* Animated background */}
            <div className="hero__bg">
                <div className="hero__orb hero__orb--1"></div>
                <div className="hero__orb hero__orb--2"></div>
                <div className="hero__orb hero__orb--3"></div>
                <div className="hero__particles">
                    {PARTICLES.map(p => (
                        <span key={p.id} className="hero__particle" style={{
                            left: p.left,
                            top: p.top,
                            animationDelay: p.delay,
                            animationDuration: p.duration,
                        }}></span>
                    ))}
                </div>
            </div>

            <div className="hero__content container">
                <div className="hero__badge animate-fade-up" style={{ animationDelay: '0.1s' }}>
                    <span className="hero__badge-dot"></span>
                    🚀 Next-Gen Recruitment AI
                </div>

                <h1 className="hero__title animate-fade-up" style={{ animationDelay: '0.3s' }}>
                    Hire <span className="gradient-text">Smarter.</span>
                    <br />
                    Hire <span className="gradient-text">Faster.</span>
                </h1>

                <p className="hero__subtitle animate-fade-up" style={{ animationDelay: '0.5s' }}>
                    Revolutionize your recruitment with AI-powered talent matching,
                    automated ATS workflows, and predictive candidate scoring.
                </p>

                <div className="hero__ctas animate-fade-up" style={{ animationDelay: '0.7s' }}>
                    <a href="/register" className="btn btn-primary btn-lg hero__cta-primary" id="hero-cta-trial">
                        Start Free Trial
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </a>
                    <a href="#demo" className="btn btn-secondary btn-lg hero__cta-demo" id="hero-cta-demo">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
                            <path d="M6.5 5.5l4 2.5-4 2.5V5.5z" fill="currentColor" />
                        </svg>
                        Watch Demo
                    </a>
                </div>

                {/* Dashboard mockup */}
                <div className="hero__mockup animate-fade-up" style={{ animationDelay: '0.9s' }}>
                    <div className="hero__mockup-glow"></div>
                    <div className="hero__mockup-window">
                        <div className="hero__mockup-topbar">
                            <div className="hero__mockup-dots">
                                <span></span><span></span><span></span>
                            </div>
                            <div className="hero__mockup-url">hireai.com/dashboard</div>
                        </div>
                        <div className="hero__mockup-body">
                            <div className="hero__mockup-sidebar">
                                <div className="hero__mockup-sidebar-item active"></div>
                                <div className="hero__mockup-sidebar-item"></div>
                                <div className="hero__mockup-sidebar-item"></div>
                                <div className="hero__mockup-sidebar-item"></div>
                                <div className="hero__mockup-sidebar-item"></div>
                            </div>
                            <div className="hero__mockup-main">
                                <div className="hero__mockup-cards">
                                    <div className="hero__mockup-stat-card" style={{ '--card-color': '#6c5ce7' } as React.CSSProperties}>
                                        <div className="hero__mockup-stat-num">24</div>
                                        <div className="hero__mockup-stat-label">Active Jobs</div>
                                    </div>
                                    <div className="hero__mockup-stat-card" style={{ '--card-color': '#00cec9' } as React.CSSProperties}>
                                        <div className="hero__mockup-stat-num">1,284</div>
                                        <div className="hero__mockup-stat-label">Candidates</div>
                                    </div>
                                    <div className="hero__mockup-stat-card" style={{ '--card-color': '#fd79a8' } as React.CSSProperties}>
                                        <div className="hero__mockup-stat-num">8</div>
                                        <div className="hero__mockup-stat-label">Interviews</div>
                                    </div>
                                    <div className="hero__mockup-stat-card" style={{ '--card-color': '#fdcb6e' } as React.CSSProperties}>
                                        <div className="hero__mockup-stat-num">14.2d</div>
                                        <div className="hero__mockup-stat-label">Avg. TTH</div>
                                    </div>
                                </div>
                                <div className="hero__mockup-pipeline">
                                    <div className="hero__mockup-bar" style={{ width: '90%', background: '#6c5ce7' }}></div>
                                    <div className="hero__mockup-bar" style={{ width: '65%', background: '#00cec9' }}></div>
                                    <div className="hero__mockup-bar" style={{ width: '35%', background: '#fd79a8' }}></div>
                                    <div className="hero__mockup-bar" style={{ width: '15%', background: '#fdcb6e' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Trusted by */}
                <div className="hero__trust animate-fade-up" style={{ animationDelay: '1.1s' }}>
                    <p className="hero__trust-label">TRUSTED BY LEADING TECH TEAMS</p>
                    <div className="hero__trust-logos">
                        {['TechFlow', 'CloudScale', 'NexusAI', 'DevPulse', 'DataCore'].map((name) => (
                            <span key={name} className="hero__trust-logo">{name}</span>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
