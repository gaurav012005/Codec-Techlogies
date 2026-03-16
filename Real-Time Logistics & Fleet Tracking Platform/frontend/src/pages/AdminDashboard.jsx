import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import LiveMap from '../components/LiveMap';
import LiveFeed from '../components/LiveFeed';
import { getDashboard, getVehicles, getTracking } from '../services/api';
import { connectSocket, disconnectSocket } from '../services/socket';

export default function AdminDashboard() {
    const [kpis, setKpis] = useState({
        totalVehicles: 0,
        activeDeliveries: 0,
        completedToday: 0,
        delayedUnits: 0,
    });
    const [vehicles, setVehicles] = useState([]);
    const [vehiclePositions, setVehiclePositions] = useState([]);
    const [feedItems, setFeedItems] = useState([]);

    // Fetch dashboard data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [dashRes, vehRes, trackRes] = await Promise.all([
                    getDashboard(),
                    getVehicles(),
                    getTracking(),
                ]);
                setKpis(dashRes.data);
                setVehicles(vehRes.data);
                setVehiclePositions(trackRes.data);
            } catch (err) {
                console.error('Dashboard fetch error:', err);
                // Use default data if backend is not ready
                setKpis({ totalVehicles: 1284, activeDeliveries: 452, completedToday: 12890, delayedUnits: 14 });
                setVehiclePositions([
                    { vehicle_id: 1, vehicle_number: 'FT-9023', status: 'active', latitude: 40.7282, longitude: -74.0776 },
                    { vehicle_id: 2, vehicle_number: 'FT-1104', status: 'delayed', latitude: 40.7061, longitude: -74.0087 },
                    { vehicle_id: 3, vehicle_number: 'FT-4482', status: 'idle', latitude: 40.6892, longitude: -74.0445 },
                ]);
                setVehicles([
                    { id: 1, vehicle_number: 'FT-9023', driver_name: 'Robert Chambers', status: 'active' },
                    { id: 2, vehicle_number: 'FT-1104', driver_name: 'Elena Rodriguez', status: 'delayed' },
                    { id: 3, vehicle_number: 'FT-4482', driver_name: 'Marcus Smith', status: 'idle' },
                ]);
            }
        };
        fetchData();
    }, []);

    // Setup WebSocket for real-time tracking
    useEffect(() => {
        const socket = connectSocket();

        socket.on('location:broadcast', (data) => {
            setVehiclePositions((prev) => {
                const exists = prev.findIndex((v) => v.vehicle_id === data.vehicle_id);
                if (exists >= 0) {
                    const updated = [...prev];
                    updated[exists] = { ...updated[exists], ...data };
                    return updated;
                }
                return [...prev, data];
            });

            // Add to live feed
            setFeedItems((prev) => {
                const newItem = {
                    id: Date.now(),
                    type: 'emerald',
                    title: 'Location Updated',
                    time: 'just now',
                    description: `Unit <strong>${data.vehicle_number}</strong> position updated.`,
                    actions: [{ type: 'tag', text: `Lat: ${data.latitude?.toFixed(4)}` }],
                };
                return [newItem, ...prev].slice(0, 10);
            });
        });

        return () => disconnectSocket();
    }, []);

    // Current date/time
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

    // Vehicle table mock data for display (matching stitch)
    const tableData = vehicles.length > 0 ? vehicles : [
        { vehicle_number: 'FT-9023', driver_name: 'Robert Chambers', status: 'active', destination: 'Chicago Hub #4', eta: '16:30 (In 45m)', fuel: '14.2 km/L' },
        { vehicle_number: 'FT-1104', driver_name: 'Elena Rodriguez', status: 'delayed', destination: 'Philadelphia Port', eta: '18:00 (+1h)', fuel: '11.8 km/L' },
        { vehicle_number: 'FT-4482', driver_name: 'Marcus Smith', status: 'idle', destination: 'Maintenance Yard B', eta: '—', fuel: '9.5 km/L' },
    ];

    // KPI percentage calculations
    const totalVehiclesDisplay = kpis.totalVehicles > 100 ? kpis.totalVehicles.toLocaleString() : kpis.totalVehicles || '1,284';
    const activeDisplay = kpis.activeDeliveries || 452;
    const completedDisplay = kpis.completedToday > 100 ? kpis.completedToday.toLocaleString() : kpis.completedToday || '12,890';
    const delayedDisplay = kpis.delayedUnits || 14;

    return (
        <div className="app-layout">
            <Sidebar />
            <main className="main-content">
                {/* Header */}
                <header className="header">
                    <div className="header-left">
                        <h2 className="header-title">Operations Overview</h2>
                        <div className="header-divider"></div>
                        <span className="header-time">{dateStr} | {timeStr} GMT</span>
                    </div>
                    <div className="header-right">
                        <div className="header-search">
                            <span className="material-symbols-outlined">search</span>
                            <input type="text" placeholder="Search vehicle, driver or ID..." />
                        </div>
                        <div className="header-actions">
                            <button className="header-action-btn">
                                <span className="material-symbols-outlined">notifications</span>
                                <span className="notification-dot"></span>
                            </button>
                            <button className="header-action-btn">
                                <span className="material-symbols-outlined">help_outline</span>
                            </button>
                        </div>
                    </div>
                </header>

                {/* Dashboard Content */}
                <div className="dashboard-content">
                    {/* KPI Cards */}
                    <div className="kpi-grid">
                        <div className="kpi-card">
                            <p className="kpi-label">Total Vehicles</p>
                            <div className="kpi-value-row">
                                <h3 className="kpi-value">{totalVehiclesDisplay}</h3>
                                <span className="kpi-trend up">
                                    +2.4% <span className="material-symbols-outlined">trending_up</span>
                                </span>
                            </div>
                            <div className="kpi-bar">
                                <div className="kpi-bar-fill primary" style={{ width: '85%' }}></div>
                            </div>
                        </div>

                        <div className="kpi-card">
                            <p className="kpi-label">Active Deliveries</p>
                            <div className="kpi-value-row">
                                <h3 className="kpi-value">{activeDisplay}</h3>
                                <span className="kpi-trend live">
                                    Live <span className="live-dot"></span>
                                </span>
                            </div>
                            <div className="kpi-bar">
                                <div className="kpi-bar-fill primary" style={{ width: '60%' }}></div>
                            </div>
                        </div>

                        <div className="kpi-card">
                            <p className="kpi-label">Completed Today</p>
                            <div className="kpi-value-row">
                                <h3 className="kpi-value">{completedDisplay}</h3>
                                <span className="kpi-trend up">
                                    +5.4% <span className="material-symbols-outlined">trending_up</span>
                                </span>
                            </div>
                            <div className="kpi-bar">
                                <div className="kpi-bar-fill emerald" style={{ width: '92%' }}></div>
                            </div>
                        </div>

                        <div className="kpi-card">
                            <p className="kpi-label">Delayed Units</p>
                            <div className="kpi-value-row">
                                <h3 className="kpi-value">{delayedDisplay}</h3>
                                <span className="kpi-trend down">
                                    -0.8% <span className="material-symbols-outlined">trending_down</span>
                                </span>
                            </div>
                            <div className="kpi-bar">
                                <div className="kpi-bar-fill red" style={{ width: '12%' }}></div>
                            </div>
                        </div>
                    </div>

                    {/* Map & Live Feed Section */}
                    <div className="map-feed-section">
                        <LiveMap vehicles={vehiclePositions} />
                        <LiveFeed feedItems={feedItems} />
                    </div>

                    {/* Critical Performance Metrics Table */}
                    <div className="data-table-card">
                        <div className="data-table-header">
                            <div>
                                <h4 className="data-table-title">Critical Performance Metrics</h4>
                                <p className="data-table-subtitle">Live analytics updated every 30 seconds</p>
                            </div>
                            <div className="data-table-actions">
                                <button className="btn-outline">Export Report</button>
                                <button className="btn-primary">Detailed Insights</button>
                            </div>
                        </div>
                        <div style={{ overflowX: 'auto' }}>
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Vehicle ID</th>
                                        <th>Driver</th>
                                        <th>Status</th>
                                        <th>Destination</th>
                                        <th>ETA</th>
                                        <th className="text-right">Fuel Efficiency</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tableData.map((v, i) => (
                                        <tr key={i}>
                                            <td className="bold">{v.vehicle_number}</td>
                                            <td>{v.driver_name || '—'}</td>
                                            <td>
                                                <span className={`status-badge ${v.status}`}>
                                                    {v.status?.charAt(0).toUpperCase() + v.status?.slice(1)}
                                                </span>
                                            </td>
                                            <td>{v.destination || '—'}</td>
                                            <td className={v.status === 'delayed' ? 'danger' : ''}>
                                                {v.eta || '—'}
                                            </td>
                                            <td className="text-right mono">{v.fuel || '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
