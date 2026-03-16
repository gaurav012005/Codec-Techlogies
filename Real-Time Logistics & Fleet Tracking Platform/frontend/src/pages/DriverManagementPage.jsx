import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { getDrivers, deleteDriver, updateDriver } from '../services/api';
import api from '../services/api';

const statusColors = { online: '#10b981', offline: '#94a3b8', busy: '#f59e0b' };

export default function DriverManagementPage() {
    const [drivers, setDrivers] = useState([]);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchDrivers = async () => {
        try {
            const res = await getDrivers();
            setDrivers(res.data);
        } catch (err) {
            console.error('Drivers fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchDrivers(); }, []);

    const filtered = drivers.filter(d => {
        if (!search) return true;
        const s = search.toLowerCase();
        return d.name?.toLowerCase().includes(s) || d.email?.toLowerCase().includes(s) || `#${d.id}`.includes(s);
    });

    const openAdd = () => {
        setEditing(null);
        setForm({ name: '', email: '', password: '' });
        setError('');
        setShowModal(true);
    };

    const openEdit = (d) => {
        setEditing(d);
        setForm({ name: d.name, email: d.email, password: '' });
        setError('');
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (editing) {
                await updateDriver(editing.id, { name: form.name, email: form.email });
            } else {
                // Create driver via register endpoint with role=driver
                if (!form.password || form.password.length < 6) {
                    setError('Password must be at least 6 characters');
                    return;
                }
                await api.post('/auth/register', { name: form.name, email: form.email, password: form.password, role: 'driver' });
            }
            setShowModal(false);
            fetchDrivers();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to save driver');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Remove this driver? Their assignments will be unlinked.')) return;
        try {
            await deleteDriver(id);
            fetchDrivers();
        } catch (err) {
            console.error('Delete driver error:', err);
        }
    };

    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const getAvatarColor = (id) => {
        const colors = ['#137fec', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4'];
        return colors[(id || 0) % colors.length];
    };

    return (
        <div className="app-layout">
            <Sidebar />
            <main className="main-content">
                <header className="header">
                    <div className="header-left">
                        <h2 className="header-title">Driver Management</h2>
                        <div className="header-divider"></div>
                        <span className="header-time">{drivers.length} registered drivers</span>
                    </div>
                    <div className="header-right">
                        <div className="header-search">
                            <span className="material-symbols-outlined">search</span>
                            <input type="text" placeholder="Search drivers..." value={search} onChange={e => setSearch(e.target.value)} />
                        </div>
                        <button className="btn-primary" onClick={openAdd} style={{ padding: '8px 20px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>person_add</span>
                            Add Driver
                        </button>
                    </div>
                </header>

                <div className="dashboard-content">
                    {/* KPI Row */}
                    <div className="kpi-grid">
                        <div className="kpi-card">
                            <p className="kpi-label">Total Drivers</p>
                            <h3 className="kpi-value">{drivers.length}</h3>
                        </div>
                        <div className="kpi-card">
                            <p className="kpi-label">Recently Added</p>
                            <h3 className="kpi-value" style={{ color: 'var(--primary)' }}>
                                {drivers.filter(d => {
                                    const dayAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
                                    return new Date(d.created_at) > dayAgo;
                                }).length}
                            </h3>
                            <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>Last 7 days</p>
                        </div>
                        <div className="kpi-card">
                            <p className="kpi-label">With Assignments</p>
                            <h3 className="kpi-value" style={{ color: 'var(--emerald)' }}>
                                {drivers.filter(d => d.delivery_count > 0).length}
                            </h3>
                        </div>
                        <div className="kpi-card">
                            <p className="kpi-label">Unassigned</p>
                            <h3 className="kpi-value" style={{ color: 'var(--text-muted)' }}>
                                {drivers.filter(d => !d.delivery_count || d.delivery_count === 0).length}
                            </h3>
                        </div>
                    </div>

                    {/* Driver Grid */}
                    <div className="driver-grid">
                        {loading ? (
                            <div style={{ gridColumn: '1 / -1', padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
                        ) : filtered.length === 0 ? (
                            <div style={{ gridColumn: '1 / -1', padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
                                <span className="material-symbols-outlined" style={{ fontSize: 48, display: 'block', marginBottom: 8 }}>group_off</span>
                                No drivers found
                            </div>
                        ) : filtered.map(d => (
                            <div key={d.id} className="driver-mgmt-card">
                                <div className="driver-mgmt-card-header">
                                    <div className="driver-mgmt-avatar" style={{ background: getAvatarColor(d.id) }}>
                                        {getInitials(d.name)}
                                    </div>
                                    <div className="driver-mgmt-card-actions">
                                        <button className="table-action-btn" onClick={() => openEdit(d)} title="Edit">
                                            <span className="material-symbols-outlined">edit</span>
                                        </button>
                                        <button className="table-action-btn danger" onClick={() => handleDelete(d.id)} title="Remove">
                                            <span className="material-symbols-outlined">delete</span>
                                        </button>
                                    </div>
                                </div>
                                <div className="driver-mgmt-card-body">
                                    <h4 className="driver-mgmt-name">{d.name}</h4>
                                    <p className="driver-mgmt-email">{d.email}</p>
                                    <div className="driver-mgmt-meta">
                                        <div className="driver-mgmt-meta-item">
                                            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>badge</span>
                                            ID: #{d.id}
                                        </div>
                                        <div className="driver-mgmt-meta-item">
                                            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>calendar_today</span>
                                            {new Date(d.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </div>
                                    </div>
                                    {d.delivery_count > 0 && (
                                        <div className="driver-mgmt-stats">
                                            <div className="driver-mgmt-stat">
                                                <span className="driver-mgmt-stat-value">{d.delivery_count}</span>
                                                <span className="driver-mgmt-stat-label">Deliveries</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Add/Edit Modal */}
                {showModal && (
                    <div className="modal-overlay" onClick={() => setShowModal(false)}>
                        <div className="modal-card" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3>{editing ? 'Edit Driver' : 'Add New Driver'}</h3>
                                <button className="modal-close" onClick={() => setShowModal(false)}>
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    {error && (
                                        <div className="login-error" style={{ marginBottom: 16 }}>
                                            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>error</span>
                                            {error}
                                        </div>
                                    )}
                                    <div className="form-group">
                                        <label>Full Name</label>
                                        <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. James Wilson" required />
                                    </div>
                                    <div className="form-group">
                                        <label>Email Address</label>
                                        <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="e.g. james@fleettrack.com" required />
                                    </div>
                                    {!editing && (
                                        <div className="form-group">
                                            <label>Password</label>
                                            <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Min 6 characters" required minLength={6} />
                                            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Driver will use this to log into their console</p>
                                        </div>
                                    )}
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                                    <button type="submit" className="btn-primary">{editing ? 'Save Changes' : 'Create Driver'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
