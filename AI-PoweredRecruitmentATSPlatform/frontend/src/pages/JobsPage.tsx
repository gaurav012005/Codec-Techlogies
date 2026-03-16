import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import './JobsPage.css';

interface Job {
    _id: string;
    title: string;
    department: string;
    location: string;
    type: string;
    experience: string;
    status: string;
    pipeline: { sourced: number; applied: number; screening: number; interview: number; offered: number; hired: number };
    totalApplicants: number;
    createdAt: string;
    closingDate?: string;
}

const statusColors: Record<string, string> = {
    active: '#00b894',
    draft: '#636e72',
    paused: '#fdcb6e',
    closed: '#e17055',
    archived: '#6c5ce7',
};

const typeLabels: Record<string, string> = {
    'full-time': 'Full-Time',
    'part-time': 'Part-Time',
    'contract': 'Contract',
    'internship': 'Internship',
    'remote': 'Remote',
};

const daysSince = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return '1 day ago';
    return `${days}d ago`;
};

const JobsPage = () => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

    // Fetch real jobs from API
    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch('/api/jobs', {
                    headers: token ? { 'Authorization': `Bearer ${token}` } : {},
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.jobs && data.jobs.length > 0) {
                        // Merge: API jobs + mock jobs (API jobs first)
                        const apiJobs = data.jobs.map((j: any) => ({
                            ...j,
                            _id: j._id || j.id,
                            totalApplicants: j.totalApplicants || 0,
                            pipeline: j.pipeline || { sourced: 0, applied: 0, screening: 0, interview: 0, offered: 0, hired: 0 },
                        }));
                        setJobs(apiJobs);
                    }
                }
            } catch (err) {
                // If API fails, log error
                console.log('Error fetching jobs data', err);
            }
        };
        fetchJobs();
    }, []);

    const filtered = jobs.filter(j => {
        const matchStatus = filter === 'all' || j.status === filter;
        const matchSearch = !search || j.title.toLowerCase().includes(search.toLowerCase()) || j.department.toLowerCase().includes(search.toLowerCase());
        return matchStatus && matchSearch;
    });

    const statusCounts = {
        all: jobs.length,
        active: jobs.filter(j => j.status === 'active').length,
        draft: jobs.filter(j => j.status === 'draft').length,
        paused: jobs.filter(j => j.status === 'paused').length,
        closed: jobs.filter(j => j.status === 'closed').length,
    };

    return (
        <DashboardLayout title="Jobs">
            <div className="jobs-page">
                {/* Header */}
                <div className="jobs-page__header">
                    <div>
                        <h2>Job Listings</h2>
                        <p className="text-muted" style={{ fontSize: '14px' }}>{jobs.length} total positions</p>
                    </div>
                    <Link to="/dashboard/jobs/new" className="btn btn-primary" id="create-job-btn">
                        <span>+</span> Create New Job
                    </Link>
                </div>

                {/* Filters Bar */}
                <div className="jobs-page__toolbar">
                    <div className="jobs-page__tabs">
                        {['all', 'active', 'draft', 'paused', 'closed'].map(s => (
                            <button
                                key={s}
                                className={`jobs-tab ${filter === s ? 'jobs-tab--active' : ''}`}
                                onClick={() => setFilter(s)}
                            >
                                {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                                <span className="jobs-tab__count">{statusCounts[s as keyof typeof statusCounts]}</span>
                            </button>
                        ))}
                    </div>

                    <div className="jobs-page__actions">
                        <div className="jobs-search">
                            <span className="jobs-search__icon">🔍</span>
                            <input
                                type="text"
                                className="jobs-search__input"
                                placeholder="Search jobs..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                id="jobs-search"
                            />
                        </div>
                        <div className="jobs-view-toggle">
                            <button className={`jvt-btn ${viewMode === 'grid' ? 'jvt-btn--active' : ''}`} onClick={() => setViewMode('grid')}>⊞</button>
                            <button className={`jvt-btn ${viewMode === 'table' ? 'jvt-btn--active' : ''}`} onClick={() => setViewMode('table')}>☰</button>
                        </div>
                    </div>
                </div>

                {/* Grid View */}
                {viewMode === 'grid' ? (
                    <div className="jobs-grid">
                        {filtered.map(job => (
                            <Link to={`/dashboard/jobs/${job._id}`} key={job._id} className="job-card glass-card" id={`job-${job._id}`}>
                                <div className="job-card__top">
                                    <span className="job-card__status" style={{ background: `${statusColors[job.status]}20`, color: statusColors[job.status] }}>
                                        {job.status}
                                    </span>
                                    <span className="job-card__time">{daysSince(job.createdAt)}</span>
                                </div>

                                <h4 className="job-card__title">{job.title}</h4>
                                <div className="job-card__meta">
                                    <span>🏢 {job.department}</span>
                                    <span>📍 {job.location}</span>
                                </div>

                                <div className="job-card__tags">
                                    <span className="job-tag">{typeLabels[job.type]}</span>
                                    <span className="job-tag">{job.experience}</span>
                                </div>

                                {/* Mini pipeline */}
                                <div className="job-card__pipeline">
                                    <div className="job-card__pipeline-labels">
                                        <span>Pipeline</span>
                                        <span>{job.totalApplicants} total</span>
                                    </div>
                                    <div className="job-card__pipeline-bar">
                                        {job.totalApplicants > 0 && (
                                            <>
                                                <div style={{ width: `${(job.pipeline.sourced / job.totalApplicants) * 100}%`, background: '#6c5ce7' }}></div>
                                                <div style={{ width: `${(job.pipeline.applied / job.totalApplicants) * 100}%`, background: '#00cec9' }}></div>
                                                <div style={{ width: `${(job.pipeline.screening / job.totalApplicants) * 100}%`, background: '#74b9ff' }}></div>
                                                <div style={{ width: `${(job.pipeline.interview / job.totalApplicants) * 100}%`, background: '#fdcb6e' }}></div>
                                                <div style={{ width: `${(job.pipeline.offered / job.totalApplicants) * 100}%`, background: '#fd79a8' }}></div>
                                                <div style={{ width: `${(job.pipeline.hired / job.totalApplicants) * 100}%`, background: '#00b894' }}></div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="job-card__footer">
                                    <span>👥 {job.totalApplicants} candidates</span>
                                    <span className="job-card__arrow">→</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    /* Table View */
                    <div className="jobs-table-wrapper">
                        <table className="jobs-table">
                            <thead>
                                <tr>
                                    <th>JOB TITLE</th>
                                    <th>DEPARTMENT</th>
                                    <th>LOCATION</th>
                                    <th>TYPE</th>
                                    <th>STATUS</th>
                                    <th>APPLICANTS</th>
                                    <th>POSTED</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(job => (
                                    <tr key={job._id}>
                                        <td>
                                            <Link to={`/dashboard/jobs/${job._id}`} className="jobs-table__title">{job.title}</Link>
                                        </td>
                                        <td className="text-muted">{job.department}</td>
                                        <td className="text-muted">{job.location}</td>
                                        <td><span className="job-tag">{typeLabels[job.type]}</span></td>
                                        <td>
                                            <span className="job-card__status" style={{ background: `${statusColors[job.status]}20`, color: statusColors[job.status] }}>
                                                {job.status}
                                            </span>
                                        </td>
                                        <td className="text-muted">{job.totalApplicants}</td>
                                        <td className="text-muted">{daysSince(job.createdAt)}</td>
                                        <td>
                                            <Link to={`/dashboard/jobs/${job._id}`} className="btn btn-ghost btn-sm">View</Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {filtered.length === 0 && (
                    <div className="jobs-empty">
                        <div className="jobs-empty__icon">💼</div>
                        <h4>No jobs found</h4>
                        <p className="text-muted">Try adjusting your filters or create a new job.</p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default JobsPage;
