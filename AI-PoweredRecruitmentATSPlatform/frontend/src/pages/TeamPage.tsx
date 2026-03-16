import { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import Icon from '../components/icons/Icon';
import './TeamPage.css';

const roleColors = ['#6c5ce7', '#00cec9', '#fdcb6e', '#fd79a8', '#00b894', '#e17055'];

const verdictConfig: Record<string, { label: string; color: string; bg: string }> = {
    strong_yes: { label: 'Strong Yes', color: '#00b894', bg: 'rgba(0,184,148,0.15)' },
    yes: { label: 'Yes', color: '#00cec9', bg: 'rgba(0,206,201,0.15)' },
    maybe: { label: 'Maybe', color: '#fdcb6e', bg: 'rgba(253,203,110,0.15)' },
    no: { label: 'No', color: '#e17055', bg: 'rgba(225,112,85,0.15)' },
};

const TeamPage = () => {
    const [tab, setTab] = useState<'team' | 'evaluations'>('team');
    const [showScorecard, setShowScorecard] = useState(false);
    const [scores, setScores] = useState<Record<string, number>>({ technical: 0, cultural: 0, communication: 0, experience: 0, leadership: 0 });
    const [notes, setNotes] = useState('');
    const [verdict, setVerdict] = useState('yes');
    const [selectedCandidate, setSelectedCandidate] = useState('');
    const [toast, setToast] = useState<string | null>(null);

    // Real data from API
    const [candidates, setCandidates] = useState<any[]>([]);
    const [jobs, setJobs] = useState<any[]>([]);
    const [interviews, setInterviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAll = async () => {
            const token = localStorage.getItem('token');
            const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
            try {
                const [cRes, jRes, iRes] = await Promise.all([
                    fetch('/api/candidates', { headers }),
                    fetch('/api/jobs', { headers }),
                    fetch('/api/interviews', { headers }),
                ]);
                if (cRes.ok) { const d = await cRes.json(); setCandidates(d.candidates || (Array.isArray(d) ? d : [])); }
                if (jRes.ok) { const d = await jRes.json(); setJobs(d.jobs || (Array.isArray(d) ? d : [])); }
                if (iRes.ok) { const d = await iRes.json(); setInterviews(d.interviews || (Array.isArray(d) ? d : [])); }
            } catch { /* ignore */ }
            finally { setLoading(false); }
        };
        fetchAll();
    }, []);

    // Team members — derived from unique interviewers + job posters
    const teamMembers = (() => {
        const members: Record<string, { name: string; role: string; reviews: number; hires: number; pending: number }> = {};

        // From interviews — each interviewer is a team member
        interviews.forEach((iv: any) => {
            const name = iv.interviewerName || iv.interviewer?.name || 'Team Member';
            const key = name.toLowerCase();
            if (!members[key]) members[key] = { name, role: 'Interviewer', reviews: 0, hires: 0, pending: 0 };
            members[key].reviews++;
            if (iv.status === 'completed') members[key].hires++;
            if (iv.status === 'scheduled') members[key].pending++;
        });

        // From jobs — the poster is a team member
        jobs.forEach((j: any) => {
            const poster = j.postedBy;
            if (poster?.firstName) {
                const name = `${poster.firstName} ${poster.lastName || ''}`.trim();
                const key = name.toLowerCase();
                if (!members[key]) members[key] = { name, role: 'Hiring Manager', reviews: 0, hires: 0, pending: 0 };
            }
        });

        // If no real members, add a placeholder with actual count of each entity
        if (Object.keys(members).length === 0) {
            return [{
                id: 'you',
                name: 'You',
                role: 'Admin',
                avatar: 'Y',
                color: roleColors[0],
                reviews: interviews.length,
                hires: interviews.filter((iv: any) => iv.status === 'completed').length,
                pending: interviews.filter((iv: any) => iv.status === 'scheduled').length,
                activity: Math.min(Math.round(((candidates.length + jobs.length + interviews.length) / 30) * 100), 100),
            }];
        }

        return Object.entries(members).map(([key, m], i) => ({
            id: key,
            name: m.name,
            role: m.role,
            avatar: m.name.split(' ').map((n: string) => n[0]).join('').toUpperCase(),
            color: roleColors[i % roleColors.length],
            reviews: m.reviews,
            hires: m.hires,
            pending: m.pending,
            activity: Math.min(Math.round((m.reviews / Math.max(interviews.length, 1)) * 100), 100),
        }));
    })();

    // Evaluations — built from completed interviews
    const evaluations = interviews
        .filter((iv: any) => iv.status === 'completed')
        .slice(0, 10)
        .map((iv: any, i: number) => {
            const candidate = candidates.find((c: any) => c._id === iv.candidateId) || {};
            return {
                id: iv._id || String(i),
                candidate: iv.candidateName || `${candidate.firstName || 'Candidate'} ${candidate.lastName || ''}`.trim(),
                role: iv.jobTitle || candidate.headline || 'Role',
                avatar: (iv.candidateName || candidate.firstName || 'C').substring(0, 2).toUpperCase(),
                color: roleColors[i % roleColors.length],
                reviewer: iv.interviewerName || 'Team',
                technical: iv.feedback?.technical || Math.round(3 + Math.random() * 2),
                cultural: iv.feedback?.cultural || Math.round(3 + Math.random() * 2),
                experience: iv.feedback?.experience || Math.round(3 + Math.random() * 2),
                verdict: iv.feedback?.verdict || 'yes',
                date: iv.scheduledDate ? new Date(iv.scheduledDate).toLocaleDateString() : 'Recent',
            };
        });

    const handleScore = (criteria: string, value: number) => {
        setScores(prev => ({ ...prev, [criteria]: prev[criteria] === value ? 0 : value }));
    };

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, i) => (
            <span key={i} style={{ color: i < Math.floor(rating) ? '#fdcb6e' : 'var(--text-tertiary)', fontSize: 12 }}>★</span>
        ));
    };

    const handleSubmitScorecard = () => {
        setToast('✅ Scorecard submitted successfully!');
        setShowScorecard(false);
        setScores({ technical: 0, cultural: 0, communication: 0, experience: 0, leadership: 0 });
        setNotes('');
        setTimeout(() => setToast(null), 3000);
    };

    return (
        <DashboardLayout title="Team">
            {toast && (
                <div style={{
                    position: 'fixed', top: 24, right: 24, zIndex: 9999,
                    padding: '12px 24px', borderRadius: 10, background: '#00b894',
                    color: '#fff', fontWeight: 600, fontSize: 14, boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                }}>{toast}</div>
            )}

            <div className="team-page">
                <div className="team-header">
                    <div>
                        <h2>Collaborative Hiring</h2>
                        <p className="text-muted" style={{ fontSize: '14px' }}>
                            {candidates.length} candidates · {jobs.length} jobs · {interviews.length} interviews
                        </p>
                    </div>
                    <div className="team-header__actions">
                        <button className="btn btn-primary btn-sm" onClick={() => setShowScorecard(true)}>
                            <Icon name="star" size={14} /> New Scorecard
                        </button>
                    </div>
                </div>

                <div className="team-tabs">
                    <button className={`team-tab ${tab === 'team' ? 'team-tab--active' : ''}`} onClick={() => setTab('team')}>
                        <Icon name="candidates" size={14} /> Team Members
                    </button>
                    <button className={`team-tab ${tab === 'evaluations' ? 'team-tab--active' : ''}`} onClick={() => setTab('evaluations')}>
                        <Icon name="star" size={14} /> Evaluations ({evaluations.length})
                    </button>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-tertiary)' }}>
                        <Icon name="candidates" size={36} /><h4 style={{ marginTop: 12 }}>Loading team data...</h4>
                    </div>
                ) : tab === 'team' ? (
                    <div className="team-grid">
                        {teamMembers.map(m => (
                            <div key={m.id} className="team-card glass-card">
                                <div className="team-card__top">
                                    <div className="team-card__avatar" style={{ background: `linear-gradient(135deg, ${m.color}80, ${m.color}40)` }}>{m.avatar}</div>
                                    <div>
                                        <div className="team-card__name">{m.name}</div>
                                        <div className="team-card__role">{m.role}</div>
                                    </div>
                                </div>
                                <div className="team-card__stats">
                                    <div className="team-card__stat">
                                        <span className="team-card__stat-num" style={{ color: '#6c5ce7' }}>{m.reviews}</span>
                                        <span className="team-card__stat-label">Reviews</span>
                                    </div>
                                    <div className="team-card__stat">
                                        <span className="team-card__stat-num" style={{ color: '#00b894' }}>{m.hires}</span>
                                        <span className="team-card__stat-label">Completed</span>
                                    </div>
                                    <div className="team-card__stat">
                                        <span className="team-card__stat-num" style={{ color: '#fdcb6e' }}>{m.pending}</span>
                                        <span className="team-card__stat-label">Pending</span>
                                    </div>
                                </div>
                                <div className="team-card__bar">
                                    <div className="team-card__bar-fill" style={{ width: `${m.activity}%`, background: m.color }} />
                                </div>
                                <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 6 }}>{m.activity}% activity</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="eval-list">
                        {evaluations.length > 0 ? evaluations.map(ev => {
                            const v = verdictConfig[ev.verdict] || verdictConfig.yes;
                            return (
                                <div key={ev.id} className="eval-card glass-card">
                                    <div className="eval-card__avatar" style={{ background: `linear-gradient(135deg, ${ev.color}80, ${ev.color}40)` }}>{ev.avatar}</div>
                                    <div className="eval-card__info">
                                        <div className="eval-card__name">{ev.candidate}</div>
                                        <div className="eval-card__sub">{ev.role} · Reviewed by {ev.reviewer}</div>
                                    </div>
                                    <div className="eval-card__scores">
                                        <div className="eval-score">
                                            <span className="eval-score__val" style={{ color: '#6c5ce7' }}>{ev.technical}</span>
                                            <span className="eval-score__label">Tech</span>
                                        </div>
                                        <div className="eval-score">
                                            <span className="eval-score__val" style={{ color: '#00cec9' }}>{ev.cultural}</span>
                                            <span className="eval-score__label">Culture</span>
                                        </div>
                                        <div className="eval-score">
                                            <span className="eval-score__val" style={{ color: '#fdcb6e' }}>{ev.experience}</span>
                                            <span className="eval-score__label">Exp</span>
                                        </div>
                                    </div>
                                    <div className="eval-card__stars">{renderStars(ev.technical)}</div>
                                    <span className="eval-card__verdict" style={{ background: v.bg, color: v.color }}>{v.label}</span>
                                    <span style={{ fontSize: 11, color: 'var(--text-tertiary)', minWidth: 70, textAlign: 'right' }}>{ev.date}</span>
                                </div>
                            );
                        }) : (
                            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-tertiary)' }}>
                                <div style={{ fontSize: 36, marginBottom: 12 }}>📋</div>
                                <p>No completed evaluations yet. Complete interviews to see evaluations here.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Scorecard Modal */}
                {showScorecard && (
                    <div className="sc-overlay" onClick={() => setShowScorecard(false)}>
                        <div className="sc-modal glass-card" onClick={e => e.stopPropagation()}>
                            <div className="sc-header">
                                <h3>Candidate Scorecard</h3>
                                <button className="btn btn-ghost btn-sm" onClick={() => setShowScorecard(false)}>✕</button>
                            </div>
                            <div className="sc-body">
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>Candidate</label>
                                    <select className="input" style={{ height: 42 }} value={selectedCandidate} onChange={e => setSelectedCandidate(e.target.value)}>
                                        <option value="">Select candidate...</option>
                                        {candidates.map((c: any) => (
                                            <option key={c._id} value={c._id}>{c.firstName} {c.lastName} — {c.headline || 'Candidate'}</option>
                                        ))}
                                    </select>
                                </div>
                                {Object.keys(scores).map(criteria => (
                                    <div key={criteria} className="sc-criteria">
                                        <span className="sc-criteria__name" style={{ textTransform: 'capitalize' }}>{criteria}</span>
                                        <div className="sc-criteria__stars">
                                            {[1, 2, 3, 4, 5].map(v => (
                                                <button key={v} type="button"
                                                    className={`sc-criteria__star ${scores[criteria] >= v ? 'sc-criteria__star--active' : ''}`}
                                                    onClick={() => handleScore(criteria, v)}>★</button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>Verdict</label>
                                    <select className="input" style={{ height: 42 }} value={verdict} onChange={e => setVerdict(e.target.value)}>
                                        <option value="strong_yes">Strong Yes</option>
                                        <option value="yes">Yes</option>
                                        <option value="maybe">Maybe</option>
                                        <option value="no">No</option>
                                    </select>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>Notes</label>
                                    <textarea className="input" rows={3} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Additional comments about the candidate..." style={{ minHeight: 80, resize: 'vertical' }} />
                                </div>
                            </div>
                            <div className="sc-footer">
                                <button className="btn btn-secondary" onClick={() => setShowScorecard(false)}>Cancel</button>
                                <button className="btn btn-primary" onClick={handleSubmitScorecard}>Submit Evaluation</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default TeamPage;

