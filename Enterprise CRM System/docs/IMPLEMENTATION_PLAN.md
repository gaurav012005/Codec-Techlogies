# 🏗️ Implementation Plan: Phase 1 (Foundation & Feature 1)

This document outlines the step-by-step plan to set up the foundational architecture (Frontend & Backend) and implement **Feature 1 (Authentication, RBAC, Multi-tenancy, and Redis Caching)**.

---

## 📅 Objective
Build the core scaffolding of the Enterprise CRM System, implement secure authentication with role-based access control and multi-tenancy, and successfully test that the full stack runs interconnectedly.

---

## 🛠️ Step 1: Project Initialization & Infrastructure
Set up the monorepo structure and initialize both frontend and backend projects.

### Backend Setup:
- [x] Initialize Node.js backend (`npm init -y`) in `/backend`.
- [x] Install core dependencies: `express, mongoose, dotenv, cors, helmet, morgan, jsonwebtoken, bcrypt, joi, redis, bull`.
- [x] Install dev dependencies: `nodemon, jest, supertest`.
- [x] Setup `server.js` (Express app initialization).
- [x] Configure MongoDB connection logic.
- [x] Configure Redis connection and Bull queues instantiation.
- [x] Set up basic error handling middleware and structured logging (Winston).

### Frontend Setup:
- [x] Initialize React + Vite app (`npm create vite@latest frontend -- --template react`) in `/frontend`.
- [x] Install core dependencies: `react-router-dom, axios, jwt-decode, lucide-react` (icons).
- [x] Set up Vanilla CSS structure (`index.css`, design system tokens for colors, glassmorphism, typography).
- [x] Configure React Router setup with basic layout (Sidebar + Main Content).

### Docker Setup (Optional for local dev, but required for architecture):
- [ ] Create `docker-compose.yml` for MongoDB, Redis, Backend (API), and Bull Worker.

---

## 🧱 Step 2: Database Models & Schemas (Backend)
Define the core Mongoose schemas required for Feature 1.

- [x] **Organization Model**: `_id`, `name`, `slug`, `plan`, etc. (For Multi-Tenancy).
- [x] **User Model**: `_id`, `name`, `email`, `password` (hashed), `role`, `organizationId`.
- [x] **AuditLog Model**: For tracking logins and sensitive actions.
- [x] Define Mongoose indexes (`email` unique, `organizationId`).

---

## 🔐 Step 3: Implement Feature 1 - Authentication, RBAC & Multi-Tenancy (Backend)
Build the API endpoints and middleware for secure access.

### Controllers & Routes:
- [x] POST `/api/auth/register` (Handle organization creation + admin user creation).
- [x] POST `/api/auth/login` (Verify credentials, return JWT with `role` and `organizationId`).
- [x] POST `/api/auth/refresh` (Refresh token rotation).
- [x] GET `/api/auth/me` (Get current user profile).

### Middleware:
- [x] `authMiddleware`: Verify JWT and attach user to request.
- [x] `roleMiddleware`: Check if user role matches required permissions.
- [x] `tenantMiddleware`: Ensure queries are automatically scoped to the user's `organizationId`.

### Redis & Caching:
- [x] Implement Redis cache for user session/validation to speed up `authMiddleware`.

---

## 🖥️ Step 4: Implement Feature 1 UI (Frontend)
Build the user interfaces for authentication and the core layout.

- [x] Implement **Login Page** UI (Email, Password, Submit, Error handling).
- [x] Implement **Registration Page** UI (Company Name, User Name, Email, Password).
- [x] Create `AuthContext` (React Context API) to manage global user state, token storage in `localStorage`/`httpOnly` cookies, and axios interceptors for attaching the Bearer token.
- [x] Build **Protected Route** wrapper component (redirects to Login if not authenticated).
- [x] Build **Main Dashboard Layout** (Sidebar navigation showing current Organization & User Profile).

---

## 🧪 Step 5: Testing & Verification
Ensure the full stack runs successfully and meets the PRD requirements.

- [ ] Write Backend API tests using `Jest` & `Supertest` (Register, Login, Protected Route).
- [ ] Start MongoDB and Redis services.
- [ ] Start Backend API (`npm run dev`).
- [ ] Start Frontend Vite Server (`npm run dev`).
- [ ] **Manual End-to-End Test**:
  1. Register a new Super Admin and Organization via the UI.
  2. Log out and Log back in.
  3. Verify JWT is stored and properly sent in subsequent requests.
  4. Verify the Dashboard loads successfully using the fetched User Profile data.
  5. Check Redis CLI to confirm session data is cached.

---

## 🏗️ Implementation Plan: Phase 2 (Reports, Analytics & AI Predictions)

This phase implements the full **Reporting & Analytics Dashboard** along with the **AI-Powered Deal Win Prediction** and **Lead Scoring** engine.

---

### 📅 Objective
Build a multi-tab analytics dashboard with live KPI tracking, funnel analysis, and statistical AI for deal prediction and lead scoring.

---

### 🛠️ Step 1: Backend — Report Aggregation Endpoints
Build dedicated report endpoints using MongoDB aggregation pipelines.

- [x] Implement `GET /api/reports/dashboard` — KPI summary (total leads, deals, revenue, win rate, avg deal size, conversion rate).
- [x] Implement `GET /api/reports/pipeline` — Stage distribution, drop-off analysis, avg time per stage.
- [x] Implement `GET /api/reports/forecast` — Weighted revenue forecast, best/worst case scenarios, monthly breakdown.
- [x] Implement `GET /api/reports/team` — Revenue per salesperson, activity counts, leaderboard.
- [x] Implement `GET /api/reports/conversion` — Conversion funnel (Lead → Contact → Deal → Won).
- [x] Add date-range, team, salesperson, and pipeline filters to all report endpoints.
- [x] Implement Redis caching (TTL: 5 min) on dashboard & pipeline report data.

### 🛠️ Step 2: Backend — AI Deal Win Prediction Engine
Statistical prediction model for deal outcomes.

- [x] Create `utils/dealPrediction.js` — logistic regression-style scoring using:
  - Historical win rate for similar deal size (25%)
  - Sales cycle length vs current deal age (20%)
  - Activity count on deal (15%)
  - Lead score of associated contact (15%)
  - Stage progression speed (10%)
  - Competitor presence (10%)
  - Last activity recency (5%)
- [x] Implement auto-recalculation on every activity/stage change via Bull `scoring-queue`.
- [x] Cache prediction results in Redis for fast retrieval.
- [x] Add prediction data to deal detail endpoint responses.

### 🛠️ Step 3: Frontend — Analytics Dashboard UI
Build the multi-widget analytics page.

- [x] Build **Reports Page** with tab navigation (Overview, Pipeline, Forecast, Team, Conversion).
- [x] Implement KPI cards (Revenue, Win Rate, Avg Deal Size, Conversion Rate, Active Deals).
- [x] Revenue Trend Chart (Recharts line chart, monthly).
- [x] Pipeline Distribution (bar chart by stage).
- [x] Win/Loss Ratio (donut chart).
- [x] Sales Funnel Visualization (funnel/stacked bar).
- [x] Top Performers Leaderboard widget.
- [x] Forecast vs Actual comparison chart.
- [x] Date range picker and filter dropdowns (team, salesperson, pipeline).
- [x] Wire Reports route in App.jsx.

### 🧪 Step 4: Testing & Verification
- [ ] API test: Dashboard KPI endpoint returns correct aggregated data.
- [ ] API test: Pipeline report with stage drop-off percentages.
- [ ] API test: Forecast endpoint returns weighted/best/worst values.
- [ ] API test: Deal prediction returns probability percentage.
- [ ] UI test: All chart widgets render with data.

---

## 🏗️ Implementation Plan: Phase 3 (Email Integration, Notifications & Lead Scoring)

This phase adds **SMTP email integration**, **in-app & email notifications**, and the **rule-based Lead Scoring engine**.

---

### 📅 Objective
Enable sending/receiving emails from within the CRM, implement a real-time notification system, and build an intelligent lead scoring engine.

---

### 🛠️ Step 1: Database Models
- [x] Create Mongoose schema: **Email** (from, to, subject, body, threadId, contactId, dealId, status, openedAt, clickedAt, templateId).
- [x] Create Mongoose schema: **EmailTemplate** (name, subject, body, category, variables[], usageCount).
- [x] Create Mongoose schema: **Notification** (userId, type, title, message, relatedTo, isRead, actionUrl).

### 🛠️ Step 2: Backend — Email System
- [x] Configure Nodemailer transporter (SMTP/Gmail) in `config/email.js`.
- [x] Implement `POST /api/emails/send` — Send email with tracking pixel injection.
- [x] Implement `POST /api/emails/schedule` — Schedule email via Bull `email-queue`.
- [x] Implement `GET /api/emails/threads/:contactId` — Get email conversation thread.
- [x] Implement Email Templates CRUD (`GET/POST /api/emails/templates`).
- [x] Implement follow-up sequences (Day 1 → Day 3 → Day 7) via Bull delayed jobs.
- [x] Open tracking endpoint (`GET /api/emails/track/:emailId/open`) — pixel tracking.
- [x] Click tracking endpoint (`GET /api/emails/track/:emailId/click`) — link redirect tracking.

### 🛠️ Step 3: Backend — Notification System
- [x] Implement `GET /api/notifications` — List user notifications (paginated).
- [x] Implement `PUT /api/notifications/:id/read` — Mark single as read.
- [x] Implement `PUT /api/notifications/read-all` — Mark all as read.
- [x] Implement notification creation utility (called from deal stage changes, task assignments, etc.).
- [x] Implement Socket.io `notification:new` event for real-time push delivery.
- [x] Implement daily digest email (scheduled Bull cron job).

### 🛠️ Step 4: Backend — Lead Scoring Engine
- [x] Create `utils/leadScoring.js` with rule-based scoring:
  - Email opened (+5), Email replied (+15), Meeting scheduled (+20)
  - Job title "Director"+ (+10), Company size >100 (+10)
  - No activity in 14 days (-10), Budget confirmed (+25)
  - Visited pricing page (+8), Downloaded content (+12)
- [x] Auto-recalculate on every activity via Bull `scoring-queue`.
- [x] Score history tracking (array of {score, date} snapshots).
- [x] Hot/Warm/Cold classification (>80 Hot, 40-80 Warm, <40 Cold).
- [x] Score-based automation triggers (score >80 → auto-assign to senior rep).
- [x] Configurable scoring rules (stored in Organization settings).

### 🛠️ Step 5: Frontend — Email Center & Notifications UI
- [x] Build **Email Center Page** (Compose, Templates, Threads tabs).
- [x] Email compose form with template selection and variable substitution.
- [x] Email thread view (conversation style, timestamps, open/click indicators).
- [x] Template manager (create, edit, preview email templates).
- [x] Build **Notification Bell** component in Header (badge count, dropdown).
- [x] Build **Notification Center** page (full list, read/unread, filters by category).
- [x] Deal Won celebration animation (confetti/particles).
- [x] Lead score display on Lead cards (score bar, Hot/Warm/Cold badges).
- [x] Wire Email and Notification routes in App.jsx.

### 🧪 Step 6: Testing & Verification
- [ ] API test: Send email endpoint works (with test SMTP).
- [ ] API test: Email template CRUD.
- [ ] API test: Notification creation and read marking.
- [ ] API test: Lead scoring calculation returns correct score.
- [ ] UI test: Notification bell shows live badge count.
- [ ] UI test: Email thread renders correctly.

---

## 🏗️ Implementation Plan: Phase 4 (Admin Panel, Import/Export & Command Palette)

This phase builds the **Admin Configuration Panel**, **Data Import/Export system**, and the **Global Command Palette (Ctrl+K)**.

---

### 📅 Objective
Provide admin tools for pipeline/team/field configuration, robust data import/export with CSV/Excel support, and a spotlight-style command palette for power-user navigation.

---

### 🛠️ Step 1: Database Models
- [x] Create Mongoose schema: **CustomField** (name, fieldType, entity, options[], isRequired, visibleToRoles[]).
- [x] Create Mongoose schema: **ImportLog** (fileName, entity, totalRecords, successCount, failureCount, errors[], status).

### 🛠️ Step 2: Backend — Admin Configuration API
- [x] Implement `GET/POST /api/admin/custom-fields` — Custom field CRUD.
- [x] Implement `PUT/DELETE /api/admin/custom-fields/:id` — Update/delete custom fields.
- [x] Implement `PUT /api/admin/targets` — Set monthly/quarterly sales targets per user/team.
- [x] Implement `GET /api/admin/audit-logs` — View audit logs (paginated, filtered).
- [x] Implement `POST /api/admin/teams` — Create teams/departments.
- [x] Implement `GET/PUT /api/admin/teams/:id` — Team management.
- [x] Implement User Management endpoints (`GET/PUT/DELETE /api/users`, role changes).
- [x] Pipeline Configuration endpoints (create/edit/delete stages, colors, probabilities).
- [x] All admin endpoints restricted to Super Admin / Sales Manager roles.

### 🛠️ Step 3: Backend — Import/Export System
- [x] Implement `POST /api/import/:entity` — CSV upload with column mapping.
  - Bull `import-queue` for background processing.
  - Duplicate detection during import.
  - Import preview & validation step.
- [x] Implement `GET /api/export/:entity` — Export to CSV/JSON.
  - Export filters (date range, status, owner).
- [x] Implement `GET /api/import/history` — Import logs list.

### 🛠️ Step 4: Backend — Global Search API
- [x] Implement `GET /api/search?q=term` — Full-text search across leads, contacts, companies, deals, tasks.
- [x] Create MongoDB text indexes on searchable fields.
- [x] Fuzzy matching with relevance scoring.
- [x] Results categorized by entity type.
- [x] Quick actions results (navigation commands).

### 🛠️ Step 5: Frontend — Admin Panel UI
- [x] Build **Admin Panel Page** with tabs: Users, Teams, Pipeline Config, Custom Fields, Sales Targets, Audit Logs.
- [x] Users tab: User list, role badges, role change dropdown, invite new user form.
- [x] Teams tab: Create/edit teams, assign team leads.
- [x] Pipeline Config tab: Drag-reorder stages, edit colors/probability, add/remove stages.
- [x] Custom Fields tab: Field builder (name, type, entity, required toggle).
- [x] Sales Targets tab: Set per-user targets with progress bars.
- [x] Audit Logs tab: Searchable log table with user, action, entity, timestamp.

### 🛠️ Step 6: Frontend — Import/Export & Command Palette UI
- [x] Build **Import/Export Page** (Import tab + Export tab + History tab).
- [x] Import tab: File upload area, column mapping UI, preview table, validation results.
- [x] Export tab: Entity selector, filter options, download button.
- [x] History tab: Import log table with status indicators.
- [x] Build **Command Palette** (Ctrl+K / Cmd+K overlay).
  - Global search input with debounced fuzzy search (300ms).
  - Categorized results (Leads, Contacts, Companies, Deals, Tasks).
  - Quick actions ("Create new lead", "Go to reports", "Open pipeline").
  - Keyboard navigation (arrow keys + Enter).
  - Recent searches history (localStorage).
- [x] Wire Admin, Import/Export routes in App.jsx.

### 🧪 Step 7: Testing & Verification
- [ ] API test: Custom field CRUD.
- [ ] API test: CSV import with duplicate detection.
- [ ] API test: Excel export generates valid .xlsx file.
- [ ] API test: Global search returns categorized results.
- [ ] UI test: Admin panel role permissions enforced.
- [ ] UI test: Command palette search and navigation.

---

## 🏗️ Implementation Plan: Phase 5 (Real-Time Collaboration & Workflow Automation)

This phase implements **Socket.io real-time collaboration** with user presence and live updates, plus the **Visual Workflow Automation Engine**.

---

### 📅 Objective
Add live collaboration features (presence, typing indicators, live deal updates) and a drag-and-drop visual workflow builder for automation rules.

---

### 🛠️ Step 1: Database Models
- [x] Create Mongoose schema: **Workflow** (name, description, isActive, trigger, steps[], executionCount, lastRunAt).
- [x] Create Mongoose schema: **WorkflowExecution** (workflowId, triggeredBy, triggerData, steps[] with status, startedAt, completedAt).

### 🛠️ Step 2: Backend — Socket.io Real-Time System
- [x] Configure Socket.io server integrated with Express (`config/socket.js`).
- [x] Implement Socket.io authentication middleware (JWT verification).
- [x] Implement organization-scoped rooms (tenant isolation for events).
- [x] Redis adapter for Socket.io (horizontal scaling ready).
- [x] **User Presence System**: Online/offline tracking, heartbeat every 30s, green dot indicators.
- [x] **Live Deal Updates**: `deal:moved`, `deal:created`, `deal:updated` events broadcast to org room.
- [x] **Typing Indicators**: `user:typing` event on deal/contact edit forms.
- [x] **Active Viewer Tracking**: Track who's viewing a specific deal/contact.
- [x] **Live Notifications**: Instant `notification:new` push to specific users.
- [x] **Live Dashboard**: Real-time KPI updates when deals close.
- [x] Auto-reconnection with exponential backoff.

### 🛠️ Step 3: Backend — Workflow Automation Engine
- [x] Implement Workflow CRUD API (`GET/POST/PUT/DELETE /api/workflows`).
- [x] Implement Workflow Triggers:
  - Lead created, Deal stage changed, Task overdue, Score threshold reached, Email received.
- [x] Implement Workflow Conditions:
  - If deal value > X, If lead source = Y, If score > Z.
- [x] Implement Workflow Actions:
  - Create task, Send email, Update field, Assign owner, Create notification, Add tag.
- [x] Implement Delays: Wait 1 hour, Wait 1 day, Wait until specific time.
- [x] Bull `automation-queue` processes workflow steps asynchronously.
- [x] Workflow execution logging with step-level status tracking.
- [x] Enable/disable workflows toggle.
- [x] Cron-based recurring triggers (daily digest, stale deal alerts).

### 🛠️ Step 4: Frontend — Real-Time Features UI
- [x] Create `useSocket` React hook (connect, subscribe, emit, cleanup).
- [x] User presence indicators (green dots on sidebar/user avatars).
- [x] Online users list component.
- [x] Live Kanban board updates (deal moves reflect instantly for all viewers).
- [x] Typing indicator badges on deal/contact edit forms.
- [x] Active viewer count on deal detail pages ("3 people viewing").
- [x] Real-time notification delivery (instant badge update without polling).
- [x] Live dashboard KPIs (auto-refresh on deal close events).

### 🛠️ Step 5: Frontend — Workflow Builder UI
- [x] Build **Workflow Builder Page** with visual flow designer.
- [x] Trigger selector panel (event type + conditions).
- [x] Action node builder (type + configuration).
- [x] Delay node (time configuration).
- [x] Connected flow visualization (nodes + arrows).
- [x] Workflow list page (name, status toggle, last run, execution count).
- [x] Workflow execution logs viewer.
- [x] Workflow analytics (runs, success rate, avg execution time).
- [x] Wire Workflows route in App.jsx.

### 🧪 Step 6: Testing & Verification
- [ ] API test: Socket.io connection with JWT auth.
- [ ] API test: Workflow CRUD.
- [ ] API test: Workflow trigger fires on deal stage change.
- [ ] API test: Workflow execution logs created correctly.
- [ ] UI test: Live deal move reflects in other sessions.
- [ ] UI test: Online presence indicators work.
- [ ] UI test: Workflow builder creates valid workflow.

---

## 🏗️ Implementation Plan: Phase 6 (Docker, Testing, Polish & Deployment)

This phase covers **Docker containerization**, **comprehensive testing**, **UI/UX polish**, and **deployment readiness**.

---

### 📅 Objective
Finalize the project with production-grade Docker setup, comprehensive test coverage, UI polish with animations, and deployment documentation.

---

### 🛠️ Step 1: Docker Containerization
- [ ] Create `Dockerfile` for backend (multi-stage build).
- [ ] Create `Dockerfile` for frontend (Vite build + nginx serve).
- [ ] Create `docker-compose.yml` with all services:
  - `app` — Node.js API server
  - `worker` — Bull queue worker (separate process)
  - `frontend` — React app (nginx)
  - `mongodb` — MongoDB database
  - `redis` — Redis cache & queues
  - `mongo-express` — DB admin UI (dev only)
  - `bull-board` — Queue monitoring UI (dev only)
- [ ] Environment-based configuration (.env files for dev/prod).
- [ ] Health checks on all services.
- [ ] Volume persistence for MongoDB data.
- [ ] Network isolation between services.
- [ ] One-command startup: `docker-compose up`.

### 🛠️ Step 2: Comprehensive Testing
- [ ] Backend API tests using Jest & Supertest:
  - Auth endpoints (register, login, refresh, me).
  - Leads CRUD + search + pagination.
  - Deals CRUD + stage move + forecast.
  - Pipeline CRUD.
  - Tasks CRUD + completion + stats.
  - Reports endpoints.
  - Admin endpoints (custom fields, teams).
  - Import/Export endpoints.
  - Global search.
- [ ] Frontend component testing (key interactions).
- [ ] End-to-end test scenarios (manual or Cypress).
- [ ] Performance testing (API response times, page load).
- [ ] Target: >60% API test coverage.

### 🛠️ Step 3: UI/UX Polish & Responsive Design
- [ ] Review and enhance all pages for visual consistency.
- [ ] Add micro-animations (hover effects, transitions, loading states).
- [ ] Implement skeleton loaders for async data.
- [ ] Implement empty states and error states with illustrations.
- [ ] Add deal won celebration animation (confetti).
- [ ] Ensure full responsiveness (mobile + tablet + desktop).
- [ ] Collapsible sidebar for mobile.
- [ ] Touch-friendly drag-and-drop on tablets.
- [ ] Performance optimization (code splitting, lazy loading routes).
- [ ] Dark mode / Light mode toggle (polished).

### 🛠️ Step 4: Documentation & Deployment
- [ ] Write `README.md` (setup instructions, architecture overview, env config).
- [ ] API documentation (endpoint reference).
- [ ] Deployment guide (Docker, manual, cloud options).
- [ ] Environment variables reference document.
- [ ] Architecture diagram.
- [ ] Final code review and cleanup.

### 🧪 Step 5: Final Verification
- [ ] Full stack boots with `docker-compose up` → verified.
- [ ] All CRUD operations functional across all entities.
- [ ] Real-time features working (Socket.io presence, live updates).
- [ ] Reports and analytics dashboards render correctly with data.
- [ ] Email system sends and tracks emails.
- [ ] Workflow automation engine triggers and executes correctly.
- [ ] RBAC enforced across all endpoints and UI components.
- [ ] Redis caching verified (cache hit rate on dashboard).
- [ ] Application performs within NFR thresholds (<2s load, <200ms cached API).

---

## 🚀 Execution Handover
Once this plan is approved, we will begin execution exactly as described, going phase-by-phase from Phase 2 to Phase 6. Phase 1 is already complete.
