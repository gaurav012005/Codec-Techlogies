import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { getDelivery, uploadPOD } from '../services/api';
import html2pdf from 'html2pdf.js';

const statusSteps = ['pending', 'assigned', 'picked_up', 'in_transit', 'delivered'];
const stepLabels = { pending: 'Ordered', assigned: 'Assigned', picked_up: 'Picked Up', in_transit: 'In Transit', delivered: 'Delivered' };
const stepIcons = { pending: 'check', assigned: 'check', picked_up: 'check', in_transit: 'check', delivered: 'home' };

export default function DeliveryDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [delivery, setDelivery] = useState(null);
    const [loading, setLoading] = useState(true);
    const fileRef = useRef();

    useEffect(() => {
        const fetchDelivery = async () => {
            try {
                const res = await getDelivery(id);
                setDelivery(res.data);
            } catch (err) {
                console.error('Delivery fetch error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchDelivery();
    }, [id]);

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('proof_image', file);
        try {
            const res = await uploadPOD(id, formData);
            setDelivery(res.data.delivery);
        } catch (err) {
            console.error('Upload error:', err);
        }
    };

    const getStepIndex = (status) => statusSteps.indexOf(status);
    const currentIdx = delivery ? getStepIndex(delivery.status) : 0;

    const handleExportPDF = () => {
        const element = document.getElementById('pdf-content');
        if (!element) return;

        const actionButtons = element.querySelector('.detail-page-header-actions');
        if (actionButtons) actionButtons.style.display = 'none';

        const opt = {
            margin: 0.5,
            filename: `delivery_pod_${delivery.id}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(element).save().then(() => {
            if (actionButtons) actionButtons.style.display = 'flex';
        });
    };

    const formatDate = (d) => d ? new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

    if (loading) return (
        <div className="app-layout">
            <Sidebar />
            <main className="main-content">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, color: 'var(--text-muted)' }}>Loading...</div>
            </main>
        </div>
    );

    if (!delivery) return (
        <div className="app-layout">
            <Sidebar />
            <main className="main-content">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, color: 'var(--text-muted)' }}>Delivery not found</div>
            </main>
        </div>
    );

    return (
        <div className="app-layout">
            <Sidebar />
            <main className="main-content">
                <header className="header">
                    <div className="header-left">
                        <button className="header-action-btn" onClick={() => navigate('/admin/deliveries')} title="Back">
                            <span className="material-symbols-outlined">arrow_back</span>
                        </button>
                        <h2 className="header-title">Delivery Details</h2>
                    </div>
                </header>

                <div className="detail-page-content">
                    <div className="detail-max-width">
                        {/* Breadcrumb */}
                        <div className="breadcrumb">
                            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/admin/deliveries'); }}>Deliveries</a>
                            <span className="material-symbols-outlined">chevron_right</span>
                            <a href="#" onClick={(e) => e.preventDefault()}>Order #{delivery.id}</a>
                            <span className="material-symbols-outlined">chevron_right</span>
                            <span className="current">POD Details</span>
                        </div>

                        {/* Page Header */}
                        <div id="pdf-content" style={{ padding: '20px', background: 'var(--bg-light)', borderRadius: 'var(--radius-xl)' }}>
                            <div className="detail-page-header">
                                <div>
                                    <h1>
                                        Order #{delivery.id}
                                        <span className={`status-pill ${delivery.status}`}>{delivery.status?.replace('_', ' ').toUpperCase()}</span>
                                    </h1>
                                    <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>
                                        {delivery.driver_name ? `Completed by Driver ${delivery.driver_name}` : 'No driver assigned'}
                                    </p>
                                </div>
                                <div className="detail-page-header-actions" style={{ display: 'flex', gap: 8 }}>
                                    <button className="btn-primary" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 6 }} onClick={handleExportPDF}>
                                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>download</span>
                                        Export PDF
                                    </button>
                                </div>
                            </div>

                            {/* Main Grid */}
                            <div className="pod-grid">
                                {/* Left Column: Timeline */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                    <div className="timeline-card">
                                        <h3>
                                            <span className="material-symbols-outlined">route</span>
                                            Delivery Journey
                                        </h3>
                                        <div className="timeline">
                                            {statusSteps.map((step, i) => {
                                                const isCompleted = i <= currentIdx;
                                                const isFinal = step === 'delivered' && isCompleted;
                                                const isPending = i > currentIdx;

                                                return (
                                                    <div key={step} className="timeline-step">
                                                        <div className={`timeline-dot ${isFinal ? 'final' : isCompleted ? 'completed' : 'pending'}`}>
                                                            <span className="material-symbols-outlined">{isFinal ? 'home' : isCompleted ? 'check' : ''}</span>
                                                        </div>
                                                        <div className="timeline-content">
                                                            <h4>{stepLabels[step]}</h4>
                                                            <p>
                                                                {step === 'delivered' && delivery.delivered_at ? formatDate(delivery.delivered_at) :
                                                                    step === 'pending' ? formatDate(delivery.created_at) :
                                                                        isCompleted ? 'Completed' : 'Pending'}
                                                            </p>
                                                            {step === 'pending' && (
                                                                <div className="timeline-detail">
                                                                    <div className="timeline-detail-label">Source</div>
                                                                    <div className="timeline-detail-value">{delivery.pickup_location}</div>
                                                                </div>
                                                            )}
                                                            {step === 'assigned' && delivery.driver_name && (
                                                                <div className="timeline-detail">
                                                                    <div className="timeline-detail-label">Handler</div>
                                                                    <div className="timeline-detail-value">Driver: {delivery.driver_name}</div>
                                                                </div>
                                                            )}
                                                            {step === 'in_transit' && isCompleted && (
                                                                <div className="timeline-detail">
                                                                    <div className="timeline-detail-label">Status</div>
                                                                    <div className="timeline-detail-value">Route Optimized</div>
                                                                </div>
                                                            )}
                                                            {step === 'delivered' && isCompleted && (
                                                                <div className="timeline-detail success">
                                                                    <div className="timeline-detail-label">Destination</div>
                                                                    <div className="timeline-detail-value">{delivery.drop_location}</div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Meta Info */}
                                    <div className="timeline-card">
                                        <div className="meta-grid">
                                            <div className="meta-item">
                                                <div className="meta-item-label">Vehicle</div>
                                                <div className="meta-item-value">{delivery.vehicle_number || '—'}</div>
                                            </div>
                                            <div className="meta-item">
                                                <div className="meta-item-label">Scheduled</div>
                                                <div className="meta-item-value" style={{ fontSize: 13 }}>{delivery.scheduled_time ? formatDate(delivery.scheduled_time) : '—'}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: POD */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                    <div className="pod-card">
                                        <div className="pod-card-header">
                                            <h3>
                                                <span className="material-symbols-outlined">verified_user</span>
                                                Proof of Delivery (POD)
                                            </h3>
                                        </div>
                                        <div className="pod-content">
                                            <div className="pod-photo-area">
                                                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)' }}>Delivery Photo</p>
                                                <div className="pod-upload-zone" onClick={() => fileRef.current?.click()}>
                                                    {delivery.proof_image_url ? (
                                                        <img src={`http://localhost:5000${delivery.proof_image_url}`} alt="Proof of delivery" />
                                                    ) : (
                                                        <>
                                                            <span className="material-symbols-outlined">add_photo_alternate</span>
                                                            <span>Click to upload POD image</span>
                                                        </>
                                                    )}
                                                </div>
                                                <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} style={{ display: 'none' }} />
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                                <div>
                                                    <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8 }}>Recipient Signature</p>
                                                    <div className="pod-signature-box" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                        {delivery.signature_image_url ? (
                                                            <img src={`http://localhost:5000${delivery.signature_image_url}`} alt="Recipient Signature" style={{ maxWidth: '100%', maxHeight: '150px' }} />
                                                        ) : 'Signature will appear here'}
                                                    </div>
                                                </div>
                                                <div style={{ paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                                                    <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 12 }}>Automated Metadata</p>
                                                    <div className="pod-metadata">
                                                        <div className="pod-metadata-row">
                                                            <span className="pod-metadata-label">Order ID</span>
                                                            <span className="pod-metadata-value">#{delivery.id}</span>
                                                        </div>
                                                        <div className="pod-metadata-row">
                                                            <span className="pod-metadata-label">Driver</span>
                                                            <span className="pod-metadata-value">{delivery.driver_name || '—'}</span>
                                                        </div>
                                                        <div className="pod-metadata-row">
                                                            <span className="pod-metadata-label">Vehicle</span>
                                                            <span className="pod-metadata-value">{delivery.vehicle_number || '—'}</span>
                                                        </div>
                                                        <div className="pod-metadata-row">
                                                            <span className="pod-metadata-label">Created</span>
                                                            <span className="pod-metadata-value">{formatDate(delivery.created_at)}</span>
                                                        </div>
                                                        {delivery.delivered_at && (
                                                            <div className="pod-metadata-row">
                                                                <span className="pod-metadata-label">Delivered At</span>
                                                                <span className="pod-metadata-value success">{formatDate(delivery.delivered_at)}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Notes */}
                                    {delivery.notes && (
                                        <div className="data-table-card" style={{ padding: 20 }}>
                                            <h4 style={{ fontWeight: 700, marginBottom: 8, fontSize: 14 }}>Notes</h4>
                                            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{delivery.notes}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
