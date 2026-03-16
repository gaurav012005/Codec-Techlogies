// ============================================
// Analytics Dashboard — Feature 12
// ============================================

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    HiOutlineChartBar,
    HiOutlineAcademicCap,
    HiOutlineUsers,
    HiOutlineClipboardList,
    HiOutlineDocumentText,
    HiOutlineTrendingUp,
    HiOutlinePencilAlt,
    HiOutlineCheckCircle,
    HiOutlineExclamationCircle,
    HiOutlineStar,
} from 'react-icons/hi';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import api from '../../services/api';
import './AnalyticsDashboard.css';

const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const PIE_COLORS = ['#10b981', '#f43f5e'];

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

export default function AnalyticsDashboard() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [dashData, setDashData] = useState(null);
    const [examList, setExamList] = useState([]);
    const [selectedExamId, setSelectedExamId] = useState('');
    const [examAnalytics, setExamAnalytics] = useState(null);
    const [examLoading, setExamLoading] = useState(false);

    const hasToken = () => !!localStorage.getItem('accessToken');

    // Fetch dashboard analytics
    useEffect(() => {
        if (!hasToken()) {
            // No real JWT — use mock data directly (avoids 401 spam)
            setDashData(getMockDashboard());
            setExamList(getMockExamList());
            setLoading(false);
            return;
        }

        const fetchDashboard = async () => {
            try {
                const { data } = await api.get('/analytics/dashboard');
                setDashData(data.data);
            } catch (err) {
                console.error('Failed to fetch analytics:', err);
                setDashData(getMockDashboard());
            } finally {
                setLoading(false);
            }
        };

        const fetchExamList = async () => {
            try {
                const { data } = await api.get('/analytics/exams-list');
                setExamList(data.data);
            } catch {
                setExamList(getMockExamList());
            }
        };

        fetchDashboard();
        fetchExamList();
    }, []);

    // Fetch specific exam analytics when selected
    useEffect(() => {
        if (!selectedExamId) {
            setExamAnalytics(null);
            return;
        }

        const fetchExam = async () => {
            setExamLoading(true);
            if (!hasToken()) {
                setExamAnalytics(getMockExamAnalytics());
                setExamLoading(false);
                return;
            }
            try {
                const { data } = await api.get(`/analytics/exam/${selectedExamId}`);
                setExamAnalytics(data.data);
            } catch {
                setExamAnalytics(getMockExamAnalytics());
            } finally {
                setExamLoading(false);
            }
        };

        fetchExam();
    }, [selectedExamId]);

    if (loading) {
        return (
            <div className="flex-center" style={{ minHeight: 400 }}>
                <div className="spinner spinner-lg" />
            </div>
        );
    }

    const overview = dashData?.overview;
    const passFailData = overview ? [
        { name: 'Passed', value: overview.passCount || 0 },
        { name: 'Failed', value: overview.failCount || 0 },
    ] : [];

    return (
        <motion.div className="analytics-page" variants={container} initial="hidden" animate="show">
            {/* Page Header */}
            <motion.div variants={item} className="page-header">
                <div className="page-header-left">
                    <h1 className="page-title">
                        <HiOutlineChartBar style={{ color: 'var(--primary-400)' }} /> Analytics Dashboard
                    </h1>
                    <p className="page-subtitle">Comprehensive exam performance insights & evaluation tools</p>
                </div>
                <div className="page-header-actions">
                    <button className="btn btn-secondary" onClick={() => navigate('/dashboard/analytics/grading')}>
                        <HiOutlinePencilAlt /> Manual Grading
                        {overview?.pendingGrading > 0 && (
                            <span className="badge badge-danger" style={{ marginLeft: 6, fontSize: '0.7rem' }}>
                                {overview.pendingGrading}
                            </span>
                        )}
                    </button>
                </div>
            </motion.div>

            {/* Tab Switcher */}
            <motion.div variants={item}>
                <div className="analytics-tab-bar">
                    <button className={`analytics-tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
                        Overview
                    </button>
                    <button className={`analytics-tab ${activeTab === 'exam' ? 'active' : ''}`} onClick={() => setActiveTab('exam')}>
                        Exam Analysis
                    </button>
                </div>
            </motion.div>

            {/* ═══════ OVERVIEW TAB ═══════ */}
            {activeTab === 'overview' && (
                <>
                    {/* Stat Cards */}
                    <motion.div variants={item} className="analytics-stats">
                        <div className="analytics-stat purple">
                            <div className="analytics-stat-icon"><HiOutlineUsers /></div>
                            <div className="analytics-stat-value">{overview?.totalStudents?.toLocaleString() || 0}</div>
                            <div className="analytics-stat-label">Total Students</div>
                        </div>
                        <div className="analytics-stat green">
                            <div className="analytics-stat-icon"><HiOutlineClipboardList /></div>
                            <div className="analytics-stat-value">{overview?.totalExams || 0}</div>
                            <div className="analytics-stat-label">Total Exams</div>
                        </div>
                        <div className="analytics-stat amber">
                            <div className="analytics-stat-icon"><HiOutlineDocumentText /></div>
                            <div className="analytics-stat-value">{overview?.totalQuestions?.toLocaleString() || 0}</div>
                            <div className="analytics-stat-label">Questions in Bank</div>
                        </div>
                        <div className="analytics-stat cyan">
                            <div className="analytics-stat-icon"><HiOutlineTrendingUp /></div>
                            <div className="analytics-stat-value">{overview?.avgPercentage || 0}%</div>
                            <div className="analytics-stat-label">Average Score</div>
                        </div>
                        <div className="analytics-stat rose">
                            <div className="analytics-stat-icon"><HiOutlineExclamationCircle /></div>
                            <div className="analytics-stat-value">{overview?.pendingGrading || 0}</div>
                            <div className="analytics-stat-label">Pending Grading</div>
                        </div>
                        <div className="analytics-stat blue">
                            <div className="analytics-stat-icon"><HiOutlineCheckCircle /></div>
                            <div className="analytics-stat-value">{overview?.passRate || 0}%</div>
                            <div className="analytics-stat-label">Pass Rate</div>
                        </div>
                    </motion.div>

                    {/* Charts */}
                    <motion.div variants={item} className="analytics-charts">
                        {/* Score Distribution */}
                        <div className="analytics-chart-card">
                            <div className="analytics-chart-header">
                                <div className="analytics-chart-title">
                                    <HiOutlineChartBar style={{ color: '#818cf8' }} /> Score Distribution
                                </div>
                            </div>
                            <div className="analytics-chart-body">
                                <ResponsiveContainer>
                                    <BarChart data={dashData?.scoreDistribution || []} barSize={40}>
                                        <defs>
                                            <linearGradient id="distGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#818cf8" stopOpacity={1} />
                                                <stop offset="100%" stopColor="#6366f1" stopOpacity={0.5} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
                                        <XAxis dataKey="range" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Bar dataKey="count" name="Students" fill="url(#distGrad)" radius={[6, 6, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Pass/Fail Pie */}
                        <div className="analytics-chart-card">
                            <div className="analytics-chart-header">
                                <div className="analytics-chart-title">
                                    <HiOutlineCheckCircle style={{ color: '#10b981' }} /> Pass / Fail Ratio
                                </div>
                            </div>
                            <div className="analytics-chart-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                {(overview?.totalAttempts || 0) > 0 ? (
                                    <>
                                        <div style={{ width: '100%', height: 210 }}>
                                            <ResponsiveContainer>
                                                <PieChart>
                                                    <Pie
                                                        data={passFailData}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={65}
                                                        outerRadius={90}
                                                        paddingAngle={4}
                                                        dataKey="value"
                                                        startAngle={90}
                                                        endAngle={-270}
                                                    >
                                                        {passFailData.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index]} stroke="none" />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip content={<CustomTooltip />} />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <div style={{ display: 'flex', gap: 28 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981' }} />
                                                <span style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)' }}>
                                                    Passed: <strong style={{ color: 'var(--text-primary)' }}>{overview?.passCount || 0}</strong>
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f43f5e' }} />
                                                <span style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)' }}>
                                                    Failed: <strong style={{ color: 'var(--text-primary)' }}>{overview?.failCount || 0}</strong>
                                                </span>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="analytics-empty">
                                        <div className="analytics-empty-icon">📊</div>
                                        <div className="analytics-empty-text">No attempts yet</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>

                    {/* Recent Exams Table */}
                    <motion.div variants={item} className="analytics-toppers">
                        <div className="analytics-toppers-header">
                            <div className="analytics-toppers-title">
                                <HiOutlineClipboardList style={{ color: 'var(--warning-400)' }} /> Recent Exams
                            </div>
                        </div>
                        {dashData?.recentExams?.length > 0 ? (
                            <table className="toppers-table">
                                <thead>
                                    <tr>
                                        <th>Exam Title</th>
                                        <th>Subject</th>
                                        <th>Created By</th>
                                        <th>Questions</th>
                                        <th>Attempts</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dashData.recentExams.map((exam) => (
                                        <tr key={exam.id} style={{ cursor: 'pointer' }} onClick={() => {
                                            setSelectedExamId(exam.id);
                                            setActiveTab('exam');
                                        }}>
                                            <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{exam.title}</td>
                                            <td>{exam.subject}</td>
                                            <td>{exam.createdBy}</td>
                                            <td>{exam.questionCount}</td>
                                            <td>{exam.attemptCount}</td>
                                            <td>
                                                <span className={`badge ${exam.status === 'PUBLISHED' || exam.status === 'ACTIVE' ? 'badge-success' : exam.status === 'DRAFT' ? 'badge-warning' : 'badge-default'}`}>
                                                    {exam.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="analytics-empty">
                                <div className="analytics-empty-icon">📋</div>
                                <div className="analytics-empty-text">No exams created yet</div>
                            </div>
                        )}
                    </motion.div>
                </>
            )}

            {/* ═══════ EXAM ANALYSIS TAB ═══════ */}
            {activeTab === 'exam' && (
                <>
                    {/* Exam Selector */}
                    <motion.div variants={item} className="analytics-exam-selector">
                        <label style={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: 'var(--font-sm)' }}>Select Exam:</label>
                        <select value={selectedExamId} onChange={(e) => setSelectedExamId(e.target.value)}>
                            <option value="">— Choose an exam —</option>
                            {examList.map((e) => (
                                <option key={e.id} value={e.id}>
                                    {e.title} ({e.attemptCount} attempts)
                                </option>
                            ))}
                        </select>
                    </motion.div>

                    {!selectedExamId ? (
                        <motion.div variants={item} className="analytics-empty" style={{ minHeight: 300 }}>
                            <div className="analytics-empty-icon">📊</div>
                            <div className="analytics-empty-text">Select an exam to view detailed analytics</div>
                        </motion.div>
                    ) : examLoading ? (
                        <div className="flex-center" style={{ minHeight: 300 }}>
                            <div className="spinner spinner-lg" />
                        </div>
                    ) : examAnalytics ? (
                        <>
                            {/* Exam Stats */}
                            <motion.div variants={item} className="analytics-stats">
                                <div className="analytics-stat purple">
                                    <div className="analytics-stat-icon"><HiOutlineUsers /></div>
                                    <div className="analytics-stat-value">{examAnalytics.stats.totalAttempts}</div>
                                    <div className="analytics-stat-label">Total Attempts</div>
                                </div>
                                <div className="analytics-stat green">
                                    <div className="analytics-stat-icon"><HiOutlineTrendingUp /></div>
                                    <div className="analytics-stat-value">{examAnalytics.stats.avgPercentage}%</div>
                                    <div className="analytics-stat-label">Average Score</div>
                                </div>
                                <div className="analytics-stat amber">
                                    <div className="analytics-stat-icon"><HiOutlineStar /></div>
                                    <div className="analytics-stat-value">{examAnalytics.stats.maxScore}</div>
                                    <div className="analytics-stat-label">Highest Score</div>
                                </div>
                                <div className="analytics-stat cyan">
                                    <div className="analytics-stat-icon"><HiOutlineCheckCircle /></div>
                                    <div className="analytics-stat-value">{examAnalytics.stats.passRate}%</div>
                                    <div className="analytics-stat-label">Pass Rate</div>
                                </div>
                            </motion.div>

                            {/* Charts Row */}
                            <motion.div variants={item} className="analytics-charts">
                                {/* Score Distribution */}
                                <div className="analytics-chart-card">
                                    <div className="analytics-chart-header">
                                        <div className="analytics-chart-title">
                                            <HiOutlineChartBar style={{ color: '#818cf8' }} /> Score Distribution
                                        </div>
                                    </div>
                                    <div className="analytics-chart-body">
                                        <ResponsiveContainer>
                                            <BarChart data={examAnalytics.scoreDistribution || []} barSize={40}>
                                                <defs>
                                                    <linearGradient id="examDistGrad" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="0%" stopColor="#34d399" stopOpacity={1} />
                                                        <stop offset="100%" stopColor="#10b981" stopOpacity={0.5} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
                                                <XAxis dataKey="range" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Bar dataKey="count" name="Students" fill="url(#examDistGrad)" radius={[6, 6, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Question Accuracy */}
                                <div className="analytics-chart-card">
                                    <div className="analytics-chart-header">
                                        <div className="analytics-chart-title">
                                            <HiOutlineAcademicCap style={{ color: '#f59e0b' }} /> Question Accuracy
                                        </div>
                                    </div>
                                    <div className="analytics-chart-body" style={{ padding: '16px 20px' }}>
                                        <div className="accuracy-bar-container">
                                            {examAnalytics.questionAccuracy?.map((q, idx) => (
                                                <div key={q.questionId} className="accuracy-item">
                                                    <div className="accuracy-item-label">
                                                        <span>Q{idx + 1}: {q.questionText}</span>
                                                        <span style={{ fontWeight: 700 }}>{q.accuracyRate}%</span>
                                                    </div>
                                                    <div className="accuracy-item-bar">
                                                        <div
                                                            className={`accuracy-item-fill ${q.accuracyRate >= 70 ? 'high' : q.accuracyRate >= 40 ? 'medium' : 'low'}`}
                                                            style={{ width: `${q.accuracyRate}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                            {(!examAnalytics.questionAccuracy || examAnalytics.questionAccuracy.length === 0) && (
                                                <div className="analytics-empty">
                                                    <div className="analytics-empty-text">No question data available</div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Toppers List */}
                            <motion.div variants={item} className="analytics-toppers">
                                <div className="analytics-toppers-header">
                                    <div className="analytics-toppers-title">
                                        <HiOutlineStar style={{ color: '#f59e0b' }} /> Top Performers
                                    </div>
                                </div>
                                {examAnalytics.toppers?.length > 0 ? (
                                    <table className="toppers-table">
                                        <thead>
                                            <tr>
                                                <th>Rank</th>
                                                <th>Student</th>
                                                <th>Score</th>
                                                <th>Percentage</th>
                                                <th>Time Taken</th>
                                                <th>Result</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {examAnalytics.toppers.map((t) => (
                                                <tr key={t.rank}>
                                                    <td>
                                                        <span className={`rank-badge ${t.rank === 1 ? 'gold' : t.rank === 2 ? 'silver' : t.rank === 3 ? 'bronze' : 'default'}`}>
                                                            {t.rank}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{t.studentName}</div>
                                                        <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)' }}>{t.studentEmail}</div>
                                                    </td>
                                                    <td style={{ fontWeight: 700 }}>{t.score}</td>
                                                    <td>{t.percentage?.toFixed(1)}%</td>
                                                    <td>{t.timeTaken ? `${t.timeTaken} min` : '—'}</td>
                                                    <td>
                                                        <span className={`badge ${t.result === 'PASS' ? 'badge-success' : 'badge-danger'}`}>
                                                            {t.result}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="analytics-empty">
                                        <div className="analytics-empty-icon">🏆</div>
                                        <div className="analytics-empty-text">No attempts recorded for this exam</div>
                                    </div>
                                )}
                            </motion.div>
                        </>
                    ) : null}
                </>
            )}
        </motion.div>
    );
}

// ── Mock data fallbacks ──────────────────────────────────────────────────────
function getMockDashboard() {
    return {
        overview: {
            totalStudents: 1247,
            totalExaminers: 18,
            totalExams: 35,
            totalQuestions: 2840,
            totalAttempts: 856,
            passCount: 668,
            failCount: 188,
            passRate: 78.04,
            avgPercentage: 67.3,
            avgScore: 42.8,
            highestPercentage: 98.5,
            lowestPercentage: 12.0,
            pendingGrading: 24,
        },
        scoreDistribution: [
            { range: '0-20%', count: 23 },
            { range: '21-40%', count: 89 },
            { range: '41-60%', count: 234 },
            { range: '61-80%', count: 312 },
            { range: '81-100%', count: 198 },
        ],
        recentExams: [
            { id: 'e1', title: 'Advanced Calculus Mid-Term', subject: 'Mathematics', createdBy: 'Dr. Rajesh Kumar', questionCount: 25, attemptCount: 45, status: 'PUBLISHED', createdAt: new Date().toISOString() },
            { id: 'e2', title: 'Organic Chemistry Quiz', subject: 'Chemistry', createdBy: 'Prof. Priya Sharma', questionCount: 20, attemptCount: 32, status: 'ACTIVE', createdAt: new Date().toISOString() },
            { id: 'e3', title: 'Data Structures Final', subject: 'Computer Science', createdBy: 'Dr. Amit Patel', questionCount: 30, attemptCount: 60, status: 'CLOSED', createdAt: new Date().toISOString() },
            { id: 'e4', title: 'English Literature Essay', subject: 'English', createdBy: 'Prof. Meera Nair', questionCount: 5, attemptCount: 28, status: 'PUBLISHED', createdAt: new Date().toISOString() },
        ],
        examsBySubject: [
            { subject: 'Mathematics', examCount: 12 },
            { subject: 'Physics', examCount: 8 },
            { subject: 'Chemistry', examCount: 6 },
            { subject: 'Computer Science', examCount: 9 },
        ],
    };
}

function getMockExamList() {
    return [
        { id: 'e1', title: 'Advanced Calculus Mid-Term', subject: 'Mathematics', status: 'PUBLISHED', attemptCount: 45 },
        { id: 'e2', title: 'Organic Chemistry Quiz', subject: 'Chemistry', status: 'ACTIVE', attemptCount: 32 },
        { id: 'e3', title: 'Data Structures Final', subject: 'Computer Science', status: 'CLOSED', attemptCount: 60 },
    ];
}

function getMockExamAnalytics() {
    return {
        exam: { id: 'e1', title: 'Advanced Calculus Mid-Term', subject: 'Mathematics', totalMarks: 100, passingPercentage: 40, durationMinutes: 60, questionCount: 25, createdBy: 'Dr. Rajesh Kumar', adaptiveMode: false },
        stats: { totalAttempts: 45, avgScore: 72.3, avgPercentage: 72.3, maxScore: 98, minScore: 18, passCount: 38, failCount: 7, passRate: 84.4 },
        scoreDistribution: [
            { range: '0-20%', count: 1 },
            { range: '21-40%', count: 3 },
            { range: '41-60%', count: 8 },
            { range: '61-80%', count: 20 },
            { range: '81-100%', count: 13 },
        ],
        toppers: [
            { rank: 1, studentName: 'Arjun Mehta', studentEmail: 'arjun@example.com', score: 98, percentage: 98, result: 'PASS', timeTaken: 42 },
            { rank: 2, studentName: 'Sneha Patel', studentEmail: 'sneha@example.com', score: 95, percentage: 95, result: 'PASS', timeTaken: 48 },
            { rank: 3, studentName: 'Rahul Sharma', studentEmail: 'rahul@example.com', score: 92, percentage: 92, result: 'PASS', timeTaken: 55 },
            { rank: 4, studentName: 'Diya Nair', studentEmail: 'diya@example.com', score: 88, percentage: 88, result: 'PASS', timeTaken: 51 },
            { rank: 5, studentName: 'Vikram Singh', studentEmail: 'vikram@example.com', score: 85, percentage: 85, result: 'PASS', timeTaken: 58 },
        ],
        questionAccuracy: [
            { questionId: 'q1', questionText: 'What is the derivative of f(x) = x² + 3x + 2?', questionType: 'MCQ_SINGLE', difficultyLevel: 'EASY', marks: 4, totalResponses: 45, correct: 42, wrong: 3, pending: 0, skipped: 0, accuracyRate: 93.3 },
            { questionId: 'q2', questionText: 'Evaluate the integral ∫(2x + 1)dx from 0 to 3', questionType: 'MCQ_SINGLE', difficultyLevel: 'MEDIUM', marks: 4, totalResponses: 44, correct: 35, wrong: 9, pending: 0, skipped: 1, accuracyRate: 79.5 },
            { questionId: 'q3', questionText: 'Prove that the series Σ(1/n²) converges...', questionType: 'SHORT_ANSWER', difficultyLevel: 'HARD', marks: 10, totalResponses: 40, correct: 22, wrong: 10, pending: 8, skipped: 5, accuracyRate: 55.0 },
            { questionId: 'q4', questionText: 'The value of lim(x→0) sin(x)/x is ______', questionType: 'FILL_IN_THE_BLANK', difficultyLevel: 'EASY', marks: 2, totalResponses: 45, correct: 40, wrong: 5, pending: 0, skipped: 0, accuracyRate: 88.9 },
            { questionId: 'q5', questionText: 'Which of these is the correct definition of...', questionType: 'MCQ_SINGLE', difficultyLevel: 'HARD', marks: 4, totalResponses: 43, correct: 18, wrong: 25, pending: 0, skipped: 2, accuracyRate: 41.9 },
        ],
    };
}
