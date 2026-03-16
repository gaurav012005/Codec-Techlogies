# 🚀 Implementation Plan: Online Examination & Proctoring Platform

## 🟢 DEVELOPMENT WORKFLOW RULES
1. **One Feature at a Time:** We focus on a single feature strictly without mixing code for future steps.
2. **Full-Stack Cycle:** For each feature, we implement the Backend (DB + API routing) first, followed by the Frontend (UI + API integration).
3. **🛑 WAIT FOR MANUAL USER TEST:** After finishing the feature, I will pause operations and ask you to test it locally.
4. **Proceed Upon Approval:** I will only move to the next feature after you give the green light.

---

## 🛠️ Step-by-Step Task List

### ⬜ FEATURE 1: Initial Setup & Base Architecture
- **Backend:** Initialize Node.js/Express project, configure PostgreSQL (Sequelize/Prisma), setup error handling middleware, and basic CORS/Helmet security.
- **Frontend:** Initialize React/Vite project, configure TailwindCSS, setup React Router navigation, and basic API service file.
- **🛑 TEST POINT 1:** Run both frontend and backend servers. Confirm API returns a health check (`/api/health`) and the frontend loads a basic placeholder page. 

### ⬜ FEATURE 2: Authentication System (JWT)
- **Backend:** Create user schema, bcrypt hashing, POST `/api/auth/register` and `/api/auth/login`. Setup JWT access/refresh token generation and auth middleware.
- **Frontend:** Build Login and Registration UI, create AuthContext wrapper, setup Axios interceptors to inject JWT, and implement protected routing.
- **🛑 TEST POINT 2:** User signs up, logs in, receives token, and accesses a protected dummy dashboard.

### ⬜ FEATURE 3: Admin User Management
- **Backend:** Implement Admin User CRUD APIs (`GET`, `POST`, `PUT`, `DELETE` `/api/users`), add roles & block/unblock logic.
- **Frontend:** Build Admin Dashboard layout, create User List table with pagination, search, role assignment controls, and an Add/Edit User Modal.
- **🛑 TEST POINT 3:** Log in as Admin, create an Examiner account, block a user, and confirm table updates accurately.

### ⬜ FEATURE 4: Question Bank Management (CRUD & Rich Text)
- **Backend:** Create `Questions` and `Options` DB schema. Build CRUD APIs. Handle multiple question types (MCQ, True/False, Short Answer, Fill-in-the-Blank).
- **Frontend:** Build rich text Question Editor UI (React Quill or similar), dynamic options builder, correct answer toggle button, and Question List view with filters.
- **🛑 TEST POINT 4:** Login as Examiner/Admin, create an MCQ with 4 options, create a Short Answer question, and confirm they save to the DB perfectly.

### ⬜ FEATURE 5: Exam Configuration & Builder
- **Backend:** Create `Exams` schema with all constraints (timer, negative marks, password, adaptive mode toggle). Build create/publish/assign APIs.
- **Frontend:** Build multi-step Exam Creation Form (Details ➡️ Constraints ➡️ Question Selection). Implement manual/random question picker UI.
- **🛑 TEST POINT 5:** Admin creates an exam, assigns selected questions from the question bank, publishes it, and assigns it to a test student.

### ⬜ FEATURE 6: Student Dashboard & Exam Attempt Flow
- **Backend:** Build API for student exam fetching (`/api/exams/assigned`). Create `ExamAttempts` DB tracking. Build `/api/attempts/start`, `/api/attempts/answer`, `/api/attempts/submit`.
- **Frontend:** Build Student view for Assigned Exams. Build exam-taking interface (Timer countdown, Question navigator sidebar, Option inputs, Next/Prev buttons). Implement 10s auto-save.
- **🛑 TEST POINT 6:** Login as Student, start the exam, answer a few questions, refresh page (to test recovery), and submit the exam.

### ⬜ FEATURE 7: Auto-Grading & Results Engine
- **Backend:** Implement automated grading logic matching answered options against correct answer DB constraints. Calculate total score and update `Result` table.  
- **Frontend:** Build Student Result Screen showing instant score (if enabled), pie charts for right/wrong answers, and performance cards.
- **🛑 TEST POINT 7:** Student submits an exam with mostly MCQs; instantly view accurate scorecard.

### ⬜ FEATURE 8: Basic WebRTC Proctoring (Webcam & Permissions)
- **Backend:** Add basic `ProctorLogs` DB schema and API ingestion point.
- **Frontend:** Modify exam start flow to request `getUserMedia()` (Webcam) permissions. Render live sticky webcam feed in corner during exam.
- **🛑 TEST POINT 8:** Student starts exam, webcam requests permission, live feed is visible during the test.

### ⬜ FEATURE 9: Advanced Proctoring Events (Tab Switches & Fullscreen)
- **Backend:** Expand Proctor APIs to process stream of event webhooks.
- **Frontend:** Use HTML5 Fullscreen API to force fullscreen. Add `visibilitychange` listeners to detect Tab Switches. Auto-fire event logs to Backend API when violations occur.
- **🛑 TEST POINT 9:** Start exam, exit fullscreen (expect warning), switch tabs (expect warning log in backend DB).

### ⬜ FEATURE 10: Face Detection AI (TensorFlow.js / face-api)
- **Frontend:** Load `face-api.js` on browser frontend. Continuously scan webcam feed. Auto-log "No Face Detected" or "Multiple Faces Detected" to the backend.
- **Backend:** Calculate weighted "Risk Score" upon exam completion based on log frequency and thresholds. Flag students with score > 60.
- **🛑 TEST POINT 10:** Hide your face, look back, put another person in the frame. Finish test and check if Admin Dashboard flags the attempt.

### ⬜ FEATURE 11: Adaptive Question Difficulty Engine
- **Backend:** Implement core logic: During an open exam attempt, endpoint dynamically selects next question based on correctness of previous answer (+1 or -1 difficulty logic).
- **Frontend:** Exam player seamlessly requests next question on-the-fly instead of loading all initially.
- **🛑 TEST POINT 11:** Answer question wrong -> expect easier question. Answer right -> expect harder question. 

### ⬜ FEATURE 12: Admin & Examiner Evaluation Dashboards
- **Backend:** Build complex analytics aggregation queries (Average scores, Topper list, Question accuracy rates). Build short-answer manual grading queue API.
- **Frontend:** Build Admin/Examiner Dashboard UI using Chart.js/Recharts. Render Manual Grading UI where examiner inputs marks out of max points.
- **🛑 TEST POINT 12:** Admin reviews detailed test analytics, manually grades the student's short answer, and finalizes score.

### ⬜ FEATURE 13: Plagiarism Detection (Advanced Feature 1)
- **Backend:** Implement Python script or Node NLP module calculating Cosine Similarity & Jaccard Index across all student short answers for that exam. Generate flagged similarity report.
- **Frontend:** Plagiarism Dashboard UI showing side-by-side textual diff highlighting for flagged pairs. Admin verdict actions.
- **🛑 TEST POINT 13:** Submit two exams with highly identical short text answers. Run plagiarism job out of backend and check Admin UI for red flags.

### ⬜ FEATURE 14: Scheduled Notifications (Advanced Feature 2)
- **Backend:** Implement Socket.IO for in-app toasts. Setup basic Nodemailer integration. Setup cron-job logic for reminders.
- **Frontend:** Add notification bell dropdown to navbar. Connect to WebSocket to receive realtime toasts (e.g. "Exam ends in 5 minutes").
- **🛑 TEST POINT 14:** Trigger "Exam Published" event as Examiner, expect instant notification badge for the Student in another browser.

---
*Ready to start when you are! Just tell me: "Start Feature 1" and I will implement both Backend and Frontend setup, and then pause for your testing.*
