# FleetTrack Pro — Setup & Testing Guide

## Prerequisites

- **Node.js** (v18+) and **npm**
- **PostgreSQL** (v14+) running locally

---

## 1. Database Setup

```bash
# Create the database
psql -U postgres -c "CREATE DATABASE fleettrack;"

# Initialize tables (runs automatically on server start, OR manually):
psql -U postgres -d fleettrack -f backend/sql/init.sql
```

## 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env   # OR create manually:
```

**`.env` file contents:**
```
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/fleettrack
JWT_SECRET=your_secret_key_here
CORS_ORIGIN=http://localhost:5173
PORT=5000
```

```bash
# Start the server
node server.js
```

The backend starts at **http://localhost:5000**

## 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

The frontend starts at **http://localhost:5173**

---

## Testing the Application

### Login Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@fleettrack.com` | `admin123` |
| **Driver** | *(create via Admin → Drivers page)* | *(set during creation)* |

### Admin Pages (after login as admin)

| Page | URL | What to Test |
|------|-----|-------------|
| Dashboard | `/admin` | KPI cards, live map widget, vehicle table |
| **Live Map** | `/admin/map` | Full-screen map, side panel vehicle list, filter chips, click vehicle to fly-to |
| Fleet Management | `/admin/fleet` | Add/edit/delete vehicles, filter by status, assign drivers |
| **Drivers** | `/admin/drivers` | Add new driver (creates login), edit, delete, driver cards with delivery counts |
| Deliveries | `/admin/deliveries` | Create delivery, assign driver & vehicle, update status, click row → POD detail |
| Delivery Detail | `/admin/deliveries/:id` | Timeline, upload proof-of-delivery image, metadata panel |
| Analytics | `/admin/analytics` | Line chart (daily), donut chart (status), bar chart (top drivers) |

### Driver Console (login as a driver)

| Page | URL | What to Test |
|------|-----|-------------|
| Driver Dashboard | `/driver` | Active task card, update status (Picked Up → In Transit → Delivered), Google Maps navigator, upcoming deliveries |

### Real-Time Tracking Test

```bash
# In a separate terminal, simulate vehicle movement:
node backend/test-socket.js
```

This sends location updates via WebSocket. Watch the Live Map page — vehicle markers should move in real-time.

### API Health Check

```bash
curl http://localhost:5000/api/health
# Should return: {"status":"ok","timestamp":"..."}
```

---

## Project Structure

```
├── backend/
│   ├── server.js              # Express + Socket.io entry point
│   ├── config/db.js           # PostgreSQL connection pool
│   ├── middleware/auth.js     # JWT auth + role middleware
│   ├── routes/
│   │   ├── auth.js            # Login & register
│   │   ├── admin.js           # Vehicles, deliveries, drivers, tracking CRUD
│   │   ├── driver.js          # Driver-specific delivery APIs
│   │   ├── delivery.js        # Single delivery + POD upload
│   │   └── analytics.js       # Aggregated analytics data
│   ├── sockets/tracking.js    # WebSocket location handler
│   ├── sql/init.sql           # Database schema
│   └── uploads/               # POD images stored here
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx            # Routing + protected routes
│   │   ├── index.css          # All application styles
│   │   ├── pages/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── LiveMapPage.jsx
│   │   │   ├── FleetManagementPage.jsx
│   │   │   ├── DriverManagementPage.jsx
│   │   │   ├── DeliveriesPage.jsx
│   │   │   ├── DeliveryDetailPage.jsx
│   │   │   ├── AnalyticsPage.jsx
│   │   │   ├── DriverDashboard.jsx
│   │   │   └── LoginPage.jsx
│   │   ├── components/
│   │   │   ├── Sidebar.jsx
│   │   │   ├── LiveMap.jsx
│   │   │   └── LiveFeed.jsx
│   │   └── services/
│   │       ├── api.js          # Axios instance + all API helpers
│   │       └── socket.js       # Socket.io client
│   └── package.json
```

## Google Maps API Integration (Optional)

The project currently uses **OpenStreetMap + Leaflet** — **no API key required**. Everything works out of the box.

If you want to switch to Google Maps, follow these steps:

### Step 1: Get a Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Enable these APIs:
   - **Maps JavaScript API** (for map display)
   - **Directions API** (for route visualization)
   - **Geocoding API** (for address → coordinates)
4. Go to **Credentials** → **Create Credentials** → **API Key**
5. Copy the API key

### Step 2: Add Key to Project

Add to `frontend/.env`:
```
VITE_GOOGLE_MAPS_API_KEY=AIzaSy...your_key_here
```

### Step 3: Install Google Maps React Library

```bash
cd frontend
npm install @react-google-maps/api
```

### Step 4: Swap Map Components

Replace `react-leaflet` MapContainer in `LiveMapPage.jsx` and `LiveMap.jsx` with:

```jsx
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

<LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
  <GoogleMap center={{ lat: 40.7128, lng: -74.006 }} zoom={12}>
    {vehicles.map(v => (
      <Marker key={v.vehicle_id} position={{ lat: v.latitude, lng: v.longitude }} />
    ))}
  </GoogleMap>
</LoadScript>
```

### What Each API Does

| API | Purpose | Required? |
|-----|---------|-----------|
| Maps JavaScript API | Displays the interactive map | Yes (if using Google Maps) |
| Directions API | Shows driving routes between pickup & drop-off | Optional |
| Geocoding API | Converts addresses to lat/lng coordinates | Optional |
| Places API | Autocomplete for location search bars | Optional |

> **Note:** The free tier includes $200/month credit (~28,000 map loads). For a demo/internship project, this is more than enough.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, React Router, Axios, Leaflet, Recharts |
| Backend | Node.js, Express, Socket.io, JWT, Multer |
| Database | PostgreSQL |
| Real-time | WebSocket (Socket.io) |
