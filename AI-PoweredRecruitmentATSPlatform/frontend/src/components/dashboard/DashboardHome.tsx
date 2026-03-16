import { useEffect, useState } from 'react';
import './DashboardHome.css';

/* ---- Animated Counter Hook ---- */
const useCountUp = (end: number, duration = 1500, start = true) => {
    const [count, setCount] = useState(0);
    useEffect(() => {
        if (!start) return;
        let raf: number;
        let t0: number | null = null;
        const step = (ts: number) => {
            if (!t0) t0 = ts;
            const p = Math.min((ts - t0) / duration, 1);
            setCount(Math.floor((1 - Math.pow(1 - p, 3)) * end));
            if (p < 1) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
        return () => cancelAnimationFrame(raf);
    }, [end, duration, start]);
    return count;
};

/* ==== Stat Cards ==== */
const statCards = [
    { icon: '💼', label: 'Active Jobs', value: 24, trend: '+12%', trendUp: true, color: '#6c5ce7', sparkline: [4, 6, 5, 8, 7, 9, 10, 12] },
    { icon: '👥', label: 'Total Candidates', value: 1284, trend: '+5.2%', trendUp: true, color: '#00cec9', sparkline: [30, 45, 42, 60, 58, 72, 80, 89] },
    { icon: '📅', label: 'Interviews Today', value: 8, trend: 'Today', trendUp: true, color: '#fd79a8', sparkline: [2, 3, 1, 4, 3, 5, 6, 8] },
    { icon: '⏱️', label: 'Avg. Time to Hire', value: 14.2, trend: '-2.1d', trendUp: true, color: '#e17055', sparkline: [22, 20, 19, 18, 17, 16, 15, 14] },
];

const StatCard = ({ icon, label, value, trend, trendUp, color, sparkline }: typeof statCards[0]) => {
    const count = useCountUp(Math.floor(value));
    const displayVal = value >= 1000 ? `${(count / 1000).toFixed(0)},${String(count % 1000).padStart(3, '0')}` :
        value % 1 !== 0 ? `${count}.${String(value).split('.')[1]}` : String(count);

    const maxSpark = Math.max(...sparkline);

    return (
        <div className="stat-card glass-card" style={{ '--stat-c': color } as React.CSSProperties}>
            <div className="stat-card__top">
                <div className="stat-card__icon">{icon}</div>
                <span className={`stat-card__trend ${trendUp ? 'stat-card__trend--up' : 'stat-card__trend--down'}`}>
                    {trend}
                </span>
            </div>
            <div className="stat-card__label">{label}</div>
            <div className="stat-card__value">{displayVal}</div>
            {/* Mini sparkline */}
            <svg className="stat-card__sparkline" viewBox="0 0 120 30" preserveAspectRatio="none">
                <polyline
                    points={sparkline.map((v, i) => `${(i / (sparkline.length - 1)) * 120},${30 - (v / maxSpark) * 25}`).join(' ')}
                    fill="none"
                    stroke={color}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.6"
                />
            </svg>
        </div>
    );
};

/* ==== Dashboard Home Component ==== */
const DashboardHome = () => {
    const [stats, setStats] = useState({ jobs: 0, candidates: 0, interviews: 0 });
    const [pipeline, setPipeline] = useState<any[]>([]);
    const [recentInterviews, setRecentInterviews] = useState<any[]>([]);
    const [topCands, setTopCands] = useState<any[]>([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            const token = localStorage.getItem('token');
            const headers: Record<string, string> = token ? { 'Authorization': `Bearer ${token}` } : {};

            try {
                // Fetch insights for KPI and pipeline overview
                const insightsRes = await fetch('/api/insights/overview', { headers });
                if (insightsRes.ok) {
                    const data = await insightsRes.json();
                    setStats({
                        jobs: data?.kpis?.activeJobs || 0,
                        candidates: data?.kpis?.totalCandidates || 0,
                        interviews: data?.kpis?.scheduledInterviews || 0,
                    });

                    const pipelineData = data?.funnel || [
                        { stage: 'Sourced', count: 0 },
                        { stage: 'Applied', count: 0 },
                        { stage: 'Interviewing', count: 0 },
                        { stage: 'Offered', count: 0 }
                    ];

                    const mappedPipeline = [
                        { label: 'SOURCED', count: pipelineData.find((f: any) => f.stage === 'Sourced')?.count || 0, color: '#6c5ce7', pct: 100 },
                        { label: 'APPLIED', count: pipelineData.find((f: any) => f.stage === 'Applied')?.count || 0, color: '#00cec9', pct: 63 },
                        { label: 'INTERVIEW', count: pipelineData.find((f: any) => f.stage === 'Interviewing')?.count || 0, color: '#fd79a8', pct: 29 },
                        { label: 'OFFERED', count: pipelineData.find((f: any) => f.stage === 'Offered')?.count || 0, color: '#fdcb6e', pct: 15 },
                    ];
                    setPipeline(mappedPipeline);
                    setTopCands(data?.topCandidates || []);
                }

                // Fetch upcoming interviews
                const intvRes = await fetch('/api/interviews', { headers });
                if (intvRes.ok) {
                    const intvData = await intvRes.json();
                    if (intvData.interviews?.length) {
                        const future = intvData.interviews
                            .filter((i: any) => new Date(i.scheduledAt) >= new Date() && i.status !== 'completed')
                            .sort((a: any, b: any) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
                            .slice(0, 3)
                            .map((i: any) => ({
                                name: i.candidate?.firstName ? `${i.candidate.firstName} ${i.candidate.lastName}` : 'Candidate',
                                role: i.job?.title || 'Role',
                                time: new Date(i.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                type: i.type.charAt(0).toUpperCase() + i.type.slice(1),
                                status: i.status
                            }));
                        setRecentInterviews(future);
                    }
                }
            } catch (err) {
                console.error("Dashboard data fetch failed", err);
            }
        };

        fetchDashboardData();
    }, []);

    const dynamicStatCards = [
        { icon: '💼', label: 'Active Jobs', value: stats.jobs, trend: 'Current', trendUp: true, color: '#6c5ce7', sparkline: [4, 6, 5, 8, 7, 9, 10, stats.jobs] },
        { icon: '👥', label: 'Total Candidates', value: stats.candidates, trend: 'Total', trendUp: true, color: '#00cec9', sparkline: [30, 45, 42, 60, 58, 72, 80, stats.candidates] },
        { icon: '📅', label: 'Scheduled Interviews', value: stats.interviews, trend: 'Upcoming', trendUp: true, color: '#fd79a8', sparkline: [2, 3, 1, 4, 3, 5, 6, stats.interviews] },
        { icon: '⏱️', label: 'Avg. Time to Hire', value: 14.2, trend: 'Days', trendUp: true, color: '#e17055', sparkline: [22, 20, 19, 18, 17, 16, 15, 14] },
    ];

    return (
        <div className="dash-home">
            {/* Row 1: Stat Cards */}
            <div className="dash-home__stats stagger-children">
                {dynamicStatCards.map((card, i) => (
                    <StatCard key={i} {...card} />
                ))}
            </div>

            {/* Row 2: Pipeline + AI Activity */}
            <div className="dash-home__row2">
                <div className="dash-panel glass-card dash-panel--pipeline">
                    <div className="dash-panel__header">
                        <div>
                            <h4>Hiring Pipeline Overview</h4>
                            <p className="text-muted" style={{ fontSize: '13px' }}>Active candidates across all stages</p>
                        </div>
                        <a href="/dashboard/pipeline" className="btn btn-ghost btn-sm">Full Report</a>
                    </div>
                    <div className="pipeline-funnel">
                        {pipeline.map((stage, i) => (
                            <div key={i} className="pipeline-stage">
                                <span className="pipeline-stage__label">{stage.label}</span>
                                <div className="pipeline-stage__bar-bg">
                                    <div
                                        className="pipeline-stage__bar"
                                        style={{ width: `${stage.pct}%`, background: stage.color }}
                                    >
                                        <span className="pipeline-stage__count">{stage.count}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="dash-panel glass-card dash-panel--activity">
                    <div className="dash-panel__header">
                        <h4>⚡ Recent AI Activity</h4>
                    </div>
                    <div className="ai-feed">
                        {/* Static AI Activities for demonstration, will enhance with actual events later */}
                        <div className="ai-feed__item">
                            <div className="ai-feed__indicator" style={{ background: '#6c5ce7' }}></div>
                            <div className="ai-feed__content">
                                <p>Auto-screened <strong>{stats.candidates} candidates</strong> across roles</p>
                                <span className="ai-feed__time">2 MINUTES AGO</span>
                            </div>
                        </div>
                        <div className="ai-feed__item">
                            <div className="ai-feed__indicator" style={{ background: '#00cec9' }}></div>
                            <div className="ai-feed__content">
                                <p>Ranked new top candidates for <strong>Active Jobs</strong></p>
                                <span className="ai-feed__time">15 MINUTES AGO</span>
                            </div>
                        </div>
                    </div>
                    <a href="/dashboard/ai-insights" className="btn btn-secondary btn-sm" style={{ width: '100%', marginTop: '12px' }}>
                        View All Logs
                    </a>
                </div>
            </div>

            {/* Row 3: Interviews + Top Candidates */}
            <div className="dash-home__row3">
                <div className="dash-panel glass-card dash-panel--interviews">
                    <div className="dash-panel__header">
                        <h4>Upcoming Interviews</h4>
                        <button className="btn btn-ghost btn-sm">•••</button>
                    </div>
                    <div className="interviews-list">
                        {recentInterviews.length === 0 ? (
                            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-tertiary)' }}>No upcoming interviews scheduled.</div>
                        ) : (
                            recentInterviews.map((intv, i) => (
                                <div key={i} className="interview-item">
                                    <div className="interview-item__avatar">
                                        {intv.name.split(' ').map((n: string) => n[0]).join('')}
                                    </div>
                                    <div className="interview-item__info">
                                        <div className="interview-item__name">{intv.name}</div>
                                        <div className="interview-item__meta">{intv.role} · {intv.time}</div>
                                    </div>
                                    <span className={`badge badge-${intv.type === 'Technical' ? 'primary' : intv.type === 'Behavioral' ? 'info' : 'warning'}`}>
                                        {intv.type}
                                    </span>
                                    <button className="btn btn-primary btn-sm">Join Call</button>
                                </div>
                            )))}
                    </div>
                </div>

                <div className="dash-panel glass-card dash-panel--candidates">
                    <div className="dash-panel__header">
                        <h4>Top Candidates</h4>
                        <span className="badge badge-primary" style={{ fontSize: '11px' }}>AI SCORING</span>
                    </div>
                    <table className="candidates-table">
                        <thead>
                            <tr>
                                <th>CANDIDATE</th>
                                <th>MATCH</th>
                                <th>SOURCE</th>
                                <th>STATUS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topCands.length === 0 ? (
                                <tr>
                                    <td colSpan={4} style={{ textAlign: 'center', padding: '20px', color: 'var(--text-tertiary)' }}>No candidates found.</td>
                                </tr>
                            ) : (
                                topCands.slice(0, 5).map((c, i) => (
                                    <tr key={i}>
                                        <td>
                                            <div className="candidate-cell">
                                                <div className="candidate-cell__avatar">
                                                    {c.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                                                </div>
                                                {c.name}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="match-badge" style={{ '--match-c': c.aiScore >= 95 ? '#00b894' : c.aiScore >= 90 ? '#00cec9' : '#fdcb6e' } as React.CSSProperties}>
                                                {c.aiScore}%
                                            </div>
                                        </td>
                                        <td className="text-muted">Direct</td>
                                        <td>
                                            <span className="badge" style={{ background: `${'#6c5ce7'}20`, color: '#6c5ce7' }}>
                                                Candidate
                                            </span>
                                        </td>
                                    </tr>
                                )))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DashboardHome;
