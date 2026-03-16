// ============================================
// Exam Builder — Feature 5 Frontend
// Multi-step: Details → Constraints → Questions → Assign
// ============================================

import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import './ExamBuilder.css';

// ─── Status badge ───────────────────────────────────────────────────────────
function ExamStatusBadge({ status }) {
    const cls = {
        DRAFT: 'eb-status-draft',
        PUBLISHED: 'eb-status-published',
        ACTIVE: 'eb-status-active',
        CLOSED: 'eb-status-closed',
        RESULTS_PUBLISHED: 'eb-status-closed',
        ARCHIVED: 'eb-status-archived',
    }[status] || '';
    return <span className={`eb-status ${cls}`}>{status}</span>;
}

// ─── Toggle Row ─────────────────────────────────────────────────────────────
function ToggleRow({ label, desc, name, checked, onChange }) {
    return (
        <div className="toggle-row">
            <div className="toggle-info">
                <label htmlFor={name}>{label}</label>
                {desc && <small>{desc}</small>}
            </div>
            <label className="toggle-switch">
                <input
                    type="checkbox"
                    id={name}
                    name={name}
                    checked={checked}
                    onChange={onChange}
                />
                <span className="toggle-track" />
            </label>
        </div>
    );
}

// ─── Exam Form (Create / Edit) ───────────────────────────────────────────────
const defaultExamForm = () => ({
    title: '',
    description: '',
    subjectCategory: '',
    durationMinutes: 60,
    passingPercentage: 40,
    negativeMarking: false,
    negativeMarkValue: 0.25,
    startDatetime: '',
    endDatetime: '',
    maxAttempts: 1,
    examPassword: '',
    shuffleQuestions: false,
    shuffleOptions: false,
    showResultImmediately: true,
    allowReview: false,
    adaptiveMode: false,
    proctoringEnabled: false,
    fullscreenRequired: false,
});

function ExamFormModal({ initial, onClose, onSaved }) {
    const [step, setStep] = useState(0);  // 0 = Details, 1 = Constraints, 2 = Questions
    const [form, setForm] = useState(initial ? { ...defaultExamForm(), ...initial } : defaultExamForm());
    const [examId, setExamId] = useState(initial?.id || null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Available questions for step 2
    const [availQs, setAvailQs] = useState([]);
    const [selectedQs, setSelectedQs] = useState([]);
    const [qLoading, setQLoading] = useState(false);

    const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));
    const toggle = (field) => setForm(prev => ({ ...prev, [field]: !prev[field] }));

    // Load published questions when reaching step 2
    useEffect(() => {
        if (step === 2) {
            setQLoading(true);
            api.get('/questions', { params: { status: 'PUBLISHED', limit: 100 } })
                .then(({ data }) => setAvailQs(data.data || []))
                .catch(() => { })
                .finally(() => setQLoading(false));

            // Pre-select if editing
            if (initial?.examQuestions) {
                setSelectedQs(initial.examQuestions.map(eq => eq.questionId));
            }
        }
    }, [step, initial]);

    const handleSaveDetails = async () => {
        setError('');
        setLoading(true);
        try {
            if (!form.title || !form.subjectCategory || !form.durationMinutes || !form.startDatetime || !form.endDatetime) {
                throw new Error('Please fill all required fields.');
            }
            const payload = {
                ...form,
                durationMinutes: parseInt(form.durationMinutes),
                passingPercentage: parseFloat(form.passingPercentage),
                negativeMarkValue: parseFloat(form.negativeMarkValue),
                maxAttempts: parseInt(form.maxAttempts),
            };
            if (examId) {
                await api.put(`/exams/${examId}`, payload);
            } else {
                const { data } = await api.post('/exams', payload);
                setExamId(data.data.id);
            }
            setStep(prev => prev + 1);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to save.');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveConstraints = async () => {
        setError('');
        setLoading(true);
        try {
            const payload = {
                negativeMarking: form.negativeMarking,
                negativeMarkValue: parseFloat(form.negativeMarkValue),
                shuffleQuestions: form.shuffleQuestions,
                shuffleOptions: form.shuffleOptions,
                showResultImmediately: form.showResultImmediately,
                allowReview: form.allowReview,
                adaptiveMode: form.adaptiveMode,
                proctoringEnabled: form.proctoringEnabled,
                fullscreenRequired: form.fullscreenRequired,
                examPassword: form.examPassword,
            };
            await api.put(`/exams/${examId}`, payload);
            setStep(prev => prev + 1);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save constraints.');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveQuestions = async () => {
        if (selectedQs.length === 0) {
            setError('Please select at least one published question.');
            return;
        }
        setError('');
        setLoading(true);
        try {
            await api.put(`/exams/${examId}/questions`, { questionIds: selectedQs });
            onSaved();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to assign questions.');
        } finally {
            setLoading(false);
        }
    };

    const toggleQuestion = (id) => {
        setSelectedQs(prev =>
            prev.includes(id) ? prev.filter(q => q !== id) : [...prev, id]
        );
    };

    const steps = ['📋 Details', '⚙️ Constraints', '📝 Questions'];

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-box" style={{ maxWidth: 780 }} onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{initial?.id ? 'Edit Exam' : 'Create New Exam'}</h2>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>

                <div className="modal-body">
                    {/* Step indicator */}
                    <div className="wizard-steps">
                        {steps.map((s, i) => (
                            <div
                                key={i}
                                className={`wizard-step ${i === step ? 'active' : ''} ${i < step ? 'completed' : ''}`}
                                onClick={() => i < step && setStep(i)}
                            >
                                <span className="wizard-step-num">{i < step ? '✓' : i + 1}</span>
                                {s}
                            </div>
                        ))}
                    </div>

                    {error && (
                        <div className="badge badge-danger" style={{ marginBottom: 16, padding: '8px 14px', display: 'block', borderRadius: 8 }}>
                            ⚠️ {error}
                        </div>
                    )}

                    {/* ─── STEP 0: Details ─── */}
                    {step === 0 && (
                        <>
                            <div className="eb-form-section">
                                <p className="eb-form-title">Basic Information</p>
                                <div className="eb-form-grid">
                                    <div className="input-group eb-form-grid-full">
                                        <label>Exam Title *</label>
                                        <input className="input-field" placeholder="e.g. Mid-Term Mathematics Exam"
                                            value={form.title}
                                            onChange={e => set('title', e.target.value)} />
                                    </div>
                                    <div className="input-group eb-form-grid-full">
                                        <label>Description</label>
                                        <textarea className="input-field" rows={2} placeholder="Brief exam description…"
                                            value={form.description}
                                            onChange={e => set('description', e.target.value)}
                                            style={{ resize: 'vertical' }} />
                                    </div>
                                    <div className="input-group">
                                        <label>Subject / Category *</label>
                                        <input className="input-field" placeholder="e.g. Mathematics"
                                            value={form.subjectCategory}
                                            onChange={e => set('subjectCategory', e.target.value)} />
                                    </div>
                                    <div className="input-group">
                                        <label>Duration (minutes) *</label>
                                        <input className="input-field" type="number" min="1"
                                            value={form.durationMinutes}
                                            onChange={e => set('durationMinutes', e.target.value)} />
                                    </div>
                                    <div className="input-group">
                                        <label>Start Date & Time *</label>
                                        <input className="input-field" type="datetime-local"
                                            value={form.startDatetime}
                                            onChange={e => set('startDatetime', e.target.value)} />
                                    </div>
                                    <div className="input-group">
                                        <label>End Date & Time *</label>
                                        <input className="input-field" type="datetime-local"
                                            value={form.endDatetime}
                                            onChange={e => set('endDatetime', e.target.value)} />
                                    </div>
                                    <div className="input-group">
                                        <label>Passing Percentage (%)</label>
                                        <input className="input-field" type="number" min="0" max="100"
                                            value={form.passingPercentage}
                                            onChange={e => set('passingPercentage', e.target.value)} />
                                    </div>
                                    <div className="input-group">
                                        <label>Max Attempts</label>
                                        <input className="input-field" type="number" min="1"
                                            value={form.maxAttempts}
                                            onChange={e => set('maxAttempts', e.target.value)} />
                                    </div>
                                    <div className="input-group">
                                        <label>Exam Password (Optional)</label>
                                        <input className="input-field" type="text" placeholder="Leave empty for no password"
                                            value={form.examPassword}
                                            onChange={e => set('examPassword', e.target.value)} />
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* ─── STEP 1: Constraints ─── */}
                    {step === 1 && (
                        <div className="eb-form-section">
                            <p className="eb-form-title">Exam Behaviour & Proctoring</p>

                            <ToggleRow
                                label="Negative Marking"
                                desc="Deduct marks for wrong answers"
                                name="negativeMarking"
                                checked={form.negativeMarking}
                                onChange={() => toggle('negativeMarking')}
                            />
                            {form.negativeMarking && (
                                <div className="input-group" style={{ padding: '12px 0' }}>
                                    <label>Marks deducted per wrong answer</label>
                                    <input className="input-field" type="number" min="0" step="0.25"
                                        style={{ maxWidth: 180 }}
                                        value={form.negativeMarkValue}
                                        onChange={e => set('negativeMarkValue', e.target.value)} />
                                </div>
                            )}
                            <ToggleRow
                                label="Shuffle Questions"
                                desc="Randomize question order for each student"
                                name="shuffleQuestions"
                                checked={form.shuffleQuestions}
                                onChange={() => toggle('shuffleQuestions')}
                            />
                            <ToggleRow
                                label="Shuffle Options"
                                desc="Randomize MCQ option order"
                                name="shuffleOptions"
                                checked={form.shuffleOptions}
                                onChange={() => toggle('shuffleOptions')}
                            />
                            <ToggleRow
                                label="Show Result Immediately"
                                desc="Student sees score right after submission"
                                name="showResultImmediately"
                                checked={form.showResultImmediately}
                                onChange={() => toggle('showResultImmediately')}
                            />
                            <ToggleRow
                                label="Allow Review After Submit"
                                desc="Students can review answers post submission"
                                name="allowReview"
                                checked={form.allowReview}
                                onChange={() => toggle('allowReview')}
                            />
                            <ToggleRow
                                label="Adaptive Difficulty Mode"
                                desc="Questions adjust difficulty based on student performance"
                                name="adaptiveMode"
                                checked={form.adaptiveMode}
                                onChange={() => toggle('adaptiveMode')}
                            />
                            <ToggleRow
                                label="Enable AI Proctoring"
                                desc="Webcam monitoring with face detection (Feature 8–10)"
                                name="proctoringEnabled"
                                checked={form.proctoringEnabled}
                                onChange={() => toggle('proctoringEnabled')}
                            />
                            <ToggleRow
                                label="Require Fullscreen"
                                desc="Force fullscreen mode during exam"
                                name="fullscreenRequired"
                                checked={form.fullscreenRequired}
                                onChange={() => toggle('fullscreenRequired')}
                            />
                        </div>
                    )}

                    {/* ─── STEP 2: Question Picker ─── */}
                    {step === 2 && (
                        <div className="eb-form-section">
                            <p className="eb-form-title">
                                Select Questions ({selectedQs.length} selected
                                {availQs.length > 0 && ` · ${selectedQs.reduce((sum, id) => {
                                    const q = availQs.find(q => q.id === id);
                                    return sum + (q?.marks || 0);
                                }, 0)} total marks`})
                            </p>

                            {qLoading ? (
                                <div className="eb-loading"><div className="spinner" /> Loading questions…</div>
                            ) : availQs.length === 0 ? (
                                <div className="eb-empty">
                                    <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📭</div>
                                    <p>No published questions found. Publish questions in Question Bank first.</p>
                                </div>
                            ) : (
                                <div className="qpicker-list">
                                    {availQs.map(q => {
                                        const isSelected = selectedQs.includes(q.id);
                                        return (
                                            <div
                                                key={q.id}
                                                className={`qpicker-item ${isSelected ? 'selected' : ''}`}
                                                onClick={() => toggleQuestion(q.id)}
                                            >
                                                <div className="qpicker-check">
                                                    {isSelected ? '✓' : ''}
                                                </div>
                                                <div className="qpicker-item-text" title={q.questionText}>
                                                    {q.questionText?.substring(0, 70)}
                                                    {q.questionText?.length > 70 ? '…' : ''}
                                                </div>
                                                <div className="qpicker-item-meta">
                                                    <span className={`diff-badge ${q.difficultyLevel === 'EASY' ? 'diff-easy' : q.difficultyLevel === 'HARD' ? 'diff-hard' : 'diff-medium'}`}
                                                        style={{ fontSize: '0.65rem' }}>
                                                        {q.difficultyLevel}
                                                    </span>
                                                    <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>
                                                        {q.marks}m
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="modal-footer">
                    <button className="btn btn-ghost" onClick={onClose}>Cancel</button>

                    {step > 0 && (
                        <button className="btn btn-secondary" onClick={() => setStep(s => s - 1)}>
                            ← Back
                        </button>
                    )}

                    {step === 0 && (
                        <button className="btn btn-primary" onClick={handleSaveDetails} disabled={loading}>
                            {loading ? <><span className="spinner" style={{ width: 14, height: 14 }} /> Saving…</> : 'Save & Continue →'}
                        </button>
                    )}
                    {step === 1 && (
                        <button className="btn btn-primary" onClick={handleSaveConstraints} disabled={loading}>
                            {loading ? <><span className="spinner" style={{ width: 14, height: 14 }} /> Saving…</> : 'Save & Pick Questions →'}
                        </button>
                    )}
                    {step === 2 && (
                        <button className="btn btn-primary" onClick={handleSaveQuestions} disabled={loading || selectedQs.length === 0}>
                            {loading ? <><span className="spinner" style={{ width: 14, height: 14 }} /> Saving…</> : `Assign ${selectedQs.length} Question(s) ✓`}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Publish Confirm Modal ────────────────────────────────────────────────────
function PublishModal({ exam, onClose, onPublished }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handlePublish = async () => {
        setLoading(true);
        try {
            await api.post(`/exams/${exam.id}/publish`);
            onPublished();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to publish.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-box" style={{ maxWidth: 440 }} onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Publish Exam</h2>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>
                <div className="modal-body">
                    {error && <div className="badge badge-danger" style={{ marginBottom: 12, display: 'block', padding: '8px 14px', borderRadius: 8 }}>⚠️ {error}</div>}
                    <p className="text-muted" style={{ marginBottom: 8 }}>
                        You are about to publish:
                    </p>
                    <p style={{ fontWeight: 700, fontSize: '1rem' }}>"{exam.title}"</p>
                    <p className="text-muted text-sm" style={{ marginTop: 8 }}>
                        Once published, students will be able to see the exam (after assignment). You can still edit settings but not after it goes ACTIVE.
                    </p>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
                    <button className="btn btn-primary" onClick={handlePublish} disabled={loading}>
                        {loading ? 'Publishing…' : '🚀 Publish Exam'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Main Page ──────────────────────────────────────────────────────────────
const ExamBuilder = () => {
    const [exams, setExams] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ search: '', status: '' });
    const [page, setPage] = useState(1);
    const [showCreate, setShowCreate] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [publishTarget, setPublishTarget] = useState(null);

    const fetchExams = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/exams', {
                params: { page, limit: 12, ...filters },
            });
            setExams(data.data);
            setPagination(data.pagination);
        } catch {
            setExams([]);
        } finally {
            setLoading(false);
        }
    }, [page, filters]);

    useEffect(() => { fetchExams(); }, [fetchExams]);

    const onSaved = () => {
        setShowCreate(false);
        setEditTarget(null);
        fetchExams();
    };

    const fmt = (dt) => dt ? new Date(dt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—';

    const statusCounts = {
        draft: exams.filter(e => e.status === 'DRAFT').length,
        published: exams.filter(e => e.status === 'PUBLISHED').length,
        active: exams.filter(e => e.status === 'ACTIVE').length,
    };

    return (
        <div className="animate-fade-in">
            {/* ─── Header ─── */}
            <div className="eb-header">
                <div>
                    <h1 className="heading-lg">📝 Exam Builder</h1>
                    <p className="text-muted text-sm">Create, configure and publish examinations</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
                    + New Exam
                </button>
            </div>

            {/* ─── Stats ─── */}
            <div className="eb-stats">
                <div className="eb-stat-card">
                    <span className="stat-icon">📋</span>
                    <span className="stat-label" style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', fontWeight: 600 }}>Total Exams</span>
                    <span className="stat-val" style={{ fontSize: '1.5rem', fontWeight: 800, background: 'linear-gradient(135deg,var(--primary-light),var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                        {pagination.total}
                    </span>
                </div>
                <div className="eb-stat-card">
                    <span className="stat-icon">📄</span>
                    <span className="stat-label" style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', fontWeight: 600 }}>Drafts</span>
                    <span className="stat-val" style={{ fontSize: '1.5rem', fontWeight: 800, background: 'linear-gradient(135deg,var(--primary-light),var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                        {statusCounts.draft}
                    </span>
                </div>
                <div className="eb-stat-card">
                    <span className="stat-icon">✅</span>
                    <span className="stat-label" style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', fontWeight: 600 }}>Published</span>
                    <span className="stat-val" style={{ fontSize: '1.5rem', fontWeight: 800, background: 'linear-gradient(135deg,var(--primary-light),var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                        {statusCounts.published}
                    </span>
                </div>
                <div className="eb-stat-card">
                    <span className="stat-icon">🔴</span>
                    <span className="stat-label" style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', fontWeight: 600 }}>Active Now</span>
                    <span className="stat-val" style={{ fontSize: '1.5rem', fontWeight: 800, background: 'linear-gradient(135deg,var(--primary-light),var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                        {statusCounts.active}
                    </span>
                </div>
            </div>

            {/* ─── Filters ─── */}
            <div className="eb-filters">
                <div className="eb-search-wrap">
                    <span className="eb-search-icon">🔍</span>
                    <input
                        className="eb-search"
                        placeholder="Search exams…"
                        value={filters.search}
                        onChange={e => { setFilters(f => ({ ...f, search: e.target.value })); setPage(1); }}
                    />
                </div>
                <select
                    className="eb-filter-select"
                    value={filters.status}
                    onChange={e => { setFilters(f => ({ ...f, status: e.target.value })); setPage(1); }}
                >
                    <option value="">All Statuses</option>
                    {['DRAFT', 'PUBLISHED', 'ACTIVE', 'CLOSED', 'ARCHIVED'].map(s => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>
            </div>

            {/* ─── Exam Grid ─── */}
            {loading ? (
                <div className="eb-loading"><div className="spinner" /> <span>Loading exams…</span></div>
            ) : exams.length === 0 ? (
                <div className="eb-empty">
                    <div style={{ fontSize: '3.5rem', marginBottom: 16 }}>📋</div>
                    <h3 className="heading-md" style={{ marginBottom: 8 }}>No exams found</h3>
                    <p className="text-muted">Create your first exam to get started.</p>
                    <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => setShowCreate(true)}>
                        Create Exam
                    </button>
                </div>
            ) : (
                <div className="eb-grid">
                    {exams.map(exam => (
                        <div key={exam.id} className="eb-card animate-fade-in">
                            <div className="eb-card-header">
                                <div>
                                    <div className="eb-card-title">{exam.title}</div>
                                    <div className="eb-card-subject text-muted text-sm">{exam.subjectCategory}</div>
                                </div>
                                <ExamStatusBadge status={exam.status} />
                            </div>

                            <div className="eb-card-meta">
                                <div className="eb-meta-item">
                                    <span className="eb-meta-label">Questions</span>
                                    <span className="eb-meta-value">{exam._count?.examQuestions ?? 0}</span>
                                </div>
                                <div className="eb-meta-item">
                                    <span className="eb-meta-label">Total Marks</span>
                                    <span className="eb-meta-value">{exam.totalMarks}</span>
                                </div>
                                <div className="eb-meta-item">
                                    <span className="eb-meta-label">Duration</span>
                                    <span className="eb-meta-value">{exam.durationMinutes} min</span>
                                </div>
                                <div className="eb-meta-item">
                                    <span className="eb-meta-label">Attempts</span>
                                    <span className="eb-meta-value">{exam._count?.examAttempts ?? 0}</span>
                                </div>
                            </div>

                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                📅 {new Date(exam.startDatetime).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                {' → '}
                                {new Date(exam.endDatetime).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                            </div>

                            <div className="eb-card-actions">
                                {!['ACTIVE', 'CLOSED', 'ARCHIVED'].includes(exam.status) && (
                                    <button className="btn btn-ghost btn-sm"
                                        onClick={() => setEditTarget(exam)}>
                                        ✏️ Edit
                                    </button>
                                )}
                                {exam.status === 'DRAFT' && exam._count?.examQuestions > 0 && (
                                    <button className="btn btn-primary btn-sm"
                                        onClick={() => setPublishTarget(exam)}>
                                        🚀 Publish
                                    </button>
                                )}
                                {exam.status === 'DRAFT' && exam._count?.examQuestions === 0 && (
                                    <button className="btn btn-secondary btn-sm"
                                        onClick={() => setEditTarget(exam)}>
                                        + Add Questions
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ─── Pagination ─── */}
            {!loading && pagination.pages > 1 && (
                <div className="qb-pagination" style={{ marginTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                    <span className="text-muted text-sm">
                        Page {page} of {pagination.pages} · {pagination.total} exams
                    </span>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-secondary btn-sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
                        <button className="btn btn-secondary btn-sm" disabled={page >= pagination.pages} onClick={() => setPage(p => p + 1)}>Next →</button>
                    </div>
                </div>
            )}

            {/* ─── Modals ─── */}
            {(showCreate || editTarget) && (
                <ExamFormModal
                    initial={editTarget}
                    onClose={() => { setShowCreate(false); setEditTarget(null); }}
                    onSaved={onSaved}
                />
            )}
            {publishTarget && (
                <PublishModal
                    exam={publishTarget}
                    onClose={() => setPublishTarget(null)}
                    onPublished={() => { setPublishTarget(null); fetchExams(); }}
                />
            )}
        </div>
    );
};

export default ExamBuilder;
