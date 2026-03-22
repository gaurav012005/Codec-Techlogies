import { useState, useEffect } from 'react';
import api from '../api/axios';
import {
    Users, Shield, Layers, Settings, Target, FileText, UserPlus,
    Plus, Edit3, Trash2, X, ChevronDown, Save, Eye,
    CheckCircle, AlertTriangle, RefreshCw, Search
} from 'lucide-react';

const TABS = [
    { id: 'users', label: 'Users', icon: Users },
    { id: 'teams', label: 'Teams', icon: UserPlus },
    { id: 'pipeline', label: 'Pipeline Config', icon: Layers },
    { id: 'custom-fields', label: 'Custom Fields', icon: Settings },
    { id: 'targets', label: 'Sales Targets', icon: Target },
    { id: 'audit-logs', label: 'Audit Logs', icon: FileText },
];

const ROLES = ['super_admin', 'sales_manager', 'sales_executive', 'support', 'analyst'];
const FIELD_TYPES = ['text', 'number', 'date', 'dropdown', 'checkbox', 'url', 'email', 'textarea'];
const ENTITIES = ['Lead', 'Contact', 'Company', 'Deal'];

const AdminPanel = () => {
    const [activeTab, setActiveTab] = useState('users');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    // Users
    const [users, setUsers] = useState([]);
    // Custom fields
    const [customFields, setCustomFields] = useState([]);
    const [showFieldModal, setShowFieldModal] = useState(false);
    const [fieldForm, setFieldForm] = useState({ name: '', fieldType: 'text', entity: 'Lead', options: '', isRequired: false });
    const [editingField, setEditingField] = useState(null);
    // Pipelines
    const [pipelines, setPipelines] = useState([]);
    // Audit logs
    const [auditLogs, setAuditLogs] = useState([]);
    // Teams
    const [teams, setTeams] = useState([]);
    const [showTeamModal, setShowTeamModal] = useState(false);
    const [editingTeam, setEditingTeam] = useState(null);
    const [teamForm, setTeamForm] = useState({ name: '', description: '', department: '', teamLead: '', members: [], color: '#6366f1' });

    useEffect(() => {
        switch (activeTab) {
            case 'users': fetchUsers(); break;
            case 'teams': fetchTeams(); break;
            case 'pipeline': fetchPipelines(); break;
            case 'custom-fields': fetchCustomFields(); break;
            case 'audit-logs': fetchAuditLogs(); break;
        }
    }, [activeTab]);

    const showMessage = (msg, isError = false) => {
        if (isError) setError(msg);
        else setSuccess(msg);
        setTimeout(() => { setError(''); setSuccess(''); }, 3000);
    };

    // ─── Users ─────────────────
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/admin/users');
            setUsers(data.data || []);
        } catch (err) { showMessage('Failed to load users', true); }
        finally { setLoading(false); }
    };

    const updateUserRole = async (userId, role) => {
        try {
            await api.put(`/admin/users/${userId}/role`, { role });
            setUsers(prev => prev.map(u => u._id === userId ? { ...u, role } : u));
            showMessage('Role updated');
        } catch (err) { showMessage('Failed to update role', true); }
    };

    const toggleUserActive = async (userId, isActive) => {
        try {
            await api.put(`/admin/users/${userId}`, { isActive: !isActive });
            setUsers(prev => prev.map(u => u._id === userId ? { ...u, isActive: !isActive } : u));
            showMessage(isActive ? 'User deactivated' : 'User activated');
        } catch (err) { showMessage('Failed to update user', true); }
    };

    // ─── Custom Fields ─────────────────
    const fetchCustomFields = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/admin/custom-fields');
            setCustomFields(data.data || []);
        } catch (err) { showMessage('Failed to load custom fields', true); }
        finally { setLoading(false); }
    };

    const handleSaveField = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...fieldForm,
                options: fieldForm.fieldType === 'dropdown' ? fieldForm.options.split(',').map(s => s.trim()).filter(Boolean) : [],
            };
            if (editingField) {
                await api.put(`/admin/custom-fields/${editingField._id}`, payload);
            } else {
                await api.post('/admin/custom-fields', payload);
            }
            setShowFieldModal(false);
            setEditingField(null);
            fetchCustomFields();
            showMessage('Custom field saved');
        } catch (err) { showMessage('Failed to save field', true); }
    };

    const deleteCustomField = async (id) => {
        try {
            await api.delete(`/admin/custom-fields/${id}`);
            fetchCustomFields();
            showMessage('Field deleted');
        } catch (err) { showMessage('Failed to delete field', true); }
    };

    // ─── Pipelines ─────────────────
    const fetchPipelines = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/pipelines');
            setPipelines(data.data || []);
        } catch (err) { showMessage('Failed to load pipelines', true); }
        finally { setLoading(false); }
    };

    // ─── Audit Logs ─────────────────
    const fetchAuditLogs = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/admin/audit-logs');
            setAuditLogs(data.data?.logs || []);
        } catch (err) { showMessage('Failed to load audit logs', true); }
        finally { setLoading(false); }
    };

    // ─── Teams ─────────────────
    const fetchTeams = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/admin/teams');
            setTeams(data.data || []);
            if (users.length === 0) {
                const usersRes = await api.get('/admin/users');
                setUsers(usersRes.data.data || []);
            }
        } catch (err) { showMessage('Failed to load teams', true); }
        finally { setLoading(false); }
    };

    const handleSaveTeam = async (e) => {
        e.preventDefault();
        try {
            if (editingTeam) {
                await api.put(`/admin/teams/${editingTeam._id}`, teamForm);
            } else {
                await api.post('/admin/teams', teamForm);
            }
            setShowTeamModal(false);
            setEditingTeam(null);
            fetchTeams();
            showMessage('Team saved');
        } catch (err) { showMessage('Failed to save team', true); }
    };

    const deleteTeam = async (id) => {
        if (!confirm('Delete this team?')) return;
        try {
            await api.delete(`/admin/teams/${id}`);
            fetchTeams();
            showMessage('Team deleted');
        } catch (err) { showMessage('Failed to delete team', true); }
    };

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Admin Panel</h1>
                    <p className="page-subtitle">Manage users, configuration, and system settings</p>
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

            {/* ═══ Users Tab ═══ */}
            {activeTab === 'users' && (
                <div className="report-chart-card" style={{ animation: 'fadeInUp 0.3s ease-out' }}>
                    <h3 className="report-chart-title"><Users size={16} style={{ marginRight: 8, color: 'var(--primary-400)' }} />Team Members ({users.length})</h3>
                    <div className="leaderboard-table">
                        <div className="at-risk-header">
                            <span>Name</span><span>Email</span><span>Role</span><span>Status</span><span>Actions</span>
                        </div>
                        {loading ? <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div> :
                            users.map(user => (
                                <div key={user._id} className="at-risk-row">
                                    <span className="at-risk-name" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                        <div className="leaderboard-avatar">{user.name?.charAt(0)?.toUpperCase()}</div>
                                        {user.name}
                                    </span>
                                    <span style={{ color: 'var(--text-muted)', fontSize: 'var(--font-xs)' }}>{user.email}</span>
                                    <span>
                                        <select className="admin-role-select" value={user.role}
                                            onChange={(e) => updateUserRole(user._id, e.target.value)}>
                                            {ROLES.map(r => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
                                        </select>
                                    </span>
                                    <span>
                                        <span className={`probability-badge ${user.isActive ? 'hot' : 'cold'}`}>
                                            {user.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </span>
                                    <span>
                                        <button className="btn btn-ghost btn-sm" onClick={() => toggleUserActive(user._id, user.isActive)}>
                                            {user.isActive ? 'Deactivate' : 'Activate'}
                                        </button>
                                    </span>
                                </div>
                            ))}
                    </div>
                </div>
            )}

            {/* ═══ Teams Tab ═══ */}
            {activeTab === 'teams' && (
                <div style={{ animation: 'fadeInUp 0.3s ease-out' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 'var(--space-4)' }}>
                        <button className="btn btn-primary btn-sm" onClick={() => {
                            setEditingTeam(null);
                            setTeamForm({ name: '', description: '', department: '', teamLead: '', members: [], color: '#6366f1' });
                            setShowTeamModal(true);
                        }}>
                            <Plus size={16} /> Create Team
                        </button>
                    </div>
                    {loading ? <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div> :
                        teams.length === 0 ? (
                            <div className="report-chart-card" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
                                <UserPlus size={32} style={{ color: 'var(--text-muted)', opacity: 0.3, marginBottom: 12 }} />
                                <p style={{ color: 'var(--text-secondary)' }}>No teams created yet</p>
                                <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-xs)', marginTop: 4 }}>Create a team to organize your sales force</p>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-4)' }}>
                                {teams.map(team => (
                                    <div key={team._id} className="report-chart-card" style={{ borderLeft: `3px solid ${team.color || '#6366f1'}` }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-3)' }}>
                                            <div>
                                                <h4 style={{ fontWeight: 700, fontSize: 'var(--font-base)', marginBottom: 2 }}>{team.name}</h4>
                                                {team.department && <span className="at-risk-stage">{team.department}</span>}
                                            </div>
                                            <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
                                                <button className="btn btn-ghost btn-sm" onClick={() => {
                                                    setEditingTeam(team);
                                                    setTeamForm({
                                                        name: team.name, description: team.description || '',
                                                        department: team.department || '', teamLead: team.teamLead?._id || '',
                                                        members: team.members?.map(m => m._id) || [], color: team.color || '#6366f1',
                                                    });
                                                    setShowTeamModal(true);
                                                }}><Edit3 size={14} /></button>
                                                <button className="btn btn-ghost btn-sm" style={{ color: 'var(--error)' }}
                                                    onClick={() => deleteTeam(team._id)}><Trash2 size={14} /></button>
                                            </div>
                                        </div>
                                        {team.description && <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', marginBottom: 'var(--space-3)' }}>{team.description}</p>}
                                        {team.teamLead && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)', fontSize: 'var(--font-xs)' }}>
                                                <Shield size={12} style={{ color: 'var(--accent-amber)' }} />
                                                <span style={{ color: 'var(--text-secondary)' }}>Lead: <strong>{team.teamLead.name}</strong></span>
                                            </div>
                                        )}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                                            {(team.members || []).slice(0, 6).map(m => (
                                                <div key={m._id} className="leaderboard-avatar" title={m.name}
                                                    style={{ width: 28, height: 28, fontSize: '0.6rem' }}>
                                                    {m.name?.charAt(0)?.toUpperCase()}
                                                </div>
                                            ))}
                                            {(team.members || []).length > 6 && (
                                                <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>+{team.members.length - 6}</span>
                                            )}
                                            {(team.members || []).length === 0 && (
                                                <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>No members</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                </div>
            )}

            {/* ═══ Pipeline Config Tab ═══ */}
            {activeTab === 'pipeline' && (
                <div style={{ animation: 'fadeInUp 0.3s ease-out' }}>
                    {pipelines.map(pipeline => (
                        <div key={pipeline._id} className="report-chart-card" style={{ marginBottom: 'var(--space-4)' }}>
                            <h3 className="report-chart-title">
                                <Layers size={16} style={{ marginRight: 8, color: 'var(--primary-400)' }} />
                                {pipeline.name} {pipeline.isDefault && <span className="at-risk-stage" style={{ marginLeft: 8 }}>Default</span>}
                            </h3>
                            <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
                                {pipeline.stages?.map((stage, i) => (
                                    <div key={stage._id || i} className="pipeline-stage-card">
                                        <div className="pipeline-stage-dot" style={{ background: stage.color || 'var(--primary-400)' }} />
                                        <div>
                                            <div style={{ fontSize: 'var(--font-sm)', fontWeight: 600 }}>{stage.name}</div>
                                            <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
                                                Order: {stage.order} · Prob: {stage.probability}%
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ═══ Custom Fields Tab ═══ */}
            {activeTab === 'custom-fields' && (
                <div style={{ animation: 'fadeInUp 0.3s ease-out' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 'var(--space-4)' }}>
                        <button className="btn btn-primary btn-sm" onClick={() => {
                            setEditingField(null);
                            setFieldForm({ name: '', fieldType: 'text', entity: 'Lead', options: '', isRequired: false });
                            setShowFieldModal(true);
                        }}>
                            <Plus size={16} /> Add Field
                        </button>
                    </div>
                    <div className="report-chart-card">
                        <div className="leaderboard-table">
                            <div className="at-risk-header">
                                <span>Name</span><span>Type</span><span>Entity</span><span>Required</span><span>Actions</span>
                            </div>
                            {customFields.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>No custom fields defined</div>}
                            {customFields.map(f => (
                                <div key={f._id} className="at-risk-row">
                                    <span className="at-risk-name">{f.name}</span>
                                    <span className="at-risk-stage">{f.fieldType}</span>
                                    <span>{f.entity}</span>
                                    <span>{f.isRequired ? <CheckCircle size={14} style={{ color: 'var(--accent-emerald)' }} /> : '-'}</span>
                                    <span style={{ display: 'flex', gap: 'var(--space-2)' }}>
                                        <button className="btn btn-ghost btn-sm" onClick={() => {
                                            setEditingField(f);
                                            setFieldForm({ name: f.name, fieldType: f.fieldType, entity: f.entity, options: (f.options || []).join(', '), isRequired: f.isRequired });
                                            setShowFieldModal(true);
                                        }}><Edit3 size={14} /></button>
                                        <button className="btn btn-ghost btn-sm" style={{ color: 'var(--error)' }} onClick={() => deleteCustomField(f._id)}>
                                            <Trash2 size={14} />
                                        </button>
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ Audit Logs Tab ═══ */}
            {activeTab === 'audit-logs' && (
                <div className="report-chart-card" style={{ animation: 'fadeInUp 0.3s ease-out' }}>
                    <h3 className="report-chart-title"><FileText size={16} style={{ marginRight: 8, color: 'var(--primary-400)' }} />Activity Log</h3>
                    <div className="leaderboard-table">
                        <div className="at-risk-header">
                            <span>Action</span><span>Entity</span><span>User</span><span>Description</span><span>Time</span>
                        </div>
                        {loading ? <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div> :
                            auditLogs.length === 0 ? <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>No audit logs</div> :
                                auditLogs.map(log => (
                                    <div key={log._id} className="at-risk-row">
                                        <span className="at-risk-stage">{log.action?.replace(/_/g, ' ')}</span>
                                        <span>{log.entity}</span>
                                        <span style={{ color: 'var(--text-muted)' }}>{log.userId?.name || 'System'}</span>
                                        <span style={{ fontSize: 'var(--font-xs)' }}>{log.description}</span>
                                        <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
                                            {new Date(log.createdAt).toLocaleString()}
                                        </span>
                                    </div>
                                ))}
                    </div>
                </div>
            )}

            {/* ═══ Sales Targets Tab ═══ */}
            {activeTab === 'targets' && (
                <div className="report-chart-card" style={{ animation: 'fadeInUp 0.3s ease-out' }}>
                    <h3 className="report-chart-title"><Target size={16} style={{ marginRight: 8, color: 'var(--accent-amber)' }} />Sales Targets</h3>
                    <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                        <Target size={32} style={{ marginBottom: 12, opacity: 0.4 }} />
                        <p>Sales target configuration will apply once team data is available.</p>
                        <p style={{ fontSize: 'var(--font-xs)', marginTop: 8 }}>Set individual monthly/quarterly revenue targets for each team member.</p>
                    </div>
                </div>
            )}

            {/* Custom Field Modal */}
            {showFieldModal && (
                <div className="modal-overlay" onClick={() => setShowFieldModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingField ? 'Edit Custom Field' : 'New Custom Field'}</h2>
                            <button className="btn btn-ghost btn-sm" onClick={() => setShowFieldModal(false)}><X size={18} /></button>
                        </div>
                        <form onSubmit={handleSaveField}>
                            <div className="form-group">
                                <label className="form-label">Field Name</label>
                                <input className="form-input form-input-no-icon" value={fieldForm.name}
                                    onChange={e => setFieldForm(p => ({ ...p, name: e.target.value }))} required />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                                <div className="form-group">
                                    <label className="form-label">Field Type</label>
                                    <select className="form-input form-input-no-icon" value={fieldForm.fieldType}
                                        onChange={e => setFieldForm(p => ({ ...p, fieldType: e.target.value }))}>
                                        {FIELD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Entity</label>
                                    <select className="form-input form-input-no-icon" value={fieldForm.entity}
                                        onChange={e => setFieldForm(p => ({ ...p, entity: e.target.value }))}>
                                        {ENTITIES.map(e => <option key={e} value={e}>{e}</option>)}
                                    </select>
                                </div>
                            </div>
                            {fieldForm.fieldType === 'dropdown' && (
                                <div className="form-group">
                                    <label className="form-label">Options (comma-separated)</label>
                                    <input className="form-input form-input-no-icon" value={fieldForm.options}
                                        onChange={e => setFieldForm(p => ({ ...p, options: e.target.value }))} placeholder="Option 1, Option 2, Option 3" />
                                </div>
                            )}
                            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                <input type="checkbox" id="isRequired" checked={fieldForm.isRequired}
                                    onChange={e => setFieldForm(p => ({ ...p, isRequired: e.target.checked }))} />
                                <label htmlFor="isRequired" className="form-label" style={{ margin: 0 }}>Required field</label>
                            </div>
                            <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
                                <button type="button" className="btn btn-ghost" onClick={() => setShowFieldModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary"><Save size={16} /> Save Field</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Team Modal */}
            {showTeamModal && (
                <div className="modal-overlay" onClick={() => setShowTeamModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingTeam ? 'Edit Team' : 'Create Team'}</h2>
                            <button className="btn btn-ghost btn-sm" onClick={() => setShowTeamModal(false)}><X size={18} /></button>
                        </div>
                        <form onSubmit={handleSaveTeam}>
                            <div className="form-group">
                                <label className="form-label">Team Name *</label>
                                <input className="form-input form-input-no-icon" required value={teamForm.name}
                                    onChange={e => setTeamForm(f => ({ ...f, name: e.target.value }))} placeholder="Sales Team A" />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                                <div className="form-group">
                                    <label className="form-label">Department</label>
                                    <input className="form-input form-input-no-icon" value={teamForm.department}
                                        onChange={e => setTeamForm(f => ({ ...f, department: e.target.value }))} placeholder="Sales" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Color</label>
                                    <input type="color" value={teamForm.color} style={{ width: '100%', height: 38, border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}
                                        onChange={e => setTeamForm(f => ({ ...f, color: e.target.value }))} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Description</label>
                                <textarea className="form-input form-input-no-icon" rows={2} value={teamForm.description}
                                    onChange={e => setTeamForm(f => ({ ...f, description: e.target.value }))} placeholder="Team description..." style={{ resize: 'vertical' }} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Team Lead</label>
                                <select className="form-input form-input-no-icon" value={teamForm.teamLead}
                                    onChange={e => setTeamForm(f => ({ ...f, teamLead: e.target.value }))}>
                                    <option value="">Select team lead...</option>
                                    {users.map(u => <option key={u._id} value={u._id}>{u.name} ({u.role?.replace('_', ' ')})</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Members</label>
                                <div style={{ maxHeight: 160, overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: 'var(--space-2)' }}>
                                    {users.map(u => (
                                        <label key={u._id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', padding: '4px var(--space-2)', cursor: 'pointer', fontSize: 'var(--font-sm)' }}>
                                            <input type="checkbox" checked={teamForm.members.includes(u._id)}
                                                onChange={e => {
                                                    if (e.target.checked) setTeamForm(f => ({ ...f, members: [...f.members, u._id] }));
                                                    else setTeamForm(f => ({ ...f, members: f.members.filter(m => m !== u._id) }));
                                                }} />
                                            {u.name}
                                            <span style={{ marginLeft: 'auto', fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>{u.role?.replace('_', ' ')}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
                                <button type="button" className="btn btn-ghost" onClick={() => setShowTeamModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary"><Save size={16} /> {editingTeam ? 'Update' : 'Create'} Team</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPanel;
