import { Flame, Sun, Snowflake } from 'lucide-react';

const getScoreConfig = (score) => {
    if (score >= 80) return { label: 'Hot', icon: Flame, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.12)', barColor: '#ef4444' };
    if (score >= 40) return { label: 'Warm', icon: Sun, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)', barColor: '#f59e0b' };
    return { label: 'Cold', icon: Snowflake, color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.12)', barColor: '#06b6d4' };
};

const LeadScoreBadge = ({ score = 0, showBar = true, size = 'default' }) => {
    const config = getScoreConfig(score);
    const Icon = config.icon;
    const isSmall = size === 'small';

    return (
        <div className="lead-score-badge-wrapper">
            <div
                className="lead-score-badge"
                style={{
                    background: config.bg,
                    color: config.color,
                    padding: isSmall ? '1px 6px' : '2px 8px',
                    fontSize: isSmall ? '10px' : '11px',
                }}
            >
                <Icon size={isSmall ? 10 : 12} />
                <span style={{ fontWeight: 700 }}>{score}</span>
                <span style={{ fontWeight: 600, opacity: 0.8 }}>{config.label}</span>
            </div>
            {showBar && (
                <div className="lead-score-bar">
                    <div
                        className="lead-score-bar-fill"
                        style={{
                            width: `${Math.min(100, score)}%`,
                            background: `linear-gradient(90deg, ${config.barColor}80, ${config.barColor})`,
                        }}
                    />
                </div>
            )}
        </div>
    );
};

export default LeadScoreBadge;
