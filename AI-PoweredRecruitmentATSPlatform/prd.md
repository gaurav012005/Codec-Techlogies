AI-Powered Recruitment & ATS Platform — PRD
Version: 1.0
Date: March 1, 2026
Product Type: Multi-Tenant SaaS Recruitment System
Target Level: Advanced (12/15 – Portfolio + Real SaaS Ready)

1️⃣ Executive Summary
1.1 Product Vision
To build an AI-driven Applicant Tracking System (ATS) that automates resume screening, intelligently ranks candidates, and optimizes the hiring workflow for startups and enterprises. The platform will serve as a centralized recruitment hub, leveraging NLP, predictive analytics, and intelligent automation to transform how organizations hire talent.

1.2 Problem Statement
Recruiters and HR teams face critical challenges:

Problem	Impact
Manual resume screening	75% of recruiter time wasted on unqualified resumes
Poor skill-job matching	High false-positive rates in candidate shortlisting
Unstructured hiring pipelines	Inconsistent candidate experience, lost applicants
No predictive insights	Bad hires cost 30% of annual salary per mis-hire
Resume fraud	40%+ of resumes contain exaggerated or false claims
Communication gaps	Candidates ghosted, delayed feedback loops
1.3 Solution Overview
A centralized ATS platform that:

Uses NLP to parse and rank resumes automatically (spaCy / BERT)
Matches skills with job descriptions using AI similarity scoring
Provides hiring workflow automation with Kanban pipelines
Offers predictive analytics & fraud detection for smarter decisions
Enables collaborative hiring with team-based evaluation tools
Automates communication with candidates and hiring teams
1.4 Key Differentiators
AI-First Approach — Every stage of the pipeline is AI-enhanced
Multi-Tenant SaaS — Each company gets isolated data with shared infrastructure
Predictive Hiring Score — ML-powered candidate success prediction
Fraud Detection — AI-generated content and resume fraud flagging
Real-Time Collaboration — Team-based hiring decisions with live updates
2️⃣ Target Users
User Role	Description	Key Actions
Super Admin	Platform owner (manages tenants, billing)	Manage tenants, view platform analytics, configure billing, system settings
HR Admin	Manages company hiring process	Create jobs, configure pipelines, manage team, view company analytics
Recruiter	Screens & manages candidates	Screen resumes, shortlist candidates, schedule interviews, communicate
Hiring Manager	Reviews shortlisted candidates	Review candidates, provide feedback, approve/reject offers
Candidate	Applies & tracks application	Browse jobs, submit applications, track status, schedule interviews
User Personas
Persona 1: Sarah — HR Admin (Startup, 50 employees)

Manages 5–10 open roles at any time
Needs fast screening for high-volume junior roles
Values time-to-hire metrics and pipeline visibility
Persona 2: Raj — Recruiter (Enterprise, 5000+ employees)

Handles 50+ requisitions across departments
Needs bulk resume parsing and AI ranking
Relies on collaborative feedback from hiring managers
Persona 3: Alex — Candidate (Software Engineer)

Applies to multiple companies simultaneously
Wants transparent application status tracking
Values quick response times and clear communication
3️⃣ Tech Stack
Layer	Technology	Justification
Frontend	React.js + TypeScript	Component-based UI, type safety, rich ecosystem
UI Library	Shadcn/UI + Tailwind CSS	Modern design system, accessibility built-in
State Management	React Query + Zustand	Server state caching + lightweight client state
Backend	Python + FastAPI	Async support, auto-docs, high performance
AI/NLP	spaCy + Transformers (BERT)	Industry-standard NLP, fine-tunable models
Database	PostgreSQL	ACID compliance, JSON support, full-text search
ORM	SQLAlchemy + Alembic	Robust ORM with migration support
Auth	JWT + RBAC	Stateless authentication, fine-grained permissions
File Storage	AWS S3 / Local Storage	Scalable file management
Cache	Redis	Session caching, rate limiting, job queues
Task Queue	Celery + Redis	Background processing for AI tasks
Email	SMTP / SendGrid	Transactional email delivery
Deployment	Docker + Docker Compose	Containerized, reproducible environments
CI/CD	GitHub Actions	Automated testing and deployment
Monitoring	Prometheus + Grafana	System health and performance metrics
4️⃣ System Architecture
Background Workers
Data Layer
AI Microservice
API Gateway - FastAPI
Frontend - React.js
Landing Page
Auth Pages
Dashboard
Job Management
Candidate Pipeline
Analytics Dashboard
Interview Scheduler
Admin Panel
Auth Service
JWT + RBAC
Job Service
Candidate Service
Interview Service
Analytics Service
Notification Service
Resume Parser - spaCy
Skill Matcher - BERT
Predictive Model - ML
Fraud Detector
Talent Pool Recommender
PostgreSQL
Redis Cache
S3 File Storage
Celery Workers
Email Queue
AI Processing Queue
Architecture Decisions
Decision	Rationale
Microservice for AI	Isolate compute-heavy AI tasks from main API
Celery for background jobs	Resume parsing and AI scoring are async operations
Redis caching	Reduce DB load for frequently accessed data (job listings, dashboards)
Multi-tenant via schema isolation	Each company gets a separate schema for data isolation
Event-driven notifications	Decouple notification logic from business logic

Comment
Ctrl+Alt+M

PRD Part 2 — Core Features (Necessary Features)
4️⃣ Core Features
4.1 User Authentication & Role-Based Access Control
4.1.1 Overview
Secure, JWT-based authentication system with multi-role access control and multi-tenant architecture ensuring data isolation between organizations.

4.1.2 Functional Requirements
ID	Requirement	Priority
AUTH-01	User registration with email verification	P0
AUTH-02	Login with email/password returning JWT access + refresh tokens	P0
AUTH-03	Token refresh mechanism (access token: 15 min, refresh: 7 days)	P0
AUTH-04	Password reset via email link (expires in 1 hour)	P0
AUTH-05	Multi-role system: Super Admin, HR Admin, Recruiter, Hiring Manager, Candidate	P0
AUTH-06	Role-based route protection (frontend + backend)	P0
AUTH-07	Multi-tenant isolation — users only see their organization's data	P0
AUTH-08	OAuth2 login (Google, LinkedIn)	P1
AUTH-09	Two-factor authentication (TOTP-based)	P1
AUTH-10	Session management — view/revoke active sessions	P2
AUTH-11	Account lockout after 5 failed login attempts (30 min cooldown)	P0
4.1.3 RBAC Permission Matrix
Resource	Super Admin	HR Admin	Recruiter	Hiring Manager	Candidate
Manage Tenants	✅	❌	❌	❌	❌
Manage Users (own org)	✅	✅	❌	❌	❌
Create/Edit Jobs	✅	✅	✅	❌	❌
Delete Jobs	✅	✅	❌	❌	❌
View Candidates	✅	✅	✅	✅ (assigned only)	❌
Move Pipeline Stage	✅	✅	✅	❌	❌
Schedule Interviews	✅	✅	✅	❌	❌
Submit Feedback	✅	✅	✅	✅	❌
View Analytics	✅	✅	✅ (limited)	❌	❌
Apply to Jobs	❌	❌	❌	❌	✅
Track Application	❌	❌	❌	❌	✅
4.1.4 API Endpoints
POST   /api/v1/auth/register          — Register new user
POST   /api/v1/auth/login             — Login (returns JWT)
POST   /api/v1/auth/refresh           — Refresh access token
POST   /api/v1/auth/forgot-password   — Request password reset
POST   /api/v1/auth/reset-password    — Reset password with token
POST   /api/v1/auth/verify-email      — Verify email address
GET    /api/v1/auth/me                — Get current user profile
PUT    /api/v1/auth/me                — Update profile
POST   /api/v1/auth/logout            — Logout (invalidate refresh token)
4.1.5 Multi-Tenant Architecture
Strategy: Schema-per-tenant in PostgreSQL
tenant_abc → schema "tenant_abc"
  ├── users
  ├── jobs
  ├── candidates
  └── ...
tenant_xyz → schema "tenant_xyz"
  ├── users
  ├── jobs
  ├── candidates
  └── ...
Shared schema "public"
  ├── tenants
  ├── billing
  └── platform_config
Tenant resolved via subdomain (company.ats-platform.com) or header (X-Tenant-ID)
All queries scoped to tenant automatically via middleware
Super Admin can switch between tenants
4.2 Job Management
4.2.1 Overview
Complete job lifecycle management — create, publish, manage, and archive job postings with intelligent tagging and auto-expiry.

4.2.2 Functional Requirements
ID	Requirement	Priority
JOB-01	Create job post with title, description, department, location, type (Full-time/Part-time/Contract/Remote)	P0
JOB-02	Add required skills with proficiency levels (Beginner/Intermediate/Expert)	P0
JOB-03	Set experience range (min–max years)	P0
JOB-04	Set salary range (min–max, currency, negotiable flag)	P0
JOB-05	Set application deadline with auto-expiry	P0
JOB-06	Job status lifecycle: Draft → Published → Closed → Archived	P0
JOB-07	Duplicate existing job post	P1
JOB-08	Bulk job import via CSV	P1
JOB-09	Job templates for recurring roles	P1
JOB-10	AI-assisted job description generation	P2
JOB-11	Public job board (shareable link, SEO-optimized)	P0
JOB-12	Job categorization by department and location	P0
JOB-13	Auto-notify subscribed candidates on new job match	P1
4.2.3 Job Post Data Model
json
{
  "id": "uuid",
  "tenant_id": "uuid",
  "title": "Senior Backend Engineer",
  "department": "Engineering",
  "location": "New York, NY",
  "work_type": "hybrid",
  "employment_type": "full_time",
  "description": "Rich text description...",
  "responsibilities": ["Design APIs", "Lead code reviews"],
  "required_skills": [
    {"skill": "Python", "level": "expert", "weight": 0.3},
    {"skill": "FastAPI", "level": "intermediate", "weight": 0.2},
    {"skill": "PostgreSQL", "level": "intermediate", "weight": 0.2}
  ],
  "preferred_skills": ["Docker", "Kubernetes", "AWS"],
  "experience_range": {"min": 5, "max": 10},
  "salary_range": {"min": 120000, "max": 180000, "currency": "USD", "negotiable": true},
  "education_requirement": "bachelor",
  "application_deadline": "2026-04-30T23:59:59Z",
  "status": "published",
  "created_by": "uuid",
  "created_at": "2026-03-01T10:00:00Z",
  "published_at": "2026-03-01T12:00:00Z",
  "applicant_count": 0
}
4.2.4 API Endpoints
POST   /api/v1/jobs                   — Create job
GET    /api/v1/jobs                   — List jobs (paginated, filtered)
GET    /api/v1/jobs/{id}              — Get job details
PUT    /api/v1/jobs/{id}              — Update job
DELETE /api/v1/jobs/{id}              — Delete job (soft delete)
POST   /api/v1/jobs/{id}/publish      — Publish job
POST   /api/v1/jobs/{id}/close        — Close job
POST   /api/v1/jobs/{id}/duplicate    — Duplicate job
GET    /api/v1/jobs/public            — Public job board
GET    /api/v1/jobs/{id}/analytics    — Job-specific analytics
4.3 Resume Parsing & Ranking (AI-Based)
4.3.1 Overview
AI-powered resume parsing extracts structured data from PDF/DOCX uploads. The system uses NLP models to rank candidates against job descriptions with weighted similarity scoring.

4.3.2 Functional Requirements
ID	Requirement	Priority
RES-01	Upload resume in PDF or DOCX format (max 10MB)	P0
RES-02	Extract: Name, Email, Phone, LinkedIn URL	P0
RES-03	Extract: Skills (categorized: technical, soft, tools)	P0
RES-04	Extract: Work Experience (company, role, duration, description)	P0
RES-05	Extract: Education (degree, institution, year, GPA)	P0
RES-06	Extract: Certifications, Projects, Languages	P1
RES-07	Store structured candidate profile in database	P0
RES-08	Rank candidates based on job description similarity	P0
RES-09	Bulk resume upload (up to 50 at once)	P1
RES-10	Re-parse resume on demand	P1
RES-11	Resume version history	P2
4.3.3 AI Ranking Logic
Similarity Score Calculation:
1. Text Preprocessing
   - Tokenize resume and job description
   - Remove stopwords, lemmatize
   - Extract key entities (skills, roles, companies)
2. Feature Extraction
   - TF-IDF vectors for both documents
   - BERT embeddings for semantic similarity
3. Weighted Scoring Formula
   ┌─────────────────────────────────────────────────┐
   │ Final Score = (S × 0.50) + (E × 0.30) + (D × 0.20) │
   └─────────────────────────────────────────────────┘
   Where:
   S = Skill Match Score (0–100)
       Count of matched skills / required skills × 100
       Bonus: +5 per exact proficiency level match
       Bonus: +10 for preferred skills matched
   E = Experience Score (0–100)
       If years_exp >= required_max → 100
       If years_exp >= required_min → scaled proportionally
       If years_exp < required_min → (years_exp / required_min) × 70
   D = Education Score (0–100)
       PhD → 100
       Master's → 85
       Bachelor's → 70
       Associate → 50
       Other → 30
       Bonus: +10 for relevant field match
4. Output
   - Match percentage (0–100%)
   - Ranking position among all applicants
   - Breakdown: skill score, experience score, education score
   - Matched skills list + missing skills list
4.3.4 Resume Parsing Pipeline
Upload (PDF/DOCX)
    ↓
File Validation (type, size, virus scan)
    ↓
Text Extraction (PyPDF2 / python-docx)
    ↓
NLP Processing (spaCy NER + custom patterns)
    ↓
Entity Extraction (name, skills, experience, education)
    ↓
Structured Profile Creation
    ↓
Store in DB + Index for Search
    ↓
Calculate Match Score against applied job
    ↓
Return structured profile + score
4.3.5 Processing Requirements
Metric	Target
Single resume parse time	< 5 seconds
Bulk parse throughput	50 resumes in < 60 seconds
Extraction accuracy (skills)	> 85%
Extraction accuracy (experience)	> 80%
Ranking correlation with human review	> 75%
4.4 Skill Matching with Job Descriptions
4.4.1 Overview
Intelligent skill matching engine that compares candidate skill sets against job requirements, provides match percentages, highlights gaps, and suggests upskilling areas.

4.4.2 Functional Requirements
ID	Requirement	Priority
SKL-01	Match candidate skills against required job skills	P0
SKL-02	Display overall match percentage	P0
SKL-03	Highlight matched skills (with proficiency comparison)	P0
SKL-04	Highlight missing/gap skills	P0
SKL-05	Suggest upskilling resources for missing skills	P1
SKL-06	Skill synonym matching (e.g., "JS" = "JavaScript")	P0
SKL-07	Skill category grouping (Frontend, Backend, DevOps, etc.)	P1
SKL-08	Skill trend analysis (rising/declining demand)	P2
4.4.3 Matching Algorithm
Skill Matching Process:
1. Normalize Skills
   - Lowercase, trim
   - Map synonyms: {"js": "javascript", "py": "python", "k8s": "kubernetes"}
   - Map related skills: {"react" → "frontend", "django" → "backend"}
2. Match Types
   - EXACT: Candidate has exact skill → Full weight
   - PARTIAL: Candidate has related skill → 50% weight
   - MISSING: Candidate lacks skill → 0% weight
3. Output per Candidate-Job Pair
   {
     "overall_match": 78,
     "matched_skills": [
       {"skill": "Python", "required_level": "expert", "candidate_level": "expert", "match": "exact"},
       {"skill": "FastAPI", "required_level": "intermediate", "candidate_level": "beginner", "match": "partial"}
     ],
     "missing_skills": [
       {"skill": "Kubernetes", "required_level": "intermediate", "upskill_suggestion": "KodeKloud CKA Course"}
     ],
     "bonus_skills": ["GraphQL", "Terraform"]
   }
4.5 Hiring Pipeline Visualization
4.5.1 Overview
Kanban-style drag-and-drop pipeline for managing candidates through hiring stages with real-time updates and collaborative features.

4.5.2 Functional Requirements
ID	Requirement	Priority
PIP-01	Kanban board with default stages: Applied → Shortlisted → Interview → Offer → Hired/Rejected	P0
PIP-02	Drag-and-drop candidates between stages	P0
PIP-03	Custom pipeline stages per job	P1
PIP-04	Real-time updates (WebSocket-based)	P1
PIP-05	Stage transition triggers (auto-send emails, notifications)	P0
PIP-06	Candidate card with quick-view: name, score, applied date, current stage	P0
PIP-07	Filter candidates by: score range, skills, experience, stage	P0
PIP-08	Bulk actions: move multiple candidates, send bulk emails	P1
PIP-09	Stage-wise candidate count and conversion metrics	P0
PIP-10	Activity timeline per candidate (all actions logged)	P0
PIP-11	Rejection reason tracking (categorized: overqualified, underqualified, culture fit, etc.)	P1
4.5.3 Default Pipeline Stages
┌──────────┐   ┌─────────────┐   ┌───────────┐   ┌─────────┐   ┌────────────────┐
│ Applied  │ → │ Shortlisted │ → │ Interview │ → │  Offer  │ → │ Hired/Rejected │
│  (New)   │   │  (Screened) │   │(Scheduled)│   │(Extended)│   │   (Final)      │
└──────────┘   └─────────────┘   └───────────┘   └─────────┘   └────────────────┘
    Auto           AI-Powered       Manual/         Manual        Manual
  (on apply)      (AI ranking)     Scheduled       Decision      Decision
                  
  Trigger:        Trigger:         Trigger:        Trigger:      Trigger:
  - Confirm       - Notify         - Calendar      - Offer       - Onboarding
    email           recruiter        invite          letter        email
4.6 Interview Scheduling
4.6.1 Overview
Integrated interview scheduling system with calendar sync, automated invitations, feedback forms, and structured scorecards.

4.6.2 Functional Requirements
ID	Requirement	Priority
INT-01	Schedule interview with date, time, duration, location/link	P0
INT-02	Assign interviewer(s) from the team	P0
INT-03	Auto-send calendar invites (ICS format) via email	P0
INT-04	Interview types: Phone Screen, Technical, Behavioral, Panel, Final	P0
INT-05	Google Calendar / Outlook Calendar integration	P1
INT-06	Interviewer availability picker	P1
INT-07	Candidate self-scheduling (pick from available slots)	P2
INT-08	Interview reminders (24h and 1h before)	P0
INT-09	Reschedule/cancel with notification	P0
INT-10	Video interview link auto-generation (Zoom/Google Meet)	P1
4.6.3 Interview Feedback & Scorecard
json
{
  "interview_id": "uuid",
  "interviewer_id": "uuid",
  "candidate_id": "uuid",
  "job_id": "uuid",
  "type": "technical",
  "scorecard": {
    "technical_skills": {"score": 4, "max": 5, "notes": "Strong Python, needs Docker work"},
    "problem_solving": {"score": 5, "max": 5, "notes": "Excellent algorithmic thinking"},
    "communication": {"score": 3, "max": 5, "notes": "Could be more concise"},
    "culture_fit": {"score": 4, "max": 5, "notes": "Collaborative mindset"},
    "leadership": {"score": 3, "max": 5, "notes": "Growing into leadership"}
  },
  "overall_score": 3.8,
  "recommendation": "strong_hire",
  "strengths": ["Deep Python expertise", "Great problem solver"],
  "concerns": ["Limited DevOps experience"],
  "notes": "Would be a great fit for the backend team. Recommend for offer.",
  "submitted_at": "2026-03-15T16:30:00Z"
}
4.6.4 Recommendation Options
Option	Description
Strong Hire	Exceptional candidate, push to offer
Hire	Good candidate, proceed to next round
Lean Hire	Acceptable, but has concerns
Lean No Hire	Below bar, significant concerns
No Hire	Not suitable, reject

PRD Part 3 — Advanced Features, Additional Features & NEW Features
5️⃣ Advanced Features
🚀 5.1 Predictive Hiring Score (AI Model)
5.1.1 Overview
An ML model that predicts candidate success probability, offer acceptance likelihood, and estimated retention — giving recruiters data-driven confidence in hiring decisions.

5.1.2 Functional Requirements
ID	Requirement	Priority
PHS-01	Generate "Hiring Fit Score" (0–100) for each candidate-job pair	P0
PHS-02	Predict offer acceptance probability	P0
PHS-03	Predict estimated retention probability (6-month, 1-year)	P1
PHS-04	Display Risk Flag: Low / Medium / High	P0
PHS-05	Explain score breakdown (feature importance)	P0
PHS-06	Model retraining on new hiring outcomes (quarterly)	P1
PHS-07	Compare predicted vs actual outcomes for model validation	P2
5.1.3 Model Architecture
Input Features:
├── Resume Features
│   ├── Skill match score (0–100)
│   ├── Experience relevance score (0–100)
│   ├── Education match score (0–100)
│   ├── Career progression velocity
│   ├── Job tenure stability (avg months per role)
│   └── Skill diversity index
│
├── Interview Features
│   ├── Average scorecard rating
│   ├── Technical interview score
│   ├── Cultural fit score
│   ├── Number of interview rounds completed
│   └── Interviewer consensus score
│
├── Behavioral Features
│   ├── Response time to communications
│   ├── Application completeness score
│   ├── Follow-up engagement level
│   └── Salary expectation alignment
│
└── Historical Features (if available)
    ├── Past hiring outcomes for similar profiles
    ├── Department-specific success rates
    └── Role-specific retention rates
Model: Gradient Boosted Trees (XGBoost) or Random Forest
Output:
├── Hiring Fit Score: 0–100
├── Acceptance Probability: 0–100%
├── Retention Probability (6mo): 0–100%
├── Retention Probability (1yr): 0–100%
├── Risk Flag: Low (80+) / Medium (50–79) / High (<50)
└── Top 5 Contributing Factors
5.1.4 Score Display
┌─────────────────────────────────────────────┐
│  Hiring Fit Score: 87/100         🟢 LOW RISK │
│─────────────────────────────────────────────│
│  Offer Acceptance:    92%  ████████████░░   │
│  Retention (6mo):     85%  █████████████░   │
│  Retention (1yr):     78%  ████████████░░   │
│─────────────────────────────────────────────│
│  Top Factors:                               │
│  ✅ Strong skill match (95%)                │
│  ✅ Stable career progression               │
│  ⚠️  Slight salary misalignment             │
│  ✅ Excellent interview scores              │
│  ✅ Quick response time                     │
└─────────────────────────────────────────────┘
5.1.5 Business Impact
Metric	Expected Improvement
Bad hire rate	Reduce by 30–40%
Time to hire	Reduce by 20% (faster confident decisions)
Offer acceptance rate	Increase by 15% (better targeting)
1-year retention	Improve by 25%
🚀 5.2 Resume Fraud & AI-Generated Content Detection
5.2.1 Overview
Detect plagiarized resumes, AI-generated content, fake experience claims, and suspicious profiles — flagging them for human review before progressing in the pipeline.

5.2.2 Functional Requirements
ID	Requirement	Priority
FRD-01	Detect AI-generated resume content (ChatGPT, Claude, etc.)	P0
FRD-02	Detect plagiarized/templated resumes (cross-candidate comparison)	P0
FRD-03	Flag experience anomalies (overlapping dates, impossible timelines)	P0
FRD-04	Verify claimed skills against experience descriptions	P1
FRD-05	Cross-reference LinkedIn profile (if provided)	P1
FRD-06	Generate Fraud Risk Score (0–100)	P0
FRD-07	Auto-flag profiles above fraud threshold for review	P0
FRD-08	Provide evidence report for flagged profiles	P0
FRD-09	Admin override — clear fraud flag with reason	P0
5.2.3 Detection Methods
Fraud Detection Pipeline:
1. AI-Generated Content Detection
   ├── Perplexity scoring (low perplexity = likely AI)
   ├── Burstiness analysis (AI text has uniform sentence structure)
   ├── Vocabulary diversity index
   └── Output: AI Probability Score (0–100%)
2. Plagiarism Detection
   ├── Hash-based comparison against resume database
   ├── Cosine similarity with existing resumes (flag if > 90%)
   ├── Template detection (known resume builder patterns)
   └── Output: Plagiarism Score (0–100%)
3. Experience Anomaly Detection
   ├── Overlapping employment dates
   ├── Unrealistic progression (Junior → CTO in 1 year)
   ├── Company existence verification (optional API)
   ├── Gap analysis (unexplained gaps > 12 months flagged)
   └── Output: Anomaly Score (0–100%)
4. Skill Verification
   ├── Skills claimed vs skills demonstrated in experience
   ├── Skill-role mismatch detection
   └── Output: Verification Score (0–100%)
Combined Fraud Risk Score:
┌─────────────────────────────────────────────────────────┐
│ Fraud Score = (AI × 0.30) + (Plagiarism × 0.25) +      │
│               (Anomaly × 0.30) + (Verification × 0.15) │
└─────────────────────────────────────────────────────────┘
Thresholds:
  0–30:  ✅ Clean — Proceed normally
  31–60: ⚠️  Caution — Review recommended
  61–100: 🔴 High Risk — Manual review required
5.2.4 Fraud Report Output
json
{
  "candidate_id": "uuid",
  "fraud_risk_score": 72,
  "risk_level": "high",
  "flags": [
    {
      "type": "ai_generated",
      "score": 85,
      "evidence": "Resume summary and cover letter show low perplexity (2.1), uniform sentence length, and 95th percentile vocabulary consistency",
      "affected_sections": ["summary", "cover_letter"]
    },
    {
      "type": "experience_anomaly",
      "score": 65,
      "evidence": "Employment at CompanyA (2022-2024) overlaps with CompanyB (2023-2025) by 12 months",
      "affected_sections": ["work_experience"]
    }
  ],
  "recommendation": "manual_review_required",
  "reviewed": false,
  "reviewed_by": null,
  "review_decision": null
}
6️⃣ Additional Necessary Features
✅ 6.1 Automated Email & Workflow Automation
6.1.1 Overview
Event-driven email automation system that sends contextual emails based on candidate pipeline movements, with customizable templates and bulk communication support.

6.1.2 Functional Requirements
ID	Requirement	Priority
EML-01	Auto-send "Application Received" confirmation	P0
EML-02	Auto-send "Interview Invitation" with calendar invite	P0
EML-03	Auto-send "Rejection" email (customizable, delayed send option)	P0
EML-04	Auto-send "Offer Letter" email with attached document	P0
EML-05	Custom email template builder (WYSIWYG editor)	P0
EML-06	Template variables: {{candidate_name}}, {{job_title}}, {{company_name}}, {{interview_date}}, etc.	P0
EML-07	Bulk email to candidates (filtered by stage, job, score)	P1
EML-08	Email scheduling (send at specific time)	P1
EML-09	Email open/click tracking	P2
EML-10	Stage-based auto-triggers (configurable per job)	P0
EML-11	Email log per candidate (all sent emails viewable)	P0
6.1.3 Workflow Trigger Configuration
json
{
  "job_id": "uuid",
  "triggers": [
    {
      "event": "stage_change",
      "from_stage": null,
      "to_stage": "applied",
      "action": "send_email",
      "template_id": "application_received",
      "delay_minutes": 0
    },
    {
      "event": "stage_change",
      "from_stage": "applied",
      "to_stage": "shortlisted",
      "action": "send_email",
      "template_id": "shortlisted_notification",
      "delay_minutes": 0
    },
    {
      "event": "stage_change",
      "from_stage": "interview",
      "to_stage": "rejected",
      "action": "send_email",
      "template_id": "rejection_after_interview",
      "delay_minutes": 1440
    },
    {
      "event": "interview_scheduled",
      "action": "send_email",
      "template_id": "interview_invite",
      "delay_minutes": 0,
      "attach_calendar_invite": true
    }
  ]
}
✅ 6.2 Analytics & Recruitment Dashboard
6.2.1 Overview
Comprehensive analytics dashboard with real-time metrics, visualizations, and exportable reports for data-driven recruitment decisions.

6.2.2 Functional Requirements
ID	Requirement	Priority
ANL-01	Time to Hire (average days from job posted to candidate hired)	P0
ANL-02	Cost per Hire (estimated based on time and resources)	P1
ANL-03	Application-to-Offer ratio	P0
ANL-04	Stage-wise drop-off rate (funnel visualization)	P0
ANL-05	Top sourcing channels breakdown	P1
ANL-06	Recruiter performance metrics (candidates processed, time per stage)	P1
ANL-07	Department-wise hiring trends	P0
ANL-08	Monthly/quarterly hiring trend charts	P0
ANL-09	Active jobs vs filled positions	P0
ANL-10	Candidate diversity metrics (optional, GDPR-compliant)	P2
ANL-11	Export reports as PDF/CSV	P1
ANL-12	Scheduled report emails (weekly/monthly)	P2
6.2.3 Dashboard Layout
┌─────────────────────────────────────────────────────────────┐
│  RECRUITMENT DASHBOARD                     📅 Last 30 Days  │
├──────────┬──────────┬──────────┬──────────┬────────────────┤
│ Open Jobs│Candidates│ Hired    │Avg Time  │ Offer Rate     │
│    24    │   1,247  │   18     │  21 days │   14.4%        │
├──────────┴──────────┴──────────┴──────────┴────────────────┤
│                                                             │
│  ┌─────────────────────┐  ┌──────────────────────────────┐ │
│  │   HIRING FUNNEL     │  │   MONTHLY HIRING TREND       │ │
│  │                     │  │                              │ │
│  │  Applied    ██ 1247 │  │   20 ┤        ╱╲             │ │
│  │  Screened   ██ 856  │  │   15 ┤   ╱╲╱╱  ╲            │ │
│  │  Interview  ██ 234  │  │   10 ┤  ╱       ╲╱╲         │ │
│  │  Offer      ██ 42   │  │    5 ┤╱╱            ╲       │ │
│  │  Hired      ██ 18   │  │    0 ┼───────────────────    │ │
│  │                     │  │      Jan Feb Mar Apr May     │ │
│  └─────────────────────┘  └──────────────────────────────┘ │
│                                                             │
│  ┌─────────────────────┐  ┌──────────────────────────────┐ │
│  │ TOP SOURCING        │  │   DEPT-WISE HIRING           │ │
│  │                     │  │                              │ │
│  │  LinkedIn    42%    │  │  Engineering  ████████ 45%   │ │
│  │  Job Board   28%    │  │  Marketing    ████ 22%       │ │
│  │  Referral    18%    │  │  Sales        ███ 18%        │ │
│  │  Website     12%    │  │  Operations   ██ 15%         │ │
│  └─────────────────────┘  └──────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
7️⃣ NEW Features (Added per Project Requirements)
🚀 7.1 [ADVANCED] AI Talent Pool & Passive Candidate Recommender
7.1.1 Overview
An intelligent talent pool system that maintains a searchable database of all past and current candidates, and proactively recommends passive candidates from the pool when new jobs are created. Unlike traditional ATS systems that treat each job as an isolated silo, this feature creates a living talent network that grows smarter over time.

7.1.2 Problem It Solves
70% of the global workforce are passive candidates — they're not actively applying but would consider the right opportunity
Recruiters re-source candidates who already exist in their database
Valuable past applicants (silver medalists) are forgotten after rejection
No mechanism to proactively match existing talent to new openings
7.1.3 Functional Requirements
ID	Requirement	Priority
TAL-01	Maintain unified talent pool of all candidates (past + current)	P0
TAL-02	Auto-recommend top 10 candidates from pool when a new job is published	P0
TAL-03	Advanced search: filter by skills, experience, location, availability, last active date	P0
TAL-04	Candidate tagging system (e.g., "Silver Medalist", "Strong Culture Fit", "Future Leader")	P0
TAL-05	"Re-engage" workflow — send personalized outreach to passive candidates	P0
TAL-06	Candidate availability status: Active / Open to Opportunities / Not Looking	P1
TAL-07	Talent pool analytics: pool size growth, re-engagement rate, pool-to-hire conversion	P1
TAL-08	AI-powered "Similar Candidates" — find candidates similar to a selected profile	P1
TAL-09	Smart ranking: factor in recency, past interview performance, engagement level	P0
TAL-10	Candidate opt-in for talent pool (GDPR compliant)	P0
TAL-11	Automated pool refresh — flag stale profiles (no update in 12+ months)	P1
TAL-12	Talent pipeline — nurture campaigns for high-potential passive candidates	P2
7.1.4 AI Recommendation Algorithm
When a new job is published:
1. Extract Job Features
   - Required skills, experience, location, salary range
   - Job embedding (BERT vector of full job description)
2. Query Talent Pool
   - Filter: availability != "not_looking"
   - Filter: last_active within 18 months
   - Filter: not currently in an active pipeline for this tenant
3. Score Each Candidate
   ┌──────────────────────────────────────────────────────────┐
   │ Pool Match Score =                                       │
   │   (Skill Match × 0.35) +                                │
   │   (Semantic Similarity × 0.25) +                        │
   │   (Past Performance × 0.20) +                           │
   │   (Recency Factor × 0.10) +                             │
   │   (Engagement Score × 0.10)                              │
   └──────────────────────────────────────────────────────────┘
   Past Performance =
     - Previous interview scores (if any)
     - Previous fraud score (inverse)
     - "Silver Medalist" tag bonus (+15)
   Recency Factor =
     - Last profile update within 3 months → 100
     - 3–6 months → 75
     - 6–12 months → 50
     - 12–18 months → 25
   Engagement Score =
     - Responded to last outreach → +30
     - Updated profile recently → +20
     - Marked "Open to Opportunities" → +50
4. Output
   - Top 10 recommended candidates with scores
   - For each: match breakdown, last interaction, tags, availability
   - One-click "Re-engage" button to send outreach email
7.1.5 Talent Pool UI
┌─────────────────────────────────────────────────────────────┐
│  🧠 AI TALENT POOL RECOMMENDATIONS                         │
│  For: "Senior Backend Engineer" (Published 2 hours ago)     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Sarah Chen          Match: 94%    🏷️ Silver Medalist   │
│     Python, FastAPI, K8s                                    │
│     Last Active: 2 weeks ago    Status: Open to Opps        │
│     Past Interview: 4.2/5       [📧 Re-engage] [👁️ View]   │
│                                                             │
│  2. Marcus Johnson      Match: 89%    🏷️ Strong Culture Fit│
│     Python, Django, AWS                                     │
│     Last Active: 1 month ago    Status: Open to Opps        │
│     Past Interview: N/A         [📧 Re-engage] [👁️ View]   │
│                                                             │
│  3. Priya Sharma        Match: 85%                          │
│     Python, Node.js, PostgreSQL                             │
│     Last Active: 3 months ago   Status: Active              │
│     Past Interview: 3.8/5       [📧 Re-engage] [👁️ View]   │
│                                                             │
│  ... (7 more candidates)                                    │
│                                                             │
│  [View All Pool] [Search Pool] [Pool Analytics]             │
└─────────────────────────────────────────────────────────────┘
7.1.6 Business Impact
Metric	Expected Improvement
Time to fill	Reduce by 35% (candidates already in pool)
Cost per hire	Reduce by 40% (less external sourcing)
Quality of hire	Improve by 20% (pre-vetted candidates)
Candidate re-engagement rate	Target 25%+ response rate
Pool-to-hire conversion	Target 8–12%
✅ 7.2 [NECESSARY] Collaborative Hiring & Team Evaluation System
7.2.1 Overview
A structured collaborative evaluation system that enables hiring teams to collectively assess candidates, provide structured feedback, discuss in real-time, and make consensus-based hiring decisions. This eliminates siloed decision-making and ensures fair, transparent, and bias-reduced hiring.

7.2.2 Problem It Solves
Hiring decisions made by a single person lead to bias
Interviewer feedback is unstructured (just "I liked them")
No mechanism for calibration between interviewers
Hiring managers lack visibility into full evaluation context
No structured way to compare candidates side-by-side
7.2.3 Functional Requirements
ID	Requirement	Priority
COL-01	Assign evaluation panel (2–5 evaluators) per candidate per job	P0
COL-02	Structured evaluation form with configurable criteria per job	P0
COL-03	Anonymous evaluation mode (evaluators can't see each other's scores until all submit)	P0
COL-04	Evaluation criteria categories: Technical, Behavioral, Cultural, Leadership	P0
COL-05	Consensus dashboard — aggregate scores with agreement indicators	P0
COL-06	Side-by-side candidate comparison (2–4 candidates)	P0
COL-07	Discussion thread per candidate (async comments)	P0
COL-08	@mention team members in discussions	P1
COL-09	Voting system: Hire / No Hire / Needs Discussion	P0
COL-10	Calibration report: interviewer scoring patterns (hawk vs dove analysis)	P1
COL-11	Decision audit trail (who voted what, when, with reasoning)	P0
COL-12	Final decision sign-off workflow (requires Hiring Manager approval)	P0
COL-13	Evaluation deadline reminders	P1
COL-14	Real-time notification when all evaluations are submitted	P0
7.2.4 Evaluation Form Structure
json
{
  "job_id": "uuid",
  "evaluation_config": {
    "criteria": [
      {
        "category": "Technical",
        "items": [
          {"name": "Core Technical Skills", "weight": 0.25, "scale": 5},
          {"name": "System Design", "weight": 0.15, "scale": 5},
          {"name": "Code Quality", "weight": 0.10, "scale": 5}
        ]
      },
      {
        "category": "Behavioral",
        "items": [
          {"name": "Communication", "weight": 0.15, "scale": 5},
          {"name": "Problem Solving Approach", "weight": 0.10, "scale": 5},
          {"name": "Adaptability", "weight": 0.05, "scale": 5}
        ]
      },
      {
        "category": "Cultural",
        "items": [
          {"name": "Team Collaboration", "weight": 0.10, "scale": 5},
          {"name": "Growth Mindset", "weight": 0.05, "scale": 5},
          {"name": "Values Alignment", "weight": 0.05, "scale": 5}
        ]
      }
    ],
    "requires_written_feedback": true,
    "anonymous_until_all_submit": true,
    "min_evaluators_for_decision": 3
  }
}
7.2.5 Consensus Dashboard
┌──────────────────────────────────────────────────────────────┐
│  CANDIDATE EVALUATION SUMMARY                                │
│  Alex Rodriguez — Senior Backend Engineer                    │
│  Evaluations: 4/4 Complete ✅                                │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Overall Score: 4.1 / 5.0          Agreement: 🟢 HIGH (87%) │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Criteria          │ E1  │ E2  │ E3  │ E4  │ AVG │ AGR │  │
│  │───────────────────│─────│─────│─────│─────│─────│─────│  │
│  │ Technical Skills  │ 4.5 │ 4.0 │ 4.5 │ 4.0 │ 4.3 │ 🟢  │  │
│  │ System Design     │ 3.5 │ 4.0 │ 3.0 │ 4.0 │ 3.6 │ 🟡  │  │
│  │ Communication     │ 5.0 │ 4.5 │ 5.0 │ 4.5 │ 4.8 │ 🟢  │  │
│  │ Problem Solving   │ 4.0 │ 4.0 │ 4.5 │ 4.0 │ 4.1 │ 🟢  │  │
│  │ Culture Fit       │ 4.0 │ 3.5 │ 4.0 │ 4.5 │ 4.0 │ 🟢  │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  Votes: ✅ Hire (3)  ❌ No Hire (0)  💬 Discuss (1)         │
│                                                              │
│  [📊 Compare with Other Candidates]  [✅ Approve for Offer] │
└──────────────────────────────────────────────────────────────┘
7.2.6 Side-by-Side Comparison
┌─────────────────────────────────────────────────────────────┐
│  CANDIDATE COMPARISON — Senior Backend Engineer             │
├──────────────┬──────────────┬──────────────┬───────────────┤
│              │ Alex R.      │ Sarah C.     │ Marcus J.     │
├──────────────┼──────────────┼──────────────┼───────────────┤
│ Overall      │ 4.1 / 5.0    │ 4.3 / 5.0    │ 3.8 / 5.0     │
│ Match %      │ 89%          │ 94%          │ 82%           │
│ Hiring Score │ 85           │ 91           │ 76            │
│ Fraud Risk   │ 🟢 Low       │ 🟢 Low       │ 🟡 Medium     │
│ Technical    │ 4.3          │ 4.5          │ 3.5           │
│ Behavioral   │ 4.8          │ 4.0          │ 4.2           │
│ Cultural     │ 4.0          │ 4.5          │ 3.8           │
│ Consensus    │ 🟢 87%       │ 🟢 92%       │ 🟡 68%        │
│ Votes        │ 3H / 0N / 1D│ 4H / 0N / 0D│ 2H / 1N / 1D │
├──────────────┼──────────────┼──────────────┼───────────────┤
│ Decision     │ [Offer]      │ [Offer] ⭐   │ [Hold]        │
└──────────────┴──────────────┴──────────────┴───────────────┘
7.2.7 Business Impact
Metric	Expected Improvement
Hiring bias	Reduce by 40% (anonymous, structured evaluation)
Decision quality	Improve by 30% (multi-perspective evaluation)
Interview-to-decision time	Reduce by 25% (parallel async evaluation)
Interviewer calibration	Track and normalize scoring patterns
Candidate experience	Improve via faster, more thoughtful decisions


PRD Part 4 — Database, Security, Performance, Roadmap & Appendix
8️⃣ Database Schema
8.1 Entity Relationship Diagram
has
has
creates
applies (candidate)
conducts (interviewer)
submits
receives
has
schedules
receives
has
tracks
submits
belongs to
receives
uses
receives
TENANTS
USERS
JOBS
APPLICATIONS
INTERVIEWS
EVALUATIONS
PIPELINE_STAGES
AI_SCORES
ACTIVITY_LOGS
CANDIDATES
TALENT_POOL
FEEDBACK
EMAIL_TEMPLATES
NOTIFICATIONS
8.2 Table Definitions
Core Tables
sql
-- Tenants (Multi-tenant root)
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255) UNIQUE,
    plan VARCHAR(50) DEFAULT 'free', -- free, startup, enterprise
    max_users INT DEFAULT 5,
    max_jobs INT DEFAULT 10,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);
-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL, -- super_admin, hr_admin, recruiter, hiring_manager, candidate
    avatar_url TEXT,
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(tenant_id, email)
);
-- Jobs
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    created_by UUID REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    department VARCHAR(100),
    location VARCHAR(255),
    work_type VARCHAR(50), -- onsite, remote, hybrid
    employment_type VARCHAR(50), -- full_time, part_time, contract, internship
    description TEXT NOT NULL,
    responsibilities JSONB DEFAULT '[]',
    required_skills JSONB DEFAULT '[]', -- [{skill, level, weight}]
    preferred_skills JSONB DEFAULT '[]',
    experience_min INT,
    experience_max INT,
    salary_min DECIMAL(12,2),
    salary_max DECIMAL(12,2),
    salary_currency VARCHAR(3) DEFAULT 'USD',
    salary_negotiable BOOLEAN DEFAULT FALSE,
    education_requirement VARCHAR(50),
    application_deadline TIMESTAMP,
    status VARCHAR(50) DEFAULT 'draft', -- draft, published, closed, archived
    applicant_count INT DEFAULT 0,
    published_at TIMESTAMP,
    closed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
-- Candidates (extended profile from parsed resume)
CREATE TABLE candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    resume_url TEXT,
    resume_text TEXT,
    parsed_data JSONB, -- full structured resume data
    skills JSONB DEFAULT '[]',
    experience JSONB DEFAULT '[]',
    education JSONB DEFAULT '[]',
    certifications JSONB DEFAULT '[]',
    total_experience_years DECIMAL(4,1),
    current_company VARCHAR(255),
    current_title VARCHAR(255),
    linkedin_url TEXT,
    portfolio_url TEXT,
    availability_status VARCHAR(50) DEFAULT 'active', -- active, open, not_looking
    tags JSONB DEFAULT '[]',
    talent_pool_opted_in BOOLEAN DEFAULT TRUE,
    last_active_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
-- Applications
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    current_stage VARCHAR(50) DEFAULT 'applied',
    match_score DECIMAL(5,2),
    skill_score DECIMAL(5,2),
    experience_score DECIMAL(5,2),
    education_score DECIMAL(5,2),
    cover_letter TEXT,
    source VARCHAR(100), -- linkedin, job_board, referral, website, talent_pool
    rejection_reason VARCHAR(255),
    rejection_category VARCHAR(100),
    notes TEXT,
    applied_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(job_id, candidate_id)
);
-- Pipeline Stages (custom per job)
CREATE TABLE pipeline_stages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    order_index INT NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    auto_trigger JSONB, -- email template to send on entry
    created_at TIMESTAMP DEFAULT NOW()
);
-- Interviews
CREATE TABLE interviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
    interviewer_id UUID REFERENCES users(id),
    type VARCHAR(50), -- phone_screen, technical, behavioral, panel, final
    scheduled_at TIMESTAMP NOT NULL,
    duration_minutes INT DEFAULT 60,
    location TEXT,
    meeting_link TEXT,
    status VARCHAR(50) DEFAULT 'scheduled', -- scheduled, completed, cancelled, rescheduled
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
-- Feedback (Interview Scorecards)
CREATE TABLE feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    interview_id UUID REFERENCES interviews(id) ON DELETE CASCADE,
    evaluator_id UUID REFERENCES users(id),
    scorecard JSONB NOT NULL, -- {criteria: {score, max, notes}}
    overall_score DECIMAL(3,1),
    recommendation VARCHAR(50), -- strong_hire, hire, lean_hire, lean_no_hire, no_hire
    strengths JSONB DEFAULT '[]',
    concerns JSONB DEFAULT '[]',
    notes TEXT,
    submitted_at TIMESTAMP DEFAULT NOW()
);
-- AI Scores
CREATE TABLE ai_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
    candidate_id UUID REFERENCES candidates(id),
    job_id UUID REFERENCES jobs(id),
    hiring_fit_score DECIMAL(5,2),
    acceptance_probability DECIMAL(5,2),
    retention_6mo DECIMAL(5,2),
    retention_1yr DECIMAL(5,2),
    risk_flag VARCHAR(20), -- low, medium, high
    contributing_factors JSONB,
    fraud_score DECIMAL(5,2),
    fraud_flags JSONB DEFAULT '[]',
    fraud_risk_level VARCHAR(20), -- clean, caution, high_risk
    ai_content_score DECIMAL(5,2),
    plagiarism_score DECIMAL(5,2),
    anomaly_score DECIMAL(5,2),
    computed_at TIMESTAMP DEFAULT NOW()
);
-- Evaluations (Collaborative Hiring)
CREATE TABLE evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
    evaluator_id UUID REFERENCES users(id),
    criteria_scores JSONB NOT NULL,
    overall_score DECIMAL(3,1),
    vote VARCHAR(20), -- hire, no_hire, discuss
    written_feedback TEXT,
    is_anonymous BOOLEAN DEFAULT TRUE,
    submitted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);
-- Discussion Threads
CREATE TABLE discussions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    message TEXT NOT NULL,
    mentions JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT NOW()
);
-- Email Templates
CREATE TABLE email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    body TEXT NOT NULL,
    variables JSONB DEFAULT '[]',
    type VARCHAR(50), -- application_received, interview_invite, rejection, offer, custom
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
-- Email Logs
CREATE TABLE email_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    template_id UUID REFERENCES email_templates(id),
    recipient_id UUID REFERENCES users(id),
    recipient_email VARCHAR(255) NOT NULL,
    subject VARCHAR(500),
    status VARCHAR(50) DEFAULT 'queued', -- queued, sent, delivered, opened, failed
    sent_at TIMESTAMP,
    opened_at TIMESTAMP,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
-- Activity Logs (Audit Trail)
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    entity_type VARCHAR(50) NOT NULL, -- job, application, candidate, interview
    entity_id UUID NOT NULL,
    action VARCHAR(100) NOT NULL, -- created, updated, stage_changed, email_sent
    details JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT NOW()
);
-- Notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    link TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);
-- Talent Pool (for AI Recommender)
CREATE TABLE talent_pool_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    tags JSONB DEFAULT '[]',
    engagement_score DECIMAL(5,2) DEFAULT 0,
    last_outreach_at TIMESTAMP,
    outreach_response BOOLEAN,
    notes TEXT,
    added_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(tenant_id, candidate_id)
);
8.3 Indexes
sql
-- Performance-critical indexes
CREATE INDEX idx_users_tenant_email ON users(tenant_id, email);
CREATE INDEX idx_jobs_tenant_status ON jobs(tenant_id, status);
CREATE INDEX idx_jobs_deadline ON jobs(application_deadline) WHERE status = 'published';
CREATE INDEX idx_applications_job ON applications(job_id, current_stage);
CREATE INDEX idx_applications_candidate ON applications(candidate_id);
CREATE INDEX idx_candidates_skills ON candidates USING GIN(skills);
CREATE INDEX idx_candidates_tenant ON candidates(tenant_id, availability_status);
CREATE INDEX idx_interviews_schedule ON interviews(scheduled_at, status);
CREATE INDEX idx_activity_logs_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX idx_ai_scores_application ON ai_scores(application_id);
9️⃣ API Design Summary
9.1 API Conventions
Convention	Standard
Base URL	/api/v1/
Auth	Bearer JWT in Authorization header
Pagination	?page=1&per_page=20
Filtering	?status=published&department=engineering
Sorting	?sort_by=created_at&order=desc
Search	?search=python+developer
Response format	JSON with {data, meta, errors} envelope
Error format	{error: {code, message, details}}
Rate limiting	100 req/min (authenticated), 20 req/min (public)
9.2 Complete Endpoint Map
Authentication
  POST   /auth/register
  POST   /auth/login
  POST   /auth/refresh
  POST   /auth/forgot-password
  POST   /auth/reset-password
  POST   /auth/verify-email
  GET    /auth/me
  PUT    /auth/me
  POST   /auth/logout
Jobs
  POST   /jobs
  GET    /jobs
  GET    /jobs/{id}
  PUT    /jobs/{id}
  DELETE /jobs/{id}
  POST   /jobs/{id}/publish
  POST   /jobs/{id}/close
  POST   /jobs/{id}/duplicate
  GET    /jobs/public
  GET    /jobs/{id}/analytics
  GET    /jobs/{id}/pipeline
Candidates
  GET    /candidates
  GET    /candidates/{id}
  PUT    /candidates/{id}
  POST   /candidates/{id}/parse-resume
  GET    /candidates/{id}/applications
  GET    /candidates/{id}/timeline
Applications
  POST   /applications
  GET    /applications
  GET    /applications/{id}
  PUT    /applications/{id}/stage
  GET    /applications/{id}/scores
  POST   /applications/bulk-upload
Interviews
  POST   /interviews
  GET    /interviews
  GET    /interviews/{id}
  PUT    /interviews/{id}
  DELETE /interviews/{id}
  POST   /interviews/{id}/feedback
Evaluations (Collaborative Hiring)
  POST   /evaluations
  GET    /evaluations/application/{id}
  GET    /evaluations/consensus/{application_id}
  POST   /evaluations/{id}/vote
  GET    /evaluations/compare?candidates=id1,id2,id3
Discussions
  POST   /discussions
  GET    /discussions/application/{id}
Talent Pool
  GET    /talent-pool
  GET    /talent-pool/recommendations/{job_id}
  POST   /talent-pool/{candidate_id}/re-engage
  PUT    /talent-pool/{candidate_id}/tags
Analytics
  GET    /analytics/overview
  GET    /analytics/funnel/{job_id}
  GET    /analytics/time-to-hire
  GET    /analytics/sourcing
  GET    /analytics/recruiter-performance
  GET    /analytics/talent-pool
  GET    /analytics/export?format=csv
Email
  GET    /email-templates
  POST   /email-templates
  PUT    /email-templates/{id}
  POST   /email/send
  POST   /email/bulk-send
  GET    /email/logs
Admin (Super Admin)
  GET    /admin/tenants
  POST   /admin/tenants
  PUT    /admin/tenants/{id}
  GET    /admin/platform-analytics
  GET    /admin/system-health
Notifications
  GET    /notifications
  PUT    /notifications/{id}/read
  PUT    /notifications/read-all
🔟 Security Requirements
Requirement	Implementation	Priority
JWT Authentication	Access token (15 min) + Refresh token (7 days)	P0
RBAC	Role-based middleware on every endpoint	P0
Password Security	bcrypt hashing, min 8 chars, complexity rules	P0
Encrypted File Storage	AES-256 encryption for stored resumes	P0
Rate Limiting	100 req/min authenticated, 20 req/min public	P0
Input Validation	Pydantic models, SQL injection prevention	P0
CORS Configuration	Whitelist allowed origins	P0
Audit Logs	Every data mutation logged with user, IP, timestamp	P0
GDPR Compliance	Data deletion on request, consent tracking, data export	P0
XSS Prevention	Content Security Policy headers, output encoding	P0
CSRF Protection	SameSite cookies, CSRF tokens for forms	P0
Secure Headers	HSTS, X-Frame-Options, X-Content-Type-Options	P0
Account Lockout	5 failed attempts → 30 min lockout	P0
Session Management	View/revoke active sessions	P1
Two-Factor Auth	TOTP-based 2FA	P1
Vulnerability Scanning	Automated dependency scanning (Dependabot / Snyk)	P1
1️⃣1️⃣ Performance Requirements
Metric	Target	Measurement
Resume Parsing	< 5 seconds per resume	Backend processing time
Search Results	< 2 seconds	API response time
Page Load	< 3 seconds (FCP)	Lighthouse score
Dashboard Load	< 2 seconds	API response + render
Concurrent Users	500+ per tenant	Load testing
Candidate Capacity	10,000+ per tenant	Database scaling
API Response (p95)	< 500ms	Backend monitoring
Uptime	99.5%	Infrastructure monitoring
AI Scoring	< 10 seconds per candidate	Background processing
Bulk Upload	50 resumes in < 60 seconds	Background processing
WebSocket Latency	< 200ms	Real-time updates
1️⃣2️⃣ Non-Functional Requirements
Category	Requirement
Scalability	Horizontal scaling of backend and AI services via Docker
Maintainability	Modular codebase, 80%+ test coverage, comprehensive API docs
Accessibility	WCAG 2.1 AA compliance for all UI components
Internationalization	UTF-8 support, date/currency formatting, RTL-ready
Observability	Structured logging, distributed tracing, metrics dashboards
Backup	Daily automated database backups, 30-day retention
Documentation	Auto-generated API docs (Swagger/OpenAPI), developer guide
Browser Support	Chrome, Firefox, Safari, Edge (last 2 versions)
Mobile Responsive	Fully responsive for candidate-facing pages
1️⃣3️⃣ Development Milestones & Roadmap
Phase 1: Foundation (Weeks 1–3)
Task	Deliverable
Project setup	React + FastAPI + PostgreSQL + Docker
Authentication system	JWT + RBAC + multi-tenant
Database schema	All core tables with migrations
User management	Registration, login, profiles, roles
Phase 2: Core Hiring Features (Weeks 4–6)
Task	Deliverable
Job management	Full CRUD + publish/close lifecycle
Resume upload & parsing	PDF/DOCX parsing with spaCy
AI ranking engine	TF-IDF + BERT scoring
Skill matching	Match %, gap analysis, suggestions
Phase 3: Pipeline & Interviews (Weeks 7–8)
Task	Deliverable
Kanban pipeline	Drag-and-drop, stage transitions
Interview scheduling	Calendar, invites, reminders
Feedback & scorecards	Structured evaluation forms
Email automation	Templates, triggers, logs
Phase 4: Advanced AI (Weeks 9–10)
Task	Deliverable
Predictive hiring score	ML model, score display
Fraud detection	AI content + anomaly detection
Talent pool recommender	Pool search, AI recommendations
Phase 5: Collaboration & Analytics (Weeks 11–12)
Task	Deliverable
Collaborative evaluation	Panel, consensus, comparison
Analytics dashboard	All metrics, charts, exports
Notification system	Real-time + email notifications
Phase 6: Polish & Deploy (Weeks 13–14)
Task	Deliverable
UI/UX polish	Animations, responsiveness, accessibility
Security hardening	Audit, penetration testing
Performance optimization	Caching, query optimization
CI/CD pipeline	Automated testing + deployment
Documentation	API docs, user guide, deployment guide
1️⃣4️⃣ Risk Assessment
Risk	Impact	Probability	Mitigation
AI model accuracy below target	High	Medium	Start with TF-IDF baseline, progressively add BERT; use human feedback loop
Resume parsing fails on complex formats	Medium	High	Support PDF/DOCX only; fallback to manual entry; test with 500+ real resumes
Multi-tenant data leakage	Critical	Low	Schema isolation, tenant middleware tests, penetration testing
Performance degradation at scale	High	Medium	Redis caching, DB indexing, horizontal scaling, load testing
GDPR non-compliance	High	Low	Privacy by design, consent tracking, data deletion API
AI bias in scoring	High	Medium	Regular model auditing, diverse training data, explainability features
Scope creep	Medium	High	Strict phase-based delivery, MVP-first approach
1️⃣5️⃣ Appendix
A. Complete Feature Checklist
#	Feature	Type	Priority	Phase
1	JWT Authentication + RBAC	Core	P0	1
2	Multi-Tenant Architecture	Core	P0	1
3	Job Management (CRUD + Lifecycle)	Core	P0	2
4	Resume Parsing (PDF/DOCX → Structured Data)	Core	P0	2
5	AI Candidate Ranking (TF-IDF + BERT)	Core	P0	2
6	Skill Matching + Gap Analysis	Core	P0	2
7	Hiring Pipeline (Kanban + Drag-Drop)	Core	P0	3
8	Interview Scheduling + Calendar	Core	P0	3
9	Interview Feedback & Scorecards	Core	P0	3
10	Predictive Hiring Score (ML Model)	Advanced	P0	4
11	Resume Fraud & AI Content Detection	Advanced	P0	4
12	AI Talent Pool & Passive Candidate Recommender	Advanced (NEW)	P0	4
13	Automated Email & Workflow Automation	Necessary	P0	3
14	Analytics & Recruitment Dashboard	Necessary	P0	5
15	Collaborative Hiring & Team Evaluation	Necessary (NEW)	P0	5
16	Notification System (Real-time + Email)	Necessary	P0	5
17	OAuth2 (Google, LinkedIn)	Enhancement	P1	6
18	Two-Factor Authentication	Enhancement	P1	6
19	Candidate Self-Scheduling	Enhancement	P2	6
20	Diversity Metrics Dashboard	Enhancement	P2	6
B. Glossary
Term	Definition
ATS	Applicant Tracking System — software to manage recruitment process
NLP	Natural Language Processing — AI for understanding text
BERT	Bidirectional Encoder Representations from Transformers — deep learning NLP model
TF-IDF	Term Frequency–Inverse Document Frequency — text similarity metric
RBAC	Role-Based Access Control — permissions system
JWT	JSON Web Token — stateless authentication mechanism
GDPR	General Data Protection Regulation — EU data privacy law
Silver Medalist	A strong candidate who was not selected for one role but is suitable for future roles
Passive Candidate	Someone not actively job searching but open to opportunities
Kanban	Visual workflow management method using columns and cards
Multi-Tenant	Single software instance serving multiple organizations with isolated data
Document Prepared By: AI Assistant
Date: March 1, 2026
Version: 1.0
Status: Ready for Review