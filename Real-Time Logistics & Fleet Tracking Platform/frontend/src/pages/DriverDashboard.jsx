import { useState, useEffect, useRef } from 'react';
import { getMyDeliveries, updateDeliveryStatus, uploadPOD, uploadSignature } from '../services/api';
import SignatureCanvas from 'react-signature-canvas';
import { connectSocket, disconnectSocket } from '../services/socket';

const statusLabels = { pending: 'Pending', assigned: 'Assigned', picked_up: 'Picked Up', in_transit: 'In Transit', delivered: 'Delivered' };
const nextStatus = { assigned: 'picked_up', picked_up: 'in_transit', in_transit: 'delivered' };
const nextLabel = { assigned: 'Mark as Picked Up', picked_up: 'Start Transit', in_transit: 'Mark as Delivered' };

export default function DriverDashboard() {
    const [deliveries, setDeliveries] = useState([]);
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const fileRef = useRef(null);
    const sigCanvas = useRef(null);
    const [showSignatureModal, setShowSignatureModal] = useState(false);

    const handleSignatureUpload = async (id) => {
        if (sigCanvas.current.isEmpty()) return;
        setLoading(true);
        const signatureStr = sigCanvas.current.getCanvas().toDataURL('image/png');
        try {
            await uploadSignature(id, signatureStr);
            setShowSignatureModal(false);
            fetchDeliveries();
        } catch (err) {
            console.error('Signature upload error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handlePODUpload = async (e, id) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('proof_image', file);
        setLoading(true);
        try {
            await uploadPOD(id, formData);
            fetchDeliveries();
        } catch (err) {
            console.error('POD upload error:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchDeliveries = async () => {
        try {
            const res = await getMyDeliveries();
            setDeliveries(res.data);
        } catch (err) {
            console.error('Fetch deliveries error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchDeliveries(); }, []);

    useEffect(() => {
        const socket = connectSocket();
        socket.on('delivery:updated', () => fetchDeliveries());
        return () => disconnectSocket();
    }, []);

    const handleStatusUpdate = async (id, status) => {
        try {
            await updateDeliveryStatus(id, status);
            fetchDeliveries();
        } catch (err) {
            console.error('Status update error:', err);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    };

    const activeTask = deliveries.find(d => ['assigned', 'picked_up', 'in_transit'].includes(d.status));
    const upcomingTasks = deliveries.filter(d => d !== activeTask && d.status !== 'delivered');
    const completedCount = deliveries.filter(d => d.status === 'delivered').length;

    const getETA = (d) => {
        if (d.scheduled_time) {
            return new Date(d.scheduled_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        }
        return '—';
    };

    return (
        <div className="app-layout" style={{ flexDirection: 'column' }}>
            {/* Top header bar */}
            <header className="header" style={{ borderBottom: '1px solid var(--border)' }}>
                <div className="header-left" style={{ gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--primary)' }}>
                        <div style={{ background: 'var(--primary-light)', borderRadius: 8, padding: 4, display: 'flex' }}>
                            <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>local_shipping</span>
                        </div>
                        <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>FleetTrack Pro</span>
                    </div>
                </div>
                <div className="header-right">
                    <div className="online-badge">
                        <div className="online-dot"></div>
                        Online
                    </div>
                    <button className="header-action-btn" onClick={handleLogout} title="Logout">
                        <span className="material-symbols-outlined">logout</span>
                    </button>
                </div>
            </header>

            <div className="driver-page">
                <div className="driver-page-content">
                    {/* Header */}
                    <div className="driver-header">
                        <div>
                            <h1>Driver Console</h1>
                            <p className="driver-header-subtitle">
                                <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--primary)' }}>badge</span>
                                ID: #{user.id || '—'}
                                <span style={{ margin: '0 4px' }}>•</span>
                                <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--primary)' }}>person</span>
                                {user.name || 'Driver'}
                            </p>
                        </div>
                    </div>

                    {/* KPI Row */}
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        <div className="kpi-card" style={{ flex: 1, minWidth: 140 }}>
                            <p className="kpi-label">Active Tasks</p>
                            <h3 className="kpi-value">{deliveries.filter(d => d.status !== 'delivered').length}</h3>
                        </div>
                        <div className="kpi-card" style={{ flex: 1, minWidth: 140 }}>
                            <p className="kpi-label">Completed</p>
                            <h3 className="kpi-value" style={{ color: 'var(--emerald)' }}>{completedCount}</h3>
                        </div>
                        <div className="kpi-card" style={{ flex: 1, minWidth: 140 }}>
                            <p className="kpi-label">Total Assigned</p>
                            <h3 className="kpi-value">{deliveries.length}</h3>
                        </div>
                    </div>

                    {/* Active Task Card */}
                    {activeTask ? (
                        <div className="driver-task-card">
                            <div className="driver-task-image">
                                <span className="material-symbols-outlined">inventory_2</span>
                                {activeTask.status === 'assigned' && <div className="driver-task-urgent">New Assignment</div>}
                            </div>
                            <div className="driver-task-body">
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div className="driver-task-title">Order #{activeTask.id}</div>
                                        <div className="driver-task-eta">
                                            <div className="driver-task-eta-label">Scheduled</div>
                                            <div className="driver-task-eta-value">{getETA(activeTask)}</div>
                                        </div>
                                    </div>
                                    <div className="driver-task-dest">
                                        <span className="material-symbols-outlined">location_on</span>
                                        <div>
                                            <div className="driver-task-dest-label">Destination</div>
                                            <div className="driver-task-dest-text">{activeTask.drop_location}</div>
                                        </div>
                                    </div>
                                    <div className="driver-task-dest" style={{ marginTop: 4 }}>
                                        <span className="material-symbols-outlined">pin_drop</span>
                                        <div>
                                            <div className="driver-task-dest-label">Pickup From</div>
                                            <div className="driver-task-dest-text">{activeTask.pickup_location}</div>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
                                    <span className={`status-badge ${activeTask.status}`}>{statusLabels[activeTask.status]}</span>
                                    {activeTask.vehicle_number && <span className="status-badge idle">{activeTask.vehicle_number}</span>}
                                </div>
                                <div className="driver-task-actions">
                                    {nextStatus[activeTask.status] && (
                                        <button className="driver-btn primary" onClick={() => handleStatusUpdate(activeTask.id, nextStatus[activeTask.status])}>
                                            <span className="material-symbols-outlined">check_circle</span>
                                            {nextLabel[activeTask.status]}
                                        </button>
                                    )}
                                    <button className="driver-btn secondary" onClick={() => {
                                        const addr = encodeURIComponent(activeTask.drop_location);
                                        window.open(`https://www.google.com/maps/dir/?api=1&destination=${addr}`, '_blank');
                                    }}>
                                        <span className="material-symbols-outlined">navigation</span>
                                        Open Navigator
                                    </button>
                                    {activeTask.status === 'in_transit' && (
                                        <>
                                            <input type="file" ref={fileRef} accept="image/*" style={{ display: 'none' }} onChange={(e) => handlePODUpload(e, activeTask.id)} />
                                            <button className="driver-btn" style={{ background: 'var(--bg-dark)', color: '#fff', border: '1px solid var(--border)', flex: 1 }} onClick={() => fileRef.current?.click()}>
                                                <span className="material-symbols-outlined">{activeTask.proof_image_url ? 'check_circle' : 'add_a_photo'}</span>
                                                {activeTask.proof_image_url ? 'POD Uploaded' : 'Upload POD Image'}
                                            </button>
                                            <button className="driver-btn" style={{ background: 'var(--bg-dark)', color: '#fff', border: '1px solid var(--border)', flex: 1 }} onClick={() => setShowSignatureModal(true)}>
                                                <span className="material-symbols-outlined">{activeTask.signature_image_url ? 'check_circle' : 'draw'}</span>
                                                {activeTask.signature_image_url ? 'Signature Saved' : 'Get Signature'}
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : !loading && (
                        <div className="data-table-card" style={{ padding: 48, textAlign: 'center' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 48, color: 'var(--text-muted)', marginBottom: 8 }}>inventory_2</span>
                            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>No Active Tasks</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>You have no pending deliveries at the moment.</p>
                        </div>
                    )}

                    {/* Upcoming Deliveries */}
                    {upcomingTasks.length > 0 && (
                        <div>
                            <h2 className="driver-section-title">
                                <span className="material-symbols-outlined">list_alt</span>
                                Upcoming Deliveries
                            </h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
                                {upcomingTasks.map(d => (
                                    <div key={d.id} className="driver-upcoming-item">
                                        <div className="driver-upcoming-left">
                                            <div className="driver-upcoming-icon">
                                                <span className="material-symbols-outlined">inventory_2</span>
                                            </div>
                                            <div>
                                                <div className="driver-upcoming-order">Order #{d.id}</div>
                                                <div className="driver-upcoming-addr">{d.drop_location}</div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                            <div style={{ textAlign: 'right' }}>
                                                <div className="driver-upcoming-eta-label">Scheduled</div>
                                                <div className="driver-upcoming-eta-val">{getETA(d)}</div>
                                            </div>
                                            <span className="material-symbols-outlined" style={{ color: 'var(--text-muted)' }}>chevron_right</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Footer */}
                    <footer style={{ marginTop: 32, textAlign: 'center', paddingBottom: 32 }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: 11 }}>FleetTrack Pro SaaS v2.4.0</p>
                    </footer>
                </div>
            </div>

            {/* Signature Modal */}
            {showSignatureModal && activeTask && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
                    <div style={{ background: 'var(--card-bg)', padding: 24, borderRadius: 'var(--radius-xl)', width: '100%', maxWidth: 400 }}>
                        <h3 style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            Sign for Delivery
                            <button onClick={() => setShowSignatureModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><span className="material-symbols-outlined">close</span></button>
                        </h3>
                        <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: '#fff' }}>
                            <SignatureCanvas
                                ref={sigCanvas}
                                penColor="black"
                                canvasProps={{ width: 350, height: 200, className: 'sigCanvas' }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                            <button className="btn-outline" style={{ flex: 1 }} onClick={() => sigCanvas.current.clear()}>Clear</button>
                            <button className="btn-primary" style={{ flex: 1 }} onClick={() => handleSignatureUpload(activeTask.id)}>Save Signature</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
