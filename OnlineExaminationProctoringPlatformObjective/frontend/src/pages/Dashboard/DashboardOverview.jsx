import { motion } from 'framer-motion';
import {
    HiOutlineUsers,
    HiOutlineClipboardList,
    HiOutlineDocumentText,
    HiOutlineShieldCheck,
    HiOutlineTrendingUp,
    HiOutlineTrendingDown,
    HiOutlinePlus,
    HiOutlineCollection,
    HiOutlineChartBar,
    HiOutlineAcademicCap,
    HiOutlineClock,
    HiOutlineCheckCircle,
    HiOutlineExclamationCircle,
} from 'react-icons/hi';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, RadialBarChart, RadialBar
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Mock data
const examTrend = [
    { month: 'Sep', exams: 12, students: 145 },
    { month: 'Oct', exams: 18, students: 230 },
    { month: 'Nov', exams: 15, students: 189 },
    { month: 'Dec', exams: 22, students: 310 },
    { month: 'Jan', exams: 28, students: 420 },
    { month: 'Feb', exams: 35, students: 512 },
];

const performanceData = [
    { subject: 'Mathematics', avgScore: 72, attempts: 180 },
    { subject: 'Physics', avgScore: 68, attempts: 145 },
    { subject: 'Chemistry', avgScore: 75, attempts: 160 },
    { subject: 'Computer Sc.', avgScore: 82, attempts: 200 },
    { subject: 'English', avgScore: 78, attempts: 120 },
];

const passFailData = [
    { name: 'Passed', value: 78, color: '#10b981' },
    { name: 'Failed', value: 22, color: '#f43f5e' },
];

const recentActivity = [
    { text: '<strong>Dr. Rajesh Kumar</strong> published "Advanced Calculus Mid-Term"', time: '2 min ago', color: 'var(--primary-400)' },
    { text: '<strong>Prof. Priya Sharma</strong> added 15 new questions to Physics pool', time: '18 min ago', color: 'var(--success-400)' },
    { text: '<strong>Amit Verma</strong> completed "Data Structures Final" with score 87%', time: '45 min ago', color: 'var(--info-400)' },
    { text: '<strong>System</strong> flagged 2 students for suspicious activity', time: '1 hr ago', color: 'var(--danger-400)' },
    { text: '<strong>Prof. Priya Sharma</strong> scheduled "Organic Chemistry Quiz" for Mar 5', time: '2 hr ago', color: 'var(--warning-400)' },
    { text: '<strong>New User</strong> Sneha Patel registered as Student', time: '3 hr ago', color: 'var(--primary-400)' },
];

const upcomingExams = [
    { title: 'Advanced Calculus Mid-Term', date: 'Mar 3, 2026', time: '10:00 AM', students: 45, status: 'Published' },
    { title: 'Organic Chemistry Quiz', date: 'Mar 5, 2026', time: '2:00 PM', students: 32, status: 'Draft' },
    { title: 'Data Structures Final', date: 'Mar 8, 2026', time: '9:00 AM', students: 60, status: 'Published' },
];

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 14px',
                boxShadow: 'var(--shadow-lg)',
            }}>
                <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)', marginBottom: 4 }}>{label}</p>
                {payload.map((entry, index) => (
                    <p key={index} style={{ fontSize: 'var(--font-sm)', color: entry.color, fontWeight: 600 }}>
                        {entry.name}: {entry.value}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.08 }
    }
};

const item = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

export default function DashboardOverview() {
    const navigate = useNavigate();
    const { user } = useAuth();

    return (
        <motion.div variants={container} initial="hidden" animate="show">
            {/* Page Header */}
            <motion.div variants={item} className="page-header">
                <div className="page-header-left">
                    <h1 className="page-title">
                        Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {user?.name?.split(' ')[0]} 👋
                    </h1>
                    <p className="page-subtitle">Here's what's happening with your platform today.</p>
                </div>
                <div className="page-header-actions">
                    <button className="btn btn-secondary" onClick={() => navigate('/dashboard/analytics')}>
                        <HiOutlineChartBar /> View Reports
                    </button>
                    <button className="btn btn-primary" onClick={() => navigate('/dashboard/exams/new')}>
                        <HiOutlinePlus /> Create Exam
                    </button>
                </div>
            </motion.div>

            {/* Stats Grid */}
            <motion.div variants={item} className="stats-grid">
                <div className="stat-card primary">
                    <div className="stat-card-header">
                        <div className="stat-card-icon"><HiOutlineUsers /></div>
                        <span className="stat-card-trend up"><HiOutlineTrendingUp /> +12%</span>
                    </div>
                    <div className="stat-card-value">1,247</div>
                    <div className="stat-card-label">Total Students</div>
                </div>

                <div className="stat-card success">
                    <div className="stat-card-header">
                        <div className="stat-card-icon"><HiOutlineClipboardList /></div>
                        <span className="stat-card-trend up"><HiOutlineTrendingUp /> +8%</span>
                    </div>
                    <div className="stat-card-value">35</div>
                    <div className="stat-card-label">Active Exams</div>
                </div>

                <div className="stat-card warning">
                    <div className="stat-card-header">
                        <div className="stat-card-icon"><HiOutlineDocumentText /></div>
                        <span className="stat-card-trend up"><HiOutlineTrendingUp /> +24%</span>
                    </div>
                    <div className="stat-card-value">2,840</div>
                    <div className="stat-card-label">Questions in Bank</div>
                </div>

                <div className="stat-card danger">
                    <div className="stat-card-header">
                        <div className="stat-card-icon"><HiOutlineShieldCheck /></div>
                        <span className="stat-card-trend down"><HiOutlineTrendingDown /> -5%</span>
                    </div>
                    <div className="stat-card-value">18</div>
                    <div className="stat-card-label">Flagged Students</div>
                </div>
            </motion.div>

            {/* Charts Row */}
            <motion.div variants={item} className="dashboard-grid mb-8">
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">
                            <HiOutlineTrendingUp style={{ color: 'var(--primary-400)' }} /> Exam Activity Trend
                        </h3>
                        <div className="flex gap-3">
                            <span className="badge badge-primary"><span className="badge-dot"></span> Exams</span>
                            <span className="badge badge-success"><span className="badge-dot"></span> Students</span>
                        </div>
                    </div>
                    <div className="card-body">
                        <div className="chart-container">
                            <ResponsiveContainer>
                                <AreaChart data={examTrend}>
                                    <defs>
                                        <linearGradient id="colorExams" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area type="monotone" dataKey="exams" name="Exams" stroke="#6366f1" strokeWidth={2.5} fill="url(#colorExams)" dot={false} activeDot={{ r: 5, fill: '#6366f1' }} />
                                    <Area type="monotone" dataKey="students" name="Students" stroke="#10b981" strokeWidth={2.5} fill="url(#colorStudents)" dot={false} activeDot={{ r: 5, fill: '#10b981' }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">
                            <HiOutlineCheckCircle style={{ color: 'var(--success-400)' }} /> Pass/Fail Rate
                        </h3>
                    </div>
                    <div className="card-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ width: '100%', height: 200 }}>
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie
                                        data={passFailData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={85}
                                        paddingAngle={4}
                                        dataKey="value"
                                        startAngle={90}
                                        endAngle={-270}
                                    >
                                        {passFailData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div style={{ display: 'flex', gap: 24, marginTop: 8 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981' }}></div>
                                <span style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)' }}>Passed: <strong style={{ color: 'var(--text-primary)' }}>78%</strong></span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f43f5e' }}></div>
                                <span style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)' }}>Failed: <strong style={{ color: 'var(--text-primary)' }}>22%</strong></span>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Subject Performance */}
            <motion.div variants={item} className="card mb-8">
                <div className="card-header">
                    <h3 className="card-title">
                        <HiOutlineAcademicCap style={{ color: 'var(--warning-400)' }} /> Subject-wise Performance
                    </h3>
                </div>
                <div className="card-body">
                    <div className="chart-container">
                        <ResponsiveContainer>
                            <BarChart data={performanceData} barSize={36}>
                                <defs>
                                    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#818cf8" stopOpacity={1} />
                                        <stop offset="100%" stopColor="#6366f1" stopOpacity={0.6} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
                                <XAxis dataKey="subject" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} domain={[0, 100]} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="avgScore" name="Avg Score" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </motion.div>

            {/* Bottom Section */}
            <motion.div variants={item} className="grid-2 mb-8">
                {/* Recent Activity */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">
                            <HiOutlineClock style={{ color: 'var(--info-400)' }} /> Recent Activity
                        </h3>
                        <button className="btn btn-ghost btn-sm">View All</button>
                    </div>
                    <div className="card-body">
                        {recentActivity.map((act, i) => (
                            <div key={i} className="activity-item">
                                <div className="activity-dot" style={{ background: act.color }}></div>
                                <div className="activity-content">
                                    <div className="activity-text" dangerouslySetInnerHTML={{ __html: act.text }}></div>
                                    <div className="activity-time">{act.time}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Upcoming Exams */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">
                            <HiOutlineClipboardList style={{ color: 'var(--warning-400)' }} /> Upcoming Exams
                        </h3>
                        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/dashboard/exams')}>View All</button>
                    </div>
                    <div className="card-body">
                        {upcomingExams.map((exam, i) => (
                            <div key={i} style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '12px 0',
                                borderBottom: i < upcomingExams.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                            }}>
                                <div>
                                    <div style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                                        {exam.title}
                                    </div>
                                    <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)' }}>
                                        {exam.date} · {exam.time} · {exam.students} students
                                    </div>
                                </div>
                                <span className={`badge ${exam.status === 'Published' ? 'badge-success' : 'badge-warning'}`}>
                                    {exam.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div variants={item}>
                <h3 style={{ fontSize: 'var(--font-md)', fontWeight: 700, marginBottom: 'var(--space-4)' }}>Quick Actions</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-4)' }}>
                    <div className="quick-action" onClick={() => navigate('/dashboard/questions/new')}>
                        <div className="quick-action-icon" style={{ background: 'rgba(99, 102, 241, 0.12)', color: 'var(--primary-400)' }}>
                            <HiOutlinePlus />
                        </div>
                        <div className="quick-action-title">Add Question</div>
                        <div className="quick-action-desc">Create a new question</div>
                    </div>

                    <div className="quick-action" onClick={() => navigate('/dashboard/exams/new')}>
                        <div className="quick-action-icon" style={{ background: 'rgba(16, 185, 129, 0.12)', color: 'var(--success-400)' }}>
                            <HiOutlineClipboardList />
                        </div>
                        <div className="quick-action-title">Create Exam</div>
                        <div className="quick-action-desc">Setup new exam</div>
                    </div>

                    <div className="quick-action" onClick={() => navigate('/dashboard/users')}>
                        <div className="quick-action-icon" style={{ background: 'rgba(245, 158, 11, 0.12)', color: 'var(--warning-400)' }}>
                            <HiOutlineUsers />
                        </div>
                        <div className="quick-action-title">Manage Users</div>
                        <div className="quick-action-desc">Users & roles</div>
                    </div>

                    <div className="quick-action" onClick={() => navigate('/dashboard/analytics')}>
                        <div className="quick-action-icon" style={{ background: 'rgba(6, 182, 212, 0.12)', color: 'var(--info-400)' }}>
                            <HiOutlineChartBar />
                        </div>
                        <div className="quick-action-title">View Analytics</div>
                        <div className="quick-action-desc">Performance reports</div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
