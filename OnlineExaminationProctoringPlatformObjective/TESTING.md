# Complete Modular Testing Guide: Online Examination Proctoring Platform

This document outlines a fully modular, step-by-step testing strategy for the entire platform. By following these test cases exactly, QAs and developers can comprehensively verify that the system functions correctly in isolation (modularly) and when fully integrated. 

Each module represents a core pillar of the platform.

---

## Module 1: Authentication & Authorization

| Test Case ID | Scenario / Action | Expected Outcome | Status |
| :--- | :--- | :--- | :--- |
| **AUTH-01** | **User Login (Admin)**: Enter valid Admin credentials and click Login. | Successfully redirects to the Admin/Main Dashboard. Navigation sidebar shows Admin-only features (Exams, Admin Settings, etc.). | ⬜ |
| **AUTH-02** | **User Login (Student)**: Enter valid Student credentials and click Login. | Successfully redirects to the Student Portal. Navigation sidebar is restricted to Student exams and results. | ⬜ |
| **AUTH-03** | **Invalid Credentials**: Attempt login with incorrect password. | Error message "Invalid credentials" is shown. System blocks access. | ⬜ |
| **AUTH-04** | **Protected Routing**: As a logged-out user, attempt to manually type the URL `/dashboard/exams`. | System detects missing token/session and redirects to the `/login` page immediately. | ⬜ |
| **AUTH-05** | **Token Expiration**: Wait for the JWT token to expire or artificially remove it from localStorage. | API requests fail securely (401 Unauthorized), dashboard logs out, and redirects the user safely to `/login`. | ⬜ |

---

## Module 2: Question Bank Management

| Test Case ID | Scenario / Action | Expected Outcome | Status |
| :--- | :--- | :--- | :--- |
| **QB-01** | **Add MCQ Question**: Navigate to Question Bank -> Add Question. Fill in rich text, add 4 options, mark 1 as correct, set Subject and publish. | Question saves to `localStorage`. User is redirected to Bank. New question visibly appears at the top of the list. | ⬜ |
| **QB-02** | **Rich Text Rendering**: Add bullet points and bold text to a question. Go back to Question Bank and click "View" (eye icon). | The list preview safely strips HTML tags (showing clean text). The "View" modal accurately renders the bullets and bold formatting. | ⬜ |
| **QB-03** | **Dynamic Filters**: Create a question with a brand new Subject (e.g., "Astronomy"). Open the "All Subjects" filter dropdown. | "Astronomy" dynamically appears in the dropdown. Selecting it successfully filters the list to only that question. | ⬜ |
| **QB-04** | **Edit Question**: Click the 3-dots menu -> Edit on an existing question. Modify the marks and correct answer. Save. | Updated data safely replaces the old record in `localStorage`. List reflects the new marks. | ⬜ |
| **QB-05** | **Delete Question**: Select a question -> Delete. Refresh the page. | Question is permanently wiped from the internal storage array and does not reappear on refresh. | ⬜ |

---

## Module 3: Exam Builder & Management

| Test Case ID | Scenario / Action | Expected Outcome | Status |
| :--- | :--- | :--- | :--- |
| **EX-01** | **Create Exam Details**: Go to Exams -> Create Exam. Enter Title, Subject, and Description. Navigate Next. | Progresses to Step 2. Required fields trigger validation errors if left empty. | ⬜ |
| **EX-02** | **Configure Parameters**: Set Time Duration (ex: 60m), enable "Require Proctoring", enable "Negative Marking". | Flags and parameters are successfully captured in state. | ⬜ |
| **EX-03** | **Assign Questions**: In Step 3, search and select 5 questions from the internal bank. | Selected panel updates the Total Marks accurately. Deductions calculate properly. | ⬜ |
| **EX-04** | **Publish & Persist**: Hit 'Publish Exam' on the final Review step. Refresh the Exams dashboard. | Exam is firmly saved to browser persistence. Displays accurate Status (Draft/Publish/Active), Subject, and Total Marks. | ⬜ |
| **EX-05** | **Exam List Filtering**: Use the top filter menu to sort by 'Active' or 'Published'. | Only exams matching the selected status string are rendered on screen. | ⬜ |

---

## Module 4: Student Exam Experience (Exam Player)

| Test Case ID | Scenario / Action | Expected Outcome | Status |
| :--- | :--- | :--- | :--- |
| **STU-01** | **Exam Initialization**: Click "Start Exam" as a student. Ensure Webcam permissions prompt appears. | Exam refuses to proceed until Microphone/Webcam permissions are granted by the browser. | ⬜ |
| **STU-02** | **Fullscreen Enforcement**: Exam settings mandate fullscreen. Student attempts to exit fullscreen (Esc key). | Platform halts exam momentarily, flashes a warning, and logs an "Exited Fullscreen" violation to the database/proctor. | ⬜ |
| **STU-03** | **Answering Logic**: Student selects option 'A' on an MCQ, navigates to another question, and returns. | Option 'A' remains persistently checked. The sidebar correctly outlines the question as "Attempted". | ⬜ |
| **STU-04** | **Countdown Timer**: Wait for the timer to reach `00:00`. | Exam forces an automatic submission. Answers are locked. Student sees the submission confirmation screen. | ⬜ |

---

## Module 5: Live Proctoring & Security Rules

| Test Case ID | Scenario / Action | Expected Outcome | Status |
| :--- | :--- | :--- | :--- |
| **PROC-01** | **Detect Tab Switching**: While taking the exam, the student clicks away into a new Chrome Tab (Visibility API changes). | Event is immediately captured. Local warning flashes. Database receives a "Tab switch" event attached to the student ID. | ⬜ |
| **PROC-02** | **Live Proctor Dashboard**: Admin opens the Proctoring Dashboard while a student is actively taking an exam. | Admin sees the live webcam feed component updating. Connection via WebRTC/Sockets is successful. | ⬜ |
| **PROC-03** | **Risk Score Calculation**: Student rapidly switches tabs 5 times and leaves fullscreen 2 times. | Student's "Trust Score" drops from 100%. Admin dashboard flags the student visually in "Red" or "High Risk". | ⬜ |
| **PROC-04** | **Multi-Face Detection**: Another person enters the webcam frame. | Backend AI service flags a "Multiple faces detected" violation event on the timeline. | ⬜ |

---

## Module 6: Automated Grading & Analytics

| Test Case ID | Scenario / Action | Expected Outcome | Status |
| :--- | :--- | :--- | :--- |
| **GRAD-01** | **Score Tally**: Student took a 10-mark exam. 4 correct (1m each), 2 wrong (0.25 negative mark), 4 skipped. | Grade accurately calculates as: `(4 * 1) - (2 * 0.25) = 3.5`. Skipped calculate as `0`. | ⬜ |
| **GRAD-02** | **Admin Grading Page**: Navigate to Grading Dashboard as an Instructor. | Displays a list of recently submitted exams. Status shows "Auto-Graded" for objective tests. | ⬜ |
| **GRAD-03** | **Analytics Charts**: Open Analytics page. Review Passed/Failed pie charts and average score graphs. | Graphical widgets accurately compute and render based on the dataset of submitted student exams in `localStorage` or DB. | ⬜ |

---

## Module 7: Plagiarism & NLP Processing (Where applicable)

| Test Case ID | Scenario / Action | Expected Outcome | Status |
| :--- | :--- | :--- | :--- |
| **PLAG-01** | **Subjective Text Matching**: Review a Short Answer response on the Plagiarism Dashboard. | The engine compares text to baseline answers/peers and triggers a similarity percentage card (e.g., 85% match). | ⬜ |
| **PLAG-02** | **Code Similarity**: Two students submit identical python code formatting in a practical exam. | Plagiarism Engine highlights matched lines and flags the submissions for manual Administrator review. | ⬜ |
