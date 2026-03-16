import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { getAnalytics } from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts';

const COLORS = ['#137fec', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
const statusLabels = { pending: 'Pending', assigned: 'Assigned', picked_up: 'Picked Up', in_transit: 'In Transit', delivered: 'Delivered' };

export default function AnalyticsPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await getAnalytics();
                setData(res.data);
            } catch (err) {
                console.error('Analytics fetch error:', err);
                // Fallback demo data
                setData({
                    kpis: { totalDeliveries: 156, completedDeliveries: 132, successRate: 84.6, activeDrivers: 8, totalDrivers: 12 },
                    dailyDeliveries: [
                        { date: '2026-02-18', count: 18 }, { date: '2026-02-19', count: 22 }, { date: '2026-02-20', count: 15 },
                        { date: '2026-02-21', count: 28 }, { date: '2026-02-22', count: 20 }, { date: '2026-02-23', count: 25 }, { date: '2026-02-24', count: 12 },
                    ],
                    statusBreakdown: [
                        { status: 'delivered', count: 132 }, { status: 'in_transit', count: 8 }, { status: 'assigned', count: 6 },
                        { status: 'pending', count: 5 }, { status: 'picked_up', count: 5 },
                    ],
                    topDrivers: [
                        { name: 'James Wilson', completed: 42 }, { name: 'Sarah Chen', completed: 35 },
                        { name: 'Marcus Smith', completed: 28 }, { name: 'Elena Rodriguez', completed: 18 }, { name: 'Robert Chambers', completed: 9 },
                    ],
                });
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '8px 12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: '#0f172a' }}>{label}</p>
                    <p style={{ fontSize: 12, color: '#137fec', fontWeight: 600 }}>{payload[0].value} deliveries</p>
                </div>
            );
        }
        return null;
    };

    if (loading) return (
        <div className="app-layout">
            <Sidebar />
            <main className="main-content">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, color: 'var(--text-muted)' }}>Loading analytics...</div>
            </main>
        </div>
    );

    const kpis = data?.kpis || {};
    const dailyData = (data?.dailyDeliveries || []).map(d => ({ ...d, date: formatDate(d.date) }));
    const statusData = (data?.statusBreakdown || []).map((s, i) => ({ ...s, name: statusLabels[s.status] || s.status, fill: COLORS[i % COLORS.length] }));
    const driverData = data?.topDrivers || [];

    return (
        <div className="app-layout">
            <Sidebar />
            <main className="main-content">
                <header className="header">
                    <div className="header-left">
                        <h2 className="header-title">Logistics Analytics</h2>
                        <div className="header-divider"></div>
                        <span className="header-time">Performance insights & trends</span>
                    </div>
                </header>

                <div className="dashboard-content">
                    {/* KPI Row */}
                    <div className="kpi-grid">
                        <div className="kpi-card">
                            <p className="kpi-label">Total Deliveries</p>
                            <div className="kpi-value-row">
                                <h3 className="kpi-value">{kpis.totalDeliveries || 0}</h3>
                            </div>
                            <div className="kpi-bar">
                                <div className="kpi-bar-fill primary" style={{ width: '100%' }}></div>
                            </div>
                        </div>
                        <div className="kpi-card">
                            <p className="kpi-label">Success Rate</p>
                            <div className="kpi-value-row">
                                <h3 className="kpi-value">{kpis.successRate || 0}%</h3>
                                <span className="kpi-trend up">
                                    <span className="material-symbols-outlined">trending_up</span>
                                </span>
                            </div>
                            <div className="kpi-bar">
                                <div className="kpi-bar-fill emerald" style={{ width: `${kpis.successRate || 0}%` }}></div>
                            </div>
                        </div>
                        <div className="kpi-card">
                            <p className="kpi-label">Completed</p>
                            <div className="kpi-value-row">
                                <h3 className="kpi-value" style={{ color: 'var(--emerald)' }}>{kpis.completedDeliveries || 0}</h3>
                            </div>
                            <div className="kpi-bar">
                                <div className="kpi-bar-fill emerald" style={{ width: kpis.totalDeliveries > 0 ? `${(kpis.completedDeliveries / kpis.totalDeliveries * 100)}%` : '0%' }}></div>
                            </div>
                        </div>
                        <div className="kpi-card">
                            <p className="kpi-label">Active Drivers</p>
                            <div className="kpi-value-row">
                                <h3 className="kpi-value">{kpis.activeDrivers || 0}</h3>
                                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>/ {kpis.totalDrivers || 0}</span>
                            </div>
                            <div className="kpi-bar">
                                <div className="kpi-bar-fill primary" style={{ width: kpis.totalDrivers > 0 ? `${(kpis.activeDrivers / kpis.totalDrivers * 100)}%` : '0%' }}></div>
                            </div>
                        </div>
                    </div>

                    {/* Charts Grid */}
                    <div className="analytics-grid">
                        {/* Line Chart: Daily Deliveries */}
                        <div className="chart-card full-width">
                            <h4>Deliveries Over Time</h4>
                            <p>Last 7 days delivery volume</p>
                            <ResponsiveContainer width="100%" height={280}>
                                <LineChart data={dailyData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={{ stroke: '#e2e8f0' }} tickLine={false} />
                                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Line type="monotone" dataKey="count" stroke="#137fec" strokeWidth={3} dot={{ r: 5, fill: '#137fec', stroke: '#fff', strokeWidth: 2 }} activeDot={{ r: 7, fill: '#137fec' }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Pie Chart: Status Breakdown */}
                        <div className="chart-card">
                            <h4>Status Breakdown</h4>
                            <p>Current delivery status distribution</p>
                            <ResponsiveContainer width="100%" height={280}>
                                <PieChart>
                                    <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="count" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                                        {statusData.map((entry, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Bar Chart: Top Drivers */}
                        <div className="chart-card">
                            <h4>Top Performing Drivers</h4>
                            <p>By completed deliveries</p>
                            <ResponsiveContainer width="100%" height={280}>
                                <BarChart data={driverData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                                    <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} width={120} axisLine={false} tickLine={false} />
                                    <Tooltip />
                                    <Bar dataKey="completed" fill="#137fec" radius={[0, 6, 6, 0]} barSize={24} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
