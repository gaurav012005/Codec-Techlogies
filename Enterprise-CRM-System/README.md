<p align="center">
  <h1 align="center">⚡ Enterprise CRM System</h1>
  <p align="center">
    <strong>A full-stack Customer Relationship Management platform built with the MERN stack</strong>
  </p>
  <p align="center">
    <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react" alt="React" />
    <img src="https://img.shields.io/badge/Node.js-18+-339933?style=flat&logo=node.js" alt="Node.js" />
    <img src="https://img.shields.io/badge/MongoDB-6+-47A248?style=flat&logo=mongodb" alt="MongoDB" />
    <img src="https://img.shields.io/badge/Socket.io-4-010101?style=flat&logo=socket.io" alt="Socket.io" />
    <img src="https://img.shields.io/badge/Vite-7-646CFF?style=flat&logo=vite" alt="Vite" />
  </p>
</p>

---

## 🎯 Overview

Enterprise CRM is a **production-grade** customer relationship management system designed for sales teams. It features a Kanban pipeline, real-time collaboration, workflow automation, AI-powered deal predictions, and a rich analytics dashboard — all wrapped in a premium glassmorphism dark/light UI.

---

## ✨ Key Features

### 📊 Sales Pipeline & Deals
- **Kanban board** with drag-and-drop stage transitions
- Weighted revenue forecasting (best/worst/weighted)
- AI deal win probability predictions
- **Confetti celebration** when deals are won 🎉

### 👥 Lead & Contact Management
- Full CRUD with search, pagination, and filters
- **Lead scoring** with Hot/Warm/Cold badges (Flame/Sun/Snowflake icons)
- Contact timeline and activity tracking
- Company management with health scores

### 📈 Reports & Analytics
- Dashboard KPIs (Revenue, Win Rate, Avg Deal Size, Conversion)
- Pipeline funnel and stage drop-off analysis
- Forecast vs Actual revenue charts
- Team leaderboard and performance comparisons
- Date range filters and per-team breakdowns

### 📧 Email & Notifications
- Email compose, templates, and threaded conversations
- Open/click tracking
- Real-time notification bell with badge count
- Notification center with read/unread management

### 🔄 Workflow Automation
- Visual workflow builder (triggers → actions → delays)
- Triggers: Lead Created, Deal Stage Changed, Task Overdue
- Actions: Create Task, Send Email, Update Field, Send Notification
- Cron-based recurring triggers (stale deals, overdue tasks, daily digests)
- Pre-built seed workflows for new organizations

### ⚙️ Admin Panel
- **User management**: roles, invite, activate/deactivate
- **Team management**: create teams, assign leads, color-coded cards
- **Pipeline configuration**: drag-reorder stages, edit colors/probabilities
- **Custom fields**: create per-entity custom fields
- **Sales targets**: set per-user monthly/quarterly targets
- **Audit logs**: searchable logs with user, action, entity, timestamp

### 🔍 Global Search (Ctrl+K)
- Spotlight-style command palette
- Full-text search across leads, contacts, companies, deals, tasks
- Quick navigation commands
- Recent searches persistence

### 📦 Import/Export
- CSV import with column mapping and duplicate detection
- Excel/CSV export with filters
- Import history and status tracking

### 🔐 Security & Multi-Tenancy
- JWT authentication with refresh token rotation
- RBAC: Super Admin, Sales Manager, Sales Executive, Support, Analyst
- Organization-scoped data isolation
- Helmet, CORS, rate limiting

### 🎨 UI/UX Polish
- **Dark/Light mode** toggle with smooth transitions
- Glassmorphism cards with backdrop blur
- Skeleton loaders for async data
- Empty states with icons and action buttons
- Error states with retry buttons
- Micro-animations (hover lift, page transitions, modal slides)
- Fully responsive: Mobile → Tablet → Desktop
- Collapsible sidebar with floating mobile toggle

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|-----------|---------|
| **Node.js 18+** | Runtime |
| **Express 4** | HTTP framework |
| **MongoDB 6+ (Mongoose 9)** | Primary database |
| **Redis (ioredis)** | Caching & session store |
| **Socket.io 4** | Real-time WebSocket events |
| **Bull** | Background job queues |
| **Nodemailer** | Email sending |
| **JWT** | Authentication |
| **Joi** | Request validation |
| **Winston** | Structured logging |
| **Helmet** | Security headers |

### Frontend
| Technology | Purpose |
|-----------|---------|
| **React 19** | UI framework |
| **Vite 7** | Build tool & dev server |
| **React Router 7** | Client-side routing |
| **Axios** | HTTP client |
| **Recharts** | Data visualization |
| **@hello-pangea/dnd** | Drag-and-drop (Kanban) |
| **Lucide React** | Icon system |
| **Socket.io Client** | Real-time updates |

---

## 📁 Project Structure

```
Enterprise CRM System/
├── backend/
│   ├── config/              # Database & Redis configuration
│   ├── controllers/         # Route handlers (auth, leads, deals, etc.)
│   ├── middleware/           # Auth, RBAC, tenant isolation, error handler
│   ├── models/              # Mongoose schemas (14 models)
│   ├── routes/              # Express route definitions
│   ├── utils/               # Logger, workflow engine, cron triggers, seeds
│   ├── validators/          # Joi validation schemas
│   ├── workers/             # Bull queue job processors
│   ├── server.js            # Entry point
│   └── .env                 # Environment variables
├── frontend/
│   ├── src/
│   │   ├── api/             # Axios instance with interceptors
│   │   ├── components/      # Reusable components (Sidebar, NotificationBell, etc.)
│   │   ├── context/         # AuthContext (JWT state management)
│   │   ├── layouts/         # AppLayout (sidebar + topbar + content)
│   │   ├── pages/           # Page components (13 pages)
│   │   ├── App.jsx          # Router with lazy-loaded routes
│   │   ├── main.jsx         # React entry point
│   │   └── index.css        # Complete design system (~2600 lines)
│   └── index.html
└── docs/
    ├── PRD.md               # Product Requirements Document
    ├── IMPLEMENTATION_PLAN.md # 9-phase implementation plan
    ├── tasks.md              # Granular task checklist
    ├── test.md               # Full testing guide
    ├── run.md                # Setup & run instructions
    └── README.md             # This file
```

---

## 🚀 Quick Start

### Prerequisites

| Software | Version | Required |
|----------|---------|----------|
| **Node.js** | v18+ | ✅ Yes |
| **MongoDB** | v6+ | ✅ Yes |
| **Redis** | v7+ | ⚠️ Optional (caching skipped gracefully) |

### 1. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Environment

The backend `.env` file at `backend/.env` contains:

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

### 3. Start Servers

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

### 4. Open Browser

Navigate to **http://localhost:5173** → Register → Start using the CRM!

> First registered user becomes **Super Admin** of their organization.

---

## 🔌 API Reference

### Core Endpoints

| Module | Base Path | Key Routes |
|--------|-----------|------------|
| **Auth** | `/api/auth` | `POST /register`, `POST /login`, `POST /refresh`, `GET /me` |
| **Leads** | `/api/leads` | CRUD + `/stats` |
| **Contacts** | `/api/contacts` | CRUD |
| **Companies** | `/api/companies` | CRUD |
| **Deals** | `/api/deals` | CRUD + `/board/:pipelineId`, `/forecast`, `PUT /:id/stage` |
| **Pipelines** | `/api/pipelines` | CRUD + stage management |
| **Tasks** | `/api/tasks` | CRUD + `/stats`, `PUT /:id/complete` |
| **Reports** | `/api/reports` | `/dashboard`, `/pipeline`, `/forecast`, `/team`, `/conversion` |
| **Emails** | `/api/emails` | `/send`, `/templates`, `/threads/:contactId` |
| **Notifications** | `/api/notifications` | CRUD + `/read-all` |
| **Admin** | `/api/admin` | `/users`, `/teams`, `/custom-fields`, `/targets`, `/audit-logs` |
| **Import/Export** | `/api/data` | `POST /import/:entity`, `GET /export/:entity` |
| **Search** | `/api/search` | `GET /?q=term` |
| **Workflows** | `/api/workflows` | CRUD + `/toggle`, `/test`, `/analytics` |
| **Health** | `/api/health` | `GET /` |

---

## 👤 Role-Based Access Control (RBAC)

| Role | Permissions |
|------|------------|
| **Super Admin** | Full access — all CRUD, admin panel, user management |
| **Sales Manager** | Manage leads, deals, pipeline. View team reports. Set targets. |
| **Sales Executive** | Manage own leads/deals/tasks. View personal reports. |
| **Support** | View contacts, leads. Manage tasks. Limited pipeline access. |
| **Analyst** | View-only access to reports, dashboards, and analytics. |

---

## 🧪 Testing

See [`docs/test.md`](docs/test.md) for the complete manual testing guide covering all 8 phases:

- Phase 1: Auth & Registration
- Phase 2: Leads, Contacts, Companies
- Phase 3: Pipeline & Deals (Kanban, Confetti)
- Phase 4: Tasks & Activities
- Phase 5: Reports & Analytics
- Phase 6: Email, Notifications, Lead Scoring
- Phase 7: Admin Panel, Import/Export, Command Palette
- Phase 8: Real-Time & Workflow Automation
- UI Polish: Dark/Light mode, Responsiveness, Animations

---

## 🌗 Dark & Light Mode

The app includes a polished dark/light mode toggle in the top bar. Theme preference persists across sessions via `localStorage`. All components smoothly transition between themes.

---

## 📱 Responsive Breakpoints

| Breakpoint | Behavior |
|-----------|----------|
| **Desktop (1025px+)** | Full sidebar, multi-column grids |
| **Tablet (768px–1024px)** | Icon-only sidebar, 2-column KPIs |
| **Mobile (≤768px)** | Hidden sidebar + floating toggle FAB, stacked layouts |
| **Small Mobile (≤480px)** | Single-column KPIs, compact padding |

---

## ⚡ Performance Optimizations

- **Code Splitting**: React.lazy + Suspense per route (reduces initial bundle)
- **Debounced Search**: 300ms debounce on search inputs
- **Redis Caching**: Dashboard and pipeline endpoints cached
- **Skeleton Loaders**: Shimmer animations during async data fetch
- **Optimized Build**: Vite production build with tree-shaking

---

## 📄 Documentation

| Document | Description |
|----------|-------------|
| [`docs/PRD.md`](docs/PRD.md) | Product Requirements Document |
| [`docs/IMPLEMENTATION_PLAN.md`](docs/IMPLEMENTATION_PLAN.md) | 9-phase implementation plan |
| [`docs/tasks.md`](docs/tasks.md) | Detailed task checklist |
| [`docs/test.md`](docs/test.md) | Full testing guide |
| [`docs/run.md`](docs/run.md) | Setup & run instructions |

---

## ❓ Troubleshooting

| Issue | Solution |
|-------|---------|
| MongoDB not connecting | Ensure `mongod` is running, or use Atlas URI |
| Redis warning | Optional — app works without it |
| Port in use | Change `PORT` in `.env`, Vite auto-picks next port |
| Build fails | Run `npm install` in both `backend/` and `frontend/` |
| Blank page after login | Check browser console for errors, ensure backend is running |

---

## 📜 License

This project is for educational and demonstration purposes.

---

*Built with ❤️ using MERN Stack • Last Updated: February 25, 2026*
