import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import {
    Plus, Search, CheckCircle2, Circle, Clock, AlertTriangle,
    Calendar, X, Phone, Mail, Video, FileText, Users, Flag,
    ChevronDown, Trash2, Edit2
} from 'lucide-react';

const typeConfig = {
    call: { icon: Phone, color: '#06b6d4', label: 'Call' },
    email: { icon: Mail, color: '#8b5cf6', label: 'Email' },
    meeting: { icon: Video, color: '#f59e0b', label: 'Meeting' },
    follow_up: { icon: Clock, color: '#10b981', label: 'Follow-up' },
    demo: { icon: Users, color: '#ec4899', label: 'Demo' },
    proposal: { icon: FileText, color: '#6366f1', label: 'Proposal' },
    general: { icon: Flag, color: '#64748b', label: 'General' },
};

const priorityConfig = {
    low: { color: '#64748b', bg: 'rgba(100,116,139,0.15)', label: 'Low' },
    medium: { color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', label: 'Medium' },
    high: { color: '#ef4444', bg: 'rgba(239,68,68,0.15)', label: 'High' },
    urgent: { color: '#dc2626', bg: 'rgba(220,38,38,0.2)', label: 'Urgent' },
};

const Tasks = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
    const [showModal, setShowModal] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0, overdue: 0, dueToday: 0 });

    const fetchTasks = useCallback(async () => {
        try {
            setLoading(true);
            const params = { page: pagination.page, limit: 20 };
            if (search) params.search = search;
            if (statusFilter) params.status = statusFilter;
            if (dateFilter) params.dueDate = dateFilter;
            const { data } = await api.get('/tasks', { params });
            setTasks(data.data.tasks);
            setPagination(data.data.pagination);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    }, [search, statusFilter, dateFilter, pagination.page]);

    const fetchStats = useCallback(async () => {
        try {
            const { data } = await api.get('/tasks/stats');
            setStats(data.data);
        } catch (err) { /* */ }
    }, []);

    useEffect(() => { fetchTasks(); }, [fetchTasks]);
    useEffect(() => { fetchStats(); }, [fetchStats]);

    const toggleComplete = async (task) => {
        try {
            if (task.status === 'completed') {
                await api.put(`/tasks/${task._id}`, { status: 'pending', completedAt: null });
            } else {
                await api.put(`/tasks/${task._id}/complete`);
            }
            fetchTasks(); fetchStats();
        } catch (err) { alert('Failed'); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this task?')) return;
        await api.delete(`/tasks/${id}`);
        fetchTasks(); fetchStats();
    };

    const handleSave = async (formData) => {
        try {
            if (editingTask) await api.put(`/tasks/${editingTask._id}`, formData);
            else await api.post('/tasks', formData);
            setShowModal(false); setEditingTask(null); fetchTasks(); fetchStats();
        } catch (err) { alert(err.response?.data?.message || 'Failed'); }
    };

    const isOverdue = (task) => task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed' && task.status !== 'cancelled';

    const formatDate = (d) => {
        if (!d) return '';
        const date = new Date(d);
        const today = new Date();
        const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
        if (date.toDateString() === today.toDateString()) return 'Today';
        if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <div>
            {/* Header */}
            <div className="page-header">
                <div><h1 className="page-title">Tasks</h1><p className="page-subtitle">Manage your to-dos and follow-ups</p></div>
                <button className="btn btn-primary" onClick={() => { setEditingTask(null); setShowModal(true); }}><Plus size={18} /> Add Task</button>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
                {[
                    { label: 'Total', value: stats.total, icon: FileText, color: 'indigo' },
                    { label: 'Pending', value: stats.pending, icon: Circle, color: 'amber' },
                    { label: 'Completed', value: stats.completed, icon: CheckCircle2, color: 'emerald' },
                    { label: 'Overdue', value: stats.overdue, icon: AlertTriangle, color: 'rose' },
                    { label: 'Due Today', value: stats.dueToday, icon: Calendar, color: 'cyan' },
                ].map(k => (
                    <div key={k.label} className="kpi-card" style={{ padding: 'var(--space-4)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div><div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', marginBottom: 2 }}>{k.label}</div>
                                <div style={{ fontSize: 'var(--font-xl)', fontWeight: 700 }}>{k.value}</div></div>
                            <div className={`kpi-icon ${k.color}`}><k.icon size={18} /></div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-5)', flexWrap: 'wrap' }}>
                <div className="form-input-wrapper" style={{ flex: 1, minWidth: 220 }}>
                    <input className="form-input" placeholder="Search tasks..." value={search}
                        onChange={e => { setSearch(e.target.value); setPagination(p => ({ ...p, page: 1 })); }} />
                    <Search className="form-input-icon" />
                </div>
                <select className="form-input form-input-no-icon" style={{ width: 'auto', minWidth: 140, paddingLeft: '0.75rem' }}
                    value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}>
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                </select>
                <select className="form-input form-input-no-icon" style={{ width: 'auto', minWidth: 140, paddingLeft: '0.75rem' }}
                    value={dateFilter} onChange={e => { setDateFilter(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}>
                    <option value="">All Dates</option>
                    <option value="today">Due Today</option>
                    <option value="week">This Week</option>
                    <option value="overdue">Overdue</option>
                </select>
            </div>

            {/* Task List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                {loading ? (
                    <div className="kpi-card" style={{ textAlign: 'center', padding: 'var(--space-10)' }}>
                        <div className="spinner" style={{ margin: '0 auto', borderColor: 'rgba(99,102,241,0.2)', borderTopColor: 'var(--primary-400)', width: 32, height: 32 }} />
                    </div>
                ) : tasks.length === 0 ? (
                    <div className="kpi-card" style={{ textAlign: 'center', padding: 'var(--space-10)', color: 'var(--text-muted)' }}>
                        No tasks found. Click "Add Task" to create one.
                    </div>
                ) : tasks.map(task => {
                    const typeInfo = typeConfig[task.type] || typeConfig.general;
                    const prioInfo = priorityConfig[task.priority] || priorityConfig.medium;
                    const overdue = isOverdue(task);
                    const TypeIcon = typeInfo.icon;

                    return (
                        <div key={task._id} className="kpi-card" style={{
                            padding: 'var(--space-3) var(--space-4)',
                            opacity: task.status === 'completed' ? 0.6 : 1,
                            borderLeft: `3px solid ${overdue ? '#ef4444' : typeInfo.color}`,
                            transition: 'all var(--transition-fast)',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                {/* Checkbox */}
                                <button onClick={() => toggleComplete(task)} style={{
                                    background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0,
                                    color: task.status === 'completed' ? 'var(--accent-emerald)' : 'var(--text-muted)',
                                    transition: 'color 0.15s',
                                }}>
                                    {task.status === 'completed' ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                                </button>

                                {/* Type Icon */}
                                <div style={{
                                    width: 32, height: 32, borderRadius: 'var(--radius-md)',
                                    background: `${typeInfo.color}22`, display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', flexShrink: 0,
                                }}>
                                    <TypeIcon size={16} style={{ color: typeInfo.color }} />
                                </div>

                                {/* Content */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{
                                        fontWeight: 600, fontSize: 'var(--font-sm)', color: 'var(--text-primary)',
                                        textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                                    }}>{task.title}</div>
                                    {task.description && (
                                        <div style={{
                                            fontSize: 'var(--font-xs)', color: 'var(--text-muted)', marginTop: 2,
                                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                                        }}>
                                            {task.description}
                                        </div>
                                    )}
                                </div>

                                {/* Priority Badge */}
                                <span style={{
                                    fontSize: '0.65rem', fontWeight: 600, padding: '2px 8px',
                                    borderRadius: 'var(--radius-full)', background: prioInfo.bg, color: prioInfo.color,
                                }}>{prioInfo.label}</span>

                                {/* Due Date */}
                                {task.dueDate && (
                                    <div style={{
                                        display: 'flex', alignItems: 'center', gap: 4,
                                        fontSize: 'var(--font-xs)', fontWeight: 500,
                                        color: overdue ? '#ef4444' : 'var(--text-muted)',
                                    }}>
                                        <Calendar size={12} />
                                        {formatDate(task.dueDate)}
                                        {overdue && <AlertTriangle size={12} />}
                                    </div>
                                )}

                                {/* Assignee */}
                                {task.assignedTo && (
                                    <div style={{
                                        width: 26, height: 26, borderRadius: '50%',
                                        background: 'linear-gradient(135deg, var(--primary-500), var(--accent-violet))',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '0.6rem', fontWeight: 700, color: 'white', flexShrink: 0,
                                    }} title={task.assignedTo.name}>
                                        {task.assignedTo.name?.[0]?.toUpperCase() || '?'}
                                    </div>
                                )}

                                {/* Actions */}
                                <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
                                    <button className="btn btn-ghost btn-sm" onClick={() => { setEditingTask(task); setShowModal(true); }}><Edit2 size={14} /></button>
                                    <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(task._id)} style={{ color: 'var(--accent-rose)' }}><Trash2 size={14} /></button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-2)', marginTop: 'var(--space-6)' }}>
                    {Array.from({ length: pagination.pages }, (_, i) => (
                        <button key={i} className={`btn btn-sm ${pagination.page === i + 1 ? 'btn-primary' : 'btn-ghost'}`}
                            onClick={() => setPagination(p => ({ ...p, page: i + 1 }))}>{i + 1}</button>
                    ))}
                </div>
            )}

            {showModal && <TaskModal task={editingTask} onSave={handleSave} onClose={() => { setShowModal(false); setEditingTask(null); }} />}
        </div>
    );
};

const TaskModal = ({ task, onSave, onClose }) => {
    const [form, setForm] = useState({
        title: task?.title || '', description: task?.description || '',
        type: task?.type || 'general', priority: task?.priority || 'medium',
        status: task?.status || 'pending',
        dueDate: task?.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
    });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault(); setSaving(true); await onSave(form); setSaving(false);
    };

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, animation: 'fadeIn 0.2s ease-out' }} onClick={onClose}>
            <div className="auth-card" style={{ maxWidth: 500, width: '100%', margin: 'var(--space-4)', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
                    <h2 style={{ fontSize: 'var(--font-xl)', fontWeight: 700 }}>{task ? 'Edit Task' : 'Add Task'}</h2>
                    <button className="btn btn-ghost btn-sm" onClick={onClose}><X size={18} /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group"><label className="form-label">Title *</label>
                        <input className="form-input form-input-no-icon" required value={form.title}
                            onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Follow up with client" /></div>
                    <div className="form-group"><label className="form-label">Description</label>
                        <textarea className="form-input form-input-no-icon" rows={2} value={form.description}
                            onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={{ resize: 'vertical' }} /></div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                        <div className="form-group"><label className="form-label">Type</label>
                            <select className="form-input form-input-no-icon" value={form.type}
                                onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                                {Object.entries(typeConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                            </select></div>
                        <div className="form-group"><label className="form-label">Priority</label>
                            <select className="form-input form-input-no-icon" value={form.priority}
                                onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                                {Object.entries(priorityConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                            </select></div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                        <div className="form-group"><label className="form-label">Due Date</label>
                            <input className="form-input form-input-no-icon" type="date" value={form.dueDate}
                                onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} /></div>
                        {task && (
                            <div className="form-group"><label className="form-label">Status</label>
                                <select className="form-input form-input-no-icon" value={form.status}
                                    onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                                    <option value="pending">Pending</option><option value="in_progress">In Progress</option>
                                    <option value="completed">Completed</option><option value="cancelled">Cancelled</option>
                                </select></div>
                        )}
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end', marginTop: 'var(--space-4)' }}>
                        <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? <span className="spinner" /> : (task ? 'Update' : 'Create')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Tasks;
