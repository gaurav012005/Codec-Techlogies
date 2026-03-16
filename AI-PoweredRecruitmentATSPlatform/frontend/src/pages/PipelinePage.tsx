import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import './PipelinePage.css';

interface PipelineCandidate {
    id: string;
    name: string;
    headline: string;
    avatar: string;
    aiScore: number;
    skills: string[];
    appliedAt: string;
    source: string;
}

interface StageConfig {
    key: string;
    label: string;
    color: string;
    icon: string;
}

const stages: StageConfig[] = [
    { key: 'sourced', label: 'Sourced', color: '#6c5ce7', icon: '🔍' },
    { key: 'applied', label: 'Applied', color: '#74b9ff', icon: '📥' },
    { key: 'screening', label: 'Screening', color: '#00cec9', icon: '📋' },
    { key: 'interview', label: 'Interview', color: '#fdcb6e', icon: '🎤' },
    { key: 'offered', label: 'Offered', color: '#fd79a8', icon: '🎉' },
    { key: 'hired', label: 'Hired', color: '#00b894', icon: '✅' },
];

const initialPipeline: Record<string, PipelineCandidate[]> = {
    sourced: [],
    applied: [],
    screening: [],
    interview: [],
    offered: [],
    hired: [],
};

const PipelinePage = () => {
    const navigate = useNavigate();
    const [pipeline, setPipeline] = useState(initialPipeline);
    const [draggedCard, setDraggedCard] = useState<{ candidate: PipelineCandidate; fromStage: string } | null>(null);
    const [dragOverStage, setDragOverStage] = useState<string | null>(null);
    const [selectedJob, setSelectedJob] = useState('Senior Frontend Engineer');
    const dragCounter = useRef<Record<string, number>>({});

    useEffect(() => {
        const fetchCandidates = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch('/api/candidates', {
                    headers: token ? { 'Authorization': `Bearer ${token}` } : {},
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.candidates && data.candidates.length > 0) {
                        const newPipeline: Record<string, PipelineCandidate[]> = {
                            sourced: [], applied: [], screening: [], interview: [], offered: [], hired: []
                        };
                        data.candidates.forEach((c: any) => {
                            const stage = c.appliedJobs?.[0]?.stage || 'sourced';
                            const pCandidate: PipelineCandidate = {
                                id: c._id || c.id,
                                name: `${c.firstName} ${c.lastName}`,
                                headline: c.headline || '',
                                avatar: c.firstName ? `${c.firstName[0]}${c.lastName[0]}` : 'U',
                                aiScore: c.aiScore || 0,
                                skills: (c.skills || []).map((s: any) => s.name || s),
                                appliedAt: c.createdAt || new Date().toISOString(),
                                source: c.source || 'Direct'
                            };
                            if (newPipeline[stage]) {
                                newPipeline[stage].push(pCandidate);
                            } else {
                                newPipeline['sourced'].push(pCandidate);
                            }
                        });
                        setPipeline(newPipeline);
                    }
                }
            } catch (err) {
                console.error("Failed to load candidates for pipeline", err);
            }
        };
        fetchCandidates();
    }, []);

    const getScoreColor = (s: number) => s >= 90 ? '#00b894' : s >= 80 ? '#00cec9' : s >= 70 ? '#fdcb6e' : '#e17055';
    const totalCandidates = Object.values(pipeline).reduce((sum, arr) => sum + arr.length, 0);

    // Drag handlers
    const handleDragStart = (e: React.DragEvent, candidate: PipelineCandidate, fromStage: string) => {
        setDraggedCard({ candidate, fromStage });
        e.dataTransfer.effectAllowed = 'move';
        const el = e.currentTarget as HTMLElement;
        setTimeout(() => el.classList.add('dragging'), 0);
    };

    const handleDragEnd = (e: React.DragEvent) => {
        setDraggedCard(null);
        setDragOverStage(null);
        dragCounter.current = {};
        (e.currentTarget as HTMLElement).classList.remove('dragging');
    };

    const handleDragEnter = (e: React.DragEvent, stageKey: string) => {
        e.preventDefault();
        dragCounter.current[stageKey] = (dragCounter.current[stageKey] || 0) + 1;
        setDragOverStage(stageKey);
    };

    const handleDragLeave = (e: React.DragEvent, stageKey: string) => {
        e.preventDefault();
        dragCounter.current[stageKey] = (dragCounter.current[stageKey] || 0) - 1;
        if (dragCounter.current[stageKey] <= 0) {
            dragCounter.current[stageKey] = 0;
            if (dragOverStage === stageKey) setDragOverStage(null);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent, toStage: string) => {
        e.preventDefault();
        if (!draggedCard || draggedCard.fromStage === toStage) {
            setDragOverStage(null);
            dragCounter.current = {};
            return;
        }

        setPipeline(prev => {
            const fromList = [...prev[draggedCard.fromStage]].filter(c => c.id !== draggedCard.candidate.id);
            const toList = [...prev[toStage], draggedCard.candidate];
            return { ...prev, [draggedCard.fromStage]: fromList, [toStage]: toList };
        });

        setDragOverStage(null);
        setDraggedCard(null);
        dragCounter.current = {};
    };

    return (
        <DashboardLayout title="Pipeline">
            <div className="pipeline-page">
                {/* Header */}
                <div className="pipeline-header">
                    <div>
                        <h2>Hiring Pipeline</h2>
                        <p className="text-muted" style={{ fontSize: '14px' }}>{totalCandidates} candidates across {stages.length} stages</p>
                    </div>
                    <div className="pipeline-header__actions">
                        <select className="pipeline-job-select" value={selectedJob} onChange={e => setSelectedJob(e.target.value)} id="pipeline-job-select">
                            <option>Senior Frontend Engineer</option>
                            <option>UX Design Lead</option>
                            <option>Backend Engineer</option>
                            <option>Product Manager</option>
                            <option>Data Scientist</option>
                        </select>
                        <button className="btn btn-primary btn-sm" onClick={() => navigate('/dashboard/candidates/new')}>+ Add Candidate</button>
                    </div>
                </div>

                {/* Stage Stats */}
                <div className="pipeline-stats">
                    {stages.map(stage => (
                        <div key={stage.key} className="pipeline-stat" style={{ borderColor: stage.color }}>
                            <span className="pipeline-stat__icon">{stage.icon}</span>
                            <span className="pipeline-stat__count" style={{ color: stage.color }}>{pipeline[stage.key]?.length || 0}</span>
                            <span className="pipeline-stat__label">{stage.label}</span>
                        </div>
                    ))}
                </div>

                {/* Kanban Board */}
                <div className="kanban-board">
                    {stages.map(stage => (
                        <div
                            key={stage.key}
                            className={`kanban-column ${dragOverStage === stage.key ? 'kanban-column--drag-over' : ''}`}
                            onDragEnter={e => handleDragEnter(e, stage.key)}
                            onDragLeave={e => handleDragLeave(e, stage.key)}
                            onDragOver={handleDragOver}
                            onDrop={e => handleDrop(e, stage.key)}
                            id={`column-${stage.key}`}
                        >
                            {/* Column Header */}
                            <div className="kanban-column__header">
                                <div className="kanban-column__title">
                                    <span className="kanban-column__dot" style={{ background: stage.color }}></span>
                                    <span>{stage.label}</span>
                                    <span className="kanban-column__count">{pipeline[stage.key]?.length || 0}</span>
                                </div>
                            </div>

                            {/* Drop Zone Indicator */}
                            {dragOverStage === stage.key && draggedCard?.fromStage !== stage.key && (
                                <div className="kanban-drop-zone" style={{ borderColor: stage.color }}>
                                    <span>Drop here to move to {stage.label}</span>
                                </div>
                            )}

                            {/* Cards */}
                            <div className="kanban-column__cards">
                                {pipeline[stage.key]?.map(candidate => (
                                    <div
                                        key={candidate.id}
                                        className="kanban-card"
                                        draggable
                                        onDragStart={e => handleDragStart(e, candidate, stage.key)}
                                        onDragEnd={handleDragEnd}
                                        id={`card-${candidate.id}`}
                                    >
                                        <div className="kanban-card__top">
                                            <div className="kanban-card__avatar" style={{ background: `linear-gradient(135deg, ${stage.color}80, ${stage.color}40)` }}>
                                                {candidate.avatar}
                                            </div>
                                            <div className="kanban-card__info">
                                                <div className="kanban-card__name">{candidate.name}</div>
                                                <div className="kanban-card__headline">{candidate.headline}</div>
                                            </div>
                                        </div>

                                        <div className="kanban-card__skills">
                                            {candidate.skills.map((s, i) => (
                                                <span key={i} className="kanban-card__skill">{s}</span>
                                            ))}
                                        </div>

                                        <div className="kanban-card__bottom">
                                            <div className="kanban-card__score">
                                                <div className="kanban-card__score-bar">
                                                    <div style={{ width: `${candidate.aiScore}%`, background: getScoreColor(candidate.aiScore) }}></div>
                                                </div>
                                                <span style={{ color: getScoreColor(candidate.aiScore) }}>{candidate.aiScore}%</span>
                                            </div>
                                            <span className="kanban-card__source">{candidate.source}</span>
                                        </div>

                                        <div className="kanban-card__drag-handle">⠿</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default PipelinePage;
