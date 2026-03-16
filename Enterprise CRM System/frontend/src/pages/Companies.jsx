import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { Plus, Search, Edit2, Trash2, X, Building2, Globe, Phone, MapPin, Users } from 'lucide-react';

const sizeLabels = { '1-10': '1-10', '11-50': '11-50', '51-200': '51-200', '201-500': '201-500', '501-1000': '501-1K', '1000+': '1K+' };

const Companies = () => {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);

    const fetchCompanies = useCallback(async () => {
        try {
            setLoading(true);
            const params = { page: pagination.page, limit: 15 };
            if (search) params.search = search;
            const { data } = await api.get('/companies', { params });
            setCompanies(data.data.companies);
            setPagination(data.data.pagination);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    }, [search, pagination.page]);

    useEffect(() => { fetchCompanies(); }, [fetchCompanies]);

    const handleDelete = async (id) => { if (!window.confirm('Delete?')) return; await api.delete(`/companies/${id}`); fetchCompanies(); };
    const handleSave = async (formData) => {
        try {
            if (editing) await api.put(`/companies/${editing._id}`, formData);
            else await api.post('/companies', formData);
            setShowModal(false); setEditing(null); fetchCompanies();
        } catch (err) { alert(err.response?.data?.message || 'Failed'); }
    };

    const getHealthColor = (score) => { if (score >= 70) return '#10b981'; if (score >= 40) return '#f59e0b'; return '#ef4444'; };

    return (
        <div>
            <div className="page-header">
                <div><h1 className="page-title">Companies</h1><p className="page-subtitle">Manage your organization directory</p></div>
                <button className="btn btn-primary" onClick={() => { setEditing(null); setShowModal(true); }}><Plus size={18} /> Add Company</button>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
                <div className="form-input-wrapper" style={{ flex: 1, minWidth: 250 }}>
                    <input className="form-input" placeholder="Search companies..." value={search}
                        onChange={(e) => { setSearch(e.target.value); setPagination(p => ({ ...p, page: 1 })); }} />
                    <Search className="form-input-icon" />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 'var(--space-4)' }}>
                {loading ? (
                    <div className="kpi-card" style={{ gridColumn: '1/-1', textAlign: 'center', padding: 'var(--space-10)' }}>
                        <div className="spinner" style={{ margin: '0 auto', borderColor: 'rgba(99,102,241,0.2)', borderTopColor: 'var(--primary-400)', width: 32, height: 32 }} />
                    </div>
                ) : companies.length === 0 ? (
                    <div className="kpi-card" style={{ gridColumn: '1/-1', textAlign: 'center', padding: 'var(--space-10)', color: 'var(--text-muted)' }}>
                        No companies found. Click "Add Company" to get started.
                    </div>
                ) : companies.map((c) => (
                    <div key={c._id} className="kpi-card" style={{ padding: 'var(--space-5)' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                            <div style={{ width: 46, height: 46, borderRadius: 'var(--radius-lg)', background: 'linear-gradient(135deg, var(--primary-600), var(--accent-cyan))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Building2 size={22} color="white" />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 700, fontSize: 'var(--font-base)', color: 'var(--text-primary)' }}>{c.name}</div>
                                <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>{c.industry || 'No industry'} {c.size ? `• ${sizeLabels[c.size] || c.size} employees` : ''}</div>
                            </div>
                            {/* Health Score */}
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ width: 38, height: 38, borderRadius: 'var(--radius-full)', border: `2px solid ${getHealthColor(c.healthScore)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--font-xs)', fontWeight: 700, color: getHealthColor(c.healthScore) }}>
                                    {c.healthScore}
                                </div>
                                <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: 2 }}>Health</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)', fontSize: 'var(--font-xs)', color: 'var(--text-secondary)', marginBottom: 'var(--space-3)' }}>
                            {c.website && <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}><Globe size={12} /> {c.website}</div>}
                            {c.phone && <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}><Phone size={12} /> {c.phone}</div>}
                            {c.address?.city && <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}><MapPin size={12} /> {[c.address.city, c.address.country].filter(Boolean).join(', ')}</div>}
                        </div>
                        <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end', borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-3)' }}>
                            <button className="btn btn-ghost btn-sm" onClick={() => { setEditing(c); setShowModal(true); }}><Edit2 size={14} /> Edit</button>
                            <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(c._id)} style={{ color: 'var(--accent-rose)' }}><Trash2 size={14} /></button>
                        </div>
                    </div>
                ))}
            </div>

            {pagination.pages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-2)', marginTop: 'var(--space-6)' }}>
                    {Array.from({ length: pagination.pages }, (_, i) => <button key={i} className={`btn btn-sm ${pagination.page === i + 1 ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setPagination(p => ({ ...p, page: i + 1 }))}>{i + 1}</button>)}
                </div>
            )}

            {showModal && <CompanyModal company={editing} onSave={handleSave} onClose={() => { setShowModal(false); setEditing(null); }} />}
        </div>
    );
};

const CompanyModal = ({ company, onSave, onClose }) => {
    const [form, setForm] = useState({
        name: company?.name || '', industry: company?.industry || '', size: company?.size || '',
        website: company?.website || '', phone: company?.phone || '', email: company?.email || '',
        notes: company?.notes || '',
        address: { street: company?.address?.street || '', city: company?.address?.city || '', state: company?.address?.state || '', country: company?.address?.country || '', zip: company?.address?.zip || '' },
    });
    const [saving, setSaving] = useState(false);
    const handleSubmit = async (e) => { e.preventDefault(); setSaving(true); await onSave(form); setSaving(false); };
    const setAddr = (k, v) => setForm(f => ({ ...f, address: { ...f.address, [k]: v } }));

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, animation: 'fadeIn 0.2s ease-out' }} onClick={onClose}>
            <div className="auth-card" style={{ maxWidth: 560, width: '100%', margin: 'var(--space-4)', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
                    <h2 style={{ fontSize: 'var(--font-xl)', fontWeight: 700 }}>{company ? 'Edit Company' : 'Add Company'}</h2>
                    <button className="btn btn-ghost btn-sm" onClick={onClose}><X size={18} /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group"><label className="form-label">Company Name *</label>
                        <input className="form-input form-input-no-icon" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                        <div className="form-group"><label className="form-label">Industry</label>
                            <input className="form-input form-input-no-icon" value={form.industry} onChange={e => setForm(f => ({ ...f, industry: e.target.value }))} /></div>
                        <div className="form-group"><label className="form-label">Size</label>
                            <select className="form-input form-input-no-icon" value={form.size} onChange={e => setForm(f => ({ ...f, size: e.target.value }))}>
                                <option value="">Select...</option>
                                {Object.entries(sizeLabels).map(([k, v]) => <option key={k} value={k}>{v} employees</option>)}
                            </select></div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                        <div className="form-group"><label className="form-label">Website</label>
                            <input className="form-input form-input-no-icon" value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} placeholder="https://..." /></div>
                        <div className="form-group"><label className="form-label">Phone</label>
                            <input className="form-input form-input-no-icon" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                        <div className="form-group"><label className="form-label">City</label>
                            <input className="form-input form-input-no-icon" value={form.address.city} onChange={e => setAddr('city', e.target.value)} /></div>
                        <div className="form-group"><label className="form-label">Country</label>
                            <input className="form-input form-input-no-icon" value={form.address.country} onChange={e => setAddr('country', e.target.value)} /></div>
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end', marginTop: 'var(--space-4)' }}>
                        <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? <span className="spinner" /> : (company ? 'Update' : 'Create')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Companies;
