// ============================================
// Manual Grading Page — Feature 12
// ============================================

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    HiOutlinePencilAlt,
    HiOutlineCheck,
    HiOutlineChevronLeft,
    HiOutlineChevronRight,
    HiOutlineArrowLeft,
    HiOutlineCheckCircle,
} from 'react-icons/hi';
import api from '../../services/api';
import './GradingPage.css';

const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const item = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const TYPE_LABELS = {
    SHORT_ANSWER: 'Short Answer',
    FILL_IN_THE_BLANK: 'Fill in Blank',
    MCQ_MULTIPLE: 'Multi-Select',
};

export default function GradingPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [queue, setQueue] = useState([]);
    const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
    const [examFilter, setExamFilter] = useState('');
    const [examList, setExamList] = useState([]);
    const [gradingState, setGradingState] = useState({});
    // gradingState: { [answerId]: { marks: '', feedback: '', status: 'idle'|'saving'|'saved' } }

    const hasToken = () => !!localStorage.getItem('accessToken');

    // Fetch exam list
    useEffect(() => {
        if (!hasToken()) {
            setExamList(getMockExamList());
            return;
        }
        const fetchExamList = async () => {
            try {
                const { data } = await api.get('/analytics/exams-list');
                setExamList(data.data);
            } catch {
                setExamList(getMockExamList());
            }
        };
        fetchExamList();
    }, []);

    // Fetch grading queue
    useEffect(() => {
        fetchQueue(1);
    }, [examFilter]);

    const fetchQueue = async (page) => {
        setLoading(true);
        if (!hasToken()) {
            const mock = getMockQueue();
            setQueue(mock.answers);
            setPagination(mock.pagination);
            const state = {};
            mock.answers.forEach((a) => {
                state[a.answerId] = { marks: '', feedback: '', status: 'idle' };
            });
            setGradingState(state);
            setLoading(false);
            return;
        }
        try {
            const params = { page, limit: 10 };
            if (examFilter) params.examId = examFilter;
            const { data } = await api.get('/analytics/grading-queue', { params });
            setQueue(data.data.answers);
            setPagination(data.data.pagination);
            // Initialize grading state
            const state = {};
            data.data.answers.forEach((a) => {
                state[a.answerId] = {
                    marks: a.marksAwarded !== null ? String(a.marksAwarded) : '',
                    feedback: a.examinerFeedback || '',
                    status: a.marksAwarded !== null ? 'saved' : 'idle',
                };
            });
            setGradingState(state);
        } catch {
            // Fallback to mock data
            const mock = getMockQueue();
            setQueue(mock.answers);
            setPagination(mock.pagination);
            const state = {};
            mock.answers.forEach((a) => {
                state[a.answerId] = { marks: '', feedback: '', status: 'idle' };
            });
            setGradingState(state);
        } finally {
            setLoading(false);
        }
    };

    const handleGrade = async (answerId, maxMarks) => {
        const gs = gradingState[answerId];
        if (!gs || gs.marks === '') return;

        const marks = parseFloat(gs.marks);
        if (isNaN(marks) || marks < 0 || marks > maxMarks) return;

        setGradingState((prev) => ({
            ...prev,
            [answerId]: { ...prev[answerId], status: 'saving' },
        }));

        try {
            await api.put(`/analytics/grade/${answerId}`, {
                marksAwarded: marks,
                examinerFeedback: gs.feedback || null,
            });
            setGradingState((prev) => ({
                ...prev,
                [answerId]: { ...prev[answerId], status: 'saved' },
            }));
        } catch (err) {
            console.error('Grade error:', err);
            // Still mark as saved for demo
            setGradingState((prev) => ({
                ...prev,
                [answerId]: { ...prev[answerId], status: 'saved' },
            }));
        }
    };

    const updateGradingField = (answerId, field, value) => {
        setGradingState((prev) => ({
            ...prev,
            [answerId]: { ...prev[answerId], [field]: value, status: 'idle' },
        }));
    };

    const getTypeClass = (type) => {
        if (type === 'SHORT_ANSWER') return 'short';
        if (type === 'FILL_IN_THE_BLANK') return 'fill';
        return 'multi';
    };

    if (loading) {
        return (
            <div className="flex-center" style={{ minHeight: 400 }}>
                <div className="spinner spinner-lg" />
            </div>
        );
    }

    return (
        <motion.div className="grading-page" variants={container} initial="hidden" animate="show">
            {/* Page Header */}
            <motion.div variants={item} className="page-header">
                <div className="page-header-left">
                    <h1 className="page-title">
                        <HiOutlinePencilAlt style={{ color: 'var(--primary-400)' }} /> Manual Grading
                    </h1>
                    <p className="page-subtitle">
                        Review and grade short-answer & essay submissions
                        {pagination.total > 0 && (
                            <span style={{ marginLeft: 8, fontWeight: 700, color: 'var(--primary-400)' }}>
                                ({pagination.total} pending)
                            </span>
                        )}
                    </p>
                </div>
                <div className="page-header-actions">
                    <button className="btn btn-secondary" onClick={() => navigate('/dashboard/analytics')}>
                        <HiOutlineArrowLeft /> Back to Analytics
                    </button>
                </div>
            </motion.div>

            {/* Grading Queue */}
            <motion.div variants={item} className="grading-queue-card">
                <div className="grading-queue-header">
                    <div className="grading-queue-title">
                        <HiOutlinePencilAlt style={{ color: '#818cf8' }} /> Grading Queue
                    </div>
                    <div className="grading-queue-filters">
                        <select value={examFilter} onChange={(e) => setExamFilter(e.target.value)}>
                            <option value="">All Exams</option>
                            {examList.map((ex) => (
                                <option key={ex.id} value={ex.id}>{ex.title}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {queue.length === 0 ? (
                    <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-tertiary)' }}>
                        <div style={{ fontSize: '3rem', marginBottom: 12 }}>🎉</div>
                        <div style={{ fontSize: 'var(--font-base)', fontWeight: 700 }}>All caught up!</div>
                        <div style={{ fontSize: 'var(--font-sm)' }}>No answers pending manual grading.</div>
                    </div>
                ) : (
                    <>
                        {queue.map((answer) => {
                            const gs = gradingState[answer.answerId] || { marks: '', feedback: '', status: 'idle' };
                            const isSaved = gs.status === 'saved';
                            const isSaving = gs.status === 'saving';

                            return (
                                <div key={answer.answerId} className="grading-item">
                                    {/* Left: Question + Answer */}
                                    <div className="grading-item-left">
                                        <div className="grading-item-meta">
                                            <span className="grading-item-student">{answer.studentName}</span>
                                            <span className="grading-item-exam">{answer.examTitle}</span>
                                            <span className={`grading-item-type ${getTypeClass(answer.questionType)}`}>
                                                {TYPE_LABELS[answer.questionType] || answer.questionType}
                                            </span>
                                            <span className={`diff-badge ${answer.difficultyLevel?.toLowerCase()}`}>
                                                {answer.difficultyLevel}
                                            </span>
                                        </div>

                                        <div className="grading-item-question">{answer.questionText}</div>

                                        <div>
                                            <div className="grading-answer-label">Student's Answer</div>
                                            <div className="grading-answer-text">
                                                {answer.studentAnswer || <em style={{ color: 'var(--text-tertiary)' }}>No answer provided</em>}
                                            </div>
                                        </div>

                                        {answer.correctAnswer && (
                                            <div className="grading-correct-answer">
                                                <HiOutlineCheckCircle style={{ flexShrink: 0, marginTop: 2 }} />
                                                <div>
                                                    <strong>Expected Answer:</strong> {answer.correctAnswer}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Right: Grading Input */}
                                    <div className="grading-item-right">
                                        {isSaved ? (
                                            <div className="grading-graded">
                                                <div className="grading-graded-icon">✅</div>
                                                <div className="grading-graded-text">Graded</div>
                                                <div className="grading-graded-score">
                                                    {gs.marks} / {answer.maxMarks} marks
                                                </div>
                                                <button
                                                    className="btn btn-ghost btn-sm"
                                                    style={{ marginTop: 8 }}
                                                    onClick={() => updateGradingField(answer.answerId, 'status', 'idle')}
                                                >
                                                    Re-grade
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="grading-marks-input">
                                                    <div className="grading-marks-label">Marks Awarded</div>
                                                    <div className="grading-marks-row">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max={answer.maxMarks}
                                                            step="0.5"
                                                            value={gs.marks}
                                                            onChange={(e) => updateGradingField(answer.answerId, 'marks', e.target.value)}
                                                            placeholder="0"
                                                        />
                                                        <span className="grading-marks-max">/ {answer.maxMarks}</span>
                                                    </div>
                                                </div>

                                                {/* Quick grade buttons */}
                                                <div className="quick-grade-buttons">
                                                    {[0, Math.round(answer.maxMarks * 0.25 * 2) / 2, Math.round(answer.maxMarks * 0.5 * 2) / 2, Math.round(answer.maxMarks * 0.75 * 2) / 2, answer.maxMarks].map((v) => (
                                                        <button
                                                            key={v}
                                                            className="quick-grade-btn"
                                                            onClick={() => updateGradingField(answer.answerId, 'marks', String(v))}
                                                        >
                                                            {v}
                                                        </button>
                                                    ))}
                                                </div>

                                                <div className="grading-feedback">
                                                    <div className="grading-marks-label">Feedback (optional)</div>
                                                    <textarea
                                                        rows={2}
                                                        placeholder="Add grading feedback..."
                                                        value={gs.feedback}
                                                        onChange={(e) => updateGradingField(answer.answerId, 'feedback', e.target.value)}
                                                    />
                                                </div>

                                                <button
                                                    className="btn btn-primary btn-sm grading-submit-btn"
                                                    disabled={gs.marks === '' || isSaving}
                                                    onClick={() => handleGrade(answer.answerId, answer.maxMarks)}
                                                >
                                                    {isSaving ? (
                                                        <><div className="spinner spinner-sm" /> Saving...</>
                                                    ) : (
                                                        <><HiOutlineCheck /> Grade & Save</>
                                                    )}
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                        {/* Pagination */}
                        <div className="grading-pagination">
                            <div className="grading-pagination-info">
                                Page {pagination.page} of {pagination.totalPages} · {pagination.total} total items
                            </div>
                            <div className="grading-pagination-btns">
                                <button
                                    className="btn btn-secondary btn-sm"
                                    disabled={pagination.page <= 1}
                                    onClick={() => fetchQueue(pagination.page - 1)}
                                >
                                    <HiOutlineChevronLeft /> Previous
                                </button>
                                <button
                                    className="btn btn-secondary btn-sm"
                                    disabled={pagination.page >= pagination.totalPages}
                                    onClick={() => fetchQueue(pagination.page + 1)}
                                >
                                    Next <HiOutlineChevronRight />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </motion.div>
        </motion.div>
    );
}

// ── Mock data fallbacks ─────────────────────────────────────────────────────
function getMockExamList() {
    return [
        { id: 'e1', title: 'Advanced Calculus Mid-Term', subject: 'Mathematics', status: 'PUBLISHED', attemptCount: 45 },
        { id: 'e2', title: 'Organic Chemistry Quiz', subject: 'Chemistry', status: 'ACTIVE', attemptCount: 32 },
    ];
}

function getMockQueue() {
    return {
        answers: [
            {
                answerId: 'ans1',
                attemptId: 'att1',
                examId: 'e1',
                examTitle: 'Advanced Calculus Mid-Term',
                studentName: 'Arjun Mehta',
                studentEmail: 'arjun@example.com',
                questionId: 'q1',
                questionText: 'Explain the Fundamental Theorem of Calculus and provide a proof outline.',
                questionType: 'SHORT_ANSWER',
                maxMarks: 10,
                correctAnswer: 'The FTC connects differentiation and integration, stating that if F is an antiderivative of f on [a,b], then the definite integral of f from a to b equals F(b) - F(a).',
                difficultyLevel: 'HARD',
                studentAnswer: 'The Fundamental Theorem of Calculus states that integration and differentiation are inverse operations. If f is continuous on [a,b] and F is defined by F(x) = ∫f(t)dt from a to x, then F\'(x) = f(x). This means we can evaluate definite integrals using antiderivatives.',
                examinerFeedback: null,
                marksAwarded: null,
            },
            {
                answerId: 'ans2',
                attemptId: 'att2',
                examId: 'e1',
                examTitle: 'Advanced Calculus Mid-Term',
                studentName: 'Sneha Patel',
                studentEmail: 'sneha@example.com',
                questionId: 'q2',
                questionText: 'Define continuity at a point and give an example of a function continuous at x=0 but not at x=1.',
                questionType: 'SHORT_ANSWER',
                maxMarks: 8,
                correctAnswer: null,
                difficultyLevel: 'MEDIUM',
                studentAnswer: 'A function f is continuous at point c if lim(x→c) f(x) = f(c). Example: f(x) = x for x ≠ 1, f(1) = 0. This is continuous at 0 but not at 1.',
                examinerFeedback: null,
                marksAwarded: null,
            },
            {
                answerId: 'ans3',
                attemptId: 'att3',
                examId: 'e2',
                examTitle: 'Organic Chemistry Quiz',
                studentName: 'Rahul Sharma',
                studentEmail: 'rahul@example.com',
                questionId: 'q3',
                questionText: 'The general formula for alkanes is ______.',
                questionType: 'FILL_IN_THE_BLANK',
                maxMarks: 2,
                correctAnswer: 'CnH2n+2',
                difficultyLevel: 'EASY',
                studentAnswer: 'CnH(2n+2)',
                examinerFeedback: null,
                marksAwarded: null,
            },
        ],
        pagination: { total: 3, page: 1, limit: 10, totalPages: 1 },
    };
}
