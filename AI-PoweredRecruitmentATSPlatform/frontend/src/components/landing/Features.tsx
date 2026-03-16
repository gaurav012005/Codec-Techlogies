import './Features.css';

const features = [
    {
        icon: '🧠',
        title: 'AI Resume Parsing',
        description: 'Extract deep data points instantly with 99.8% accuracy using our proprietary LLM models.',
        color: '#6c5ce7',
    },
    {
        icon: '🎯',
        title: 'Smart Skill Matching',
        description: 'Identify top talent based on project nuances and cultural fit beyond simple keyword matching.',
        color: '#00cec9',
    },
    {
        icon: '📊',
        title: 'Predictive Hiring Score',
        description: 'Forecast candidate performance and retention with data-driven predictive behavioral analysis.',
        color: '#fd79a8',
    },
    {
        icon: '🔍',
        title: 'Fraud Detection',
        description: 'Ensure total integrity with automated plagiarism checks and AI-generated content detection.',
        color: '#e17055',
    },
    {
        icon: '📋',
        title: 'Kanban Pipeline',
        description: 'Manage thousands of candidates with visual drag-and-drop clarity and automated stage triggers.',
        color: '#74b9ff',
    },
    {
        icon: '👥',
        title: 'Collaborative Hiring',
        description: 'Unified decision-making hub for teams with structured feedback loops and internal tagging.',
        color: '#fdcb6e',
    },
];

const Features = () => {
    return (
        <section className="features section" id="features">
            <div className="container">
                <div className="features__header">
                    <h2 className="features__title">
                        Powerful Features for <span className="gradient-text">Modern Teams</span>
                    </h2>
                    <p className="features__subtitle">
                        Our suite of AI tools designed to streamline your entire hiring process from sourcing to offer.
                    </p>
                </div>

                <div className="features__grid stagger-children">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="feature-card glass-card"
                            id={`feature-card-${index}`}
                            style={{ '--feature-color': feature.color } as React.CSSProperties}
                        >
                            <div className="feature-card__icon">
                                <span className="feature-card__icon-bg"></span>
                                <span className="feature-card__icon-emoji">{feature.icon}</span>
                            </div>
                            <h4 className="feature-card__title">{feature.title}</h4>
                            <p className="feature-card__desc">{feature.description}</p>
                            <div className="feature-card__glow"></div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;
