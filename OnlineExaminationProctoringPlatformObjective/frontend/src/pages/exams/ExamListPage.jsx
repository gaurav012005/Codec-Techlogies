import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    HiOutlinePlus,
    HiOutlineSearch,
    HiOutlineDotsVertical,
    HiOutlinePencil,
    HiOutlineTrash,
    HiOutlineEye,
    HiOutlineClock,
    HiOutlineUsers,
    HiOutlineClipboardList,
    HiOutlineCheckCircle,
    HiOutlineExclamation,
    HiOutlineCalendar,
    HiOutlineDocumentText,
    HiOutlineChartBar,
} from 'react-icons/hi';

export const MOCK_EXAMS = [
    {
        id: '1', title: 'Advanced Calculus Mid-Term', subject: 'Mathematics',
        duration: 90, totalMarks: 100, totalQuestions: 30, assignedStudents: 45,
        status: 'PUBLISHED', startDate: '2026-03-03T10:00', endDate: '2026-03-03T11:30',
        passingPercentage: 40, proctoring: true, adaptive: false, createdBy: 'Dr. Rajesh Kumar',
    },
    {
        id: '2', title: 'Organic Chemistry Quiz', subject: 'Chemistry',
        duration: 30, totalMarks: 25, totalQuestions: 15, assignedStudents: 32,
        status: 'DRAFT', startDate: '2026-03-05T14:00', endDate: '2026-03-05T14:30',
        passingPercentage: 35, proctoring: false, adaptive: false, createdBy: 'Prof. Priya Sharma',
    },
    {
        id: '3', title: 'Data Structures & Algorithms Final', subject: 'Computer Science',
        duration: 120, totalMarks: 120, totalQuestions: 40, assignedStudents: 60,
        status: 'ACTIVE', startDate: '2026-02-27T09:00', endDate: '2026-02-27T11:00',
        passingPercentage: 40, proctoring: true, adaptive: true, createdBy: 'Dr. Rajesh Kumar',
    },
    {
        id: '4', title: 'Classical Mechanics Test', subject: 'Physics',
        duration: 60, totalMarks: 50, totalQuestions: 20, assignedStudents: 38,
        status: 'COMPLETED', startDate: '2026-02-20T10:00', endDate: '2026-02-20T11:00',
        passingPercentage: 45, proctoring: true, adaptive: false, createdBy: 'Prof. Priya Sharma',
    },
    {
        id: '5', title: 'Programming Fundamentals Quiz', subject: 'Computer Science',
        duration: 45, totalMarks: 40, totalQuestions: 25, assignedStudents: 55,
        status: 'COMPLETED', startDate: '2026-02-18T14:00', endDate: '2026-02-18T14:45',
        passingPercentage: 40, proctoring: false, adaptive: false, createdBy: 'Dr. Rajesh Kumar',
    },
];

const statusConfig = {
    DRAFT: { label: 'Draft', badge: 'badge-warning', icon: HiOutlineDocumentText },
    PUBLISHED: { label: 'Published', badge: 'badge-primary', icon: HiOutlineCheckCircle },
    ACTIVE: { label: 'Active', badge: 'badge-success', icon: HiOutlineExclamation },
    COMPLETED: { label: 'Completed', badge: 'badge-default', icon: HiOutlineChartBar },
};

const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } }
};

const item = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0 }
};

export default function ExamListPage() {
    const navigate = useNavigate();
    const [exams, setExams] = useState(() => {
        const saved = localStorage.getItem('exams_list');
        return saved ? JSON.parse(saved) : MOCK_EXAMS;
    });

    useEffect(() => {
        localStorage.setItem('exams_list', JSON.stringify(exams));
    }, [exams]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [viewMode, setViewMode] = useState('card');
    const [openDropdown, setOpenDropdown] = useState(null);

    const filtered = exams.filter(e => {
        const matchSearch = e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            e.subject.toLowerCase().includes(searchTerm.toLowerCase());
        const matchStatus = !filterStatus || e.status === filterStatus;
        return matchSearch && matchStatus;
    });

    return (
        <motion.div variants={container} initial="hidden" animate="show">
            <motion.div variants={item} className="page-header">
                <div className="page-header-left">
                    <h1 className="page-title">Exams</h1>
                    <p className="page-subtitle">{exams.length} exams · Manage your exam schedule</p>
                </div>
                <div className="page-header-actions">
                    <button className="btn btn-primary" onClick={() => navigate('/dashboard/exams/new')}>
                        <HiOutlinePlus /> Create Exam
                    </button>
                </div>
            </motion.div>

            {/* Stats */}
            <motion.div variants={item} className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 'var(--space-6)' }}>
                <div className="stat-card primary" style={{ padding: 'var(--space-4) var(--space-5)' }}>
                    <div className="stat-card-value" style={{ fontSize: 'var(--font-xl)' }}>{exams.length}</div>
                    <div className="stat-card-label" style={{ fontSize: 'var(--font-xs)' }}>Total Exams</div>
                </div>
                <div className="stat-card success" style={{ padding: 'var(--space-4) var(--space-5)' }}>
                    <div className="stat-card-value" style={{ fontSize: 'var(--font-xl)' }}>{exams.filter(e => e.status === 'ACTIVE').length}</div>
                    <div className="stat-card-label" style={{ fontSize: 'var(--font-xs)' }}>Active Now</div>
                </div>
                <div className="stat-card warning" style={{ padding: 'var(--space-4) var(--space-5)' }}>
                    <div className="stat-card-value" style={{ fontSize: 'var(--font-xl)' }}>{exams.filter(e => e.status === 'PUBLISHED').length}</div>
                    <div className="stat-card-label" style={{ fontSize: 'var(--font-xs)' }}>Upcoming</div>
                </div>
                <div className="stat-card info" style={{ padding: 'var(--space-4) var(--space-5)' }}>
                    <div className="stat-card-value" style={{ fontSize: 'var(--font-xl)' }}>{exams.filter(e => e.status === 'COMPLETED').length}</div>
                    <div className="stat-card-label" style={{ fontSize: 'var(--font-xs)' }}>Completed</div>
                </div>
            </motion.div>

            {/* Filters */}
            <motion.div variants={item} className="filter-bar">
                <div className="filter-search">
                    <span className="filter-search-icon"><HiOutlineSearch /></span>
                    <input
                        type="text"
                        placeholder="Search exams..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                    <option value="">All Status</option>
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published</option>
                    <option value="ACTIVE">Active</option>
                    <option value="COMPLETED">Completed</option>
                </select>
            </motion.div>

            {/* Exam Cards Grid */}
            <motion.div variants={item} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 'var(--space-5)' }}>
                {filtered.map(exam => {
                    const status = statusConfig[exam.status];
                    const startDate = new Date(exam.startDate);
                    return (
                        <motion.div
                            key={exam.id}
                            className="card"
                            style={{ cursor: 'pointer', transition: 'all var(--transition-base)' }}
                            whileHover={{ y: -4, boxShadow: 'var(--shadow-lg)' }}
                        >
                            <div style={{
                                padding: 'var(--space-5) var(--space-6)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 'var(--space-4)',
                            }}>
                                {/* Top row */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <span className="badge badge-default" style={{ marginBottom: 8, display: 'inline-block' }}>{exam.subject}</span>
                                        <h3 style={{ fontSize: 'var(--font-md)', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                                            {exam.title}
                                        </h3>
                                    </div>
                                    <span className={`badge ${status.badge}`}>
                                        <span className="badge-dot"></span>
                                        {status.label}
                                    </span>
                                </div>

                                {/* Stats row */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-3)' }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 6,
                                        fontSize: 'var(--font-xs)',
                                        color: 'var(--text-secondary)',
                                        padding: 'var(--space-2)',
                                        background: 'var(--bg-elevated)',
                                        borderRadius: 'var(--radius-sm)',
                                    }}>
                                        <HiOutlineClock style={{ color: 'var(--warning-400)', fontSize: 14 }} />
                                        {exam.duration} min
                                    </div>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 6,
                                        fontSize: 'var(--font-xs)',
                                        color: 'var(--text-secondary)',
                                        padding: 'var(--space-2)',
                                        background: 'var(--bg-elevated)',
                                        borderRadius: 'var(--radius-sm)',
                                    }}>
                                        <HiOutlineClipboardList style={{ color: 'var(--primary-400)', fontSize: 14 }} />
                                        {exam.totalQuestions} Q
                                    </div>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 6,
                                        fontSize: 'var(--font-xs)',
                                        color: 'var(--text-secondary)',
                                        padding: 'var(--space-2)',
                                        background: 'var(--bg-elevated)',
                                        borderRadius: 'var(--radius-sm)',
                                    }}>
                                        <HiOutlineUsers style={{ color: 'var(--success-400)', fontSize: 14 }} />
                                        {exam.assignedStudents}
                                    </div>
                                </div>

                                {/* Meta row */}
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    paddingTop: 'var(--space-3)',
                                    borderTop: '1px solid var(--border-subtle)',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)' }}>
                                        <HiOutlineCalendar />
                                        {startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                    <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
                                        <span style={{ fontSize: 'var(--font-xs)', fontWeight: 600, color: 'var(--text-primary)' }}>
                                            {exam.totalMarks} marks
                                        </span>
                                        {exam.proctoring && (
                                            <span className="badge badge-danger" style={{ fontSize: '0.625rem' }}>🔒 Proctor</span>
                                        )}
                                        {exam.adaptive && (
                                            <span className="badge badge-info" style={{ fontSize: '0.625rem' }}>🧠 Adaptive</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </motion.div>

            {filtered.length === 0 && (
                <div className="card">
                    <div className="card-body">
                        <div className="empty-state">
                            <div className="empty-state-icon"><HiOutlineClipboardList /></div>
                            <div className="empty-state-title">No exams found</div>
                            <div className="empty-state-desc">Create your first exam to get started</div>
                            <button className="btn btn-primary" onClick={() => navigate('/dashboard/exams/new')}>
                                <HiOutlinePlus /> Create Exam
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
}
