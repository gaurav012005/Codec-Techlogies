import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import './CandidateDetailPage.css';

import './CandidateDetailPage.css';

const CandidateDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [c, setCandidate] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'profile' | 'ai' | 'activity'>('profile');

    // Fetch real candidate from API
    useEffect(() => {
        const fetchCandidate = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`/api/candidates/${id}`, {
                    headers: token ? { 'Authorization': `Bearer ${token}` } : {},
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.candidate) {
                        setCandidate({
                            ...data.candidate,
                            phone: data.candidate.phone || '',
                            headline: data.candidate.headline || '',
                            summary: data.candidate.summary || '',
                            socialLinks: data.candidate.socialLinks || {},
                            skills: data.candidate.skills || [],
                            experience: data.candidate.experience || [],
                            education: data.candidate.education || [],
                            aiAnalysis: data.candidate.aiAnalysis || { strengths: [], gaps: [], cultureFit: 0, technicalFit: 0, experienceFit: 0 },
                            appliedJobs: data.candidate.appliedJobs || [],
                            tags: data.candidate.tags || [],
                            aiScore: data.candidate.aiScore || 0,
                        });
                    } else {
                        throw new Error('No candidate in response');
                    }
                } else {
                    throw new Error('API request failed');
                }
            } catch (err) {
                console.log('Error fetching candidate details:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchCandidate();
    }, [id]);

    const scoreColor = (s: number) => s >= 90 ? '#00b894' : s >= 80 ? '#00cec9' : s >= 70 ? '#fdcb6e' : '#e17055';
    const levelWidth = (l: string) => l === 'expert' ? '100%' : l === 'advanced' ? '75%' : l === 'intermediate' ? '50%' : '25%';

    return (
        <DashboardLayout title={c ? `${c.firstName} ${c.lastName}` : 'Candidate Details'}>
            {loading || !c ? (
                <div style={{ textAlign: 'center', padding: '80px 20px' }}>
                    <p style={{ fontSize: '36px', marginBottom: '12px' }}>⏳</p>
                    <h4>Loading candidate...</h4>
                </div>
            ) : (
                <div className="cd-page">
                    {/* Header */}
                    <div className="cd-header glass-card">
                        <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)} style={{ alignSelf: 'flex-start' }}>← Back</button>
                        <div className="cd-header__main">
                            <div className="cd-header__avatar">{c.firstName[0]}{c.lastName[0]}</div>
                            <div className="cd-header__info">
                                <h2>{c.firstName} {c.lastName}</h2>
                                <p className="cd-header__headline">{c.headline}</p>
                                <div className="cd-header__meta">
                                    <span>📍 {c.location}</span>
                                    <span>📧 {c.email}</span>
                                    <span>📱 {c.phone}</span>
                                    <span>🔗 {c.source}</span>
                                </div>
                                <div className="cd-header__tags">
                                    {c.tags.map((t: string, i: number) => <span key={i} className="cd-tag">{t}</span>)}
                                </div>
                            </div>
                            <div className="cd-header__score">
                                <div className="cd-score-big" style={{ '--sc': scoreColor(c.aiScore) } as React.CSSProperties}>
                                    <svg viewBox="0 0 80 80">
                                        <circle cx="40" cy="40" r="35" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
                                        <circle cx="40" cy="40" r="35" fill="none" stroke={scoreColor(c.aiScore)} strokeWidth="5"
                                            strokeDasharray={`${c.aiScore * 2.2} 220`} strokeLinecap="round" transform="rotate(-90 40 40)" />
                                    </svg>
                                    <div className="cd-score-big__inner">
                                        <span className="cd-score-big__num">{c.aiScore}</span>
                                        <span className="cd-score-big__label">AI Score</span>
                                    </div>
                                </div>
                                <div className="cd-header__actions">
                                    <button className="btn btn-primary btn-sm" onClick={() => navigate('/dashboard/interviews')}>📅 Schedule Interview</button>
                                    <button className="btn btn-secondary btn-sm" onClick={() => window.location.href = `mailto:${c?.email || ''}`}>💬 Message</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="cd-tabs">
                        {(['profile', 'ai', 'activity'] as const).map(tab => (
                            <button key={tab} className={`cd-tab ${activeTab === tab ? 'cd-tab--active' : ''}`} onClick={() => setActiveTab(tab)}>
                                {tab === 'ai' ? '🧠 AI Analysis' : tab === 'activity' ? '📋 Activity' : '👤 Profile'}
                            </button>
                        ))}
                    </div>

                    {activeTab === 'profile' && (
                        <div className="cd-content">
                            <div className="cd-content__main">
                                {/* Summary */}
                                <div className="cd-section glass-card">
                                    <h4>About</h4>
                                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '14px' }}>{c.summary}</p>
                                </div>

                                {/* Experience */}
                                <div className="cd-section glass-card">
                                    <h4>💼 Experience</h4>
                                    <div className="cd-timeline">
                                        {c.experience.map((exp: any, i: number) => (
                                            <div key={i} className="cd-timeline__item">
                                                <div className="cd-timeline__dot" style={{ background: i === 0 ? '#6c5ce7' : 'var(--border-medium)' }}></div>
                                                <div className="cd-timeline__content">
                                                    <div className="cd-timeline__title">{exp.title}</div>
                                                    <div className="cd-timeline__company">{exp.company} · {exp.location}</div>
                                                    <div className="cd-timeline__date">{exp.startDate} — {exp.current ? 'Present' : exp.endDate}</div>
                                                    <p className="cd-timeline__desc">{exp.description}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Education */}
                                <div className="cd-section glass-card">
                                    <h4>🎓 Education</h4>
                                    {c.education.map((edu: any, i: number) => (
                                        <div key={i} className="cd-edu-item">
                                            <div className="cd-edu-item__degree">{edu.degree}</div>
                                            <div className="cd-edu-item__school">{edu.institution} · {edu.startDate}–{edu.endDate}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="cd-content__sidebar">
                                {/* Skills */}
                                <div className="cd-section glass-card">
                                    <h4>🛠️ Skills</h4>
                                    <div className="cd-skills-list">
                                        {c.skills.map((s: any, i: number) => (
                                            <div key={i} className="cd-skill-bar">
                                                <div className="cd-skill-bar__top">
                                                    <span>{s.name}</span>
                                                    <span className="cd-skill-bar__level">{s.level}</span>
                                                </div>
                                                <div className="cd-skill-bar__bg">
                                                    <div className="cd-skill-bar__fill" style={{ width: levelWidth(s.level) }}></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Links */}
                                <div className="cd-section glass-card">
                                    <h4>🔗 Links</h4>
                                    <div className="cd-links">
                                        {c.socialLinks.linkedin && <a href="#" className="cd-link">🔵 LinkedIn</a>}
                                        {c.socialLinks.github && <a href="#" className="cd-link">⚡ GitHub</a>}
                                        {c.socialLinks.portfolio && <a href="#" className="cd-link">🌐 Portfolio</a>}
                                    </div>
                                </div>

                                {/* Applied Jobs */}
                                <div className="cd-section glass-card">
                                    <h4>💼 Applied Positions</h4>
                                    {c.appliedJobs.map((aj: any, i: number) => (
                                        <div key={i} className="cd-applied-job">
                                            <span className="cd-applied-job__title">{aj.job.title}</span>
                                            <span className="cd-applied-job__stage" style={{ color: '#fdcb6e' }}>{aj.stage}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'ai' && (
                        <div className="cd-content">
                            <div className="cd-content__main">
                                <div className="cd-section glass-card">
                                    <h4>🧠 AI Analysis Summary</h4>
                                    <div className="cd-ai-meters">
                                        {[
                                            { label: 'Culture Fit', value: c.aiAnalysis.cultureFit, color: '#6c5ce7' },
                                            { label: 'Technical Fit', value: c.aiAnalysis.technicalFit, color: '#00cec9' },
                                            { label: 'Experience Fit', value: c.aiAnalysis.experienceFit, color: '#fd79a8' },
                                        ].map((m, i) => (
                                            <div key={i} className="cd-ai-meter">
                                                <div className="cd-ai-meter__label">{m.label}</div>
                                                <div className="cd-ai-meter__bar-bg">
                                                    <div className="cd-ai-meter__bar" style={{ width: `${m.value}%`, background: m.color }}></div>
                                                </div>
                                                <div className="cd-ai-meter__val" style={{ color: m.color }}>{m.value}%</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="cd-section glass-card">
                                    <h4>✅ Key Strengths</h4>
                                    <ul className="cd-ai-list">{c.aiAnalysis.strengths.map((s: string, i: number) => <li key={i}><span style={{ color: '#00b894' }}>✓</span> {s}</li>)}</ul>
                                </div>
                                <div className="cd-section glass-card">
                                    <h4>⚠️ Potential Gaps</h4>
                                    <ul className="cd-ai-list">{c.aiAnalysis.gaps.map((g: string, i: number) => <li key={i}><span style={{ color: '#fdcb6e' }}>!</span> {g}</li>)}</ul>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'activity' && (
                        <div className="cd-section glass-card" style={{ textAlign: 'center', padding: '60px' }}>
                            <p style={{ fontSize: '36px', marginBottom: '12px' }}>📋</p>
                            <h4>Activity Timeline</h4>
                            <p className="text-muted">All interactions, notes, and status changes for this candidate will appear here.</p>
                        </div>
                    )}
                </div>
            )}
        </DashboardLayout>
    );
};

export default CandidateDetailPage;
