import { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/icons/Icon';
import './CandidatePortalPage.css';

const applications = [
    { id: '1', role: 'Senior UX Designer', company: 'HireAI', appliedDate: 'Oct 15, 2026', stage: 'Interview', status: 'Active', color: '#6c5ce7', icon: '🎨', progress: [1, 1, 0, 0] },
    { id: '2', role: 'Product Manager', company: 'TechCorp', appliedDate: 'Oct 02, 2026', stage: 'Offered', status: 'Action Required', color: '#00b894', icon: '📱', progress: [1, 1, 1, 1] },
    { id: '3', role: 'Frontend Engineer', company: 'StartupX', appliedDate: 'Sep 28, 2026', stage: 'Rejected', status: 'Closed', color: '#e17055', icon: '💻', progress: [1, 0, 0, 0] },
];

const jobs = [
    { id: '1', title: 'Senior Backend Engineer', location: 'San Francisco (Hybrid)', type: 'Full-time', salary: '$140K - $180K', match: 92 },
    { id: '2', title: 'Machine Learning Engineer', location: 'Remote', type: 'Full-time', salary: '$150K - $200K', match: 88 },
    { id: '3', title: 'Product Designer', location: 'New York (Hybrid)', type: 'Full-time', salary: '$120K - $160K', match: 85 },
    { id: '4', title: 'Data Scientist', location: 'Remote', type: 'Full-time', salary: '$130K - $170K', match: 78 },
];

const CandidatePortalPage = () => {
    const [tab, setTab] = useState<'hub' | 'jobs'>('hub');
    const user = JSON.parse(localStorage.getItem('user') || '{"firstName":"Alex"}');

    return (
        <div className="portal-page">
            <header className="portal-nav glass-card" style={{ border: 'none', borderRadius: 0 }}>
                <Link to="/portal" className="portal-nav__logo">
                    <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
                        <circle cx="16" cy="16" r="14" stroke="url(#p-grad)" strokeWidth="2.5" fill="none" />
                        <path d="M10 16l4 4 8-8" stroke="url(#p-grad)" strokeWidth="2.5" strokeLinecap="round" />
                        <defs><linearGradient id="p-grad" x1="0" y1="0" x2="32" y2="32"><stop stopColor="#6c5ce7" /><stop offset="1" stopColor="#00cec9" /></linearGradient></defs>
                    </svg>
                    HireAI Portal
                </Link>
                <div className="portal-nav__links">
                    <button className={`portal-nav__link ${tab === 'hub' ? 'portal-nav__link--active' : ''}`} onClick={() => setTab('hub')}>My Applications</button>
                    <button className={`portal-nav__link ${tab === 'jobs' ? 'portal-nav__link--active' : ''}`} onClick={() => setTab('jobs')}>Job Board</button>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #6c5ce780, #6c5ce740)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: 13, marginLeft: 16 }}>
                        {user.firstName[0]}
                    </div>
                </div>
            </header>

            <main className="portal-content">
                <div className="portal-welcome">
                    <h1>Welcome back, {user.firstName || 'Candidate'}</h1>
                    <p className="text-muted">Track your applications, update your profile, and discover new opportunities.</p>
                </div>

                {tab === 'hub' ? (
                    <>
                        <div className="portal-stats">
                            <div className="portal-stat glass-card">
                                <div className="portal-stat__num" style={{ color: '#00cec9' }}>{applications.length}</div>
                                <div className="portal-stat__label">Total Applications</div>
                            </div>
                            <div className="portal-stat glass-card">
                                <div className="portal-stat__num" style={{ color: '#6c5ce7' }}>{applications.filter(a => a.status === 'Active').length}</div>
                                <div className="portal-stat__label">Active Processes</div>
                            </div>
                            <div className="portal-stat glass-card">
                                <div className="portal-stat__num" style={{ color: '#00b894' }}>{applications.filter(a => a.stage === 'Offered').length}</div>
                                <div className="portal-stat__label">Job Offers</div>
                            </div>
                        </div>

                        <div className="portal-apps">
                            <div className="portal-apps__title">Recent Applications</div>
                            {applications.map(app => {
                                const statusColors: Record<string, { bg: string, text: string }> = {
                                    'Active': { bg: 'rgba(108,92,231,0.15)', text: '#6c5ce7' },
                                    'Action Required': { bg: 'rgba(0,184,148,0.15)', text: '#00b894' },
                                    'Closed': { bg: 'rgba(255,255,255,0.05)', text: 'var(--text-tertiary)' },
                                };
                                const st = statusColors[app.status];
                                return (
                                    <div key={app.id} className="portal-app glass-card">
                                        <div className="portal-app__icon" style={{ background: `${app.color}20`, color: app.color, fontSize: 20 }}>{app.icon}</div>
                                        <div className="portal-app__info">
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                                                <div className="portal-app__title">{app.role}</div>
                                                <span className="portal-app__status" style={{ background: st.bg, color: st.text }}>{app.status}</span>
                                            </div>
                                            <div style={{ display: 'flex', gap: 12 }}>
                                                <span className="portal-app__company"><Icon name="building" size={12} /> {app.company}</span>
                                                <span className="portal-app__date"><Icon name="clock" size={12} /> Applied {app.appliedDate}</span>
                                                <span style={{ fontSize: 12, color: app.color, fontWeight: 500 }}>Stage: {app.stage}</span>
                                            </div>
                                            <div className="portal-app__stage">
                                                {app.progress.map((p, i) => (
                                                    <div key={i} className="portal-app__stage-bar" style={{ background: p ? app.color : 'rgba(255,255,255,0.05)' }} />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                ) : (
                    <>
                        <div className="portal-apps__title" style={{ marginBottom: 20 }}>Recommended For You</div>
                        <div className="portal-jobs">
                            {jobs.map(job => (
                                <div key={job.id} className="portal-job glass-card">
                                    <div className="portal-job__title">{job.title}</div>
                                    <div className="portal-job__meta">
                                        <span><Icon name="building" size={12} /> {job.location}</span>
                                    </div>
                                    <div className="portal-job__tags">
                                        <span className="portal-job__tag">{job.type}</span>
                                        <span className="portal-job__tag">{job.salary}</span>
                                        <span className="portal-job__tag" style={{ color: '#00b894', borderColor: 'rgba(0,184,148,0.3)', background: 'rgba(0,184,148,0.05)' }}>
                                            AI Match: {job.match}%
                                        </span>
                                    </div>
                                    <div className="portal-job__footer">
                                        <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Posted 2 days ago</span>
                                        <button className="btn btn-primary btn-sm">Easy Apply</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </main>
        </div>
    );
};

export default CandidatePortalPage;
