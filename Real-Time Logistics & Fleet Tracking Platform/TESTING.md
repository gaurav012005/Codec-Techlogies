# FleetTrack Pro — Testing Guide

## Prerequisites

Before testing, make sure both servers are running:

```bash
# Terminal 1 — Backend
cd backend
node server.js

# Terminal 2 — Frontend
cd frontend
npm run dev
```

Then open **http://localhost:5173** in your browser.

---

## Test 1: User Authentication

### 1.1 Admin Registration (one-time)
```bash
curl -X POST http://localhost:5000/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"name\": \"Admin User\", \"email\": \"admin@fleettrack.com\", \"password\": \"admin123\", \"role\": \"admin\"}"
```
**Expected:** `{"token": "...", "user": {"id": ..., "role": "admin"}}`

### 1.2 Admin Login
1. Go to `http://localhost:5173/login`
2. Enter: `admin@fleettrack.com` / `admin123`
3. Click **Sign In**

**Expected:** Redirects to `/admin` dashboard

### 1.3 Protected Routes
1. Open a new incognito tab
2. Go to `http://localhost:5173/admin`

**Expected:** Redirects to `/login` (not logged in)

---

## Test 2: Admin Dashboard (`/admin`)

1. Login as admin
2. Check the page shows:
   - [ ] 4 KPI cards at the top (Total Deliveries, In Transit, Avg Time, Fleet Efficiency)
   - [ ] Live Map widget with vehicle markers
   - [ ] Live Feed panel showing recent events
   - [ ] Vehicle data table at the bottom

---

## Test 3: Fleet Management (`/admin/fleet`)

### 3.1 View Vehicles
1. Click **Fleet Management** in the sidebar
2. **Expected:** Vehicle table loads with columns: Vehicle #, Driver, Status, Actions

### 3.2 Add a Vehicle
1. Click **+ Add Vehicle** button
2. Fill in: Vehicle Number = `TRK-001`
3. Click **Create Vehicle**
4. **Expected:** New vehicle appears in the table

### 3.3 Edit a Vehicle
1. Click the **edit** (pencil) icon on any vehicle row
2. Change the vehicle number
3. Click **Save Changes**
4. **Expected:** Updated value shows in the table

### 3.4 Delete a Vehicle
1. Click the **delete** (trash) icon on a vehicle row
2. Confirm deletion
3. **Expected:** Vehicle removed from table

### 3.5 Filter Vehicles
1. Click filter tabs: **All**, **Active**, **Idle**, **Delayed**
2. **Expected:** Table filters to show only vehicles with that status

---

## Test 4: Driver Management (`/admin/drivers`)

### 4.1 View Drivers
1. Click **Drivers** in the sidebar
2. **Expected:** Driver cards displayed in a grid layout with avatars

### 4.2 Add a New Driver
1. Click **Add Driver**
2. Fill in: Name = `John Smith`, Email = `john@test.com`, Password = `password123`
3. Click **Create Driver**
4. **Expected:** New driver card appears. This driver can now login at `/login`

### 4.3 Edit a Driver
1. Hover over a driver card → click the **edit** icon
2. Change the name
3. Click **Save Changes**
4. **Expected:** Card shows updated name

### 4.4 Delete a Driver
1. Hover over a driver card → click the **delete** icon
2. Confirm deletion
3. **Expected:** Driver card removed

---

## Test 5: Deliveries (`/admin/deliveries`)

### 5.1 View Deliveries
1. Click **Deliveries** in the sidebar
2. **Expected:** Delivery table with columns: ID, Pickup, Drop-off, Driver, Vehicle, Status

### 5.2 Create a Delivery
1. Click **+ New Delivery**
2. Fill in:
   - Pickup: `123 Main St, NYC`
   - Drop-off: `456 Oak Ave, NYC`
   - Select a driver and vehicle
   - Status: `assigned`
3. Click **Create**
4. **Expected:** New delivery row appears in table

### 5.3 Update Status Inline
1. Find a delivery row
2. Click the status dropdown → change to `in_transit`
3. **Expected:** Status badge updates immediately

### 5.4 View Delivery Detail (POD Page)
1. Click any delivery row
2. **Expected:** Navigates to `/admin/deliveries/:id` with:
   - [ ] Delivery journey timeline (Ordered → Assigned → Picked Up → In Transit → Delivered)
   - [ ] POD upload zone
   - [ ] Metadata panel (Order ID, Driver, Vehicle, Created date)

### 5.5 Upload Proof of Delivery
1. On the delivery detail page, click the photo upload zone
2. Select any image file
3. **Expected:** Image appears in the upload zone

### 5.6 Delete a Delivery
1. Back on `/admin/deliveries`, click the **delete** icon on a row
2. Confirm
3. **Expected:** Delivery removed from table

---

## Test 6: Live Map (`/admin/map`)

### 6.1 View Map
1. Click **Live Map** in the sidebar
2. **Expected:**
   - [ ] Full-screen map with OpenStreetMap tiles
   - [ ] Collapsible side panel with vehicle list
   - [ ] Filter chips (All, Active, Idle, Delayed, Maintenance)
   - [ ] Legend in bottom-right corner

### 6.2 Search Vehicles
1. Type a vehicle number in the search box
2. **Expected:** Vehicle list filters to matching results

### 6.3 Filter by Status
1. Click the **Active** chip
2. **Expected:** Only active vehicles shown in list and on map

### 6.4 Click Vehicle → Fly To
1. Click any vehicle in the side panel list
2. **Expected:** Map smoothly pans and zooms to that vehicle's location

### 6.5 Real-Time Updates
1. Open a new terminal
2. Run: `node backend/test-socket.js`
3. **Expected:** Vehicle markers move on the map in real-time

### 6.6 Collapse/Expand Panel
1. Click the chevron button on the side panel edge
2. **Expected:** Panel collapses → map takes full width. Click again → panel re-opens

---

## Test 7: Analytics (`/admin/analytics`)

1. Click **Analytics** in the sidebar
2. **Expected:**
   - [ ] 4 KPI cards (Total Deliveries, Success Rate, Completed, Active Drivers)
   - [ ] Line chart — "Deliveries Over Time" (last 7 days)
   - [ ] Donut chart — "Status Breakdown"
   - [ ] Bar chart — "Top Performing Drivers"
3. Hover over any chart data point
4. **Expected:** Tooltip appears with details

---

## Test 8: Driver Console (`/driver`)

### 8.1 Login as Driver
1. Logout from admin (or use incognito)
2. Login with a driver account (created in Test 4.2): `john@test.com` / `password123`
3. **Expected:** Redirects to `/driver` (not `/admin`)

### 8.2 View Driver Dashboard
1. **Expected:**
   - [ ] KPI row (Active Tasks, Completed, Total Assigned)
   - [ ] Active task card (if deliveries assigned to this driver)
   - [ ] Upcoming deliveries list

### 8.3 Update Delivery Status
1. On the active task card, click **Mark as Picked Up**
2. **Expected:** Status updates, button changes to **Start Transit**
3. Click **Start Transit** → then **Mark as Delivered**
4. **Expected:** Task moves to completed, next task becomes active

### 8.4 Open Navigator
1. Click **Open Navigator** on an active task
2. **Expected:** Google Maps opens in a new tab with the destination address

---

## Test 9: Real-Time WebSocket Tracking

```bash
# Run from project root
node backend/test-socket.js
```

This simulates GPS movement. Watch these update in real-time:
- [ ] Live Map page (`/admin/map`) — markers move
- [ ] Dashboard (`/admin`) — map widget updates
- [ ] Live Feed — new events appear

---

## Test 10: API Health Check

```bash
curl http://localhost:5000/api/health
```

**Expected:** `{"status":"ok","timestamp":"..."}`

---

## Quick Seed Data (Optional)

If the database is empty and you want sample data to test with:

```bash
cd backend
node seed.js
```

This creates sample vehicles, drivers, and deliveries so you can test all pages immediately without manual data entry.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `ERR_EMPTY_RESPONSE` | Backend crashed. Run `node server.js` in the backend folder |
| `EADDRINUSE port 5000` | Kill old process: `npx kill-port 5000`, then restart |
| `vite not found` | Use `npm run dev` from inside the `frontend/` folder |
| Login fails | Register first via the curl command in Test 1.1 |
| Map shows no vehicles | Run `node backend/test-socket.js` to simulate GPS data |
| Charts show no data | Create some deliveries first (Test 5.2) or run `node backend/seed.js` |
