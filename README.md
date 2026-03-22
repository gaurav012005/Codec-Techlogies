<p align="center">
  <h1 align="center">🚀 Codec Technologies — Internship Projects</h1>
  <p align="center">
    <strong>A collection of 6 full-stack web applications built during internship at Codec Technologies</strong>
  </p>
  <p align="center">
    <img src="https://img.shields.io/badge/Projects-6-blueviolet?style=for-the-badge" alt="Projects" />
    <img src="https://img.shields.io/badge/Stack-Full--Stack-00C853?style=for-the-badge" alt="Full-Stack" />
    <img src="https://img.shields.io/badge/Status-Completed-success?style=for-the-badge" alt="Status" />
  </p>
</p>

---

## 📋 Table of Contents

| # | Project | Tech Stack | Description |
|:-:|---------|-----------|-------------|
| 1 | [Enterprise CRM System](#1--enterprise-crm-system) | React · Express · MongoDB · Socket.io | Full-featured CRM with Kanban pipeline, workflow automation & analytics |
| 2 | [AI-Powered Recruitment ATS Platform](#2--ai-powered-recruitment--ats-platform) | React (TypeScript) · Express · MongoDB | Applicant Tracking System with AI resume parsing & candidate ranking |
| 3 | [Online Exam Platform](#3--online-exam-platform) | React · Express · Prisma · SQLite | Secure exam platform with role-based access and auto-grading |
| 4 | [Online Examination Proctoring Platform](#4--online-examination-proctoring-platform) | React · Express · Prisma · Socket.io | AI-proctored exams with face detection, real-time monitoring & analytics |
| 5 | [Real-Time Logistics & Fleet Tracking](#5--real-time-logistics--fleet-tracking-platform) | React · Express · PostgreSQL · Socket.io | Fleet management with live GPS tracking, POD & digital signatures |
| 6 | [Smart Inventory & Supply Chain Management](#6--smart-inventory--supply-chain-management-system) | Next.js · Express · SQL.js · WebSocket | Inventory management with supplier tracking, analytics & forecasting |

---

## 1. ⚡ Enterprise CRM System

> **Full-stack Customer Relationship Management platform for sales teams**

<p>
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react" />
  <img src="https://img.shields.io/badge/Express-4-000000?style=flat&logo=express" />
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb" />
  <img src="https://img.shields.io/badge/Socket.io-010101?style=flat&logo=socket.io" />
  <img src="https://img.shields.io/badge/Redis-DC382D?style=flat&logo=redis" />
  <img src="https://img.shields.io/badge/Vite-7-646CFF?style=flat&logo=vite" />
</p>

**📂 Folder:** [`Enterprise-CRM-System/`](Enterprise-CRM-System/)

### ✨ Key Features
- **Kanban Pipeline** — Drag-and-drop deal management with stage transitions
- **AI Deal Predictions** — Win probability forecasting with weighted scoring
- **Workflow Automation** — Visual workflow builder with triggers, actions & cron jobs
- **Reports & Analytics** — Dashboard KPIs, funnel analysis, revenue forecasting, team leaderboards
- **Lead Scoring** — Hot/Warm/Cold classification with scoring badges
- **Email System** — Compose, templates, threaded conversations, open/click tracking
- **Global Search (Ctrl+K)** — Spotlight-style command palette across all entities
- **Import/Export** — CSV import with column mapping, Excel/CSV export
- **Admin Panel** — User/Team management, pipeline config, custom fields, audit logs
- **RBAC** — Super Admin, Sales Manager, Sales Executive, Support, Analyst roles
- **Real-time Notifications** — Socket.io powered live notification bell
- **Dark/Light Mode** — Glassmorphism UI with smooth theme transitions

### 🛠️ Tech Stack
| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 19, Vite 7, React Router 7, Recharts, @hello-pangea/dnd, Lucide React, Axios |
| **Backend** | Node.js, Express 4, Mongoose 9, Socket.io 4, Bull queues, JWT, Joi, Winston |
| **Database** | MongoDB 6+, Redis (caching) |

### 🚀 How to Run
```bash
# Backend
cd Enterprise-CRM-System/backend
npm install
npm run dev          # Runs on port 5000

# Frontend
cd Enterprise-CRM-System/frontend
npm install
npm run dev          # Runs on port 5173
```

---

## 2. 🤖 AI-Powered Recruitment & ATS Platform

> **AI-driven Applicant Tracking System with resume parsing, candidate ranking & hiring automation**

<p>
  <img src="https://img.shields.io/badge/React-19_(TypeScript)-61DAFB?style=flat&logo=react" />
  <img src="https://img.shields.io/badge/Express-4-000000?style=flat&logo=express" />
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb" />
  <img src="https://img.shields.io/badge/Vite-7-646CFF?style=flat&logo=vite" />
</p>

**📂 Folder:** [`AI-PoweredRecruitmentATSPlatform/`](AI-PoweredRecruitmentATSPlatform/)

### ✨ Key Features
- **AI Resume Parsing** — NLP-powered extraction of skills, experience & education from resumes
- **Candidate Ranking** — Weighted similarity scoring against job descriptions
- **Kanban Hiring Pipeline** — Drag-and-drop: Applied → Shortlisted → Interview → Offer → Hired
- **Predictive Hiring Score** — ML-powered candidate success & retention prediction
- **Resume Fraud Detection** — AI-generated content detection, plagiarism & anomaly flagging
- **AI Talent Pool** — Smart passive candidate recommendations for new job openings
- **Collaborative Hiring** — Team evaluations, anonymous scoring, consensus dashboards
- **Interview Scheduling** — Calendar integration, scorecards, structured feedback
- **Automated Workflows** — Event-driven email automation with customizable templates
- **Analytics Dashboard** — Hiring funnel, time-to-hire, sourcing channels, recruiter performance
- **Multi-Tenant SaaS** — Organization-scoped data isolation
- **RBAC** — Super Admin, HR Admin, Recruiter, Hiring Manager, Candidate roles

### 🛠️ Tech Stack
| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 19 (TypeScript), Vite 7, React Router 7 |
| **Backend** | Node.js, Express 4, Mongoose, JWT, Nodemailer |
| **Database** | MongoDB |

### 🚀 How to Run
```bash
# Backend
cd AI-PoweredRecruitmentATSPlatform/backend
npm install
npm run dev          # Runs on port 5000

# Frontend
cd AI-PoweredRecruitmentATSPlatform/frontend
npm install
npm run dev          # Runs on port 5173
```

---

## 3. 📝 Online Exam Platform

> **Secure online examination platform with role-based access and auto-grading**

<p>
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react" />
  <img src="https://img.shields.io/badge/Express-5-000000?style=flat&logo=express" />
  <img src="https://img.shields.io/badge/Prisma-2D3748?style=flat&logo=prisma" />
  <img src="https://img.shields.io/badge/SQLite-003B57?style=flat&logo=sqlite" />
  <img src="https://img.shields.io/badge/Vite-5-646CFF?style=flat&logo=vite" />
</p>

**📂 Folder:** [`online-exam-platform/`](online-exam-platform/)

### ✨ Key Features
- **Exam Management** — Create, schedule & manage exams with multiple question types
- **Auto-Grading** — Automatic scoring for objective questions
- **Role-Based Access** — Admin, Teacher, and Student roles with scoped permissions
- **Secure Authentication** — JWT-based auth with cookie management
- **Rate Limiting** — Built-in request throttling for API security
- **Toast Notifications** — Real-time feedback with react-hot-toast

### 🛠️ Tech Stack
| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 18, Vite 5, React Router 6, Axios, React Icons, React Hot Toast |
| **Backend** | Node.js, Express 5, Prisma ORM, JWT, Helmet, Morgan |
| **Database** | SQLite (via Prisma) |

### 🚀 How to Run
```bash
# Backend
cd online-exam-platform/backend
npm install
npx prisma generate
npm run dev          # Runs on port 5000

# Frontend
cd online-exam-platform/frontend
npm install
npm run dev          # Runs on port 5173
```

---

## 4. 🎯 Online Examination Proctoring Platform

> **AI-proctored exam platform with face detection, real-time monitoring & detailed analytics**

<p>
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react" />
  <img src="https://img.shields.io/badge/Express-5-000000?style=flat&logo=express" />
  <img src="https://img.shields.io/badge/Prisma-2D3748?style=flat&logo=prisma" />
  <img src="https://img.shields.io/badge/Socket.io-010101?style=flat&logo=socket.io" />
  <img src="https://img.shields.io/badge/TailwindCSS-4-06B6D4?style=flat&logo=tailwindcss" />
</p>

**📂 Folder:** [`OnlineExaminationProctoringPlatformObjective/`](OnlineExaminationProctoringPlatformObjective/)

### ✨ Key Features
- **AI Face Detection** — Real-time face monitoring during exams using @vladmandic/face-api
- **Live Proctoring** — Socket.io powered real-time exam supervision
- **Rich Question Editor** — WYSIWYG editor for creating exam questions (React Quill)
- **Analytics Dashboard** — Detailed exam analytics with Recharts visualizations
- **Auto-Grading** — Instant scoring with detailed result breakdowns
- **Violation Detection** — Tab switching, multiple faces, no face detection alerts
- **Framer Motion Animations** — Smooth page transitions and UI interactions
- **Data Tables** — Advanced filtering and sorting with TanStack React Table
- **Role-Based Access** — Admin, Teacher, Student with granular permissions

### 🛠️ Tech Stack
| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 18, Vite 5, TailwindCSS 4, Framer Motion, Recharts, Face-API, Socket.io Client, Lucide React |
| **Backend** | Node.js, Express 5, Prisma ORM, Socket.io, JWT, Nodemailer |
| **Database** | SQLite (via Prisma) |

### 🚀 How to Run
```bash
# Backend
cd OnlineExaminationProctoringPlatformObjective/backend
npm install
npx prisma generate
npm run dev          # Runs on port 5000

# Frontend
cd OnlineExaminationProctoringPlatformObjective/frontend
npm install
npm run dev          # Runs on port 5173
```

---

## 5. 🚛 Real-Time Logistics & Fleet Tracking Platform

> **FleetTrack Pro — Live GPS tracking, delivery management, POD & digital signatures**

<p>
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react" />
  <img src="https://img.shields.io/badge/Express-5-000000?style=flat&logo=express" />
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql" />
  <img src="https://img.shields.io/badge/Socket.io-010101?style=flat&logo=socket.io" />
  <img src="https://img.shields.io/badge/Leaflet-199900?style=flat&logo=leaflet" />
</p>

**📂 Folder:** [`Real-Time Logistics & Fleet Tracking Platform/`](Real-Time%20Logistics%20%26%20Fleet%20Tracking%20Platform/)

### ✨ Key Features
- **Live Map Tracking** — Real-time GPS vehicle tracking on interactive Leaflet maps
- **WebSocket Updates** — Near real-time coordinate broadcasts via Socket.io
- **Admin Dashboard** — Fleet metrics, performance analytics, delivery trends (Recharts)
- **Driver Dashboard** — Mobile-optimized interface with task management
- **Delivery Workflow** — Status progression: Assigned → Picked Up → In Transit → Delivered
- **Proof of Delivery (POD)** — Photo capture + digital signature via react-signature-canvas
- **PDF Export** — One-click delivery report export with full metadata (html2pdf.js)
- **One-Tap Navigation** — Native Google Maps integration for drivers
- **Fleet & Driver Management** — Full CRUD for vehicles and driver assignments

### 🛠️ Tech Stack
| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 19, Vite 7, Leaflet, React-Leaflet, Recharts, Socket.io Client, React Signature Canvas, html2pdf.js |
| **Backend** | Node.js, Express 5, pg (PostgreSQL driver), Socket.io, Multer, JWT |
| **Database** | PostgreSQL |

### 🚀 How to Run
```bash
# Setup PostgreSQL database named 'fleettrack'

# Backend
cd "Real-Time Logistics & Fleet Tracking Platform/backend"
npm install
node server.js       # Runs on port 5000

# Frontend
cd "Real-Time Logistics & Fleet Tracking Platform/frontend"
npm install
npm run dev          # Runs on port 5173
```

---

## 6. 📦 Smart Inventory & Supply Chain Management System

> **NexusFlow — Intelligent inventory management with supplier tracking, analytics & forecasting**

<p>
  <img src="https://img.shields.io/badge/Next.js-16-000000?style=flat&logo=next.js" />
  <img src="https://img.shields.io/badge/Express-4-000000?style=flat&logo=express" />
  <img src="https://img.shields.io/badge/SQL.js-003B57?style=flat&logo=sqlite" />
  <img src="https://img.shields.io/badge/TailwindCSS-4-06B6D4?style=flat&logo=tailwindcss" />
  <img src="https://img.shields.io/badge/WebSocket-010101?style=flat" />
</p>

**📂 Folder:** [`Smart Inventory & Supply Chain Management System/`](Smart%20Inventory%20%26%20Supply%20Chain%20Management%20System/)

### ✨ Key Features
- **Inventory Dashboard** — Real-time stock levels, low-stock alerts, category breakdowns
- **Product Management** — Full CRUD with categories, SKU tracking & stock management
- **Supplier Management** — Supplier directory with performance ratings
- **Order Management** — Purchase orders, order tracking, fulfillment workflows
- **Analytics & Forecasting** — Demand forecasting, revenue trends, inventory turnover (Recharts)
- **Real-time Updates** — WebSocket-powered live inventory sync
- **Animations** — Smooth transitions with Framer Motion
- **State Management** — Zustand for lightweight, scalable state
- **Responsive Design** — TailwindCSS with mobile-first approach

### 🛠️ Tech Stack
| Layer | Technologies |
|-------|-------------|
| **Frontend** | Next.js 16, React 19, TailwindCSS 4, Framer Motion, Recharts, Zustand, Lucide React |
| **Backend** | Node.js, Express 4, SQL.js, JWT, Helmet, Morgan, WebSocket (ws) |
| **Database** | SQLite (via SQL.js — in-memory/file-based) |

### 🚀 How to Run
```bash
# Backend
cd "Smart Inventory & Supply Chain Management System/backend"
npm install
npm run seed         # Seed initial data
npm run dev          # Runs on port 5000

# Frontend
cd "Smart Inventory & Supply Chain Management System/frontend"
npm install
npm run dev          # Runs on port 3000
```

---

## 🏗️ Common Architecture

All projects follow a consistent **monorepo-style** structure:

```
ProjectName/
├── backend/
│   ├── config/          # Database & service config
│   ├── controllers/     # Route handlers (business logic)
│   ├── middleware/       # Auth, RBAC, error handling
│   ├── models/          # Database schemas/models
│   ├── routes/          # API route definitions
│   ├── utils/           # Helpers, logger, utilities
│   ├── server.js        # Entry point
│   └── .env             # Environment variables
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page-level components
│   │   ├── context/     # React context providers
│   │   ├── api/         # API client configuration
│   │   └── App.jsx      # Root component with routing
│   └── index.html
└── docs/                # PRD, implementation plans, testing guides
```

### 🔐 Common Security Features
- **JWT Authentication** — Access + Refresh token rotation
- **Role-Based Access Control (RBAC)** — Granular permissions per role
- **Helmet** — HTTP security headers
- **CORS** — Configured cross-origin policies
- **Rate Limiting** — Request throttling
- **Input Validation** — Server-side validation (Joi / express-validator)
- **Password Hashing** — bcryptjs

---

## 💻 Prerequisites

| Software | Version | Used By |
|----------|---------|---------|
| **Node.js** | v18+ | All projects |
| **MongoDB** | v6+ | Enterprise CRM, AI Recruitment ATS |
| **PostgreSQL** | v14+ | Fleet Tracking Platform |
| **Redis** | v7+ | Enterprise CRM (optional) |

> **Note:** Projects using Prisma (Exam Platforms) and SQL.js (Smart Inventory) use embedded SQLite — no external database setup needed.

---

## 👤 Author

**Gaurav** — Intern at Codec Technologies  
📧 GitHub: [@gaurav012005](https://github.com/gaurav012005)

---

## 📜 License

These projects are built for educational and internship demonstration purposes.

---

<p align="center">
  <strong>Built with ❤️ during internship at Codec Technologies • March 2026</strong>
</p>