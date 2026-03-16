import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { Plus, Search, Edit2, Trash2, X, UserCircle, Building2, Mail, Phone } from 'lucide-react';

const typeLabels = { decision_maker: 'Decision Maker', influencer: 'Influencer', champion: 'Champion', end_user: 'End User', gatekeeper: 'Gatekeeper', other: 'Other' };
const typeColors = { decision_maker: '#10b981', influencer: '#8b5cf6', champion: '#f59e0b', end_user: '#06b6d4', gatekeeper: '#64748b', other: '#94a3b8' };

const Contacts = () => {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
    const [showModal, setShowModal] = useState(false);
    const [editingContact, setEditingContact] = useState(null);

    const fetchContacts = useCallback(async () => {
        try {
            setLoading(true);
            const params = { page: pagination.page, limit: 15 };
            if (search) params.search = search;
            const { data } = await api.get('/contacts', { params });
            setContacts(data.data.contacts);
            setPagination(data.data.pagination);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    }, [search, pagination.page]);

    useEffect(() => { fetchContacts(); }, [fetchContacts]);

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this contact?')) return;
        await api.delete(`/contacts/${id}`);
        fetchContacts();
    };

    const handleSave = async (formData) => {
        try {
            if (editingContact) await api.put(`/contacts/${editingContact._id}`, formData);
            else await api.post('/contacts', formData);
            setShowModal(false); setEditingContact(null); fetchContacts();
        } catch (err) { alert(err.response?.data?.message || 'Failed to save'); }
    };

    return (
        <div>
            <div className="page-header">
                <div><h1 className="page-title">Contacts</h1><p className="page-subtitle">Manage your business contacts</p></div>
                <button className="btn btn-primary" onClick={() => { setEditingContact(null); setShowModal(true); }}><Plus size={18} /> Add Contact</button>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
                <div className="form-input-wrapper" style={{ flex: 1, minWidth: 250 }}>
                    <input className="form-input" placeholder="Search contacts..." value={search}
                        onChange={(e) => { setSearch(e.target.value); setPagination(p => ({ ...p, page: 1 })); }} />
                    <Search className="form-input-icon" />
                </div>
            </div>

            {/* Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-4)' }}>
                {loading ? (
                    <div className="kpi-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 'var(--space-10)' }}>
                        <div className="spinner" style={{ margin: '0 auto', borderColor: 'rgba(99,102,241,0.2)', borderTopColor: 'var(--primary-400)', width: 32, height: 32 }} />
                    </div>
                ) : contacts.length === 0 ? (
                    <div className="kpi-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 'var(--space-10)', color: 'var(--text-muted)' }}>
                        No contacts found. Click "Add Contact" to create one.
                    </div>
                ) : contacts.map((c) => (
                    <div key={c._id} className="kpi-card" style={{ cursor: 'pointer', padding: 'var(--space-5)' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                            <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-full)', background: 'linear-gradient(135deg, var(--primary-500), var(--accent-violet))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 'var(--font-sm)', flexShrink: 0 }}>
                                {c.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</div>
                                <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>{c.role || 'No role specified'}</div>
                            </div>
                            <span style={{ fontSize: 'var(--font-xs)', fontWeight: 600, padding: '2px 8px', borderRadius: 'var(--radius-full)', background: `${typeColors[c.contactType]}22`, color: typeColors[c.contactType] }}>
                                {typeLabels[c.contactType] || 'Other'}
                            </span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)', fontSize: 'var(--font-xs)', color: 'var(--text-secondary)', marginBottom: 'var(--space-3)' }}>
                            {c.email && <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}><Mail size={12} /> {c.email}</div>}
                            {c.phone && <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}><Phone size={12} /> {c.phone}</div>}
                            {c.companyId && <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}><Building2 size={12} /> {c.companyId.name || 'Unknown'}</div>}
                        </div>
                        <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
                            <button className="btn btn-ghost btn-sm" onClick={() => { setEditingContact(c); setShowModal(true); }}><Edit2 size={14} /></button>
                            <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(c._id)} style={{ color: 'var(--accent-rose)' }}><Trash2 size={14} /></button>
                        </div>
                    </div>
                ))}
            </div>

            {pagination.pages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-2)', marginTop: 'var(--space-6)' }}>
                    {Array.from({ length: pagination.pages }, (_, i) => (
                        <button key={i} className={`btn btn-sm ${pagination.page === i + 1 ? 'btn-primary' : 'btn-ghost'}`}
                            onClick={() => setPagination(p => ({ ...p, page: i + 1 }))}>{i + 1}</button>
                    ))}
                </div>
            )}

            {showModal && <ContactModal contact={editingContact} onSave={handleSave} onClose={() => { setShowModal(false); setEditingContact(null); }} />}
        </div>
    );
};

const ContactModal = ({ contact, onSave, onClose }) => {
    const [form, setForm] = useState({ name: contact?.name || '', email: contact?.email || '', phone: contact?.phone || '', role: contact?.role || '', department: contact?.department || '', contactType: contact?.contactType || 'other', notes: contact?.notes || '' });
    const [saving, setSaving] = useState(false);
    const handleSubmit = async (e) => { e.preventDefault(); setSaving(true); await onSave(form); setSaving(false); };

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, animation: 'fadeIn 0.2s ease-out' }} onClick={onClose}>
            <div className="auth-card" style={{ maxWidth: 520, width: '100%', margin: 'var(--space-4)', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
                    <h2 style={{ fontSize: 'var(--font-xl)', fontWeight: 700 }}>{contact ? 'Edit Contact' : 'Add Contact'}</h2>
                    <button className="btn btn-ghost btn-sm" onClick={onClose}><X size={18} /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group"><label className="form-label">Full Name *</label>
                        <input className="form-input form-input-no-icon" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                        <div className="form-group"><label className="form-label">Email</label>
                            <input className="form-input form-input-no-icon" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
                        <div className="form-group"><label className="form-label">Phone</label>
                            <input className="form-input form-input-no-icon" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                        <div className="form-group"><label className="form-label">Role</label>
                            <input className="form-input form-input-no-icon" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} placeholder="e.g. CTO" /></div>
                        <div className="form-group"><label className="form-label">Type</label>
                            <select className="form-input form-input-no-icon" value={form.contactType} onChange={e => setForm(f => ({ ...f, contactType: e.target.value }))}>
                                {Object.entries(typeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                            </select></div>
                    </div>
                    <div className="form-group"><label className="form-label">Notes</label>
                        <textarea className="form-input form-input-no-icon" value={form.notes} rows={3} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} style={{ resize: 'vertical' }} /></div>
                    <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end', marginTop: 'var(--space-4)' }}>
                        <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? <span className="spinner" /> : (contact ? 'Update' : 'Create')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Contacts;
