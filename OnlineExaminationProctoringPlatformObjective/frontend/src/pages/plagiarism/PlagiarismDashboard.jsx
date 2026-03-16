// ============================================
// Plagiarism Detection Dashboard — Feature 13
// Side-by-side diff, similarity scores, verdict
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    HiOutlineShieldExclamation,
    HiOutlineRefresh,
    HiOutlineCheck,
    HiOutlineX,
    HiOutlineEye,
    HiOutlineFilter,
    HiOutlineAdjustments,
} from 'react-icons/hi';
import api from '../../services/api';
import './PlagiarismDashboard.css';

// ── Diff Utility ─────────────────────────────────────────────────────────────
function computeDiff(textA, textB) {
    const wordsA = textA.split(/\s+/);
    const wordsB = textB.split(/\s+/);
    const bSet = new Set(wordsB.map((w) => w.toLowerCase()));
    const aSet = new Set(wordsA.map((w) => w.toLowerCase()));

    const highlightedA = wordsA.map((word) => ({
        word,
        match: bSet.has(word.toLowerCase()),
    }));

    const highlightedB = wordsB.map((word) => ({
        word,
        match: aSet.has(word.toLowerCase()),
    }));

    return { highlightedA, highlightedB };
}

// ── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_EXAMS = [
    { id: 'e1', title: 'Data Structures Final', subject: 'CS', attemptCount: 52 },
    { id: 'e2', title: 'Web Development Midterm', subject: 'IT', attemptCount: 38 },
    { id: 'e3', title: 'Database Design Quiz', subject: 'CS', attemptCount: 45 },
];

const MOCK_REPORT = {
    reportId: 'r1',
    examId: 'e1',
    totalPairs: 156,
    flaggedPairs: 3,
    threshold: 0.7,
    status: 'COMPLETED',
    runAt: new Date().toISOString(),
    flags: [
        {
            id: 'f1', questionId: 'q1',
            questionText: 'Explain the differences between a stack and a queue data structure. Provide real-world examples of each.',
            studentA: { id: 's1', name: 'John Smith', email: 'john@test.com' },
            studentB: { id: 's2', name: 'Jane Doe', email: 'jane@test.com' },
            answerA: 'A stack is a linear data structure that follows the Last In First Out principle. Elements are added and removed from the top only. A real world example is a stack of plates. A queue follows the First In First Out principle where elements are added at the rear and removed from the front. A real world example is a line at a ticket counter.',
            answerB: 'A stack is a linear data structure following the Last In First Out principle. Elements are pushed and popped from the top. A real world example would be a stack of plates in a cafeteria. A queue follows the First In First Out principle where elements enter from the rear and exit from the front. A real world example is a queue at a ticket counter.',
            cosineSimilarity: 0.92, jaccardIndex: 0.78, avgSimilarity: 0.85,
            verdict: 'PENDING', adminNotes: null, reviewedAt: null,
        },
        {
            id: 'f2', questionId: 'q2',
            questionText: 'What is the time complexity of a binary search algorithm?',
            studentA: { id: 's3', name: 'Alice Brown', email: 'alice@test.com' },
            studentB: { id: 's4', name: 'Bob Wilson', email: 'bob@test.com' },
            answerA: 'Binary search has a time complexity of O(log n) because it divides the search space in half with each iteration. It requires the array to be sorted. The best case is O(1) when the element is at the middle.',
            answerB: 'The time complexity of binary search is O(log n) since it halves the search space at each step. The array must be sorted beforehand. Best case is O(1) if the target element is found at the middle position.',
            cosineSimilarity: 0.88, jaccardIndex: 0.71, avgSimilarity: 0.795,
            verdict: 'PENDING', adminNotes: null, reviewedAt: null,
        },
        {
            id: 'f3', questionId: 'q1',
            questionText: 'Explain the differences between a stack and a queue data structure. Provide real-world examples of each.',
            studentA: { id: 's1', name: 'John Smith', email: 'john@test.com' },
            studentB: { id: 's5', name: 'Charlie Green', email: 'charlie@test.com' },
            answerA: 'A stack is a linear data structure that follows the Last In First Out principle. Elements are added and removed from the top only. A real world example is a stack of plates. A queue follows the First In First Out principle where elements are added at the rear and removed from the front. A real world example is a line at a ticket counter.',
            answerB: 'Stack and queue are both linear data structures. Stack uses LIFO ordering — the last element added is the first removed, like undo history in text editors. Queue uses FIFO ordering — elements are enqueued at back and dequeued from front, like print job scheduling.',
            cosineSimilarity: 0.74, jaccardIndex: 0.68, avgSimilarity: 0.71,
            verdict: 'CLEARED', adminNotes: 'Different wording and examples, legitimate independent work', reviewedAt: new Date().toISOString(),
        },
    ],
};

export default function PlagiarismDashboard() {
    const [exams, setExams] = useState([]);
    const [selectedExam, setSelectedExam] = useState('');
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(false);
    const [running, setRunning] = useState(false);
    const [threshold, setThreshold] = useState(0.7);
    const [expandedFlag, setExpandedFlag] = useState(null);
    const [verdictFilter, setVerdictFilter] = useState('all');

    const hasToken = () => !!localStorage.getItem('accessToken');

    // Load exams
    useEffect(() => {
        if (!hasToken()) {
            setExams(MOCK_EXAMS);
            return;
        }
        const loadExams = async () => {
            try {
                const { data } = await api.get('/analytics/exams-list');
                setExams(data.data);
            } catch {
                setExams(MOCK_EXAMS);
            }
        };
        loadExams();
    }, []);

    // Load report when exam selected
    const loadReport = useCallback(async () => {
        if (!selectedExam) return;
        setLoading(true);
        if (!hasToken()) {
            setReport(MOCK_REPORT);
            setLoading(false);
            return;
        }
        try {
            const { data } = await api.get(`/plagiarism/report/${selectedExam}`);
            setReport(data.data);
        } catch {
            setReport(MOCK_REPORT);
        } finally {
            setLoading(false);
        }
    }, [selectedExam]);

    useEffect(() => { if (selectedExam) loadReport(); }, [selectedExam, loadReport]);

    // Run plagiarism check
    const handleRunCheck = async () => {
        if (!selectedExam) return;
        setRunning(true);
        if (!hasToken()) {
            // Simulate delay then show mock
            await new Promise(r => setTimeout(r, 1200));
            setReport(MOCK_REPORT);
            setRunning(false);
            return;
        }
        try {
            await api.post(`/plagiarism/run/${selectedExam}`, { threshold });
            await loadReport();
        } catch {
            setReport(MOCK_REPORT);
        } finally {
            setRunning(false);
        }
    };

    // Set verdict
    const handleVerdict = async (flagId, verdict, adminNotes = '') => {
        try {
            await api.put(`/plagiarism/verdict/${flagId}`, { verdict, adminNotes });
        } catch { /* silent */ }
        setReport((prev) => {
            if (!prev) return prev;
            return {
                ...prev,
                flags: prev.flags.map((f) =>
                    f.id === flagId
                        ? { ...f, verdict, adminNotes, reviewedAt: new Date().toISOString() }
                        : f
                ),
            };
        });
    };

    const getSeverityColor = (similarity) => {
        if (similarity >= 0.9) return '#ef4444';
        if (similarity >= 0.8) return '#f59e0b';
        if (similarity >= 0.7) return '#eab308';
        return '#10b981';
    };

    const getSeverityLabel = (similarity) => {
        if (similarity >= 0.9) return 'Critical';
        if (similarity >= 0.8) return 'High';
        if (similarity >= 0.7) return 'Moderate';
        return 'Low';
    };

    const filteredFlags = report?.flags?.filter((f) => {
        if (verdictFilter === 'all') return true;
        return f.verdict === verdictFilter;
    }) || [];

    return (
        <div className="plagiarism-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">
                        <HiOutlineShieldExclamation style={{ verticalAlign: 'middle', color: '#f43f5e' }} />
                        {' '}Plagiarism Detection
                    </h1>
                    <p className="page-subtitle">
                        Detect answer similarity using Cosine Similarity & Jaccard Index algorithms
                    </p>
                </div>
            </div>

            {/* Controls */}
            <div className="plag-controls">
                <div className="plag-controls-left">
                    <div className="form-group" style={{ minWidth: 250 }}>
                        <label className="form-label">Select Exam</label>
                        <select
                            className="form-select"
                            value={selectedExam}
                            onChange={(e) => setSelectedExam(e.target.value)}
                        >
                            <option value="">Choose an exam...</option>
                            {exams.map((e) => (
                                <option key={e.id} value={e.id}>
                                    {e.title} ({e.attemptCount} attempts)
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group" style={{ width: 140 }}>
                        <label className="form-label">Threshold</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <input
                                type="range"
                                min="0.5"
                                max="0.95"
                                step="0.05"
                                value={threshold}
                                onChange={(e) => setThreshold(parseFloat(e.target.value))}
                                style={{ flex: 1, accentColor: 'var(--primary-400)' }}
                            />
                            <span className="plag-threshold-value">{(threshold * 100).toFixed(0)}%</span>
                        </div>
                    </div>
                </div>

                <button
                    className="btn btn-primary"
                    onClick={handleRunCheck}
                    disabled={!selectedExam || running}
                >
                    {running ? (
                        <><div className="spinner spinner-sm" style={{ marginRight: 8 }} /> Analyzing...</>
                    ) : (
                        <><HiOutlineRefresh /> Run Plagiarism Check</>
                    )}
                </button>
            </div>

            {/* Report Summary */}
            {report && (
                <motion.div
                    className="plag-summary"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="plag-summary-cards">
                        <div className="plag-stat-card">
                            <div className="plag-stat-value">{report.totalPairs}</div>
                            <div className="plag-stat-label">Total Pairs Checked</div>
                        </div>
                        <div className="plag-stat-card danger">
                            <div className="plag-stat-value">{report.flaggedPairs}</div>
                            <div className="plag-stat-label">Flagged Pairs</div>
                        </div>
                        <div className="plag-stat-card">
                            <div className="plag-stat-value">{(report.threshold * 100).toFixed(0)}%</div>
                            <div className="plag-stat-label">Threshold</div>
                        </div>
                        <div className="plag-stat-card">
                            <div className="plag-stat-value">{new Date(report.runAt).toLocaleTimeString()}</div>
                            <div className="plag-stat-label">Last Run</div>
                        </div>
                    </div>

                    {/* Verdict Filter */}
                    <div className="plag-filter-bar">
                        <HiOutlineFilter style={{ color: 'var(--text-tertiary)' }} />
                        {['all', 'PENDING', 'CLEARED', 'CONFIRMED_CHEATING'].map((v) => (
                            <button
                                key={v}
                                className={`plag-filter-btn ${verdictFilter === v ? 'active' : ''}`}
                                onClick={() => setVerdictFilter(v)}
                            >
                                {v === 'all' ? 'All' : v === 'PENDING' ? '⏳ Pending' : v === 'CLEARED' ? '✅ Cleared' : '🚩 Cheating'}
                            </button>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Loading */}
            {loading && (
                <div className="flex-center" style={{ minHeight: 200 }}>
                    <div className="spinner spinner-lg" />
                </div>
            )}

            {/* Flagged Pairs */}
            {!loading && report && (
                <div className="plag-flags-list">
                    <AnimatePresence mode="sync">
                        {filteredFlags.length === 0 ? (
                            <div className="plag-empty">
                                <span style={{ fontSize: '3rem' }}>✅</span>
                                <h3>{verdictFilter === 'all' ? 'No similarity flags found' : `No ${verdictFilter.toLowerCase().replace('_', ' ')} flags`}</h3>
                                <p>All answers appear to be original work.</p>
                            </div>
                        ) : (
                            filteredFlags.map((flag, idx) => (
                                <motion.div
                                    key={flag.id}
                                    className={`plag-flag-card ${flag.verdict.toLowerCase().replace('_', '-')}`}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                >
                                    {/* Flag Header */}
                                    <div className="plag-flag-header">
                                        <div className="plag-flag-meta">
                                            <span
                                                className="plag-severity-badge"
                                                style={{
                                                    background: `${getSeverityColor(flag.avgSimilarity)}15`,
                                                    color: getSeverityColor(flag.avgSimilarity),
                                                    border: `1px solid ${getSeverityColor(flag.avgSimilarity)}30`,
                                                }}
                                            >
                                                {getSeverityLabel(flag.avgSimilarity)} — {(flag.avgSimilarity * 100).toFixed(1)}%
                                            </span>
                                            <span className={`plag-verdict-tag ${flag.verdict.toLowerCase().replace('_', '-')}`}>
                                                {flag.verdict === 'PENDING' ? '⏳ Pending Review' : flag.verdict === 'CLEARED' ? '✅ Cleared' : '🚩 Confirmed Cheating'}
                                            </span>
                                        </div>
                                        <button
                                            className="btn btn-ghost btn-sm"
                                            onClick={() => setExpandedFlag(expandedFlag === flag.id ? null : flag.id)}
                                        >
                                            <HiOutlineEye /> {expandedFlag === flag.id ? 'Hide' : 'View'} Details
                                        </button>
                                    </div>

                                    {/* Students */}
                                    <div className="plag-students-row">
                                        <div className="plag-student">
                                            <span className="plag-student-avatar">{flag.studentA.name[0]}</span>
                                            <span className="plag-student-name">{flag.studentA.name}</span>
                                        </div>
                                        <div className="plag-vs">VS</div>
                                        <div className="plag-student">
                                            <span className="plag-student-avatar" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                                                {flag.studentB.name[0]}
                                            </span>
                                            <span className="plag-student-name">{flag.studentB.name}</span>
                                        </div>
                                    </div>

                                    {/* Question */}
                                    <div className="plag-question-text">
                                        <strong>Q:</strong> {flag.questionText}
                                    </div>

                                    {/* Similarity Bars */}
                                    <div className="plag-scores">
                                        <div className="plag-score-row">
                                            <span className="plag-score-label">Cosine Similarity</span>
                                            <div className="plag-score-bar">
                                                <div
                                                    className="plag-score-fill"
                                                    style={{
                                                        width: `${flag.cosineSimilarity * 100}%`,
                                                        background: getSeverityColor(flag.cosineSimilarity),
                                                    }}
                                                />
                                            </div>
                                            <span className="plag-score-value">{(flag.cosineSimilarity * 100).toFixed(1)}%</span>
                                        </div>
                                        <div className="plag-score-row">
                                            <span className="plag-score-label">Jaccard Index</span>
                                            <div className="plag-score-bar">
                                                <div
                                                    className="plag-score-fill"
                                                    style={{
                                                        width: `${flag.jaccardIndex * 100}%`,
                                                        background: getSeverityColor(flag.jaccardIndex),
                                                    }}
                                                />
                                            </div>
                                            <span className="plag-score-value">{(flag.jaccardIndex * 100).toFixed(1)}%</span>
                                        </div>
                                    </div>

                                    {/* Expanded: Side-by-Side Diff */}
                                    <AnimatePresence>
                                        {expandedFlag === flag.id && (
                                            <motion.div
                                                className="plag-diff-container"
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <div className="plag-diff-panels">
                                                    <div className="plag-diff-panel">
                                                        <div className="plag-diff-panel-header">
                                                            <span>{flag.studentA.name}</span>
                                                        </div>
                                                        <div className="plag-diff-text">
                                                            {computeDiff(flag.answerA, flag.answerB).highlightedA.map((w, i) => (
                                                                <span
                                                                    key={i}
                                                                    className={w.match ? 'plag-match' : ''}
                                                                >
                                                                    {w.word}{' '}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div className="plag-diff-panel">
                                                        <div className="plag-diff-panel-header">
                                                            <span>{flag.studentB.name}</span>
                                                        </div>
                                                        <div className="plag-diff-text">
                                                            {computeDiff(flag.answerA, flag.answerB).highlightedB.map((w, i) => (
                                                                <span
                                                                    key={i}
                                                                    className={w.match ? 'plag-match' : ''}
                                                                >
                                                                    {w.word}{' '}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Admin Verdict Actions */}
                                                {flag.verdict === 'PENDING' && (
                                                    <div className="plag-verdict-actions">
                                                        <button
                                                            className="btn btn-sm"
                                                            style={{ background: '#10b981', color: 'white', border: 'none' }}
                                                            onClick={() => handleVerdict(flag.id, 'CLEARED', 'Reviewed and cleared — answers are independently written')}
                                                        >
                                                            <HiOutlineCheck /> Clear — Not Cheating
                                                        </button>
                                                        <button
                                                            className="btn btn-sm"
                                                            style={{ background: '#ef4444', color: 'white', border: 'none' }}
                                                            onClick={() => handleVerdict(flag.id, 'CONFIRMED_CHEATING', 'Confirmed plagiarism — answers are too similar')}
                                                        >
                                                            <HiOutlineX /> Confirm Cheating
                                                        </button>
                                                    </div>
                                                )}

                                                {flag.verdict !== 'PENDING' && flag.adminNotes && (
                                                    <div className="plag-admin-note">
                                                        <strong>Admin Note:</strong> {flag.adminNotes}
                                                    </div>
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>
            )}

            {/* No exam selected */}
            {!selectedExam && !loading && (
                <div className="plag-empty">
                    <span style={{ fontSize: '3rem' }}>🔍</span>
                    <h3>Select an Exam</h3>
                    <p>Choose an exam above to view or run a plagiarism analysis.</p>
                </div>
            )}
        </div>
    );
}
