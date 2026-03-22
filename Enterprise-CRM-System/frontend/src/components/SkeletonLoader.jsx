const SkeletonLoader = ({ type = 'card', count = 3 }) => {
    if (type === 'table') {
        return (
            <div style={{ padding: 'var(--space-4)' }}>
                {Array.from({ length: count }).map((_, i) => (
                    <div key={i} style={{ display: 'flex', gap: 'var(--space-4)', marginBottom: 'var(--space-3)', alignItems: 'center' }}>
                        <div className="skeleton skeleton-circle" style={{ width: 32, height: 32, flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                            <div className="skeleton skeleton-text" style={{ width: `${60 + Math.random() * 30}%` }} />
                            <div className="skeleton skeleton-text-sm" />
                        </div>
                        <div className="skeleton" style={{ width: 60, height: 24, borderRadius: 'var(--radius-full)' }} />
                    </div>
                ))}
            </div>
        );
    }

    if (type === 'kpi') {
        return (
            <div className="kpi-grid" style={{ marginBottom: 'var(--space-6)' }}>
                {Array.from({ length: count }).map((_, i) => (
                    <div key={i} className="kpi-card" style={{ padding: 'var(--space-5)' }}>
                        <div className="skeleton skeleton-text-sm" style={{ width: '40%', marginBottom: 12 }} />
                        <div className="skeleton" style={{ width: '60%', height: 28, marginBottom: 8 }} />
                        <div className="skeleton skeleton-text-sm" style={{ width: '30%' }} />
                    </div>
                ))}
            </div>
        );
    }

    // Default: card grid
    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="skeleton skeleton-card" />
            ))}
        </div>
    );
};

export default SkeletonLoader;
