import { useEffect, useRef, useState } from 'react';
import './Stats.css';

const stats = [
    { value: 50000, label: 'HIRES MADE', suffix: '+', prefix: '', color: '#6c5ce7' },
    { value: 85, label: 'SOURCING SPEED', suffix: '%', prefix: '', color: '#00cec9' },
    { value: 3, label: 'QUALITY HIRES', suffix: 'x', prefix: '', color: '#fd79a8' },
    { value: 500, label: 'ENTERPRISE CLIENTS', suffix: '+', prefix: '', color: '#fdcb6e' },
];

const useCountUp = (end: number, duration: number = 2000, start: boolean = false) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!start) return;
        let startTime: number | null = null;
        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // ease out cubic
            setCount(Math.floor(eased * end));
            if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }, [end, duration, start]);

    return count;
};

const StatItem = ({ value, label, suffix, color, isVisible }: {
    value: number; label: string; suffix: string; color: string; isVisible: boolean;
}) => {
    const count = useCountUp(value, 2000, isVisible);

    return (
        <div className="stat-item" style={{ '--stat-color': color } as React.CSSProperties}>
            <div className="stat-item__value">
                {value >= 1000 ? `${Math.floor(count / 1000)}K` : count}{suffix}
            </div>
            <div className="stat-item__label">{label}</div>
        </div>
    );
};

const Stats = () => {
    const sectionRef = useRef<HTMLElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.3 }
        );

        if (sectionRef.current) observer.observe(sectionRef.current);
        return () => observer.disconnect();
    }, []);

    return (
        <section className="stats section" ref={sectionRef} id="stats">
            <div className="container">
                <div className="stats__grid">
                    {stats.map((stat, index) => (
                        <StatItem key={index} {...stat} isVisible={isVisible} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Stats;
