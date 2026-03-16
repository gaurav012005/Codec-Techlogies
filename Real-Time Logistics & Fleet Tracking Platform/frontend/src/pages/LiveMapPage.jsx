import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Sidebar from '../components/Sidebar';
import { getVehicles, getTracking } from '../services/api';
import { connectSocket, disconnectSocket } from '../services/socket';

// Fix default marker icons for leaflet + vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

function createVehicleIcon(status) {
    const colors = { active: '#10b981', delayed: '#ef4444', idle: '#137fec', maintenance: '#f59e0b' };
    const color = colors[status] || colors.idle;
    return L.divIcon({
        className: 'custom-vehicle-marker',
        html: `<div style="width:36px;height:36px;border-radius:50%;background:${color};color:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 0 20px ${color}80;font-size:18px;border:3px solid #fff;">
            <span class="material-symbols-outlined" style="font-size:18px">local_shipping</span>
        </div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -22],
    });
}

function FlyToVehicle({ target }) {
    const map = useMap();
    useEffect(() => {
        if (target) map.flyTo([target.latitude, target.longitude], 15, { duration: 1 });
    }, [target, map]);
    return null;
}

const statusFilters = ['All', 'active', 'idle', 'delayed', 'maintenance'];

export default function LiveMapPage() {
    const [vehicles, setVehicles] = useState([]);
    const [positions, setPositions] = useState([]);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('All');
    const [selected, setSelected] = useState(null);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const fetchData = async () => {
        try {
            const [vehRes, trackRes] = await Promise.all([getVehicles(), getTracking()]);
            setVehicles(vehRes.data);
            setPositions(trackRes.data);
        } catch (err) {
            console.error('Map data error:', err);
        }
    };

    useEffect(() => { fetchData(); }, []);

    useEffect(() => {
        const socket = connectSocket();
        socket.on('location:broadcast', (data) => {
            setPositions(prev => {
                const idx = prev.findIndex(p => p.vehicle_id === data.vehicleId);
                const updated = {
                    vehicle_id: data.vehicleId,
                    latitude: data.latitude,
                    longitude: data.longitude,
                    timestamp: data.timestamp,
                    vehicle_number: data.vehicleNumber || `V-${data.vehicleId}`,
                    status: data.status || 'active',
                };
                if (idx >= 0) {
                    const copy = [...prev];
                    copy[idx] = { ...copy[idx], ...updated };
                    return copy;
                }
                return [...prev, updated];
            });
        });
        return () => disconnectSocket();
    }, []);

    // Merge vehicle info with positions
    const mergedVehicles = positions.map(p => {
        const veh = vehicles.find(v => v.id === p.vehicle_id);
        return { ...p, vehicle_number: p.vehicle_number || veh?.vehicle_number, driver_name: veh?.driver_name, status: p.status || veh?.status || 'idle' };
    });

    const filtered = mergedVehicles.filter(v => {
        if (filter !== 'All' && v.status !== filter) return false;
        if (search) {
            const s = search.toLowerCase();
            return (v.vehicle_number?.toLowerCase().includes(s) || v.driver_name?.toLowerCase().includes(s) || `#${v.vehicle_id}`.includes(s));
        }
        return true;
    });

    const counts = { All: mergedVehicles.length };
    statusFilters.slice(1).forEach(s => { counts[s] = mergedVehicles.filter(v => v.status === s).length; });

    return (
        <div className="app-layout">
            <Sidebar />
            <main className="main-content" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {/* Map Page Header */}
                <header className="header">
                    <div className="header-left">
                        <h2 className="header-title">Live Map</h2>
                        <div className="header-divider"></div>
                        <span className="header-time">{mergedVehicles.length} tracked vehicles</span>
                    </div>
                    <div className="header-right">
                        <button className="btn-outline" onClick={fetchData} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>refresh</span>
                            Refresh
                        </button>
                    </div>
                </header>

                {/* Full-screen map area */}
                <div className="livemap-page-body">
                    {/* Side panel */}
                    <div className={`livemap-side-panel ${sidebarCollapsed ? 'collapsed' : ''}`}>
                        <button className="livemap-panel-toggle" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
                            <span className="material-symbols-outlined">{sidebarCollapsed ? 'chevron_right' : 'chevron_left'}</span>
                        </button>

                        {!sidebarCollapsed && (
                            <>
                                {/* Search */}
                                <div className="livemap-panel-search">
                                    <span className="material-symbols-outlined">search</span>
                                    <input type="text" placeholder="Search vehicles..." value={search} onChange={e => setSearch(e.target.value)} />
                                </div>

                                {/* Filter chips */}
                                <div className="livemap-filter-chips">
                                    {statusFilters.map(s => (
                                        <button key={s} className={`livemap-chip ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>
                                            {s === 'All' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                                            <span className="livemap-chip-count">{counts[s] || 0}</span>
                                        </button>
                                    ))}
                                </div>

                                {/* Vehicle list */}
                                <div className="livemap-vehicle-list">
                                    {filtered.length === 0 ? (
                                        <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No vehicles found</div>
                                    ) : filtered.map(v => (
                                        <div key={v.vehicle_id} className={`livemap-vehicle-item ${selected?.vehicle_id === v.vehicle_id ? 'active' : ''}`} onClick={() => setSelected(v)}>
                                            <div className="livemap-vehicle-icon" style={{ background: v.status === 'active' ? 'rgba(16,185,129,0.1)' : v.status === 'delayed' ? 'rgba(239,68,68,0.1)' : 'rgba(19,127,236,0.1)' }}>
                                                <span className="material-symbols-outlined" style={{ color: v.status === 'active' ? '#10b981' : v.status === 'delayed' ? '#ef4444' : '#137fec', fontSize: 20 }}>local_shipping</span>
                                            </div>
                                            <div className="livemap-vehicle-info">
                                                <div className="livemap-vehicle-name">{v.vehicle_number || `Vehicle #${v.vehicle_id}`}</div>
                                                <div className="livemap-vehicle-meta">
                                                    {v.driver_name && <span>{v.driver_name}</span>}
                                                    <span className={`status-badge ${v.status}`} style={{ fontSize: 9, padding: '1px 6px' }}>{v.status?.charAt(0).toUpperCase() + v.status?.slice(1)}</span>
                                                </div>
                                            </div>
                                            <div className="livemap-vehicle-coords">
                                                <span>{v.latitude?.toFixed(3)}</span>
                                                <span>{v.longitude?.toFixed(3)}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* The Map */}
                    <div className="livemap-map-area">
                        <MapContainer center={[40.7128, -74.0060]} zoom={12} style={{ height: '100%', width: '100%' }} zoomControl={true}>
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <FlyToVehicle target={selected} />
                            {filtered.map(v => (
                                <Marker key={v.vehicle_id} position={[v.latitude, v.longitude]} icon={createVehicleIcon(v.status)}>
                                    <Popup>
                                        <div style={{ fontFamily: 'Inter, sans-serif', minWidth: 180 }}>
                                            <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 6 }}>{v.vehicle_number || `Vehicle #${v.vehicle_id}`}</div>
                                            {v.driver_name && <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}><span style={{ fontWeight: 600 }}>Driver:</span> {v.driver_name}</div>}
                                            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>
                                                <span style={{ fontWeight: 600 }}>Status:</span>{' '}
                                                <span style={{ fontWeight: 700, color: v.status === 'active' ? '#10b981' : v.status === 'delayed' ? '#ef4444' : '#137fec' }}>
                                                    {v.status?.charAt(0).toUpperCase() + v.status?.slice(1)}
                                                </span>
                                            </div>
                                            <div style={{ fontSize: 10, color: '#94a3b8', fontFamily: 'monospace' }}>
                                                {v.latitude?.toFixed(5)}, {v.longitude?.toFixed(5)}
                                            </div>
                                            {v.timestamp && <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 4 }}>Last: {new Date(v.timestamp).toLocaleString()}</div>}
                                        </div>
                                    </Popup>
                                </Marker>
                            ))}
                        </MapContainer>

                        {/* Map Legend */}
                        <div className="livemap-legend">
                            {[{ status: 'active', label: 'Active', color: '#10b981' }, { status: 'idle', label: 'Idle', color: '#137fec' }, { status: 'delayed', label: 'Delayed', color: '#ef4444' }, { status: 'maintenance', label: 'Maintenance', color: '#f59e0b' }].map(l => (
                                <div key={l.status} className="livemap-legend-item">
                                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: l.color, boxShadow: `0 0 8px ${l.color}60` }}></div>
                                    <span>{l.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
