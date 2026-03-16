// ============================================
// Student Exam List Page — Feature 6
// ============================================

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { HiClock, HiDocumentText, HiCheckCircle, HiXCircle, HiPlay, HiEye, HiLockClosed } from 'react-icons/hi';

// Mock data for development (when backend not connected)
const MOCK_EXAMS = [
    {
        id: 'exam-1',
        title: 'Mathematics Mid-Term 2026',
        description: 'Covers Algebra, Calculus, and Statistics',
        subjectCategory: 'Mathematics',
        durationMinutes: 60,
        totalMarks: 100,
        passingPercentage: 40,
        startDatetime: new Date(Date.now() - 86400000).toISOString(),
        endDatetime: new Date(Date.now() + 86400000).toISOString(),
        examState: 'active',
        questionCount: 20,
        createdBy: { name: 'Prof. Priya Sharma' },
        myAttempt: null,
    },
    {
        id: 'exam-2',
        title: 'Computer Science Final',
        description: 'Data Structures, Algorithms, DBMS',
        subjectCategory: 'Computer Science',
        durationMinutes: 90,
        totalMarks: 150,
        passingPercentage: 50,
        startDatetime: new Date(Date.now() + 172800000).toISOString(),
        endDatetime: new Date(Date.now() + 259200000).toISOString(),
        examState: 'upcoming',
        questionCount: 30,
        createdBy: { name: 'Dr. Rajesh Kumar' },
        myAttempt: null,
    },
    {
        id: 'exam-3',
        title: 'Physics Quiz — Optics',
        description: 'Light, Lenses and Optics chapter test',
        subjectCategory: 'Physics',
        durationMinutes: 30,
        totalMarks: 50,
        passingPercentage: 40,
        startDatetime: new Date(Date.now() - 259200000).toISOString(),
        endDatetime: new Date(Date.now() - 86400000).toISOString(),
        examState: 'ended',
        questionCount: 10,
        createdBy: { name: 'Dr. Rajesh Kumar' },
        myAttempt: { status: 'SUBMITTED', totalScore: 38, percentage: 76, result: 'PASS' },
    },
];

const statusConfig = {
    active: { label: 'Active', color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)' },
    upcoming: { label: 'Upcoming', color: '#818cf8', bg: 'rgba(129,140,248,0.1)', border: 'rgba(129,140,248,0.3)' },
    ended: { label: 'Ended', color: '#6b7280', bg: 'rgba(107,114,128,0.1)', border: 'rgba(107,114,128,0.3)' },
};

const attemptStatusConfig = {
    IN_PROGRESS: { label: 'In Progress', color: '#f59e0b' },
    SUBMITTED: { label: 'Submitted', color: '#10b981' },
    AUTO_SUBMITTED: { label: 'Auto Submitted', color: '#6b7280' },
};

function formatDate(iso) {
    return new Date(iso).toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
}

export default function StudentExamListPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        setTimeout(() => {
            const saved = localStorage.getItem('exams_list');
            let loadedExams = [];
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    const storedResults = localStorage.getItem('student_results');
                    const resultsParams = storedResults ? JSON.parse(storedResults) : {};

                    // Map teacher's exam format to student's expected format
                    loadedExams = parsed.filter(e => e.status !== 'DRAFT').map(e => ({
                        id: e.id,
                        title: e.title,
                        description: e.description || '',
                        subjectCategory: e.subject || '',
                        durationMinutes: e.duration || 60,
                        totalMarks: e.totalMarks || 100,
                        passingPercentage: e.passingPercentage || 40,
                        startDatetime: e.startDate || new Date().toISOString(),
                        endDatetime: e.endDate || new Date(Date.now() + 86400000).toISOString(),
                        examState: (e.status === 'ACTIVE' || e.status === 'PUBLISHED') ? 'active' : 'ended',
                        questionCount: e.totalQuestions || 0,
                        createdBy: { name: e.createdBy || 'Teacher' },
                        myAttempt: resultsParams[e.id] || null,
                    }));
                } catch (err) {
                    console.error('Failed to parse exams list:', err);
                }
            }

            // Combine with mock data if needed, or just use what we loaded
            // We'll append MOCK_EXAMS if loadedExams is empty just to have something
            if (loadedExams.length === 0) {
                loadedExams = MOCK_EXAMS;
            }

            setExams(loadedExams);
            setLoading(false);
        }, 600);
    }, []);

    const filtered = filter === 'all' ? exams : exams.filter((e) => e.examState === filter);

    const handleStart = (exam) => {
        navigate(`/exam/${exam.id}/take`);
    };

    const handleViewResult = (exam) => {
        navigate(`/exam/${exam.id}/result`);
    };

    if (loading) {
        return (
            <div className="flex-center" style={{ minHeight: '60vh' }}>
                <div className="spinner spinner-lg" />
            </div>
        );
    }

    return (
        <div style={{ padding: '24px 0' }}>
            {/* Header */}
            <div className="page-header" style={{ marginBottom: '32px' }}>
                <h1 className="page-title">My Exams</h1>
                <p className="page-subtitle">View and attempt your assigned examinations</p>
            </div>

            {/* Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '32px' }}>
                {[
                    { label: 'Active Now', value: exams.filter((e) => e.examState === 'active').length, color: '#10b981', icon: <HiPlay /> },
                    { label: 'Upcoming', value: exams.filter((e) => e.examState === 'upcoming').length, color: '#818cf8', icon: <HiClock /> },
                    { label: 'Completed', value: exams.filter((e) => e.myAttempt?.status === 'SUBMITTED').length, color: '#38bdf8', icon: <HiCheckCircle /> },
                    { label: 'Total', value: exams.length, color: '#c084fc', icon: <HiDocumentText /> },
                ].map((stat) => (
                    <div key={stat.label} className="card" style={{ padding: '20px', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.5rem', color: stat.color, marginBottom: '8px' }}>{stat.icon}</div>
                        <div style={{ fontSize: '2rem', fontWeight: 800, color: stat.color }}>{stat.value}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Filter Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
                {['all', 'active', 'upcoming', 'ended'].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`btn ${filter === f ? 'btn-primary' : 'btn-ghost'}`}
                        style={{ textTransform: 'capitalize' }}
                    >
                        {f === 'all' ? 'All Exams' : f}
                    </button>
                ))}
            </div>

            {/* Exam Cards */}
            {filtered.length === 0 ? (
                <div className="card" style={{ padding: '60px', textAlign: 'center' }}>
                    <HiDocumentText style={{ fontSize: '3rem', color: 'var(--text-muted)', margin: '0 auto 16px' }} />
                    <p className="text-muted">No exams found for this filter.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {filtered.map((exam) => {
                        const sc = statusConfig[exam.examState] || statusConfig.ended;
                        const canStart = exam.examState === 'active' && !exam.myAttempt;
                        const canResume = exam.examState === 'active' && exam.myAttempt?.status === 'IN_PROGRESS';
                        const hasResult = exam.myAttempt?.status === 'SUBMITTED';

                        return (
                            <div key={exam.id} className="card" style={{ padding: '24px', display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                                {/* Left: Info */}
                                <div style={{ flex: 1, minWidth: '220px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' }}>
                                        <h3 style={{ fontWeight: 700, fontSize: '1.1rem', margin: 0 }}>{exam.title}</h3>
                                        <span style={{
                                            padding: '2px 10px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600,
                                            background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`,
                                        }}>
                                            {sc.label}
                                        </span>
                                    </div>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '16px' }}>
                                        {exam.description}
                                    </p>

                                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                                        {[
                                            { icon: <HiDocumentText />, label: `${exam.questionCount} Questions` },
                                            { icon: <HiClock />, label: `${exam.durationMinutes} min` },
                                            { icon: <HiCheckCircle />, label: `${exam.totalMarks} Marks` },
                                        ].map((item) => (
                                            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                                <span style={{ color: 'var(--primary-400)' }}>{item.icon}</span>
                                                {item.label}
                                            </div>
                                        ))}
                                    </div>

                                    <div style={{ marginTop: '12px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                        <span>📅 {formatDate(exam.startDatetime)}</span>
                                        <span style={{ margin: '0 8px' }}>→</span>
                                        <span>{formatDate(exam.endDatetime)}</span>
                                    </div>
                                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                        👤 {exam.createdBy?.name} · 📚 {exam.subjectCategory}
                                    </div>
                                </div>

                                {/* Right: Action */}
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px', minWidth: '160px' }}>
                                    {hasResult && (
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{
                                                fontSize: '2rem', fontWeight: 800,
                                                color: exam.myAttempt.result === 'PASS' ? '#10b981' : '#f43f5e',
                                            }}>
                                                {exam.myAttempt.percentage?.toFixed(1)}%
                                            </div>
                                            <div style={{
                                                padding: '2px 12px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700,
                                                background: exam.myAttempt.result === 'PASS' ? 'rgba(16,185,129,0.15)' : 'rgba(244,63,94,0.15)',
                                                color: exam.myAttempt.result === 'PASS' ? '#10b981' : '#f43f5e',
                                                display: 'inline-block', marginTop: '4px',
                                            }}>
                                                {exam.myAttempt.result}
                                            </div>
                                        </div>
                                    )}

                                    {canStart && (
                                        <button className="btn btn-primary" onClick={() => handleStart(exam)} style={{ width: '100%' }}>
                                            <HiPlay style={{ marginRight: '6px' }} /> Start Exam
                                        </button>
                                    )}
                                    {canResume && (
                                        <button className="btn btn-primary" onClick={() => handleStart(exam)} style={{ width: '100%', background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}>
                                            ▶ Resume Exam
                                        </button>
                                    )}
                                    {hasResult && (
                                        <button className="btn btn-secondary" onClick={() => handleViewResult(exam)} style={{ width: '100%' }}>
                                            <HiEye style={{ marginRight: '6px' }} /> View Result
                                        </button>
                                    )}
                                    {exam.examState === 'upcoming' && (
                                        <button className="btn btn-ghost" disabled style={{ width: '100%', opacity: 0.5, cursor: 'not-allowed' }}>
                                            <HiLockClosed style={{ marginRight: '6px' }} /> Not Started
                                        </button>
                                    )}
                                    {exam.examState === 'ended' && !hasResult && (
                                        <button className="btn btn-ghost" disabled style={{ width: '100%', opacity: 0.5 }}>
                                            Exam Ended
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
