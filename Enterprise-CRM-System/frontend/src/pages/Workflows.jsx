import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import {
    Zap, Plus, Play, Pause, Trash2, Edit, BarChart3,
    Clock, CheckCircle, XCircle, Activity, ChevronRight, ToggleLeft, ToggleRight
} from 'lucide-react';

const TRIGGER_LABELS = {
    lead_created: 'Lead Created',
    deal_stage_changed: 'Deal Stage Changed',
    deal_created: 'Deal Created',
    deal_won: 'Deal Won',
    deal_lost: 'Deal Lost',
    task_overdue: 'Task Overdue',
    score_threshold: 'Score Threshold',
    email_received: 'Email Received',
    manual: 'Manual Trigger',
};

const Workflows = () => {
    const [workflows, setWorkflows] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchWorkflows();
        fetchAnalytics();
    }, []);

    const fetchWorkflows = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/workflows');
            setWorkflows(data.data?.workflows || []);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const fetchAnalytics = async () => {
        try {
            const { data } = await api.get('/workflows/analytics');
            setAnalytics(data.data);
        } catch (err) { }
    };

    const toggleWorkflow = async (id) => {
        try {
            await api.put(`/workflows/${id}/toggle`);
            fetchWorkflows();
        } catch (err) { console.error(err); }
    };

    const deleteWorkflow = async (id) => {
        if (!confirm('Delete this workflow and all its execution history?')) return;
        try {
            await api.delete(`/workflows/${id}`);
            fetchWorkflows();
            fetchAnalytics();
        } catch (err) { console.error(err); }
    };

    const testWorkflow = async (id) => {
        try {
            const { data } = await api.post(`/workflows/${id}/test`);
            alert(`Test run ${data.data?.status || 'completed'}! Check execution logs.`);
            fetchAnalytics();
        } catch (err) { console.error(err); }
    };

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Workflow Automation</h1>
                    <p className="page-subtitle">Automate repetitive tasks with trigger-based workflows</p>
                </div>
                <button className="btn btn-primary" onClick={() => navigate('/workflows/builder')}>
                    <Plus size={16} /> New Workflow
                </button>
            </div>

            {/* Analytics KPIs */}
            {analytics && (
                <div className="kpi-grid" style={{ marginBottom: 'var(--space-6)' }}>
                    <div className="kpi-card">
                        <div className="kpi-icon" style={{ background: 'linear-gradient(135deg, var(--primary-500), var(--accent-cyan))' }}>
                            <Zap size={20} />
                        </div>
                        <div className="kpi-content">
                            <div className="kpi-value">{analytics.totalWorkflows}</div>
                            <div className="kpi-label">Total Workflows</div>
                        </div>
                    </div>
                    <div className="kpi-card">
                        <div className="kpi-icon" style={{ background: 'linear-gradient(135deg, var(--accent-emerald), #10b981)' }}>
                            <Activity size={20} />
                        </div>
                        <div className="kpi-content">
                            <div className="kpi-value">{analytics.activeWorkflows}</div>
                            <div className="kpi-label">Active</div>
                        </div>
                    </div>
                    <div className="kpi-card">
                        <div className="kpi-icon" style={{ background: 'linear-gradient(135deg, var(--accent-violet), #8b5cf6)' }}>
                            <BarChart3 size={20} />
                        </div>
                        <div className="kpi-content">
                            <div className="kpi-value">{analytics.totalRuns}</div>
                            <div className="kpi-label">Total Runs</div>
                        </div>
                    </div>
                    <div className="kpi-card">
                        <div className="kpi-icon" style={{ background: 'linear-gradient(135deg, var(--accent-amber), #f59e0b)' }}>
                            <CheckCircle size={20} />
                        </div>
                        <div className="kpi-content">
                            <div className="kpi-value">{analytics.successRate}%</div>
                            <div className="kpi-label">Success Rate</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Workflow List */}
            <div className="kpi-card" style={{ padding: 0, overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-muted)' }}>Loading workflows...</div>
                ) : workflows.length === 0 ? (
                    <div style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
                        <Zap size={40} style={{ color: 'var(--text-muted)', opacity: 0.3, marginBottom: 'var(--space-3)' }} />
                        <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>No workflows yet</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)', marginTop: 'var(--space-1)' }}>Create your first automation to get started</p>
                        <button className="btn btn-primary" style={{ marginTop: 'var(--space-4)' }} onClick={() => navigate('/workflows/builder')}>
                            <Plus size={14} /> Create Workflow
                        </button>
                    </div>
                ) : (
                    <div>
                        {workflows.map((wf) => (
                            <div key={wf._id} className="workflow-item">
                                <div className="workflow-item-main">
                                    <button
                                        className="workflow-toggle"
                                        onClick={() => toggleWorkflow(wf._id)}
                                        title={wf.isActive ? 'Deactivate' : 'Activate'}
                                    >
                                        {wf.isActive ? (
                                            <ToggleRight size={24} style={{ color: 'var(--accent-emerald)' }} />
                                        ) : (
                                            <ToggleLeft size={24} style={{ color: 'var(--text-muted)' }} />
                                        )}
                                    </button>
                                    <div className="workflow-item-info">
                                        <div className="workflow-item-name">{wf.name}</div>
                                        <div className="workflow-item-meta">
                                            <span className="workflow-trigger-badge">
                                                <Zap size={10} /> {TRIGGER_LABELS[wf.trigger?.type] || wf.trigger?.type}
                                            </span>
                                            <span>{wf.steps?.length || 0} steps</span>
                                            {wf.description && <span>• {wf.description.slice(0, 50)}</span>}
                                        </div>
                                    </div>
                                </div>
                                <div className="workflow-item-stats">
                                    <div className="workflow-stat">
                                        <Play size={12} />
                                        <span>{wf.executionCount || 0} runs</span>
                                    </div>
                                    {wf.lastRunAt && (
                                        <div className="workflow-stat">
                                            <Clock size={12} />
                                            <span>{new Date(wf.lastRunAt).toLocaleDateString()}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="workflow-item-actions">
                                    <button className="btn btn-ghost btn-sm" onClick={() => testWorkflow(wf._id)} title="Test Run">
                                        <Play size={14} />
                                    </button>
                                    <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/workflows/builder/${wf._id}`)} title="Edit">
                                        <Edit size={14} />
                                    </button>
                                    <button className="btn btn-ghost btn-sm" onClick={() => deleteWorkflow(wf._id)} title="Delete">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Recent Executions */}
            {analytics?.recentExecutions?.length > 0 && (
                <div style={{ marginTop: 'var(--space-6)' }}>
                    <h3 style={{ fontSize: 'var(--font-base)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>Recent Executions</h3>
                    <div className="kpi-card" style={{ padding: 0, overflow: 'hidden' }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Workflow</th>
                                    <th>Status</th>
                                    <th>Steps</th>
                                    <th>Started</th>
                                    <th>Duration</th>
                                </tr>
                            </thead>
                            <tbody>
                                {analytics.recentExecutions.map(exec => {
                                    const duration = exec.completedAt
                                        ? Math.round((new Date(exec.completedAt) - new Date(exec.startedAt)) / 1000)
                                        : '-';
                                    return (
                                        <tr key={exec._id}>
                                            <td style={{ fontWeight: 500 }}>{exec.workflowName || 'Unknown'}</td>
                                            <td>
                                                <span className={`deal-badge ${exec.status === 'completed' ? 'won' : exec.status === 'failed' ? 'lost' : ''}`}>
                                                    {exec.status === 'completed' ? <CheckCircle size={12} /> : exec.status === 'failed' ? <XCircle size={12} /> : <Activity size={12} />}
                                                    {exec.status}
                                                </span>
                                            </td>
                                            <td>{exec.steps?.length || 0}</td>
                                            <td>{new Date(exec.startedAt).toLocaleString()}</td>
                                            <td>{duration !== '-' ? `${duration}s` : 'Running'}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Workflows;
