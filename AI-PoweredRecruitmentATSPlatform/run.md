# 🚀 HireAI — How to Run

## Prerequisites

Make sure you have these installed:

- **Node.js** (v18+) — [https://nodejs.org](https://nodejs.org)
- **MongoDB** (v6+) — [https://www.mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
- **npm** (comes with Node.js)

---

## 1. Clone the Repository

```bash
git clone <your-repo-url>
cd AI-PoweredRecruitmentATSPlatform
```

---

## 2. Start MongoDB

Make sure MongoDB is running on your system:

```bash
# Windows (if installed as service, it auto-starts)
# Otherwise, start manually:
mongod
```

> MongoDB should be running at `mongodb://127.0.0.1:27017`

---

## 3. Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file (if not present)
# It should contain:
# PORT=5000
# MONGODB_URI=mongodb://127.0.0.1:27017/hireai
# JWT_SECRET=hireai_super_secret_key_change_in_production
# JWT_EXPIRE=7d

# Start the server
node src/server.js
```

✅ You should see:
```
🚀 HireAI server running on port 5000
✅ MongoDB connected: 127.0.0.1
```

---

## 4. Frontend Setup

Open a **new terminal**:

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

✅ You should see:
```
VITE v7.x.x ready in xxx ms

➜ Local:   http://localhost:5173/
```

---

## 5. Open in Browser

| Page | URL |
|------|-----|
| 🏠 Landing Page | [http://localhost:5173/](http://localhost:5173/) |
| 🔐 Login | [http://localhost:5173/login](http://localhost:5173/login) |
| 📝 Register | [http://localhost:5173/register](http://localhost:5173/register) |
| 🔑 Forgot Password | [http://localhost:5173/forgot-password](http://localhost:5173/forgot-password) |
| 📊 Dashboard | [http://localhost:5173/dashboard](http://localhost:5173/dashboard) |
| 💼 Jobs | [http://localhost:5173/dashboard/jobs](http://localhost:5173/dashboard/jobs) |
| ➕ Create Job | [http://localhost:5173/dashboard/jobs/new](http://localhost:5173/dashboard/jobs/new) |
| 👥 Candidates | [http://localhost:5173/dashboard/candidates](http://localhost:5173/dashboard/candidates) |
| 📋 Pipeline (Kanban) | [http://localhost:5173/dashboard/pipeline](http://localhost:5173/dashboard/pipeline) |
| 📅 Interviews | [http://localhost:5173/dashboard/interviews](http://localhost:5173/dashboard/interviews) |

---

## 6. API Endpoints

Base URL: `http://localhost:5000/api`

### Health Check
```
GET /api/health
```

### Authentication
```
POST /api/auth/register     — Create new user
POST /api/auth/login        — Login & get JWT
POST /api/auth/forgot-password — Request password reset
GET  /api/auth/me           — Get current user (requires token)
```

### Jobs (requires auth token)
```
GET    /api/jobs             — List all jobs (with filters)
GET    /api/jobs/:id         — Get single job
POST   /api/jobs             — Create new job
PUT    /api/jobs/:id         — Update job
DELETE /api/jobs/:id         — Delete job
GET    /api/jobs/stats/overview — Job statistics
```

### Candidates (requires auth token)
```
GET    /api/candidates       — List candidates
GET    /api/candidates/:id   — Get candidate profile
POST   /api/candidates       — Add candidate
PUT    /api/candidates/:id   — Update candidate
DELETE /api/candidates/:id   — Delete candidate
```

### Pipeline (requires auth token)
```
GET /api/pipeline/:jobId     — Get pipeline for a job
PUT /api/pipeline/move       — Move candidate between stages
```

### Interviews (requires auth token)
```
GET    /api/interviews       — List interviews (with date filters)
GET    /api/interviews/:id   — Get interview details
POST   /api/interviews       — Schedule interview
PUT    /api/interviews/:id   — Update interview
DELETE /api/interviews/:id   — Cancel/delete interview
POST   /api/interviews/:id/feedback — Add feedback
```

---

## 7. Quick Start (Both Servers)

Run these in **two separate terminals**:

**Terminal 1 — Backend:**
```bash
cd backend && npm install && node src/server.js
```

**Terminal 2 — Frontend:**
```bash
cd frontend && npm install && npm run dev
```

---

## 📁 Project Structure

```
AI-PoweredRecruitmentATSPlatform/
├── frontend/           ← React + Vite + TypeScript
│   ├── src/
│   │   ├── components/ ← Reusable UI components
│   │   ├── layouts/    ← Dashboard layout (sidebar + topbar)
│   │   ├── pages/      ← All page components
│   │   ├── App.tsx     ← Router configuration
│   │   └── index.css   ← Global design system
│   ├── package.json
│   └── vite.config.ts  ← Proxy config (API → :5000)
│
├── backend/            ← Node.js + Express + MongoDB
│   ├── src/
│   │   ├── config/     ← Database connection
│   │   ├── models/     ← Mongoose schemas
│   │   ├── controllers/← API logic
│   │   ├── middleware/  ← Auth & role middleware
│   │   ├── routes/     ← Express routes
│   │   └── server.js   ← App entry point
│   ├── .env            ← Environment variables
│   └── package.json
│
├── stitch/             ← UI/UX design screenshots
├── uiux.md             ← Design specifications
└── run.md              ← This file
```

---

## ⚠️ Troubleshooting

| Issue | Fix |
|-------|-----|
| `MongoDB connection error` | Make sure `mongod` is running |
| `Port 5000 already in use` | Kill the process: `npx kill-port 5000` |
| `Port 5173 already in use` | Kill the process: `npx kill-port 5173` |
| `Module not found` | Run `npm install` in the respective directory |
| `CORS error in browser` | Backend CORS allows `:5173` and `:3000` by default |
