import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import './CandidatesPage.css';

interface Candidate {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    headline: string;
    location: string;
    source: string;
    aiScore: number;
    skills: { name: string; level: string }[];
    tags: string[];
    rating: number;
    appliedJobs: { job: { title: string }; stage: string }[];
    createdAt: string;
}

const stageColors: Record<string, string> = {
    sourced: '#6c5ce7', applied: '#74b9ff', screening: '#00cec9',
    interview: '#fdcb6e', offered: '#fd79a8', hired: '#00b894', rejected: '#e17055',
};

const CandidatesPage = () => {
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [search, setSearch] = useState('');
    const [sourceFilter, setSourceFilter] = useState('all');
    const [sortBy, setSortBy] = useState('aiScore');

    // Fetch real candidates from API and merge with mock data
    useEffect(() => {
        const fetchCandidates = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch('/api/candidates', {
                    headers: token ? { 'Authorization': `Bearer ${token}` } : {},
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.candidates && data.candidates.length > 0) {
                        const apiCandidates = data.candidates.map((c: any) => ({
                            ...c,
                            _id: c._id || c.id,
                            headline: c.headline || '',
                            skills: c.skills || [],
                            tags: c.tags || [],
                            appliedJobs: c.appliedJobs || [],
                            aiScore: c.aiScore || 0,
                            rating: c.rating || 0,
                        }));
                        setCandidates(apiCandidates);
                    }
                }
            } catch (err) {
                console.log('Error fetching candidates data', err);
            }
        };
        fetchCandidates();
    }, []);

    const filtered = candidates
        .filter(c => {
            const matchSearch = !search || `${c.firstName} ${c.lastName} ${c.headline}`.toLowerCase().includes(search.toLowerCase());
            const matchSource = sourceFilter === 'all' || c.source === sourceFilter;
            return matchSearch && matchSource;
        })
        .sort((a, b) => sortBy === 'aiScore' ? b.aiScore - a.aiScore : sortBy === 'name' ? a.firstName.localeCompare(b.firstName) : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const getScoreColor = (score: number) => score >= 90 ? '#00b894' : score >= 80 ? '#00cec9' : score >= 70 ? '#fdcb6e' : '#e17055';

    return (
        <DashboardLayout title="Candidates">
            <div className="cands-page">
                <div className="cands-page__header">
                    <div>
                        <h2>Candidates</h2>
                        <p className="text-muted" style={{ fontSize: '14px' }}>{candidates.length} candidates in your talent pipeline</p>
                    </div>
                    <Link to="/dashboard/candidates/new" className="btn btn-primary" id="add-candidate-btn">+ Add Candidate</Link>
                </div>

                <div className="cands-toolbar">
                    <div className="cands-search">
                        <span>🔍</span>
                        <input type="text" placeholder="Search candidates..." value={search} onChange={e => setSearch(e.target.value)} id="cands-search" />
                    </div>
                    <div className="cands-filters">
                        <select className="cands-filter-select" value={sourceFilter} onChange={e => setSourceFilter(e.target.value)}>
                            <option value="all">All Sources</option>
                            <option value="linkedin">LinkedIn</option>
                            <option value="referral">Referral</option>
                            <option value="indeed">Indeed</option>
                            <option value="direct">Direct</option>
                            <option value="job_board">Job Board</option>
                        </select>
                        <select className="cands-filter-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                            <option value="aiScore">AI Score (High→Low)</option>
                            <option value="name">Name (A→Z)</option>
                            <option value="recent">Most Recent</option>
                        </select>
                    </div>
                </div>

                <div className="cands-list">
                    {filtered.map(c => (
                        <Link to={`/dashboard/candidates/${c._id}`} key={c._id} className="cand-row glass-card" id={`cand-${c._id}`}>
                            <div className="cand-row__left">
                                <div className="cand-avatar">
                                    {c.firstName[0]}{c.lastName[0]}
                                </div>
                                <div className="cand-info">
                                    <div className="cand-info__name">{c.firstName} {c.lastName}</div>
                                    <div className="cand-info__headline">{c.headline}</div>
                                    <div className="cand-info__meta">
                                        <span>📍 {c.location}</span>
                                        <span>📧 {c.email}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="cand-row__skills">
                                {c.skills.slice(0, 3).map((s, i) => (
                                    <span key={i} className="cand-skill">{s.name}</span>
                                ))}
                                {c.skills.length > 3 && <span className="cand-skill cand-skill--more">+{c.skills.length - 3}</span>}
                            </div>

                            <div className="cand-row__stage">
                                {c.appliedJobs[0] && (
                                    <>
                                        <span className="cand-stage" style={{ background: `${stageColors[c.appliedJobs[0].stage]}20`, color: stageColors[c.appliedJobs[0].stage] }}>
                                            {c.appliedJobs[0].stage}
                                        </span>
                                        <span className="cand-job-title">{c.appliedJobs[0].job.title}</span>
                                    </>
                                )}
                            </div>

                            <div className="cand-row__score">
                                <div className="cand-score-ring" style={{ '--score-color': getScoreColor(c.aiScore), '--score-pct': `${c.aiScore}%` } as React.CSSProperties}>
                                    <svg viewBox="0 0 40 40">
                                        <circle cx="20" cy="20" r="17" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
                                        <circle cx="20" cy="20" r="17" fill="none" stroke={getScoreColor(c.aiScore)} strokeWidth="3"
                                            strokeDasharray={`${c.aiScore * 1.07} 107`} strokeLinecap="round" transform="rotate(-90 20 20)" />
                                    </svg>
                                    <span className="cand-score-val">{c.aiScore}</span>
                                </div>
                            </div>

                            <div className="cand-row__source">
                                <span className="cand-source">{c.source.replace('_', ' ')}</span>
                            </div>

                            <span className="cand-row__arrow">→</span>
                        </Link>
                    ))}
                </div>

                {filtered.length === 0 && (
                    <div className="cands-empty">
                        <p style={{ fontSize: '36px', marginBottom: '12px' }}>👥</p>
                        <h4>No candidates found</h4>
                        <p className="text-muted">Try adjusting your search or filters.</p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default CandidatesPage;
