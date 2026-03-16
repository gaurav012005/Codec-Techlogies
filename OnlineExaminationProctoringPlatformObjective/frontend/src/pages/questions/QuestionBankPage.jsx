import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    HiOutlinePlus,
    HiOutlineSearch,
    HiOutlineFilter,
    HiOutlineDotsVertical,
    HiOutlinePencil,
    HiOutlineTrash,
    HiOutlineDuplicate,
    HiOutlineEye,
    HiOutlineDownload,
    HiOutlineUpload,
    HiOutlineCollection,
    HiOutlineChevronLeft,
    HiOutlineChevronRight,
    HiOutlineCheckCircle,
    HiOutlineXCircle,
    HiOutlineQuestionMarkCircle,
} from 'react-icons/hi';

const stripHtml = (html) => {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
};

// Mock questions data
export const MOCK_QUESTIONS = [
    {
        id: '1',
        question_text: 'What is the derivative of x² + 3x + 5?',
        question_type: 'MCQ_SINGLE',
        difficulty_level: 'EASY',
        subject: 'Mathematics',
        category: 'Calculus',
        marks: 2,
        negative_marks: 0.5,
        status: 'PUBLISHED',
        created_by: 'Dr. Rajesh Kumar',
        created_at: '2026-02-20',
        options: [
            { text: '2x + 3', is_correct: true },
            { text: 'x² + 3', is_correct: false },
            { text: '2x + 5', is_correct: false },
            { text: '2x', is_correct: false },
        ],
    },
    {
        id: '2',
        question_text: 'Newton\'s second law of motion states that F = ma.',
        question_type: 'TRUE_FALSE',
        difficulty_level: 'EASY',
        subject: 'Physics',
        category: 'Mechanics',
        marks: 1,
        negative_marks: 0,
        status: 'PUBLISHED',
        created_by: 'Prof. Priya Sharma',
        created_at: '2026-02-18',
        correct_answer: 'True',
    },
    {
        id: '3',
        question_text: 'Explain the concept of polymorphism in Object-Oriented Programming with examples.',
        question_type: 'SHORT_ANSWER',
        difficulty_level: 'HARD',
        subject: 'Computer Science',
        category: 'OOP',
        marks: 10,
        negative_marks: 0,
        status: 'DRAFT',
        created_by: 'Dr. Rajesh Kumar',
        created_at: '2026-02-22',
    },
    {
        id: '4',
        question_text: 'The chemical formula of water is ______.',
        question_type: 'FILL_BLANK',
        difficulty_level: 'EASY',
        subject: 'Chemistry',
        category: 'General',
        marks: 1,
        negative_marks: 0,
        status: 'PUBLISHED',
        created_by: 'Prof. Priya Sharma',
        created_at: '2026-02-19',
        correct_answer: 'H2O',
    },
    {
        id: '5',
        question_text: 'Which of the following are valid sorting algorithms? Select all that apply.',
        question_type: 'MCQ_MULTIPLE',
        difficulty_level: 'MEDIUM',
        subject: 'Computer Science',
        category: 'Algorithms',
        marks: 4,
        negative_marks: 1,
        status: 'PUBLISHED',
        created_by: 'Dr. Rajesh Kumar',
        created_at: '2026-02-21',
        options: [
            { text: 'Bubble Sort', is_correct: true },
            { text: 'Rainbow Sort', is_correct: false },
            { text: 'Merge Sort', is_correct: true },
            { text: 'Quick Sort', is_correct: true },
        ],
    },
    {
        id: '6',
        question_text: 'What is the integral of cos(x)?',
        question_type: 'MCQ_SINGLE',
        difficulty_level: 'MEDIUM',
        subject: 'Mathematics',
        category: 'Calculus',
        marks: 3,
        negative_marks: 0.5,
        status: 'PUBLISHED',
        created_by: 'Dr. Rajesh Kumar',
        created_at: '2026-02-23',
        options: [
            { text: 'sin(x) + C', is_correct: true },
            { text: '-sin(x) + C', is_correct: false },
            { text: 'cos(x) + C', is_correct: false },
            { text: '-cos(x) + C', is_correct: false },
        ],
    },
    {
        id: '7',
        question_text: 'Define Ohm\'s Law and derive the relationship between voltage, current, and resistance.',
        question_type: 'SHORT_ANSWER',
        difficulty_level: 'MEDIUM',
        subject: 'Physics',
        category: 'Electricity',
        marks: 8,
        negative_marks: 0,
        status: 'PUBLISHED',
        created_by: 'Prof. Priya Sharma',
        created_at: '2026-02-24',
    },
    {
        id: '8',
        question_text: 'The process of converting solid directly to gas is called ______.',
        question_type: 'FILL_BLANK',
        difficulty_level: 'EASY',
        subject: 'Chemistry',
        category: 'States of Matter',
        marks: 1,
        negative_marks: 0,
        status: 'DRAFT',
        created_by: 'Prof. Priya Sharma',
        created_at: '2026-02-25',
        correct_answer: 'Sublimation',
    },
];

const typeLabels = {
    MCQ_SINGLE: { label: 'MCQ (Single)', badge: 'badge-primary' },
    MCQ_MULTIPLE: { label: 'MCQ (Multiple)', badge: 'badge-info' },
    TRUE_FALSE: { label: 'True/False', badge: 'badge-success' },
    SHORT_ANSWER: { label: 'Short Answer', badge: 'badge-warning' },
    FILL_BLANK: { label: 'Fill in Blank', badge: 'badge-default' },
};

const difficultyLabels = {
    EASY: { label: 'Easy', badge: 'badge-success' },
    MEDIUM: { label: 'Medium', badge: 'badge-warning' },
    HARD: { label: 'Hard', badge: 'badge-danger' },
};

const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } }
};

const item = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35 } }
};

export default function QuestionBankPage() {
    const navigate = useNavigate();
    const [questions, setQuestions] = useState(() => {
        const saved = localStorage.getItem('questions_bank');
        return saved ? JSON.parse(saved) : MOCK_QUESTIONS;
    });

    useEffect(() => {
        localStorage.setItem('questions_bank', JSON.stringify(questions));
    }, [questions]);

    const [searchTerm, setSearchTerm] = useState('');
    const [filterSubject, setFilterSubject] = useState('');
    const [filterType, setFilterType] = useState('');
    const [filterDifficulty, setFilterDifficulty] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [openDropdown, setOpenDropdown] = useState(null);
    const [selectedQuestions, setSelectedQuestions] = useState([]);
    const [viewQuestion, setViewQuestion] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const perPage = 6;

    const subjects = [...new Set(questions.map(q => q.subject))];

    const filteredQuestions = useMemo(() => {
        return questions.filter(q => {
            const matchSearch = stripHtml(q.question_text).toLowerCase().includes(searchTerm.toLowerCase()) ||
                (q.subject && q.subject.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (q.category && q.category.toLowerCase().includes(searchTerm.toLowerCase()));
            const matchSubject = !filterSubject || q.subject === filterSubject;
            const matchType = !filterType || q.question_type === filterType;
            const matchDiff = !filterDifficulty || q.difficulty_level === filterDifficulty;
            const matchStatus = !filterStatus || q.status === filterStatus;
            return matchSearch && matchSubject && matchType && matchDiff && matchStatus;
        });
    }, [questions, searchTerm, filterSubject, filterType, filterDifficulty, filterStatus]);

    const totalPages = Math.ceil(filteredQuestions.length / perPage);
    const paginatedQuestions = filteredQuestions.slice((currentPage - 1) * perPage, currentPage * perPage);

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this question?')) {
            setQuestions(prev => prev.filter(q => q.id !== id));
        }
        setOpenDropdown(null);
    };

    const handleDuplicate = (q) => {
        const dup = {
            ...q,
            id: Date.now().toString(),
            question_text: q.question_text + ' (Copy)',
            status: 'DRAFT',
            created_at: new Date().toISOString().split('T')[0]
        };
        setQuestions(prev => [dup, ...prev]);
        setOpenDropdown(null);
    };

    const toggleSelect = (id) => {
        setSelectedQuestions(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedQuestions.length === paginatedQuestions.length) {
            setSelectedQuestions([]);
        } else {
            setSelectedQuestions(paginatedQuestions.map(q => q.id));
        }
    };

    return (
        <motion.div variants={container} initial="hidden" animate="show">
            {/* Page Header */}
            <motion.div variants={item} className="page-header">
                <div className="page-header-left">
                    <h1 className="page-title">Question Bank</h1>
                    <p className="page-subtitle">{filteredQuestions.length} questions · Manage your exam question pool</p>
                </div>
                <div className="page-header-actions">
                    <button className="btn btn-secondary">
                        <HiOutlineUpload /> Import CSV
                    </button>
                    <button className="btn btn-secondary">
                        <HiOutlineDownload /> Export
                    </button>
                    <button className="btn btn-primary" onClick={() => navigate('/dashboard/questions/new')}>
                        <HiOutlinePlus /> Add Question
                    </button>
                </div>
            </motion.div>

            {/* Stats mini cards */}
            <motion.div variants={item} className="stats-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)', marginBottom: 'var(--space-6)' }}>
                <div className="stat-card primary" style={{ padding: 'var(--space-4) var(--space-5)' }}>
                    <div className="stat-card-value" style={{ fontSize: 'var(--font-xl)' }}>{questions.length}</div>
                    <div className="stat-card-label" style={{ fontSize: 'var(--font-xs)' }}>Total</div>
                </div>
                <div className="stat-card success" style={{ padding: 'var(--space-4) var(--space-5)' }}>
                    <div className="stat-card-value" style={{ fontSize: 'var(--font-xl)' }}>{questions.filter(q => q.question_type.startsWith('MCQ')).length}</div>
                    <div className="stat-card-label" style={{ fontSize: 'var(--font-xs)' }}>MCQ</div>
                </div>
                <div className="stat-card warning" style={{ padding: 'var(--space-4) var(--space-5)' }}>
                    <div className="stat-card-value" style={{ fontSize: 'var(--font-xl)' }}>{questions.filter(q => q.question_type === 'SHORT_ANSWER').length}</div>
                    <div className="stat-card-label" style={{ fontSize: 'var(--font-xs)' }}>Short Answer</div>
                </div>
                <div className="stat-card info" style={{ padding: 'var(--space-4) var(--space-5)' }}>
                    <div className="stat-card-value" style={{ fontSize: 'var(--font-xl)' }}>{questions.filter(q => q.status === 'PUBLISHED').length}</div>
                    <div className="stat-card-label" style={{ fontSize: 'var(--font-xs)' }}>Published</div>
                </div>
                <div className="stat-card danger" style={{ padding: 'var(--space-4) var(--space-5)' }}>
                    <div className="stat-card-value" style={{ fontSize: 'var(--font-xl)' }}>{questions.filter(q => q.status === 'DRAFT').length}</div>
                    <div className="stat-card-label" style={{ fontSize: 'var(--font-xs)' }}>Draft</div>
                </div>
            </motion.div>

            {/* Filter Bar */}
            <motion.div variants={item} className="filter-bar">
                <div className="filter-search">
                    <span className="filter-search-icon"><HiOutlineSearch /></span>
                    <input
                        type="text"
                        placeholder="Search questions, subjects, categories..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <select className="filter-select" value={filterSubject} onChange={e => setFilterSubject(e.target.value)}>
                    <option value="">All Subjects</option>
                    {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select className="filter-select" value={filterType} onChange={e => setFilterType(e.target.value)}>
                    <option value="">All Types</option>
                    <option value="MCQ_SINGLE">MCQ (Single)</option>
                    <option value="MCQ_MULTIPLE">MCQ (Multiple)</option>
                    <option value="TRUE_FALSE">True/False</option>
                    <option value="SHORT_ANSWER">Short Answer</option>
                    <option value="FILL_BLANK">Fill in Blank</option>
                </select>
                <select className="filter-select" value={filterDifficulty} onChange={e => setFilterDifficulty(e.target.value)}>
                    <option value="">All Levels</option>
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                </select>
                <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                    <option value="">All Status</option>
                    <option value="PUBLISHED">Published</option>
                    <option value="DRAFT">Draft</option>
                </select>
            </motion.div>

            {/* Bulk Actions */}
            {selectedQuestions.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-3)',
                        padding: 'var(--space-3) var(--space-4)',
                        background: 'rgba(99, 102, 241, 0.08)',
                        border: '1px solid rgba(99, 102, 241, 0.2)',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: 'var(--space-4)',
                    }}
                >
                    <span style={{ fontSize: 'var(--font-sm)', color: 'var(--primary-400)', fontWeight: 600 }}>
                        {selectedQuestions.length} selected
                    </span>
                    <button className="btn btn-sm btn-danger" onClick={() => {
                        setQuestions(prev => prev.filter(q => !selectedQuestions.includes(q.id)));
                        setSelectedQuestions([]);
                    }}>
                        <HiOutlineTrash /> Delete Selected
                    </button>
                    <button className="btn btn-sm btn-secondary" onClick={() => setSelectedQuestions([])}>
                        Clear
                    </button>
                </motion.div>
            )}

            {/* Questions Table */}
            <motion.div variants={item} className="card">
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th style={{ width: 40 }}>
                                    <input
                                        type="checkbox"
                                        className="form-checkbox"
                                        checked={selectedQuestions.length === paginatedQuestions.length && paginatedQuestions.length > 0}
                                        onChange={toggleSelectAll}
                                    />
                                </th>
                                <th>Question</th>
                                <th>Type</th>
                                <th>Subject</th>
                                <th>Difficulty</th>
                                <th>Marks</th>
                                <th>Status</th>
                                <th>Created</th>
                                <th style={{ width: 50 }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedQuestions.map(q => (
                                <tr key={q.id}>
                                    <td>
                                        <input
                                            type="checkbox"
                                            className="form-checkbox"
                                            checked={selectedQuestions.includes(q.id)}
                                            onChange={() => toggleSelect(q.id)}
                                        />
                                    </td>
                                    <td>
                                        <div style={{ maxWidth: 340 }}>
                                            <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {stripHtml(q.question_text)}
                                            </div>
                                            <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)' }}>
                                                {q.category} · by {q.created_by}
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`badge ${typeLabels[q.question_type]?.badge}`}>
                                            {typeLabels[q.question_type]?.label}
                                        </span>
                                    </td>
                                    <td style={{ fontWeight: 500 }}>{q.subject}</td>
                                    <td>
                                        <span className={`badge ${difficultyLabels[q.difficulty_level]?.badge}`}>
                                            {difficultyLabels[q.difficulty_level]?.label}
                                        </span>
                                    </td>
                                    <td style={{ fontWeight: 600 }}>
                                        {q.marks}
                                        {q.negative_marks > 0 && (
                                            <span style={{ color: 'var(--danger-400)', fontSize: 'var(--font-xs)' }}> (-{q.negative_marks})</span>
                                        )}
                                    </td>
                                    <td>
                                        <span className={`badge ${q.status === 'PUBLISHED' ? 'badge-success' : 'badge-warning'}`}>
                                            <span className="badge-dot"></span>
                                            {q.status === 'PUBLISHED' ? 'Published' : 'Draft'}
                                        </span>
                                    </td>
                                    <td style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)' }}>{q.created_at}</td>
                                    <td>
                                        <div style={{ position: 'relative' }}>
                                            <button
                                                className="btn btn-ghost btn-icon btn-sm"
                                                onClick={() => setOpenDropdown(openDropdown === q.id ? null : q.id)}
                                            >
                                                <HiOutlineDotsVertical />
                                            </button>
                                            {openDropdown === q.id && (
                                                <div className="dropdown-menu" onClick={() => setOpenDropdown(null)}>
                                                    <button className="dropdown-item" onClick={() => setViewQuestion(q)}>
                                                        <HiOutlineEye /> View
                                                    </button>
                                                    <button className="dropdown-item" onClick={() => navigate(`/dashboard/questions/edit/${q.id}`)}>
                                                        <HiOutlinePencil /> Edit
                                                    </button>
                                                    <button className="dropdown-item" onClick={() => handleDuplicate(q)}>
                                                        <HiOutlineDuplicate /> Duplicate
                                                    </button>
                                                    <button className="dropdown-item danger" onClick={() => handleDelete(q.id)}>
                                                        <HiOutlineTrash /> Delete
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="card-footer">
                        <div className="pagination">
                            <div className="pagination-info">
                                Showing {(currentPage - 1) * perPage + 1}–{Math.min(currentPage * perPage, filteredQuestions.length)} of {filteredQuestions.length}
                            </div>
                            <div className="pagination-buttons">
                                <button
                                    className="pagination-btn"
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                >
                                    <HiOutlineChevronLeft />
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => (
                                    <button
                                        key={i}
                                        className={`pagination-btn ${currentPage === i + 1 ? 'active' : ''}`}
                                        onClick={() => setCurrentPage(i + 1)}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                                <button
                                    className="pagination-btn"
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                >
                                    <HiOutlineChevronRight />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {filteredQuestions.length === 0 && (
                    <div className="card-body">
                        <div className="empty-state">
                            <div className="empty-state-icon"><HiOutlineCollection /></div>
                            <div className="empty-state-title">No questions found</div>
                            <div className="empty-state-desc">
                                {searchTerm ? 'Try adjusting your search or filters' : 'Start by adding your first question to the bank'}
                            </div>
                            <button className="btn btn-primary" onClick={() => navigate('/dashboard/questions/new')}>
                                <HiOutlinePlus /> Add Question
                            </button>
                        </div>
                    </div>
                )}
            </motion.div>

            {/* View Question Modal */}
            {viewQuestion && (
                <div className="modal-overlay" onClick={() => setViewQuestion(null)}>
                    <motion.div
                        className="modal modal-lg"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="modal-header">
                            <h3 className="modal-title">Question Preview</h3>
                            <button className="modal-close" onClick={() => setViewQuestion(null)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)', flexWrap: 'wrap' }}>
                                <span className={`badge ${typeLabels[viewQuestion.question_type]?.badge}`}>
                                    {typeLabels[viewQuestion.question_type]?.label}
                                </span>
                                <span className={`badge ${difficultyLabels[viewQuestion.difficulty_level]?.badge}`}>
                                    {difficultyLabels[viewQuestion.difficulty_level]?.label}
                                </span>
                                <span className="badge badge-default">{viewQuestion.subject}</span>
                                <span className="badge badge-default">{viewQuestion.category}</span>
                                <span className="badge badge-primary">{viewQuestion.marks} marks</span>
                            </div>
                            <div style={{
                                fontSize: 'var(--font-md)',
                                fontWeight: 600,
                                color: 'var(--text-primary)',
                                lineHeight: 1.6,
                                marginBottom: 'var(--space-6)',
                                padding: 'var(--space-4)',
                                background: 'var(--bg-elevated)',
                                borderRadius: 'var(--radius-md)',
                            }} dangerouslySetInnerHTML={{ __html: viewQuestion.question_text }}>
                            </div>

                            {viewQuestion.options && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                                    <div style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 'var(--space-1)' }}>Options:</div>
                                    {viewQuestion.options.map((opt, i) => (
                                        <div key={i} style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 'var(--space-3)',
                                            padding: 'var(--space-3) var(--space-4)',
                                            background: opt.is_correct ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-elevated)',
                                            border: `1px solid ${opt.is_correct ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-subtle)'}`,
                                            borderRadius: 'var(--radius-md)',
                                        }}>
                                            <span style={{
                                                width: 24, height: 24, borderRadius: 'var(--radius-full)',
                                                background: opt.is_correct ? 'var(--success-500)' : 'var(--bg-card)',
                                                border: `1px solid ${opt.is_correct ? 'var(--success-400)' : 'var(--border-default)'}`,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: 'var(--font-xs)', fontWeight: 700, color: opt.is_correct ? 'white' : 'var(--text-secondary)',
                                                flexShrink: 0,
                                            }}>
                                                {String.fromCharCode(65 + i)}
                                            </span>
                                            <span style={{ fontSize: 'var(--font-sm)', color: 'var(--text-primary)' }}>{opt.text}</span>
                                            {opt.is_correct && <HiOutlineCheckCircle style={{ marginLeft: 'auto', color: 'var(--success-400)' }} />}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {viewQuestion.correct_answer && (
                                <div style={{ marginTop: 'var(--space-4)' }}>
                                    <div style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 'var(--space-1)' }}>
                                        Correct Answer:
                                    </div>
                                    <div style={{
                                        padding: 'var(--space-3) var(--space-4)',
                                        background: 'rgba(16, 185, 129, 0.08)',
                                        border: '1px solid rgba(16, 185, 129, 0.3)',
                                        borderRadius: 'var(--radius-md)',
                                        fontSize: 'var(--font-sm)',
                                        color: 'var(--success-400)',
                                        fontWeight: 600,
                                    }}>
                                        {viewQuestion.correct_answer}
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </motion.div>
    );
}
