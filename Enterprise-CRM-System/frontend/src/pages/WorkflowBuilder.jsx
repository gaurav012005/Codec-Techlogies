import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import {
    ArrowLeft, Save, Plus, Trash2, Zap, Clock, GitBranch,
    Mail, ListTodo, Bell, Tag, UserPlus, Edit, ChevronDown, ChevronUp
} from 'lucide-react';

const TRIGGER_OPTIONS = [
    { value: 'lead_created', label: 'Lead Created', icon: '🎯' },
    { value: 'deal_stage_changed', label: 'Deal Stage Changed', icon: '📊' },
    { value: 'deal_created', label: 'Deal Created', icon: '💼' },
    { value: 'deal_won', label: 'Deal Won', icon: '🏆' },
    { value: 'deal_lost', label: 'Deal Lost', icon: '❌' },
    { value: 'task_overdue', label: 'Task Overdue', icon: '⏰' },
    { value: 'score_threshold', label: 'Score Threshold Reached', icon: '📈' },
    { value: 'manual', label: 'Manual Trigger', icon: '👆' },
];

const ACTION_OPTIONS = [
    { value: 'create_task', label: 'Create Task', icon: ListTodo, color: 'var(--primary-400)' },
    { value: 'send_email', label: 'Send Email', icon: Mail, color: 'var(--accent-cyan)' },
    { value: 'create_notification', label: 'Send Notification', icon: Bell, color: 'var(--accent-amber)' },
    { value: 'update_field', label: 'Update Field', icon: Edit, color: 'var(--accent-violet)' },
    { value: 'assign_owner', label: 'Assign Owner', icon: UserPlus, color: 'var(--accent-emerald)' },
    { value: 'add_tag', label: 'Add Tag', icon: Tag, color: 'var(--accent-rose)' },
];

const DELAY_UNITS = [
    { value: 'minutes', label: 'Minutes' },
    { value: 'hours', label: 'Hours' },
    { value: 'days', label: 'Days' },
];

const OPERATORS = [
    { value: 'equals', label: '= Equals' },
    { value: 'not_equals', label: '≠ Not Equals' },
    { value: 'greater_than', label: '> Greater Than' },
    { value: 'less_than', label: '< Less Than' },
    { value: 'contains', label: '∋ Contains' },
];

const WorkflowBuilder = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [saving, setSaving] = useState(false);
    const [workflow, setWorkflow] = useState({
        name: '',
        description: '',
        trigger: { type: 'lead_created', conditions: [] },
        steps: [],
    });
    const [expandedStep, setExpandedStep] = useState(null);

    useEffect(() => {
        if (id) fetchWorkflow();
    }, [id]);

    const fetchWorkflow = async () => {
        try {
            const { data } = await api.get(`/workflows/${id}`);
            if (data.data) setWorkflow(data.data);
        } catch (err) { console.error(err); }
    };

    const updateField = (field, value) => {
        setWorkflow(prev => ({ ...prev, [field]: value }));
    };

    const updateTrigger = (field, value) => {
        setWorkflow(prev => ({
            ...prev,
            trigger: { ...prev.trigger, [field]: value },
        }));
    };

    const addCondition = () => {
        const conditions = [...(workflow.trigger.conditions || []), { field: '', operator: 'equals', value: '' }];
        updateTrigger('conditions', conditions);
    };

    const removeCondition = (index) => {
        const conditions = workflow.trigger.conditions.filter((_, i) => i !== index);
        updateTrigger('conditions', conditions);
    };

    const updateCondition = (index, field, value) => {
        const conditions = [...workflow.trigger.conditions];
        conditions[index] = { ...conditions[index], [field]: value };
        updateTrigger('conditions', conditions);
    };

    const addStep = (type) => {
        const newStep = {
            type,
            actionType: type === 'action' ? 'create_task' : '',
            config: {},
            delay: type === 'delay' ? { amount: 1, unit: 'hours' } : { amount: 0, unit: '' },
            order: workflow.steps.length,
        };
        setWorkflow(prev => ({ ...prev, steps: [...prev.steps, newStep] }));
        setExpandedStep(workflow.steps.length);
    };

    const removeStep = (index) => {
        setWorkflow(prev => ({
            ...prev,
            steps: prev.steps.filter((_, i) => i !== index).map((s, i) => ({ ...s, order: i })),
        }));
    };

    const updateStep = (index, field, value) => {
        setWorkflow(prev => {
            const steps = [...prev.steps];
            if (field.includes('.')) {
                const [parent, child] = field.split('.');
                steps[index] = { ...steps[index], [parent]: { ...steps[index][parent], [child]: value } };
            } else {
                steps[index] = { ...steps[index], [field]: value };
            }
            return { ...prev, steps };
        });
    };

    const updateStepConfig = (index, configField, value) => {
        setWorkflow(prev => {
            const steps = [...prev.steps];
            steps[index] = { ...steps[index], config: { ...steps[index].config, [configField]: value } };
            return { ...prev, steps };
        });
    };

    const moveStep = (index, direction) => {
        const newIndex = index + direction;
        if (newIndex < 0 || newIndex >= workflow.steps.length) return;
        setWorkflow(prev => {
            const steps = [...prev.steps];
            [steps[index], steps[newIndex]] = [steps[newIndex], steps[index]];
            return { ...prev, steps: steps.map((s, i) => ({ ...s, order: i })) };
        });
    };

    const handleSave = async () => {
        if (!workflow.name.trim()) return alert('Workflow name is required');
        setSaving(true);
        try {
            if (id) {
                await api.put(`/workflows/${id}`, workflow);
            } else {
                await api.post('/workflows', workflow);
            }
            navigate('/workflows');
        } catch (err) { console.error(err); alert('Failed to save workflow'); }
        finally { setSaving(false); }
    };

    const renderStepConfig = (step, index) => {
        if (step.type === 'delay') {
            return (
                <div className="wf-step-config">
                    <label className="form-label">Wait Duration</label>
                    <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                        <input type="number" className="input-field" style={{ width: 100 }}
                            value={step.delay?.amount || 1} min={1}
                            onChange={e => updateStep(index, 'delay.amount', Number(e.target.value))} />
                        <select className="input-field" value={step.delay?.unit || 'hours'}
                            onChange={e => updateStep(index, 'delay.unit', e.target.value)}>
                            {DELAY_UNITS.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                        </select>
                    </div>
                </div>
            );
        }

        if (step.type === 'action') {
            return (
                <div className="wf-step-config">
                    <label className="form-label">Action Type</label>
                    <select className="input-field" value={step.actionType || ''}
                        onChange={e => updateStep(index, 'actionType', e.target.value)}>
                        {ACTION_OPTIONS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                    </select>

                    {step.actionType === 'create_task' && (
                        <>
                            <label className="form-label" style={{ marginTop: 'var(--space-3)' }}>Task Title</label>
                            <input className="input-field" placeholder="Follow up with lead"
                                value={step.config?.title || ''}
                                onChange={e => updateStepConfig(index, 'title', e.target.value)} />
                            <label className="form-label" style={{ marginTop: 'var(--space-3)' }}>Priority</label>
                            <select className="input-field" value={step.config?.priority || 'medium'}
                                onChange={e => updateStepConfig(index, 'priority', e.target.value)}>
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="urgent">Urgent</option>
                            </select>
                            <label className="form-label" style={{ marginTop: 'var(--space-3)' }}>Due In (Days)</label>
                            <input type="number" className="input-field" min={1} value={step.config?.dueDays || 1}
                                onChange={e => updateStepConfig(index, 'dueDays', Number(e.target.value))} />
                        </>
                    )}

                    {step.actionType === 'create_notification' && (
                        <>
                            <label className="form-label" style={{ marginTop: 'var(--space-3)' }}>Notification Title</label>
                            <input className="input-field" placeholder="New lead requires attention"
                                value={step.config?.title || ''}
                                onChange={e => updateStepConfig(index, 'title', e.target.value)} />
                            <label className="form-label" style={{ marginTop: 'var(--space-3)' }}>Message</label>
                            <textarea className="input-field" rows={2} placeholder="Details..."
                                value={step.config?.message || ''}
                                onChange={e => updateStepConfig(index, 'message', e.target.value)} />
                        </>
                    )}

                    {step.actionType === 'send_email' && (
                        <>
                            <label className="form-label" style={{ marginTop: 'var(--space-3)' }}>Subject</label>
                            <input className="input-field" placeholder="Email subject"
                                value={step.config?.subject || ''}
                                onChange={e => updateStepConfig(index, 'subject', e.target.value)} />
                        </>
                    )}

                    {step.actionType === 'update_field' && (
                        <>
                            <label className="form-label" style={{ marginTop: 'var(--space-3)' }}>Field Name</label>
                            <input className="input-field" placeholder="e.g. status"
                                value={step.config?.field || ''}
                                onChange={e => updateStepConfig(index, 'field', e.target.value)} />
                            <label className="form-label" style={{ marginTop: 'var(--space-3)' }}>New Value</label>
                            <input className="input-field" placeholder="e.g. contacted"
                                value={step.config?.value || ''}
                                onChange={e => updateStepConfig(index, 'value', e.target.value)} />
                        </>
                    )}

                    {step.actionType === 'add_tag' && (
                        <>
                            <label className="form-label" style={{ marginTop: 'var(--space-3)' }}>Tag Name</label>
                            <input className="input-field" placeholder="e.g. hot-lead"
                                value={step.config?.tag || ''}
                                onChange={e => updateStepConfig(index, 'tag', e.target.value)} />
                        </>
                    )}
                </div>
            );
        }

        return null;
    };

    return (
        <div>
            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <button className="btn btn-ghost" onClick={() => navigate('/workflows')}>
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 className="page-title">{id ? 'Edit Workflow' : 'Create Workflow'}</h1>
                        <p className="page-subtitle">Design your automation flow</p>
                    </div>
                </div>
                <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                    <Save size={16} /> {saving ? 'Saving...' : 'Save Workflow'}
                </button>
            </div>

            {/* Workflow Info */}
            <div className="kpi-card" style={{ marginBottom: 'var(--space-5)' }}>
                <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
                    <div>
                        <label className="form-label">Workflow Name *</label>
                        <input className="input-field" placeholder="e.g. New Lead Nurture Sequence"
                            value={workflow.name} onChange={e => updateField('name', e.target.value)} />
                    </div>
                    <div>
                        <label className="form-label">Description</label>
                        <input className="input-field" placeholder="What does this workflow do?"
                            value={workflow.description} onChange={e => updateField('description', e.target.value)} />
                    </div>
                </div>
            </div>

            {/* Trigger */}
            <div className="kpi-card wf-trigger-card" style={{ marginBottom: 'var(--space-5)' }}>
                <div className="wf-section-header">
                    <Zap size={16} style={{ color: 'var(--accent-amber)' }} />
                    <span style={{ fontWeight: 700 }}>Trigger</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: 'var(--font-xs)', marginLeft: 'var(--space-2)' }}>When should this workflow start?</span>
                </div>
                <div style={{ marginTop: 'var(--space-4)' }}>
                    <label className="form-label">Event</label>
                    <select className="input-field" value={workflow.trigger.type}
                        onChange={e => updateTrigger('type', e.target.value)}>
                        {TRIGGER_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.icon} {t.label}</option>)}
                    </select>
                </div>

                {/* Conditions */}
                <div style={{ marginTop: 'var(--space-4)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                        <label className="form-label" style={{ margin: 0 }}>Conditions (optional)</label>
                        <button className="btn btn-ghost btn-sm" onClick={addCondition}>
                            <Plus size={12} /> Add Condition
                        </button>
                    </div>
                    {(workflow.trigger.conditions || []).map((cond, i) => (
                        <div key={i} style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-2)', alignItems: 'center' }}>
                            <input className="input-field" placeholder="Field (e.g. value)" style={{ flex: 1 }}
                                value={cond.field} onChange={e => updateCondition(i, 'field', e.target.value)} />
                            <select className="input-field" style={{ width: 140 }}
                                value={cond.operator} onChange={e => updateCondition(i, 'operator', e.target.value)}>
                                {OPERATORS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                            <input className="input-field" placeholder="Value" style={{ flex: 1 }}
                                value={cond.value} onChange={e => updateCondition(i, 'value', e.target.value)} />
                            <button className="btn btn-ghost btn-sm" onClick={() => removeCondition(i)}><Trash2 size={12} /></button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Flow Arrow */}
            <div className="wf-flow-arrow">
                <div className="wf-flow-line" />
                <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />
            </div>

            {/* Steps */}
            <div className="wf-steps">
                {workflow.steps.map((step, i) => {
                    const actionOpt = ACTION_OPTIONS.find(a => a.value === step.actionType);
                    const StepIcon = step.type === 'delay' ? Clock : step.type === 'condition' ? GitBranch : (actionOpt?.icon || Zap);
                    const stepColor = step.type === 'delay' ? 'var(--accent-amber)' : step.type === 'condition' ? 'var(--accent-violet)' : (actionOpt?.color || 'var(--primary-400)');
                    const isExpanded = expandedStep === i;

                    return (
                        <div key={i}>
                            <div className={`wf-step-card ${isExpanded ? 'expanded' : ''}`}>
                                <div className="wf-step-header" onClick={() => setExpandedStep(isExpanded ? null : i)}>
                                    <div className="wf-step-icon" style={{ color: stepColor, background: `${stepColor}15` }}>
                                        <StepIcon size={16} />
                                    </div>
                                    <div className="wf-step-info">
                                        <span className="wf-step-type">
                                            {step.type === 'delay' ? `Wait ${step.delay?.amount || 0} ${step.delay?.unit || 'hours'}` :
                                                step.type === 'condition' ? 'Condition Check' :
                                                    actionOpt?.label || step.actionType}
                                        </span>
                                        <span className="wf-step-order">Step {i + 1}</span>
                                    </div>
                                    <div className="wf-step-actions">
                                        {i > 0 && <button className="btn btn-ghost btn-sm" onClick={e => { e.stopPropagation(); moveStep(i, -1); }}><ChevronUp size={12} /></button>}
                                        {i < workflow.steps.length - 1 && <button className="btn btn-ghost btn-sm" onClick={e => { e.stopPropagation(); moveStep(i, 1); }}><ChevronDown size={12} /></button>}
                                        <button className="btn btn-ghost btn-sm" onClick={e => { e.stopPropagation(); removeStep(i); }}><Trash2 size={12} /></button>
                                    </div>
                                </div>
                                {isExpanded && renderStepConfig(step, i)}
                            </div>
                            {i < workflow.steps.length - 1 && (
                                <div className="wf-flow-arrow">
                                    <div className="wf-flow-line" />
                                    <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Add Step Buttons */}
            <div className="wf-add-step">
                <div className="wf-flow-arrow" style={{ marginBottom: 'var(--space-3)' }}>
                    <div className="wf-flow-line" />
                    <Plus size={16} style={{ color: 'var(--primary-400)' }} />
                </div>
                <div className="wf-add-step-buttons">
                    <button className="wf-add-btn" onClick={() => addStep('action')}>
                        <Zap size={14} /> Action
                    </button>
                    <button className="wf-add-btn" onClick={() => addStep('delay')}>
                        <Clock size={14} /> Delay
                    </button>
                    <button className="wf-add-btn" onClick={() => addStep('condition')}>
                        <GitBranch size={14} /> Condition
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WorkflowBuilder;
