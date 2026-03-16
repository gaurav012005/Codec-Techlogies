import './HowItWorks.css';

const steps = [
    {
        num: '1',
        icon: '📝',
        title: 'Post',
        description: 'Create AI-optimized job descriptions and publish everywhere in one click.',
        color: '#6c5ce7',
    },
    {
        num: '2',
        icon: '🎯',
        title: 'Screen',
        description: 'Let our AI rank candidates based on technical skills and soft skill indicators.',
        color: '#00cec9',
    },
    {
        num: '3',
        icon: '💬',
        title: 'Review',
        description: 'Collaborative review with automated scheduling for interviews.',
        color: '#fd79a8',
    },
    {
        num: '4',
        icon: '💎',
        title: 'Hire',
        description: 'Send offers, manage background checks, and onboard seamlessly.',
        color: '#fdcb6e',
    },
];

const HowItWorks = () => {
    return (
        <section className="how-it-works section" id="how-it-works">
            <div className="container">
                <div className="how-it-works__header">
                    <h2>Streamline Your Workflow</h2>
                    <p className="text-muted">Four steps to a perfect hire.</p>
                </div>

                <div className="how-it-works__steps">
                    {steps.map((step, index) => (
                        <div key={index} className="step" id={`step-${index}`}>
                            {index > 0 && <div className="step__connector" />}
                            <div
                                className="step__circle"
                                style={{ '--step-color': step.color } as React.CSSProperties}
                            >
                                <span className="step__icon">{step.icon}</span>
                            </div>
                            <h5 className="step__title">{step.title}</h5>
                            <p className="step__desc">{step.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;
