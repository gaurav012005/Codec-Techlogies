// ============================================
// My Results History Page — Feature 7
// Shows all past exam attempts in dashboard
// ============================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiCheckCircle, HiXCircle, HiClock, HiEye, HiChartBar, HiDocumentText } from 'react-icons/hi';

const MOCK_RESULTS = [
    {
        id: 'attempt-1',
        status: 'SUBMITTED',
        result: 'PASS',
        totalScore: 32,
        percentage: 86.48,
        startedAt: '2026-02-27T11:00:00Z',
        submittedAt: '2026-02-27T11:47:00Z',
        exam: { id: 'exam-1', title: 'Mathematics Mid-Term 2026', subjectCategory: 'Mathematics', totalMarks: 37, durationMinutes: 60 },
    },
    {
        id: 'attempt-2',
        status: 'SUBMITTED',
        result: 'FAIL',
        totalScore: 12,
        percentage: 34.2,
        startedAt: '2026-02-25T09:00:00Z',
        submittedAt: '2026-02-25T09:28:00Z',
        exam: { id: 'exam-3', title: 'Physics Quiz — Optics', subjectCategory: 'Physics', totalMarks: 35, durationMinutes: 30 },
    },
    {
        id: 'attempt-3',
        status: 'SUBMITTED',
        result: 'PASS',
        totalScore: 78,
        percentage: 91.0,
        startedAt: '2026-02-20T14:00:00Z',
        submittedAt: '2026-02-20T15:10:00Z',
        exam: { id: 'exam-4', title: 'Computer Networks Final', subjectCategory: 'Computer Science', totalMarks: 86, durationMinutes: 90 },
    },
];

function formatDate(iso) {
    return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function MyResultsPage() {
    const navigate = useNavigate();
    const [filter, setFilter] = useState('all');

    const filtered = filter === 'all'
        ? MOCK_RESULTS
        : MOCK_RESULTS.filter((r) => r.result === filter.toUpperCase());

    const passCount = MOCK_RESULTS.filter((r) => r.result === 'PASS').length;
    const avgPct = MOCK_RESULTS.length
        ? (MOCK_RESULTS.reduce((s, r) => s + r.percentage, 0) / MOCK_RESULTS.length).toFixed(1)
        : 0;

    return (
        <div style={{ padding: '24px 0' }}>
            <div className="page-header" style={{ marginBottom: '28px' }}>
                <h1 className="page-title">My Results</h1>
                <p className="page-subtitle">View all your past exam scores and detailed breakdowns</p>
            </div>

            {/* Summary stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 28 }}>
                {[
                    { label: 'Total Attempts', value: MOCK_RESULTS.length, color: '#818cf8', icon: <HiDocumentText /> },
                    { label: 'Passed', value: passCount, color: '#10b981', icon: <HiCheckCircle /> },
                    { label: 'Failed', value: MOCK_RESULTS.length - passCount, color: '#f43f5e', icon: <HiXCircle /> },
                    { label: 'Avg Score', value: `${avgPct}%`, color: '#38bdf8', icon: <HiChartBar /> },
                ].map((s) => (
                    <div key={s.label} className="card" style={{ padding: 20, textAlign: 'center' }}>
                        <div style={{ fontSize: '1.5rem', color: s.color, marginBottom: 8 }}>{s.icon}</div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 800, color: s.color }}>{s.value}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Filter */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                {['all', 'pass', 'fail'].map((f) => (
                    <button key={f} onClick={() => setFilter(f)}
                        className={`btn ${filter === f ? 'btn-primary' : 'btn-ghost'}`}
                        style={{ textTransform: 'capitalize' }}>
                        {f === 'all' ? 'All' : f === 'pass' ? '✅ Passed' : '❌ Failed'}
                    </button>
                ))}
            </div>

            {/* Results list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {filtered.map((r) => {
                    const isPassed = r.result === 'PASS';
                    const duration = r.submittedAt
                        ? Math.round((new Date(r.submittedAt) - new Date(r.startedAt)) / 60000)
                        : '—';
                    return (
                        <div key={r.id} className="card" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
                            {/* Score ring mini */}
                            <div style={{
                                width: 64, height: 64, borderRadius: '50%', flexShrink: 0,
                                background: `conic-gradient(${isPassed ? '#10b981' : '#f43f5e'} ${r.percentage}%, rgba(255,255,255,0.05) 0)`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                position: 'relative',
                            }}>
                                <div style={{
                                    position: 'absolute', inset: 8, borderRadius: '50%',
                                    background: 'var(--bg-elevated)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '0.7rem', fontWeight: 800,
                                    color: isPassed ? '#10b981' : '#f43f5e',
                                }}>
                                    {r.percentage.toFixed(0)}%
                                </div>
                            </div>

                            {/* Info */}
                            <div style={{ flex: 1, minWidth: 160 }}>
                                <div style={{ fontWeight: 700, marginBottom: 4 }}>{r.exam.title}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                                    <span>📚 {r.exam.subjectCategory}</span>
                                    <span>📅 {formatDate(r.submittedAt)}</span>
                                    <span><HiClock style={{ verticalAlign: 'middle' }} /> {duration} min</span>
                                </div>
                            </div>

                            {/* Score */}
                            <div style={{ textAlign: 'center', minWidth: 80 }}>
                                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: isPassed ? '#10b981' : '#f43f5e' }}>
                                    {r.totalScore}/{r.exam.totalMarks}
                                </div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Score</div>
                            </div>

                            {/* Result badge */}
                            <div style={{
                                padding: '4px 16px', borderRadius: '999px', fontWeight: 800, fontSize: '0.8rem',
                                background: isPassed ? 'rgba(16,185,129,0.15)' : 'rgba(244,63,94,0.15)',
                                color: isPassed ? '#10b981' : '#f43f5e',
                                minWidth: 60, textAlign: 'center',
                            }}>
                                {r.result}
                            </div>

                            {/* View button */}
                            <button
                                className="btn btn-secondary"
                                onClick={() => navigate(`/exam/${r.id}/result`)}
                                style={{ flexShrink: 0 }}
                            >
                                <HiEye /> View
                            </button>
                        </div>
                    );
                })}
            </div>

            {filtered.length === 0 && (
                <div className="card" style={{ padding: 60, textAlign: 'center' }}>
                    <p className="text-muted">No results found.</p>
                </div>
            )}
        </div>
    );
}
