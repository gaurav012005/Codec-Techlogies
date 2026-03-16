// ============================================
// Exam Result Page — Feature 7
// Full result screen with:
//   • Animated score ring / donut chart
//   • Correct / Wrong / Skipped breakdown
//   • Per-question review with explanations
//   • Performance by question type
// ============================================

import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
    HiCheckCircle, HiXCircle, HiMinusCircle, HiClock,
    HiDocumentText, HiChartBar, HiChevronDown, HiChevronUp,
    HiArrowLeft, HiRefresh,
} from 'react-icons/hi';
import './ResultPage.css';

// ── Mock result data ──────────────────────────────────────────────────────────
const MOCK_RESULT = {
    attempt: {
        id: 'attempt-1',
        status: 'SUBMITTED',
        result: 'PASS',
        totalScore: 32,
        percentage: 86.48,
        startedAt: '2026-02-27T11:00:00Z',
        submittedAt: '2026-02-27T11:47:00Z',
        durationTakenMinutes: 47,
    },
    exam: {
        id: 'exam-1',
        title: 'Mathematics Mid-Term 2026',
        subjectCategory: 'Mathematics',
        totalMarks: 37,
        passingPercentage: 40,
        durationMinutes: 60,
        showResultImmediately: true,
        allowReview: true,
    },
    student: { name: 'Amit Verma', email: 'student@examplatform.com' },
    stats: {
        totalQuestions: 8,
        answered: 7,
        skipped: 1,
        correct: 5,
        wrong: 2,
        pending: 0,
        byType: {
            MCQ_SINGLE: { correct: 4, wrong: 1, pending: 0 },
            TRUE_FALSE: { correct: 1, wrong: 1, pending: 0 },
            SHORT_ANSWER: { correct: 0, wrong: 0, pending: 1 },
            FILL_IN_THE_BLANK: { correct: 0, wrong: 0, pending: 1 },
        },
    },
    answers: [
        {
            questionId: 'q1', questionType: 'MCQ_SINGLE', marks: 5, marksAwarded: 5, isCorrect: true,
            questionText: 'What is the derivative of f(x) = x² + 3x + 2?',
            selectedOption: { optionText: '2x + 3', isCorrect: true },
            correctOptions: [{ optionText: '2x + 3' }],
            allOptions: [
                { optionText: '2x + 3', isCorrect: true },
                { optionText: 'x² + 3', isCorrect: false },
                { optionText: '2x', isCorrect: false },
                { optionText: 'x + 3', isCorrect: false },
            ],
            explanation: 'The derivative of xⁿ is n·xⁿ⁻¹. So d/dx(x²) = 2x and d/dx(3x) = 3.',
        },
        {
            questionId: 'q2', questionType: 'TRUE_FALSE', marks: 2, marksAwarded: 0, isCorrect: false,
            questionText: 'The integral of a constant is always zero.',
            selectedOption: { optionText: 'True', isCorrect: false },
            correctOptions: [{ optionText: 'False' }],
            allOptions: [{ optionText: 'True', isCorrect: false }, { optionText: 'False', isCorrect: true }],
            explanation: 'The integral of a constant c is c·x + C (not zero). ∫c dx = cx + C.',
        },
        {
            questionId: 'q3', questionType: 'MCQ_SINGLE', marks: 5, marksAwarded: 5, isCorrect: true,
            questionText: 'Which of the following is a prime number?',
            selectedOption: { optionText: '37', isCorrect: true },
            correctOptions: [{ optionText: '37' }],
            allOptions: [
                { optionText: '15', isCorrect: false },
                { optionText: '21', isCorrect: false },
                { optionText: '37', isCorrect: true },
                { optionText: '49', isCorrect: false },
            ],
            explanation: '37 is prime. 15 = 3×5, 21 = 3×7, 49 = 7×7.',
        },
        {
            questionId: 'q4', questionType: 'SHORT_ANSWER', marks: 10, marksAwarded: 0, isCorrect: null,
            questionText: 'Explain the Binomial Theorem and state its general formula.',
            studentAnswer: 'The Binomial Theorem provides a formula for expanding (a+b)^n using combinations.',
            selectedOption: null,
            correctOptions: [],
            allOptions: [],
            explanation: null,
        },
        {
            questionId: 'q5', questionType: 'MCQ_SINGLE', marks: 5, marksAwarded: 5, isCorrect: true,
            questionText: 'If A and B are two sets, which represents A ∩ B?',
            selectedOption: { optionText: 'Elements in both A and B', isCorrect: true },
            correctOptions: [{ optionText: 'Elements in both A and B' }],
            allOptions: [
                { optionText: 'Elements in A or B', isCorrect: false },
                { optionText: 'Elements in both A and B', isCorrect: true },
                { optionText: 'Elements only in A', isCorrect: false },
                { optionText: 'Elements only in B', isCorrect: false },
            ],
            explanation: 'Intersection (∩) contains elements common to both sets.',
        },
        {
            questionId: 'q6', questionType: 'FILL_IN_THE_BLANK', marks: 3, marksAwarded: 0, isCorrect: null,
            questionText: 'The value of sin(90°) is ______.',
            studentAnswer: '1',
            selectedOption: null,
            correctOptions: [],
            allOptions: [],
            explanation: null,
        },
        {
            questionId: 'q7', questionType: 'MCQ_SINGLE', marks: 5, marksAwarded: 5, isCorrect: true,
            questionText: 'What is the value of log₁₀(1000)?',
            selectedOption: { optionText: '3', isCorrect: true },
            correctOptions: [{ optionText: '3' }],
            allOptions: [
                { optionText: '2', isCorrect: false },
                { optionText: '3', isCorrect: true },
                { optionText: '4', isCorrect: false },
                { optionText: '10', isCorrect: false },
            ],
            explanation: 'log₁₀(1000) = log₁₀(10³) = 3.',
        },
        {
            questionId: 'q8', questionType: 'TRUE_FALSE', marks: 2, marksAwarded: 0, isCorrect: false,
            questionText: 'Every square matrix has a unique inverse.',
            selectedOption: { optionText: 'True', isCorrect: false },
            correctOptions: [{ optionText: 'False' }],
            allOptions: [{ optionText: 'True', isCorrect: false }, { optionText: 'False', isCorrect: true }],
            explanation: 'Only non-singular (det ≠ 0) matrices have inverses. Singular matrices have no inverse.',
        },
    ],
};

// ── Donut Chart (pure SVG, no library needed) ─────────────────────────────────
function DonutChart({ correct, wrong, skipped, pending, size = 200 }) {
    const total = correct + wrong + skipped + pending || 1;
    const cx = size / 2;
    const cy = size / 2;
    const r = size * 0.38;
    const stroke = size * 0.12;

    const segments = [
        { value: correct, color: '#10b981', label: 'Correct' },
        { value: wrong, color: '#f43f5e', label: 'Wrong' },
        { value: skipped, color: '#6b7280', label: 'Skipped' },
        { value: pending, color: '#f59e0b', label: 'Pending' },
    ].filter((s) => s.value > 0);

    const circumference = 2 * Math.PI * r;
    let offset = 0;

    const paths = segments.map((seg) => {
        const dash = (seg.value / total) * circumference;
        const gap = circumference - dash;
        const path = (
            <circle
                key={seg.label}
                cx={cx} cy={cy} r={r}
                fill="none"
                stroke={seg.color}
                strokeWidth={stroke}
                strokeDasharray={`${dash} ${gap}`}
                strokeDashoffset={-offset + circumference * 0.25}
                style={{ transition: 'stroke-dasharray 0.8s ease' }}
            />
        );
        offset += dash;
        return path;
    });

    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
            {/* Background ring */}
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={stroke} />
            {paths}
        </svg>
    );
}

// ── Question Review Item ──────────────────────────────────────────────────────
function QuestionReviewItem({ answer, index }) {
    const [expanded, setExpanded] = useState(false);

    const statusIcon = answer.isCorrect === true
        ? <HiCheckCircle className="q-status-icon correct" />
        : answer.isCorrect === false
            ? <HiXCircle className="q-status-icon wrong" />
            : <HiMinusCircle className="q-status-icon pending" />;

    const statusLabel = answer.isCorrect === true ? 'Correct' : answer.isCorrect === false ? 'Wrong' : 'Pending Review';
    const statusClass = answer.isCorrect === true ? 'correct' : answer.isCorrect === false ? 'wrong' : 'pending';

    return (
        <div className={`review-item ${statusClass}`}>
            <div className="review-item-header" onClick={() => setExpanded(!expanded)}>
                <div className="review-item-left">
                    {statusIcon}
                    <span className="review-q-number">Q{index + 1}</span>
                    <span className="review-q-text">{answer.questionText}</span>
                </div>
                <div className="review-item-right">
                    <span className={`review-marks ${statusClass}`}>
                        {answer.marksAwarded > 0 ? '+' : ''}{answer.marksAwarded ?? '?'} / {answer.marks}
                    </span>
                    <span className={`review-status-badge ${statusClass}`}>{statusLabel}</span>
                    {expanded ? <HiChevronUp /> : <HiChevronDown />}
                </div>
            </div>

            {expanded && (
                <div className="review-item-body">
                    {/* Options (MCQ / TF) */}
                    {answer.allOptions.length > 0 && (
                        <div className="review-options">
                            {answer.allOptions.map((opt, i) => {
                                const isSelected = answer.selectedOption?.optionText === opt.optionText;
                                const cls = opt.isCorrect ? 'correct' : isSelected && !opt.isCorrect ? 'wrong' : '';
                                return (
                                    <div key={i} className={`review-option ${cls}`}>
                                        <span className={`review-option-circle ${cls}`}>
                                            {opt.isCorrect ? '✓' : isSelected ? '✗' : ''}
                                        </span>
                                        <span>{opt.optionText}</span>
                                        {isSelected && <span className="review-your-answer">← Your answer</span>}
                                        {opt.isCorrect && <span className="review-correct-answer">← Correct</span>}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Short/Fill answer */}
                    {answer.studentAnswer && (
                        <div className="review-text-answer">
                            <span className="review-label">Your Answer:</span>
                            <span>{answer.studentAnswer}</span>
                        </div>
                    )}

                    {/* Explanation */}
                    {answer.explanation && (
                        <div className="review-explanation">
                            <span className="review-label">💡 Explanation:</span>
                            <span>{answer.explanation}</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ── Main Result Page ──────────────────────────────────────────────────────────
export default function ResultPage() {
    const { attemptId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const animRef = useRef(false);

    useEffect(() => {
        setTimeout(() => {
            const storedResults = localStorage.getItem('student_results');
            const storedExams = localStorage.getItem('exams_list');

            const resultsParams = storedResults ? JSON.parse(storedResults) : {};
            const examsList = storedExams ? JSON.parse(storedExams) : [];

            // `attemptId` is actually the `exam.id` in our current route config
            const myResult = resultsParams[attemptId];
            const originalExam = examsList.find(e => e.id === attemptId);

            if (myResult && originalExam) {
                // Synthesize the data format ResultPage expects
                setData({
                    attempt: {
                        id: attemptId,
                        status: myResult.status,
                        result: myResult.result,
                        totalScore: myResult.totalScore,
                        percentage: myResult.percentage,
                        startedAt: new Date().toISOString(), // Mocked metadata
                        submittedAt: new Date().toISOString(),
                        durationTakenMinutes: Math.floor(originalExam.duration * 0.8), // mock taken time
                    },
                    exam: {
                        id: originalExam.id,
                        title: originalExam.title,
                        subjectCategory: originalExam.subject,
                        totalMarks: myResult.examTotalMarks,
                        passingPercentage: originalExam.passingPercentage || 40,
                        durationMinutes: originalExam.duration,
                    },
                    student: { name: 'Current User', email: 'student@examplatform.com' },
                    stats: {
                        totalQuestions: originalExam.totalQuestions || 0,
                        answered: originalExam.totalQuestions || 0, // Mock stats for simplicity unless tracked
                        skipped: 0,
                        correct: Math.floor((myResult.percentage / 100) * (originalExam.totalQuestions || 0)),
                        wrong: 0,
                        pending: 0,
                        byType: {
                            MCQ_SINGLE: { correct: 0, wrong: 0, pending: 0 },
                        },
                    },
                    answers: [] // Mock answers empty since we didn't save entire answer payload
                });
            } else {
                setData(MOCK_RESULT); // Fallback
            }
            setLoading(false);
        }, 500);
    }, [attemptId]);

    if (loading) {
        return (
            <div className="result-loading">
                <div className="spinner spinner-lg" />
                <p>Loading result...</p>
            </div>
        );
    }

    const { attempt, exam, student, stats, answers } = data;
    const isPassed = attempt.result === 'PASS';
    const pct = attempt.percentage?.toFixed(1) ?? 0;

    return (
        <div className="result-page">
            {/* ── Top bar ─────────────────────────────────────────────── */}
            <div className="result-topbar">
                <button className="btn btn-ghost btn-sm" onClick={() => navigate('/dashboard/exams')}>
                    <HiArrowLeft /> Back to Exams
                </button>
                <h1 className="result-topbar-title">{exam.title}</h1>
                <div />
            </div>

            {/* ── Hero Score Card ──────────────────────────────────────── */}
            <div className={`result-hero ${isPassed ? 'pass' : 'fail'}`}>
                <div className="result-hero-chart">
                    <DonutChart
                        correct={stats.correct}
                        wrong={stats.wrong}
                        skipped={stats.skipped}
                        pending={stats.pending}
                        size={180}
                    />
                    <div className="result-chart-center">
                        <div className="result-pct">{pct}%</div>
                        <div className={`result-verdict ${isPassed ? 'pass' : 'fail'}`}>
                            {isPassed ? '✅ PASS' : '❌ FAIL'}
                        </div>
                    </div>
                </div>

                <div className="result-hero-info">
                    <h2 className="result-hero-name">{student.name}</h2>
                    <p className="result-hero-exam">{exam.subjectCategory}</p>

                    <div className="result-hero-stats">
                        <div className="rh-stat">
                            <div className="rh-stat-value" style={{ color: '#10b981' }}>{stats.correct}</div>
                            <div className="rh-stat-label">Correct</div>
                        </div>
                        <div className="rh-stat">
                            <div className="rh-stat-value" style={{ color: '#f43f5e' }}>{stats.wrong}</div>
                            <div className="rh-stat-label">Wrong</div>
                        </div>
                        <div className="rh-stat">
                            <div className="rh-stat-value" style={{ color: '#6b7280' }}>{stats.skipped}</div>
                            <div className="rh-stat-label">Skipped</div>
                        </div>
                        {stats.pending > 0 && (
                            <div className="rh-stat">
                                <div className="rh-stat-value" style={{ color: '#f59e0b' }}>{stats.pending}</div>
                                <div className="rh-stat-label">Pending</div>
                            </div>
                        )}
                        <div className="rh-stat">
                            <div className="rh-stat-value" style={{ color: 'var(--primary-400)' }}>
                                {attempt.totalScore}/{exam.totalMarks}
                            </div>
                            <div className="rh-stat-label">Score</div>
                        </div>
                        <div className="rh-stat">
                            <div className="rh-stat-value" style={{ color: '#818cf8' }}>
                                {attempt.durationTakenMinutes}m
                            </div>
                            <div className="rh-stat-label">Time Taken</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Tabs ─────────────────────────────────────────────────── */}
            <div className="result-tabs">
                {[
                    { id: 'overview', label: '📊 Overview' },
                    { id: 'review', label: '📋 Question Review' },
                    { id: 'breakdown', label: '🏷️ By Type' },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`result-tab ${activeTab === tab.id ? 'active' : ''}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="result-body">
                {/* ── Overview Tab ─────────────────────────────────────── */}
                {activeTab === 'overview' && (
                    <div className="result-overview">
                        {/* Progress bars */}
                        <div className="result-card">
                            <h3 className="result-card-title">Performance Breakdown</h3>
                            {[
                                { label: 'Correct', value: stats.correct, total: stats.totalQuestions, color: '#10b981' },
                                { label: 'Wrong', value: stats.wrong, total: stats.totalQuestions, color: '#f43f5e' },
                                { label: 'Skipped', value: stats.skipped, total: stats.totalQuestions, color: '#6b7280' },
                            ].map((item) => (
                                <div key={item.label} className="perf-bar-row">
                                    <span className="perf-bar-label">{item.label}</span>
                                    <div className="perf-bar-track">
                                        <div
                                            className="perf-bar-fill"
                                            style={{
                                                width: `${(item.value / item.total) * 100}%`,
                                                background: item.color,
                                            }}
                                        />
                                    </div>
                                    <span className="perf-bar-count" style={{ color: item.color }}>
                                        {item.value}/{item.total}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Score vs Pass mark */}
                        <div className="result-card">
                            <h3 className="result-card-title">Pass Threshold</h3>
                            <div className="pass-threshold-bar">
                                <div
                                    className="pass-threshold-fill"
                                    style={{
                                        width: `${Math.min(pct, 100)}%`,
                                        background: isPassed
                                            ? 'linear-gradient(90deg, #10b981, #34d399)'
                                            : 'linear-gradient(90deg, #f43f5e, #fb7185)',
                                    }}
                                />
                                <div
                                    className="pass-threshold-marker"
                                    style={{ left: `${exam.passingPercentage}%` }}
                                >
                                    <div className="pass-threshold-label">{exam.passingPercentage}% pass mark</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                <span>0%</span>
                                <span style={{ color: isPassed ? '#10b981' : '#f43f5e', fontWeight: 700 }}>
                                    Your score: {pct}%
                                </span>
                                <span>100%</span>
                            </div>
                        </div>

                        {/* Exam info */}
                        <div className="result-card">
                            <h3 className="result-card-title">Exam Details</h3>
                            <div className="exam-details-grid">
                                {[
                                    { label: 'Subject', value: exam.subjectCategory },
                                    { label: 'Total Questions', value: stats.totalQuestions },
                                    { label: 'Total Marks', value: exam.totalMarks },
                                    { label: 'Passing Marks', value: `${Math.ceil(exam.totalMarks * exam.passingPercentage / 100)} (${exam.passingPercentage}%)` },
                                    { label: 'Time Allowed', value: `${exam.durationMinutes} min` },
                                    { label: 'Time Taken', value: `${attempt.durationTakenMinutes} min` },
                                ].map((d) => (
                                    <div key={d.label} className="exam-detail-item">
                                        <div className="exam-detail-label">{d.label}</div>
                                        <div className="exam-detail-value">{d.value}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Review Tab ───────────────────────────────────────── */}
                {activeTab === 'review' && (
                    <div className="result-review">
                        {answers.length === 0 ? (
                            <div className="result-card" style={{ textAlign: 'center', padding: '48px' }}>
                                <p className="text-muted">Question review is not available for this exam.</p>
                            </div>
                        ) : (
                            <>
                                <div className="review-legend">
                                    <span><HiCheckCircle style={{ color: '#10b981' }} /> Correct</span>
                                    <span><HiXCircle style={{ color: '#f43f5e' }} /> Wrong</span>
                                    <span><HiMinusCircle style={{ color: '#f59e0b' }} /> Pending Review</span>
                                </div>
                                {answers.map((ans, i) => (
                                    <QuestionReviewItem key={ans.questionId} answer={ans} index={i} />
                                ))}
                            </>
                        )}
                    </div>
                )}

                {/* ── Breakdown Tab ────────────────────────────────────── */}
                {activeTab === 'breakdown' && (
                    <div className="result-breakdown">
                        {Object.entries(stats.byType).map(([type, counts]) => {
                            const total = counts.correct + counts.wrong + counts.pending;
                            if (total === 0) return null;
                            const accuracy = total > 0 ? Math.round((counts.correct / total) * 100) : 0;

                            return (
                                <div key={type} className="result-card breakdown-card">
                                    <div className="breakdown-header">
                                        <h3 className="breakdown-type">{type.replace(/_/g, ' ')}</h3>
                                        <span className="breakdown-accuracy" style={{
                                            color: accuracy >= 70 ? '#10b981' : accuracy >= 40 ? '#f59e0b' : '#f43f5e',
                                        }}>
                                            {accuracy}% accuracy
                                        </span>
                                    </div>
                                    <div className="breakdown-bars">
                                        {[
                                            { label: 'Correct', val: counts.correct, color: '#10b981' },
                                            { label: 'Wrong', val: counts.wrong, color: '#f43f5e' },
                                            { label: 'Pending', val: counts.pending, color: '#f59e0b' },
                                        ].map((b) => b.val > 0 && (
                                            <div key={b.label} className="breakdown-bar-row">
                                                <span style={{ color: b.color, fontSize: '0.8rem', width: 60 }}>{b.label}</span>
                                                <div className="perf-bar-track">
                                                    <div className="perf-bar-fill" style={{ width: `${(b.val / total) * 100}%`, background: b.color }} />
                                                </div>
                                                <span style={{ color: b.color, fontSize: '0.8rem', width: 20, textAlign: 'right' }}>{b.val}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Action buttons */}
            <div className="result-actions">
                <button className="btn btn-secondary" onClick={() => navigate('/dashboard/exams')}>
                    <HiArrowLeft /> My Exams
                </button>
                <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
                    <HiChartBar /> Dashboard
                </button>
            </div>
        </div>
    );
}
