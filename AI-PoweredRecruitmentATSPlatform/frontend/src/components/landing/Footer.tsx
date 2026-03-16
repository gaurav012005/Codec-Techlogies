import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer" id="footer">
            <div className="container">
                <div className="footer__top">
                    <div className="footer__brand">
                        <a href="/" className="footer__logo">
                            <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                                <circle cx="16" cy="16" r="14" stroke="url(#footer-grad)" strokeWidth="2.5" fill="none" />
                                <path d="M10 16l4 4 8-8" stroke="url(#footer-grad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                <defs>
                                    <linearGradient id="footer-grad" x1="0" y1="0" x2="32" y2="32">
                                        <stop stopColor="#6c5ce7" />
                                        <stop offset="1" stopColor="#00cec9" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <span className="footer__logo-text">HireAI</span>
                        </a>
                        <p className="footer__tagline">
                            Redefining the standard of recruitment through artificial intelligence and human-centric design.
                        </p>
                        <div className="footer__social">
                            <a href="#" className="footer__social-link" aria-label="Twitter">𝕏</a>
                            <a href="#" className="footer__social-link" aria-label="LinkedIn">in</a>
                            <a href="#" className="footer__social-link" aria-label="GitHub">⌥</a>
                        </div>
                    </div>

                    <div className="footer__links-group">
                        <h5 className="footer__links-title">Product</h5>
                        <ul className="footer__links">
                            <li><a href="#features">Features</a></li>
                            <li><a href="#pricing">Pricing</a></li>
                            <li><a href="#">Integrations</a></li>
                            <li><a href="#">Changelog</a></li>
                            <li><a href="#">Docs</a></li>
                        </ul>
                    </div>

                    <div className="footer__links-group">
                        <h5 className="footer__links-title">Company</h5>
                        <ul className="footer__links">
                            <li><a href="#">About Us</a></li>
                            <li><a href="#">Careers</a></li>
                            <li><a href="#">Blog</a></li>
                            <li><a href="#">Privacy</a></li>
                            <li><a href="#">Terms</a></li>
                        </ul>
                    </div>

                    <div className="footer__links-group">
                        <h5 className="footer__links-title">Newsletter</h5>
                        <p className="footer__newsletter-desc">
                            Stay updated with the latest in recruitment tech.
                        </p>
                        <div className="footer__newsletter-form">
                            <input
                                type="email"
                                className="input footer__newsletter-input"
                                placeholder="Email address"
                                id="newsletter-email"
                            />
                            <button className="btn btn-primary footer__newsletter-btn" id="newsletter-submit">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="footer__bottom">
                    <p>© 2026 HireAI Inc. All rights reserved. Designed for the future of work.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
