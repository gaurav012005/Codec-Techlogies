import './CTA.css';

const CTA = () => {
    return (
        <section className="cta-section section" id="cta-section">
            <div className="container">
                <div className="cta-section__inner">
                    <div className="cta-section__bg"></div>
                    <div className="cta-section__content">
                        <h2>Ready to Transform Your Hiring?</h2>
                        <p className="cta-section__desc">
                            Join 500+ companies already using HireAI to hire smarter and faster.
                        </p>
                        <a href="/register" className="btn btn-primary btn-lg cta-section__btn" id="final-cta">
                            Start Free Trial
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CTA;
