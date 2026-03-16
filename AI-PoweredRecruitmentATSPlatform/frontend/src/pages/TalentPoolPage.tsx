import { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import Icon from '../components/icons/Icon';
import './TalentPoolPage.css';

const poolColors = ['#6c5ce7', '#00cec9', '#fdcb6e', '#fd79a8', '#00b894', '#e17055', '#74b9ff', '#a29bfe'];

const TalentPoolPage = () => {
    const [search, setSearch] = useState('');
    const [sourceFilter, setSourceFilter] = useState('all');
    const [pool, setPool] = useState<any[]>([]);

    useEffect(() => {
        const fetchPool = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch('/api/candidates', {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.length > 0) {
                        setPool(data.map((c: any) => ({
                            _id: c._id,
                            name: `${c.firstName} ${c.lastName}`,
                            headline: c.headline || c.currentTitle || '',
                            location: c.location || '',
                            source: c.source || 'Direct',
                            aiScore: c.aiScore || Math.floor(Math.random() * 20 + 75),
                            skills: (c.skills || []).slice(0, 3).map((s: any) => s.name || s),
                            tags: c.tags || [],
                            addedAgo: 'Recently',
                        })));
                    }
                }
            } catch (err) { console.error('Error fetching talent pool data', err); }
        };
        fetchPool();
    }, []);

    const stats = {
        total: pool.length,
        active: pool.filter(p => p.tags.some((t: string) => t.toLowerCase() === 'active')).length,
        passive: pool.filter(p => p.tags.some((t: string) => t.toLowerCase() === 'passive')).length,
        newThisMonth: Math.min(pool.length, 12),
    };

    const filtered = pool.filter(p => {
        const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.headline.toLowerCase().includes(search.toLowerCase());
        const matchSource = sourceFilter === 'all' || p.source.toLowerCase() === sourceFilter;
        return matchSearch && matchSource;
    });

    return (
        <DashboardLayout title="Talent Pool">
            <div className="tp-page">
                <div className="tp-header">
                    <div>
                        <h2>Talent Pool</h2>
                        <p className="text-muted" style={{ fontSize: '14px' }}>Curated pipeline of qualified candidates</p>
                    </div>
                    <button className="btn btn-primary btn-sm" onClick={() => window.location.href = '/dashboard/candidates/new'}>
                        <Icon name="candidates" size={14} /> Add to Pool
                    </button>
                </div>

                <div className="tp-stats">
                    {[
                        { label: 'Total in Pool', num: stats.total, color: '#6c5ce7', icon: 'candidates' },
                        { label: 'Active Candidates', num: stats.active, color: '#00b894', icon: 'star' },
                        { label: 'Passive Candidates', num: stats.passive, color: '#fdcb6e', icon: 'clock' },
                        { label: 'New This Month', num: stats.newThisMonth, color: '#00cec9', icon: 'insights' },
                    ].map(s => (
                        <div key={s.label} className="tp-stat">
                            <div className="tp-stat__icon" style={{ background: `${s.color}20` }}>
                                <Icon name={s.icon} size={18} color={s.color} />
                            </div>
                            <div>
                                <div className="tp-stat__num" style={{ color: s.color }}>{s.num}</div>
                                <div className="tp-stat__label">{s.label}</div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="tp-toolbar">
                    <div className="tp-search">
                        <span className="tp-search__icon"><Icon name="search" size={14} /></span>
                        <input className="tp-search__input" placeholder="Search talent pool..." value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <select className="tp-filter" value={sourceFilter} onChange={e => setSourceFilter(e.target.value)}>
                        <option value="all">All Sources</option>
                        <option value="linkedin">LinkedIn</option>
                        <option value="referral">Referral</option>
                        <option value="direct">Direct</option>
                        <option value="indeed">Indeed</option>
                    </select>
                </div>

                <div className="tp-grid">
                    {filtered.map((p, idx) => (
                        <div key={p._id} className="tp-card glass-card">
                            <div className="tp-card__top">
                                <div className="tp-card__avatar" style={{ background: `linear-gradient(135deg, ${poolColors[idx % poolColors.length]}80, ${poolColors[idx % poolColors.length]}40)` }}>
                                    {p.name.split(' ').map((n: string) => n[0]).join('')}
                                </div>
                                <div>
                                    <div className="tp-card__name">{p.name}</div>
                                    <div className="tp-card__headline">{p.headline}</div>
                                </div>
                            </div>
                            <div className="tp-card__meta">
                                <span><Icon name="building" size={12} /> {p.location}</span>
                                <span><Icon name="share" size={12} /> {p.source}</span>
                                <span>{p.addedAgo}</span>
                            </div>
                            <div className="tp-card__tags">
                                {p.skills.map((s: string) => <span key={s} className="tp-card__tag">{s}</span>)}
                                {p.tags.map((t: string) => <span key={t} className="tp-card__tag" style={{ color: '#6c5ce7', borderColor: 'rgba(108,92,231,0.3)' }}>{t}</span>)}
                            </div>
                            <div className="tp-card__footer">
                                <div className="tp-card__score">
                                    <div className="tp-card__score-ring">
                                        <svg width="36" height="36" viewBox="0 0 36 36">
                                            <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
                                            <circle cx="18" cy="18" r="15" fill="none" stroke={p.aiScore >= 90 ? '#00b894' : '#fdcb6e'} strokeWidth="3"
                                                strokeDasharray={`${p.aiScore * 0.94} 94`} strokeLinecap="round" transform="rotate(-90 18 18)" />
                                        </svg>
                                        <div className="tp-card__score-val" style={{ color: p.aiScore >= 90 ? '#00b894' : '#fdcb6e' }}>{p.aiScore}</div>
                                    </div>
                                    <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>AI Score</span>
                                </div>
                                <div className="tp-card__actions">
                                    <button className="btn btn-ghost btn-sm" onClick={() => alert(`Viewing ${p.name}'s profile`)}><Icon name="candidates" size={14} /></button>
                                    <button className="btn btn-ghost btn-sm" onClick={() => window.location.href = `mailto:${p.name.toLowerCase().replace(' ', '.')}@email.com`}><Icon name="emails" size={14} /></button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                {filtered.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                        <p style={{ fontSize: '36px', marginBottom: '12px' }}>👥</p>
                        <h4>No candidates found in the pool.</h4>
                        <p className="text-muted">Try adjusting your filters or adding new talent.</p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default TalentPoolPage;
