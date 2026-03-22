import { useState, useEffect, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import api from '../api/axios';
import {
    Plus, DollarSign, User, Building2, Calendar, MoreHorizontal,
    X, TrendingUp, Target, ArrowUpRight, Percent, GripVertical
} from 'lucide-react';
import DealWonConfetti from '../components/DealWonConfetti';

const Pipeline = () => {
    const [pipelines, setPipelines] = useState([]);
    const [activePipeline, setActivePipeline] = useState(null);
    const [columns, setColumns] = useState({});
    const [loading, setLoading] = useState(true);
    const [showDealModal, setShowDealModal] = useState(false);
    const [forecast, setForecast] = useState(null);
    const [showConfetti, setShowConfetti] = useState(false);

    const fetchPipelines = useCallback(async () => {
        try {
            const { data } = await api.get('/pipelines');
            setPipelines(data.data);
            if (data.data.length > 0 && !activePipeline) {
                setActivePipeline(data.data[0]);
            }
        } catch (err) { console.error(err); }
    }, []);

    const fetchBoard = useCallback(async () => {
        if (!activePipeline) return;
        try {
            setLoading(true);
            const { data } = await api.get(`/deals/board/${activePipeline._id}`);
            setColumns(data.data.columns);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    }, [activePipeline]);

    const fetchForecast = useCallback(async () => {
        try {
            const { data } = await api.get('/deals/forecast');
            setForecast(data.data);
        } catch (err) { /* ignore */ }
    }, []);

    useEffect(() => { fetchPipelines(); fetchForecast(); }, [fetchPipelines, fetchForecast]);
    useEffect(() => { fetchBoard(); }, [fetchBoard]);

    const handleDragEnd = async (result) => {
        const { draggableId, source, destination } = result;
        if (!destination || (source.droppableId === destination.droppableId && source.index === destination.index)) return;

        // Optimistic update
        const newColumns = { ...columns };
        const sourceDeals = [...newColumns[source.droppableId].deals];
        const [movedDeal] = sourceDeals.splice(source.index, 1);
        newColumns[source.droppableId] = { ...newColumns[source.droppableId], deals: sourceDeals };

        const destDeals = [...(newColumns[destination.droppableId]?.deals || [])];
        movedDeal.stage = destination.droppableId;
        destDeals.splice(destination.index, 0, movedDeal);
        newColumns[destination.droppableId] = { ...newColumns[destination.droppableId], deals: destDeals };

        setColumns(newColumns);

        try {
            await api.put(`/deals/${draggableId}/stage`, { stage: destination.droppableId });
            fetchForecast();
            // Trigger confetti if moved to a "Won" stage
            if (destination.droppableId.toLowerCase().includes('won')) {
                setShowConfetti(true);
            }
        } catch (err) {
            fetchBoard(); // revert on error
        }
    };

    const handleDealCreated = () => {
        setShowDealModal(false);
        fetchBoard();
        fetchForecast();
    };

    const getStageValue = (deals) => deals.reduce((s, d) => s + (d.value || 0), 0);

    const formatValue = (v) => {
        if (v >= 1000000) return `$${(v / 1000000).toFixed(1)}M`;
        if (v >= 1000) return `$${(v / 1000).toFixed(1)}K`;
        return `$${v}`;
    };

    const getProbColor = (prob) => {
        if (prob >= 75) return '#10b981';
        if (prob >= 50) return '#f59e0b';
        if (prob >= 25) return '#06b6d4';
        return '#64748b';
    };

    if (loading && Object.keys(columns).length === 0) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
                <div className="spinner" style={{ width: 40, height: 40, borderColor: 'rgba(99,102,241,0.2)', borderTopColor: 'var(--primary-400)', borderWidth: 3 }} />
            </div>
        );
    }

    return (
        <div style={{ height: 'calc(100vh - 64px)' }}>
            {/* Header */}
            <div className="page-header" style={{ marginBottom: 'var(--space-4)' }}>
                <div>
                    <h1 className="page-title">Sales Pipeline</h1>
                    <p className="page-subtitle">Drag deals between stages to update their progress</p>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
                    {pipelines.length > 1 && (
                        <select className="form-input form-input-no-icon" style={{ width: 'auto', paddingLeft: '0.75rem' }}
                            value={activePipeline?._id || ''} onChange={e => setActivePipeline(pipelines.find(p => p._id === e.target.value))}>
                            {pipelines.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                        </select>
                    )}
                    <button className="btn btn-primary" onClick={() => setShowDealModal(true)}>
                        <Plus size={18} /> New Deal
                    </button>
                </div>
            </div>

            {/* Forecast KPIs */}
            {forecast && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-4)', marginBottom: 'var(--space-5)' }}>
                    {[
                        { label: 'Pipeline Value', value: formatValue(forecast.totalPipeline), icon: DollarSign, color: 'indigo' },
                        { label: 'Weighted Forecast', value: formatValue(forecast.weightedForecast), icon: TrendingUp, color: 'emerald' },
                        { label: 'Total Won', value: formatValue(forecast.totalWon), icon: Target, color: 'cyan' },
                        { label: 'Open Deals', value: forecast.dealCount.open, icon: ArrowUpRight, color: 'amber' },
                    ].map(k => (
                        <div key={k.label} className="kpi-card" style={{ padding: 'var(--space-4)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div><div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', marginBottom: 4 }}>{k.label}</div>
                                    <div style={{ fontSize: 'var(--font-xl)', fontWeight: 700 }}>{k.value}</div></div>
                                <div className={`kpi-icon ${k.color}`}><k.icon size={18} /></div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Kanban Board */}
            <DragDropContext onDragEnd={handleDragEnd}>
                <div style={{
                    display: 'flex', gap: 'var(--space-3)', overflowX: 'auto',
                    paddingBottom: 'var(--space-4)', minHeight: 400,
                }}>
                    {Object.keys(columns).map((stageName) => {
                        const col = columns[stageName];
                        const stageVal = getStageValue(col.deals);
                        return (
                            <div key={stageName} style={{
                                minWidth: 280, maxWidth: 320, flex: '0 0 280px',
                                display: 'flex', flexDirection: 'column',
                            }}>
                                {/* Stage Header */}
                                <div style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: 'var(--space-3) var(--space-4)',
                                    background: 'var(--glass-bg)', backdropFilter: 'var(--glass-blur)',
                                    borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
                                    borderTop: `3px solid ${col.stage?.color || '#6366f1'}`,
                                    border: '1px solid var(--glass-border)', borderBottom: 'none',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                        <div style={{
                                            width: 8, height: 8, borderRadius: '50%',
                                            background: col.stage?.color || '#6366f1',
                                        }} />
                                        <span style={{ fontWeight: 600, fontSize: 'var(--font-sm)' }}>{stageName}</span>
                                        <span style={{
                                            fontSize: 'var(--font-xs)', background: 'var(--bg-tertiary)',
                                            padding: '1px 8px', borderRadius: 'var(--radius-full)',
                                            color: 'var(--text-muted)',
                                        }}>{col.deals.length}</span>
                                    </div>
                                    <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', fontWeight: 600 }}>
                                        {formatValue(stageVal)}
                                    </span>
                                </div>

                                {/* Droppable Area */}
                                <Droppable droppableId={stageName}>
                                    {(provided, snapshot) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                            style={{
                                                flex: 1, padding: 'var(--space-2)',
                                                background: snapshot.isDraggingOver ? 'rgba(99,102,241,0.08)' : 'rgba(26,26,62,0.3)',
                                                border: '1px solid var(--border-subtle)',
                                                borderTop: 'none',
                                                borderRadius: '0 0 var(--radius-lg) var(--radius-lg)',
                                                minHeight: 200,
                                                transition: 'background 0.2s ease',
                                                overflowY: 'auto',
                                                maxHeight: 'calc(100vh - 350px)',
                                            }}
                                        >
                                            {col.deals.map((deal, index) => (
                                                <Draggable key={deal._id} draggableId={deal._id} index={index}>
                                                    {(provided, snapshot) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            style={{
                                                                ...provided.draggableProps.style,
                                                                padding: 'var(--space-3)',
                                                                marginBottom: 'var(--space-2)',
                                                                background: snapshot.isDragging ? 'var(--bg-secondary)' : 'var(--glass-bg)',
                                                                backdropFilter: 'var(--glass-blur)',
                                                                border: `1px solid ${snapshot.isDragging ? 'var(--primary-400)' : 'var(--border-subtle)'}`,
                                                                borderRadius: 'var(--radius-md)',
                                                                cursor: 'grab',
                                                                transition: 'border-color 0.15s, box-shadow 0.15s',
                                                                boxShadow: snapshot.isDragging ? 'var(--shadow-glow)' : 'none',
                                                            }}
                                                        >
                                                            {/* Deal Title */}
                                                            <div style={{ fontWeight: 600, fontSize: 'var(--font-sm)', marginBottom: 6, color: 'var(--text-primary)' }}>
                                                                {deal.title}
                                                            </div>
                                                            {/* Deal Value */}
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 6 }}>
                                                                <DollarSign size={13} style={{ color: 'var(--accent-emerald)' }} />
                                                                <span style={{ fontWeight: 700, fontSize: 'var(--font-sm)', color: 'var(--accent-emerald)' }}>
                                                                    {deal.value?.toLocaleString() || '0'}
                                                                </span>
                                                                <span style={{
                                                                    marginLeft: 'auto', fontSize: '0.65rem', fontWeight: 600,
                                                                    padding: '1px 6px', borderRadius: 'var(--radius-full)',
                                                                    background: `${getProbColor(deal.probability)}22`,
                                                                    color: getProbColor(deal.probability),
                                                                }}>
                                                                    {deal.probability}%
                                                                </span>
                                                            </div>
                                                            {/* Deal Meta */}
                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 3, fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                                                {deal.companyId?.name && (
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                                        <Building2 size={11} /> {deal.companyId.name}
                                                                    </div>
                                                                )}
                                                                {deal.contactId?.name && (
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                                        <User size={11} /> {deal.contactId.name}
                                                                    </div>
                                                                )}
                                                                {deal.expectedCloseDate && (
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                                        <Calendar size={11} /> {new Date(deal.expectedCloseDate).toLocaleDateString()}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            {/* Owner */}
                                                            {deal.ownerId && (
                                                                <div style={{
                                                                    display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                                                                    marginTop: 8, paddingTop: 6, borderTop: '1px solid var(--border-subtle)',
                                                                }}>
                                                                    <div style={{
                                                                        width: 20, height: 20, borderRadius: '50%',
                                                                        background: 'linear-gradient(135deg, var(--primary-500), var(--accent-violet))',
                                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                        fontSize: '0.55rem', fontWeight: 700, color: 'white',
                                                                    }}>
                                                                        {deal.ownerId.name?.[0]?.toUpperCase() || '?'}
                                                                    </div>
                                                                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{deal.ownerId.name}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            </div>
                        );
                    })}
                </div>
            </DragDropContext>

            {/* New Deal Modal */}
            {showDealModal && activePipeline && (
                <DealModal
                    pipeline={activePipeline}
                    onSave={handleDealCreated}
                    onClose={() => setShowDealModal(false)}
                />
            )}

            {/* Deal Won Confetti */}
            <DealWonConfetti show={showConfetti} onComplete={() => setShowConfetti(false)} />
        </div>
    );
};

// Deal creation modal
const DealModal = ({ pipeline, onSave, onClose }) => {
    const [form, setForm] = useState({
        title: '', value: '', stage: pipeline.stages[0]?.name || '',
        pipelineId: pipeline._id, expectedCloseDate: '', notes: '', priority: 'medium',
    });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.post('/deals', { ...form, value: parseFloat(form.value) || 0 });
            onSave();
        } catch (err) { alert(err.response?.data?.message || 'Failed to create deal'); }
        finally { setSaving(false); }
    };

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, animation: 'fadeIn 0.2s ease-out' }} onClick={onClose}>
            <div className="auth-card" style={{ maxWidth: 500, width: '100%', margin: 'var(--space-4)' }} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
                    <h2 style={{ fontSize: 'var(--font-xl)', fontWeight: 700 }}>New Deal</h2>
                    <button className="btn btn-ghost btn-sm" onClick={onClose}><X size={18} /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group"><label className="form-label">Deal Title *</label>
                        <input className="form-input form-input-no-icon" required value={form.title}
                            onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Enterprise license deal" /></div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                        <div className="form-group"><label className="form-label">Value ($)</label>
                            <input className="form-input form-input-no-icon" type="number" min="0" value={form.value}
                                onChange={e => setForm(f => ({ ...f, value: e.target.value }))} placeholder="25000" /></div>
                        <div className="form-group"><label className="form-label">Stage</label>
                            <select className="form-input form-input-no-icon" value={form.stage}
                                onChange={e => setForm(f => ({ ...f, stage: e.target.value }))}>
                                {pipeline.stages.map(s => <option key={s.name} value={s.name}>{s.name} ({s.probability}%)</option>)}
                            </select></div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                        <div className="form-group"><label className="form-label">Expected Close</label>
                            <input className="form-input form-input-no-icon" type="date" value={form.expectedCloseDate}
                                onChange={e => setForm(f => ({ ...f, expectedCloseDate: e.target.value }))} /></div>
                        <div className="form-group"><label className="form-label">Priority</label>
                            <select className="form-input form-input-no-icon" value={form.priority}
                                onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                                <option value="low">Low</option><option value="medium">Medium</option>
                                <option value="high">High</option><option value="critical">Critical</option>
                            </select></div>
                    </div>
                    <div className="form-group"><label className="form-label">Notes</label>
                        <textarea className="form-input form-input-no-icon" rows={2} value={form.notes}
                            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} style={{ resize: 'vertical' }} /></div>
                    <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end', marginTop: 'var(--space-4)' }}>
                        <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? <span className="spinner" /> : 'Create Deal'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Pipeline;
