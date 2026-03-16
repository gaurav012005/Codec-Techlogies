import { useState, useEffect } from 'react';
import api from '../api/axios';
import {
    Mail, Send, FileText, MessageSquare, Plus, Search,
    Clock, Eye, MousePointer, Trash2, Edit3, X, ChevronDown,
    CheckCircle, AlertTriangle, RefreshCw
} from 'lucide-react';

const TABS = [
    { id: 'compose', label: 'Compose', icon: Send },
    { id: 'sent', label: 'Sent', icon: Mail },
    { id: 'templates', label: 'Templates', icon: FileText },
];

const EmailCenter = () => {
    const [activeTab, setActiveTab] = useState('compose');
    const [emails, setEmails] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Compose form
    const [composeForm, setComposeForm] = useState({ to: '', subject: '', body: '', templateId: '' });
    const [sending, setSending] = useState(false);

    // Template form
    const [showTemplateModal, setShowTemplateModal] = useState(false);
    const [templateForm, setTemplateForm] = useState({ name: '', subject: '', body: '', category: 'sales' });
    const [editingTemplate, setEditingTemplate] = useState(null);

    useEffect(() => {
        if (activeTab === 'sent') fetchEmails();
        if (activeTab === 'templates') fetchTemplates();
    }, [activeTab]);

    const fetchEmails = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/emails');
            setEmails(data.data?.emails || []);
        } catch (err) { setError('Failed to load emails'); }
        finally { setLoading(false); }
    };

    const fetchTemplates = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/emails/templates');
            setTemplates(data.data || []);
        } catch (err) { setError('Failed to load templates'); }
        finally { setLoading(false); }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!composeForm.to || !composeForm.subject || !composeForm.body) return;
        setSending(true);
        setError('');
        try {
            await api.post('/emails/send', composeForm);
            setSuccess('Email sent successfully!');
            setComposeForm({ to: '', subject: '', body: '', templateId: '' });
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send email');
        } finally { setSending(false); }
    };

    const handleApplyTemplate = (template) => {
        setComposeForm(prev => ({
            ...prev,
            subject: template.subject,
            body: template.body,
            templateId: template._id,
        }));
        setActiveTab('compose');
    };

    const handleSaveTemplate = async (e) => {
        e.preventDefault();
        try {
            if (editingTemplate) {
                await api.put(`/emails/templates/${editingTemplate._id}`, templateForm);
            } else {
                await api.post('/emails/templates', templateForm);
            }
            setShowTemplateModal(false);
            setTemplateForm({ name: '', subject: '', body: '', category: 'sales' });
            setEditingTemplate(null);
            fetchTemplates();
            setSuccess('Template saved!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) { setError('Failed to save template'); }
    };

    const handleDeleteTemplate = async (id) => {
        try {
            await api.delete(`/emails/templates/${id}`);
            fetchTemplates();
        } catch (err) { setError('Failed to delete template'); }
    };

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Email Center</h1>
                    <p className="page-subtitle">Send emails, manage templates, and track engagement</p>
                </div>
            </div>

            {success && <div className="alert alert-success"><CheckCircle size={16} />{success}</div>}
            {error && <div className="alert alert-error"><AlertTriangle size={16} />{error}</div>}

            <div className="report-tabs" style={{ marginBottom: 'var(--space-6)' }}>
                {TABS.map(tab => (
                    <button key={tab.id} className={`report-tab ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}>
                        <tab.icon size={16} />{tab.label}
                    </button>
                ))}
            </div>

            {/* Compose Tab */}
            {activeTab === 'compose' && (
                <div className="report-chart-card" style={{ animation: 'fadeInUp 0.3s ease-out' }}>
                    <h3 className="report-chart-title"><Send size={16} style={{ marginRight: 8, color: 'var(--primary-400)' }} />Compose Email</h3>
                    <form onSubmit={handleSend}>
                        <div className="form-group">
                            <label className="form-label">To</label>
                            <input className="form-input form-input-no-icon" type="email" placeholder="recipient@email.com"
                                value={composeForm.to} onChange={e => setComposeForm(p => ({ ...p, to: e.target.value }))} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Subject</label>
                            <input className="form-input form-input-no-icon" type="text" placeholder="Email subject"
                                value={composeForm.subject} onChange={e => setComposeForm(p => ({ ...p, subject: e.target.value }))} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Body</label>
                            <textarea className="form-input form-input-no-icon" rows={10} placeholder="Write your email here... Use {{contact.name}}, {{deal.value}} for variables"
                                value={composeForm.body} onChange={e => setComposeForm(p => ({ ...p, body: e.target.value }))} required
                                style={{ resize: 'vertical', minHeight: 200 }} />
                        </div>
                        <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
                            <button type="submit" className="btn btn-primary" disabled={sending}>
                                {sending ? <><div className="spinner spinner-sm" /> Sending...</> : <><Send size={16} /> Send Email</>}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Sent Tab */}
            {activeTab === 'sent' && (
                <div className="report-chart-card" style={{ animation: 'fadeInUp 0.3s ease-out' }}>
                    <h3 className="report-chart-title"><Mail size={16} style={{ marginRight: 8, color: 'var(--primary-400)' }} />Sent Emails</h3>
                    {loading ? <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Loading...</div> : (
                        <div className="leaderboard-table">
                            <div className="at-risk-header">
                                <span>Subject</span><span>To</span><span>Status</span><span>Opens</span><span>Sent</span>
                            </div>
                            {emails.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>No emails sent yet</div>}
                            {emails.map(email => (
                                <div key={email._id} className="at-risk-row">
                                    <span className="at-risk-name">{email.subject}</span>
                                    <span style={{ color: 'var(--text-muted)' }}>{email.to}</span>
                                    <span>
                                        <span className={`probability-badge ${email.status === 'sent' ? 'hot' : email.status === 'scheduled' ? 'warm' : 'cold'}`}>
                                            {email.status}
                                        </span>
                                    </span>
                                    <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                        <Eye size={12} style={{ color: email.openCount > 0 ? 'var(--accent-emerald)' : 'var(--text-muted)' }} />
                                        {email.openCount}
                                        <MousePointer size={12} style={{ color: email.clickCount > 0 ? 'var(--accent-cyan)' : 'var(--text-muted)' }} />
                                        {email.clickCount}
                                    </span>
                                    <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
                                        {email.sentAt ? new Date(email.sentAt).toLocaleDateString() : '-'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Templates Tab */}
            {activeTab === 'templates' && (
                <div style={{ animation: 'fadeInUp 0.3s ease-out' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 'var(--space-4)' }}>
                        <button className="btn btn-primary btn-sm" onClick={() => { setEditingTemplate(null); setTemplateForm({ name: '', subject: '', body: '', category: 'sales' }); setShowTemplateModal(true); }}>
                            <Plus size={16} /> New Template
                        </button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-4)' }}>
                        {templates.map(t => (
                            <div key={t._id} className="report-kpi-card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-3)' }}>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: 'var(--font-sm)' }}>{t.name}</div>
                                        <span className="at-risk-stage">{t.category}</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                                        <button className="btn btn-ghost btn-sm" onClick={() => handleApplyTemplate(t)} title="Use template">
                                            <Send size={14} />
                                        </button>
                                        <button className="btn btn-ghost btn-sm" onClick={() => { setEditingTemplate(t); setTemplateForm({ name: t.name, subject: t.subject, body: t.body, category: t.category }); setShowTemplateModal(true); }}>
                                            <Edit3 size={14} />
                                        </button>
                                        <button className="btn btn-ghost btn-sm" onClick={() => handleDeleteTemplate(t._id)} style={{ color: 'var(--error)' }}>
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                                <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>
                                    <strong>Subject:</strong> {t.subject}
                                </div>
                                <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', overflow: 'hidden', maxHeight: 60 }}>
                                    {t.body?.substring(0, 150)}...
                                </div>
                                <div style={{ marginTop: 'var(--space-3)', fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
                                    Used {t.usageCount} times
                                </div>
                            </div>
                        ))}
                        {templates.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', gridColumn: '1 / -1' }}>No templates yet. Create your first template!</div>}
                    </div>
                </div>
            )}

            {/* Template Modal */}
            {showTemplateModal && (
                <div className="modal-overlay" onClick={() => setShowTemplateModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingTemplate ? 'Edit Template' : 'New Template'}</h2>
                            <button className="btn btn-ghost btn-sm" onClick={() => setShowTemplateModal(false)}><X size={18} /></button>
                        </div>
                        <form onSubmit={handleSaveTemplate}>
                            <div className="form-group">
                                <label className="form-label">Template Name</label>
                                <input className="form-input form-input-no-icon" value={templateForm.name}
                                    onChange={e => setTemplateForm(p => ({ ...p, name: e.target.value }))} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Category</label>
                                <select className="form-input form-input-no-icon" value={templateForm.category}
                                    onChange={e => setTemplateForm(p => ({ ...p, category: e.target.value }))}>
                                    {['sales', 'follow_up', 'onboarding', 'meeting', 'proposal', 'nurture', 'other'].map(c => (
                                        <option key={c} value={c}>{c.replace('_', ' ')}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Subject</label>
                                <input className="form-input form-input-no-icon" value={templateForm.subject}
                                    onChange={e => setTemplateForm(p => ({ ...p, subject: e.target.value }))} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Body</label>
                                <textarea className="form-input form-input-no-icon" rows={8} value={templateForm.body}
                                    onChange={e => setTemplateForm(p => ({ ...p, body: e.target.value }))} required
                                    style={{ resize: 'vertical' }} />
                            </div>
                            <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
                                <button type="button" className="btn btn-ghost" onClick={() => setShowTemplateModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Save Template</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmailCenter;
