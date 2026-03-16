import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { getVehicles, getDrivers, createVehicle, deleteVehicle, updateVehicle } from '../services/api';

const statusOptions = ['All', 'active', 'idle', 'delayed', 'maintenance'];

export default function FleetManagementPage() {
    const [vehicles, setVehicles] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [filter, setFilter] = useState('All');
    const [showModal, setShowModal] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState(null);
    const [form, setForm] = useState({ vehicle_number: '', driver_id: '', status: 'idle' });
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [vehRes, drvRes] = await Promise.all([getVehicles(), getDrivers()]);
            setVehicles(vehRes.data);
            setDrivers(drvRes.data);
        } catch (err) {
            console.error('Fleet fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const filtered = filter === 'All' ? vehicles : vehicles.filter(v => v.status === filter);

    const openAdd = () => {
        setEditingVehicle(null);
        setForm({ vehicle_number: '', driver_id: '', status: 'idle' });
        setShowModal(true);
    };

    const openEdit = (v) => {
        setEditingVehicle(v);
        setForm({ vehicle_number: v.vehicle_number, driver_id: v.driver_id || '', status: v.status });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingVehicle) {
                await updateVehicle(editingVehicle.id, form);
            } else {
                await createVehicle(form);
            }
            setShowModal(false);
            fetchData();
        } catch (err) {
            console.error('Save vehicle error:', err);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this vehicle?')) return;
        try {
            await deleteVehicle(id);
            fetchData();
        } catch (err) {
            console.error('Delete vehicle error:', err);
        }
    };

    const getStatusCounts = () => {
        const counts = { All: vehicles.length };
        statusOptions.slice(1).forEach(s => { counts[s] = vehicles.filter(v => v.status === s).length; });
        return counts;
    };
    const counts = getStatusCounts();

    return (
        <div className="app-layout">
            <Sidebar />
            <main className="main-content">
                <header className="header">
                    <div className="header-left">
                        <h2 className="header-title">Fleet Management</h2>
                        <div className="header-divider"></div>
                        <span className="header-time">{vehicles.length} vehicles registered</span>
                    </div>
                    <div className="header-right">
                        <button className="btn-primary" onClick={openAdd} style={{ padding: '8px 20px', fontSize: 13 }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 16, verticalAlign: 'middle', marginRight: 6 }}>add</span>
                            Add Vehicle
                        </button>
                    </div>
                </header>

                <div className="dashboard-content">
                    {/* KPI Row */}
                    <div className="kpi-grid">
                        <div className="kpi-card">
                            <p className="kpi-label">Total Vehicles</p>
                            <h3 className="kpi-value">{vehicles.length}</h3>
                        </div>
                        <div className="kpi-card">
                            <p className="kpi-label">Active</p>
                            <div className="kpi-value-row">
                                <h3 className="kpi-value" style={{ color: 'var(--emerald)' }}>{counts.active || 0}</h3>
                            </div>
                        </div>
                        <div className="kpi-card">
                            <p className="kpi-label">Idle</p>
                            <h3 className="kpi-value" style={{ color: 'var(--primary)' }}>{counts.idle || 0}</h3>
                        </div>
                        <div className="kpi-card">
                            <p className="kpi-label">Delayed</p>
                            <h3 className="kpi-value" style={{ color: 'var(--red)' }}>{counts.delayed || 0}</h3>
                        </div>
                    </div>

                    {/* Filter Tabs */}
                    <div className="filter-tabs">
                        {statusOptions.map(s => (
                            <button key={s} className={`filter-tab ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>
                                {s === 'All' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                                <span className="filter-tab-count">{counts[s] || 0}</span>
                            </button>
                        ))}
                    </div>

                    {/* Vehicle Table */}
                    <div className="data-table-card">
                        <div className="data-table-header">
                            <div>
                                <h4 className="data-table-title">Vehicle Fleet</h4>
                                <p className="data-table-subtitle">{filtered.length} vehicles shown</p>
                            </div>
                        </div>
                        <div style={{ overflowX: 'auto' }}>
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Vehicle ID</th>
                                        <th>Vehicle Number</th>
                                        <th>Assigned Driver</th>
                                        <th>Status</th>
                                        <th className="text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan="5" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Loading...</td></tr>
                                    ) : filtered.length === 0 ? (
                                        <tr><td colSpan="5" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No vehicles found</td></tr>
                                    ) : filtered.map(v => (
                                        <tr key={v.id}>
                                            <td className="bold">#{v.id}</td>
                                            <td className="bold">{v.vehicle_number}</td>
                                            <td>{v.driver_name || <span style={{ color: 'var(--text-muted)' }}>Unassigned</span>}</td>
                                            <td><span className={`status-badge ${v.status}`}>{v.status?.charAt(0).toUpperCase() + v.status?.slice(1)}</span></td>
                                            <td className="text-right">
                                                <div className="table-actions">
                                                    <button className="table-action-btn" onClick={() => openEdit(v)} title="Edit">
                                                        <span className="material-symbols-outlined">edit</span>
                                                    </button>
                                                    <button className="table-action-btn danger" onClick={() => handleDelete(v.id)} title="Delete">
                                                        <span className="material-symbols-outlined">delete</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Add/Edit Modal */}
                {showModal && (
                    <div className="modal-overlay" onClick={() => setShowModal(false)}>
                        <div className="modal-card" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3>{editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}</h3>
                                <button className="modal-close" onClick={() => setShowModal(false)}>
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    <div className="form-group">
                                        <label>Vehicle Number</label>
                                        <input type="text" value={form.vehicle_number} onChange={e => setForm({ ...form, vehicle_number: e.target.value })} placeholder="e.g. FT-1234" required />
                                    </div>
                                    <div className="form-group">
                                        <label>Assign Driver</label>
                                        <select className="form-select" value={form.driver_id} onChange={e => setForm({ ...form, driver_id: e.target.value })}>
                                            <option value="">— No Driver —</option>
                                            {drivers.map(d => <option key={d.id} value={d.id}>{d.name} ({d.email})</option>)}
                                        </select>
                                    </div>
                                    {editingVehicle && (
                                        <div className="form-group">
                                            <label>Status</label>
                                            <select className="form-select" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                                                {statusOptions.slice(1).map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                                            </select>
                                        </div>
                                    )}
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                                    <button type="submit" className="btn-primary">{editingVehicle ? 'Save Changes' : 'Add Vehicle'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
