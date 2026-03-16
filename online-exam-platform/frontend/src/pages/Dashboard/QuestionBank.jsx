// ============================================
// Question Bank — Feature 4 Frontend
// Full CRUD: List, Create, Edit, Delete
// ============================================

import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import './QuestionBank.css';

// ─── Constants ─────────────────────────────────────────────────────────────
const QUESTION_TYPES = [
    { value: 'MCQ_SINGLE', label: 'MCQ (Single Answer)' },
    { value: 'MCQ_MULTIPLE', label: 'MCQ (Multiple Answers)' },
    { value: 'TRUE_FALSE', label: 'True / False' },
    { value: 'SHORT_ANSWER', label: 'Short Answer' },
    { value: 'FILL_IN_THE_BLANK', label: 'Fill in the Blank' },
];

const DIFFICULTIES = ['EASY', 'MEDIUM', 'HARD'];
const STATUSES = ['DRAFT', 'PUBLISHED', 'ARCHIVED'];

const MCQ_TYPES = ['MCQ_SINGLE', 'MCQ_MULTIPLE', 'TRUE_FALSE'];

const defaultForm = () => ({
    questionText: '',
    questionType: 'MCQ_SINGLE',
    difficultyLevel: 'MEDIUM',
    subject: '',
    category: '',
    marks: 1,
    negativeMarks: 0,
    explanation: '',
    correctAnswer: '',
    options: [
        { optionText: '', isCorrect: false },
        { optionText: '', isCorrect: false },
        { optionText: '', isCorrect: false },
        { optionText: '', isCorrect: false },
    ],
});

// ─── Difficulty badge ───────────────────────────────────────────────────────
function DiffBadge({ level }) {
    const cls = {
        EASY: 'diff-easy',
        MEDIUM: 'diff-medium',
        HARD: 'diff-hard',
    }[level] || '';
    return <span className={`diff-badge ${cls}`}>{level}</span>;
}

// ─── Status badge ───────────────────────────────────────────────────────────
function StatusBadge({ status }) {
    const colors = {
        DRAFT: 'badge-warning',
        PUBLISHED: 'badge-success',
        ARCHIVED: 'badge-danger',
    };
    return <span className={`badge ${colors[status] || ''}`}>{status}</span>;
}

// ─── Question Form Modal ────────────────────────────────────────────────────
function QuestionModal({ initial, onClose, onSaved }) {
    const [form, setForm] = useState(initial || defaultForm());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const isMCQ = MCQ_TYPES.includes(form.questionType);

    // When type switches to TRUE_FALSE, preset options
    const handleTypeChange = (e) => {
        const type = e.target.value;
        setForm(prev => ({
            ...prev,
            questionType: type,
            options: type === 'TRUE_FALSE'
                ? [
                    { optionText: 'True', isCorrect: false },
                    { optionText: 'False', isCorrect: false },
                ]
                : prev.options,
        }));
    };

    const setOption = (idx, field, value) => {
        setForm(prev => {
            const opts = [...prev.options];
            opts[idx] = { ...opts[idx], [field]: value };
            // For SINGLE, uncheck others when marking correct
            if (field === 'isCorrect' && value && form.questionType === 'MCQ_SINGLE') {
                opts.forEach((o, i) => { if (i !== idx) o.isCorrect = false; });
            }
            return { ...prev, options: opts };
        });
    };

    const addOption = () => setForm(prev => ({
        ...prev,
        options: [...prev.options, { optionText: '', isCorrect: false }],
    }));

    const removeOption = (idx) => setForm(prev => ({
        ...prev,
        options: prev.options.filter((_, i) => i !== idx),
    }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const payload = { ...form };
            if (!isMCQ) payload.options = [];
            if (initial?.id) {
                await api.put(`/questions/${initial.id}`, payload);
            } else {
                await api.post('/questions', payload);
            }
            onSaved();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save question.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-box" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{initial?.id ? 'Edit Question' : 'New Question'}</h2>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        {error && (
                            <div className="badge badge-danger" style={{ marginBottom: 16, padding: '8px 14px', display: 'block', borderRadius: 8 }}>
                                ⚠️ {error}
                            </div>
                        )}

                        {/* Question Text */}
                        <div className="input-group" style={{ marginBottom: 16 }}>
                            <label>Question Text *</label>
                            <textarea
                                className="input-field"
                                rows={3}
                                placeholder="Enter your question here…"
                                value={form.questionText}
                                onChange={e => setForm(prev => ({ ...prev, questionText: e.target.value }))}
                                required
                                style={{ resize: 'vertical' }}
                            />
                        </div>

                        {/* Row: Type + Difficulty */}
                        <div className="form-grid" style={{ marginBottom: 16 }}>
                            <div className="input-group">
                                <label>Question Type *</label>
                                <select
                                    className="input-field qb-filter-select"
                                    value={form.questionType}
                                    onChange={handleTypeChange}
                                    disabled={form.questionType === 'TRUE_FALSE' && form.options.length === 2 && form.options[0].optionText === 'True'}
                                >
                                    {QUESTION_TYPES.map(t => (
                                        <option key={t.value} value={t.value}>{t.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="input-group">
                                <label>Difficulty *</label>
                                <select
                                    className="input-field qb-filter-select"
                                    value={form.difficultyLevel}
                                    onChange={e => setForm(prev => ({ ...prev, difficultyLevel: e.target.value }))}
                                >
                                    {DIFFICULTIES.map(d => (
                                        <option key={d} value={d}>{d}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Row: Subject + Category */}
                        <div className="form-grid" style={{ marginBottom: 16 }}>
                            <div className="input-group">
                                <label>Subject *</label>
                                <input
                                    className="input-field"
                                    placeholder="e.g. Mathematics"
                                    value={form.subject}
                                    onChange={e => setForm(prev => ({ ...prev, subject: e.target.value }))}
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <label>Category</label>
                                <input
                                    className="input-field"
                                    placeholder="e.g. Algebra"
                                    value={form.category}
                                    onChange={e => setForm(prev => ({ ...prev, category: e.target.value }))}
                                />
                            </div>
                        </div>

                        {/* Row: Marks + Negative */}
                        <div className="form-grid" style={{ marginBottom: 16 }}>
                            <div className="input-group">
                                <label>Marks *</label>
                                <input
                                    className="input-field"
                                    type="number"
                                    min="1"
                                    value={form.marks}
                                    onChange={e => setForm(prev => ({ ...prev, marks: e.target.value }))}
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <label>Negative Marks</label>
                                <input
                                    className="input-field"
                                    type="number"
                                    min="0"
                                    step="0.25"
                                    value={form.negativeMarks}
                                    onChange={e => setForm(prev => ({ ...prev, negativeMarks: e.target.value }))}
                                />
                            </div>
                        </div>

                        {/* MCQ Options Builder */}
                        {isMCQ && (
                            <>
                                <p className="modal-section-title">Answer Options</p>
                                <div className="options-list">
                                    {form.options.map((opt, idx) => (
                                        <div key={idx} className="option-row">
                                            <input
                                                className="input-field"
                                                placeholder={`Option ${idx + 1}`}
                                                value={opt.optionText}
                                                onChange={e => setOption(idx, 'optionText', e.target.value)}
                                                required={isMCQ}
                                            />
                                            <button
                                                type="button"
                                                className={`option-correct-btn ${opt.isCorrect ? 'is-correct' : ''}`}
                                                onClick={() => setOption(idx, 'isCorrect', !opt.isCorrect)}
                                            >
                                                {opt.isCorrect ? '✓ Correct' : 'Mark Correct'}
                                            </button>
                                            {form.questionType !== 'TRUE_FALSE' && form.options.length > 2 && (
                                                <button
                                                    type="button"
                                                    className="option-remove-btn"
                                                    onClick={() => removeOption(idx)}
                                                >✕</button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                {form.questionType !== 'TRUE_FALSE' && (
                                    <button
                                        type="button"
                                        className="btn btn-ghost btn-sm"
                                        style={{ marginTop: 10 }}
                                        onClick={addOption}
                                    >
                                        + Add Option
                                    </button>
                                )}
                            </>
                        )}

                        {/* Short Answer / Fill blank: correct answer text */}
                        {!isMCQ && (
                            <div className="input-group" style={{ marginBottom: 16 }}>
                                <label>Correct Answer / Sample Answer</label>
                                <input
                                    className="input-field"
                                    placeholder="Model answer for grading reference"
                                    value={form.correctAnswer}
                                    onChange={e => setForm(prev => ({ ...prev, correctAnswer: e.target.value }))}
                                />
                            </div>
                        )}

                        {/* Explanation */}
                        <p className="modal-section-title">Explanation (Optional)</p>
                        <div className="input-group">
                            <textarea
                                className="input-field"
                                rows={2}
                                placeholder="Explain the correct answer to students after submission…"
                                value={form.explanation}
                                onChange={e => setForm(prev => ({ ...prev, explanation: e.target.value }))}
                                style={{ resize: 'vertical' }}
                            />
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? <><span className="spinner" style={{ width: 14, height: 14 }} /> Saving…</> : (initial?.id ? 'Update Question' : 'Create Question')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Delete Confirm Modal ───────────────────────────────────────────────────
function DeleteModal({ question, onClose, onDeleted }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleDelete = async () => {
        setLoading(true);
        try {
            await api.delete(`/questions/${question.id}`);
            onDeleted();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-box" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Delete Question</h2>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>
                <div className="modal-body">
                    {error && <div className="badge badge-danger" style={{ marginBottom: 12, display: 'block', padding: '8px 14px', borderRadius: 8 }}>⚠️ {error}</div>}
                    <p className="text-muted" style={{ marginBottom: 8 }}>
                        Are you sure you want to delete this question?
                    </p>
                    <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        "{question.questionText?.substring(0, 80)}…"
                    </p>
                    <p className="text-muted text-sm" style={{ marginTop: 8 }}>
                        This action cannot be undone.
                    </p>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
                    <button className="btn btn-danger" onClick={handleDelete} disabled={loading}>
                        {loading ? 'Deleting…' : 'Delete Question'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Main Page ──────────────────────────────────────────────────────────────
const QuestionBank = () => {
    const [questions, setQuestions] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: '', type: '', difficulty: '', status: '',
    });
    const [page, setPage] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [stats, setStats] = useState({ total: 0, published: 0, draft: 0, hard: 0 });

    const fetchQuestions = useCallback(async () => {
        setLoading(true);
        try {
            const params = { page, limit: 15, ...filters };
            const { data } = await api.get('/questions', { params });
            setQuestions(data.data);
            setPagination(data.pagination);

            // Basic stats from data (first page gives enough for a rough count)
            const all = data.data;
            setStats({
                total: data.pagination.total,
                published: all.filter(q => q.status === 'PUBLISHED').length,
                draft: all.filter(q => q.status === 'DRAFT').length,
                hard: all.filter(q => q.difficultyLevel === 'HARD').length,
            });
        } catch {
            setQuestions([]);
        } finally {
            setLoading(false);
        }
    }, [page, filters]);

    useEffect(() => { fetchQuestions(); }, [fetchQuestions]);

    const handleSaved = () => {
        setShowModal(false);
        setEditTarget(null);
        fetchQuestions();
    };

    const handleDeleted = () => {
        setDeleteTarget(null);
        fetchQuestions();
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPage(1);
    };

    const openEdit = (q) => {
        setEditTarget({
            ...q,
            marks: q.marks,
            negativeMarks: q.negativeMarks,
            options: q.options || [],
        });
        setShowModal(true);
    };

    const typeLabel = (type) =>
        QUESTION_TYPES.find(t => t.value === type)?.label || type;

    return (
        <div className="animate-fade-in">
            {/* ─── Header ─── */}
            <div className="qb-header">
                <div className="qb-header-titles">
                    <h1 className="heading-lg">
                        📚 Question Bank
                    </h1>
                    <p className="text-muted text-sm">Create and manage your question library</p>
                </div>
                <button className="btn btn-primary" onClick={() => { setEditTarget(null); setShowModal(true); }}>
                    + New Question
                </button>
            </div>

            {/* ─── Stats ─── */}
            <div className="qb-stats">
                <div className="qb-stat-card">
                    <span className="stat-icon">📝</span>
                    <span className="stat-label">Total Questions</span>
                    <span className="stat-val">{pagination.total}</span>
                </div>
                <div className="qb-stat-card">
                    <span className="stat-icon">✅</span>
                    <span className="stat-label">Published</span>
                    <span className="stat-val">{stats.published}</span>
                </div>
                <div className="qb-stat-card">
                    <span className="stat-icon">📋</span>
                    <span className="stat-label">Drafts</span>
                    <span className="stat-val">{stats.draft}</span>
                </div>
                <div className="qb-stat-card">
                    <span className="stat-icon">🔥</span>
                    <span className="stat-label">Hard Level</span>
                    <span className="stat-val">{stats.hard}</span>
                </div>
            </div>

            {/* ─── Filters ─── */}
            <div className="qb-filters">
                <div className="qb-search-wrap">
                    <span className="qb-search-icon">🔍</span>
                    <input
                        className="qb-search"
                        placeholder="Search questions…"
                        value={filters.search}
                        onChange={e => handleFilterChange('search', e.target.value)}
                    />
                </div>
                <select
                    className="qb-filter-select"
                    value={filters.type}
                    onChange={e => handleFilterChange('type', e.target.value)}
                >
                    <option value="">All Types</option>
                    {QUESTION_TYPES.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                </select>
                <select
                    className="qb-filter-select"
                    value={filters.difficulty}
                    onChange={e => handleFilterChange('difficulty', e.target.value)}
                >
                    <option value="">All Difficulties</option>
                    {DIFFICULTIES.map(d => (
                        <option key={d} value={d}>{d}</option>
                    ))}
                </select>
                <select
                    className="qb-filter-select"
                    value={filters.status}
                    onChange={e => handleFilterChange('status', e.target.value)}
                >
                    <option value="">All Statuses</option>
                    {STATUSES.map(s => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>
            </div>

            {/* ─── Table ─── */}
            {loading ? (
                <div className="qb-loading">
                    <div className="spinner" />
                    <span>Loading questions…</span>
                </div>
            ) : questions.length === 0 ? (
                <div className="qb-empty">
                    <div className="qb-empty-icon">📭</div>
                    <h3 className="heading-md" style={{ marginBottom: 8 }}>No questions found</h3>
                    <p>Try adjusting the filters or create your first question.</p>
                    <button className="btn btn-primary" style={{ marginTop: 20 }}
                        onClick={() => { setEditTarget(null); setShowModal(true); }}>
                        Create Question
                    </button>
                </div>
            ) : (
                <div className="qb-table-wrap">
                    <table className="qb-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Question</th>
                                <th>Type</th>
                                <th>Subject</th>
                                <th>Difficulty</th>
                                <th>Marks</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {questions.map((q, idx) => (
                                <tr key={q.id}>
                                    <td className="text-muted text-sm">
                                        {(page - 1) * 15 + idx + 1}
                                    </td>
                                    <td>
                                        <div className="qb-question-text" title={q.questionText}>
                                            {q.questionText}
                                        </div>
                                        {q._count?.examQuestions > 0 && (
                                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                                Used in {q._count.examQuestions} exam(s)
                                            </span>
                                        )}
                                    </td>
                                    <td>
                                        <span className="badge badge-primary" style={{ fontSize: '0.68rem' }}>
                                            {typeLabel(q.questionType)}
                                        </span>
                                    </td>
                                    <td className="text-sm">{q.subject}</td>
                                    <td><DiffBadge level={q.difficultyLevel} /></td>
                                    <td style={{ fontWeight: 700, color: 'var(--primary-light)' }}>
                                        {q.marks}
                                    </td>
                                    <td><StatusBadge status={q.status} /></td>
                                    <td>
                                        <div className="qb-row-actions">
                                            <button
                                                className="btn btn-ghost btn-sm"
                                                onClick={() => openEdit(q)}
                                                title="Edit"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                className="btn btn-ghost btn-sm"
                                                onClick={() => setDeleteTarget(q)}
                                                title="Delete"
                                                style={{ color: 'var(--danger-light)' }}
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ─── Pagination ─── */}
            {!loading && pagination.pages > 1 && (
                <div className="qb-pagination">
                    <span className="qb-page-info">
                        Page {pagination.page} of {pagination.pages} · {pagination.total} total
                    </span>
                    <div className="qb-page-buttons">
                        <button
                            className="btn btn-secondary btn-sm"
                            disabled={page <= 1}
                            onClick={() => setPage(p => p - 1)}
                        >
                            ← Prev
                        </button>
                        <button
                            className="btn btn-secondary btn-sm"
                            disabled={page >= pagination.pages}
                            onClick={() => setPage(p => p + 1)}
                        >
                            Next →
                        </button>
                    </div>
                </div>
            )}

            {/* ─── Modals ─── */}
            {showModal && (
                <QuestionModal
                    initial={editTarget}
                    onClose={() => { setShowModal(false); setEditTarget(null); }}
                    onSaved={handleSaved}
                />
            )}
            {deleteTarget && (
                <DeleteModal
                    question={deleteTarget}
                    onClose={() => setDeleteTarget(null)}
                    onDeleted={handleDeleted}
                />
            )}
        </div>
    );
};

export default QuestionBank;
