import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    HiOutlineArrowLeft,
    HiOutlinePlus,
    HiOutlineTrash,
    HiOutlineCheckCircle,
    HiOutlineSave,
    HiOutlineEye,
    HiOutlinePhotograph,
    HiOutlineLightningBolt,
} from 'react-icons/hi';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { MOCK_QUESTIONS } from './QuestionBankPage';

const questionTypes = [
    { value: 'MCQ_SINGLE', label: 'MCQ (Single Answer)', icon: '🔘', desc: 'One correct option out of multiple choices' },
    { value: 'MCQ_MULTIPLE', label: 'MCQ (Multiple Answers)', icon: '☑️', desc: 'Multiple correct options possible' },
    { value: 'TRUE_FALSE', label: 'True / False', icon: '✅', desc: 'Binary true or false question' },
    { value: 'SHORT_ANSWER', label: 'Short Answer', icon: '📝', desc: 'Free-text response (manual grading)' },
    { value: 'FILL_BLANK', label: 'Fill in the Blank', icon: '___', desc: 'Exact match or keyword grading' },
];

const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } }
};

const item = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35 } }
};

export default function QuestionEditorPage() {
    const navigate = useNavigate();
    const [questionType, setQuestionType] = useState('');
    const [questionText, setQuestionText] = useState('');
    const [subject, setSubject] = useState('');
    const [category, setCategory] = useState('');
    const [difficulty, setDifficulty] = useState('EASY');
    const [marks, setMarks] = useState(1);
    const [negativeMarks, setNegativeMarks] = useState(0);
    const [explanation, setExplanation] = useState('');
    const [options, setOptions] = useState([
        { text: '', is_correct: false },
        { text: '', is_correct: false },
        { text: '', is_correct: false },
        { text: '', is_correct: false },
    ]);
    const [correctAnswer, setCorrectAnswer] = useState('');
    const [showPreview, setShowPreview] = useState(false);

    const addOption = () => {
        setOptions([...options, { text: '', is_correct: false }]);
    };

    const removeOption = (index) => {
        if (options.length <= 2) return;
        setOptions(options.filter((_, i) => i !== index));
    };

    const updateOption = (index, field, value) => {
        setOptions(options.map((opt, i) => {
            if (i === index) {
                return { ...opt, [field]: value };
            }
            if (field === 'is_correct' && questionType === 'MCQ_SINGLE' && value === true) {
                return { ...opt, is_correct: false };
            }
            return opt;
        }));
    };

    const handleSave = (status = 'DRAFT') => {
        const questionData = {
            id: Date.now().toString(),
            question_text: questionText,
            question_type: questionType,
            subject: subject || 'Uncategorized',
            category: category || 'General',
            difficulty_level: difficulty,
            marks: Number(marks),
            negative_marks: Number(negativeMarks),
            explanation,
            status,
            options: ['MCQ_SINGLE', 'MCQ_MULTIPLE'].includes(questionType) ? options : undefined,
            correct_answer: ['TRUE_FALSE', 'FILL_BLANK'].includes(questionType) ? correctAnswer : undefined,
            created_by: 'Current User',
            created_at: new Date().toISOString().split('T')[0],
        };

        const saved = localStorage.getItem('questions_bank');
        const prevQuestions = saved ? JSON.parse(saved) : MOCK_QUESTIONS;
        localStorage.setItem('questions_bank', JSON.stringify([questionData, ...prevQuestions]));

        console.log('Saved question:', questionData);
        navigate('/dashboard/questions');
    };

    // Step 1: Select question type
    if (!questionType) {
        return (
            <motion.div variants={container} initial="hidden" animate="show">
                <motion.div variants={item} className="page-header">
                    <div className="page-header-left">
                        <button
                            className="btn btn-ghost"
                            onClick={() => navigate('/dashboard/questions')}
                            style={{ marginBottom: 'var(--space-2)' }}
                        >
                            <HiOutlineArrowLeft /> Back to Question Bank
                        </button>
                        <h1 className="page-title">Create New Question</h1>
                        <p className="page-subtitle">Choose the question type to get started</p>
                    </div>
                </motion.div>

                <motion.div variants={item} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 'var(--space-4)' }}>
                    {questionTypes.map(type => (
                        <div
                            key={type.value}
                            className="quick-action"
                            onClick={() => setQuestionType(type.value)}
                            style={{ cursor: 'pointer' }}
                        >
                            <div style={{ fontSize: 32 }}>{type.icon}</div>
                            <div className="quick-action-title">{type.label}</div>
                            <div className="quick-action-desc">{type.desc}</div>
                        </div>
                    ))}
                </motion.div>
            </motion.div>
        );
    }

    const selectedType = questionTypes.find(t => t.value === questionType);

    return (
        <motion.div variants={container} initial="hidden" animate="show">
            {/* Header */}
            <motion.div variants={item} className="page-header">
                <div className="page-header-left">
                    <button
                        className="btn btn-ghost"
                        onClick={() => navigate('/dashboard/questions')}
                        style={{ marginBottom: 'var(--space-2)' }}
                    >
                        <HiOutlineArrowLeft /> Back to Question Bank
                    </button>
                    <h1 className="page-title">Create {selectedType?.label}</h1>
                    <p className="page-subtitle">Fill in the details below to create your question</p>
                </div>
                <div className="page-header-actions">
                    <button className="btn btn-secondary" onClick={() => setShowPreview(!showPreview)}>
                        <HiOutlineEye /> Preview
                    </button>
                    <button className="btn btn-secondary" onClick={() => handleSave('DRAFT')}>
                        <HiOutlineSave /> Save Draft
                    </button>
                    <button className="btn btn-primary" onClick={() => handleSave('PUBLISHED')}>
                        <HiOutlineLightningBolt /> Publish
                    </button>
                </div>
            </motion.div>

            <div style={{ display: 'grid', gridTemplateColumns: showPreview ? '1fr 1fr' : '1fr', gap: 'var(--space-6)' }}>
                {/* Editor */}
                <div>
                    {/* Meta Info */}
                    <motion.div variants={item} className="card mb-6">
                        <div className="card-header">
                            <h3 className="card-title">Question Details</h3>
                            <button className="btn btn-ghost btn-sm" onClick={() => setQuestionType('')}>
                                Change Type
                            </button>
                        </div>
                        <div className="card-body">
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                                <div className="form-group">
                                    <label className="form-label">Subject *</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="e.g. Mathematics"
                                        value={subject}
                                        onChange={e => setSubject(e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Category</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="e.g. Calculus"
                                        value={category}
                                        onChange={e => setCategory(e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Difficulty Level *</label>
                                    <select
                                        className="form-input form-select"
                                        value={difficulty}
                                        onChange={e => setDifficulty(e.target.value)}
                                    >
                                        <option value="EASY">🟢 Easy</option>
                                        <option value="MEDIUM">🟡 Medium</option>
                                        <option value="HARD">🔴 Hard</option>
                                    </select>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                                    <div className="form-group">
                                        <label className="form-label">Marks *</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            min={1}
                                            value={marks}
                                            onChange={e => setMarks(e.target.value)}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Negative Marks</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            min={0}
                                            step={0.25}
                                            value={negativeMarks}
                                            onChange={e => setNegativeMarks(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Question Text */}
                    <motion.div variants={item} className="card mb-6">
                        <div className="card-header">
                            <h3 className="card-title">Question Text *</h3>
                        </div>
                        <div className="card-body">
                            <ReactQuill
                                theme="snow"
                                value={questionText}
                                onChange={setQuestionText}
                                placeholder="Type your question here..."
                                modules={{
                                    toolbar: [
                                        [{ 'header': [1, 2, 3, false] }],
                                        ['bold', 'italic', 'underline', 'strike'],
                                        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                                        ['blockquote', 'code-block'],
                                        ['link', 'image'],
                                        ['clean'],
                                    ],
                                }}
                            />
                        </div>
                    </motion.div>

                    {/* Options for MCQ */}
                    {['MCQ_SINGLE', 'MCQ_MULTIPLE'].includes(questionType) && (
                        <motion.div variants={item} className="card mb-6">
                            <div className="card-header">
                                <h3 className="card-title">
                                    Answer Options *
                                    <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)', fontWeight: 400, marginLeft: 8 }}>
                                        {questionType === 'MCQ_SINGLE' ? 'Select one correct answer' : 'Select all correct answers'}
                                    </span>
                                </h3>
                                <button className="btn btn-secondary btn-sm" onClick={addOption}>
                                    <HiOutlinePlus /> Add Option
                                </button>
                            </div>
                            <div className="card-body">
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                                    {options.map((opt, i) => (
                                        <div
                                            key={i}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 'var(--space-3)',
                                                padding: 'var(--space-3) var(--space-4)',
                                                background: opt.is_correct ? 'rgba(16, 185, 129, 0.06)' : 'var(--bg-elevated)',
                                                border: `1px solid ${opt.is_correct ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-subtle)'}`,
                                                borderRadius: 'var(--radius-md)',
                                                transition: 'all var(--transition-fast)',
                                            }}
                                        >
                                            <button
                                                type="button"
                                                onClick={() => updateOption(i, 'is_correct', !opt.is_correct)}
                                                style={{
                                                    width: 28,
                                                    height: 28,
                                                    borderRadius: questionType === 'MCQ_SINGLE' ? 'var(--radius-full)' : 'var(--radius-sm)',
                                                    background: opt.is_correct ? 'var(--success-500)' : 'transparent',
                                                    border: `2px solid ${opt.is_correct ? 'var(--success-400)' : 'var(--border-strong)'}`,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    cursor: 'pointer',
                                                    transition: 'all var(--transition-fast)',
                                                    flexShrink: 0,
                                                    color: 'white',
                                                    fontSize: 14,
                                                }}
                                            >
                                                {opt.is_correct && <HiOutlineCheckCircle />}
                                            </button>
                                            <span style={{
                                                width: 24,
                                                fontSize: 'var(--font-sm)',
                                                fontWeight: 700,
                                                color: 'var(--text-tertiary)',
                                                flexShrink: 0,
                                            }}>
                                                {String.fromCharCode(65 + i)}.
                                            </span>
                                            <input
                                                type="text"
                                                className="form-input"
                                                placeholder={`Option ${String.fromCharCode(65 + i)}`}
                                                value={opt.text}
                                                onChange={e => updateOption(i, 'text', e.target.value)}
                                                style={{ border: 'none', background: 'transparent', padding: 0, height: 'auto' }}
                                            />
                                            {options.length > 2 && (
                                                <button
                                                    className="btn btn-ghost btn-icon btn-sm"
                                                    onClick={() => removeOption(i)}
                                                    style={{ color: 'var(--danger-400)', flexShrink: 0 }}
                                                >
                                                    <HiOutlineTrash />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                {!options.some(o => o.is_correct) && (
                                    <p style={{ fontSize: 'var(--font-xs)', color: 'var(--danger-400)', marginTop: 'var(--space-2)' }}>
                                        ⚠ Please mark at least one correct answer
                                    </p>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* True/False */}
                    {questionType === 'TRUE_FALSE' && (
                        <motion.div variants={item} className="card mb-6">
                            <div className="card-header">
                                <h3 className="card-title">Correct Answer *</h3>
                            </div>
                            <div className="card-body">
                                <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                                    {['True', 'False'].map(val => (
                                        <button
                                            key={val}
                                            type="button"
                                            onClick={() => setCorrectAnswer(val)}
                                            style={{
                                                flex: 1,
                                                padding: 'var(--space-4)',
                                                borderRadius: 'var(--radius-lg)',
                                                border: `2px solid ${correctAnswer === val ? (val === 'True' ? 'var(--success-400)' : 'var(--danger-400)') : 'var(--border-default)'}`,
                                                background: correctAnswer === val
                                                    ? (val === 'True' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(244, 63, 94, 0.08)')
                                                    : 'var(--bg-elevated)',
                                                color: correctAnswer === val ? 'var(--text-primary)' : 'var(--text-secondary)',
                                                cursor: 'pointer',
                                                transition: 'all var(--transition-fast)',
                                                fontSize: 'var(--font-md)',
                                                fontWeight: 700,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: 'var(--space-2)',
                                            }}
                                        >
                                            {val === 'True' ? '✅' : '❌'} {val}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Fill in Blank */}
                    {questionType === 'FILL_BLANK' && (
                        <motion.div variants={item} className="card mb-6">
                            <div className="card-header">
                                <h3 className="card-title">Correct Answer *</h3>
                            </div>
                            <div className="card-body">
                                <div className="form-group">
                                    <label className="form-label">Expected Answer (exact or keyword match)</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Enter the correct answer"
                                        value={correctAnswer}
                                        onChange={e => setCorrectAnswer(e.target.value)}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Explanation */}
                    <motion.div variants={item} className="card mb-6">
                        <div className="card-header">
                            <h3 className="card-title">Explanation (Optional)</h3>
                        </div>
                        <div className="card-body">
                            <textarea
                                className="form-input form-textarea"
                                placeholder="Provide an explanation that will be shown to students after the exam..."
                                value={explanation}
                                onChange={e => setExplanation(e.target.value)}
                                rows={4}
                            />
                        </div>
                    </motion.div>
                </div>

                {/* Preview Panel */}
                {showPreview && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <div className="card" style={{ position: 'sticky', top: 'calc(var(--header-height) + var(--space-8))' }}>
                            <div className="card-header">
                                <h3 className="card-title"><HiOutlineEye style={{ color: 'var(--primary-400)' }} /> Live Preview</h3>
                            </div>
                            <div className="card-body">
                                <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)', flexWrap: 'wrap' }}>
                                    {subject && <span className="badge badge-primary">{subject}</span>}
                                    {category && <span className="badge badge-default">{category}</span>}
                                    <span className={`badge ${difficulty === 'EASY' ? 'badge-success' : difficulty === 'MEDIUM' ? 'badge-warning' : 'badge-danger'}`}>
                                        {difficulty}
                                    </span>
                                    <span className="badge badge-primary">{marks} marks</span>
                                </div>

                                <div
                                    style={{
                                        fontSize: 'var(--font-md)',
                                        color: 'var(--text-primary)',
                                        lineHeight: 1.7,
                                        marginBottom: 'var(--space-5)',
                                        padding: 'var(--space-4)',
                                        background: 'var(--bg-elevated)',
                                        borderRadius: 'var(--radius-md)',
                                        borderLeft: '3px solid var(--primary-500)',
                                    }}
                                    dangerouslySetInnerHTML={{ __html: questionText || '<span style="color: var(--text-tertiary)">Your question will appear here...</span>' }}
                                />

                                {['MCQ_SINGLE', 'MCQ_MULTIPLE'].includes(questionType) && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                                        {options.filter(o => o.text).map((opt, i) => (
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
                                                    width: 22, height: 22, borderRadius: 'var(--radius-full)',
                                                    background: opt.is_correct ? 'var(--success-500)' : 'var(--bg-card)',
                                                    border: `1px solid ${opt.is_correct ? 'var(--success-400)' : 'var(--border-default)'}`,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: 'var(--font-xs)', fontWeight: 700, color: opt.is_correct ? 'white' : 'var(--text-secondary)',
                                                    flexShrink: 0,
                                                }}>
                                                    {String.fromCharCode(65 + i)}
                                                </span>
                                                <span style={{ fontSize: 'var(--font-sm)', color: 'var(--text-primary)' }}>{opt.text}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {questionType === 'TRUE_FALSE' && correctAnswer && (
                                    <div style={{
                                        padding: 'var(--space-3) var(--space-4)',
                                        background: 'rgba(16, 185, 129, 0.08)',
                                        borderRadius: 'var(--radius-md)',
                                        fontSize: 'var(--font-sm)',
                                        color: 'var(--success-400)',
                                        fontWeight: 600,
                                    }}>
                                        Answer: {correctAnswer}
                                    </div>
                                )}

                                {questionType === 'FILL_BLANK' && correctAnswer && (
                                    <div style={{
                                        padding: 'var(--space-3) var(--space-4)',
                                        background: 'rgba(16, 185, 129, 0.08)',
                                        borderRadius: 'var(--radius-md)',
                                        fontSize: 'var(--font-sm)',
                                        color: 'var(--success-400)',
                                        fontWeight: 600,
                                    }}>
                                        Answer: {correctAnswer}
                                    </div>
                                )}

                                {explanation && (
                                    <div style={{ marginTop: 'var(--space-4)' }}>
                                        <div style={{ fontSize: 'var(--font-xs)', fontWeight: 600, color: 'var(--text-tertiary)', marginBottom: 4 }}>
                                            💡 Explanation
                                        </div>
                                        <div style={{
                                            fontSize: 'var(--font-sm)',
                                            color: 'var(--text-secondary)',
                                            lineHeight: 1.6,
                                            padding: 'var(--space-3)',
                                            background: 'rgba(245, 158, 11, 0.06)',
                                            borderRadius: 'var(--radius-md)',
                                        }}>
                                            {explanation}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}
