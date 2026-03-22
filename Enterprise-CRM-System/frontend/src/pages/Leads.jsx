import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import {
    Plus, Search, Filter, ChevronDown, Edit2, Trash2, Eye,
    Phone, Mail, Building2, TrendingUp, Users, AlertCircle, X,
    ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import LeadScoreBadge from '../components/LeadScoreBadge';

const statusColors = {
    new: { bg: 'rgba(99,102,241,0.15)', color: '#818cf8', label: 'New' },
    contacted: { bg: 'rgba(6,182,212,0.15)', color: '#06b6d4', label: 'Contacted' },
    qualified: { bg: 'rgba(16,185,129,0.15)', color: '#10b981', label: 'Qualified' },
    unqualified: { bg: 'rgba(239,68,68,0.15)', color: '#ef4444', label: 'Unqualified' },
    nurturing: { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b', label: 'Nurturing' },
    converted: { bg: 'rgba(16,185,129,0.15)', color: '#10b981', label: 'Converted' },
    lost: { bg: 'rgba(239,68,68,0.15)', color: '#ef4444', label: 'Lost' },
};

const sourceLabels = {
    website: 'Website', referral: 'Referral', linkedin: 'LinkedIn',
    cold_call: 'Cold Call', email: 'Email', event: 'Event',
    advertisement: 'Ad', other: 'Other',
};

const Leads = () => {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
    const [showModal, setShowModal] = useState(false);
    const [editingLead, setEditingLead] = useState(null);
    const [stats, setStats] = useState({ total: 0, byStatus: [], bySource: [] });

    const fetchLeads = useCallback(async () => {
        try {
            setLoading(true);
            const params = { page: pagination.page, limit: 15 };
            if (search) params.search = search;
            if (statusFilter) params.status = statusFilter;
            const { data } = await api.get('/leads', { params });
            setLeads(data.data.leads);
            setPagination(data.data.pagination);
        } catch (err) {
            console.error('Failed to fetch leads', err);
        } finally { setLoading(false); }
    }, [search, statusFilter, pagination.page]);

    const fetchStats = useCallback(async () => {
        try {
            const { data } = await api.get('/leads/stats');
            setStats(data.data);
        } catch (err) { /* ignore */ }
    }, []);

    useEffect(() => { fetchLeads(); }, [fetchLeads]);
    useEffect(() => { fetchStats(); }, [fetchStats]);

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this lead?')) return;
        try {
            await api.delete(`/leads/${id}`);
            fetchLeads();
            fetchStats();
        } catch (err) { alert('Failed to delete lead'); }
    };

    const handleSave = async (formData) => {
        try {
            if (editingLead) {
                await api.put(`/leads/${editingLead._id}`, formData);
            } else {
                await api.post('/leads', formData);
            }
            setShowModal(false);
            setEditingLead(null);
            fetchLeads();
            fetchStats();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to save lead');
        }
    };

    const getScoreColor = (score) => {
        if (score >= 70) return 'var(--accent-emerald)';
        if (score >= 40) return 'var(--accent-amber)';
        return 'var(--accent-rose)';
    };

    return (
        <div>
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Leads</h1>
                    <p className="page-subtitle">Manage and track your sales leads</p>
                </div>
                <button className="btn btn-primary" onClick={() => { setEditingLead(null); setShowModal(true); }}>
                    <Plus size={18} /> Add Lead
                </button>
            </div>

            {/* Stats Cards */}
            <div className="kpi-grid" style={{ marginBottom: 'var(--space-6)' }}>
                <div className="kpi-card">
                    <div className="kpi-header">
                        <span className="kpi-label">Total Leads</span>
                        <div className="kpi-icon indigo"><Users size={20} /></div>
                    </div>
                    <div className="kpi-value">{stats.total}</div>
                </div>
                {stats.byStatus.slice(0, 3).map((s) => (
                    <div className="kpi-card" key={s._id}>
                        <div className="kpi-header">
                            <span className="kpi-label">{statusColors[s._id]?.label || s._id}</span>
                            <div className="kpi-icon cyan"><TrendingUp size={20} /></div>
                        </div>
                        <div className="kpi-value">{s.count}</div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-6)', flexWrap: 'wrap' }}>
                <div className="form-input-wrapper" style={{ flex: 1, minWidth: 250 }}>
                    <input
                        className="form-input"
                        placeholder="Search leads by name, email, company..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
                    />
                    <Search className="form-input-icon" />
                </div>
                <select
                    className="form-input form-input-no-icon"
                    style={{ width: 'auto', minWidth: 160, paddingLeft: '0.75rem' }}
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
                >
                    <option value="">All Statuses</option>
                    {Object.entries(statusColors).map(([key, val]) => (
                        <option key={key} value={key}>{val.label}</option>
                    ))}
                </select>
            </div>

            {/* Leads Table */}
            <div className="kpi-card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--font-sm)' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                                {['Name', 'Company', 'Status', 'Source', 'Score', 'Owner', 'Actions'].map((h) => (
                                    <th key={h} style={{ padding: 'var(--space-3) var(--space-4)', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: 'var(--font-xs)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={7} style={{ padding: 'var(--space-10)', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    <div className="spinner" style={{ margin: '0 auto var(--space-3)', borderColor: 'rgba(99,102,241,0.2)', borderTopColor: 'var(--primary-400)', width: 32, height: 32 }} />
                                    Loading leads...
                                </td></tr>
                            ) : leads.length === 0 ? (
                                <tr><td colSpan={7} style={{ padding: 'var(--space-10)', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    No leads found. Click "Add Lead" to create one.
                                </td></tr>
                            ) : leads.map((lead) => (
                                <tr key={lead._id} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background var(--transition-fast)' }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                                    <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                                        <div>
                                            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{lead.name}</div>
                                            <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                <Mail size={12} /> {lead.email || 'No email'}
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--text-secondary)' }}>
                                        {lead.company || '—'}
                                    </td>
                                    <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                                        <span style={{
                                            display: 'inline-block', padding: '3px 10px', borderRadius: 'var(--radius-full)',
                                            background: statusColors[lead.status]?.bg, color: statusColors[lead.status]?.color,
                                            fontSize: 'var(--font-xs)', fontWeight: 600,
                                        }}>
                                            {statusColors[lead.status]?.label || lead.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--text-secondary)', fontSize: 'var(--font-xs)' }}>
                                        {sourceLabels[lead.source] || lead.source}
                                    </td>
                                    <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                                        <LeadScoreBadge score={lead.leadScore || 0} size="small" />
                                    </td>
                                    <td style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--text-secondary)', fontSize: 'var(--font-xs)' }}>
                                        {lead.ownerId?.name || '—'}
                                    </td>
                                    <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                                        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                                            <button className="btn btn-ghost btn-sm" onClick={() => { setEditingLead(lead); setShowModal(true); }}>
                                                <Edit2 size={14} />
                                            </button>
                                            <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(lead._id)}
                                                style={{ color: 'var(--accent-rose)' }}>
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-2)', padding: 'var(--space-4)', borderTop: '1px solid var(--border-subtle)' }}>
                        {Array.from({ length: pagination.pages }, (_, i) => (
                            <button key={i} className={`btn btn-sm ${pagination.page === i + 1 ? 'btn-primary' : 'btn-ghost'}`}
                                onClick={() => setPagination(p => ({ ...p, page: i + 1 }))}>
                                {i + 1}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <LeadModal
                    lead={editingLead}
                    onSave={handleSave}
                    onClose={() => { setShowModal(false); setEditingLead(null); }}
                />
            )}
        </div>
    );
};

// Lead Form Modal
const LeadModal = ({ lead, onSave, onClose }) => {
    const [form, setForm] = useState({
        name: lead?.name || '',
        email: lead?.email || '',
        phone: lead?.phone || '',
        company: lead?.company || '',
        source: lead?.source || 'other',
        status: lead?.status || 'new',
        notes: lead?.notes || '',
    });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        await onSave(form);
        setSaving(false);
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
            animation: 'fadeIn 0.2s ease-out',
        }} onClick={onClose}>
            <div className="auth-card" style={{ maxWidth: 520, width: '100%', margin: 'var(--space-4)', maxHeight: '90vh', overflowY: 'auto' }}
                onClick={(e) => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
                    <h2 style={{ fontSize: 'var(--font-xl)', fontWeight: 700 }}>{lead ? 'Edit Lead' : 'Add New Lead'}</h2>
                    <button className="btn btn-ghost btn-sm" onClick={onClose}><X size={18} /></button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Full Name *</label>
                        <input className="form-input form-input-no-icon" required value={form.name}
                            onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} placeholder="John Doe" />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <input className="form-input form-input-no-icon" type="email" value={form.email}
                                onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} placeholder="john@example.com" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Phone</label>
                            <input className="form-input form-input-no-icon" value={form.phone}
                                onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+1 234 567 890" />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Company</label>
                        <input className="form-input form-input-no-icon" value={form.company}
                            onChange={(e) => setForm(f => ({ ...f, company: e.target.value }))} placeholder="Acme Inc" />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                        <div className="form-group">
                            <label className="form-label">Source</label>
                            <select className="form-input form-input-no-icon" value={form.source}
                                onChange={(e) => setForm(f => ({ ...f, source: e.target.value }))}>
                                {Object.entries(sourceLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Status</label>
                            <select className="form-input form-input-no-icon" value={form.status}
                                onChange={(e) => setForm(f => ({ ...f, status: e.target.value }))}>
                                {Object.entries(statusColors).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Notes</label>
                        <textarea className="form-input form-input-no-icon" value={form.notes} rows={3}
                            onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Additional notes..." style={{ resize: 'vertical' }} />
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end', marginTop: 'var(--space-4)' }}>
                        <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={saving}>
                            {saving ? <span className="spinner" /> : (lead ? 'Update Lead' : 'Create Lead')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Leads;
