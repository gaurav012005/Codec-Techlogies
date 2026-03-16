import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { getDeliveries, getDrivers, getVehicles, createDelivery, updateDelivery, deleteDelivery } from '../services/api';

const statusList = ['All', 'pending', 'assigned', 'picked_up', 'in_transit', 'delivered'];
const statusLabels = { pending: 'Pending', assigned: 'Assigned', picked_up: 'Picked Up', in_transit: 'In Transit', delivered: 'Delivered' };

export default function DeliveriesPage() {
    const navigate = useNavigate();
    const [deliveries, setDeliveries] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [filter, setFilter] = useState('All');
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ pickup_location: '', drop_location: '', driver_id: '', vehicle_id: '', scheduled_time: '', status: 'pending' });
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [delRes, drvRes, vehRes] = await Promise.all([getDeliveries(), getDrivers(), getVehicles()]);
            setDeliveries(delRes.data);
            setDrivers(drvRes.data);
            setVehicles(vehRes.data);
        } catch (err) {
            console.error('Deliveries fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const filtered = deliveries.filter(d => {
        if (filter !== 'All' && d.status !== filter) return false;
        if (search) {
            const s = search.toLowerCase();
            return (d.pickup_location?.toLowerCase().includes(s) || d.drop_location?.toLowerCase().includes(s) || d.driver_name?.toLowerCase().includes(s) || d.vehicle_number?.toLowerCase().includes(s) || `#${d.id}`.includes(s));
        }
        return true;
    });

    const openAdd = () => {
        setEditing(null);
        setForm({ pickup_location: '', drop_location: '', driver_id: '', vehicle_id: '', scheduled_time: '', status: 'pending' });
        setShowModal(true);
    };

    const openEdit = (d) => {
        setEditing(d);
        setForm({
            pickup_location: d.pickup_location,
            drop_location: d.drop_location,
            driver_id: d.driver_id || '',
            vehicle_id: d.vehicle_id || '',
            scheduled_time: d.scheduled_time ? new Date(d.scheduled_time).toISOString().slice(0, 16) : '',
            status: d.status,
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...form, driver_id: form.driver_id || null, vehicle_id: form.vehicle_id || null, scheduled_time: form.scheduled_time || null };
            if (editing) {
                await updateDelivery(editing.id, payload);
            } else {
                await createDelivery(payload);
            }
            setShowModal(false);
            fetchData();
        } catch (err) {
            console.error('Save delivery error:', err);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this delivery?')) return;
        try {
            await deleteDelivery(id);
            fetchData();
        } catch (err) {
            console.error('Delete delivery error:', err);
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            await updateDelivery(id, { status: newStatus });
            fetchData();
        } catch (err) {
            console.error('Status update error:', err);
        }
    };

    const counts = { All: deliveries.length };
    statusList.slice(1).forEach(s => { counts[s] = deliveries.filter(d => d.status === s).length; });

    return (
        <div className="app-layout">
            <Sidebar />
            <main className="main-content">
                <header className="header">
                    <div className="header-left">
                        <h2 className="header-title">Deliveries</h2>
                        <div className="header-divider"></div>
                        <span className="header-time">{deliveries.length} total deliveries</span>
                    </div>
                    <div className="header-right">
                        <div className="header-search">
                            <span className="material-symbols-outlined">search</span>
                            <input type="text" placeholder="Search deliveries..." value={search} onChange={e => setSearch(e.target.value)} />
                        </div>
                        <button className="btn-primary" onClick={openAdd} style={{ padding: '8px 20px', fontSize: 13 }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 16, verticalAlign: 'middle', marginRight: 6 }}>add</span>
                            New Delivery
                        </button>
                    </div>
                </header>

                <div className="dashboard-content">
                    {/* Filter Tabs */}
                    <div className="filter-tabs">
                        {statusList.map(s => (
                            <button key={s} className={`filter-tab ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>
                                {s === 'All' ? 'All' : statusLabels[s]}
                                <span className="filter-tab-count">{counts[s] || 0}</span>
                            </button>
                        ))}
                    </div>

                    {/* Delivery Table */}
                    <div className="data-table-card">
                        <div className="data-table-header">
                            <div>
                                <h4 className="data-table-title">Delivery Orders</h4>
                                <p className="data-table-subtitle">{filtered.length} deliveries shown</p>
                            </div>
                        </div>
                        <div style={{ overflowX: 'auto' }}>
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Order</th>
                                        <th>Pickup</th>
                                        <th>Drop-off</th>
                                        <th>Driver</th>
                                        <th>Vehicle</th>
                                        <th>Status</th>
                                        <th>Scheduled</th>
                                        <th className="text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan="8" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Loading...</td></tr>
                                    ) : filtered.length === 0 ? (
                                        <tr><td colSpan="8" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No deliveries found</td></tr>
                                    ) : filtered.map(d => (
                                        <tr key={d.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/admin/deliveries/${d.id}`)}>
                                            <td className="bold">#{d.id}</td>
                                            <td style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.pickup_location}</td>
                                            <td style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.drop_location}</td>
                                            <td>{d.driver_name || <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                                            <td>{d.vehicle_number || <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                                            <td>
                                                <select
                                                    className="status-select"
                                                    value={d.status}
                                                    onClick={e => e.stopPropagation()}
                                                    onChange={e => handleStatusChange(d.id, e.target.value)}
                                                >
                                                    {statusList.slice(1).map(s => <option key={s} value={s}>{statusLabels[s]}</option>)}
                                                </select>
                                            </td>
                                            <td style={{ fontSize: 11 }}>{d.scheduled_time ? new Date(d.scheduled_time).toLocaleString() : '—'}</td>
                                            <td className="text-right">
                                                <div className="table-actions">
                                                    <button className="table-action-btn" onClick={(e) => { e.stopPropagation(); openEdit(d); }} title="Edit">
                                                        <span className="material-symbols-outlined">edit</span>
                                                    </button>
                                                    <button className="table-action-btn danger" onClick={(e) => { e.stopPropagation(); handleDelete(d.id); }} title="Delete">
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
                                <h3>{editing ? `Edit Delivery #${editing.id}` : 'Create New Delivery'}</h3>
                                <button className="modal-close" onClick={() => setShowModal(false)}>
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Pickup Location</label>
                                            <input type="text" value={form.pickup_location} onChange={e => setForm({ ...form, pickup_location: e.target.value })} placeholder="e.g. Chicago Hub #4" required />
                                        </div>
                                        <div className="form-group">
                                            <label>Drop-off Location</label>
                                            <input type="text" value={form.drop_location} onChange={e => setForm({ ...form, drop_location: e.target.value })} placeholder="e.g. 742 Evergreen Terrace" required />
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Driver</label>
                                            <select className="form-select" value={form.driver_id} onChange={e => setForm({ ...form, driver_id: e.target.value })}>
                                                <option value="">— Unassigned —</option>
                                                {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Vehicle</label>
                                            <select className="form-select" value={form.vehicle_id} onChange={e => setForm({ ...form, vehicle_id: e.target.value })}>
                                                <option value="">— No Vehicle —</option>
                                                {vehicles.map(v => <option key={v.id} value={v.id}>{v.vehicle_number}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Scheduled Time</label>
                                            <input type="datetime-local" value={form.scheduled_time} onChange={e => setForm({ ...form, scheduled_time: e.target.value })} />
                                        </div>
                                        {editing && (
                                            <div className="form-group">
                                                <label>Status</label>
                                                <select className="form-select" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                                                    {statusList.slice(1).map(s => <option key={s} value={s}>{statusLabels[s]}</option>)}
                                                </select>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                                    <button type="submit" className="btn-primary">{editing ? 'Save Changes' : 'Create Delivery'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
