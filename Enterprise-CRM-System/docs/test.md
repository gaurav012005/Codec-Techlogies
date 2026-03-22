# 🧪 Complete Testing Guide — Enterprise CRM System

This guide covers **manual testing** for all features across **Phases 1 through 8** of the Enterprise CRM System.

---

## 📋 Pre-requisites

Ensure both servers are running:

| Service | URL | Command |
|---------|-----|---------|
| **Backend API** | `http://localhost:5000` | `cd backend && npm run dev` |
| **Frontend UI** | `http://localhost:5173` | `cd frontend && npm run dev` |
| **MongoDB** | `localhost:27017` | Running locally or via Docker |
| **Redis** | `localhost:6379` | Optional — caching skipped gracefully if absent |

---

## ✅ Phase 1: Foundation & Authentication

### Test 1.1: Registration (Create Organization & Super Admin)
1. Navigate to `http://localhost:5173/register`.
2. Fill in: Organization Name (e.g., "Acme Corp"), Full Name, Email (`admin@acme.com`), Password (6+ chars).
3. Click **Create Account**.
4. **Expected**: Redirected to `/dashboard`. Organization + super admin created.

### Test 1.2: Login & Token Persistence
1. Navigate to `http://localhost:5173/login`.
2. Enter credentials used in registration.
3. Click **Sign In**.
4. **Expected**: Redirect to dashboard. Page refresh maintains login (JWT persists).

### Test 1.3: Protected Routes
1. Clear localStorage or logout.
2. Try navigating to `/leads` or `/dashboard`.
3. **Expected**: Redirected to `/login`.

### Test 1.4: Health Check
1. Visit `http://localhost:5000/api/health`.
2. **Expected**: JSON response with `success: true`.

---

## ✅ Phase 2: Leads, Contacts & Companies

### Test 2.1: Leads CRUD
1. Go to **Leads** page via sidebar.
2. Click **Add Lead** → Fill Name, Email, Company, Source, Status → Save.
3. **Expected**: Lead appears in table with correct status badge.
4. **Additional Tests**:
   - Search by name/email/company → results filter in real-time.
   - Status dropdown filter → only matching leads shown.
   - Edit a lead → changes persist.
   - Delete a lead → confirm dialog → lead removed.
   - **Lead Score Badge**: Verify Hot/Warm/Cold badge appears with Flame/Sun/Snowflake icon.

### Test 2.2: Contacts CRUD
1. Go to **Contacts** page → Click **New Contact**.
2. Enter Name, Email, Role, Contact Type → Save.
3. **Expected**: Contact card with avatar initials appears.
4. Search and edit contacts.

### Test 2.3: Companies CRUD
1. Go to **Companies** page → Click **New Company**.
2. Enter Name, Industry, Size, Website → Save.
3. **Expected**: Company card with health score ring appears.

---

## ✅ Phase 3: Pipeline & Deals

### Test 3.1: Kanban Board & Deal Creation
1. Go to **Sales Pipeline** (`/pipeline`).
2. Click **New Deal** → Enter Title, Value ($50,000), Stage, Expected Close Date.
3. **Expected**: Deal card appears in correct stage column. KPI cards update (Pipeline Value, Weighted Forecast, Open Deals).

### Test 3.2: Drag-and-Drop Stage Transitions
1. Drag a deal card from one column to another.
2. **Expected**: Card stays in new column. Probability badge updates. Column totals update. KPIs re-calculate.

### Test 3.3: Deal Won Confetti 🎉
1. Drag a deal to the **Closed Won** column.
2. **Expected**: Confetti particle animation explodes across the screen! Deal status changes, forecast updates.

### Test 3.4: Deal Lost
1. Drag a deal to the **Closed Lost** column.
2. **Expected**: Deal marked as lost. Removed from active forecasts.

---

## ✅ Phase 4: Tasks & Activities

### Test 4.1: Task Creation
1. Go to **Tasks** page → Click **Add Task**.
2. Enter Title, Type (Call/Email/Meeting/Follow-up), Priority, Due Date.
3. **Expected**: Task appears with correct icon and color-coded priority badge.

### Test 4.2: Inline Completion
1. Click the circle checkbox next to a pending task.
2. **Expected**: Green checkmark, strike-through title, updated KPI stats.

### Test 4.3: Overdue Indicators
1. Create a task with yesterday's date.
2. **Expected**: Red border, red date text, alert icon. Overdue filter shows it.

### Test 4.4: Task Filters
1. Use Status filter (Pending/Completed) and Date filter (Today/This Week/Overdue).
2. **Expected**: List accurately reflects selected filters.

---

## ✅ Phase 5: Reports, Analytics & AI Prediction

### Test 5.1: Reports Dashboard
1. Go to **Reports** (`/reports`).
2. **Expected**: Five tabs visible — Overview, Pipeline, Forecast, Team, Conversion.

### Test 5.2: Overview Tab
1. Click **Overview** tab.
2. **Expected**: KPI stat cards (Revenue, Win Rate, Avg Deal Size, Conversion Rate, Active Deals). Revenue Trend chart and Win/Loss donut chart render.

### Test 5.3: Pipeline Tab
1. Click **Pipeline** tab.
2. **Expected**: Stage distribution bar chart and drop-off funnel visualization.

### Test 5.4: Forecast Tab
1. Click **Forecast** tab.
2. **Expected**: Forecast vs Actual chart. Best/Worst/Weighted value cards.

### Test 5.5: Team Tab
1. Click **Team** tab.
2. **Expected**: Top Performers leaderboard and revenue per salesperson chart.

### Test 5.6: Date Range & Filters
1. Change date range picker (This Month, This Quarter, Custom).
2. Apply team/salesperson/pipeline filters.
3. **Expected**: All charts and KPIs dynamically update.

---

## ✅ Phase 6: Email, Notifications & Lead Scoring

### Test 6.1: Email Center
1. Go to **Email** (`/email`).
2. **Compose Tab**: Enter To, Subject, Body → Click Send.
3. **Templates Tab**: Create a new template (name, subject, body) → Verify it appears in list.
4. **Threads Tab**: Verify email threads display grouped by contact.

### Test 6.2: Notification Bell
1. Click the **Bell icon** in the top bar.
2. **Expected**: Dropdown shows recent notifications with badge count.
3. Click "Mark all read" → badge count resets.

### Test 6.3: Notification Center
1. Go to **Notifications** (`/notifications`).
2. **Expected**: Full list with read/unread toggle and category filter.
3. Click individual notifications to mark as read.

### Test 6.4: Lead Scoring
1. On the **Leads** page, observe the **Score column**.
2. **Expected**: Each lead shows a score badge:
   - **Hot (≥80)**: Red Flame icon, red bar
   - **Warm (40-79)**: Amber Sun icon, amber bar
   - **Cold (<40)**: Cyan Snowflake icon, cyan bar
3. Score bar animates on page load.

---

## ✅ Phase 7: Admin Panel, Import/Export & Command Palette

### Test 7.1: Admin Panel
1. Go to **Admin Panel** (`/admin`).
2. **Users Tab**: View user list, change roles via dropdown, toggle active/inactive.
3. **Teams Tab**: Click "Create Team" → fill name, department, color, select team lead and members → Save. Team card appears.
4. **Pipeline Config Tab**: View pipeline stages with colors and probabilities.
5. **Custom Fields Tab**: Click "Add Field" → enter name, type, entity → Save. Field appears in table. Edit and delete work.
6. **Sales Targets Tab**: View target configuration.
7. **Audit Logs Tab**: View audit log entries with action, entity, user, timestamp.

### Test 7.2: Import/Export
1. Go to **Import/Export** (`/import-export`).
2. **Import Tab**: Upload a CSV file → verify column mapping UI appears.
3. **Export Tab**: Select entity, format → Click Export → file downloads.
4. **History Tab**: View previous import logs with status badges.

### Test 7.3: Command Palette (Ctrl+K)
1. Press **Ctrl+K** (or Cmd+K on Mac).
2. **Expected**: Animated modal appears with search input.
3. Type a search term (e.g., "leads") → Categorized results appear.
4. Use **arrow keys** to navigate, **Enter** to select.
5. Press **Escape** to close.
6. Recent searches persist across sessions.

---

## ✅ Phase 8: Real-Time & Workflow Automation

### Test 8.1: Workflow List Page
1. Go to **Workflows** (`/workflows`).
2. **Expected**: Analytics KPIs (Total Workflows, Active, Runs, Success Rate). Workflow list with toggle, test, edit, delete actions.

### Test 8.2: Workflow Builder
1. Click **New Workflow** → Redirected to builder page.
2. Enter workflow name and description.
3. Select a **Trigger** (e.g., "Lead Created").
4. Click **+ Action** → select "Create Task" → configure it.
5. Click **+ Delay** → set 1 day.
6. Click **+ Action** → select "Send Email".
7. **Expected**: Visual flow with connected arrow nodes.
8. Click **Save Workflow**.
9. **Expected**: Redirected to workflows list. New workflow appears.

### Test 8.3: Workflow Toggle
1. On the workflows list, toggle a workflow's active switch.
2. **Expected**: Status changes between Active/Inactive.

### Test 8.4: Seed Workflows
1. Check if example workflows exist (New Lead Nurture, Hot Lead Alert, Deal Stale Alert, Win Celebration).
2. **Expected**: Four pre-built workflow templates available (inactive by default).

---

## ✨ UI/UX Polish Tests

### Test P.1: Dark/Light Mode Toggle
1. Click the **Sun/Moon icon** in the top bar (next to notification bell).
2. **Expected**: Theme smoothly transitions between dark and light mode. All elements update — cards, sidebar, inputs, charts.
3. Refresh the page → theme preference persists (stored in localStorage).

### Test P.2: Responsive Design
1. **Desktop (1025px+)**: Full sidebar, multi-column grids, all KPI cards visible.
2. **Tablet (768-1024px)**: Sidebar collapses to icons only. Content adjusts.
3. **Mobile (≤768px)**: Sidebar fully hidden. Floating menu button (bottom-right) toggles sidebar. Page headers stack vertically. KPI grids go to 2-column.
4. **Small Mobile (≤480px)**: KPIs single column. Compact padding.

### Test P.3: Micro-Animations
1. **Buttons**: Hover → slight lift + glow. Press → scale down (0.96x).
2. **Cards**: Hover over KPI cards or report cards → lift up 2px + shadow increase.
3. **Modals**: Open any modal → slide-up animation. Close → fade out.
4. **Page Transitions**: Navigate between pages → subtle fade-in-up animation.
5. **Loading**: On lazy-loaded pages, verify spinner shows briefly before content appears.

### Test P.4: Empty States
1. With a new account (no data), visit each page.
2. **Expected**: Styled empty state with icon, descriptive message, and action button (not just blank space).

### Test P.5: Skeleton Loaders
1. On slow connections or first load, verify shimmer skeleton animations appear while data loads.

### Test P.6: Deal Won Confetti
1. Drag a deal to "Closed Won" stage.
2. **Expected**: 120-particle canvas confetti animation with multi-colored rectangles and circles, gravity, rotation, and fade-out.

### Test P.7: SLA Breach Pulse
1. Tasks/deals overdue should show `sla-breach-pulse` CSS class.
2. **Expected**: Red pulsing glow animation around the item.

---

## 🔌 API Endpoint Reference (for Manual API Testing)

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register org + admin |
| POST | `/api/auth/login` | Login, get JWT |
| POST | `/api/auth/refresh` | Refresh access token |
| GET | `/api/auth/me` | Get current user |

### Leads
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/leads` | List leads (paginated, search, filter) |
| POST | `/api/leads` | Create lead |
| PUT | `/api/leads/:id` | Update lead |
| DELETE | `/api/leads/:id` | Delete lead |
| GET | `/api/leads/stats` | Lead statistics |

### Contacts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/contacts` | List contacts |
| POST | `/api/contacts` | Create contact |
| PUT | `/api/contacts/:id` | Update contact |
| DELETE | `/api/contacts/:id` | Delete contact |

### Companies
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/companies` | List companies |
| POST | `/api/companies` | Create company |
| PUT | `/api/companies/:id` | Update company |
| DELETE | `/api/companies/:id` | Delete company |

### Pipelines & Deals
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/pipelines` | List pipelines |
| POST | `/api/pipelines` | Create pipeline |
| GET | `/api/deals` | List deals |
| POST | `/api/deals` | Create deal |
| PUT | `/api/deals/:id/stage` | Move deal to stage |
| GET | `/api/deals/board/:pipelineId` | Kanban board data |
| GET | `/api/deals/forecast` | Revenue forecast |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | List tasks (filters: status, due date) |
| POST | `/api/tasks` | Create task |
| PUT | `/api/tasks/:id` | Update task |
| PUT | `/api/tasks/:id/complete` | Toggle task completion |
| GET | `/api/tasks/stats` | Task statistics |

### Reports
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reports/dashboard` | Dashboard KPIs |
| GET | `/api/reports/pipeline` | Pipeline analytics |
| GET | `/api/reports/forecast` | Forecast data |
| GET | `/api/reports/team` | Team performance |
| GET | `/api/reports/conversion` | Conversion funnel |

### Email
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/emails/send` | Send email |
| GET | `/api/emails/templates` | List templates |
| POST | `/api/emails/templates` | Create template |
| GET | `/api/emails/threads/:contactId` | Email threads |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | List notifications |
| PUT | `/api/notifications/:id/read` | Mark as read |
| PUT | `/api/notifications/read-all` | Mark all read |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users` | List users |
| PUT | `/api/admin/users/:id/role` | Change role |
| GET/POST | `/api/admin/teams` | Team CRUD |
| PUT/DELETE | `/api/admin/teams/:id` | Update/delete team |
| GET/POST | `/api/admin/custom-fields` | Custom field CRUD |
| PUT | `/api/admin/targets` | Set sales targets |
| GET | `/api/admin/audit-logs` | Audit log list |

### Import/Export
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/data/import/:entity` | Import CSV |
| GET | `/api/data/export/:entity` | Export data |
| GET | `/api/data/import/history` | Import history |

### Search
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/search?q=term` | Global search |

### Workflows
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/workflows` | List workflows |
| POST | `/api/workflows` | Create workflow |
| PUT | `/api/workflows/:id` | Update workflow |
| DELETE | `/api/workflows/:id` | Delete workflow |
| PUT | `/api/workflows/:id/toggle` | Toggle active |
| POST | `/api/workflows/:id/test` | Test run |
| GET | `/api/workflows/analytics` | Workflow analytics |

---

## 🛠️ General Verification Checklist

- [ ] Registration → Login → Dashboard flow end-to-end
- [ ] All CRUD operations functional (Leads, Contacts, Companies, Deals, Tasks)
- [ ] Kanban drag-and-drop with persistence
- [ ] Reports render with charts and filters
- [ ] Command Palette (Ctrl+K) searches all entities
- [ ] Email compose, template, thread views work
- [ ] Notification bell updates in real-time
- [ ] Admin panel: Users, Teams, Custom Fields, Pipeline Config, Audit Logs
- [ ] Import/Export: CSV upload + download
- [ ] Workflow builder: Create, save, toggle, test run
- [ ] Dark/Light mode toggle with persistence
- [ ] Mobile responsive — sidebar toggle, stacked layouts
- [ ] Lead score badges (Hot/Warm/Cold) display correctly
- [ ] Deal Won confetti fires on "Closed Won" drop

---

*Last Updated: February 25, 2026*
