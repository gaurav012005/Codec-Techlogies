import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import './JobDetailPage.css';

const pipelineStages = [
    { key: 'sourced', label: 'Sourced', color: '#6c5ce7' },
    { key: 'applied', label: 'Applied', color: '#00cec9' },
    { key: 'screening', label: 'Screening', color: '#74b9ff' },
    { key: 'interview', label: 'Interview', color: '#fdcb6e' },
    { key: 'offered', label: 'Offered', color: '#fd79a8' },
    { key: 'hired', label: 'Hired', color: '#00b894' },
];

const JobDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'candidates' | 'analytics'>('overview');
    const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
    const [showShareModal, setShowShareModal] = useState(false);

    const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchJob = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/jobs/${id}`, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {},
            });
            if (res.ok) {
                const data = await res.json();
                if (data.job) {
                    setJob({
                        ...data.job,
                        totalApplicants: data.job.totalApplicants || 0,
                        pipeline: data.job.pipeline || { sourced: 0, applied: 0, screening: 0, interview: 0, offered: 0, hired: 0 },
                        salary: data.job.salary || { min: 0, max: 0, currency: 'USD' },
                        requirements: data.job.requirements || [],
                        responsibilities: data.job.responsibilities || [],
                        skills: data.job.skills || [],
                        benefits: data.job.benefits || [],
                        postedBy: data.job.postedBy || { firstName: 'Unknown', lastName: '' },
                        aiScore: data.job.aiScore || 0,
                    });
                }
            }
        } catch (err) {
            console.log('Error fetching job details:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchJob(); }, [id]);

    // Toggle pause/active
    const handleTogglePause = async () => {
        const token = localStorage.getItem('token');
        const newStatus = job.status === 'paused' ? 'active' : 'paused';
        try {
            const res = await fetch(`/api/jobs/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.ok) {
                setJob((prev: any) => ({ ...prev, status: newStatus }));
                showToast(`Job ${newStatus === 'paused' ? 'paused' : 'resumed'} successfully!`);
            } else {
                const data = await res.json();
                showToast(data.message || 'Failed to update status', 'error');
            }
        } catch {
            showToast('Network error', 'error');
        }
    };

    // Delete job
    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this job? This action cannot be undone.')) return;
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`/api/jobs/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (res.ok) {
                showToast('Job deleted!');
                setTimeout(() => navigate('/dashboard/jobs'), 1000);
            } else {
                const data = await res.json();
                showToast(data.message || 'Failed to delete', 'error');
            }
        } catch {
            showToast('Network error', 'error');
        }
    };

    // Share: copy link
    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        showToast('Job link copied to clipboard!');
        setShowShareModal(false);
    };

    // Share via email
    const handleShareEmail = () => {
        const subject = encodeURIComponent(`Check out this job: ${job.title}`);
        const body = encodeURIComponent(`Hi,\n\nI wanted to share this job posting with you:\n\n${job.title} — ${job.department}\nLocation: ${job.location}\n\nView details: ${window.location.href}\n\nBest regards`);
        window.open(`mailto:?subject=${subject}&body=${body}`);
        setShowShareModal(false);
    };

    const statusColors: Record<string, string> = {
        active: '#00b894', draft: '#636e72', paused: '#fdcb6e', closed: '#e17055',
    };

    return (
        <DashboardLayout title={job?.title || 'Job Details'}>
            {/* Toast */}
            {toast && (
                <div style={{
                    position: 'fixed', top: 24, right: 24, zIndex: 9999,
                    padding: '12px 24px', borderRadius: 10,
                    background: toast.type === 'success' ? '#00b894' : '#e17055',
                    color: '#fff', fontWeight: 600, fontSize: 14,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                    animation: 'fadeIn 0.3s ease',
                }}>
                    {toast.msg}
                </div>
            )}

            {loading || !job ? (
                <div style={{ textAlign: 'center', padding: '80px 20px' }}>
                    <p style={{ fontSize: '36px', marginBottom: '12px' }}>⏳</p>
                    <h4>Loading job details...</h4>
                </div>
            ) : (
                <div className="jd-page">
                    {/* Header */}
                    <div className="jd-header">
                        <div className="jd-header__left">
                            <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}>← Back</button>
                            <div>
                                <div className="jd-header__title-row">
                                    <h2>{job.title}</h2>
                                    <span className="jd-status" style={{ background: `${statusColors[job.status]}20`, color: statusColors[job.status] }}>
                                        {job.status}
                                    </span>
                                </div>
                                <div className="jd-header__meta">
                                    <span>🏢 {job.department}</span>
                                    <span>📍 {job.location}</span>
                                    <span>💼 {job.type}</span>
                                    <span>📅 Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                        <div className="jd-header__actions">
                            <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/dashboard/jobs/${id}/edit`)}>✏️ Edit</button>
                            <button className="btn btn-secondary btn-sm" onClick={handleTogglePause}>
                                {job.status === 'paused' ? '▶️ Resume' : '⏸️ Pause'}
                            </button>
                            <button className="btn btn-primary btn-sm" onClick={() => setShowShareModal(true)}>📤 Share</button>
                            <button className="btn btn-ghost btn-sm" style={{ color: '#e17055' }} onClick={handleDelete}>🗑️</button>
                        </div>
                    </div>

                    {/* Stat Row */}
                    <div className="jd-stats">
                        <div className="jd-stat-card">
                            <span className="jd-stat-card__value" style={{ color: '#6c5ce7' }}>{job.totalApplicants}</span>
                            <span className="jd-stat-card__label">Total Applicants</span>
                        </div>
                        <div className="jd-stat-card">
                            <span className="jd-stat-card__value" style={{ color: '#00cec9' }}>{job.pipeline.interview}</span>
                            <span className="jd-stat-card__label">In Interview</span>
                        </div>
                        <div className="jd-stat-card">
                            <span className="jd-stat-card__value" style={{ color: '#fd79a8' }}>{job.pipeline.offered}</span>
                            <span className="jd-stat-card__label">Offered</span>
                        </div>
                        <div className="jd-stat-card">
                            <span className="jd-stat-card__value" style={{ color: '#00b894' }}>{job.aiScore}%</span>
                            <span className="jd-stat-card__label">AI Match Quality</span>
                        </div>
                        <div className="jd-stat-card">
                            <span className="jd-stat-card__value" style={{ color: '#fdcb6e' }}>${(job.salary.min / 1000).toFixed(0)}K-${(job.salary.max / 1000).toFixed(0)}K</span>
                            <span className="jd-stat-card__label">Salary Range</span>
                        </div>
                    </div>

                    {/* Pipeline Visualization */}
                    <div className="jd-pipeline glass-card">
                        <h4>Hiring Pipeline</h4>
                        <div className="jd-pipeline__stages">
                            {pipelineStages.map((stage) => {
                                const count = job.pipeline[stage.key as keyof typeof job.pipeline];
                                const pct = job.totalApplicants > 0 ? (count / job.totalApplicants) * 100 : 0;
                                return (
                                    <div key={stage.key} className="jd-pipeline-stage">
                                        <div className="jd-pipeline-stage__top">
                                            <span className="jd-pipeline-stage__label">{stage.label}</span>
                                            <span className="jd-pipeline-stage__count" style={{ color: stage.color }}>{count}</span>
                                        </div>
                                        <div className="jd-pipeline-stage__bar-bg">
                                            <div className="jd-pipeline-stage__bar" style={{ height: `${Math.max(pct, 3)}%`, background: stage.color }}></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Content Tabs */}
                    <div className="jd-tabs">
                        {(['overview', 'candidates', 'analytics'] as const).map(tab => (
                            <button key={tab} className={`jd-tab ${activeTab === tab ? 'jd-tab--active' : ''}`} onClick={() => setActiveTab(tab)}>
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>

                    {activeTab === 'overview' && (
                        <div className="jd-content">
                            <div className="jd-content__main">
                                <div className="jd-section glass-card">
                                    <h4>About the Role</h4>
                                    <p style={{ lineHeight: 1.7, color: 'var(--text-secondary)' }}>{job.description}</p>
                                </div>
                                <div className="jd-section glass-card">
                                    <h4>Requirements</h4>
                                    <ul className="jd-list">
                                        {job.requirements.length > 0 ? job.requirements.map((r: string, i: number) => <li key={i}><span className="jd-list__check">✓</span> {r}</li>) : <li className="text-muted">No requirements listed</li>}
                                    </ul>
                                </div>
                                <div className="jd-section glass-card">
                                    <h4>Responsibilities</h4>
                                    <ul className="jd-list">
                                        {job.responsibilities.length > 0 ? job.responsibilities.map((r: string, i: number) => <li key={i}><span className="jd-list__check">→</span> {r}</li>) : <li className="text-muted">No responsibilities listed</li>}
                                    </ul>
                                </div>
                            </div>
                            <div className="jd-content__sidebar">
                                <div className="jd-section glass-card">
                                    <h4>Required Skills</h4>
                                    <div className="jd-skills">
                                        {job.skills.length > 0 ? job.skills.map((s: string, i: number) => <span key={i} className="jd-skill-tag">{s}</span>) : <span className="text-muted">No skills listed</span>}
                                    </div>
                                </div>
                                <div className="jd-section glass-card">
                                    <h4>Benefits & Perks</h4>
                                    <ul className="jd-list jd-list--benefits">
                                        {job.benefits.length > 0 ? job.benefits.map((b: string, i: number) => <li key={i}><span className="jd-list__check" style={{ color: '#00b894' }}>🎁</span> {b}</li>) : <li className="text-muted">No benefits listed</li>}
                                    </ul>
                                </div>
                                <div className="jd-section glass-card">
                                    <h4>Job Details</h4>
                                    <div className="jd-details-grid">
                                        <div><span className="text-muted">Experience</span><br /><strong>{job.experience}</strong></div>
                                        <div><span className="text-muted">Type</span><br /><strong>{job.type}</strong></div>
                                        <div><span className="text-muted">Closing Date</span><br /><strong>{job.closingDate ? new Date(job.closingDate).toLocaleDateString() : 'Open'}</strong></div>
                                        <div><span className="text-muted">Posted By</span><br /><strong>{job.postedBy.firstName} {job.postedBy.lastName}</strong></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'candidates' && (
                        <div className="jd-section glass-card" style={{ textAlign: 'center', padding: '48px' }}>
                            <p style={{ fontSize: '36px', marginBottom: '16px' }}>👥</p>
                            <h4>Candidate Management</h4>
                            <p className="text-muted" style={{ marginBottom: '16px' }}>View and manage candidates applying for this role.</p>
                            <Link to="/dashboard/candidates" className="btn btn-primary btn-sm">Go to Candidates</Link>
                        </div>
                    )}

                    {activeTab === 'analytics' && (
                        <div className="jd-section glass-card" style={{ textAlign: 'center', padding: '48px' }}>
                            <p style={{ fontSize: '36px', marginBottom: '16px' }}>📊</p>
                            <h4>Job Analytics</h4>
                            <p className="text-muted" style={{ marginBottom: '16px' }}>Track performance metrics for this job posting.</p>
                            <Link to="/dashboard/analytics" className="btn btn-primary btn-sm">View Analytics</Link>
                        </div>
                    )}

                    {/* Share Modal */}
                    {showShareModal && (
                        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowShareModal(false)}>
                            <div className="glass-card" style={{ padding: 32, maxWidth: 400, width: '90%' }} onClick={e => e.stopPropagation()}>
                                <h3 style={{ marginBottom: 20, fontSize: 18 }}>📤 Share Job</h3>
                                <p style={{ color: 'var(--text-secondary)', marginBottom: 20, fontSize: 14 }}>Share "{job.title}" with your team or candidates.</p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    <button className="btn btn-primary" onClick={handleCopyLink}>📋 Copy Link</button>
                                    <button className="btn btn-secondary" onClick={handleShareEmail}>✉️ Share via Email</button>
                                    <button className="btn btn-ghost" onClick={() => setShowShareModal(false)}>Cancel</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </DashboardLayout>
    );
};

export default JobDetailPage;
