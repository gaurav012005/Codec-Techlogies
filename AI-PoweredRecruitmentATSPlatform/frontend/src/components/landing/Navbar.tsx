import { useState, useEffect } from 'react';
import './Navbar.css';

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`} id="navbar">
            <div className="navbar__inner container">
                <a href="/" className="navbar__logo" id="logo">
                    <span className="navbar__logo-icon">
                        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                            <circle cx="16" cy="16" r="14" stroke="url(#logo-grad)" strokeWidth="2.5" fill="none" />
                            <path d="M10 16l4 4 8-8" stroke="url(#logo-grad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            <defs>
                                <linearGradient id="logo-grad" x1="0" y1="0" x2="32" y2="32">
                                    <stop stopColor="#6c5ce7" />
                                    <stop offset="1" stopColor="#00cec9" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </span>
                    <span className="navbar__logo-text">HireAI</span>
                </a>

                <ul className={`navbar__links ${mobileOpen ? 'navbar__links--open' : ''}`} id="nav-links">
                    <li><a href="#features" className="navbar__link">Features</a></li>
                    <li><a href="#how-it-works" className="navbar__link">How It Works</a></li>
                    <li><a href="#pricing" className="navbar__link">Pricing</a></li>
                    <li><a href="#testimonials" className="navbar__link">Testimonials</a></li>
                </ul>

                <div className="navbar__actions">
                    <a href="/login" className="btn btn-ghost" id="login-btn">Login</a>
                    <a href="/register" className="btn btn-primary" id="cta-btn">Start Free Trial</a>
                </div>

                <button
                    className={`navbar__hamburger ${mobileOpen ? 'navbar__hamburger--open' : ''}`}
                    onClick={() => setMobileOpen(!mobileOpen)}
                    aria-label="Toggle menu"
                    id="hamburger-btn"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
