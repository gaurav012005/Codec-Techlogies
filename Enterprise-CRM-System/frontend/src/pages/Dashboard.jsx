import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import {
    TrendingUp, Users, DollarSign, Target,
    ArrowUpRight, ArrowDownRight, Activity, Layers,
    BarChart3, Zap, RefreshCw, AlertTriangle
} from 'lucide-react';
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#f43f5e'];

const formatCurrency = (val) => {
    if (!val) return '$0';
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(1)}K`;
    return `$${val}`;
};

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="report-tooltip">
            <p className="report-tooltip-label">{label}</p>
            {payload.map((entry, i) => (
                <p key={i} style={{ color: entry.color }} className="report-tooltip-value">
                    {entry.name}: {typeof entry.value === 'number' && entry.value > 100
                        ? formatCurrency(entry.value) : entry.value}
                </p>
            ))}
        </div>
    );
};

const Dashboard = () => {
    const { user, organization } = useAuth();
    const [data, setData] = useState(null);
    const [pipelineData, setPipelineData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchDashboard = async () => {
        setLoading(true);
        try {
            const [dashRes, pipeRes] = await Promise.all([
                api.get('/reports/dashboard'),
                api.get('/reports/pipeline'),
            ]);
            setData(dashRes.data.data);
            setPipelineData(pipeRes.data.data);
            setError('');
        } catch (err) {
            setError('Failed to load dashboard data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 17) return 'Good afternoon';
        return 'Good evening';
    };

    const kpiData = data ? [
        {
            label: 'Total Revenue',
            value: formatCurrency(data.totalRevenue),
            change: `${data.wonCount} deals won`,
            positive: true,
            icon: DollarSign,
            color: 'emerald',
        },
        {
            label: 'Active Deals',
            value: data.openDeals || 0,
            change: `${data.totalDeals} total deals`,
            positive: true,
            icon: Layers,
            color: 'indigo',
        },
        {
            label: 'Total Leads',
            value: data.totalLeads || 0,
            change: `${data.conversionRate}% conversion`,
            positive: data.conversionRate > 0,
            icon: Users,
            color: 'cyan',
        },
        {
            label: 'Win Rate',
            value: `${data.winRate || 0}%`,
            change: `${data.avgSalesCycle}d avg cycle`,
            positive: data.winRate >= 50,
            icon: Target,
            color: 'amber',
        },
    ] : [];

    // Donut chart data
    const dealStatusData = data ? [
        { name: 'Won', value: data.wonCount || 0 },
        { name: 'Lost', value: data.lostDeals || 0 },
        { name: 'Open', value: data.openDeals || 0 },
    ] : [];

    return (
        <div>
            {/* Welcome Section */}
            <div className="welcome-section">
                <div className="welcome-card">
                    <h1 className="welcome-title">
                        {getGreeting()}, {user?.name?.split(' ')[0] || 'there'}!
                    </h1>
                    <p className="welcome-text">
                        Welcome to {organization?.name || 'your'} CRM dashboard.
                        {data
                            ? ` You have ${data.openDeals} open deals worth ${formatCurrency(data.totalRevenue)} in revenue.`
                            : ' Loading your performance data...'
                        }
                    </p>
                    <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
                        <Link to="/pipeline" className="btn btn-primary btn-sm">View Pipeline</Link>
                        <Link to="/reports" className="btn btn-ghost btn-sm">Full Reports</Link>
                    </div>
                </div>
            </div>

            {error && (
                <div className="alert alert-error" style={{ marginBottom: 'var(--space-4)' }}>
                    <AlertTriangle size={16} />
                    {error}
                    <button className="btn btn-ghost btn-sm" onClick={fetchDashboard} style={{ marginLeft: 'auto' }}>
                        <RefreshCw size={14} /> Retry
                    </button>
                </div>
            )}

            {/* KPI Cards */}
            <div className="kpi-grid">
                {loading ? (
                    [1, 2, 3, 4].map(i => (
                        <div key={i} className="kpi-card">
                            <div className="skeleton-line" style={{ width: '60%', height: 14, marginBottom: 12 }} />
                            <div className="skeleton-line" style={{ width: '40%', height: 32, marginBottom: 8 }} />
                            <div className="skeleton-line" style={{ width: '50%', height: 12 }} />
                        </div>
                    ))
                ) : (
                    kpiData.map((kpi, index) => (
                        <div
                            className="kpi-card"
                            key={kpi.label}
                            style={{ animationDelay: `${index * 0.1}s`, animation: 'fadeInUp 0.5s ease-out backwards' }}
                        >
                            <div className="kpi-header">
                                <span className="kpi-label">{kpi.label}</span>
                                <div className={`kpi-icon ${kpi.color}`}>
                                    <kpi.icon size={20} />
                                </div>
                            </div>
                            <div className="kpi-value">{kpi.value}</div>
                            <div className={`kpi-change ${kpi.positive ? 'positive' : 'negative'}`}>
                                {kpi.positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                {kpi.change}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Charts Row */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr',
                gap: 'var(--space-6)',
                marginBottom: 'var(--space-6)',
            }}>
                {/* Revenue Trend */}
                <div className="kpi-card" style={{ minHeight: 320 }}>
                    <h3 style={{
                        fontSize: 'var(--font-sm)',
                        fontWeight: 600,
                        color: 'var(--text-secondary)',
                        marginBottom: 'var(--space-4)',
                        display: 'flex', alignItems: 'center', gap: 8
                    }}>
                        <BarChart3 size={16} style={{ color: 'var(--primary-400)' }} />
                        Revenue Trend
                    </h3>
                    {loading ? (
                        <div className="skeleton-chart" style={{ height: 250 }} />
                    ) : (
                        <ResponsiveContainer width="100%" height={250}>
                            <AreaChart data={data?.revenueByMonth || []}>
                                <defs>
                                    <linearGradient id="dashGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.08)" />
                                <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={formatCurrency} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2.5} fill="url(#dashGrad)" name="Revenue" />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Deal Status Donut */}
                <div className="kpi-card" style={{ minHeight: 320 }}>
                    <h3 style={{
                        fontSize: 'var(--font-sm)',
                        fontWeight: 600,
                        color: 'var(--text-secondary)',
                        marginBottom: 'var(--space-4)',
                        display: 'flex', alignItems: 'center', gap: 8
                    }}>
                        <Target size={16} style={{ color: 'var(--accent-cyan)' }} />
                        Deal Status
                    </h3>
                    {loading ? (
                        <div className="skeleton-chart" style={{ height: 250 }} />
                    ) : (
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={dealStatusData}
                                    cx="50%" cy="50%" innerRadius={60} outerRadius={90}
                                    paddingAngle={3} dataKey="value" strokeWidth={0}
                                >
                                    <Cell fill="#10b981" />
                                    <Cell fill="#ef4444" />
                                    <Cell fill="#6366f1" />
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                                <Legend iconType="circle" wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* Pipeline Distribution */}
            {pipelineData?.stages?.length > 0 && (
                <div className="kpi-card" style={{ marginBottom: 'var(--space-6)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                        <h3 style={{
                            fontSize: 'var(--font-sm)',
                            fontWeight: 600,
                            color: 'var(--text-secondary)',
                            display: 'flex', alignItems: 'center', gap: 8
                        }}>
                            <Layers size={16} style={{ color: 'var(--accent-violet)' }} />
                            Pipeline Overview — {pipelineData.pipeline?.name || 'Default'}
                        </h3>
                        <Link to="/pipeline" style={{ fontSize: 'var(--font-xs)', color: 'var(--primary-400)' }}>
                            View Kanban →
                        </Link>
                    </div>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={pipelineData.stages} barSize={36}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.08)" />
                            <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="count" name="Deals" radius={[6, 6, 0, 0]}>
                                {pipelineData.stages.map((entry, i) => (
                                    <Cell key={i} fill={entry.color || COLORS[i % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Quick Stats Row */}
            {data && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: 'var(--space-4)',
                }}>
                    <div className="kpi-card" style={{ textAlign: 'center', padding: 'var(--space-5)' }}>
                        <Activity size={24} style={{ color: 'var(--primary-400)', marginBottom: 8 }} />
                        <div style={{ fontSize: 'var(--font-2xl)', fontWeight: 700 }}>{data.totalActivities}</div>
                        <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>Total Activities</div>
                    </div>
                    <div className="kpi-card" style={{ textAlign: 'center', padding: 'var(--space-5)' }}>
                        <Zap size={24} style={{ color: 'var(--accent-amber)', marginBottom: 8 }} />
                        <div style={{ fontSize: 'var(--font-2xl)', fontWeight: 700 }}>{data.pendingTasks}</div>
                        <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>Pending Tasks</div>
                    </div>
                    <div className="kpi-card" style={{ textAlign: 'center', padding: 'var(--space-5)' }}>
                        <TrendingUp size={24} style={{ color: 'var(--accent-emerald)', marginBottom: 8 }} />
                        <div style={{ fontSize: 'var(--font-2xl)', fontWeight: 700 }}>{data.avgSalesCycle}d</div>
                        <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>Avg Sales Cycle</div>
                    </div>
                    <div className="kpi-card" style={{ textAlign: 'center', padding: 'var(--space-5)' }}>
                        <DollarSign size={24} style={{ color: 'var(--accent-cyan)', marginBottom: 8 }} />
                        <div style={{ fontSize: 'var(--font-2xl)', fontWeight: 700 }}>{formatCurrency(data.avgDealSize)}</div>
                        <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>Avg Deal Size</div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
