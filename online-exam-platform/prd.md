# 📄 Product Requirements Document (PRD)

## 🧠 Online Examination & Proctoring Platform

| Field | Detail |
|---|---|
| **Version** | 1.0 |
| **Date** | February 27, 2026 |
| **Project Level** | Intermediate–Advanced (8.5/10) |
| **Tech Stack** | React.js · Node.js (Express) · PostgreSQL · WebRTC · JWT |
| **Status** | Draft |

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Objectives & Success Metrics](#2-objectives--success-metrics)
3. [User Roles & Permissions](#3-user-roles--permissions)
4. [Functional Requirements](#4-functional-requirements)
   - 4.1 [Authentication & User Management](#41-authentication--user-management)
   - 4.2 [Question Bank Management (Admin/Examiner)](#42-question-bank-management-adminexaminer)
   - 4.3 [Exam Management System](#43-exam-management-system)
   - 4.4 [Exam Attempt Flow (Student)](#44-exam-attempt-flow-student)
   - 4.5 [Proctoring System (WebRTC)](#45-proctoring-system-webrtc)
   - 4.6 [AI-Based Suspicious Activity Scoring](#46-ai-based-suspicious-activity-scoring)
   - 4.7 [Adaptive Question Difficulty Engine](#47-adaptive-question-difficulty-engine)
   - 4.8 [Automated & Manual Evaluation](#48-automated--manual-evaluation)
   - 4.9 [Results & Analytics Dashboards](#49-results--analytics-dashboards)
   - 4.10 [🆕 Plagiarism & Answer Similarity Detection](#410--plagiarism--answer-similarity-detection)
   - 4.11 [🆕 Scheduled Notifications & Exam Reminders](#411--scheduled-notifications--exam-reminders)
5. [Non-Functional Requirements](#5-non-functional-requirements)
6. [Database Schema (High-Level)](#6-database-schema-high-level)
7. [API Endpoints Overview](#7-api-endpoints-overview)
8. [UI/UX Wireframe Descriptions](#8-uiux-wireframe-descriptions)
9. [Phased Implementation Roadmap](#9-phased-implementation-roadmap)
10. [Risk Matrix](#10-risk-matrix)
11. [Appendix](#11-appendix)

---

## 1. Executive Summary

### 1.1 Product Vision

To develop a **secure, scalable, and intelligent** online examination platform that empowers educational institutions, coaching centers, corporate training programs, and certification bodies to conduct remote exams with:

- **Automated grading** for objective questions
- **Webcam-based proctoring** with face detection and tab-switch monitoring
- **AI-driven cheating risk scoring** to flag suspicious behavior
- **Adaptive difficulty** that tailors question difficulty in real time
- **Comprehensive analytics** for students, examiners, and administrators

### 1.2 Target Users

| Audience | Use Case |
|---|---|
| **Educational Institutes** | Semester exams, entrance tests, quizzes |
| **Coaching Centers** | Mock tests, practice exams, progress tracking |
| **Corporate Training Programs** | Skill assessments, compliance certifications |
| **Certification Bodies** | Proctored certification exams at scale |

### 1.3 Problem Statement

Traditional examination systems suffer from:
- **Cheating vulnerabilities** in remote settings
- **High manual evaluation effort** for large-scale exams
- **Lack of real-time monitoring** capabilities
- **Poor analytics** for identifying weak areas and performance trends
- **Rigid question delivery** that doesn't adapt to student ability

### 1.4 Proposed Solution

A full-stack web platform providing end-to-end exam lifecycle management — from question creation to result analytics — with built-in AI proctoring, adaptive difficulty, and plagiarism detection.

---

## 2. Objectives & Success Metrics

### 2.1 Core Objectives

| # | Objective | Priority |
|---|---|---|
| O1 | Enable secure, tamper-resistant online examinations | 🔴 Critical |
| O2 | Reduce manual evaluation effort by ≥ 80% through auto-grading | 🔴 Critical |
| O3 | Monitor students remotely using webcam & browser events | 🔴 Critical |
| O4 | Detect and flag suspicious activity with AI scoring | 🟡 High |
| O5 | Provide detailed, exportable result analytics | 🟡 High |
| O6 | Support adaptive question difficulty | 🟢 Medium |
| O7 | Detect answer plagiarism across students | 🟢 Medium |

### 2.2 Key Performance Indicators (KPIs)

| Metric | Target |
|---|---|
| Exam auto-grading accuracy | ≥ 99.5% for objective questions |
| Proctoring false-positive rate | ≤ 5% |
| Concurrent user support | 200–500 users |
| System uptime | 99.9% |
| Avg. page load time | < 2 seconds |
| Answer auto-save interval | Every 10 seconds |

---

## 3. User Roles & Permissions

### 3.1 Role Definitions

| Role | Description |
|---|---|
| **Admin** | Full system control — manages users, exams, questions, analytics, and proctoring reports |
| **Examiner** | Creates and manages exams, builds question banks, reviews results |
| **Student** | Attempts assigned exams, views own results and performance history |

### 3.2 Permission Matrix

| Feature | Admin | Examiner | Student |
|---|---|---|---|
| Create / Edit / Delete users | ✅ | ❌ | ❌ |
| Assign roles | ✅ | ❌ | ❌ |
| Block / Unblock users | ✅ | ❌ | ❌ |
| Reset any user's password | ✅ | ❌ | ❌ |
| Create / Edit / Delete questions (unlimited) | ✅ | ✅ | ❌ |
| Import questions (bulk CSV/Excel) | ✅ | ✅ | ❌ |
| Create / Configure exams | ✅ | ✅ | ❌ |
| Assign exams to students | ✅ | ✅ | ❌ |
| View all student results | ✅ | ✅ | ❌ |
| View proctoring logs & risk scores | ✅ | ✅ (own exams) | ❌ |
| View suspicious activity dashboard | ✅ | ✅ (own exams) | ❌ |
| Export results (CSV/PDF) | ✅ | ✅ | ❌ |
| Attempt exams | ❌ | ❌ | ✅ |
| View own results & analytics | ❌ | ❌ | ✅ |
| View own risk score | ❌ | ❌ | ✅ |
| Manage system settings | ✅ | ❌ | ❌ |

### 3.3 Authentication & Authorization

| Feature | Implementation |
|---|---|
| Login mechanism | JWT-based authentication |
| Password storage | bcrypt hashing (salt rounds: 12) |
| Token lifecycle | Access token: 15 min; Refresh token: 7 days |
| Role-based routing | Middleware validates role before dashboard access |
| Session management | Single-session enforcement (optional per exam) |
| Password reset | Email-based OTP or magic link |

---

## 4. Functional Requirements

---

### 4.1 Authentication & User Management

#### 4.1.1 Registration & Login

| Feature | Details |
|---|---|
| **Signup** | Name, email, password; default role = Student |
| **Login** | Email + password → JWT access + refresh tokens |
| **Forgot Password** | Email OTP verification → password reset |
| **Role Assignment** | Admin assigns Examiner/Admin roles post-registration |
| **Profile Management** | Users can update name, avatar, and password |

#### 4.1.2 Admin User Management

> [!IMPORTANT]
> The Admin has **full CRUD** control over all user accounts.

| Action | Description |
|---|---|
| **Create User** | Admin creates users with pre-assigned roles |
| **Edit User** | Update name, email, role |
| **Delete User** | Soft-delete (mark inactive) with confirmation dialog |
| **Block / Unblock** | Temporarily disable login for a user |
| **Reset Password** | Admin can force-reset any user's password |
| **View User List** | Paginated, searchable, filterable by role/status |

---

### 4.2 Question Bank Management (Admin/Examiner)

> [!IMPORTANT]
> Admins and Examiners can add, edit, and delete an **unlimited number of questions**. All questions and answers are **persisted to the database** immediately upon save.

#### 4.2.1 Question Types Supported

| Type | Auto-Gradable | Description |
|---|---|---|
| **MCQ (Single Answer)** | ✅ | 4 options, 1 correct |
| **MCQ (Multiple Answers)** | ✅ | 4+ options, multiple correct |
| **True / False** | ✅ | Binary choice |
| **Short Answer** | ❌ (Manual) | Free-text response (≤ 500 chars) |
| **Fill in the Blank** | ✅ | Exact-match or keyword-match grading |

#### 4.2.2 Question Attributes

| Attribute | Type | Required | Description |
|---|---|---|---|
| `question_text` | Text (rich text / Markdown) | ✅ | The question body |
| `question_type` | Enum | ✅ | MCQ, True/False, Short Answer, Fill-in-the-Blank |
| `options` | JSON Array | ✅ (for MCQ/TF) | List of options with `text` and `is_correct` flag |
| `correct_answer` | Text | ✅ | For auto-grading |
| `difficulty_level` | Enum (Easy, Medium, Hard) | ✅ | Used by adaptive engine |
| `subject` | String | ✅ | Subject/topic tag |
| `category` | String | Optional | Sub-category / chapter |
| `marks` | Integer | ✅ | Points for correct answer |
| `negative_marks` | Float | Optional | Penalty for wrong answer |
| `explanation` | Text | Optional | Shown in result review |
| `image_url` | URL | Optional | Attach image to question |
| `created_by` | FK (User) | Auto | Question author |
| `created_at` | Timestamp | Auto | Creation timestamp |
| `updated_at` | Timestamp | Auto | Last update timestamp |

#### 4.2.3 Question CRUD Operations

| Operation | Description |
|---|---|
| **Add Question** | Rich form with live preview; supports images and formatting |
| **Edit Question** | Inline edit or full-page editor; version history maintained |
| **Delete Question** | Soft-delete with confirmation; prevents deletion if linked to active exam |
| **Duplicate Question** | Clone a question for quick variation creation |
| **Bulk Import** | Upload CSV/Excel with mapped columns → batch insert |
| **Bulk Export** | Download question bank as CSV/Excel |
| **Search & Filter** | Filter by subject, difficulty, type, author, date range |
| **Tagging** | Add custom tags for organization |

#### 4.2.4 Answer Management

| Feature | Details |
|---|---|
| **Unlimited Options** | MCQs support 2–10 options (configurable) |
| **Correct Answer Marking** | Toggle correct answer(s) per question |
| **Answer Explanation** | Optional explanation shown post-exam |
| **Answer Validation** | System validates at least one correct answer exists before save |
| **Auto-Save** | Changes are auto-saved as drafts every 5 seconds |
| **Publish / Draft States** | Questions can be saved as drafts before publishing to exam pool |

#### 4.2.5 Question Bank Organization

```
Question Bank
├── Subject: Mathematics
│   ├── Category: Algebra
│   │   ├── Easy (12 questions)
│   │   ├── Medium (8 questions)
│   │   └── Hard (5 questions)
│   └── Category: Calculus
│       ├── Easy (10 questions)
│       └── Medium (7 questions)
├── Subject: Physics
│   └── ...
└── Subject: Computer Science
    └── ...
```

---

### 4.3 Exam Management System

#### 4.3.1 Exam Configuration

| Parameter | Type | Description |
|---|---|---|
| `title` | String | Exam name |
| `description` | Text | Exam instructions and details |
| `subject_category` | String | Primary subject |
| `duration_minutes` | Integer | Total exam time |
| `total_marks` | Integer | Auto-calculated from questions |
| `passing_percentage` | Float | Minimum % to pass |
| `negative_marking` | Boolean | Enable/disable negative marks |
| `negative_mark_value` | Float | Deduction per wrong answer (if enabled) |
| `start_datetime` | Timestamp | Exam window opens |
| `end_datetime` | Timestamp | Exam window closes |
| `max_attempts` | Integer | Max allowed attempts per student |
| `exam_password` | String (optional) | Password to enter exam |
| `shuffle_questions` | Boolean | Randomize question order |
| `shuffle_options` | Boolean | Randomize option order within MCQs |
| `show_result_immediately` | Boolean | Show score right after submission |
| `allow_review` | Boolean | Allow students to review answers post-exam |
| `adaptive_mode` | Boolean | Enable adaptive difficulty |
| `proctoring_enabled` | Boolean | Enable webcam proctoring |
| `fullscreen_required` | Boolean | Force fullscreen mode |

#### 4.3.2 Question Assignment to Exam

| Method | Description |
|---|---|
| **Manual Selection** | Hand-pick questions from question bank |
| **Random Selection** | Auto-pick N questions per subject/difficulty |
| **Section-Based** | Define sections (e.g., Section A: 10 easy MCQs, Section B: 5 hard short answers) |
| **Adaptive Pool** | Define a pool; system picks dynamically based on student performance |

#### 4.3.3 Exam Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Draft
    Draft --> Published : Publish Exam
    Published --> Active : Start DateTime Reached
    Active --> Closed : End DateTime Reached
    Active --> Closed : Manual Close by Admin
    Closed --> Results_Published : Grade & Publish
    Results_Published --> Archived : Archive
    Published --> Draft : Unpublish
```

#### 4.3.4 Exam Logic Rules

| Rule | Behavior |
|---|---|
| **Timer** | Countdown timer visible to student; auto-submits at 0:00 |
| **Question Navigation** | Students can navigate freely or sequentially (configurable) |
| **Mark for Review** | Students can flag questions for later review |
| **Answer Auto-Save** | Every 10 seconds, answers are persisted to server |
| **Refresh Recovery** | On page reload, exam state is restored from server |
| **Multi-Device Prevention** | Only one active session per exam attempt per student |

---

### 4.4 Exam Attempt Flow (Student)

#### 4.4.1 Pre-Exam

1. Student views list of assigned/available exams
2. Clicks "Start Exam"
3. Enters exam password (if required)
4. System checks: webcam permission, fullscreen mode, browser compatibility
5. Pre-exam instruction screen with rules
6. Student confirms readiness → Exam begins

#### 4.4.2 During Exam

```mermaid
flowchart TD
    A[Exam Starts] --> B[Load Question]
    B --> C{Answer Question}
    C --> D[Auto-Save Answer]
    D --> E{More Questions?}
    E -->|Yes| B
    E -->|No| F[Review Panel]
    F --> G{Submit Exam?}
    G -->|Yes| H[Final Submission]
    G -->|No| B
    H --> I[Show Result / Thank You]

    B --> J[Proctoring Active]
    J --> K[Face Detection]
    J --> L[Tab Switch Detection]
    J --> M[Fullscreen Check]
```

#### 4.4.3 Post-Exam

- Immediate score display (if enabled)
- Detailed result breakdown (after results are published)
- Review correct/incorrect answers (if allowed)

---

### 4.5 Proctoring System (WebRTC)

#### 4.5.1 Monitoring Features

| Feature | Technology | Description |
|---|---|---|
| **Live Webcam Capture** | WebRTC + `getUserMedia` | Continuous video stream from student's camera |
| **Face Detection** | TensorFlow.js / face-api.js | Detect presence and count of faces |
| **Multiple Face Alert** | face-api.js | Trigger alert if > 1 face detected |
| **Face Not Visible** | face-api.js | Alert if no face detected for > 5 seconds |
| **Tab Switch Detection** | `visibilitychange` API | Log every tab switch event |
| **Fullscreen Enforcement** | Fullscreen API | Warn/terminate if student exits fullscreen |
| **Copy-Paste Blocking** | JS Event Listeners | Disable right-click, Ctrl+C/V, text selection |
| **Screenshot Detection** | `PrintScreen` key listener | Log screenshot attempts |

#### 4.5.2 Proctor Event Log Schema

| Field | Type | Description |
|---|---|---|
| `id` | UUID | Unique event ID |
| `exam_attempt_id` | FK | Links to student's exam attempt |
| `timestamp` | Timestamp | When the event occurred |
| `event_type` | Enum | `TAB_SWITCH`, `FACE_NOT_DETECTED`, `MULTIPLE_FACES`, `FULLSCREEN_EXIT`, `SCREENSHOT_ATTEMPT` |
| `risk_level` | Enum | `LOW`, `MEDIUM`, `HIGH` |
| `details` | JSON | Additional metadata (e.g., duration of face absence) |
| `snapshot_url` | URL (optional) | Screenshot at time of event |

#### 4.5.3 Proctor Configuration (Per Exam)

| Setting | Default | Description |
|---|---|---|
| `enable_webcam` | `true` | Require webcam |
| `enable_face_detection` | `true` | Run face detection |
| `max_tab_switches` | `3` | Auto-terminate exam after N tab switches |
| `face_absence_threshold_sec` | `10` | Seconds before flagging face absence |
| `enable_fullscreen` | `true` | Require fullscreen |
| `auto_terminate_on_violation` | `false` | Auto-submit exam on critical violation |

---

### 4.6 AI-Based Suspicious Activity Scoring

> [!WARNING]
> Students with a risk score ≥ 61 are **automatically flagged** for admin review. Exams may be invalidated at admin discretion.

#### 4.6.1 Risk Score Formula

```
RiskScore = (0.4 × NormalizedTabSwitchCount) 
          + (0.3 × NormalizedFaceMissingDuration) 
          + (0.3 × NormalizedMultiFaceCount)
```

**Normalization:**

| Factor | Normalization Logic |
|---|---|
| `TabSwitchCount` | `min(count / max_allowed × 100, 100)` |
| `FaceMissingDuration` | `min(total_seconds / exam_duration × 100, 100)` |
| `MultiFaceCount` | `min(count / threshold × 100, 100)` |

#### 4.6.2 Risk Levels

| Score Range | Level | Action |
|---|---|---|
| **0 – 30** | 🟢 Low | No action |
| **31 – 60** | 🟡 Medium | Review recommended |
| **61 – 100** | 🔴 High (Flagged) | Auto-flagged; admin review required |

#### 4.6.3 Admin Suspicious Activity Dashboard

| Component | Description |
|---|---|
| **Risk Score Card** | Per-student risk score with color-coded badge |
| **Flagged Students List** | Sortable table of high-risk students |
| **Event Timeline** | Chronological log of all proctor events per student |
| **Snapshot Gallery** | Captured screenshots at violation moments |
| **Comparative View** | Compare risk scores across all students in an exam |
| **Export Report** | Download proctoring report as PDF/CSV |

---

### 4.7 Adaptive Question Difficulty Engine

#### 4.7.1 Algorithm

```
IF student answers correctly:
    NextDifficulty = min(CurrentDifficulty + 1, 3)
ELSE:
    NextDifficulty = max(CurrentDifficulty - 1, 1)
```

| Level | Label |
|---|---|
| 1 | Easy |
| 2 | Medium |
| 3 | Hard |

#### 4.7.2 Selection Logic

```mermaid
flowchart TD
    A[Student Answers Question] --> B{Correct?}
    B -->|Yes| C[Increase Difficulty +1]
    B -->|No| D[Decrease Difficulty -1]
    C --> E[Query Question Pool]
    D --> E
    E --> F{Same Subject + New Difficulty?}
    F -->|Found| G[Serve Next Question]
    F -->|Not Found| H[Serve Same Difficulty]
    G --> A
    H --> A
```

#### 4.7.3 Constraints

- Difficulty stays within bounds [1, 3]
- Questions are never repeated within the same attempt
- System selects from the **same subject pool**
- All students receive the **same total number of questions**
- Final scoring adjusts for difficulty weighting:

```
WeightedScore = Σ (marks × difficulty_multiplier)
```

| Difficulty | Multiplier |
|---|---|
| Easy | 1.0× |
| Medium | 1.5× |
| Hard | 2.0× |

---

### 4.8 Automated & Manual Evaluation

#### 4.8.1 Auto-Graded Question Types

| Type | Grading Logic |
|---|---|
| **MCQ (Single)** | Exact match with correct option |
| **MCQ (Multiple)** | Full marks only if all correct options selected (partial marking optional) |
| **True/False** | Exact match |
| **Fill in the Blank** | Case-insensitive exact match or keyword match |

#### 4.8.2 Manual Grading (Short Answers)

| Feature | Description |
|---|---|
| **Grading Queue** | Examiner sees list of ungraded short answers |
| **Inline Grading** | View question, student answer, model answer side-by-side |
| **Marks Input** | Assign marks (0 to max) with optional feedback |
| **Batch Actions** | Mark all identical answers at once |
| **AI Suggestion** | System suggests a score based on keyword matching (optional) |

#### 4.8.3 Result Generation

```
SectionScore = Σ (correct_answers × marks) - Σ (wrong_answers × negative_marks)
TotalScore = Σ SectionScores
Percentage = (TotalScore / TotalMarks) × 100
Result = Percentage >= PassingPercentage ? "PASS" : "FAIL"
```

---

### 4.9 Results & Analytics Dashboards

#### 4.9.1 Student Dashboard

| Widget | Description |
|---|---|
| **Score History** | Line chart of scores across exams over time |
| **Subject Performance** | Radar chart showing strength across subjects |
| **Attempt Details** | Per-exam breakdown: score, time taken, questions attempted |
| **Risk Score** | Student's own proctoring risk score per exam |
| **Improvement Tips** | AI-generated suggestions based on weak areas |
| **Leaderboard** | Optional rank among peers (if enabled by admin) |

#### 4.9.2 Admin / Examiner Dashboard

| Widget | Description |
|---|---|
| **Exam Summary Cards** | Total exams, active exams, upcoming exams |
| **Average Score** | Per-exam average with trend line |
| **Topper List** | Top 10 students per exam |
| **Pass/Fail Distribution** | Pie chart per exam |
| **Difficulty Analysis** | How students performed at each difficulty level |
| **Question Analysis** | Per-question accuracy rate, avg. time spent |
| **Suspicious Activity Report** | Flagged students with risk scores |
| **Export** | Download results as CSV, Excel, or PDF |

#### 4.9.3 System-Wide Analytics (Admin Only)

| Metric | Description |
|---|---|
| **Total Users** | Breakdown by role |
| **Total Exams** | Created, active, completed, archived |
| **Platform Usage** | Daily/weekly/monthly active users |
| **Question Bank Stats** | Total questions by subject, difficulty, type |
| **Proctoring Summary** | Total flags, average risk score |

---

### 4.10 🆕 Plagiarism & Answer Similarity Detection

> [!NOTE]
> This is an **advanced feature** that detects when multiple students provide suspiciously similar short-answer responses, indicating potential collusion or copying.

#### 4.10.1 Overview

For short-answer questions, the system compares responses across all students who attempted the same exam and flags pairs with high textual similarity.

#### 4.10.2 Detection Logic

| Method | Description |
|---|---|
| **Cosine Similarity** | TF-IDF vectorization of answers → cosine similarity score |
| **Jaccard Index** | Word-set overlap ratio |
| **Levenshtein Distance** | Character-level edit distance (catches minor rewording) |
| **Threshold** | Similarity ≥ 85% → Flagged for review |

#### 4.10.3 Similarity Report

| Field | Description |
|---|---|
| **Student A** | First student in the pair |
| **Student B** | Second student in the pair |
| **Question** | The question both answered |
| **Similarity %** | Computed similarity score |
| **Answer A** | Student A's response (highlighted differences) |
| **Answer B** | Student B's response (highlighted differences) |
| **Verdict** | `CLEAR`, `REVIEW`, `FLAGGED` |

#### 4.10.4 Admin Actions

- View all flagged pairs
- Side-by-side answer comparison with diff highlighting
- Mark as **Confirmed Plagiarism** → Invalidate both attempts
- Mark as **False Positive** → Dismiss
- Export plagiarism report

---

### 4.11 🆕 Scheduled Notifications & Exam Reminders

> [!NOTE]
> This feature ensures students never miss an exam and keeps all stakeholders informed through automated, intelligent notifications.

#### 4.11.1 Notification Channels

| Channel | Technology | Use Case |
|---|---|---|
| **In-App** | WebSocket (Socket.IO) | Real-time bell icon notifications |
| **Email** | Nodemailer + SMTP / SendGrid | Exam reminders, results published, account actions |
| **Browser Push** | Web Push API + Service Worker | Upcoming exam alerts even when app is closed |

#### 4.11.2 Notification Triggers

| Event | Recipients | Timing | Channel |
|---|---|---|---|
| **Exam Assigned** | Students | Immediately | In-App, Email |
| **Exam Reminder** | Students | 24h, 1h, 15min before start | In-App, Email, Push |
| **Exam Started** | Students | At start time | In-App, Push |
| **Exam Ending Soon** | Students (in exam) | 5 min before end | In-App (toast) |
| **Results Published** | Students | Immediately | In-App, Email, Push |
| **Flagged for Cheating** | Admin | Immediately | In-App, Email |
| **New User Registered** | Admin | Immediately | In-App |
| **Password Reset** | User | Immediately | Email |
| **Exam Submitted** | Student, Examiner | Immediately | In-App |
| **Manual Grading Complete** | Student | Immediately | In-App, Email |

#### 4.11.3 Notification Preferences

Students and examiners can configure:

| Setting | Options |
|---|---|
| **Email notifications** | Enable / Disable per category |
| **Push notifications** | Enable / Disable |
| **Reminder timing** | Choose reminder intervals (24h, 12h, 1h, 15min) |
| **Quiet hours** | Set hours during which non-urgent notifications are muted |

#### 4.11.4 Notification Schema

| Field | Type | Description |
|---|---|---|
| `id` | UUID | Unique notification ID |
| `user_id` | FK | Recipient |
| `type` | Enum | `EXAM_ASSIGNED`, `REMINDER`, `RESULT_PUBLISHED`, etc. |
| `title` | String | Notification title |
| `message` | Text | Notification body |
| `read` | Boolean | Read/unread status |
| `channel` | Enum | `IN_APP`, `EMAIL`, `PUSH` |
| `scheduled_at` | Timestamp | When to deliver |
| `sent_at` | Timestamp | Actual delivery time |
| `created_at` | Timestamp | Creation time |

---

## 5. Non-Functional Requirements

### 5.1 Security

| Requirement | Implementation |
|---|---|
| **Authentication** | JWT with access + refresh tokens |
| **Password Security** | bcrypt hashing (12 salt rounds) |
| **Data Encryption** | HTTPS/TLS in transit; AES-256 at rest for sensitive data |
| **IP Logging** | Log IP address for every login and exam attempt |
| **Rate Limiting** | Express-rate-limit: 100 req/min per IP for API; 5 attempts/min for login |
| **CORS** | Whitelist only trusted frontend origins |
| **Input Validation** | Server-side validation with `Joi` or `express-validator` |
| **SQL Injection Prevention** | Parameterized queries via ORM (Sequelize/Prisma) |
| **XSS Protection** | Helmet.js middleware; sanitize user inputs |
| **CSRF Protection** | CSRF tokens for state-changing requests |

### 5.2 Performance

| Requirement | Target |
|---|---|
| **Concurrent Users** | 200–500 simultaneous exam takers |
| **API Response Time** | P95 < 200ms for standard endpoints |
| **WebSocket Latency** | < 100ms for real-time notifications |
| **Proctoring Stream** | < 500ms latency for face detection feedback |
| **Database Query Time** | P95 < 50ms with proper indexing |
| **Frontend Load Time** | First Contentful Paint < 1.5s |

### 5.3 Scalability

| Strategy | Description |
|---|---|
| **Modular Backend** | Controller → Service → Repository pattern |
| **Database Indexing** | Indexes on frequently queried columns (user_id, exam_id, timestamps) |
| **Connection Pooling** | PostgreSQL connection pool (min: 5, max: 20) |
| **Caching** | Redis for session data, exam configs, leaderboard |
| **File Storage** | S3-compatible storage for images, snapshots |
| **Horizontal Scaling** | Stateless API servers behind load balancer |
| **Microservice-Ready** | Separable modules: Auth, Exam, Proctoring, Analytics |

### 5.4 Reliability & Recovery

| Feature | Implementation |
|---|---|
| **Auto-Save** | Student answers saved every 10 seconds |
| **Refresh Recovery** | Exam state restored from server on page reload |
| **Network Disconnect Handling** | Queue unsaved answers locally; sync on reconnect |
| **Database Backups** | Automated daily backups with 30-day retention |
| **Proctor Log Persistence** | Logs stored in separate table; never lost even if exam fails |
| **Graceful Degradation** | If proctoring fails, exam continues with a warning log |

### 5.5 Accessibility & Compatibility

| Requirement | Details |
|---|---|
| **Browsers** | Chrome 90+, Firefox 88+, Edge 90+, Safari 14+ |
| **Responsive** | Desktop-first; tablet support for dashboards |
| **Accessibility** | WCAG 2.1 AA compliance for core flows |
| **Localization Ready** | i18n support for future multi-language expansion |

---

## 6. Database Schema (High-Level)

### 6.1 Entity Relationship Overview

```mermaid
erDiagram
    USERS ||--o{ EXAM_ATTEMPTS : takes
    USERS ||--o{ QUESTIONS : creates
    USERS ||--o{ NOTIFICATIONS : receives
    EXAMS ||--o{ EXAM_QUESTIONS : contains
    EXAMS ||--o{ EXAM_ATTEMPTS : "attempted in"
    QUESTIONS ||--o{ EXAM_QUESTIONS : "used in"
    QUESTIONS ||--o{ OPTIONS : has
    EXAM_ATTEMPTS ||--o{ STUDENT_ANSWERS : includes
    EXAM_ATTEMPTS ||--o{ PROCTOR_LOGS : generates
    EXAM_ATTEMPTS ||--o{ RISK_SCORES : "scored by"

    USERS {
        uuid id PK
        string name
        string email UK
        string password_hash
        enum role
        boolean is_active
        string avatar_url
        timestamp created_at
        timestamp updated_at
    }

    QUESTIONS {
        uuid id PK
        uuid created_by FK
        string question_text
        enum question_type
        enum difficulty_level
        string subject
        string category
        integer marks
        float negative_marks
        string explanation
        string image_url
        enum status
        timestamp created_at
        timestamp updated_at
    }

    OPTIONS {
        uuid id PK
        uuid question_id FK
        string option_text
        boolean is_correct
        integer sort_order
    }

    EXAMS {
        uuid id PK
        uuid created_by FK
        string title
        text description
        string subject_category
        integer duration_minutes
        integer total_marks
        float passing_percentage
        boolean negative_marking
        timestamp start_datetime
        timestamp end_datetime
        integer max_attempts
        string exam_password
        boolean shuffle_questions
        boolean shuffle_options
        boolean adaptive_mode
        boolean proctoring_enabled
        enum status
        json proctor_config
        timestamp created_at
    }

    EXAM_QUESTIONS {
        uuid id PK
        uuid exam_id FK
        uuid question_id FK
        integer section_number
        integer sort_order
    }

    EXAM_ATTEMPTS {
        uuid id PK
        uuid exam_id FK
        uuid student_id FK
        integer attempt_number
        timestamp started_at
        timestamp submitted_at
        float total_score
        float percentage
        enum result
        enum status
        json adaptive_state
    }

    STUDENT_ANSWERS {
        uuid id PK
        uuid attempt_id FK
        uuid question_id FK
        text student_answer
        uuid selected_option_id
        boolean is_correct
        float marks_awarded
        text examiner_feedback
        timestamp answered_at
    }

    PROCTOR_LOGS {
        uuid id PK
        uuid attempt_id FK
        timestamp event_time
        enum event_type
        enum risk_level
        json details
        string snapshot_url
    }

    RISK_SCORES {
        uuid id PK
        uuid attempt_id FK
        float tab_switch_score
        float face_missing_score
        float multi_face_score
        float total_risk_score
        enum risk_level
        timestamp calculated_at
    }

    NOTIFICATIONS {
        uuid id PK
        uuid user_id FK
        enum type
        string title
        text message
        boolean read
        enum channel
        timestamp scheduled_at
        timestamp sent_at
        timestamp created_at
    }
```

### 6.2 Key Indexes

| Table | Index | Purpose |
|---|---|---|
| `users` | `email` (unique) | Fast login lookup |
| `questions` | `subject, difficulty_level` | Adaptive engine queries |
| `questions` | `created_by` | Examiner's question list |
| `exams` | `status, start_datetime` | Active exam listing |
| `exam_attempts` | `exam_id, student_id` | Attempt lookup |
| `student_answers` | `attempt_id` | Load all answers for an attempt |
| `proctor_logs` | `attempt_id, event_type` | Proctoring analysis |
| `notifications` | `user_id, read` | Unread notification count |

---

## 7. API Endpoints Overview

### 7.1 Authentication

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register new user |
| `POST` | `/api/auth/login` | Login → JWT tokens |
| `POST` | `/api/auth/refresh` | Refresh access token |
| `POST` | `/api/auth/forgot-password` | Send password reset OTP |
| `POST` | `/api/auth/reset-password` | Reset password with OTP |
| `POST` | `/api/auth/logout` | Invalidate refresh token |

### 7.2 User Management (Admin)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/users` | List all users (paginated) |
| `GET` | `/api/users/:id` | Get user details |
| `POST` | `/api/users` | Create user |
| `PUT` | `/api/users/:id` | Update user |
| `DELETE` | `/api/users/:id` | Soft-delete user |
| `PATCH` | `/api/users/:id/block` | Block/unblock user |
| `POST` | `/api/users/:id/reset-password` | Admin reset password |

### 7.3 Question Bank

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/questions` | List questions (filterable, paginated) |
| `GET` | `/api/questions/:id` | Get question with options |
| `POST` | `/api/questions` | Create question |
| `PUT` | `/api/questions/:id` | Update question |
| `DELETE` | `/api/questions/:id` | Soft-delete question |
| `POST` | `/api/questions/bulk-import` | Bulk import from CSV |
| `GET` | `/api/questions/export` | Export question bank |
| `POST` | `/api/questions/:id/duplicate` | Duplicate question |

### 7.4 Exam Management

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/exams` | List exams |
| `GET` | `/api/exams/:id` | Get exam details |
| `POST` | `/api/exams` | Create exam |
| `PUT` | `/api/exams/:id` | Update exam |
| `DELETE` | `/api/exams/:id` | Delete exam |
| `POST` | `/api/exams/:id/publish` | Publish exam |
| `POST` | `/api/exams/:id/assign` | Assign to students |
| `GET` | `/api/exams/:id/questions` | Get exam questions |
| `POST` | `/api/exams/:id/questions` | Add questions to exam |

### 7.5 Exam Attempt (Student)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/exams/:id/start` | Start exam attempt |
| `GET` | `/api/attempts/:id` | Get attempt state (resume) |
| `POST` | `/api/attempts/:id/answer` | Submit/save an answer |
| `POST` | `/api/attempts/:id/submit` | Final submission |
| `GET` | `/api/attempts/:id/result` | Get result |

### 7.6 Proctoring

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/proctor/log` | Log proctor event |
| `GET` | `/api/proctor/logs/:attemptId` | Get logs for attempt |
| `GET` | `/api/proctor/risk-score/:attemptId` | Get risk score |
| `POST` | `/api/proctor/snapshot` | Upload snapshot |

### 7.7 Analytics

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/analytics/exam/:id` | Exam-level analytics |
| `GET` | `/api/analytics/student/:id` | Student performance |
| `GET` | `/api/analytics/dashboard` | Admin dashboard stats |
| `GET` | `/api/analytics/export/:examId` | Export results |

### 7.8 Notifications

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/notifications` | Get user's notifications |
| `PATCH` | `/api/notifications/:id/read` | Mark as read |
| `PATCH` | `/api/notifications/read-all` | Mark all as read |
| `PUT` | `/api/notifications/preferences` | Update preferences |

---

## 8. UI/UX Wireframe Descriptions

### 8.1 Page Inventory

| Page | Role Access | Key Components |
|---|---|---|
| **Login** | All | Email/password form, forgot password link |
| **Register** | Public | Registration form with role selection (Student default) |
| **Admin Dashboard** | Admin | Stats cards, charts, recent activity, quick actions |
| **User Management** | Admin | User table with search, filters, bulk actions |
| **Question Bank** | Admin, Examiner | Question list with filters, add/edit modal, import button |
| **Question Editor** | Admin, Examiner | Rich text editor, options builder, preview pane |
| **Exam Builder** | Admin, Examiner | Configuration form, question selector, section builder |
| **Exam List** | All (role-filtered) | Card/table view of exams with status badges |
| **Exam Attempt** | Student | Question display, timer, navigation panel, webcam feed |
| **Result View** | Student | Score card, question review, performance charts |
| **Proctoring Dashboard** | Admin | Risk scores, flagged students, event timeline |
| **Analytics** | Admin, Examiner | Charts, tables, export buttons |
| **Notifications** | All | Notification bell, dropdown list, preferences page |
| **Profile Settings** | All | Edit profile, change password, notification preferences |

### 8.2 Design System

| Element | Specification |
|---|---|
| **Primary Color** | `#4F46E5` (Indigo 600) |
| **Secondary Color** | `#10B981` (Emerald 500) |
| **Danger Color** | `#EF4444` (Red 500) |
| **Warning Color** | `#F59E0B` (Amber 500) |
| **Background** | `#F9FAFB` (Light) / `#111827` (Dark) |
| **Font** | Inter (Google Fonts) |
| **Border Radius** | 8px (cards), 6px (buttons), 4px (inputs) |
| **Shadows** | Subtle box-shadows for elevation |
| **Animations** | Framer Motion for page transitions and micro-interactions |

---

## 9. Phased Implementation Roadmap

### Phase 1: Foundation (Weeks 1–3)

| Task | Priority |
|---|---|
| Project setup (React + Express + PostgreSQL) | 🔴 |
| Database schema & migrations | 🔴 |
| JWT authentication system | 🔴 |
| User management (Admin CRUD) | 🔴 |
| Role-based routing & middleware | 🔴 |
| Login / Register UI | 🔴 |

### Phase 2: Core Exam System (Weeks 4–6)

| Task | Priority |
|---|---|
| Question bank CRUD (unlimited questions) | 🔴 |
| Question import/export (CSV) | 🟡 |
| Exam builder & configuration | 🔴 |
| Exam assignment to students | 🔴 |
| Exam attempt flow (timer, navigation, auto-save) | 🔴 |
| Auto-grading for objective questions | 🔴 |

### Phase 3: Proctoring & Security (Weeks 7–9)

| Task | Priority |
|---|---|
| WebRTC webcam integration | 🔴 |
| Face detection (face-api.js) | 🔴 |
| Tab switch & fullscreen detection | 🔴 |
| Proctor event logging | 🔴 |
| AI risk score calculation | 🟡 |
| Proctoring dashboard | 🟡 |

### Phase 4: Advanced Features (Weeks 10–12)

| Task | Priority |
|---|---|
| Adaptive difficulty engine | 🟡 |
| Manual grading interface | 🟡 |
| Plagiarism / Answer similarity detection | 🟢 |
| Notification system (in-app + email + push) | 🟡 |
| Student & admin analytics dashboards | 🟡 |

### Phase 5: Polish & Launch (Weeks 13–14)

| Task | Priority |
|---|---|
| UI/UX refinement | 🟡 |
| Performance optimization | 🟡 |
| Security audit | 🔴 |
| Load testing (200–500 users) | 🔴 |
| Documentation | 🟢 |
| Deployment (Docker + CI/CD) | 🔴 |

---

## 10. Risk Matrix

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **WebRTC browser incompatibility** | Medium | High | Test across browsers; provide fallback instructions |
| **Face detection false positives** | High | Medium | Tunable thresholds; manual admin review layer |
| **Exam answer data loss** | Low | Critical | 10s auto-save + local storage backup + server recovery |
| **Concurrent user overload** | Medium | High | Load testing; Redis caching; connection pooling |
| **Cheating via screen sharing** | Medium | High | Fullscreen enforcement; random snapshot captures |
| **Network interruption during exam** | High | High | Local answer queue; auto-resume on reconnect |
| **Plagiarism detection accuracy** | Medium | Medium | Multiple similarity algorithms; human review |
| **JWT token theft** | Low | Critical | Short-lived access tokens; secure httpOnly cookies |

---

## 11. Appendix

### 11.1 Technology Stack Details

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React.js 18+ | SPA with component-based UI |
| **State Management** | Redux Toolkit / Zustand | Global state management |
| **Styling** | Tailwind CSS / CSS Modules | Utility-first styling |
| **Backend** | Node.js + Express.js | RESTful API server |
| **ORM** | Prisma / Sequelize | Database queries & migrations |
| **Database** | PostgreSQL 15+ | Primary relational database |
| **Cache** | Redis | Session cache, rate limiting |
| **Realtime** | Socket.IO | Notifications, live proctoring |
| **Video** | WebRTC + face-api.js | Webcam stream + face detection |
| **Email** | Nodemailer / SendGrid | Transactional emails |
| **File Storage** | AWS S3 / MinIO | Snapshots, question images |
| **Auth** | JWT + bcrypt | Authentication & authorization |
| **Testing** | Jest + React Testing Library | Unit & integration tests |
| **CI/CD** | GitHub Actions | Automated build & deploy |
| **Containerization** | Docker + Docker Compose | Dev & production environments |

### 11.2 Environment Variables (Sample)

```env
# Server
PORT=5000
NODE_ENV=production

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/exam_db

# JWT
JWT_SECRET=your-secret-key
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Redis
REDIS_URL=redis://localhost:6379

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# File Storage
S3_BUCKET=exam-platform-assets
S3_REGION=ap-south-1
S3_ACCESS_KEY=your-key
S3_SECRET_KEY=your-secret

# Frontend
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

### 11.3 Glossary

| Term | Definition |
|---|---|
| **MCQ** | Multiple Choice Question |
| **JWT** | JSON Web Token — standard for securely transmitting information as a JSON object |
| **WebRTC** | Web Real-Time Communication — API for peer-to-peer audio/video |
| **Proctoring** | Supervision of exam-takers to prevent cheating |
| **Risk Score** | Numerical score (0–100) indicating likelihood of cheating |
| **Adaptive Difficulty** | Dynamic adjustment of question difficulty based on performance |
| **face-api.js** | JavaScript face detection and recognition library |
| **ORM** | Object-Relational Mapping — database abstraction layer |

---

> [!TIP]
> This PRD is designed to be a **living document**. Update it as requirements evolve, features are added, or scope changes are approved.

---

**Document Prepared By:** Antigravity AI Assistant  
**Date:** February 27, 2026  
**Version:** 1.0
