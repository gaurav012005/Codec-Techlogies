# 🚀 How to Run the Enterprise CRM System

---

## 📋 Prerequisites

| Software | Version | Download | Required |
|----------|---------|----------|----------|
| **Node.js** | v18+ | [nodejs.org](https://nodejs.org) | ✅ Yes |
| **MongoDB** | v6+ | [mongodb.com/download](https://www.mongodb.com/try/download/community) | ✅ Yes |
| **Redis** | v7+ | [redis.io/download](https://redis.io/download) or Docker | ⚠️ Optional |
| **Git** | Any | [git-scm.com](https://git-scm.com) | ✅ Yes |

> **Note:** Redis is optional. The app works without it — caching will be skipped gracefully.

---

## 📦 Step 1: Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

---

## ⚙️ Step 2: Configure Environment Variables

The backend `.env` file is at `backend/.env`. Default values:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/enterprise-crm
JWT_SECRET=crm_super_secret_jwt_key_2026_enterprise
JWT_REFRESH_SECRET=crm_refresh_secret_key_2026_enterprise
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
REDIS_HOST=localhost
REDIS_PORT=6379
CORS_ORIGIN=http://localhost:5173
```

> **Important:** If your MongoDB runs on a different port or requires authentication, update `MONGODB_URI`.

---

## ▶️ Step 3: Start the Application

You need **2 terminals** open:

### Terminal 1 — Backend API
```bash
cd backend
npm run dev
```
Expected output:
```
Server running on port 5000 in development mode
MongoDB Connected: localhost
Redis Connected (or Redis warning if not installed)
Socket.io initialized
Cron triggers started
```

### Terminal 2 — Frontend UI
```bash
cd frontend
npm run dev
```
Expected output:
```
VITE ready in ~500ms
Local: http://localhost:5173/
```

---

## 🌐 Step 4: Open in Browser

```
http://localhost:5173
```

---

## 🔐 Step 5: Create Your Account

1. You will be redirected to the **Login** page.
2. Click **"Create one free"** to go to the Register page.
3. Fill in the form:
   - **Company Name:** Your company name (e.g., "My Company")
   - **Your Full Name:** Your name
   - **Work Email:** Any email (e.g., `admin@mycompany.com`)
   - **Password:** Minimum 6 characters (e.g., `Test123`)
   - **Industry:** Select from dropdown (optional)
4. Click **"Create Account"**.
5. You'll be logged in as **Super Admin** and redirected to the **Dashboard**.

### Example Test Account (after registration)
```
Email:    admin@mycompany.com
Password: Test123
Role:     Super Admin
```

> **Note:** There is no default account. You must register first. The first user becomes the Super Admin of their organization.

---

## 🎯 Step 6: Explore the Features

After logging in, try these features:

| Feature | How to Access |
|---------|--------------|
| **Dashboard** | Auto-loads after login |
| **Pipeline** | Sidebar → Pipeline (drag-and-drop Kanban) |
| **Leads** | Sidebar → Leads (search, filter, score badges) |
| **Contacts** | Sidebar → Contacts (card grid view) |
| **Companies** | Sidebar → Companies (health score rings) |
| **Tasks** | Sidebar → Tasks (inline completion, overdue alerts) |
| **Email** | Sidebar → Email (compose, templates, threads) |
| **Reports** | Sidebar → Reports (5 tabs with charts) |
| **Notifications** | Bell icon in top bar |
| **Command Palette** | Press **Ctrl+K** |
| **Workflows** | Sidebar → Workflows (visual builder) |
| **Import/Export** | Sidebar → Import/Export (CSV upload/download) |
| **Admin Panel** | Sidebar → Admin Panel (users, teams, config) |
| **Dark/Light Mode** | Sun/Moon icon in top bar |

---

## 📁 Project Structure

```
Enterprise CRM System/
├── backend/                  # Node.js + Express API
│   ├── config/              # DB, Redis configuration
│   ├── controllers/         # Route handlers (14 controllers)
│   ├── middleware/           # Auth, RBAC, Tenant, Error handling
│   ├── models/              # Mongoose schemas (14 models)
│   ├── routes/              # API routes (14 route files)
│   ├── utils/               # Logger, workflow engine, cron triggers
│   ├── validators/          # Joi validation schemas
│   ├── workers/             # Bull queue job processors
│   ├── server.js            # Entry point
│   └── .env                 # Environment variables
├── frontend/                 # React + Vite
│   ├── src/
│   │   ├── api/             # Axios instance with JWT interceptors
│   │   ├── components/      # Reusable components (15+ components)
│   │   ├── context/         # AuthContext (global auth state)
│   │   ├── layouts/         # AppLayout (sidebar + topbar + page)
│   │   ├── pages/           # Page components (13 pages)
│   │   ├── App.jsx          # Router with lazy-loaded routes
│   │   ├── main.jsx         # React entry point
│   │   └── index.css        # Design system (~2600 lines)
│   └── index.html
└── docs/                     # Documentation
    ├── PRD.md               # Product Requirements
    ├── IMPLEMENTATION_PLAN.md # 9-phase plan
    ├── tasks.md              # Task checklist
    ├── test.md               # Testing guide
    └── run.md                # This file
```

---

## 🔌 API Endpoints (Quick Reference)

| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/auth/register` | Register new org + admin |
| POST | `/api/auth/login` | Login, get JWT tokens |
| POST | `/api/auth/refresh` | Refresh access token |
| GET | `/api/auth/me` | Get current user profile |
| GET | `/api/leads` | List leads (paginated, search, filter) |
| POST | `/api/leads` | Create lead |
| GET | `/api/contacts` | List contacts |
| GET | `/api/companies` | List companies |
| GET | `/api/deals/board/:pipelineId` | Kanban board data |
| POST | `/api/deals` | Create deal |
| PUT | `/api/deals/:id/stage` | Move deal to stage |
| GET | `/api/tasks` | List tasks |
| GET | `/api/reports/dashboard` | Dashboard KPIs |
| GET | `/api/search?q=term` | Global search |
| GET | `/api/workflows` | List workflows |

---

## ❓ Troubleshooting

### MongoDB not connecting
- Make sure MongoDB is running: `mongod` or check Windows Services for "MongoDB"
- Alternatively, use MongoDB Atlas (cloud): Update `MONGODB_URI` in `.env`

### Redis warning (not an error)
- Redis is optional. If not installed, the app works without caching.
- To install Redis on Windows: Use Docker (`docker run -d -p 6379:6379 redis`)

### Port already in use
- Backend: Change `PORT` in `backend/.env`
- Frontend: Vite will auto-pick the next available port

### Build for production
```bash
cd frontend
npm run build
# Output in frontend/dist/
```

### Run tests
```bash
cd backend
npm test
```

---

## 🛑 How to Stop

Press `Ctrl + C` in each terminal to stop the servers.

---

*Last Updated: February 25, 2026*
