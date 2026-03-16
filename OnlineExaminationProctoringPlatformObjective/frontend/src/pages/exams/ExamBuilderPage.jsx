import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_EXAMS } from './ExamListPage';
import { motion, AnimatePresence } from 'framer-motion';
import {
    HiOutlineArrowLeft,
    HiOutlineArrowRight,
    HiOutlineCheckCircle,
    HiOutlinePlus,
    HiOutlineTrash,
    HiOutlineSearch,
    HiOutlineClock,
    HiOutlineClipboardList,
    HiOutlineShieldCheck,
    HiOutlineLightningBolt,
    HiOutlineCalendar,
    HiOutlineLockClosed,
    HiOutlineSwitchHorizontal,
    HiOutlineEye,
    HiOutlineCollection,
    HiOutlineX,
} from 'react-icons/hi';

// Mock questions for selection
const AVAILABLE_QUESTIONS = [
    { id: '1', text: 'What is the derivative of x² + 3x + 5?', type: 'MCQ_SINGLE', subject: 'Mathematics', difficulty: 'EASY', marks: 2 },
    { id: '2', text: 'Newton\'s second law of motion states that F = ma.', type: 'TRUE_FALSE', subject: 'Physics', difficulty: 'EASY', marks: 1 },
    { id: '3', text: 'Explain polymorphism in OOP with examples.', type: 'SHORT_ANSWER', subject: 'Computer Science', difficulty: 'HARD', marks: 10 },
    { id: '4', text: 'The chemical formula of water is ______.', type: 'FILL_BLANK', subject: 'Chemistry', difficulty: 'EASY', marks: 1 },
    { id: '5', text: 'Which sorting algorithms are valid? Select all.', type: 'MCQ_MULTIPLE', subject: 'Computer Science', difficulty: 'MEDIUM', marks: 4 },
    { id: '6', text: 'What is the integral of cos(x)?', type: 'MCQ_SINGLE', subject: 'Mathematics', difficulty: 'MEDIUM', marks: 3 },
    { id: '7', text: 'Define Ohm\'s Law and derive V=IR.', type: 'SHORT_ANSWER', subject: 'Physics', difficulty: 'MEDIUM', marks: 8 },
    { id: '8', text: 'Solid to gas conversion is called ______.', type: 'FILL_BLANK', subject: 'Chemistry', difficulty: 'EASY', marks: 1 },
    { id: '9', text: 'What is the Big O notation of binary search?', type: 'MCQ_SINGLE', subject: 'Computer Science', difficulty: 'MEDIUM', marks: 2 },
    { id: '10', text: 'Explain the concept of entropy in thermodynamics.', type: 'SHORT_ANSWER', subject: 'Physics', difficulty: 'HARD', marks: 10 },
];

const typeLabels = {
    MCQ_SINGLE: 'MCQ',
    MCQ_MULTIPLE: 'MCQ-M',
    TRUE_FALSE: 'T/F',
    SHORT_ANSWER: 'Short',
    FILL_BLANK: 'Fill',
};

const diffColors = {
    EASY: 'badge-success',
    MEDIUM: 'badge-warning',
    HARD: 'badge-danger',
};

const steps = [
    { label: 'Exam Details', icon: HiOutlineClipboardList },
    { label: 'Configuration', icon: HiOutlineClock },
    { label: 'Select Questions', icon: HiOutlineCollection },
    { label: 'Review & Publish', icon: HiOutlineCheckCircle },
];

const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } }
};

const item = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0 }
};

export default function ExamBuilderPage() {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(0);

    // Step 1: Exam Details
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [subjectCategory, setSubjectCategory] = useState('');

    // Step 2: Configuration
    const [duration, setDuration] = useState(60);
    const [passingPercentage, setPassingPercentage] = useState(40);
    const [negativeMarking, setNegativeMarking] = useState(false);
    const [negativeMarkValue, setNegativeMarkValue] = useState(0.25);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [maxAttempts, setMaxAttempts] = useState(1);
    const [examPassword, setExamPassword] = useState('');
    const [shuffleQuestions, setShuffleQuestions] = useState(true);
    const [shuffleOptions, setShuffleOptions] = useState(true);
    const [showResultImmediately, setShowResultImmediately] = useState(true);
    const [allowReview, setAllowReview] = useState(true);
    const [adaptiveMode, setAdaptiveMode] = useState(false);
    const [proctoringEnabled, setProctoringEnabled] = useState(false);
    const [fullscreenRequired, setFullscreenRequired] = useState(false);

    // Step 3: Questions
    const [selectedQuestions, setSelectedQuestions] = useState([]);
    const [questionSearch, setQuestionSearch] = useState('');
    const [questionFilter, setQuestionFilter] = useState('');

    const filteredAvailable = AVAILABLE_QUESTIONS.filter(q => {
        const notSelected = !selectedQuestions.find(s => s.id === q.id);
        const matchSearch = q.text.toLowerCase().includes(questionSearch.toLowerCase()) ||
            q.subject.toLowerCase().includes(questionSearch.toLowerCase());
        const matchFilter = !questionFilter || q.subject === questionFilter;
        return notSelected && matchSearch && matchFilter;
    });

    const totalMarks = selectedQuestions.reduce((sum, q) => sum + q.marks, 0);
    const subjects = [...new Set(AVAILABLE_QUESTIONS.map(q => q.subject))];

    const addQuestion = (q) => setSelectedQuestions(prev => [...prev, q]);
    const removeQuestion = (id) => setSelectedQuestions(prev => prev.filter(q => q.id !== id));

    const canProceed = () => {
        switch (currentStep) {
            case 0: return title && subjectCategory;
            case 1: return duration > 0 && startDate;
            case 2: return selectedQuestions.length > 0;
            case 3: return true;
            default: return true;
        }
    };

    const saveExam = (status = 'DRAFT') => {
        const examData = {
            id: Date.now().toString(),
            title: title || 'Untitled Exam',
            subject: subjectCategory || 'General',
            description,
            duration: Number(duration),
            passingPercentage: Number(passingPercentage),
            negativeMarking,
            negativeMarkValue: Number(negativeMarkValue),
            startDate,
            endDate,
            maxAttempts: Number(maxAttempts),
            examPassword,
            shuffleQuestions,
            shuffleOptions,
            showResultImmediately,
            allowReview,
            adaptive: adaptiveMode,
            proctoring: proctoringEnabled,
            fullscreenRequired,
            assignedStudents: 0,
            status,
            totalMarks,
            totalQuestions: selectedQuestions.length,
            createdBy: 'Current User',
        };

        const saved = localStorage.getItem('exams_list');
        const prevExams = saved ? JSON.parse(saved) : MOCK_EXAMS;
        localStorage.setItem('exams_list', JSON.stringify([examData, ...prevExams]));

        navigate('/dashboard/exams');
    };

    const handlePublish = () => saveExam('PUBLISHED');
    const handleDraft = () => saveExam('DRAFT');

    const ToggleSwitch = ({ value, onChange, label, desc }) => (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 'var(--space-3) 0',
            borderBottom: '1px solid var(--border-subtle)',
        }}>
            <div>
                <div style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>{label}</div>
                {desc && <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)', marginTop: 2 }}>{desc}</div>}
            </div>
            <div
                className={`form-switch ${value ? 'active' : ''}`}
                onClick={() => onChange(!value)}
            />
        </div>
    );

    return (
        <motion.div variants={container} initial="hidden" animate="show">
            {/* Header */}
            <motion.div variants={item} className="page-header">
                <div className="page-header-left">
                    <button className="btn btn-ghost" onClick={() => navigate('/dashboard/exams')} style={{ marginBottom: 'var(--space-2)' }}>
                        <HiOutlineArrowLeft /> Back to Exams
                    </button>
                    <h1 className="page-title">Create New Exam</h1>
                    <p className="page-subtitle">Set up your exam in 4 simple steps</p>
                </div>
            </motion.div>

            {/* Stepper */}
            <motion.div variants={item} className="stepper">
                {steps.map((step, i) => {
                    const Icon = step.icon;
                    return (
                        <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                            <div className={`stepper-step ${i === currentStep ? 'active' : i < currentStep ? 'completed' : ''}`}>
                                <div className="stepper-circle">
                                    {i < currentStep ? <HiOutlineCheckCircle /> : i + 1}
                                </div>
                                <span className="stepper-label">{step.label}</span>
                            </div>
                            {i < steps.length - 1 && (
                                <div className={`stepper-line ${i < currentStep ? 'completed' : ''}`} />
                            )}
                        </div>
                    );
                })}
            </motion.div>

            {/* Step Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                >
                    {/* Step 1: Exam Details */}
                    {currentStep === 0 && (
                        <div className="card">
                            <div className="card-header">
                                <h3 className="card-title">
                                    <HiOutlineClipboardList style={{ color: 'var(--primary-400)' }} /> Exam Details
                                </h3>
                            </div>
                            <div className="card-body">
                                <div className="form-group">
                                    <label className="form-label">Exam Title *</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="e.g. Advanced Calculus Mid-Term Exam"
                                        value={title}
                                        onChange={e => setTitle(e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Description</label>
                                    <textarea
                                        className="form-input form-textarea"
                                        placeholder="Provide exam instructions, rules, and any additional information for students..."
                                        value={description}
                                        onChange={e => setDescription(e.target.value)}
                                        rows={4}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Subject / Category *</label>
                                    <select
                                        className="form-input form-select"
                                        value={subjectCategory}
                                        onChange={e => setSubjectCategory(e.target.value)}
                                    >
                                        <option value="">Select subject</option>
                                        <option value="Mathematics">Mathematics</option>
                                        <option value="Physics">Physics</option>
                                        <option value="Chemistry">Chemistry</option>
                                        <option value="Computer Science">Computer Science</option>
                                        <option value="English">English</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Configuration */}
                    {currentStep === 1 && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)' }}>
                            <div className="card">
                                <div className="card-header">
                                    <h3 className="card-title"><HiOutlineClock style={{ color: 'var(--warning-400)' }} /> Timing & Attempts</h3>
                                </div>
                                <div className="card-body">
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                                        <div className="form-group">
                                            <label className="form-label">Duration (minutes) *</label>
                                            <input type="number" className="form-input" min={5} value={duration} onChange={e => setDuration(Number(e.target.value))} />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Max Attempts</label>
                                            <input type="number" className="form-input" min={1} value={maxAttempts} onChange={e => setMaxAttempts(Number(e.target.value))} />
                                        </div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                                        <div className="form-group">
                                            <label className="form-label">Start Date & Time *</label>
                                            <input type="datetime-local" className="form-input" value={startDate} onChange={e => setStartDate(e.target.value)} />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">End Date & Time</label>
                                            <input type="datetime-local" className="form-input" value={endDate} onChange={e => setEndDate(e.target.value)} />
                                        </div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                                        <div className="form-group">
                                            <label className="form-label">Passing Percentage (%)</label>
                                            <input type="number" className="form-input" min={0} max={100} value={passingPercentage} onChange={e => setPassingPercentage(Number(e.target.value))} />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label"><HiOutlineLockClosed style={{ fontSize: 14, verticalAlign: -2 }} /> Exam Password</label>
                                            <input type="text" className="form-input" placeholder="Optional" value={examPassword} onChange={e => setExamPassword(e.target.value)} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="card">
                                <div className="card-header">
                                    <h3 className="card-title"><HiOutlineSwitchHorizontal style={{ color: 'var(--primary-400)' }} /> Options</h3>
                                </div>
                                <div className="card-body">
                                    <ToggleSwitch label="Negative Marking" desc="Deduct marks for wrong answers" value={negativeMarking} onChange={setNegativeMarking} />
                                    {negativeMarking && (
                                        <div className="form-group" style={{ padding: 'var(--space-3) 0' }}>
                                            <label className="form-label" style={{ fontSize: 'var(--font-xs)' }}>Deduction per wrong answer</label>
                                            <input type="number" className="form-input" min={0} step={0.25} value={negativeMarkValue} onChange={e => setNegativeMarkValue(Number(e.target.value))} style={{ height: 32 }} />
                                        </div>
                                    )}
                                    <ToggleSwitch label="Shuffle Questions" desc="Randomize question order for each student" value={shuffleQuestions} onChange={setShuffleQuestions} />
                                    <ToggleSwitch label="Shuffle Options" desc="Randomize MCQ option order" value={shuffleOptions} onChange={setShuffleOptions} />
                                    <ToggleSwitch label="Show Results Immediately" desc="Students see scores right after submission" value={showResultImmediately} onChange={setShowResultImmediately} />
                                    <ToggleSwitch label="Allow Answer Review" desc="Students can review answers after exam" value={allowReview} onChange={setAllowReview} />
                                    <ToggleSwitch label="Adaptive Difficulty" desc="Question difficulty adapts based on performance" value={adaptiveMode} onChange={setAdaptiveMode} />
                                    <ToggleSwitch label="Enable Proctoring" desc="Webcam monitoring during exam" value={proctoringEnabled} onChange={setProctoringEnabled} />
                                    {proctoringEnabled && (
                                        <ToggleSwitch label="Require Fullscreen" desc="Force fullscreen mode during exam" value={fullscreenRequired} onChange={setFullscreenRequired} />
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Select Questions */}
                    {currentStep === 2 && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)' }}>
                            {/* Available Questions */}
                            <div className="card">
                                <div className="card-header">
                                    <h3 className="card-title">
                                        <HiOutlineCollection style={{ color: 'var(--primary-400)' }} /> Available Questions
                                    </h3>
                                    <span className="badge badge-default">{filteredAvailable.length}</span>
                                </div>
                                <div className="card-body" style={{ padding: 'var(--space-3) var(--space-4)' }}>
                                    <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
                                        <div className="filter-search" style={{ flex: 1 }}>
                                            <span className="filter-search-icon"><HiOutlineSearch /></span>
                                            <input
                                                type="text"
                                                placeholder="Search questions..."
                                                value={questionSearch}
                                                onChange={e => setQuestionSearch(e.target.value)}
                                                style={{ height: 32, fontSize: 'var(--font-xs)' }}
                                            />
                                        </div>
                                        <select
                                            className="filter-select"
                                            value={questionFilter}
                                            onChange={e => setQuestionFilter(e.target.value)}
                                            style={{ height: 32, minWidth: 100, fontSize: 'var(--font-xs)' }}
                                        >
                                            <option value="">All</option>
                                            {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div style={{ maxHeight: 400, overflowY: 'auto', padding: '0 var(--space-4) var(--space-4)' }}>
                                    {filteredAvailable.map(q => (
                                        <div
                                            key={q.id}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 'var(--space-3)',
                                                padding: 'var(--space-3)',
                                                marginBottom: 'var(--space-2)',
                                                background: 'var(--bg-elevated)',
                                                borderRadius: 'var(--radius-md)',
                                                border: '1px solid var(--border-subtle)',
                                                cursor: 'pointer',
                                                transition: 'all var(--transition-fast)',
                                            }}
                                            onClick={() => addQuestion(q)}
                                            onMouseOver={e => e.currentTarget.style.borderColor = 'var(--primary-500)'}
                                            onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
                                        >
                                            <div style={{ flex: 1, overflow: 'hidden' }}>
                                                <div style={{ fontSize: 'var(--font-sm)', fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {q.text}
                                                </div>
                                                <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 4 }}>
                                                    <span className="badge badge-default" style={{ fontSize: '0.625rem' }}>{typeLabels[q.type]}</span>
                                                    <span className={`badge ${diffColors[q.difficulty]}`} style={{ fontSize: '0.625rem' }}>{q.difficulty}</span>
                                                    <span className="badge badge-primary" style={{ fontSize: '0.625rem' }}>{q.marks}m</span>
                                                </div>
                                            </div>
                                            <button className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--primary-400)', flexShrink: 0 }}>
                                                <HiOutlinePlus />
                                            </button>
                                        </div>
                                    ))}
                                    {filteredAvailable.length === 0 && (
                                        <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-tertiary)', fontSize: 'var(--font-sm)' }}>
                                            No more questions available
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Selected Questions */}
                            <div className="card">
                                <div className="card-header">
                                    <h3 className="card-title">
                                        <HiOutlineCheckCircle style={{ color: 'var(--success-400)' }} /> Selected Questions
                                    </h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                        <span className="badge badge-success">{selectedQuestions.length} questions</span>
                                        <span className="badge badge-primary">{totalMarks} marks</span>
                                    </div>
                                </div>
                                <div style={{ maxHeight: 480, overflowY: 'auto', padding: 'var(--space-4)' }}>
                                    {selectedQuestions.length === 0 && (
                                        <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
                                            <div className="empty-state-icon" style={{ width: 60, height: 60, fontSize: 24 }}><HiOutlineCollection /></div>
                                            <div className="empty-state-title" style={{ fontSize: 'var(--font-sm)' }}>No questions selected</div>
                                            <div className="empty-state-desc" style={{ fontSize: 'var(--font-xs)' }}>
                                                Click on questions from the left panel to add them
                                            </div>
                                        </div>
                                    )}
                                    {selectedQuestions.map((q, i) => (
                                        <motion.div
                                            key={q.id}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 'var(--space-3)',
                                                padding: 'var(--space-3)',
                                                marginBottom: 'var(--space-2)',
                                                background: 'rgba(16, 185, 129, 0.04)',
                                                borderRadius: 'var(--radius-md)',
                                                border: '1px solid rgba(16, 185, 129, 0.15)',
                                            }}
                                        >
                                            <span style={{
                                                width: 24, height: 24, borderRadius: 'var(--radius-full)',
                                                background: 'var(--success-500)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: 'var(--font-xs)', fontWeight: 700, color: 'white', flexShrink: 0,
                                            }}>
                                                {i + 1}
                                            </span>
                                            <div style={{ flex: 1, overflow: 'hidden' }}>
                                                <div style={{ fontSize: 'var(--font-sm)', fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {q.text}
                                                </div>
                                                <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 4 }}>
                                                    <span className="badge badge-default" style={{ fontSize: '0.625rem' }}>{q.subject}</span>
                                                    <span className="badge badge-primary" style={{ fontSize: '0.625rem' }}>{q.marks}m</span>
                                                </div>
                                            </div>
                                            <button
                                                className="btn btn-ghost btn-icon btn-sm"
                                                style={{ color: 'var(--danger-400)', flexShrink: 0 }}
                                                onClick={() => removeQuestion(q.id)}
                                            >
                                                <HiOutlineX />
                                            </button>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Review & Publish */}
                    {currentStep === 3 && (
                        <div className="card">
                            <div className="card-header">
                                <h3 className="card-title">
                                    <HiOutlineEye style={{ color: 'var(--primary-400)' }} /> Review Exam Configuration
                                </h3>
                            </div>
                            <div className="card-body">
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-8)' }}>
                                    {/* Left Column */}
                                    <div>
                                        <h4 style={{ fontSize: 'var(--font-sm)', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-4)' }}>
                                            Exam Details
                                        </h4>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                                            {[
                                                ['Title', title],
                                                ['Subject', subjectCategory],
                                                ['Duration', `${duration} minutes`],
                                                ['Total Questions', selectedQuestions.length],
                                                ['Total Marks', totalMarks],
                                                ['Passing %', `${passingPercentage}%`],
                                                ['Max Attempts', maxAttempts],
                                                ['Start', startDate ? new Date(startDate).toLocaleString() : 'Not set'],
                                                ['End', endDate ? new Date(endDate).toLocaleString() : 'Not set'],
                                            ].map(([label, value]) => (
                                                <div key={label} style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    padding: 'var(--space-2) 0',
                                                    borderBottom: '1px solid var(--border-subtle)',
                                                }}>
                                                    <span style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)' }}>{label}</span>
                                                    <span style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>{value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Right Column */}
                                    <div>
                                        <h4 style={{ fontSize: 'var(--font-sm)', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-4)' }}>
                                            Configuration Flags
                                        </h4>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                                            {[
                                                ['Negative Marking', negativeMarking],
                                                ['Shuffle Questions', shuffleQuestions],
                                                ['Shuffle Options', shuffleOptions],
                                                ['Show Results Immediately', showResultImmediately],
                                                ['Allow Review', allowReview],
                                                ['Adaptive Mode', adaptiveMode],
                                                ['Proctoring', proctoringEnabled],
                                                ['Fullscreen Required', fullscreenRequired],
                                                ['Password Protected', !!examPassword],
                                            ].map(([label, value]) => (
                                                <div key={label} style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    padding: 'var(--space-2) 0',
                                                    borderBottom: '1px solid var(--border-subtle)',
                                                }}>
                                                    <span style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)' }}>{label}</span>
                                                    <span className={`badge ${value ? 'badge-success' : 'badge-default'}`}>
                                                        {value ? 'Enabled' : 'Disabled'}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>

                                        {description && (
                                            <div style={{ marginTop: 'var(--space-6)' }}>
                                                <h4 style={{ fontSize: 'var(--font-sm)', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-2)' }}>
                                                    Description
                                                </h4>
                                                <div style={{
                                                    fontSize: 'var(--font-sm)',
                                                    color: 'var(--text-secondary)',
                                                    padding: 'var(--space-3)',
                                                    background: 'var(--bg-elevated)',
                                                    borderRadius: 'var(--radius-md)',
                                                    lineHeight: 1.6,
                                                }}>
                                                    {description}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Questions Summary */}
                                <div style={{ marginTop: 'var(--space-8)' }}>
                                    <h4 style={{ fontSize: 'var(--font-sm)', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-4)' }}>
                                        Selected Questions ({selectedQuestions.length})
                                    </h4>
                                    <div className="table-container">
                                        <table className="data-table">
                                            <thead>
                                                <tr>
                                                    <th>#</th>
                                                    <th>Question</th>
                                                    <th>Type</th>
                                                    <th>Subject</th>
                                                    <th>Difficulty</th>
                                                    <th>Marks</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedQuestions.map((q, i) => (
                                                    <tr key={q.id}>
                                                        <td>{i + 1}</td>
                                                        <td style={{ maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.text}</td>
                                                        <td><span className="badge badge-primary">{typeLabels[q.type]}</span></td>
                                                        <td>{q.subject}</td>
                                                        <td><span className={`badge ${diffColors[q.difficulty]}`}>{q.difficulty}</span></td>
                                                        <td style={{ fontWeight: 600 }}>{q.marks}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <motion.div
                variants={item}
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: 'var(--space-8)',
                    paddingTop: 'var(--space-6)',
                    borderTop: '1px solid var(--border-subtle)',
                }}
            >
                <button
                    className="btn btn-secondary"
                    onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                    disabled={currentStep === 0}
                >
                    <HiOutlineArrowLeft /> Previous
                </button>
                <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                    {currentStep < 3 ? (
                        <button
                            className="btn btn-primary"
                            onClick={() => setCurrentStep(Math.min(3, currentStep + 1))}
                            disabled={!canProceed()}
                        >
                            Next <HiOutlineArrowRight />
                        </button>
                    ) : (
                        <>
                            <button className="btn btn-secondary" onClick={handleDraft}>
                                Save as Draft
                            </button>
                            <button className="btn btn-success btn-lg" onClick={handlePublish}>
                                <HiOutlineLightningBolt /> Publish Exam
                            </button>
                        </>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
}
