import { useState, useEffect } from 'react';
import './Testimonials.css';

const testimonials = [
    {
        quote: "HireAI transformed our hiring pipeline. We went from spending 40+ hours per week on screening to just 5 hours — with better hires.",
        name: 'Sarah Chen',
        title: 'VP of People, TechFlow',
        avatar: '👩‍💼',
        company: 'TechFlow',
    },
    {
        quote: "The AI matching is incredible. Our offer acceptance rate jumped from 72% to 94% because we're now reaching the right candidates faster.",
        name: 'Marcus Rodriguez',
        title: 'Head of Talent, CloudScale',
        avatar: '👨‍💻',
        company: 'CloudScale',
    },
    {
        quote: "Fraud detection caught 3 fabricated resumes in our first month. The predictive hiring scores have been spot-on for retention too.",
        name: 'Priya Patel',
        title: 'CHRO, NexusAI',
        avatar: '👩‍🔬',
        company: 'NexusAI',
    },
    {
        quote: "The collaborative hiring dashboard ended our endless email chains. Now the entire team evaluates candidates in one place with full transparency.",
        name: 'James Wilson',
        title: 'Engineering Director, DevPulse',
        avatar: '👨‍🏫',
        company: 'DevPulse',
    },
    {
        quote: "We reduced our cost-per-hire by 60% and time-to-hire from 45 days to 14. HireAI pays for itself in the first week.",
        name: 'Elena Vasquez',
        title: 'COO, DataCore',
        avatar: '👩‍💻',
        company: 'DataCore',
    },
];

const Testimonials = () => {
    const [active, setActive] = useState(0);
    const [isAutoPlay, setIsAutoPlay] = useState(true);

    useEffect(() => {
        if (!isAutoPlay) return;
        const interval = setInterval(() => {
            setActive((prev) => (prev + 1) % testimonials.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [isAutoPlay]);

    const handleDotClick = (index: number) => {
        setActive(index);
        setIsAutoPlay(false);
        // Resume autoplay after 10s
        setTimeout(() => setIsAutoPlay(true), 10000);
    };

    return (
        <section className="testimonials section" id="testimonials">
            <div className="container">
                <div className="testimonials__header">
                    <h2>Loved by Hiring Teams <span className="gradient-text">Worldwide</span></h2>
                    <p className="text-muted">See what industry leaders are saying about HireAI.</p>
                </div>

                <div className="testimonials__carousel">
                    <div className="testimonials__track" style={{ transform: `translateX(-${active * 100}%)` }}>
                        {testimonials.map((testimonial, index) => (
                            <div key={index} className="testimonial-card" id={`testimonial-${index}`}>
                                <div className="testimonial-card__inner glass-card">
                                    <div className="testimonial-card__quote-mark">"</div>
                                    <blockquote className="testimonial-card__quote">
                                        {testimonial.quote}
                                    </blockquote>
                                    <div className="testimonial-card__author">
                                        <div className="testimonial-card__avatar">{testimonial.avatar}</div>
                                        <div className="testimonial-card__info">
                                            <div className="testimonial-card__name">{testimonial.name}</div>
                                            <div className="testimonial-card__title">{testimonial.title}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="testimonials__dots">
                    {testimonials.map((_, index) => (
                        <button
                            key={index}
                            className={`testimonials__dot ${index === active ? 'testimonials__dot--active' : ''}`}
                            onClick={() => handleDotClick(index)}
                            aria-label={`Go to testimonial ${index + 1}`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
