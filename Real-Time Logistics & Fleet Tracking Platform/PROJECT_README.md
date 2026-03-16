# FleetTrack Pro: Real-Time Logistics & Fleet Tracking Platform

FleetTrack Pro is a comprehensive SaaS platform designed to monitor fleet locations, manage deliveries, track driver statuses, and analyze vehicle performance using real-time WebSockets and rich interactive data visualizations.

---

## 🚀 Key Features

### 1. **Admin Dashboard & Analytics**
* **Real-time Overview:** A high-level view of system metrics, active vehicles, and pending deliveries.
* **Performance Analytics:** Comprehensive charts (rendered via `recharts`) showing completed deliveries vs. time, revenue trends, and operational efficiency metrics.
* **Fleet Management:** Full CRUD management of vehicles and overarching fleet statuses.
* **Driver Management:** View active drivers, assign tasks, and monitor individual performance.

### 2. **Dedicated Live Map Tracking**
* **Instant GPS Tracking:** Visualizes active vehicles directly on a functional map (powered by `leaflet` and `react-leaflet`).
* **WebSocket Integration:** Vehicles move on the map dynamically using near real-time coordinate broadcasts via `Socket.io`.
* **Status Indicators:** Map pins show distinct statuses based on what task a driver is currently executing.

### 3. **Interactive Driver Dashboard**
* **Mobile-Optimized Interface:** Built specifically for drivers on the go.
* **Task Management:** Drivers see their active delivery task overlaid with exact locations and recipient details.
* **One-Tap Navigator:** Instantly opens the device's native Google Maps directed precisely to the drop-off location.
* **Status Workflow:** Drivers progress orders smoothly through `Assigned` -> `Picked Up` -> `In Transit` -> `Delivered`.

### 4. **Proof of Delivery (POD) & Digital Signatures**
* **Photo Capture:** Drivers can easily snap or select photos for proof of delivery through the app UI (`multer` backend handling).
* **Live Digital Signing:** Integrated `react-signature-canvas` allows drivers to capture a customer's signature dynamically at the destination directly on their device.
* **Admin Verification:** Admins instantly see the uploaded photos and signatures applied to the Delivery Details.

### 5. **PDF Export Functionality**
* **One-Click Export:** Admins viewing the full Delivery Report in their dashboard can export the entire report securely.
* **Fully Formatted:** Captures the delivery timeline, automated metadata, proof of delivery photo, and raw digital signature to a downloadable PDF file automatically using `html2pdf.js`.

---

## 🛠️ Technology Stack & Dependencies

### **Frontend Stack**
* **Core:** React 19 (`react`, `react-dom`), built via **Vite**.
* **Routing:** `react-router-dom`
* **Real-Time Delivery updates:** `socket.io-client`
* **Network Requests:** `axios`
* **Mapping/GIS:** `leaflet`, `react-leaflet`
* **Data Visualization:** `recharts`
* **Signatures & Exports:** `react-signature-canvas`, `html2pdf.js`
* **Styling:** Custom CSS with Tailwind-inspired utility classes.

### **Backend Stack**
* **Core framework:** Node.js with `express`
* **Database Driver:** PostgreSQL (`pg`)
* **Real-Time Communication:** `socket.io`
* **Authentication/Security:** `bcryptjs` (password hashing), `jsonwebtoken` (Auth Tokens), `cors`, `dotenv`
* **File Uploads:** `multer` (Handling POD images & base64 signature images)

### **Database**
* **System:** PostgreSQL
* **Schema definitions:** Found in `backend/sql/init.sql` (Tables for Users/Drivers, Vehicles, and Deliveries).

---

## ⚙️ How To Run The Project

### 1. Database Setup
1. Ensure **PostgreSQL** is correctly installed and running on your device (default port 5432).
2. Create a database named `fleettrack`.
3. The server will automatically attempt to run the schema found in `backend/sql/init.sql` when it starts up. *(If it fails, you can run the SQL script against the database manually).*

### 2. Environment Variables (.env)
Create a `.env` file in the `backend/` directory based on your system setup. For example:
```env
PORT=5000
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fleettrack
JWT_SECRET=super_secret_dev_key
CORS_ORIGIN=http://localhost:5173
```

### 3. Run The Backend
Open a terminal in the `backend/` directory:
```bash
# Install dependencies
npm install

# Start the server (runs on port 5000)
node server.js
```

### 4. Run The Frontend
Open a separate terminal in the `frontend/` directory:
```bash
# Install dependencies
npm install

# Start the Vite development server (runs on port 5173)
npm run dev
```

### 5. Access the Project
With both the Server and Vite running, open your browser and navigate to the frontend URL (usually `http://localhost:5173`). Have fun tracking!
