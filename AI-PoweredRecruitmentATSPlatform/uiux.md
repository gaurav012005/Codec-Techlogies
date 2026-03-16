# 🎨 UI/UX Design Document — AI-Powered Recruitment & ATS Platform

**Product:** HireAI — AI-Powered Recruitment & ATS Platform  
**Design System:** Dark-mode-first, 3D glassmorphism, premium SaaS aesthetic  
**Brand Colors:** Deep Indigo (#1a1a2e) → Electric Violet (#6c5ce7) → Cyan Accent (#00cec9) → Warm Coral (#fd79a8)  
**Typography:** Inter (UI) + Space Grotesk (Headings) + JetBrains Mono (Data/Code)  
**Design Tool Target:** Stitch AI / Figma

---

## 🎯 Global Design System

### Color Palette

```
Primary:
  --bg-dark:         #0a0a0f          (Deep space black)
  --bg-surface:      #12121a          (Card/surface background)
  --bg-elevated:     #1a1a2e          (Elevated panels)
  --bg-glass:        rgba(26,26,46,0.7) (Glassmorphism panels)

Accent:
  --primary:         #6c5ce7          (Electric Violet — primary actions)
  --primary-glow:    rgba(108,92,231,0.4)
  --secondary:       #00cec9          (Cyan — success, AI features)
  --secondary-glow:  rgba(0,206,201,0.3)
  --accent-coral:    #fd79a8          (Warm Coral — alerts, highlights)
  --accent-gold:     #fdcb6e          (Gold — premium, scores)

Semantic:
  --success:         #00b894          (Green — hired, passed)
  --warning:         #fdcb6e          (Amber — caution, pending)
  --danger:          #e17055          (Red — rejected, fraud)
  --info:            #74b9ff          (Blue — informational)

Text:
  --text-primary:    #f5f5f7          (White, primary text)
  --text-secondary:  #a0a0b0          (Muted text)
  --text-tertiary:   #6c6c7e          (Placeholder/disabled)

Gradients:
  --gradient-hero:   linear-gradient(135deg, #6c5ce7 0%, #00cec9 50%, #fd79a8 100%)
  --gradient-card:   linear-gradient(145deg, rgba(108,92,231,0.15), rgba(0,206,201,0.05))
  --gradient-cta:    linear-gradient(135deg, #6c5ce7, #a29bfe)
  --gradient-mesh:   radial-gradient(at 20% 80%, #6c5ce720 0%, transparent 50%),
                     radial-gradient(at 80% 20%, #00cec915 0%, transparent 50%)
```

### Typography Scale

```
Headings (Space Grotesk):
  --h1: 72px / 1.05 / -2px tracking  (Hero)
  --h2: 48px / 1.15 / -1px tracking  (Section)
  --h3: 32px / 1.25 / -0.5px         (Subsection)
  --h4: 24px / 1.3                    (Card titles)
  --h5: 18px / 1.4                    (Labels)

Body (Inter):
  --body-lg: 18px / 1.6              (Feature descriptions)
  --body:    16px / 1.5              (Default)
  --body-sm: 14px / 1.5              (Secondary text)
  --caption: 12px / 1.4              (Meta, timestamps)

Monospace (JetBrains Mono):
  --mono: 14px / 1.5                 (Scores, data, IDs)
```

### Glassmorphism Tokens

```
Glass Card:
  background: rgba(26, 26, 46, 0.6)
  backdrop-filter: blur(20px) saturate(180%)
  border: 1px solid rgba(255, 255, 255, 0.08)
  border-radius: 16px
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3),
              inset 0 1px 0 rgba(255, 255, 255, 0.05)

Glass Card Hover:
  border-color: rgba(108, 92, 231, 0.3)
  box-shadow: 0 8px 32px rgba(108, 92, 231, 0.15),
              inset 0 1px 0 rgba(255, 255, 255, 0.08)

Elevated Glass:
  background: rgba(26, 26, 46, 0.8)
  backdrop-filter: blur(40px) saturate(200%)
  border: 1px solid rgba(255, 255, 255, 0.12)
```

### 3D Effects System

```
3D Floating Cards:
  transform: perspective(1000px) rotateX(2deg) rotateY(-2deg)
  transition: transform 0.4s cubic-bezier(0.23, 1, 0.32, 1)
  hover: transform: perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(20px)

3D Depth Layers:
  Layer 0 (Background): z=0, scale=1, opacity=0.3
  Layer 1 (Cards): z=20px, scale=1, opacity=1
  Layer 2 (Floating): z=40px, scale=1.02, opacity=1
  Layer 3 (Modal): z=80px, scale=1, opacity=1

Parallax Speed:
  Background elements: 0.3x scroll speed
  Mid-ground: 0.6x scroll speed
  Foreground: 1x scroll speed

3D Isometric Icons:
  Style: Isometric 3D rendered icons with soft shadows
  Colors: Match accent palette with ambient occlusion
  Size: 48px–96px for feature showcases
```

### Micro-Animations

```
Page Enter: fadeInUp 0.6s ease-out, staggered 50ms per element
Button Hover: scale(1.02), glow pulse 2s infinite
Card Hover: translateY(-4px), border glow, shadow expand
Score Counter: countUp animation from 0 to value, 1.5s ease-out
Pipeline Drag: scale(1.05), shadow expand, snap-to-column animation
Loading: Skeleton shimmer gradient sweep, 1.5s infinite
Notification: slideInRight 0.3s, subtle bounce
Tab Switch: crossFade 0.2s with underline slide
Chart Animate: draw-in from left, 1s ease-out per data series
```

---

## 📱 Page-by-Page Stitch AI Prompts

---

### PAGE 1: 🏠 3D Landing Page / Hero

**Stitch AI Prompt:**

```
Design a premium SaaS landing page for "HireAI" — an AI-powered recruitment and applicant tracking system. Dark theme with deep space background (#0a0a0f).

HERO SECTION (Full viewport):
- Background: Animated gradient mesh with floating 3D geometric shapes (translucent polyhedrons, glowing orbs, particle field). Subtle parallax on mouse move.
- Top: Sticky glass navbar with logo "HireAI" (gradient text violet→cyan), nav links (Features, Pricing, About, Blog), "Sign In" ghost button, and "Start Free Trial" gradient CTA button (violet→purple, glow on hover).
- Center content:
  - Badge: Pill-shaped glass badge "🚀 AI-Powered Hiring Platform" with subtle shimmer animation
  - Main Headline (Space Grotesk 72px, white): "Hire Smarter." on line 1, "Hire Faster." on line 2 — with gradient text effect (violet→cyan→coral shifting)
  - Subheadline (Inter 20px, #a0a0b0): "AI-driven resume screening, intelligent candidate ranking, and automated hiring workflows — all in one platform."
  - Two CTA buttons side by side:
    1. "Start Free Trial" — gradient fill (violet→purple), rounded, glow shadow, arrow icon
    2. "Watch Demo" — glass/outline style, play icon, hover fills
  - Trusted by logos row: 5 greyed-out company logos (Google, Microsoft, Stripe, Airbnb, Shopify) with "Trusted by 500+ companies" text above

- Below hero: 3D floating dashboard mockup — show the main ATS dashboard at an angle (perspective tilt), with glassmorphism effects, slightly elevated with a soft shadow and ambient glow underneath. The mockup should show a Kanban pipeline with colorful candidate cards.

FEATURES SECTION:
- Section title: "Why Choose HireAI?" with gradient underline
- 6 feature cards in 3×2 grid, each card is glass with hover tilt effect:
  1. 🧠 "AI Resume Parsing" — "Automatically extract skills, experience, and education from any resume in under 5 seconds"
  2. 🎯 "Smart Skill Matching" — "AI matches candidates to jobs with % match scores and gap analysis"
  3. 📊 "Predictive Hiring Score" — "ML-powered predictions for candidate success, acceptance, and retention"
  4. 🔍 "Fraud Detection" — "Detect AI-generated resumes, plagiarism, and experience anomalies"
  5. 📋 "Kanban Pipeline" — "Drag-and-drop hiring workflow with automated stage transitions"
  6. 👥 "Collaborative Hiring" — "Team evaluations, anonymous scoring, and consensus dashboards"
- Each card has a 3D isometric icon, title (white, 20px bold), description (muted, 14px), and a subtle glow on hover.

HOW IT WORKS SECTION:
- Horizontal stepper with 4 steps connected by gradient lines:
  Step 1: "Post a Job" — Job form icon
  Step 2: "AI Screens Resumes" — Brain/AI icon
  Step 3: "Review & Interview" — Pipeline icon
  Step 4: "Hire the Best" — Trophy icon
- Each step is a floating glass circle with number, icon, title, and short description below

STATS SECTION:
- Dark section with 4 countUp animated numbers in a row:
  - "50K+" Candidates Ranked
  - "85%" Screening Time Saved
  - "3x" Faster Hiring
  - "500+" Companies Using
- Numbers glow in cyan/violet, with subtle pulse animation

TESTIMONIAL SECTION:
- Glass card carousel with company logo, quote, person name, title, avatar
- Auto-sliding with dot indicators

PRICING SECTION:
- 3 pricing cards: Free, Pro ($49/mo), Enterprise (Custom)
- Pro card is "Most Popular" with violet border glow and slight scale-up
- Each card: glass background, feature list with check/X icons, CTA button

CTA SECTION:
- Full-width gradient background (violet→cyan gradient, 10% opacity)
- "Ready to Transform Your Hiring?" headline
- "Start Free Trial" large CTA button with glow

FOOTER:
- 4-column layout: Product, Company, Resources, Legal
- Social icons, newsletter email input
- "© 2026 HireAI. All rights reserved."

Style: Ultra-premium, dark mode, 3D depth, glassmorphism, subtle animations, professional SaaS aesthetic. Inspiration: Linear.app, Vercel, Stripe landing pages.
```

---

### PAGE 2: 🔐 Authentication Pages (Login / Register)

**Stitch AI Prompt:**

```
Design login and registration pages for "HireAI" recruitment platform. Dark theme.

LAYOUT:
- Split screen: Left 55% illustration area, Right 45% form area
- Left side: Deep dark gradient background with animated 3D mesh grid (low-poly futuristic), floating glassmorphism cards showing mini recruitment UI elements (candidate card, score badge, pipeline preview). HireAI logo at top-left. Tagline at center: "AI-Powered Hiring Starts Here" in gradient text.
- Right side: Clean form on dark surface (#12121a)

LOGIN FORM:
- Heading: "Welcome Back" (Space Grotesk, 32px, white)
- Subtext: "Sign in to continue to HireAI" (Inter, 14px, muted)
- Fields (glass-style inputs with subtle border, focus glow violet):
  - Email (envelope icon)
  - Password (lock icon, show/hide toggle)
- "Remember me" checkbox + "Forgot Password?" link (violet)
- "Sign In" button — full width, gradient violet→purple, 48px height, rounded 12px
- Divider: "or continue with"
- Social login: Google + LinkedIn buttons (glass outline style, with logos)
- Bottom: "Don't have an account? Sign up" link

REGISTER FORM:
- Heading: "Create Your Account" (Space Grotesk, 32px)
- Subtext: "Start hiring smarter with AI"
- Fields:
  - First Name + Last Name (side by side)
  - Work Email
  - Company Name
  - Password (with strength indicator bar: red→yellow→green)
  - Confirm Password
- Role selector: Dropdown glass-style — "I am a..." (Recruiter / HR Admin / Hiring Manager / Candidate)
- Terms checkbox: "I agree to the Terms of Service and Privacy Policy"
- "Create Account" gradient CTA button
- Social signup options
- Bottom: "Already have an account? Sign in"

FORGOT PASSWORD:
- Simple centered card:
  - Lock icon with violet glow
  - "Reset Password" heading
  - Email input
  - "Send Reset Link" button
  - "Back to login" link

Style: Clean, spacious, premium auth experience. Glass inputs with violet focus rings. Smooth transitions between login/register tabs.
```

---

### PAGE 3: 📊 Main Dashboard (Recruiter/HR Admin View)

**Stitch AI Prompt:**

```
Design the main dashboard for "HireAI" ATS platform — the primary screen recruiters see after login. Dark theme, data-rich but clean.

LAYOUT:
- Left sidebar (240px, collapsed = 64px icon-only):
  - Top: HireAI logo (gradient)
  - Nav items with icons (active = violet highlight + left border):
    - 🏠 Dashboard
    - 💼 Jobs
    - 👥 Candidates
    - 📋 Pipeline
    - 📅 Interviews
    - 🧠 AI Insights
    - 📧 Emails
    - 🏊 Talent Pool
    - 📊 Analytics
    - ⚙️ Settings
  - Bottom: User avatar, name, role badge, logout
  - Collapse toggle button

- Top bar (64px):
  - Breadcrumb: Dashboard
  - Global search bar (glass, "Search candidates, jobs..." placeholder, Cmd+K shortcut badge)
  - Notification bell with red badge count
  - Quick action button: "+ New Job" (violet CTA)
  - User avatar dropdown

DASHBOARD CONTENT (scrollable main area):

Row 1 — Stat Cards (4 cards, equal width):
  Glass cards with:
  1. "Active Jobs" — 24 (violet icon, +3 this week badge green)
  2. "Total Candidates" — 1,247 (cyan icon, +89 this week)
  3. "Interviews Today" — 6 (coral icon, calendar mini)
  4. "Avg. Time to Hire" — 18 days (gold icon, -3 days improvement arrow green)
  Each card: 3D subtle tilt on hover, sparkline chart at bottom

Row 2 — Two large panels side by side:

LEFT PANEL: "Hiring Pipeline Overview" (60% width)
  - Mini horizontal Kanban showing stage counts as a funnel:
    Applied (387) → Screened (245) → Interview (67) → Offer (12) → Hired (5)
  - Funnel visualization with gradient bars (violet→cyan→coral)
  - "View Pipeline" link

RIGHT PANEL: "Recent AI Activity" (40% width)
  - Feed-style list:
    - "✅ 23 resumes parsed for 'Senior Engineer' — 8 scored above 80%"
    - "⚠️ Fraud flag on candidate John Doe — AI content score: 78%"
    - "🧠 Predictive score updated for Marketing Manager candidates"
    - "🎯 5 talent pool matches found for 'Product Designer'"
  - Each item: icon, text, timestamp, subtle glass row

Row 3 — Two panels:

LEFT PANEL: "Upcoming Interviews" (50% width)
  - Today's interview cards:
    - Avatar, Candidate Name, Job Title, Time, Type badge (Technical/Behavioral), Interviewer
    - Join Meeting button (green glow)
    - Status: Confirmed / Pending

RIGHT PANEL: "Top Candidates This Week" (50% width)
  - Table/grid:
    - Rank | Avatar | Name | Job Applied | Match Score (circular progress badge) | Hiring Score | Action (View)
    - Top 5 candidates sorted by AI score
    - Scores shown as colored badges (green 80+, yellow 60-79, red <60)

Row 4 — Charts Panel:
LEFT: "Applications Trend" — Line chart (last 6 months), violet gradient fill under line
RIGHT: "Hiring by Department" — Donut chart with department segments (Engineering, Marketing, Sales, Ops, Design)

Style: Information-dense but breathable with proper spacing. Glass cards, subtle gradients, colored badges for status/scores. Professional data dashboard aesthetic like Linear/Notion analytics.
```

---

### PAGE 4: 💼 Job Management

**Stitch AI Prompt:**

```
Design the Job Management page for "HireAI" — where recruiters create, manage, and track job postings. Dark theme.

TOP SECTION:
- Page title: "Job Management" with job count badge
- Filters row: Status dropdown (All/Draft/Published/Closed/Archived), Department dropdown, Location dropdown, Search input
- View toggle: Grid view / List view icons
- "+ Create Job" gradient CTA button (top right)

GRID VIEW (Default — 3 columns):
Each job is a glass card:
  - Status badge top-right (Draft=grey, Published=green, Closed=red, Archived=muted)
  - Job title (bold, 18px, white)
  - Department + Location tags (pill badges)
  - Employment type badge: Full-time / Part-time / Contract / Remote
  - Key stats row:
    - 👥 42 applicants
    - ⏰ 12 days left
    - 💰 $120K–$180K
  - Skills pills (top 3 required skills as small colored tags)
  - Bottom: AI Match indicator — "Best Match: 94% — Sarah Chen" with mini avatar
  - Action buttons: View | Edit | ... (more menu: Duplicate, Close, Archive, Delete)
  - Hover: card lifts (translateY -4px), violet border glow

LIST VIEW:
- Table with columns: Title, Department, Location, Status, Applicants, Deadline, Best Match, Actions
- Sortable columns
- Checkbox for bulk actions

CREATE/EDIT JOB MODAL (Full-page slide-in from right, 50% width):
- Step wizard with progress indicator (Step 1: Details, Step 2: Requirements, Step 3: Pipeline, Step 4: Review)
- Step 1 — Job Details:
  - Title input
  - Department dropdown
  - Location input (with autocomplete)
  - Work type radio: Onsite / Remote / Hybrid
  - Employment type: Full-time / Part-time / Contract / Internship
  - Rich text editor for Description (Markdown-capable)
  - Rich text for Responsibilities

- Step 2 — Requirements:
  - Skills input with autocomplete + proficiency selector (Beginner/Intermediate/Expert) + weight slider
  - Added skills shown as editable pills
  - Preferred skills (simpler tag input)
  - Experience range: min–max slider (0–20 years)
  - Salary range: min–max inputs, currency dropdown, "Negotiable" toggle
  - Education requirement dropdown (Any, Associate, Bachelor, Master, PhD)
  - Application deadline date picker

- Step 3 — Pipeline Config:
  - Default pipeline stages shown (Applied → Shortlisted → Interview → Offer → Hired/Rejected)
  - "Customize stages" toggle — add/remove/reorder stages
  - Email trigger config per stage (dropdown: select email template)

- Step 4 — Review:
  - Summary card of all inputs
  - "Save as Draft" secondary button
  - "Publish Job" gradient CTA

JOB DETAIL PAGE:
- Header: Job title, status badge, applicant count, created date
- Tab navigation: Overview | Applicants | Pipeline | Analytics | Settings
- Overview tab: Full job description, requirements, salary, skills
- Applicants tab: Table with candidate list, scores, stage filters
- Pipeline tab: Full Kanban board for this job (see Pipeline page)
- Analytics tab: Job-specific funnel, time metrics, source breakdown

Style: Clean management interface, easy scanning, prominent status indicators, smooth wizard flow.
```

---

### PAGE 5: 👥 Candidate Profiles & Resume View

**Stitch AI Prompt:**

```
Design the Candidate Profile page for "HireAI" platform. This shows the full profile of a candidate with their parsed resume data, AI scores, and application history. Dark theme.

LAYOUT — Full-width profile page:

TOP SECTION (Hero banner):
- Glass banner card spanning full width (gradient mesh background, subtle)
- Left: Large avatar (64px, circular, with violet ring if AI-verified)
- Center: Name (Space Grotesk, 28px), Current Title, Current Company
- Tags: "🏷️ Silver Medalist", "💎 Top 5%", "🟢 Open to Opportunities" (colored pills)
- Right: AI Score badges:
  - Match Score: 89% (circular progress, large, cyan)
  - Hiring Score: 85/100 (gold badge)
  - Fraud Risk: 🟢 Low (green badge)
- Action buttons: "📧 Email", "📅 Schedule Interview", "➡️ Move Stage", "⭐ Add to Talent Pool"

TAB NAVIGATION:
Tabs: Profile | Resume | AI Scores | Applications | Activity | Evaluations

PROFILE TAB:
Two columns:

LEFT (60%):
- "Skills" section:
  - Skill pills grouped by category (Technical, Tools, Soft Skills)
  - Each pill shows: Skill Name + Proficiency level color (Expert=violet, Intermediate=cyan, Beginner=grey)
  - Match indicator per skill (✅ Matched / ❌ Missing / ⚠️ Partial) against current job

- "Experience" section:
  - Timeline view (vertical line left)
  - Each entry: Company logo placeholder, Company Name, Role, Duration (2022–2024), Description
  - Highlighted if AI detects anomaly (amber border)

- "Education" section:
  - Cards: Degree, Institution, Year, GPA (if available)
  - Relevant field match indicator

- "Certifications" section:
  - List with certificate icon, name, issuer, year

RIGHT (40%):
- "Contact Info" glass card:
  - Email, Phone, LinkedIn (links), Portfolio URL
  
- "Skill Match vs Current Job" radar chart:
  - Radar/spider chart showing candidate vs job requirements
  - Violet = candidate, Cyan (dashed) = job requirement
  
- "Missing Skills" card:
  - List of skills the candidate lacks
  - "Upskilling Suggestions" link per skill

- "Quick Stats" card:
  - Total Experience: 7 years
  - Applications: 3
  - Interviews: 2
  - Last Active: 2 days ago

RESUME TAB:
- Split view: Left = original resume PDF viewer (embedded), Right = AI-parsed structured data
- Parsed sections highlighted with color coding matching the original

AI SCORES TAB:
- Hiring Fit Score: Large gauge chart (0–100), color-coded (green/yellow/red)
- Breakdown cards in row:
  - Offer Acceptance: 92% (progress bar)
  - Retention 6mo: 85% (progress bar)
  - Retention 1yr: 78% (progress bar)
- "Top Contributing Factors" list with importance bars
- "Risk Flag" section with explanation
- Fraud Detection panel:
  - AI Content Score, Plagiarism Score, Anomaly Score (3 gauge charts)
  - Flag details with evidence (if any)
  - Admin action: "Clear Flag" / "Confirm Suspicious" buttons

EVALUATIONS TAB:
- Panel showing all team evaluations (see Collaborative Hiring design)

Style: Rich data display, clear hierarchy, color-coded scores everywhere. Premium profile page similar to LinkedIn premium + analytics overlay.
```

---

### PAGE 6: 📋 Hiring Pipeline (Kanban Board)

**Stitch AI Prompt:**

```
Design the Hiring Pipeline page — a Kanban board for managing candidates through hiring stages. Dark theme. This is the most interactive page.

TOP BAR:
- Job selector dropdown (glass-style): "Senior Backend Engineer" with applicant count
- Filter chips: Score range slider, Skills multi-select, Experience range, Source
- Sort: By Score / By Date / By Name
- View mode: Kanban | Table | Timeline
- Bulk actions button (appears when candidates selected)

KANBAN BOARD (Full width, horizontal scroll):
5 columns (glass background per column):

Column 1: "Applied" (badge: 42)
  - Column header: stage name, count, blue dot indicator
  
Column 2: "Shortlisted" (badge: 18)
  - Violet dot indicator

Column 3: "Interview" (badge: 8)
  - Cyan dot indicator

Column 4: "Offer" (badge: 3)
  - Gold dot indicator

Column 5: "Hired" (badge: 2) + "Rejected" (badge: 11, toggled)
  - Green / Red dot indicators

CANDIDATE CARD (within each column):
  Glass card (compact, ~180px height):
  - Top: Avatar (32px) + Name (bold, 14px) + Match score badge (circular, small, colored)
  - Middle: Applied job title (12px, muted)
  - Skills: 2–3 small pills (truncated)
  - Bottom row:
    - Hiring Score badge (small, colored)
    - Fraud indicator (🟢/🟡/🔴 dot)
    - Applied date (caption text)
    - "..." menu icon
  
  - Drag handle: Left edge subtle grip dots
  - Hover: Slight lift, violet border glow
  - Click: Opens candidate detail sidebar (slide-in from right)

  - Special indicators:
    - ⭐ Star icon for top candidates
    - 🏷️ Tag icon if tagged
    - 📅 Calendar icon if interview scheduled
    - ⚠️ Warning if fraud flagged

DRAG & DROP:
  - When dragging: card scales up 1.05, shadow intensifies, cursor changes
  - Drop zone: column highlights with violet dashed border and subtle glow
  - On drop: Smooth snap animation, stage transition confirmation toast
  - Stage change triggers: Show toast "Moved to Shortlisted — Email sent ✓"

CANDIDATE DETAIL SIDEBAR (Right slide-in, 400px):
- Compact version of candidate profile:
  - Name, title, match score (large)
  - Skill match visual (matched/missing pills)
  - AI scores summary
  - Recent activity timeline
  - Quick actions: Email, Schedule, Move Stage, Reject (with reason)
  - Notes input area
  - Stage history timeline

EMPTY STATE:
- Column with dashed border, "No candidates in this stage" text, subtle illustration

Style: Highly interactive, smooth drag-and-drop feel like Trello/Linear. Glass cards, colorful score indicators, real-time feel. Responsive columns with horizontal scroll.
```

---

### PAGE 7: 📅 Interview Scheduling

**Stitch AI Prompt:**

```
Design the Interview Scheduling page for "HireAI". Dark theme with calendar and scheduling UI.

LAYOUT — Two panels:

LEFT PANEL (65% — Calendar View):
- Calendar header: Month/Year, Today button, View mode (Day/Week/Month toggle)
- Navigation arrows (prev/next month)
- Calendar grid:
  - Week/Day view showing time slots (8AM–6PM)
  - Interview blocks as colored glass cards within time slots:
    - Color-coded by type: Technical=violet, Behavioral=cyan, Panel=coral, Phone Screen=grey
    - Shows: Candidate name, Job title, Interviewer avatar(s), Duration
    - Click to expand/edit
  - Current time indicator (red line)

RIGHT PANEL (35% — Interview List + Quick Schedule):
- "Today's Interviews" section:
  - Card per interview:
    - Time (bold), Duration badge
    - Candidate: avatar + name
    - Job title
    - Type badge (Technical, Behavioral, etc.)
    - Interviewer(s): avatar stack
    - Status: Confirmed ✅ / Pending ⏳ / Cancelled ❌
    - "Join Meeting" button (green, video icon) — if virtual
    - "Submit Feedback" button (appears after interview time)
  
- "Schedule Interview" quick form (collapsible):
  - Candidate search/select (autocomplete)
  - Job auto-filled
  - Interview type dropdown
  - Date picker
  - Time picker (with timezone)
  - Duration selector (30/45/60/90 min)
  - Interviewer multi-select (with availability indicator — green/red dot)
  - Location / Meeting link input
  - Send invite checkbox
  - "Schedule" CTA button

INTERVIEW FEEDBACK MODAL:
  - Interview details header (candidate, job, date, type)
  - Scorecard form:
    - Category sections (Technical, Problem Solving, Communication, Culture Fit, Leadership)
    - Each: Label + 5-star rating (clickable stars, violet glow on select) + Notes textarea
  - Overall Score: auto-calculated, shown as large number
  - Recommendation dropdown: Strong Hire / Hire / Lean Hire / Lean No Hire / No Hire (color-coded)
  - Strengths (tag input)
  - Concerns (tag input)
  - Written notes (textarea)
  - "Submit Feedback" CTA button

Style: Clean calendar interface, easy scanning of daily schedule. Colored interview type indicators. Premium scheduling experience like Calendly + Notion Calendar hybrid.
```

---

### PAGE 8: 🧠 AI Insights Hub

**Stitch AI Prompt:**

```
Design the AI Insights Hub page for "HireAI" — this is where all AI-powered features are showcased together. Dark theme, futuristic data visualization.

HEADER:
- Title: "🧠 AI Insights Hub" with animated brain icon (subtle glow pulse)
- Subtitle: "Powered by NLP, Machine Learning, and Predictive Analytics"

SECTION 1: "AI Resume Parsing Status"
- Glass panel showing recent parsing activity:
  - "23 resumes parsed in last 24 hours"
  - Average parse time: 3.2s (with speed gauge)
  - Extraction accuracy: 91% (circular progress, green)
  - Table: Recent parses — Candidate | Job | Parse Time | Skills Found | Accuracy | Status (✅/⚠️)

SECTION 2: "Predictive Hiring Scores"
- Glass card grid (3 columns) showing top candidates with:
  - Large Hiring Fit Score gauge (0–100, animated countUp)
  - Candidate name, photo, job applied
  - Mini bar chart: Acceptance / Retention 6mo / Retention 1yr
  - Risk flag badge
  - Contributing factors list (top 3)
- "View All Predictions" link

SECTION 3: "Fraud Detection Dashboard"
- Stats row:
  - Total Scanned: 1,247
  - Clean: 1,180 (94.6%) — green
  - Caution: 52 (4.2%) — amber
  - High Risk: 15 (1.2%) — red
- Flagged candidates table:
  - Candidate | Fraud Score | AI Content % | Plagiarism % | Anomaly % | Risk Level (badge) | Action (Review)
- Click → opens detailed fraud report modal

SECTION 4: "Talent Pool AI Recommendations"
- Current open jobs with recommended pool matches:
  - Job card → "5 matches found in talent pool"
  - Top 3 preview: avatar, name, match %, tags (Silver Medalist, etc.)
  - "View All Recommendations" button

SECTION 5: "AI Model Performance"
- Two charts:
  LEFT: Prediction Accuracy Over Time (line chart, monthly)
  RIGHT: Score Distribution (histogram, bell curve overlay)
- Model stats: Precision, Recall, F1-Score (as glass stat cards)

Style: Futuristic data command center feel. Glowing accents, animated data points, dark with vibrant violets/cyans/golds. Think AI control room / mission dashboard aesthetic.
```

---

### PAGE 9: 📊 Analytics & Recruitment Dashboard

**Stitch AI Prompt:**

```
Design the Analytics & Recruitment Dashboard for "HireAI". Dark theme, rich data visualization, exportable reports.

TOP BAR:
- Title: "Recruitment Analytics"
- Date range picker: Last 7 days / 30 days / 90 days / 12 months / Custom range
- Department filter dropdown
- "Export Report" button (PDF / CSV icons)

ROW 1 — KPI Cards (5 cards):
Glass cards with animated countUp numbers:
  1. "Time to Hire" — 18 days (trend arrow: ↓ 3 days, green) — clock icon
  2. "Cost per Hire" — $4,200 (trend: ↓ $300, green) — dollar icon
  3. "Application-to-Offer" — 3.4% (trend: ↑ 0.5%, green) — funnel icon
  4. "Offer Acceptance Rate" — 87% (trend: ↑ 2%, green) — check icon
  5. "Open Positions" — 24 (trend: +8 new, neutral) — briefcase icon
Each card: small sparkline chart at bottom showing 30-day trend

ROW 2 — Primary Charts (2 panels):

LEFT (55%): "Hiring Funnel" — Funnel/Sankey visualization:
  - Applied: 1,247 (wide bar)
  - Screened: 856 (narrower)
  - Interview: 234 (narrower)
  - Offer: 42 (narrow)
  - Hired: 18 (narrowest)
  - Show drop-off % between each stage (red text)
  - Colors: gradient from violet to green
  - Animated draw-in on page load

RIGHT (45%): "Monthly Hiring Trend" — Line + Bar combo chart:
  - Line = Applications received (violet)
  - Bars = Hires made (cyan)
  - X-axis: months, Y-axis: count
  - Tooltip on hover with exact numbers

ROW 3 — Secondary Charts (3 panels):

LEFT (33%): "Top Sourcing Channels" — Horizontal bar chart:
  - LinkedIn: 42%
  - Job Board: 28%
  - Employee Referral: 18%
  - Company Website: 8%
  - Talent Pool: 4%
  - Bars colored with gradient, sorted descending

CENTER (33%): "Hiring by Department" — Donut chart:
  - Engineering: 45% (violet)
  - Marketing: 22% (cyan)
  - Sales: 18% (coral)
  - Operations: 10% (gold)
  - Design: 5% (green)
  - Center number: total hires

RIGHT (33%): "Stage Duration" — Grouped bar chart:
  - Average days per pipeline stage
  - Applied→Screened: 2 days
  - Screened→Interview: 5 days
  - Interview→Offer: 8 days
  - Offer→Hired: 3 days

ROW 4 — Recruiter Performance Table:
- Glass table:
  - Recruiter | Avatar | Candidates Processed | Avg Score Given | Time to Screen | Hires | Rating
  - Sort by each column
  - Mini bar chart in "Candidates Processed" column

ROW 5 — Talent Pool Analytics:
- Pool Size Trend (area chart), Re-engagement Rate, Pool-to-Hire Conversion

Style: Executive dashboard feel. Clean charts with smooth animations. Consistent color usage. Professional data visualization similar to Mixpanel/Amplitude dashboards.
```

---

### PAGE 10: 👥 Collaborative Hiring & Team Evaluation

**Stitch AI Prompt:**

```
Design the Collaborative Hiring page for "HireAI" — where hiring teams collectively evaluate candidates. Dark theme.

TOP SECTION:
- Job selector: "Senior Backend Engineer"
- Candidate selector: "Alex Rodriguez"
- Evaluation status: "4/4 Evaluations Complete ✅" (progress bar)

SECTION 1: "Evaluation Consensus Dashboard"
Large glass card:
  - Overall Score: 4.1 / 5.0 (large gauge, animated)
  - Agreement Index: 87% (green badge with "HIGH" label)
  - Evaluation matrix table:
    - Rows: Criteria (Technical Skills, System Design, Communication, Problem Solving, Culture Fit, Leadership)
    - Columns: E1, E2, E3, E4 (evaluator initials in avatar circles), AVG, Agreement indicator (🟢🟡🔴)
    - Cells: Score values, color-intensity based (darker = higher)
  - Vote summary: ✅ Hire (3) | ❌ No Hire (0) | 💬 Discuss (1) — shown as pill badges

SECTION 2: "Side-by-Side Comparison"
  - Multi-select candidates: "Select candidates to compare" (up to 4)
  - Comparison table:
    - Rows: Overall Score, Match %, Hiring Score, Fraud Risk, Technical, Behavioral, Cultural, Consensus %, Votes
    - Columns: Candidate 1 | Candidate 2 | Candidate 3
    - Best-in-category highlighted with gold star
    - Winner row at bottom with "Recommended Pick" badge
  - Action buttons per candidate: "Offer" (green), "Hold" (amber), "Reject" (red)

SECTION 3: "Discussion Thread"
  - Chat-style discussion per candidate:
    - Message bubbles: Avatar, Name, Timestamp, Message
    - @mentions highlighted in violet
    - Emoji reactions on messages
    - "Add Comment" input at bottom with rich text support
    - "Attach file" and "Tag team member" buttons

SECTION 4: "Evaluation Form" (for submitted by current user)
  - Criteria sections (expandable):
    - Each: Criteria name, 5-star rating (interactive), Weight indicator, Notes textarea
    - Categories: Technical, Behavioral, Cultural
  - Vote section: Large radio buttons — Hire / No Hire / Needs Discussion
  - Written feedback textarea (required)
  - "Submit Evaluation" CTA (locks form after submit in anonymous mode)
  - Note: "Anonymous mode: Other evaluations hidden until all teammates submit"

SECTION 5: "Decision Sign-Off"
  - Available after all evaluations submitted
  - Summary of consensus
  - "Approve for Offer" / "Request Discussion" / "Reject Candidate" buttons
  - Requires Hiring Manager approval (shown as approval workflow)
  - Audit trail: Who decided what, when, with reasoning

Style: Collaborative workspace feel. Matrix-style data tables for scores. Chat-like discussion thread. Clean evaluation forms. Professional yet team-friendly aesthetic.
```

---

### PAGE 11: 🏊 Talent Pool

**Stitch AI Prompt:**

```
Design the Talent Pool page for "HireAI" — an AI-powered searchable database of all past and current candidates. Dark theme.

TOP SECTION:
- Title: "🏊 AI Talent Pool" with animated pool icon
- Stats bar: Total in Pool: 3,847 | Active: 2,100 | Open to Opps: 1,200 | Stale (>12mo): 547
- Search bar (full-width, glass): "Search by skills, name, title, location..."
- Advanced filter toggles: Skills multi-select, Experience range, Location, Availability status, Tags, Last active range

AI RECOMMENDATIONS PANEL (collapsible, top):
  - "🧠 AI Recommendations for Open Jobs"
  - Horizontal scrolling cards per open job:
    - Job title card → "8 matches found"
    - Top 3 candidate avatars with match %
    - "View All" link
  - Auto-generated when new jobs are published

MAIN TABLE/GRID:
  Glass table with rows:
  - Select checkbox
  - Avatar + Name (clickable → profile)
  - Current Title / Company
  - Skills (top 3 pills, +N more)
  - Experience (years)
  - Availability (badge: Active/Open/Not Looking — green/amber/grey)
  - Tags (pills: Silver Medalist, Strong Culture Fit, Future Leader)
  - Last Active (relative time)
  - Engagement Score (small bar)
  - Match Score (if job selected — circular badge)
  - Actions: View | Re-engage | Tag | Remove

BULK ACTIONS BAR (appears when candidates selected):
  - Selected: N candidates
  - Bulk actions: Send Outreach | Add Tag | Export | Remove from Pool

CANDIDATE DETAIL SIDEBAR (on click):
  - Compact profile: Name, title, skills, experience timeline
  - Tag editor (add/remove tags)
  - Engagement history: emails sent, responses, profile updates
  - "Re-engage" CTA → opens email compose with personalized template
  - Past applications: list with outcomes
  - AI Notes: "Strong Python skills, previously interviewed for Senior Engineer role, scored 4.2/5. Silver medalist — consider for future backend roles."

TALENT POOL ANALYTICS (bottom section):
  - Pool growth trend (area chart)
  - Re-engagement success rate (donut chart)
  - Pool-to-hire conversion rate
  - Top skills in pool (horizontal bar chart)

Style: LinkedIn Recruiter-like table with advanced filtering. AI recommendation panel is the standout feature. Clean data management interface with bulk operations support.
```

---

### PAGE 12: 📧 Email & Communication Center

**Stitch AI Prompt:**

```
Design the Email & Communication Center for "HireAI" — manages email templates, automation triggers, and communication history. Dark theme.

TAB NAVIGATION:
  Templates | Automation | Email Log | Compose

TEMPLATES TAB:
- Grid of email template cards (3 columns):
  - Card: Template name, Type badge (Application Received/Interview Invite/Rejection/Offer/Custom), Preview snippet (2 lines), Last edited date
  - Default templates marked with "Default" badge
  - Hover: Edit | Duplicate | Delete
- "+ New Template" CTA button

TEMPLATE EDITOR (opens on click/create):
  - Left 60%: WYSIWYG email editor
    - Toolbar: Bold, Italic, Link, Image, Variable insert dropdown
    - Live editing area with glass border
    - Variable chips: Click to insert {{candidate_name}}, {{job_title}}, {{company_name}}, {{interview_date}}, {{interview_link}}, {{portal_link}}
  - Right 40%: Live preview
    - Shows rendered email as recipient would see it
    - Mock candidate data filled in variables
    - Toggle: Desktop / Mobile preview

AUTOMATION TAB:
  - Per-job automation config:
    - Job selector dropdown
    - Automation rules list:
      - Each rule: Trigger (stage change, interview scheduled, deadline approaching) → Action (Send email, Send notification) → Template → Delay (instant, 1hr, 24hr, custom)
      - Toggle: Active/Inactive per rule
      - Edit button per rule
    - "+ Add Automation Rule" button
    - Visual workflow diagram: flowchart-style showing trigger → delay → action

EMAIL LOG TAB:
  - Comprehensive table:
    - Date | Recipient | Subject | Template Used | Status (Sent ✅ / Delivered 📬 / Opened 👁️ / Failed ❌) | Actions (Resend, View)
  - Filters: Status, Date range, Template, Recipient search
  - Stats row: Sent Today: 45, Delivered: 43, Open Rate: 67%, Failed: 2

COMPOSE TAB:
  - To: Candidate search/multi-select
  - Subject line input
  - Template selector (optional — load template)
  - Rich text editor
  - Variable insert
  - Attachments (drag & drop area)
  - Schedule send: "Send Now" / "Schedule" with datetime picker
  - "Send" gradient CTA button

Style: Clean communication center. Professional email editor. Visual automation builder. Gmail-like log interface with status indicators.
```

---

### PAGE 13: ⚙️ Settings & Admin Panel

**Stitch AI Prompt:**

```
Design the Settings page for "HireAI" — includes company settings, user management, and admin tools. Dark theme.

LEFT SIDEBAR NAVIGATION (within settings):
  - Company Profile
  - Team Members
  - Roles & Permissions
  - Pipeline Configuration
  - Email Settings
  - Integrations
  - Billing & Plan
  - Security
  - Notifications
  - Data & Privacy

COMPANY PROFILE:
  - Company logo upload (with drag-and-drop circle area)
  - Company name, Website, Industry, Size dropdown, Description textarea
  - Subdomain config: [companyname].hireai.com
  - "Save Changes" button

TEAM MEMBERS:
  - Table: Avatar, Name, Email, Role (badge), Status (Active/Invited/Deactivated), Last Login, Actions
  - "+ Invite Team Member" button → modal with email + role selector
  - Bulk invite option (CSV upload)
  - Role filter dropdown

ROLES & PERMISSIONS:
  - RBAC matrix table:
    - Rows: Permissions (Manage Jobs, View Candidates, Schedule Interviews, View Analytics, etc.)
    - Columns: HR Admin, Recruiter, Hiring Manager, Candidate
    - Toggles (checkboxes) for each permission cell
  - Custom role creation option
  - "Save Permissions" button

PIPELINE CONFIGURATION:
  - Default pipeline stages list (draggable to reorder):
    - Each stage: Name, Color picker, Auto-trigger email dropdown, Notification toggle
    - Add/Remove stages
  - Apply to: All jobs / Specific jobs

BILLING & PLAN (Super Admin):
  - Current plan card: "Pro Plan — $49/mo" with usage stats
  - Usage meters: Users (8/25), Jobs (15/50), Candidates (3.2K/10K), AI Parses (847/5K)
  - Plan comparison cards: Free, Pro, Enterprise
  - Billing history table
  - Update payment method

SECURITY:
  - Two-factor authentication toggle
  - Password policy config
  - Session management: Active sessions table with revoke option
  - Login history: IP, Device, Location, Time
  - Data export (GDPR)
  - Account deletion

Style: Clean settings interface with sectional organization. Professional admin panel. Usage meters with visual progress bars. Security section with audit-log feel.
```

---

### PAGE 14: 🎯 Candidate Portal (Candidate-Facing)

**Stitch AI Prompt:**

```
Design the Candidate Portal for "HireAI" — the candidate-facing interface where job seekers browse, apply, and track applications. Dark theme but slightly lighter than admin (#14141f).

CANDIDATE DASHBOARD:
  - Welcome banner: "Hello, Alex 👋" with motivational quote
  - Stats row: Applications: 5, Interviews: 2, Offers: 1, Saved Jobs: 8
  - Active applications timeline/cards showing current status per application

JOB BOARD:
  - Search + Filter bar: Keywords, Location, Department, Employment Type, Remote toggle
  - Job listing cards (vertical list):
    - Company logo, Job Title (bold), Company Name, Location, Employment Type badge, Remote badge
    - Posted date, Deadline
    - Salary range
    - Top skills required (pills)
    - "Apply" CTA button / "Saved" bookmark icon
    - Match indicator (if resume uploaded): "🎯 85% Match" badge

JOB DETAIL (on click):
  - Full job description, responsibilities, requirements
  - Sidebar: Salary, Location, Type, Deadline, Company info
  - Skill match panel: "Your Match: 85%" with matched/missing skills breakdown
  - "Apply Now" button → Application form

APPLICATION FORM:
  - Resume upload (drag & drop area, supports PDF/DOCX)
  - Or: Use existing resume
  - Cover letter textarea (optional)
  - Additional questions (if configured by recruiter)
  - "Submit Application" CTA

APPLICATION TRACKING:
  - Card per application:
    - Job title, Company, Applied date
    - Pipeline progress bar: Applied ● → Shortlisted ○ → Interview ○ → Offer ○ → Hired ○
    - Current stage highlighted (violet)
    - Last update date
    - Email history: list of communications received
    - Interview details (if scheduled): Date, Time, Type, Join link
  - Status badges: In Progress (cyan), Interview Scheduled (violet), Offer Extended (gold), Rejected (muted)

PROFILE SECTION:
  - Personal info editor: Name, Email, Phone, LinkedIn, Portfolio
  - Resume management: Upload new, view parsed data, resume history
  - Skill self-assessment
  - Preferences: Desired role, salary expectations, location, availability status

Style: Professional yet friendly candidate experience. Clean job listing cards. Clear application status tracking. Mobile-responsive design. Aesthetically appealing to attract top talent. Lighter dark theme for accessibility.
```

---

### PAGE 15: 📱 Mobile Responsive Considerations

**Stitch AI Prompt:**

```
Design mobile responsive versions (375px wide) for key pages of "HireAI". Dark theme.

MOBILE LANDING PAGE:
  - Hamburger menu (glass slide-in drawer)
  - Hero text stacked, 36px heading
  - Single CTA button full-width
  - Features: Single column cards
  - Stats: 2×2 grid
  - Pricing: Stacked cards, swipeable

MOBILE DASHBOARD:
  - Bottom tab navigation: Dashboard, Jobs, Pipeline, Interviews, More
  - Stat cards: Horizontal scroll (swipeable)
  - Charts: Full-width, stacked vertically
  - Pipeline: Single-column view, stage filter tabs at top

MOBILE PIPELINE:
  - Tab bar for stages: Applied | Screened | Interview | Offer | Hired
  - Vertical card list within selected stage
  - Swipe left on card for quick actions (Email, Move, Reject)
  - Pull-to-refresh

MOBILE CANDIDATE CARD:
  - Compact card: Avatar, Name, Match score, Applied date
  - Expandable to show more details
  - Bottom sheet for actions

MOBILE INTERVIEW:
  - Day view calendar
  - Interview cards with "Join" button prominently displayed
  - Feedback form as full-screen modal

Style: Touch-friendly targets (min 44px), swipeable interactions, bottom navigation, preserved dark theme and glassmorphism. Fast-loading, minimal assets.
```

---

## 🎨 Component Library Reference

### Buttons
```
Primary:     Gradient fill (violet→purple), white text, rounded-12px, glow shadow, hover: scale(1.02)
Secondary:   Glass background, violet text, violet border, hover: fill violet
Ghost:       Transparent, violet text, hover: glass background
Danger:      Red fill, white text, hover: darker red
Icon Button: Circle/square, glass background, icon only, tooltip on hover
```

### Input Fields
```
Default: Glass background (#1a1a2e), 1px border rgba(255,255,255,0.1), rounded-10px
Focus:   Border-color: violet, box-shadow: violet glow
Error:   Border-color: red, error text below in red
Icon:    Left-aligned icon within input, 16px padding-left
Search:  Wider, magnifying glass icon, "Cmd+K" badge right
```

### Cards
```
Default:  Glass card, hover: lift + border glow
Stat:     Glass card with large number, icon, trend indicator
Candidate: Compact card with avatar, score, skills
Job:      Card with title, department, status badge
```

### Badges & Tags
```
Status:  Rounded pill, colored background: green/amber/red/grey
Score:   Circular progress badge, colored ring
Skill:   Small pill, neutral glass background
Role:    Outlined pill, colored border
```

### Charts
```
Color scheme: Violet, Cyan, Coral, Gold, Green, Blue (in order of preference)
Background: Transparent (no chart background, glass card as container)
Gridlines: rgba(255,255,255,0.05)
Tooltips: Glass card with white text
Axes text: #6c6c7e (muted)
Animation: Draw-in from left, 1s ease-out
```

---

## 📐 Spacing & Layout System

```
Page padding: 24px (mobile) / 32px (tablet) / 48px (desktop)
Card padding: 20px / 24px
Card gap: 16px / 24px
Section gap: 48px / 64px
Sidebar width: 64px (collapsed) / 240px (expanded)
Top bar height: 64px
Content max-width: 1400px (centered on wide screens)
Breakpoints: 375px / 768px / 1024px / 1440px / 1920px
```

---

## 🔗 User Flow Summary

```
Candidate Flow:
  Landing → Register (Candidate) → Job Board → Job Detail → Apply →
  Application Tracking → Interview Schedule → Result

Recruiter Flow:
  Landing → Login → Dashboard → Create Job → View Applications →
  Pipeline (Kanban) → Schedule Interview → Review Feedback →
  AI Scores → Collaborative Evaluation → Offer/Reject

HR Admin Flow:
  Login → Dashboard → Analytics → Team Management → Pipeline Config →
  Email Automation → Talent Pool → Reports

Super Admin Flow:
  Login → Platform Dashboard → Tenant Management → Billing →
  System Health → Platform Analytics
```

---

> **Document Version:** 1.0  
> **Created:** March 1, 2026  
> **Purpose:** Stitch AI / Figma design prompts for complete UI/UX of HireAI Platform  
> **Design Philosophy:** Dark-mode-first, 3D glassmorphism, premium SaaS, AI-first aesthetic  
> **Inspiration:** Linear.app, Vercel.com, Stripe Dashboard, Notion, Raycast
