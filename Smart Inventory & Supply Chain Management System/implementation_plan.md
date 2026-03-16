# Implementation Plan

**Project:** Advanced Smart Inventory & Supply Chain Management System  
**Version:** 2.0  
**Created:** February 25, 2026  
**Total Phases:** 8  
**Estimated Duration:** 16 Weeks  

---

## Project Structure

```
Smart Inventory & Supply Chain Management System/
├── PRD.md
├── implementation_plan.md
├── task.md
├── backend/                          # NestJS Backend
│   ├── package.json
│   ├── tsconfig.json
│   ├── prisma/
│   │   ├── schema.prisma             # Database schema
│   │   └── seed.ts                   # Seed data
│   ├── src/
│   │   ├── main.ts                   # Entry point
│   │   ├── app.module.ts             # Root module
│   │   ├── common/                   # Shared utilities
│   │   │   ├── guards/               # Auth & RBAC guards
│   │   │   ├── interceptors/         # Logging, transform
│   │   │   ├── decorators/           # Custom decorators
│   │   │   ├── filters/              # Exception filters
│   │   │   ├── pipes/                # Validation pipes
│   │   │   └── dto/                  # Shared DTOs
│   │   ├── modules/
│   │   │   ├── auth/                 # Authentication module
│   │   │   │   ├── auth.module.ts
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── strategies/       # JWT, Local strategies
│   │   │   │   └── dto/
│   │   │   ├── tenants/              # Multi-tenancy module
│   │   │   ├── users/                # User management
│   │   │   ├── warehouses/           # Warehouse management
│   │   │   ├── products/             # Product catalog
│   │   │   ├── inventory/            # Stock engine
│   │   │   ├── suppliers/            # Supplier management
│   │   │   ├── procurement/          # PO/PR/GRN workflow
│   │   │   ├── shipments/            # Shipment tracking
│   │   │   ├── analytics/            # BI & reporting
│   │   │   ├── events/               # Event bus
│   │   │   └── dashboard/            # Dashboard stats
│   │   └── config/                   # App configuration
│   └── test/                         # E2E tests
├── frontend/                         # Next.js Frontend
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.js
│   ├── public/
│   ├── src/
│   │   ├── app/                      # App Router pages
│   │   │   ├── layout.tsx            # Root layout
│   │   │   ├── page.tsx              # Landing/redirect
│   │   │   ├── (auth)/               # Auth group
│   │   │   │   ├── login/
│   │   │   │   └── register/
│   │   │   ├── (dashboard)/          # Protected group
│   │   │   │   ├── layout.tsx        # Dashboard layout (sidebar+topbar)
│   │   │   │   ├── dashboard/
│   │   │   │   ├── warehouses/
│   │   │   │   ├── products/
│   │   │   │   ├── inventory/
│   │   │   │   ├── procurement/
│   │   │   │   ├── suppliers/
│   │   │   │   ├── shipments/
│   │   │   │   ├── analytics/
│   │   │   │   └── settings/
│   │   ├── components/               # Reusable components
│   │   │   ├── ui/                   # Base UI kit
│   │   │   ├── layout/               # Sidebar, Topbar, etc.
│   │   │   ├── charts/               # Chart wrappers
│   │   │   └── forms/                # Form components
│   │   ├── lib/                      # Utilities
│   │   │   ├── api.ts                # API client (axios)
│   │   │   ├── auth.ts               # Auth helpers
│   │   │   └── utils.ts              # General utilities
│   │   ├── store/                    # Zustand stores
│   │   │   ├── authStore.ts
│   │   │   ├── uiStore.ts
│   │   │   └── inventoryStore.ts
│   │   └── types/                    # TypeScript types
│   └── .env.local
└── docker-compose.yml                # Local dev services
```

---

## Phase 1: Foundation & Core Setup (Week 1-2)

### Objective
Set up the entire development environment, database schema, authentication system, multi-tenancy, and the frontend shell with login/register/dashboard layout.

### Backend Tasks

#### 1.1 Project Initialization
- Initialize NestJS project with TypeScript.
- Configure `package.json` with required dependencies.
- Setup Prisma ORM with PostgreSQL connection.
- Configure environment variables (`.env`).
- Setup Docker Compose for PostgreSQL + Redis.

#### 1.2 Database Schema (Prisma)
- Define all core entities in `schema.prisma`:
  - `tenants`, `users`, `roles`, `permissions`
  - `warehouses`, `warehouse_zones`, `shelf_locations`
  - `products`, `product_categories`, `product_variants`
  - `inventory_ledgers`, `stock_movements`, `batches`
  - `suppliers`, `supplier_scorecards`
  - `purchase_orders`, `po_line_items`, `grns`
  - `shipments`, `logistics_events`
  - `audit_logs`
- Run initial migrations.
- Create seed data script.

#### 1.3 Authentication Module
- **Register endpoint:** Create tenant + admin user.
- **Login endpoint:** Validate credentials, return JWT + refresh token.
- **JWT Strategy:** Access token (15 min), refresh token (7 days, HTTP-only cookie).
- **Auth Guards:** `JwtAuthGuard`, `TenantGuard`.
- **Decorators:** `@CurrentUser()`, `@CurrentTenant()`.
- **Password hashing:** bcrypt with salt rounds.

#### 1.4 Multi-Tenancy Middleware
- `TenantMiddleware`: Extracts `tenant_id` from JWT payload.
- Prisma middleware to auto-inject `tenant_id` into all queries.
- Response interceptor for consistent API response format.

#### 1.5 Common Infrastructure
- Global exception filter with structured error responses.
- Validation pipe (class-validator).
- Logging interceptor with request/response logging.
- CORS configuration.
- Rate limiting with `@nestjs/throttler`.

### Frontend Tasks

#### 1.6 Next.js Project Setup
- Initialize Next.js 14 with App Router + TypeScript.
- Configure Tailwind CSS with custom design tokens.
- Setup Google Fonts (Inter).
- Configure path aliases.

#### 1.7 Design System & Components
- Create base UI components:
  - `Button`, `Input`, `Card`, `Badge`, `Modal`, `Dropdown`
  - `DataTable` (sortable, paginated)
  - `Sidebar`, `Topbar`, `PageHeader`
- Define color tokens, spacing, typography in Tailwind config.
- Dark mode as default theme.

#### 1.8 Authentication Pages
- **Login Page:** Email + password form, validation, API integration.
- **Register Page:** Organization name + admin user creation.
- Auth state management with Zustand (`authStore`).
- Protected route middleware.
- Token refresh logic in API client (Axios interceptor).

#### 1.9 Dashboard Shell
- Sidebar navigation with all menu items (greyed-out for unbuilt features).
- Top bar with search, notifications, user profile dropdown.
- Main dashboard page with placeholder KPI cards.
- Responsive layout (mobile drawer sidebar).

### Dependencies
- PostgreSQL 16
- Redis 7
- Node.js 20 LTS

### Deliverables
- ✅ Working auth flow (register → login → dashboard)
- ✅ JWT token management with refresh
- ✅ Multi-tenant data isolation
- ✅ Responsive dashboard shell
- ✅ Database schema migrated

---

## Phase 2: Warehouse & Product Management (Week 3-4)

### Objective
Full CRUD for warehouses (with hierarchy), product catalog, and basic inventory management.

### Backend Tasks

#### 2.1 Warehouse Module
- CRUD endpoints for warehouses.
- Nested CRUD for zones and shelf locations.
- Warehouse hierarchy tree endpoint.
- Geo-coordinates storage and distance calculation.

#### 2.2 Product Module
- Product CRUD with categories and variants.
- SKU generation logic.
- Barcode/QR code generation endpoint.
- Bulk CSV import/export.
- Image upload to S3/local storage.

#### 2.3 Inventory Module
- Inventory ledger management.
- Stock adjustment (IN/OUT/TRANSFER) with movement logging.
- Batch/lot tracking with expiry dates.
- Real-time stock level queries with aggregation.
- Safety stock & reorder point calculation.

### Frontend Tasks

#### 2.4 Warehouse Pages
- Warehouse list page with cards/table view.
- Warehouse detail page with zone/shelf hierarchy tree.
- Create/Edit warehouse form with map picker.
- Inter-warehouse transfer creation.

#### 2.5 Product Pages
- Product list with search, filter, sort, pagination.
- Product detail page with variant management.
- Create/Edit product form with image upload.
- Bulk import modal (CSV).

#### 2.6 Inventory Pages
- Stock levels overview (cards + table).
- Stock adjustment form.
- Movement history timeline.
- Low stock alerts panel.
- Expiry tracking dashboard.

### Deliverables
- ✅ Full warehouse hierarchy CRUD
- ✅ Product catalog with variants
- ✅ Inventory tracking with batch management
- ✅ Stock movement history

---

## Phase 3: Procurement & Supplier Management (Week 5-6)

### Objective
Automated procurement lifecycle and supplier intelligence engine.

### Backend Tasks

#### 3.1 Procurement Module
- Purchase Requisition (PR) CRUD with auto-generation logic.
- Purchase Order (PO) creation from approved PRs.
- Multi-level approval workflow engine.
- GRN (Goods Received Note) with partial delivery support.
- Price variance detection algorithm.

#### 3.2 Supplier Module
- Supplier CRUD with profile management.
- Scorecard calculation engine (on-time, quality, price).
- Auto-blacklisting service.
- Contract expiry notification scheduler.

### Frontend Tasks

#### 3.3 Procurement Pages
- PR list with status filters and approval actions.
- PO creation wizard (supplier select → line items → review → submit).
- PO detail page with lifecycle timeline.
- GRN receiving form with barcode scanner.

#### 3.4 Supplier Pages
- Supplier list with score badges.
- Supplier detail page with scorecard radar chart.
- Performance trends over time.
- Supplier comparison table.

### Deliverables
- ✅ Full procurement lifecycle
- ✅ Supplier scorecard system
- ✅ Approval workflow engine

---

## Phase 4: Shipment Tracking & Events (Week 7-8)

### Objective
Shipment lifecycle management, event-driven architecture, and WebSocket integration.

### Backend Tasks

#### 4.1 Shipment Module
- Shipment CRUD with full lifecycle status management.
- Simulated GPS tracking with location updates.
- Exception detection and notification engine.
- Proof of delivery tracking.

#### 4.2 Event System
- Redis Pub/Sub event bus setup.
- Event handlers for: StockLow, ShipmentDelayed, SupplierLate, PriceVariance.
- WebSocket gateway for real-time client updates.
- Notification service (in-app + email).

### Frontend Tasks

#### 4.3 Shipment Pages
- Shipment list with status badges and filters.
- Shipment detail page with status timeline.
- Simulated map view with route visualization.
- Exception management panel.

#### 4.4 Real-Time Updates
- WebSocket connection manager.
- Real-time notification bell with unread count.
- Live stock level updates on inventory page.
- Toast notifications for system events.

### Deliverables
- ✅ Shipment tracking with simulated GPS
- ✅ Event-driven notifications
- ✅ Real-time WebSocket updates

---

## Phase 5: BI Dashboard & RBAC (Week 9-10)

### Objective
Executive dashboards with rich data visualizations, and granular role-based access control.

### Backend Tasks

#### 5.1 Analytics Module
- Dashboard statistics aggregation endpoints.
- Report generation service (PDF/CSV).
- Scheduled report job (cron).

#### 5.2 RBAC Module
- Role CRUD with permission matrix.
- Permission guard for all endpoints.
- Audit log service with comprehensive tracking.

### Frontend Tasks

#### 5.3 Dashboard Enhancement
- KPI card widgets with sparkline charts.
- Inventory health gauge charts (Recharts).
- Supply-demand gap area charts.
- Procurement cost trend bar charts.
- Top SKUs horizontal bar charts.
- Warehouse utilization heat maps.

#### 5.4 RBAC Pages
- Role management page with permission checkboxes.
- User management with role assignment.
- Audit log viewer with filters.

#### 5.5 Reports Page
- Report builder with date range and filters.
- Export to PDF and CSV.
- Scheduled report configuration.

### Deliverables
- ✅ Executive BI dashboard with 7+ chart types
- ✅ Granular RBAC with audit trails
- ✅ Report generation and export

---

## Phase 6: AI & Anomaly Detection (Week 11-12)

### Backend Tasks
- Demand forecasting using linear regression + moving averages.
- Anomaly detection (Z-score analysis on procurement data).
- Ghost inventory detection logic.
- Fraud alert system with severity levels.

### Frontend Tasks
- Forecast visualization with predicted vs actual charts.
- Anomaly alert dashboard.
- Fraud detection panel.

---

## Phase 7: Digital Twin & Dynamic Pricing (Week 13-14)

### Backend Tasks
- Supply chain graph model (nodes = entities, edges = flows).
- What-If simulation engine with parameter adjustment.
- Dynamic pricing calculation service.
- Scarcity multiplier and auto-discount algorithms.

### Frontend Tasks
- D3.js force-directed supply chain visualization.
- Simulation control panel with scenario parameters.
- Financial impact dashboard.
- Dynamic pricing configuration page.

---

## Phase 8: Carbon Tracker & Polish (Week 15-16)

### Backend Tasks
- Carbon emission calculation per shipment.
- SKU-level carbon attribution.
- Sustainability report generator.
- Blockchain-like provenance ledger (hash chain).

### Frontend Tasks
- Carbon footprint dashboard.
- Sustainability report page.
- Provenance tracker with QR verification.
- Final polish, performance optimization, accessibility.

---

## Development Standards

### Code Quality
- TypeScript strict mode enabled.
- ESLint + Prettier for consistent formatting.
- DTOs validated with class-validator.
- All endpoints documented with Swagger decorators.

### Testing Strategy
- **Unit Tests:** Services and utility functions (Jest).
- **Integration Tests:** API endpoint testing (Supertest).
- **E2E Tests:** Critical workflows (Cypress/Playwright).
- **Minimum Coverage:** 80% for services.

### Git Workflow
- `main` → Production-ready code.
- `develop` → Integration branch.
- Feature branches: `feature/phase-X-feature-name`.
- PR reviews with at least 1 approval.

---

*End of Implementation Plan*
