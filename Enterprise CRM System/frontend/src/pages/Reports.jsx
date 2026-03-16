import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import {
    BarChart3, TrendingUp, Users, Target, DollarSign,
    PieChart, Activity, ArrowUpRight, ArrowDownRight,
    Filter, Calendar, RefreshCw, AlertTriangle, Award,
    Layers, ArrowRight, ChevronDown, Zap
} from 'lucide-react';
import {
    BarChart, Bar, LineChart, Line, PieChart as RechartsPie, Pie, Cell,
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer, FunnelChart, Funnel, LabelList
} from 'recharts';

const TABS = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'pipeline', label: 'Pipeline', icon: Layers },
    { id: 'forecast', label: 'Forecast', icon: TrendingUp },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'conversion', label: 'Conversion', icon: Target },
];

const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#f43f5e', '#a855f7', '#ec4899'];
const CHART_THEME = {
    grid: 'rgba(148, 163, 184, 0.08)',
    axis: '#64748b',
    tooltip: {
        bg: 'rgba(15, 15, 35, 0.95)',
        border: 'rgba(99, 102, 241, 0.3)',
        text: '#f1f5f9',
    },
};

const formatCurrency = (val) => {
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
                        ? formatCurrency(entry.value)
                        : entry.value}
                </p>
            ))}
        </div>
    );
};

// ─── Overview Tab ──────────────────────────────────────
const OverviewTab = ({ data }) => {
    if (!data) return <LoadingState />;

    const kpis = [
        { label: 'Total Revenue', value: formatCurrency(data.totalRevenue), icon: DollarSign, color: 'emerald', sub: `${data.wonCount} deals won` },
        { label: 'Win Rate', value: `${data.winRate}%`, icon: Target, color: 'indigo', sub: `${data.wonCount}W / ${data.lostDeals}L` },
        { label: 'Avg Deal Size', value: formatCurrency(data.avgDealSize), icon: TrendingUp, color: 'cyan', sub: `${data.avgSalesCycle}d avg cycle` },
        { label: 'Conversion Rate', value: `${data.conversionRate}%`, icon: Zap, color: 'amber', sub: `${data.convertedLeads}/${data.totalLeads} leads` },
        { label: 'Open Deals', value: data.openDeals, icon: Layers, color: 'violet', sub: `${data.totalDeals} total` },
        { label: 'Activities', value: data.totalActivities, icon: Activity, color: 'rose', sub: `${data.pendingTasks} tasks pending` },
    ];

    return (
        <div className="report-tab-content">
            <div className="report-kpi-grid">
                {kpis.map((kpi, i) => (
                    <div className="report-kpi-card" key={kpi.label} style={{ animationDelay: `${i * 0.05}s` }}>
                        <div className="kpi-header">
                            <span className="kpi-label">{kpi.label}</span>
                            <div className={`kpi-icon ${kpi.color}`}><kpi.icon size={18} /></div>
                        </div>
                        <div className="kpi-value" style={{ fontSize: '1.75rem' }}>{kpi.value}</div>
                        <div className="kpi-change" style={{ color: 'var(--text-muted)' }}>{kpi.sub}</div>
                    </div>
                ))}
            </div>

            <div className="report-charts-row">
                <div className="report-chart-card report-chart-wide">
                    <h3 className="report-chart-title">Revenue Trend</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={data.revenueByMonth || []}>
                            <defs>
                                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} />
                            <XAxis dataKey="month" tick={{ fill: CHART_THEME.axis, fontSize: 12 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: CHART_THEME.axis, fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={formatCurrency} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2.5} fill="url(#revGrad)" name="Revenue" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className="report-chart-card">
                    <h3 className="report-chart-title">Win / Loss Ratio</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <RechartsPie>
                            <Pie
                                data={[
                                    { name: 'Won', value: data.wonCount || 0 },
                                    { name: 'Lost', value: data.lostDeals || 0 },
                                    { name: 'Open', value: data.openDeals || 0 },
                                ]}
                                cx="50%" cy="50%" innerRadius={65} outerRadius={100}
                                paddingAngle={3} dataKey="value" strokeWidth={0}
                            >
                                <Cell fill="#10b981" />
                                <Cell fill="#ef4444" />
                                <Cell fill="#6366f1" />
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend iconType="circle" wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
                        </RechartsPie>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

// ─── Pipeline Tab ──────────────────────────────────────
const PipelineTab = ({ data }) => {
    if (!data) return <LoadingState />;

    return (
        <div className="report-tab-content">
            <div className="report-charts-row">
                <div className="report-chart-card report-chart-wide">
                    <h3 className="report-chart-title">Stage Distribution</h3>
                    <ResponsiveContainer width="100%" height={320}>
                        <BarChart data={data.stages || []} barSize={40}>
                            <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} />
                            <XAxis dataKey="name" tick={{ fill: CHART_THEME.axis, fontSize: 11 }} axisLine={false} tickLine={false} angle={-20} textAnchor="end" height={60} />
                            <YAxis tick={{ fill: CHART_THEME.axis, fontSize: 12 }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="count" name="Deals" radius={[6, 6, 0, 0]}>
                                {(data.stages || []).map((entry, i) => (
                                    <Cell key={i} fill={entry.color || COLORS[i % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="report-chart-card">
                    <h3 className="report-chart-title">Stage Value ($)</h3>
                    <ResponsiveContainer width="100%" height={320}>
                        <BarChart data={data.stages || []} layout="vertical" barSize={24}>
                            <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} horizontal={false} />
                            <XAxis type="number" tick={{ fill: CHART_THEME.axis, fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={formatCurrency} />
                            <YAxis type="category" dataKey="name" tick={{ fill: CHART_THEME.axis, fontSize: 11 }} axisLine={false} tickLine={false} width={100} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="totalValue" name="Value" radius={[0, 6, 6, 0]}>
                                {(data.stages || []).map((entry, i) => (
                                    <Cell key={i} fill={entry.color || COLORS[i % COLORS.length]} opacity={0.8} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Drop-off Analysis */}
            <div className="report-chart-card" style={{ marginTop: 'var(--space-6)' }}>
                <h3 className="report-chart-title">Stage Drop-off Analysis</h3>
                <div className="dropoff-flow">
                    {(data.dropOff || []).map((d, i) => (
                        <div key={i} className="dropoff-item">
                            <div className="dropoff-stage">
                                <span className="dropoff-name">{d.from}</span>
                                <span className="dropoff-count">{d.fromCount} deals</span>
                            </div>
                            <div className="dropoff-arrow">
                                <ArrowRight size={16} />
                                <span className={`dropoff-rate ${d.conversionRate >= 50 ? 'good' : 'poor'}`}>
                                    {d.conversionRate}%
                                </span>
                            </div>
                            <div className="dropoff-stage">
                                <span className="dropoff-name">{d.to}</span>
                                <span className="dropoff-count">{d.toCount} deals</span>
                            </div>
                            {/* Visual bar */}
                            <div className="dropoff-bar-track">
                                <div
                                    className="dropoff-bar-fill"
                                    style={{
                                        width: `${d.conversionRate}%`,
                                        background: d.conversionRate >= 50
                                            ? 'linear-gradient(90deg, #10b981, #06b6d4)'
                                            : 'linear-gradient(90deg, #f59e0b, #ef4444)',
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Avg Time per Stage */}
            <div className="report-chart-card" style={{ marginTop: 'var(--space-6)' }}>
                <h3 className="report-chart-title">Average Time per Stage (days)</h3>
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={data.avgTimePerStage || []} barSize={35}>
                        <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} />
                        <XAxis dataKey="stage" tick={{ fill: CHART_THEME.axis, fontSize: 11 }} axisLine={false} tickLine={false} angle={-20} textAnchor="end" height={60} />
                        <YAxis tick={{ fill: CHART_THEME.axis, fontSize: 12 }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="avgDays" name="Avg Days" radius={[6, 6, 0, 0]}>
                            {(data.avgTimePerStage || []).map((entry, i) => (
                                <Cell key={i} fill={entry.color || COLORS[i % COLORS.length]} opacity={0.85} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

// ─── Forecast Tab ──────────────────────────────────────
const ForecastTab = ({ data }) => {
    if (!data) return <LoadingState />;

    const forecastKpis = [
        { label: 'Pipeline Value', value: formatCurrency(data.totalPipeline), color: 'indigo', icon: Layers },
        { label: 'Weighted Forecast', value: formatCurrency(data.weightedForecast), color: 'cyan', icon: TrendingUp },
        { label: 'Best Case', value: formatCurrency(data.bestCase), color: 'emerald', icon: ArrowUpRight },
        { label: 'Worst Case', value: formatCurrency(data.worstCase), color: 'amber', icon: ArrowDownRight },
        { label: 'Total Won', value: formatCurrency(data.totalWon), color: 'emerald', icon: DollarSign },
    ];

    return (
        <div className="report-tab-content">
            <div className="report-kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                {forecastKpis.map((kpi, i) => (
                    <div className="report-kpi-card" key={kpi.label} style={{ animationDelay: `${i * 0.05}s` }}>
                        <div className="kpi-header">
                            <span className="kpi-label">{kpi.label}</span>
                            <div className={`kpi-icon ${kpi.color}`}><kpi.icon size={18} /></div>
                        </div>
                        <div className="kpi-value" style={{ fontSize: '1.5rem' }}>{kpi.value}</div>
                    </div>
                ))}
            </div>

            <div className="report-chart-card" style={{ marginTop: 'var(--space-6)' }}>
                <h3 className="report-chart-title">Forecast vs Actual</h3>
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={data.monthlyBreakdown || []} barGap={4}>
                        <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} />
                        <XAxis dataKey="month" tick={{ fill: CHART_THEME.axis, fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: CHART_THEME.axis, fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={formatCurrency} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
                        <Bar dataKey="weighted" name="Weighted Forecast" fill="#6366f1" radius={[4, 4, 0, 0]} opacity={0.8} />
                        <Bar dataKey="actual" name="Actual Won" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* At-Risk Deals */}
            {data.atRiskDeals?.length > 0 && (
                <div className="report-chart-card" style={{ marginTop: 'var(--space-6)' }}>
                    <h3 className="report-chart-title">
                        <AlertTriangle size={18} style={{ color: 'var(--accent-amber)', marginRight: 8 }} />
                        Deals at Risk
                    </h3>
                    <div className="at-risk-table">
                        <div className="at-risk-header">
                            <span>Deal</span><span>Value</span><span>Stage</span><span>Probability</span><span>Owner</span>
                        </div>
                        {data.atRiskDeals.map(deal => (
                            <div key={deal.id} className="at-risk-row">
                                <span className="at-risk-name">{deal.title}</span>
                                <span>{formatCurrency(deal.value)}</span>
                                <span className="at-risk-stage">{deal.stage}</span>
                                <span>
                                    <span className={`probability-badge ${deal.probability < 25 ? 'cold' : 'warm'}`}>
                                        {deal.probability}%
                                    </span>
                                </span>
                                <span style={{ color: 'var(--text-muted)' }}>{deal.owner}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// ─── Team Tab ──────────────────────────────────────
const TeamTab = ({ data }) => {
    if (!data) return <LoadingState />;

    const { leaderboard = [], teamTotals = {} } = data;

    return (
        <div className="report-tab-content">
            {/* Team Summary KPIs */}
            <div className="report-kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: 'var(--space-6)' }}>
                {[
                    { label: 'Team Revenue', value: formatCurrency(teamTotals.totalRevenue), color: 'emerald', icon: DollarSign },
                    { label: 'Deals Won', value: teamTotals.totalDealsWon, color: 'indigo', icon: Target },
                    { label: 'Avg Win Rate', value: `${teamTotals.avgWinRate}%`, color: 'cyan', icon: TrendingUp },
                    { label: 'Total Activities', value: teamTotals.totalActivities, color: 'amber', icon: Activity },
                ].map((kpi, i) => (
                    <div className="report-kpi-card" key={kpi.label} style={{ animationDelay: `${i * 0.05}s` }}>
                        <div className="kpi-header">
                            <span className="kpi-label">{kpi.label}</span>
                            <div className={`kpi-icon ${kpi.color}`}><kpi.icon size={18} /></div>
                        </div>
                        <div className="kpi-value" style={{ fontSize: '1.5rem' }}>{kpi.value}</div>
                    </div>
                ))}
            </div>

            {/* Revenue Chart */}
            <div className="report-chart-card">
                <h3 className="report-chart-title">Revenue by Salesperson</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={leaderboard.slice(0, 10)} barSize={32}>
                        <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} />
                        <XAxis dataKey="name" tick={{ fill: CHART_THEME.axis, fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: CHART_THEME.axis, fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={formatCurrency} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="revenue" name="Revenue" radius={[6, 6, 0, 0]}>
                            {leaderboard.slice(0, 10).map((_, i) => (
                                <Cell key={i} fill={COLORS[i % COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Leaderboard Table */}
            <div className="report-chart-card" style={{ marginTop: 'var(--space-6)' }}>
                <h3 className="report-chart-title">
                    <Award size={18} style={{ color: 'var(--accent-amber)', marginRight: 8 }} />
                    Sales Leaderboard
                </h3>
                <div className="leaderboard-table">
                    <div className="leaderboard-header">
                        <span>#</span><span>Name</span><span>Revenue</span><span>Won</span><span>Lost</span><span>Win Rate</span><span>Activities</span>
                    </div>
                    {leaderboard.map((user, i) => (
                        <div key={user.id} className={`leaderboard-row ${i < 3 ? 'top-three' : ''}`}>
                            <span className={`leaderboard-rank ${i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : ''}`}>
                                {i + 1}
                            </span>
                            <span className="leaderboard-name">
                                <div className="leaderboard-avatar">
                                    {user.name?.charAt(0)?.toUpperCase()}
                                </div>
                                <div>
                                    <div>{user.name}</div>
                                    <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
                                        {user.role?.replace('_', ' ')}
                                    </div>
                                </div>
                            </span>
                            <span className="leaderboard-revenue">{formatCurrency(user.revenue)}</span>
                            <span style={{ color: 'var(--accent-emerald)' }}>{user.dealsWon}</span>
                            <span style={{ color: 'var(--accent-rose)' }}>{user.dealsLost}</span>
                            <span>
                                <span className={`probability-badge ${user.winRate >= 60 ? 'hot' : user.winRate >= 40 ? 'warm' : 'cold'}`}>
                                    {user.winRate}%
                                </span>
                            </span>
                            <span>{user.activityCount}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// ─── Conversion Tab ──────────────────────────────────────
const ConversionTab = ({ data }) => {
    if (!data) return <LoadingState />;

    return (
        <div className="report-tab-content">
            {/* Overall conversion */}
            <div className="report-kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', marginBottom: 'var(--space-6)' }}>
                <div className="report-kpi-card">
                    <div className="kpi-header">
                        <span className="kpi-label">Overall Conversion</span>
                        <div className="kpi-icon emerald"><Target size={18} /></div>
                    </div>
                    <div className="kpi-value" style={{ fontSize: '2rem' }}>{data.overallConversion}%</div>
                    <div className="kpi-change" style={{ color: 'var(--text-muted)' }}>Lead to Won Deal</div>
                </div>
            </div>

            {/* Funnel Chart */}
            <div className="report-chart-card">
                <h3 className="report-chart-title">Sales Funnel</h3>
                <div className="funnel-container">
                    {(data.funnel || []).map((stage, i) => {
                        const maxCount = Math.max(...(data.funnel || []).map(s => s.count), 1);
                        const widthPct = Math.max(20, (stage.count / maxCount) * 100);
                        const convRate = data.conversionRates?.[i];
                        return (
                            <div key={stage.stage} className="funnel-row" style={{ animationDelay: `${i * 0.08}s` }}>
                                <div className="funnel-label">
                                    <span className="funnel-stage-name">{stage.stage}</span>
                                    <span className="funnel-stage-count">{stage.count}</span>
                                </div>
                                <div className="funnel-bar-wrapper">
                                    <div
                                        className="funnel-bar"
                                        style={{
                                            width: `${widthPct}%`,
                                            background: `linear-gradient(90deg, ${stage.color}, ${stage.color}88)`,
                                        }}
                                    />
                                </div>
                                {convRate && (
                                    <div className="funnel-conv-rate">
                                        <ArrowDownRight size={12} />
                                        {convRate.rate}%
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Source Breakdown */}
            <div className="report-charts-row" style={{ marginTop: 'var(--space-6)' }}>
                <div className="report-chart-card report-chart-wide">
                    <h3 className="report-chart-title">Lead Source Performance</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data.sources || []} barGap={4}>
                            <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} />
                            <XAxis dataKey="source" tick={{ fill: CHART_THEME.axis, fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: CHART_THEME.axis, fontSize: 12 }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
                            <Bar dataKey="count" name="Total Leads" fill="#6366f1" radius={[4, 4, 0, 0]} opacity={0.7} />
                            <Bar dataKey="converted" name="Converted" fill="#10b981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="report-chart-card">
                    <h3 className="report-chart-title">Source Conversion Rates</h3>
                    <div className="source-rates">
                        {(data.sources || []).map((src, i) => (
                            <div key={src.source} className="source-rate-item">
                                <div className="source-rate-header">
                                    <span className="source-name">{src.source?.replace('_', ' ')}</span>
                                    <span className="source-rate-value">{src.conversionRate}%</span>
                                </div>
                                <div className="source-rate-bar-track">
                                    <div
                                        className="source-rate-bar-fill"
                                        style={{
                                            width: `${src.conversionRate}%`,
                                            background: COLORS[i % COLORS.length],
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─── Loading State ──────────────────────────────────────
const LoadingState = () => (
    <div className="report-loading">
        <div className="report-loading-grid">
            {[1, 2, 3, 4].map(i => (
                <div key={i} className="skeleton-card" />
            ))}
        </div>
        <div className="skeleton-chart" />
    </div>
);

// ─── Main Reports Page ──────────────────────────────────────
const Reports = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [dashboardData, setDashboardData] = useState(null);
    const [pipelineData, setPipelineData] = useState(null);
    const [forecastData, setForecastData] = useState(null);
    const [teamData, setTeamData] = useState(null);
    const [conversionData, setConversionData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [dateRange, setDateRange] = useState('all');
    const [error, setError] = useState('');

    const getDateParams = useCallback(() => {
        const now = new Date();
        const params = {};
        switch (dateRange) {
            case 'today':
                params.startDate = now.toISOString().split('T')[0];
                params.endDate = now.toISOString().split('T')[0];
                break;
            case 'week': {
                const weekAgo = new Date(now);
                weekAgo.setDate(weekAgo.getDate() - 7);
                params.startDate = weekAgo.toISOString().split('T')[0];
                params.endDate = now.toISOString().split('T')[0];
                break;
            }
            case 'month': {
                const monthAgo = new Date(now);
                monthAgo.setMonth(monthAgo.getMonth() - 1);
                params.startDate = monthAgo.toISOString().split('T')[0];
                params.endDate = now.toISOString().split('T')[0];
                break;
            }
            case 'quarter': {
                const qAgo = new Date(now);
                qAgo.setMonth(qAgo.getMonth() - 3);
                params.startDate = qAgo.toISOString().split('T')[0];
                params.endDate = now.toISOString().split('T')[0];
                break;
            }
            default:
                break;
        }
        return params;
    }, [dateRange]);

    const fetchData = useCallback(async (tab) => {
        setLoading(true);
        setError('');
        const params = getDateParams();
        try {
            switch (tab) {
                case 'overview': {
                    const { data } = await api.get('/reports/dashboard', { params });
                    setDashboardData(data.data);
                    break;
                }
                case 'pipeline': {
                    const { data } = await api.get('/reports/pipeline', { params });
                    setPipelineData(data.data);
                    break;
                }
                case 'forecast': {
                    const { data } = await api.get('/reports/forecast', { params });
                    setForecastData(data.data);
                    break;
                }
                case 'team': {
                    const { data } = await api.get('/reports/team', { params });
                    setTeamData(data.data);
                    break;
                }
                case 'conversion': {
                    const { data } = await api.get('/reports/conversion', { params });
                    setConversionData(data.data);
                    break;
                }
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load report data');
        } finally {
            setLoading(false);
        }
    }, [getDateParams]);

    useEffect(() => {
        fetchData(activeTab);
    }, [activeTab, fetchData]);

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
    };

    const handleRefresh = () => {
        fetchData(activeTab);
    };

    return (
        <div>
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Reports & Analytics</h1>
                    <p className="page-subtitle">Track performance, analyze trends, and forecast revenue</p>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
                    {/* Date Filter */}
                    <div className="report-date-filter">
                        <Calendar size={14} />
                        <select
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                            className="report-date-select"
                        >
                            <option value="all">All Time</option>
                            <option value="today">Today</option>
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                            <option value="quarter">This Quarter</option>
                        </select>
                        <ChevronDown size={14} />
                    </div>
                    <button className="btn btn-ghost btn-sm" onClick={handleRefresh} disabled={loading}>
                        <RefreshCw size={16} className={loading ? 'spinning' : ''} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="report-tabs">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        className={`report-tab ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => handleTabChange(tab.id)}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Error */}
            {error && (
                <div className="alert alert-error" style={{ marginBottom: 'var(--space-4)' }}>
                    <AlertTriangle size={16} />
                    {error}
                </div>
            )}

            {/* Tab Content */}
            <div className="report-content">
                {activeTab === 'overview' && <OverviewTab data={dashboardData} />}
                {activeTab === 'pipeline' && <PipelineTab data={pipelineData} />}
                {activeTab === 'forecast' && <ForecastTab data={forecastData} />}
                {activeTab === 'team' && <TeamTab data={teamData} />}
                {activeTab === 'conversion' && <ConversionTab data={conversionData} />}
            </div>
        </div>
    );
};

export default Reports;
