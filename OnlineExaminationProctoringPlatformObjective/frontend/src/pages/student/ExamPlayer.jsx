// ============================================
// Exam Player — Feature 6 + 8 (Proctoring)
// ============================================

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HiClock, HiChevronLeft, HiChevronRight, HiFlag, HiCheck, HiShieldCheck } from 'react-icons/hi';
import './ExamPlayer.css';

// Feature 8: Proctoring components & hooks
import { WebcamGate } from '../../components/proctor/WebcamGate';
import { LiveWebcamFeed } from '../../components/proctor/LiveWebcamFeed';
import { useWebcam } from '../../hooks/useWebcam';
import { useProctor } from '../../hooks/useProctor';
// Feature 9: Fullscreen enforcement
import { useFullscreen } from '../../hooks/useFullscreen';

// ── Mock exam data ────────────────────────────────────────────────────────────
const MOCK_EXAM = {
    attemptId: 'attempt-1',
    examId: 'exam-1',
    examTitle: 'Mathematics Mid-Term 2026',
    durationMinutes: 60,
    timeRemainingSeconds: 3540, // 59 min for demo
    showResultImmediately: true,
    negativeMarking: false,
    questions: [
        {
            id: 'q1', questionType: 'MCQ_SINGLE', marks: 5,
            questionText: 'What is the derivative of f(x) = x² + 3x + 2?',
            options: [
                { id: 'o1a', optionText: '2x + 3' },
                { id: 'o1b', optionText: 'x² + 3' },
                { id: 'o1c', optionText: '2x' },
                { id: 'o1d', optionText: 'x + 3' },
            ],
        },
        {
            id: 'q2', questionType: 'TRUE_FALSE', marks: 2,
            questionText: 'The integral of a constant is always zero.',
            options: [
                { id: 'o2a', optionText: 'True' },
                { id: 'o2b', optionText: 'False' },
            ],
        },
        {
            id: 'q3', questionType: 'MCQ_SINGLE', marks: 5,
            questionText: 'Which of the following is a prime number?',
            options: [
                { id: 'o3a', optionText: '15' },
                { id: 'o3b', optionText: '21' },
                { id: 'o3c', optionText: '37' },
                { id: 'o3d', optionText: '49' },
            ],
        },
        {
            id: 'q4', questionType: 'SHORT_ANSWER', marks: 10,
            questionText: 'Explain the Binomial Theorem and state its general formula.',
            options: [],
        },
        {
            id: 'q5', questionType: 'MCQ_SINGLE', marks: 5,
            questionText: 'If A and B are two sets, which of the following represents A ∩ B?',
            options: [
                { id: 'o5a', optionText: 'Elements in A or B' },
                { id: 'o5b', optionText: 'Elements in both A and B' },
                { id: 'o5c', optionText: 'Elements only in A' },
                { id: 'o5d', optionText: 'Elements only in B' },
            ],
        },
        {
            id: 'q6', questionType: 'FILL_IN_THE_BLANK', marks: 3,
            questionText: 'The value of sin(90°) is ______.',
            options: [],
        },
        {
            id: 'q7', questionType: 'MCQ_SINGLE', marks: 5,
            questionText: 'What is the value of log₁₀(1000)?',
            options: [
                { id: 'o7a', optionText: '2' },
                { id: 'o7b', optionText: '3' },
                { id: 'o7c', optionText: '4' },
                { id: 'o7d', optionText: '10' },
            ],
        },
        {
            id: 'q8', questionType: 'TRUE_FALSE', marks: 2,
            questionText: 'Every square matrix has a unique inverse.',
            options: [
                { id: 'o8a', optionText: 'True' },
                { id: 'o8b', optionText: 'False' },
            ],
        },
    ],
    savedAnswers: [],
};

// Helper: format seconds → MM:SS
function formatTime(seconds) {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

export default function ExamPlayer() {
    const { examId } = useParams();
    const navigate = useNavigate();

    const [exam, setExam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [answers, setAnswers] = useState({});
    const [flagged, setFlagged] = useState(new Set());
    const [timeLeft, setTimeLeft] = useState(0);
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [result, setResult] = useState(null);

    // Feature 11: Adaptive mode state
    const [isAdaptive, setIsAdaptive] = useState(false);
    const [adaptiveQuestion, setAdaptiveQuestion] = useState(null);
    const [adaptiveDifficulty, setAdaptiveDifficulty] = useState('MEDIUM');
    const [adaptiveAnswered, setAdaptiveAnswered] = useState(0);
    const [adaptiveTotal, setAdaptiveTotal] = useState(0);
    const [adaptiveLoading, setAdaptiveLoading] = useState(false);
    const [adaptiveComplete, setAdaptiveComplete] = useState(false);
    const [lastAnswerResult, setLastAnswerResult] = useState(null);

    // Feature 8: Webcam & Proctoring
    const [webcamGranted, setWebcamGranted] = useState(false);
    const [proctorWarnings, setProctorWarnings] = useState([]);
    const webcam = useWebcam();

    const showWarning = useCallback((event) => {
        const msgs = {
            TAB_SWITCH: '⚠️ Tab switch detected! This event has been recorded.',
            FULLSCREEN_EXIT: '⚠️ Fullscreen exit detected!',
            COPY_PASTE_ATTEMPT: '⚠️ Copy/Paste is disabled during this exam.',
            SCREENSHOT_ATTEMPT: '⚠️ Right-click is disabled during this exam.',
            FACE_NOT_DETECTED: '⚠️ Face not detected! Stay in camera view.',
        };
        const msg = msgs[event.eventType] || `⚠️ ${event.eventType}`;
        const id = Date.now();
        setProctorWarnings((w) => [...w, { id, msg }]);
        setTimeout(() => setProctorWarnings((w) => w.filter((x) => x.id !== id)), 3000);
    }, []);

    useProctor({
        attemptId: exam?.attemptId,
        enabled: webcamGranted && !submitted,
        onEvent: showWarning,
    });

    const handleWebcamGranted = useCallback(() => {
        setWebcamGranted(true);
        try { document.documentElement.requestFullscreen?.(); } catch { }
    }, []);

    // Feature 9: Fullscreen enforcement (active once webcam is granted)
    const { isFullscreen, exitCount, enterFullscreen } = useFullscreen({
        enabled: webcamGranted && !submitted,
        onExit: () => {
            showWarning({ eventType: 'FULLSCREEN_EXIT' });
            proctor_addEvent?.('FULLSCREEN_EXIT', 'MEDIUM');
        },
    });
    // expose proctor addEvent via ref so fullscreen onExit can call it
    const proctorRef = useRef(null);
    const proctor_addEvent = proctorRef.current?.addEvent;

    const autoSaveRef = useRef(null);
    const timerRef = useRef(null);

    // ── Load exam ──────────────────────────────────────────────────────────────
    useEffect(() => {
        setTimeout(() => {
            const savedExams = localStorage.getItem('exams_list');
            const allExams = savedExams ? JSON.parse(savedExams) : [];
            let mockData = allExams.find(e => e.id === examId);

            // Fallback if not found 
            if (!mockData) {
                mockData = { ...MOCK_EXAM, id: examId };
            } else {
                // Ensure questions array exists
                if (!mockData.questions || mockData.questions.length === 0) {
                    mockData.questions = MOCK_EXAM.questions; // Fallback questions for testing
                }
                mockData.timeRemainingSeconds = (mockData.duration || 60) * 60;
                mockData.savedAnswers = [];
                mockData.examTitle = mockData.title;
            }

            setExam(mockData);
            setTimeLeft(mockData.timeRemainingSeconds);

            // Check if adaptive mode
            if (mockData.adaptiveMode) {
                setIsAdaptive(true);
                setAdaptiveQuestion(mockData.question || mockData.questions?.[0]);
                setAdaptiveDifficulty(mockData.currentDifficulty || 'MEDIUM');
                setAdaptiveAnswered(mockData.questionsAnswered || 0);
                setAdaptiveTotal(mockData.totalQuestions || mockData.questions?.length || 0);
            } else {
                // Restore any saved answers
                const restored = {};
                mockData.savedAnswers.forEach((ans) => {
                    restored[ans.questionId] = {
                        selectedOptionId: ans.selectedOptionId,
                        studentAnswer: ans.studentAnswer,
                    };
                });
                setAnswers(restored);
            }
            setLoading(false);
        }, 800);
    }, [examId]);

    // ── Countdown timer ────────────────────────────────────────────────────────
    useEffect(() => {
        if (!exam || submitted) return;
        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    handleAutoSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timerRef.current);
    }, [exam, submitted]);

    // ── Auto-save every 10 seconds ─────────────────────────────────────────────
    useEffect(() => {
        if (!exam || submitted) return;
        autoSaveRef.current = setInterval(() => {
            console.log('[AutoSave] Saving answers...', answers);
            // In real app: POST /api/attempts/:id/answer for each changed answer
        }, 10000);
        return () => clearInterval(autoSaveRef.current);
    }, [exam, answers, submitted]);

    const currentQuestion = exam?.questions[currentIdx];
    const totalQuestions = exam?.questions.length || 0;

    const handleOptionSelect = (questionId, optionId) => {
        setAnswers((prev) => ({
            ...prev,
            [questionId]: { selectedOptionId: optionId, studentAnswer: null },
        }));
    };

    const handleTextAnswer = (questionId, text) => {
        setAnswers((prev) => ({
            ...prev,
            [questionId]: { selectedOptionId: null, studentAnswer: text },
        }));
    };

    const toggleFlag = (questionId) => {
        setFlagged((prev) => {
            const next = new Set(prev);
            if (next.has(questionId)) next.delete(questionId);
            else next.add(questionId);
            return next;
        });
    };

    const handleSubmit = () => setShowSubmitModal(true);

    const saveResultToLocal = (res) => {
        const stored = localStorage.getItem('student_results');
        const results = stored ? JSON.parse(stored) : {};
        results[exam.id] = res;
        localStorage.setItem('student_results', JSON.stringify(results));
    };

    const handleAutoSubmit = useCallback(() => {
        clearInterval(timerRef.current);
        const res = {
            status: 'SUBMITTED',
            totalScore: 0,
            examTotalMarks: exam.totalMarks || 100,
            percentage: 0,
            result: 'FAIL',
        };
        setResult(res);
        saveResultToLocal(res);
        setSubmitted(true);
    }, [exam]);

    const confirmSubmit = () => {
        clearInterval(timerRef.current);
        clearInterval(autoSaveRef.current);
        setShowSubmitModal(false);
        // Mock result
        const answered = Object.keys(answers).length;
        const mockScore = answered * 4.5;
        const pct = total > 0 ? (mockScore / total) * 100 : 0;
        const passing = exam.passingPercentage || 40;
        const res = {
            status: 'SUBMITTED',
            totalScore: parseFloat(mockScore.toFixed(1)),
            examTotalMarks: total,
            percentage: parseFloat(pct.toFixed(2)),
            result: pct >= passing ? 'PASS' : 'FAIL',
        };
        setResult(res);
        saveResultToLocal(res);
        setSubmitted(true);
    };

    const getQuestionStatus = (idx) => {
        const q = exam.questions[idx];
        const ans = answers[q.id];
        const hasAnswer = ans?.selectedOptionId || ans?.studentAnswer?.trim();
        if (flagged.has(q.id)) return 'flagged';
        if (hasAnswer) return 'answered';
        if (idx === currentIdx) return 'current';
        return 'unanswered';
    };

    // ── Feature 11: Adaptive answer handler ──────────────────────────────────
    const handleAdaptiveSubmitAnswer = async () => {
        if (!adaptiveQuestion) return;
        const qId = adaptiveQuestion.id;
        const ans = answers[qId];

        setAdaptiveLoading(true);
        setLastAnswerResult(null);

        try {
            // 1. Submit the answer and get grading result
            // Mock: In production call POST /api/attempts/:id/adaptive/answer
            const wasCorrect = ans?.selectedOptionId
                ? Math.random() > 0.4  // Mock: 60% chance correct for demo
                : false;

            setLastAnswerResult({
                isCorrect: wasCorrect,
                questionId: qId,
            });

            // 2. Fetch next question
            // Mock: In production call POST /api/attempts/:id/adaptive/next
            const newAnswered = adaptiveAnswered + 1;
            setAdaptiveAnswered(newAnswered);

            // Simulate difficulty adjustment
            const nextDiff = wasCorrect
                ? (adaptiveDifficulty === 'EASY' ? 'MEDIUM' : adaptiveDifficulty === 'MEDIUM' ? 'HARD' : 'HARD')
                : (adaptiveDifficulty === 'HARD' ? 'MEDIUM' : adaptiveDifficulty === 'MEDIUM' ? 'EASY' : 'EASY');
            setAdaptiveDifficulty(nextDiff);

            // Pick next question from remaining pool
            const answeredIds = new Set(Object.keys(answers));
            answeredIds.add(qId);
            const remaining = exam.questions.filter((q) => !answeredIds.has(q.id));

            if (remaining.length === 0) {
                setAdaptiveComplete(true);
                setAdaptiveQuestion(null);
            } else {
                // Simulate picking based on difficulty (or just next available)
                const next = remaining[Math.floor(Math.random() * remaining.length)];
                setAdaptiveQuestion({
                    ...next,
                    difficultyLevel: nextDiff,
                });
            }

            // Wait briefly to show result feedback
            await new Promise((r) => setTimeout(r, 800));
            setLastAnswerResult(null);
        } catch (err) {
            console.error('Adaptive answer error:', err);
        } finally {
            setAdaptiveLoading(false);
        }
    };

    // ── Loading ────────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="exam-loading">
                <div className="spinner spinner-lg" />
                <p>Loading exam...</p>
            </div>
        );
    }

    // ── Webcam Gate (Feature 8) ────────────────────────────────────────────────
    if (!webcamGranted) {
        return <WebcamGate examTitle={exam?.examTitle || 'Exam'} onGranted={handleWebcamGranted} webcam={webcam} />;
    }

    // ── Result Screen ──────────────────────────────────────────────────────────
    if (submitted && result) {
        const isPassed = result.result === 'PASS';
        return (
            <div className="exam-result-screen">
                <div className="exam-result-card">
                    <div className={`result-icon ${isPassed ? 'pass' : 'fail'}`}>
                        {isPassed ? '🎉' : '😔'}
                    </div>
                    <h1 className="result-title">{isPassed ? 'Congratulations!' : 'Better Luck Next Time'}</h1>
                    <p className="result-subtitle">{exam.examTitle}</p>

                    <div className="result-score-ring">
                        <div className="result-percentage">{result.percentage.toFixed(1)}%</div>
                        <div className={`result-badge ${isPassed ? 'pass' : 'fail'}`}>{result.result}</div>
                    </div>

                    <div className="result-stats">
                        <div className="result-stat">
                            <div className="result-stat-value">{result.totalScore}</div>
                            <div className="result-stat-label">Score</div>
                        </div>
                        <div className="result-stat">
                            <div className="result-stat-value">{result.examTotalMarks}</div>
                            <div className="result-stat-label">Total Marks</div>
                        </div>
                        <div className="result-stat">
                            <div className="result-stat-value">{Object.keys(answers).length}</div>
                            <div className="result-stat-label">Answered</div>
                        </div>
                        <div className="result-stat">
                            <div className="result-stat-value">{totalQuestions - Object.keys(answers).length}</div>
                            <div className="result-stat-label">Skipped</div>
                        </div>
                    </div>

                    <button className="btn btn-primary btn-lg" style={{ marginTop: '24px', minWidth: '200px' }}
                        onClick={() => navigate('/dashboard/exams')}>
                        Back to My Exams
                    </button>
                </div>
            </div>
        );
    }

    const isWarning = timeLeft < 300;
    const isDanger = timeLeft < 60;

    return (
        <>
            {/* Proctor warning toasts (Feature 8) */}
            <div style={{ position: 'fixed', top: 72, left: '50%', transform: 'translateX(-50%)', zIndex: 300, display: 'flex', flexDirection: 'column', gap: 8, pointerEvents: 'none' }}>
                {proctorWarnings.map((w) => (
                    <div key={w.id} className="proctor-warning">{w.msg}</div>
                ))}
            </div>

            {/* Live webcam feed — corner overlay with face detection AI (Feature 8+10) */}
            {webcamGranted && !submitted && (
                <LiveWebcamFeed
                    stream={webcam.stream}
                    enabled={!submitted}
                    onCameraLost={() => showWarning({ eventType: 'FACE_NOT_DETECTED' })}
                    onNoFace={() => {
                        showWarning({ eventType: 'FACE_NOT_DETECTED' });
                    }}
                    onMultipleFaces={() => {
                        showWarning({ eventType: 'MULTIPLE_FACES' });
                    }}
                />
            )}

            {/* Feature 9: Fullscreen exit overlay */}
            {webcamGranted && !submitted && !isFullscreen && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 500,
                    background: 'rgba(5,8,22,0.97)',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    gap: 20,
                }}>
                    <div style={{ fontSize: '4rem' }}>🚨</div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f43f5e' }}>Fullscreen Required!</h2>
                    <p style={{ color: 'var(--text-muted)', maxWidth: 400, textAlign: 'center', lineHeight: 1.7 }}>
                        This exam must be taken in fullscreen mode. Exiting fullscreen is a proctoring violation that has been recorded.
                    </p>
                    {exitCount > 0 && (
                        <div style={{
                            padding: '8px 20px', borderRadius: 999,
                            background: 'rgba(244,63,94,0.15)', border: '1px solid rgba(244,63,94,0.4)',
                            color: '#f43f5e', fontWeight: 700, fontSize: '0.875rem',
                        }}>
                            ⚡ {exitCount} violation{exitCount !== 1 ? 's' : ''} recorded
                        </div>
                    )}
                    <button className="btn btn-primary btn-lg" onClick={enterFullscreen}
                        style={{ minWidth: 240, background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                        🖥️ Return to Fullscreen
                    </button>
                </div>
            )}

            <div className="exam-player">
                {/* ── Top Bar ─────────────────────────────────────────────────── */}
                <header className="exam-header">
                    <div className="exam-header-title">
                        <HiFlag style={{ color: 'var(--primary-400)' }} />
                        <span>{exam.examTitle}</span>
                        {isAdaptive && (
                            <span style={{
                                fontSize: '0.7rem', fontWeight: 700,
                                padding: '3px 10px', borderRadius: 999,
                                background: 'rgba(168,85,247,0.12)', color: '#a855f7',
                                marginLeft: 8,
                            }}>🧠 Adaptive Mode</span>
                        )}
                    </div>
                    {/* Feature 9+10: Shield/AI status badges */}
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        {isAdaptive && (
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: 5,
                                fontSize: '0.72rem', fontWeight: 700,
                                padding: '4px 10px', borderRadius: 8,
                                background: adaptiveDifficulty === 'EASY' ? 'rgba(16,185,129,0.1)'
                                    : adaptiveDifficulty === 'HARD' ? 'rgba(244,63,94,0.1)'
                                        : 'rgba(245,158,11,0.1)',
                                border: `1px solid ${adaptiveDifficulty === 'EASY' ? 'rgba(16,185,129,0.3)'
                                    : adaptiveDifficulty === 'HARD' ? 'rgba(244,63,94,0.3)'
                                        : 'rgba(245,158,11,0.3)'}`,
                                color: adaptiveDifficulty === 'EASY' ? '#10b981'
                                    : adaptiveDifficulty === 'HARD' ? '#f43f5e'
                                        : '#f59e0b',
                            }}>
                                {adaptiveDifficulty === 'EASY' ? '🟢' : adaptiveDifficulty === 'HARD' ? '🔴' : '🟡'} {adaptiveDifficulty}
                            </div>
                        )}
                        {exitCount > 0 && (
                            <div title={`${exitCount} fullscreen exit(s) recorded`} style={{
                                display: 'flex', alignItems: 'center', gap: 5,
                                fontSize: '0.72rem', color: '#f59e0b', fontWeight: 700,
                                padding: '4px 10px', borderRadius: 8,
                                background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)',
                            }}>
                                <HiShieldCheck /> {exitCount} exit{exitCount !== 1 ? 's' : ''}
                            </div>
                        )}
                        {/* Feature 10: AI face detection status pill */}
                        {webcamGranted && !submitted && (
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: 5,
                                fontSize: '0.72rem', fontWeight: 700,
                                padding: '4px 10px', borderRadius: 8,
                                background: 'rgba(129,140,248,0.1)',
                                border: '1px solid rgba(129,140,248,0.3)',
                                color: '#818cf8',
                            }} title="AI Face Detection Active">
                                🧠 AI Proctoring
                            </div>
                        )}
                    </div>
                    <div className={`exam-timer ${isWarning ? 'warning' : ''} ${isDanger ? 'danger' : ''}`}>
                        <HiClock />
                        <span>{formatTime(timeLeft)}</span>
                    </div>
                    <button className="btn btn-primary" style={{ minWidth: '110px' }} onClick={handleSubmit}>
                        Submit Exam
                    </button>
                </header>

                <div className="exam-body">
                    {/* ── Feature 11: Adaptive Mode Layout ─────────────────────── */}
                    {isAdaptive ? (
                        <main className="exam-main" style={{ maxWidth: 800, margin: '0 auto' }}>
                            {/* Adaptive progress bar */}
                            <div style={{ marginBottom: 20 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)' }}>
                                    <span>Progress: {adaptiveAnswered} / {adaptiveTotal || totalQuestions} questions</span>
                                    <span>Difficulty: <strong style={{
                                        color: adaptiveDifficulty === 'EASY' ? '#10b981' : adaptiveDifficulty === 'HARD' ? '#f43f5e' : '#f59e0b'
                                    }}>{adaptiveDifficulty}</strong></span>
                                </div>
                                <div style={{ height: 6, background: 'var(--bg-tertiary)', borderRadius: 999 }}>
                                    <div style={{
                                        width: `${((adaptiveAnswered) / (adaptiveTotal || totalQuestions)) * 100}%`,
                                        height: '100%', borderRadius: 999,
                                        background: 'linear-gradient(90deg, #6366f1, #a855f7)',
                                        transition: 'width 0.5s cubic-bezier(0.4,0,0.2,1)',
                                    }} />
                                </div>
                            </div>

                            {/* Answer result flash */}
                            {lastAnswerResult && (
                                <div style={{
                                    padding: '12px 20px', borderRadius: 'var(--radius-md)', marginBottom: 16, fontWeight: 700,
                                    fontSize: 'var(--font-sm)', textAlign: 'center',
                                    background: lastAnswerResult.isCorrect ? 'rgba(16,185,129,0.1)' : 'rgba(244,63,94,0.1)',
                                    border: `1px solid ${lastAnswerResult.isCorrect ? 'rgba(16,185,129,0.3)' : 'rgba(244,63,94,0.3)'}`,
                                    color: lastAnswerResult.isCorrect ? '#10b981' : '#f43f5e',
                                }}>
                                    {lastAnswerResult.isCorrect ? '✅ Correct! Moving to a harder question...' : '❌ Incorrect. Moving to an easier question...'}
                                </div>
                            )}

                            {adaptiveComplete ? (
                                /* All questions answered */
                                <div className="question-card" style={{ textAlign: 'center', padding: 40 }}>
                                    <div style={{ fontSize: '3rem', marginBottom: 16 }}>🎯</div>
                                    <h2 style={{ fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>All Questions Completed!</h2>
                                    <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>You've answered all {adaptiveAnswered} adaptive questions. Click Submit to finalize your exam.</p>
                                    <button className="btn btn-primary btn-lg" onClick={handleSubmit}>Submit Exam</button>
                                </div>
                            ) : adaptiveQuestion ? (
                                <div className="question-card">
                                    {/* Question meta */}
                                    <div className="question-meta">
                                        <span className="question-number">Question {adaptiveAnswered + 1}</span>
                                        <span className="question-marks">{adaptiveQuestion.marks} Mark{adaptiveQuestion.marks !== 1 ? 's' : ''}</span>
                                        <span className="question-type-badge">{adaptiveQuestion.questionType?.replace('_', ' ')}</span>
                                        {adaptiveQuestion.difficultyLevel && (
                                            <span style={{
                                                padding: '3px 12px', borderRadius: 999, fontSize: '0.72rem', fontWeight: 800,
                                                textTransform: 'uppercase', letterSpacing: '0.04em',
                                                background: adaptiveQuestion.difficultyLevel === 'EASY' ? 'rgba(16,185,129,0.12)'
                                                    : adaptiveQuestion.difficultyLevel === 'HARD' ? 'rgba(244,63,94,0.12)' : 'rgba(245,158,11,0.12)',
                                                color: adaptiveQuestion.difficultyLevel === 'EASY' ? '#10b981'
                                                    : adaptiveQuestion.difficultyLevel === 'HARD' ? '#f43f5e' : '#f59e0b',
                                            }}>
                                                {adaptiveQuestion.difficultyLevel}
                                            </span>
                                        )}
                                    </div>

                                    {/* Question text */}
                                    <div className="question-text">{adaptiveQuestion.questionText}</div>

                                    {/* Answer input */}
                                    <div className="answer-area">
                                        {['MCQ_SINGLE', 'TRUE_FALSE'].includes(adaptiveQuestion.questionType) && (
                                            <div className="options-list">
                                                {adaptiveQuestion.options?.map((opt) => {
                                                    const selected = answers[adaptiveQuestion.id]?.selectedOptionId === opt.id;
                                                    return (
                                                        <button
                                                            key={opt.id}
                                                            className={`option-btn ${selected ? 'selected' : ''}`}
                                                            onClick={() => handleOptionSelect(adaptiveQuestion.id, opt.id)}
                                                            disabled={adaptiveLoading}
                                                        >
                                                            <span className={`option-circle ${selected ? 'selected' : ''}`}>
                                                                {selected && <HiCheck />}
                                                            </span>
                                                            <span className="option-text">{opt.optionText}</span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {adaptiveQuestion.questionType === 'SHORT_ANSWER' && (
                                            <textarea
                                                className="text-answer"
                                                placeholder="Type your answer here..."
                                                value={answers[adaptiveQuestion.id]?.studentAnswer || ''}
                                                onChange={(e) => handleTextAnswer(adaptiveQuestion.id, e.target.value)}
                                                rows={6}
                                                disabled={adaptiveLoading}
                                            />
                                        )}

                                        {adaptiveQuestion.questionType === 'FILL_IN_THE_BLANK' && (
                                            <input
                                                type="text"
                                                className="fill-answer form-input"
                                                placeholder="Type your answer..."
                                                value={answers[adaptiveQuestion.id]?.studentAnswer || ''}
                                                onChange={(e) => handleTextAnswer(adaptiveQuestion.id, e.target.value)}
                                                disabled={adaptiveLoading}
                                            />
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-center" style={{ minHeight: 200 }}>
                                    <div className="spinner spinner-lg" />
                                </div>
                            )}

                            {/* Adaptive navigation */}
                            {!adaptiveComplete && adaptiveQuestion && (
                                <div className="question-nav-bar" style={{ justifyContent: 'flex-end', marginTop: 16 }}>
                                    <button
                                        className="btn btn-primary"
                                        onClick={handleAdaptiveSubmitAnswer}
                                        disabled={adaptiveLoading || !answers[adaptiveQuestion.id]}
                                    >
                                        {adaptiveLoading ? (
                                            <><div className="spinner spinner-sm" style={{ marginRight: 8 }} /> Loading next...</>
                                        ) : (
                                            <>Submit Answer & Next →</>
                                        )}
                                    </button>
                                </div>
                            )}
                        </main>
                    ) : (
                        /* ── Standard Mode Layout ──────────────────────────────── */
                        <>
                            <aside className="exam-sidebar">
                                <div className="sidebar-title">Question Navigator</div>
                                <div className="question-grid">
                                    {exam.questions.map((q, idx) => {
                                        const status = getQuestionStatus(idx);
                                        return (
                                            <button
                                                key={q.id}
                                                className={`q-nav-btn ${status}`}
                                                onClick={() => setCurrentIdx(idx)}
                                                title={`Q${idx + 1} — ${status}`}
                                            >
                                                {idx + 1}
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="sidebar-legend">
                                    {[
                                        { cls: 'answered', label: 'Answered' },
                                        { cls: 'unanswered', label: 'Not Answered' },
                                        { cls: 'flagged', label: 'Flagged' },
                                        { cls: 'current', label: 'Current' },
                                    ].map((l) => (
                                        <div key={l.cls} className="legend-item">
                                            <span className={`legend-dot ${l.cls}`} />
                                            <span>{l.label}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="sidebar-progress">
                                    <div className="sidebar-progress-label">
                                        {Object.keys(answers).length} / {totalQuestions} answered
                                    </div>
                                    <div className="sidebar-progress-bar">
                                        <div
                                            className="sidebar-progress-fill"
                                            style={{ width: `${(Object.keys(answers).length / totalQuestions) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            </aside>

                            {/* ── Main — Question Panel ───────────────────────────────── */}
                            <main className="exam-main">
                                <div className="question-card">
                                    {/* Question meta */}
                                    <div className="question-meta">
                                        <span className="question-number">Question {currentIdx + 1} of {totalQuestions}</span>
                                        <span className="question-marks">{currentQuestion.marks} Mark{currentQuestion.marks !== 1 ? 's' : ''}</span>
                                        <span className="question-type-badge">{currentQuestion.questionType.replace('_', ' ')}</span>
                                        <button
                                            className={`flag-btn ${flagged.has(currentQuestion.id) ? 'flagged' : ''}`}
                                            onClick={() => toggleFlag(currentQuestion.id)}
                                            title="Flag for review"
                                        >
                                            <HiFlag /> {flagged.has(currentQuestion.id) ? 'Flagged' : 'Flag'}
                                        </button>
                                    </div>

                                    {/* Question text */}
                                    <div className="question-text">
                                        {currentQuestion.questionText}
                                    </div>

                                    {/* Answer input */}
                                    <div className="answer-area">
                                        {/* MCQ / TRUE_FALSE */}
                                        {['MCQ_SINGLE', 'TRUE_FALSE'].includes(currentQuestion.questionType) && (
                                            <div className="options-list">
                                                {currentQuestion.options.map((opt) => {
                                                    const selected = answers[currentQuestion.id]?.selectedOptionId === opt.id;
                                                    return (
                                                        <button
                                                            key={opt.id}
                                                            className={`option-btn ${selected ? 'selected' : ''}`}
                                                            onClick={() => handleOptionSelect(currentQuestion.id, opt.id)}
                                                        >
                                                            <span className={`option-circle ${selected ? 'selected' : ''}`}>
                                                                {selected && <HiCheck />}
                                                            </span>
                                                            <span className="option-text">{opt.optionText}</span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {/* SHORT_ANSWER */}
                                        {currentQuestion.questionType === 'SHORT_ANSWER' && (
                                            <textarea
                                                className="text-answer"
                                                placeholder="Type your answer here..."
                                                value={answers[currentQuestion.id]?.studentAnswer || ''}
                                                onChange={(e) => handleTextAnswer(currentQuestion.id, e.target.value)}
                                                rows={6}
                                            />
                                        )}

                                        {/* FILL_IN_THE_BLANK */}
                                        {currentQuestion.questionType === 'FILL_IN_THE_BLANK' && (
                                            <input
                                                type="text"
                                                className="fill-answer form-input"
                                                placeholder="Type your answer..."
                                                value={answers[currentQuestion.id]?.studentAnswer || ''}
                                                onChange={(e) => handleTextAnswer(currentQuestion.id, e.target.value)}
                                            />
                                        )}
                                    </div>
                                </div>

                                {/* Navigation buttons */}
                                <div className="question-nav-bar">
                                    <button
                                        className="btn btn-secondary"
                                        disabled={currentIdx === 0}
                                        onClick={() => setCurrentIdx((i) => i - 1)}
                                    >
                                        <HiChevronLeft /> Previous
                                    </button>

                                    <button
                                        className="btn btn-ghost"
                                        onClick={() => {
                                            setAnswers((prev) => {
                                                const next = { ...prev };
                                                delete next[currentQuestion.id];
                                                return next;
                                            });
                                        }}
                                    >
                                        Clear
                                    </button>

                                    {currentIdx < totalQuestions - 1 ? (
                                        <button
                                            className="btn btn-primary"
                                            onClick={() => setCurrentIdx((i) => i + 1)}
                                        >
                                            Next <HiChevronRight />
                                        </button>
                                    ) : (
                                        <button className="btn btn-primary" onClick={handleSubmit}>
                                            Submit Exam
                                        </button>
                                    )}
                                </div>
                            </main>
                        </>
                    )}
                </div>

                {/* ── Submit Confirmation Modal ─────────────────────────────── */}
                {showSubmitModal && (
                    <div className="modal-overlay" onClick={() => setShowSubmitModal(false)}>
                        <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                            <h2 className="modal-title">Submit Exam?</h2>
                            <p className="modal-body">
                                You have answered <strong>{isAdaptive ? adaptiveAnswered : Object.keys(answers).length}</strong> out of <strong>{isAdaptive ? (adaptiveTotal || totalQuestions) : totalQuestions}</strong> questions.
                                {!isAdaptive && totalQuestions - Object.keys(answers).length > 0 && (
                                    <span style={{ color: 'var(--danger-400)' }}>
                                        {' '}{totalQuestions - Object.keys(answers).length} question(s) are unanswered.
                                    </span>
                                )}
                            </p>
                            <p className="modal-body" style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                Once submitted, you cannot change your answers.
                            </p>
                            <div className="modal-actions">
                                <button className="btn btn-ghost" onClick={() => setShowSubmitModal(false)}>
                                    Continue Exam
                                </button>
                                <button className="btn btn-primary" onClick={confirmSubmit}>
                                    Yes, Submit
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

