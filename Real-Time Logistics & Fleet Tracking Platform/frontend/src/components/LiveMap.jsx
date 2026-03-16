import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icons for leaflet + vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom vehicle icon
function createVehicleIcon(status) {
    const colors = {
        active: '#10b981',
        delayed: '#ef4444',
        idle: '#137fec',
    };
    const color = colors[status] || colors.idle;

    return L.divIcon({
        className: 'custom-vehicle-marker',
        html: `
      <div style="
        width: 32px; height: 32px; border-radius: 50%;
        background: ${color}; color: #fff;
        display: flex; align-items: center; justify-content: center;
        box-shadow: 0 0 15px ${color}80;
        font-size: 16px;
      ">
        <span class="material-symbols-outlined" style="font-size:16px">local_shipping</span>
      </div>
    `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -20],
    });
}

// Component to update map view when center changes
function MapUpdater({ center }) {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.setView(center, map.getZoom());
        }
    }, [center, map]);
    return null;
}

export default function LiveMap({ vehicles = [] }) {
    // Default center: NYC area (matching stitch design)
    const defaultCenter = [40.7128, -74.0060];
    const defaultZoom = 12;

    return (
        <div className="map-container">
            <MapContainer
                center={defaultCenter}
                zoom={defaultZoom}
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {vehicles.map((vehicle) => (
                    <Marker
                        key={vehicle.vehicle_id || vehicle.id}
                        position={[vehicle.latitude, vehicle.longitude]}
                        icon={createVehicleIcon(vehicle.status)}
                    >
                        <Popup>
                            <div style={{ fontFamily: 'Inter, sans-serif', minWidth: 150 }}>
                                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>
                                    {vehicle.vehicle_number || `Vehicle ${vehicle.vehicle_id}`}
                                </div>
                                <div style={{ fontSize: 11, color: '#64748b', marginBottom: 2 }}>
                                    Status: <span style={{
                                        fontWeight: 700,
                                        color: vehicle.status === 'active' ? '#10b981' :
                                            vehicle.status === 'delayed' ? '#ef4444' : '#137fec'
                                    }}>
                                        {vehicle.status?.charAt(0).toUpperCase() + vehicle.status?.slice(1)}
                                    </span>
                                </div>
                                <div style={{ fontSize: 10, color: '#94a3b8' }}>
                                    Lat: {vehicle.latitude?.toFixed(4)}, Lng: {vehicle.longitude?.toFixed(4)}
                                </div>
                                {vehicle.timestamp && (
                                    <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>
                                        Updated: {new Date(vehicle.timestamp).toLocaleTimeString()}
                                    </div>
                                )}
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            {/* Map Search Overlay */}
            <div className="map-controls">
                <div className="map-search">
                    <span className="material-symbols-outlined">search</span>
                    <input type="text" placeholder="Locate vehicle..." />
                </div>
            </div>

            {/* Map Legend */}
            <div className="map-legend">
                <div className="map-legend-item">
                    <div className="map-legend-dot active"></div>
                    <span className="map-legend-text">Active</span>
                </div>
                <div className="map-legend-item">
                    <div className="map-legend-dot delayed"></div>
                    <span className="map-legend-text">Delayed</span>
                </div>
                <div className="map-legend-item">
                    <div className="map-legend-dot idle"></div>
                    <span className="map-legend-text">Idle</span>
                </div>
            </div>
        </div>
    );
}
