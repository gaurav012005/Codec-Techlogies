// ============================================
// Proctoring Dashboard — Feature 9
// Admin/Examiner view of flagged students
// ============================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    HiShieldCheck, HiShieldExclamation, HiEye, HiClock,
    HiUser, HiExclamation, HiCheckCircle, HiChartBar,
} from 'react-icons/hi';

// ── Mock data ─────────────────────────────────────────────────────────────────
const MOCK_SESSIONS = [
    {
        attemptId: 'attempt-1',
        student: { name: 'Amit Verma', email: 'student@examplatform.com' },
        exam: { title: 'Mathematics Mid-Term 2026', id: 'exam-1' },
        submittedAt: '2026-02-27T11:47:00Z',
        totalScore: 32,
        percentage: 86.5,
        result: 'PASS',
        totalEvents: 7,
        riskScore: { totalRiskScore: 68, riskLevel: 'HIGH', tabSwitchScore: 30, faceMissingScore: 20, multiFaceScore: 0 },
        byType: { TAB_SWITCH: 2, FULLSCREEN_EXIT: 3, COPY_PASTE_ATTEMPT: 2 },
        flagged: true,
    },
    {
        attemptId: 'attempt-4',
        student: { name: 'Priya Sharma', email: 'priya@test.com' },
        exam: { title: 'Mathematics Mid-Term 2026', id: 'exam-1' },
        submittedAt: '2026-02-27T12:10:00Z',
        totalScore: 28,
        percentage: 75.6,
        result: 'PASS',
        totalEvents: 3,
        riskScore: { totalRiskScore: 25, riskLevel: 'LOW', tabSwitchScore: 15, faceMissingScore: 0, multiFaceScore: 0 },
        byType: { TAB_SWITCH: 1, FULLSCREEN_EXIT: 2 },
        flagged: false,
    },
    {
        attemptId: 'attempt-5',
        student: { name: 'Rajan Patel', email: 'rajan@test.com' },
        exam: { title: 'Physics Quiz — Optics', id: 'exam-3' },
        submittedAt: '2026-02-25T09:28:00Z',
        totalScore: 12,
        percentage: 34.2,
        result: 'FAIL',
        totalEvents: 14,
        riskScore: { totalRiskScore: 92, riskLevel: 'HIGH', tabSwitchScore: 45, faceMissingScore: 40, multiFaceScore: 25 },
        byType: { TAB_SWITCH: 4, FULLSCREEN_EXIT: 5, FACE_NOT_DETECTED: 3, MULTIPLE_FACES: 2 },
        flagged: true,
    },
    {
        attemptId: 'attempt-6',
        student: { name: 'Kavita Mehta', email: 'kavita@test.com' },
        exam: { title: 'Computer Networks Final', id: 'exam-4' },
        submittedAt: '2026-02-20T15:10:00Z',
        totalScore: 78,
        percentage: 91.0,
        result: 'PASS',
        totalEvents: 0,
        riskScore: { totalRiskScore: 0, riskLevel: 'LOW', tabSwitchScore: 0, faceMissingScore: 0, multiFaceScore: 0 },
        byType: {},
        flagged: false,
    },
];

const EVENT_LABELS = {
    TAB_SWITCH: { label: 'Tab Switch', color: '#f59e0b', icon: '🔀' },
    FULLSCREEN_EXIT: { label: 'Fullscreen Exit', color: '#f97316', icon: '🖥️' },
    COPY_PASTE_ATTEMPT: { label: 'Copy/Paste', color: '#818cf8', icon: '📋' },
    SCREENSHOT_ATTEMPT: { label: 'Screenshot', color: '#6b7280', icon: '📸' },
    FACE_NOT_DETECTED: { label: 'Face Missing', color: '#f43f5e', icon: '😶' },
    MULTIPLE_FACES: { label: 'Multiple Faces', color: '#ec4899', icon: '👥' },
};

function RiskBadge({ level, score }) {
    const config = {
        LOW: { color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)' },
        MEDIUM: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)' },
        HIGH: { color: '#f43f5e', bg: 'rgba(244,63,94,0.1)', border: 'rgba(244,63,94,0.3)' },
    }[level] || { color: '#6b7280', bg: 'transparent', border: 'transparent' };

    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '3px 10px', borderRadius: 999, fontWeight: 800, fontSize: '0.75rem',
            color: config.color, background: config.bg, border: `1px solid ${config.border}`,
        }}>
            {level === 'HIGH' ? '🔴' : level === 'MEDIUM' ? '🟡' : '🟢'} {level} ({score})
        </span>
    );
}

function SessionDetailModal({ session, onClose }) {
    if (!session) return null;
    const { riskScore, byType, student, exam } = session;

    return (
        <div
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, backdropFilter: 'blur(8px)' }}
            onClick={onClose}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-xl)', padding: 32, maxWidth: 600, width: '100%', maxHeight: '85vh', overflowY: 'auto' }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <h2 style={{ fontWeight: 800, fontSize: '1.2rem' }}>Proctor Report</h2>
                    <button className="btn btn-ghost btn-sm" onClick={onClose}>✕ Close</button>
                </div>

                <div style={{ marginBottom: 20 }}>
                    <div style={{ fontWeight: 700, marginBottom: 4 }}>{student.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{student.email}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>📚 {exam.title}</div>
                </div>

                {/* Risk Score Bar */}
                <div style={{ marginBottom: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>Risk Score</span>
                        <RiskBadge level={riskScore.riskLevel} score={riskScore.totalRiskScore} />
                    </div>
                    <div style={{ height: 12, background: 'var(--bg-secondary)', borderRadius: 999, overflow: 'hidden' }}>
                        <div style={{
                            height: '100%', borderRadius: 999,
                            width: `${riskScore.totalRiskScore}%`,
                            background: riskScore.totalRiskScore >= 60
                                ? 'linear-gradient(90deg, #f43f5e, #e11d48)'
                                : riskScore.totalRiskScore >= 30
                                    ? 'linear-gradient(90deg, #f59e0b, #d97706)'
                                    : 'linear-gradient(90deg, #10b981, #059669)',
                            transition: 'width 0.8s ease',
                        }} />
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                        Flag threshold: 60 / 100
                    </div>
                </div>

                {/* Score breakdown */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 24 }}>
                    {[
                        { label: 'Tab Switches', value: riskScore.tabSwitchScore, max: 50 },
                        { label: 'Face Missing', value: riskScore.faceMissingScore, max: 60 },
                        { label: 'Multi-Face', value: riskScore.multiFaceScore, max: 50 },
                    ].map((s) => (
                        <div key={s.label} style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: 12, textAlign: 'center' }}>
                            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: s.value > 0 ? '#f43f5e' : '#10b981' }}>{s.value}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</div>
                            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Max: {s.max}</div>
                        </div>
                    ))}
                </div>

                {/* Event log */}
                <div>
                    <div style={{ fontWeight: 700, marginBottom: 12, fontSize: '0.875rem' }}>Event Log</div>
                    {Object.keys(byType).length === 0 ? (
                        <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                            ✅ No violations recorded
                        </div>
                    ) : (
                        Object.entries(byType).map(([type, count]) => {
                            const meta = EVENT_LABELS[type] || { label: type, color: '#6b7280', icon: '⚠️' };
                            return (
                                <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', marginBottom: 8, background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', borderLeft: `4px solid ${meta.color}` }}>
                                    <span style={{ fontSize: '1.2rem' }}>{meta.icon}</span>
                                    <span style={{ flex: 1, fontSize: '0.875rem', fontWeight: 600 }}>{meta.label}</span>
                                    <span style={{ fontSize: '0.9rem', fontWeight: 800, color: meta.color }}>{count}×</span>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}

export default function ProctoringDashboard() {
    const [filter, setFilter] = useState('all');
    const [selectedSession, setSelectedSession] = useState(null);

    const filtered = filter === 'all'
        ? MOCK_SESSIONS
        : filter === 'flagged'
            ? MOCK_SESSIONS.filter((s) => s.flagged)
            : MOCK_SESSIONS.filter((s) => s.riskScore.riskLevel === filter.toUpperCase());

    const flaggedCount = MOCK_SESSIONS.filter((s) => s.flagged).length;
    const highRisk = MOCK_SESSIONS.filter((s) => s.riskScore.riskLevel === 'HIGH').length;
    const avgRisk = (MOCK_SESSIONS.reduce((s, m) => s + m.riskScore.totalRiskScore, 0) / MOCK_SESSIONS.length).toFixed(0);

    return (
        <div style={{ padding: '24px 0' }}>
            <div className="page-header" style={{ marginBottom: '28px' }}>
                <h1 className="page-title">Proctoring Dashboard</h1>
                <p className="page-subtitle">Monitor exam sessions and review proctoring violations in real-time</p>
            </div>

            {/* Summary stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 28 }}>
                {[
                    { label: 'Total Sessions', value: MOCK_SESSIONS.length, color: '#818cf8', icon: <HiUser /> },
                    { label: '🔴 Flagged', value: flaggedCount, color: '#f43f5e', icon: <HiShieldExclamation /> },
                    { label: '⚡ High Risk', value: highRisk, color: '#f97316', icon: <HiExclamation /> },
                    { label: 'Avg Risk Score', value: `${avgRisk}/100`, color: '#f59e0b', icon: <HiChartBar /> },
                ].map((s) => (
                    <div key={s.label} className="card" style={{ padding: 20, textAlign: 'center' }}>
                        <div style={{ fontSize: '1.5rem', color: s.color, marginBottom: 8 }}>{s.icon}</div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 800, color: s.color }}>{s.value}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
                {[
                    { id: 'all', label: 'All Sessions' },
                    { id: 'flagged', label: '🚩 Flagged' },
                    { id: 'high', label: '🔴 High Risk' },
                    { id: 'medium', label: '🟡 Medium' },
                    { id: 'low', label: '🟢 Low Risk' },
                ].map((f) => (
                    <button key={f.id} className={`btn ${filter === f.id ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => setFilter(f.id)}>
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Sessions table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--glass-border)', background: 'var(--bg-secondary)' }}>
                                {['Student', 'Exam', 'Score', 'Events', 'Risk Score', 'Status', 'Action'].map((h) => (
                                    <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((s) => (
                                <tr key={s.attemptId} style={{ borderBottom: '1px solid var(--glass-border)', transition: 'background 0.15s' }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    <td style={{ padding: '14px 16px' }}>
                                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{s.student.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.student.email}</div>
                                    </td>
                                    <td style={{ padding: '14px 16px' }}>
                                        <div style={{ fontSize: '0.875rem', maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.exam.title}</div>
                                    </td>
                                    <td style={{ padding: '14px 16px' }}>
                                        <div style={{ fontWeight: 700, color: s.result === 'PASS' ? '#10b981' : '#f43f5e' }}>
                                            {s.percentage.toFixed(1)}%
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.result}</div>
                                    </td>
                                    <td style={{ padding: '14px 16px' }}>
                                        <span style={{
                                            fontWeight: 700,
                                            color: s.totalEvents > 5 ? '#f43f5e' : s.totalEvents > 0 ? '#f59e0b' : '#10b981',
                                        }}>
                                            {s.totalEvents}
                                        </span>
                                    </td>
                                    <td style={{ padding: '14px 16px' }}>
                                        <RiskBadge level={s.riskScore.riskLevel} score={s.riskScore.totalRiskScore} />
                                    </td>
                                    <td style={{ padding: '14px 16px' }}>
                                        {s.flagged ? (
                                            <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#f43f5e', fontWeight: 700, fontSize: '0.8rem' }}>
                                                <HiShieldExclamation /> Flagged
                                            </span>
                                        ) : (
                                            <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#10b981', fontWeight: 700, fontSize: '0.8rem' }}>
                                                <HiCheckCircle /> Clean
                                            </span>
                                        )}
                                    </td>
                                    <td style={{ padding: '14px 16px' }}>
                                        <button className="btn btn-ghost btn-sm" onClick={() => setSelectedSession(s)}>
                                            <HiEye /> Review
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filtered.length === 0 && (
                    <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>No sessions found.</div>
                )}
            </div>

            {/* Detail modal */}
            <SessionDetailModal session={selectedSession} onClose={() => setSelectedSession(null)} />
        </div>
    );
}
