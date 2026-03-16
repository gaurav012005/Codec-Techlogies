# 📋 Product Requirements Document (PRD)
## Enterprise CRM System — Advanced Level (Complexity: 8/10)

---

## 📌 1. Product Overview

### 1.1 Product Name
**Enterprise CRM System** (CodeCRM)

### 1.2 Version
**v3.0** — Advanced Level (8/10 Complexity)

### 1.3 Product Vision
Build a **production-grade, enterprise-level** Customer Relationship Management system that rivals **Salesforce, HubSpot, and Pipedrive**. The system features **multi-tenant architecture**, **AI-powered insights**, **visual workflow automation**, **real-time collaboration**, **Redis-powered caching & queues**, and **Docker containerization** — managing the entire sales lifecycle with intelligent automation and predictive analytics.

### 1.4 Target Users
| Role | Description |
|------|-------------|
| **Super Admin** | Full system access, configuration, user management |
| **Sales Manager** | Team oversight, pipeline management, reporting |
| **Sales Executive** | Lead/deal management, daily activities |
| **Support Team** | Customer interaction, ticket support |
| **Read-only Analyst** | Dashboard & report viewing only |

### 1.5 Tech Stack
| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, Vite, React Router v6, Recharts, @hello-pangea/dnd |
| **Styling** | Vanilla CSS (custom design system with glassmorphism & dark mode) |
| **Backend** | Node.js + Express.js |
| **Database** | MongoDB + Mongoose ODM |
| **Caching & Queues** | Redis + Bull (job queues for email, automation, scheduled tasks) |
| **Auth** | JWT (Access + Refresh tokens) + Refresh Token Rotation |
| **Real-time** | Socket.io (live collaboration, notifications, presence) |
| **Email** | Nodemailer (SMTP/Gmail) + Bull queue for async sending |
| **File Handling** | Multer (CSV/Excel import), ExcelJS (export) |
| **AI/Insights** | Rule-based scoring engine + statistical forecasting |
| **Containerization** | Docker + Docker Compose (multi-service orchestration) |
| **Logging** | Winston + Morgan (structured logging with log levels) |
| **Validation** | Joi (request validation schemas) |
| **Testing** | Jest + Supertest (API testing) |

---

## 📌 2. Feature Specifications

---

### 2.1 🔹 Advanced Sales Pipeline Management

#### 2.1.1 Drag-and-Drop Kanban Pipeline
- Visual Kanban board with drag-and-drop deal cards
- Each card shows: Deal name, value, company, owner, probability %
- Color-coded stages with progress indicators
- Quick actions: edit, assign, archive from card

#### 2.1.2 Custom Deal Stages Per Company
- Admin can create, rename, reorder pipeline stages
- Multiple pipelines (e.g., "Enterprise Sales", "SMB Sales")
- Default stages: Prospect → Qualified → Proposal → Negotiation → Closed Won / Closed Lost

#### 2.1.3 Deal Value Forecasting
- **Weighted Revenue Calculation**:
  ```
  Forecast Revenue = Deal Value × Probability (%)
  ```
- Pipeline forecast view showing:
  - Total pipeline value
  - Weighted forecast value
  - Best case / Worst case scenarios
  - Monthly/Quarterly forecast breakdown

#### 2.1.4 Win/Loss Reason Tracking
- Mandatory reason selection on deal close (Won/Lost)
- Predefined reasons + custom text
- Win/Loss analytics dashboard
- Competitor tracking on lost deals

---

### 2.2 🔹 Task & Follow-Up Automation

#### 2.2.1 Automatic Task Creation
Triggers:
| Event | Task Created |
|-------|-------------|
| New lead added | "Initial contact" task assigned to owner |
| Deal moved to "Proposal" | "Send proposal" task |
| Deal moved to "Negotiation" | "Schedule follow-up call" task |
| No activity for 3 days | "Follow up" reminder task |

#### 2.2.2 Reminder Notifications
- In-app notification bell with badge count
- Email reminders for overdue tasks
- Daily digest email of pending tasks

#### 2.2.3 Email Follow-Up Scheduling
- Schedule emails to be sent at future dates
- Follow-up sequences (Day 1, Day 3, Day 7)
- Template-based emails

#### 2.2.4 SLA Tracking
- Response time tracking per lead
- SLA breach alerts
- Average response time in reports

---

### 2.3 🔹 Contact & Company Management (Hierarchy)

#### 2.3.1 Companies (Organizations)
- Company profile: Name, industry, size, revenue, website, address
- Company timeline showing all activities
- Associated deals and contacts roll-up
- Company health score

#### 2.3.2 Contacts
- Contact profile: Name, email, phone, role, department
- Multiple contacts per company (with roles: Decision Maker, Influencer, etc.)
- Contact activity timeline
- Communication preferences

#### 2.3.3 Notes & Timeline
- Rich text notes per contact/company
- Chronological activity timeline
- @mentions in notes
- File attachments to notes

---

### 2.4 🔹 Reporting & Analytics

#### 2.4.1 Key Metrics
| Metric | Formula |
|--------|---------|
| **Conversion Rate** | (Closed Won ÷ Total Leads) × 100 |
| **Average Deal Size** | Total Revenue ÷ Number of Won Deals |
| **Sales Cycle Length** | Avg days from Lead Created → Deal Closed |
| **Win Rate** | Won Deals ÷ (Won + Lost Deals) × 100 |
| **Revenue by Salesperson** | Sum of won deal values per user |

#### 2.4.2 Stage Drop-Off Analysis
- Funnel visualization showing deals at each stage
- Drop-off percentage between stages
- Average time spent per stage
- Bottleneck identification

#### 2.4.3 Filters
- Date range picker (Today, This Week, This Month, Custom)
- By team / department
- By salesperson
- By region / territory
- By pipeline

#### 2.4.4 Dashboard Widgets
- Revenue trend chart (line)
- Pipeline distribution (bar)
- Win/Loss ratio (donut)
- Top performers (leaderboard)
- Activity heatmap
- Forecast vs Actual (comparison)

---

### 2.5 🔹 Email Integration

#### 2.5.1 SMTP / Gmail Integration
- Connect SMTP or Gmail via OAuth/App Password
- Send emails directly from CRM
- Receive email replies (via webhook or polling)

#### 2.5.2 Email Tracking
- Track email opens (pixel tracking)
- Track link clicks
- Open/click rates in analytics

#### 2.5.3 Email Thread Storage
- Full email conversation stored under contact
- Thread view with timestamps
- Search within email history
- Email templates library

---

### 2.6 🔹 Role-Based Access Control (Advanced RBAC)

#### 2.6.1 Roles & Permissions Matrix

| Permission | Super Admin | Sales Manager | Sales Executive | Support | Analyst |
|-----------|:-----------:|:-------------:|:---------------:|:-------:|:-------:|
| Manage Users | ✅ | ❌ | ❌ | ❌ | ❌ |
| View All Deals | ✅ | ✅ | Own Only | ❌ | ✅ (Read) |
| Edit Deals | ✅ | ✅ | Own Only | ❌ | ❌ |
| Delete Records | ✅ | ❌ | ❌ | ❌ | ❌ |
| View Reports | ✅ | ✅ | Limited | ❌ | ✅ |
| Admin Config | ✅ | ❌ | ❌ | ❌ | ❌ |
| Manage Pipeline | ✅ | ✅ | ❌ | ❌ | ❌ |
| Import/Export | ✅ | ✅ | ❌ | ❌ | ❌ |

#### 2.6.2 Implementation
- Permission-based API middleware
- Field-level restrictions (e.g., hide deal values from support)
- Department-based data isolation
- Audit log for sensitive operations

---

### 2.7 🔹 Activity Timeline System

#### 2.7.1 Activity Types
- 📞 Calls (duration, outcome, notes)
- 📧 Emails (sent/received)
- 📅 Meetings (scheduled, completed, cancelled)
- 🔄 Status Changes (stage transitions)
- 📝 Notes (manual entries)
- 📎 File Uploads
- ✅ Tasks (created, completed)

#### 2.7.2 Display
- Chronological feed with filters
- Icon-based activity type indicators
- Expandable detail cards
- "Load more" pagination
- Activity count summary

---

### 2.8 🔹 Data Import & Export

#### 2.8.1 Import
- CSV file upload with column mapping
- Bulk lead/contact upload (up to 10,000 records)
- Duplicate detection during import
- Import preview & validation
- Import history log

#### 2.8.2 Export
- Export to CSV / Excel (.xlsx)
- Export filters (date range, status, owner)
- Scheduled exports (daily/weekly)
- API webhook support for external integrations

---

### 2.9 🔹 Notifications System

#### 2.9.1 In-App Notifications
- Real-time notification bell
- Notification center with read/unread
- Categories: Tasks, Deals, System, Mentions

#### 2.9.2 Email Notifications
- Configurable email alerts
- Daily summary digest
- Stage change alerts
- Task due reminders

#### 2.9.3 Special Events
- 🎉 Deal won celebration animation
- 🏆 Monthly top performer badge
- ⚠️ SLA breach warning

---

### 2.10 🔹 Admin Configuration Panel

#### 2.10.1 Pipeline Configuration
- Create/edit/delete pipeline stages
- Set default probability per stage
- Stage color and icon customization

#### 2.10.2 Custom Fields
- Add custom fields to leads, contacts, companies, deals
- Field types: Text, Number, Date, Dropdown, Checkbox, URL
- Required/Optional toggle
- Show/hide per role

#### 2.10.3 Sales Targets
- Set monthly/quarterly revenue targets per user/team
- Target vs actual tracking
- Progress indicators on dashboard

#### 2.10.4 Team Management
- Create teams/departments
- Assign team leads
- Team-level reporting

#### 2.10.5 Email Templates
- Create reusable email templates
- Variable substitution ({{contact.name}}, {{deal.value}})
- Template categories
- Usage analytics

---

## 📌 3. Advanced Features (8/10 Complexity Upgrades)

---

### 3.1 🌟 Lead Scoring System (AI-Powered)

Automatically score leads using a rule-based AI engine.

#### Scoring Criteria
| Criterion | Points |
|-----------|--------|
| Email opened | +5 |
| Email replied | +15 |
| Meeting scheduled | +20 |
| Job title is "Director" or above | +10 |
| Company size > 100 employees | +10 |
| No activity in 14 days | -10 |
| Budget confirmed | +25 |
| Visited pricing page (tracked) | +8 |
| Downloaded content | +12 |

#### Features
- Automatic recalculation via Redis Bull queue on every activity
- Score history graph (trend over time)
- Score-based automation triggers (score > 80 → auto-assign to senior rep)
- Hot / Warm / Cold visual indicators with animated badges
- Predictive lead quality rating
- Configurable scoring rules (admin panel)

---

### 3.2 🌟 Smart Search & Global Command Palette

Spotlight/Command-K style search across all entities.

#### Features
- **Ctrl+K / Cmd+K** keyboard shortcut
- Search across: Leads, Contacts, Companies, Deals, Tasks, Notes, Emails
- Real-time fuzzy search with debouncing (300ms)
- Recent searches history (stored in localStorage)
- Quick actions: "Create new lead", "Go to reports", "Open pipeline"
- Keyboard navigation (arrow keys + Enter)
- Categorized results with entity icons
- Search indexing on backend with MongoDB text indexes

---

### 3.3 🔥 Visual Workflow Automation Engine (Advanced)

A **visual, drag-and-drop workflow builder** that lets admins create complex automation rules without code.

#### Workflow Components
| Component | Description |
|-----------|-------------|
| **Triggers** | Lead created, Deal stage changed, Task overdue, Score threshold, Email received |
| **Conditions** | If deal value > X, If lead source = Y, If score > Z |
| **Actions** | Create task, Send email, Update field, Assign owner, Create notification, Add tag |
| **Delays** | Wait 1 hour, Wait 1 day, Wait until specific time |

#### Example Workflows
1. **New Lead Nurture**: Lead Created → Wait 1 day → Send welcome email → Wait 3 days → Create follow-up task
2. **Hot Lead Alert**: Score > 80 → Notify sales manager → Auto-assign to senior rep
3. **Deal Stale Alert**: Deal in same stage > 14 days → Create urgent task → Alert manager
4. **Win Celebration**: Deal Won → Send congrats email → Notify team → Update leaderboard

#### Implementation
- Workflow definitions stored in MongoDB
- **Bull queue** (Redis) processes workflow steps asynchronously
- Delayed/scheduled jobs for time-based triggers
- Workflow execution logs with status tracking
- Visual flow builder UI with connected nodes
- Enable/disable workflows toggle
- Workflow analytics (runs, success rate, avg time)

---

### 3.4 🔥 AI-Powered Deal Win Prediction (Advanced)

Statistical model that predicts probability of winning a deal.

#### Prediction Factors
| Factor | Weight |
|--------|--------|
| Historical win rate for similar deal size | 25% |
| Average sales cycle vs current deal age | 20% |
| Number of activities on deal | 15% |
| Lead score of associated contact | 15% |
| Stage progression speed | 10% |
| Competitor presence | 10% |
| Last activity recency | 5% |

#### Features
- **Win probability %** displayed on every deal card
- Probability auto-updates on every activity/stage change
- Color-coded confidence indicator (Green > 70%, Yellow 40-70%, Red < 40%)
- "Deals at Risk" dashboard widget showing declining probabilities
- Historical accuracy tracking
- Recommendations engine: "Add more activities to improve win chance"
- Revenue forecast uses AI probability instead of static stage probability

#### Implementation
- Statistical model built with historical deal data
- Logistic regression-style scoring (implemented in plain JS, no ML library needed)
- Recalculated asynchronously via Bull queue
- Cached in Redis for fast retrieval

---

### 3.5 🔥 Multi-Tenant Architecture (Advanced)

Support multiple organizations (tenants) within a single deployment.

#### Features
- **Organization-level data isolation** — each company sees only their data
- Organization signup & onboarding flow
- Tenant-specific settings (branding, pipeline config, custom fields)
- Tenant admin vs platform super-admin separation
- Organization invite system (invite team members via email)
- Subscription tier tracking (Free / Pro / Enterprise)
- Usage limits per tier (leads, deals, users, storage)

#### Implementation
- `organizationId` field on ALL data collections
- Mongoose middleware auto-filters queries by `organizationId`
- JWT token includes `organizationId` claim
- API middleware enforces tenant isolation
- Organization-scoped indexes for performance

---

### 3.6 🔥 Real-Time Collaboration & Presence (Advanced)

Live collaboration features powered by Socket.io.

#### Features
- **User presence** — see who's online (green dot indicators)
- **Live deal updates** — when someone moves a deal, all users see it instantly
- **Live typing indicators** — "John is editing this deal..."
- **Collaborative notes** — real-time note updates on contacts/deals
- **Live notification delivery** — instant push without polling
- **Active viewer tracking** — "3 people viewing this deal"
- **Live dashboard** — KPI cards update in real-time as deals close

#### Implementation
- Socket.io rooms per organization (tenant isolation)
- Redis adapter for Socket.io (horizontal scaling ready)
- Event types: `deal:moved`, `lead:created`, `user:typing`, `notification:new`
- Presence heartbeat every 30 seconds
- Automatic reconnection with exponential backoff

---

### 3.7 🔥 Redis Caching & Background Job System (Advanced)

Production-grade caching and async job processing.

#### Redis Caching
- Dashboard KPI data cached (TTL: 5 min)
- Pipeline data cached (invalidated on deal move)
- User session data in Redis (fast token validation)
- API response caching for expensive queries (reports, forecasts)
- Cache-aside pattern with automatic invalidation

#### Bull Job Queues
| Queue | Purpose |
|-------|----------|
| `email-queue` | Async email sending, scheduled emails, follow-up sequences |
| `automation-queue` | Workflow execution, trigger processing |
| `scoring-queue` | Lead score recalculation |
| `notification-queue` | Batch notification delivery |
| `import-queue` | Large CSV imports processed in background |
| `report-queue` | Heavy report generation (export as async job) |

#### Features
- Job retry with exponential backoff (3 retries)
- Failed job dead-letter queue
- Bull Board dashboard (`/admin/queues`) for monitoring
- Job priority levels
- Rate limiting on queues (prevent email spam)
- Cron-based recurring jobs (daily digest, stale deal alerts)

---

### 3.8 🔥 Docker Containerization (Advanced)

Full Docker setup for production deployment.

#### Services (docker-compose.yml)
```yaml
services:
  app:          # Node.js API server
  worker:       # Bull queue worker (separate process)
  frontend:     # React app (nginx)
  mongodb:      # MongoDB database
  redis:        # Redis cache & queues
  mongo-express: # DB admin UI (dev only)
  bull-board:   # Queue monitoring UI (dev only)
```

#### Features
- Multi-stage Dockerfile (build + production)
- Environment-based configuration (.env files)
- Health checks on all services
- Volume persistence for MongoDB data
- Network isolation between services
- Hot-reload in development mode
- Production-optimized builds
- One-command startup: `docker-compose up`

## 📌 4. Database Schema Design

### 4.1 Collections (MongoDB)

```
├── users
│   ├── _id, name, email, password, role, department, avatar, targets
│   └── createdAt, updatedAt
│
├── companies
│   ├── _id, name, industry, size, revenue, website, address, phone
│   ├── healthScore, ownerId
│   └── customFields, createdAt, updatedAt
│
├── contacts
│   ├── _id, name, email, phone, role, department
│   ├── companyId, ownerId, leadScore
│   └── tags, customFields, createdAt, updatedAt
│
├── leads
│   ├── _id, name, email, phone, company, source, status
│   ├── ownerId, leadScore, assignedTo
│   └── customFields, createdAt, updatedAt
│
├── deals
│   ├── _id, title, value, probability, stage, pipelineId
│   ├── contactId, companyId, ownerId
│   ├── expectedCloseDate, actualCloseDate
│   ├── winLossReason, competitorInfo
│   └── customFields, createdAt, updatedAt
│
├── pipelines
│   ├── _id, name, stages[], isDefault
│   └── createdAt, updatedAt
│
├── activities
│   ├── _id, type (call|email|meeting|note|status_change|task)
│   ├── title, description, outcome
│   ├── relatedTo (leadId|contactId|dealId|companyId)
│   ├── userId, duration
│   └── createdAt
│
├── tasks
│   ├── _id, title, description, type, priority
│   ├── dueDate, completedAt, status
│   ├── assignedTo, relatedTo
│   ├── isAutomated, triggerEvent
│   └── createdAt, updatedAt
│
├── emails
│   ├── _id, from, to, subject, body, threadId
│   ├── contactId, dealId, status (sent|received|scheduled)
│   ├── openedAt, clickedAt, templateId
│   └── createdAt
│
├── notifications
│   ├── _id, userId, type, title, message
│   ├── relatedTo, isRead, actionUrl
│   └── createdAt
│
│
├── workflows
│   ├── _id, name, description, isActive, organizationId
│   ├── trigger (type, conditions)
│   ├── steps[] (type, config, delay, order)
│   ├── executionCount, lastRunAt
│   └── createdBy, createdAt, updatedAt
│
├── workflowExecutions
│   ├── _id, workflowId, triggeredBy, triggerData
│   ├── steps[] (stepId, status, executedAt, result, error)
│   ├── status (running|completed|failed)
│   └── startedAt, completedAt
│
├── organizations
│   ├── _id, name, slug, logo, industry
│   ├── owner (userId), plan (free|pro|enterprise)
│   ├── settings (branding, defaults, limits)
│   ├── usageLimits (maxUsers, maxLeads, maxDeals)
│   └── createdAt, updatedAt
│
├── emailTemplates
│   ├── _id, name, subject, body, category, organizationId
│   ├── variables[], createdBy
│   └── usageCount, createdAt, updatedAt
│
├── customFields
│   ├── _id, name, fieldType, entity, organizationId
│   ├── options[], isRequired, visibleToRoles[]
│   └── createdAt
│
├── importLogs
│   ├── _id, fileName, entity, totalRecords, organizationId
│   ├── successCount, failureCount, errors[]
│   ├── importedBy, status (queued|processing|completed|failed)
│   └── createdAt
│
└── auditLogs
    ├── _id, userId, organizationId, action, entity, entityId
    ├── changes (before/after), ipAddress, userAgent
    └── createdAt
```

### 4.2 Indexes
- `users`: email (unique), role, organizationId
- `leads`: organizationId + ownerId, status, leadScore, createdAt
- `deals`: organizationId + pipelineId + stage, ownerId, companyId, expectedCloseDate
- `contacts`: organizationId + companyId, ownerId, email
- `companies`: organizationId + name, ownerId
- `activities`: relatedTo + relatedModel, userId, createdAt
- `tasks`: assignedTo + status, dueDate, organizationId
- `notifications`: userId + isRead, createdAt
- `workflows`: organizationId, isActive
- `organizations`: slug (unique)
- `auditLogs`: organizationId + createdAt
- **Text indexes**: leads (name, email, company), contacts (name, email), deals (title), companies (name)

---

## 📌 5. API Endpoints

### 5.1 Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login & get JWT tokens |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | Invalidate refresh token |
| GET | `/api/auth/me` | Get current user profile |

### 5.2 Users (Admin)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List all users |
| GET | `/api/users/:id` | Get user details |
| PUT | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Delete user |
| PUT | `/api/users/:id/role` | Change user role |

### 5.3 Leads
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/leads` | List leads (with filters) |
| POST | `/api/leads` | Create lead |
| GET | `/api/leads/:id` | Get lead details |
| PUT | `/api/leads/:id` | Update lead |
| DELETE | `/api/leads/:id` | Delete lead |
| POST | `/api/leads/import` | Bulk import from CSV |
| GET | `/api/leads/export` | Export leads |

### 5.4 Contacts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/contacts` | List contacts |
| POST | `/api/contacts` | Create contact |
| GET | `/api/contacts/:id` | Get contact with activities |
| PUT | `/api/contacts/:id` | Update contact |
| DELETE | `/api/contacts/:id` | Delete contact |

### 5.5 Companies
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/companies` | List companies |
| POST | `/api/companies` | Create company |
| GET | `/api/companies/:id` | Get company with contacts & deals |
| PUT | `/api/companies/:id` | Update company |
| DELETE | `/api/companies/:id` | Delete company |

### 5.6 Deals
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/deals` | List deals (with pipeline/stage filters) |
| POST | `/api/deals` | Create deal |
| GET | `/api/deals/:id` | Get deal details |
| PUT | `/api/deals/:id` | Update deal |
| PUT | `/api/deals/:id/stage` | Move deal stage (triggers automation) |
| DELETE | `/api/deals/:id` | Delete deal |
| GET | `/api/deals/forecast` | Get forecast data |

### 5.7 Pipelines (Admin)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/pipelines` | List pipelines |
| POST | `/api/pipelines` | Create pipeline |
| PUT | `/api/pipelines/:id` | Update pipeline stages |
| DELETE | `/api/pipelines/:id` | Delete pipeline |

### 5.8 Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | List tasks (with filters) |
| POST | `/api/tasks` | Create task |
| PUT | `/api/tasks/:id` | Update task |
| PUT | `/api/tasks/:id/complete` | Mark task complete |
| DELETE | `/api/tasks/:id` | Delete task |

### 5.9 Activities
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/activities` | List activities |
| POST | `/api/activities` | Log activity |
| GET | `/api/activities/:entityType/:entityId` | Get entity timeline |

### 5.10 Emails
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/emails/send` | Send email |
| POST | `/api/emails/schedule` | Schedule email |
| GET | `/api/emails/threads/:contactId` | Get email threads |
| GET | `/api/emails/templates` | List templates |
| POST | `/api/emails/templates` | Create template |

### 5.11 Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | Get user notifications |
| PUT | `/api/notifications/:id/read` | Mark as read |
| PUT | `/api/notifications/read-all` | Mark all as read |

### 5.12 Reports
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reports/dashboard` | Dashboard summary |
| GET | `/api/reports/pipeline` | Pipeline analytics |
| GET | `/api/reports/forecast` | Revenue forecast |
| GET | `/api/reports/team` | Team performance |
| GET | `/api/reports/conversion` | Conversion funnel |

### 5.13 Admin Config
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/custom-fields` | List custom fields |
| POST | `/api/admin/custom-fields` | Create custom field |
| PUT | `/api/admin/targets` | Set sales targets |
| GET | `/api/admin/audit-logs` | View audit logs |
| POST | `/api/admin/teams` | Create team |

### 5.14 Search
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/search?q=term` | Global search |

### 5.15 Import/Export
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/import/:entity` | Import CSV |
| GET | `/api/export/:entity` | Export to Excel |
| GET | `/api/import/history` | Import logs |

---

## 📌 6. Non-Functional Requirements

### 6.1 Performance
- Page load < 2 seconds
- API response < 200ms (cached), < 500ms (uncached)
- Support 500+ concurrent users per tenant
- Redis caching on hot paths (dashboard, pipeline, search)
- MongoDB compound indexes on all filtered queries
- Lazy loading on frontend (code splitting per route)
- Debounced search (300ms), throttled real-time updates

### 6.2 Security
- JWT with refresh token rotation (single-use refresh tokens)
- Password hashing (bcrypt, 12 rounds)
- Rate limiting: 100 req/min general, 5 req/min auth
- Input validation with Joi schemas on ALL endpoints
- CORS whitelist configuration
- XSS protection (helmet.js)
- CSRF tokens for state-changing operations
- SQL/NoSQL injection prevention (Mongoose parameterized queries)
- Audit logging for all sensitive operations
- API key support for webhook integrations

### 6.3 Scalability
- Multi-tenant data isolation via organizationId
- Stateless API (no server-side sessions)
- Redis for session/cache (horizontally scalable)
- Bull workers as separate processes (scale independently)
- Database connection pooling (pool size: 10)
- Cursor-based pagination on large collections
- Docker Compose for multi-service orchestration

### 6.4 Reliability
- Centralized error handling middleware
- Structured logging with Winston (JSON format, log levels)
- Health check endpoint (`/api/health`)
- Graceful shutdown handling (drain connections)
- Bull job retries with exponential backoff
- Dead-letter queue for failed jobs
- MongoDB replica set ready configuration

---

## 📌 7. UI/UX Requirements

### 7.1 Design System
- **Theme**: Dark mode default with light mode toggle
- **Colors**: Professional palette with accent colors for stages
- **Typography**: Inter / Outfit from Google Fonts
- **Layout**: Sidebar navigation + main content area
- **Effects**: Glassmorphism cards, smooth transitions, micro-animations

### 7.2 Pages
1. **Login / Register** — Clean auth pages
2. **Dashboard** — KPI cards, charts, activity feed
3. **Pipeline (Kanban)** — Drag-and-drop deal board
4. **Leads List** — Sortable, filterable table with bulk actions
5. **Lead Detail** — Profile + activity timeline
6. **Contacts List** — Similar to leads with company linkage
7. **Contact Detail** — Profile + email threads + timeline
8. **Companies List** — Organization directory
9. **Company Detail** — Company profile + associated contacts/deals
10. **Deals List** — Table view alternative to Kanban
11. **Deal Detail** — Full deal info with forecast
12. **Tasks** — Task board with filters and calendar view
13. **Reports** — Multi-tab analytics dashboard
14. **Email Center** — Compose, templates, threads
15. **Notifications** — Full notification center
16. **Admin Panel** — Configuration, users, teams, fields
17. **Import/Export** — Data management page
18. **Profile/Settings** — User settings page

### 7.3 Responsive Design
- Desktop-first, fully responsive
- Mobile-friendly sidebar (collapsible)
- Touch-friendly drag-and-drop on tablets

---

## 📌 8. Project Milestones

| Phase | Features | Timeline |
|-------|----------|----------|
| **Phase 1** | Docker setup, Auth, RBAC, Multi-tenancy, Redis | Week 1 |
| **Phase 2** | Leads, Contacts, Companies CRUD + Search | Week 2 |
| **Phase 3** | Deals, Pipelines, Kanban + Real-time collab | Week 3-4 |
| **Phase 4** | Tasks, Activities, Timeline + Workflow Engine | Week 5-6 |
| **Phase 5** | Reports, Analytics, AI Predictions, Dashboard | Week 7-8 |
| **Phase 6** | Email Integration, Notifications, Lead Scoring | Week 9 |
| **Phase 7** | Admin Panel, Import/Export, Command Palette | Week 10 |
| **Phase 8** | Testing, Polish, Documentation, Deployment | Week 11-12 |

---

## 📌 9. Complexity Justification (8/10)

| Aspect | Implementation | Complexity |
|--------|---------------|:----------:|
| **Architecture** | Multi-tenant, multi-service (Docker Compose) | ⭐⭐⭐⭐ |
| **Caching** | Redis with cache invalidation strategies | ⭐⭐⭐ |
| **Background Jobs** | Bull queues with 6 specialized workers | ⭐⭐⭐⭐ |
| **AI/Scoring** | Statistical deal prediction + lead scoring engine | ⭐⭐⭐ |
| **Automation** | Visual workflow engine with triggers/conditions/actions | ⭐⭐⭐⭐⭐ |
| **Real-time** | Socket.io with presence, live updates, typing indicators | ⭐⭐⭐⭐ |
| **Multi-tenancy** | Organization-level data isolation across all collections | ⭐⭐⭐⭐ |
| **RBAC** | 5 roles, permission matrix, field-level restrictions | ⭐⭐⭐ |
| **Email** | SMTP integration, tracking, templates, sequences | ⭐⭐⭐ |
| **DevOps** | Docker Compose, health checks, structured logging | ⭐⭐⭐ |

**What keeps it at 8/10 (not 10/10):**
- No Kubernetes / cloud-native orchestration
- No true ML model training (uses statistical rules)
- No microservices (monolith + workers)
- No Elasticsearch (uses MongoDB text indexes)
- No OAuth2/SSO/SAML (uses JWT)
- Single region deployment

---

## 📌 9. Competitive Analysis

| Feature | Our CRM | Salesforce | HubSpot | Pipedrive |
|---------|:-------:|:----------:|:-------:|:---------:|
| Kanban Pipeline | ✅ | ✅ | ✅ | ✅ |
| Weighted Forecast | ✅ | ✅ | ✅ | ✅ |
| AI Deal Prediction | ✅ | ✅ (Einstein) | ❌ | ❌ |
| Lead Scoring | ✅ | ✅ (paid) | ✅ (paid) | ❌ |
| Workflow Automation | ✅ | ✅ (Flow) | ✅ (paid) | ❌ |
| Multi-Tenancy | ✅ | ✅ | ✅ | ✅ |
| Real-time Collab | ✅ | ✅ | Limited | ❌ |
| Email Integration | ✅ | ✅ | ✅ | ✅ |
| Custom Fields | ✅ | ✅ | ✅ | ✅ |
| Activity Timeline | ✅ | ✅ | ✅ | ✅ |
| Advanced RBAC | ✅ | ✅ | Limited | Limited |
| Command Palette | ✅ | ❌ | ❌ | ❌ |
| Redis Caching | ✅ | ✅ | ✅ | ✅ |
| Docker Deployment | ✅ | N/A | N/A | N/A |
| Background Jobs | ✅ | ✅ | ✅ | ✅ |
| Open Source | ✅ | ❌ | ❌ | ❌ |
| Self-Hosted | ✅ | ❌ | ❌ | ❌ |

---

## 📌 10. Success Metrics

| Metric | Target |
|--------|--------|
| Feature completeness | 100% of listed features implemented |
| API endpoint coverage | All CRUD + advanced operations functional |
| Auth & RBAC | 5 roles with permission matrix + multi-tenancy |
| Real-time | Socket.io presence + live updates functional |
| Caching | Redis cache hit rate > 80% on dashboard |
| Background Jobs | All 6 Bull queues processing correctly |
| Automation | Workflow engine executing triggers reliably |
| AI Predictions | Deal win prediction within 15% accuracy |
| Docker | Full stack boots with single `docker-compose up` |
| UI responsiveness | All pages responsive (mobile + desktop) |
| Performance | < 2s page load, < 200ms cached API, < 500ms uncached |
| Test Coverage | > 60% API test coverage with Jest |

---

## 📌 12. Cost Analysis

| Component | Cost |
|-----------|:----:|
| React, Vite, Express, Mongoose | ✅ Free (MIT) |
| MongoDB Community | ✅ Free |
| Redis (local / Docker) | ✅ Free |
| Bull (job queues) | ✅ Free (MIT) |
| Socket.io | ✅ Free (MIT) |
| Docker & Docker Compose | ✅ Free |
| Nodemailer + Gmail SMTP | ✅ Free (500 emails/day) |
| All npm packages | ✅ Free |
| **Total** | **₹0 / $0** |

---

*Document Version: 3.0*
*Complexity Level: 8/10*
*Last Updated: February 24, 2026*
*Author: Enterprise CRM Development Team*
