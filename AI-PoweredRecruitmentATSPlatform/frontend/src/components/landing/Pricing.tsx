import './Pricing.css';

const plans = [
    {
        name: 'Free',
        price: '$0',
        period: '/mo',
        features: [
            { text: '3 active jobs', included: true },
            { text: 'Basic AI parsing', included: true },
            { text: '1 team seat', included: true },
            { text: 'Advanced AI matching', included: false },
            { text: 'Fraud detection tools', included: false },
        ],
        cta: 'Get Started',
        popular: false,
    },
    {
        name: 'Pro',
        price: '$149',
        period: '/mo',
        features: [
            { text: 'Unlimited jobs', included: true },
            { text: 'Advanced AI matching', included: true },
            { text: '5 team seats', included: true },
            { text: 'Fraud detection tools', included: true },
            { text: 'Priority support', included: true },
        ],
        cta: 'Go Pro',
        popular: true,
    },
    {
        name: 'Enterprise',
        price: 'Custom',
        period: '',
        features: [
            { text: 'Custom integrations', included: true },
            { text: 'Dedicated account manager', included: true },
            { text: 'Unlimited seats', included: true },
            { text: 'API Access', included: true },
            { text: 'SLA guarantee', included: true },
        ],
        cta: 'Contact Sales',
        popular: false,
    },
];

const Pricing = () => {
    return (
        <section className="pricing section" id="pricing">
            <div className="container">
                <div className="pricing__header">
                    <h2>Transparent Pricing</h2>
                    <p className="text-muted">Choose the plan that fits your growth.</p>
                </div>

                <div className="pricing__grid">
                    {plans.map((plan, index) => (
                        <div
                            key={index}
                            className={`pricing-card glass-card ${plan.popular ? 'pricing-card--popular' : ''}`}
                            id={`pricing-${plan.name.toLowerCase()}`}
                        >
                            {plan.popular && (
                                <div className="pricing-card__badge">MOST POPULAR</div>
                            )}
                            <h4 className="pricing-card__name">{plan.name}</h4>
                            <div className="pricing-card__price">
                                <span className="pricing-card__amount">{plan.price}</span>
                                <span className="pricing-card__period">{plan.period}</span>
                            </div>
                            <ul className="pricing-card__features">
                                {plan.features.map((feature, fi) => (
                                    <li key={fi} className={`pricing-card__feature ${!feature.included ? 'pricing-card__feature--excluded' : ''}`}>
                                        <span className="pricing-card__feature-icon">
                                            {feature.included ? '✓' : '✕'}
                                        </span>
                                        {feature.text}
                                    </li>
                                ))}
                            </ul>
                            <a
                                href="/register"
                                className={`btn ${plan.popular ? 'btn-primary' : 'btn-secondary'} btn-lg pricing-card__cta`}
                            >
                                {plan.cta}
                            </a>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Pricing;
