# Plug — AI-Powered Exam Preparation Platform
## Full Project Documentation

**Version:** 2.9.0
**Author:** Sagong Tchoffo Alvaro Dylan
**Date:** May 2026

---

## Table of Contents

1. [What is Plug?](#1-what-is-plug)
2. [Why Was Plug Built?](#2-why-was-plug-built)
3. [Who is it For?](#3-who-is-it-for)
4. [How the System is Organised](#4-how-the-system-is-organised)
5. [The Technology Used](#5-the-technology-used)
6. [The Database Design](#6-the-database-design)
7. [How Users Log In and Stay Safe](#7-how-users-log-in-and-stay-safe)
8. [Feature 1 — Dashboard](#8-feature-1--dashboard)
9. [Feature 2 — My Notes (AI Note Upload)](#9-feature-2--my-notes-ai-note-upload)
10. [Feature 3 — Audio Notes](#10-feature-3--audio-notes)
11. [Feature 4 — Quizzes](#11-feature-4--quizzes)
12. [Feature 5 — Quikz (Spaced Repetition Micro-Quizzes)](#12-feature-5--quikz-spaced-repetition-micro-quizzes)
13. [Feature 6 — Videos](#13-feature-6--videos)
14. [Feature 7 — Timetable](#14-feature-7--timetable)
15. [Feature 8 — Progress Tracking](#15-feature-8--progress-tracking)
16. [Feature 9 — Community Forum](#16-feature-9--community-forum)
17. [Feature 10 — Teacher Directory](#17-feature-10--teacher-directory)
18. [Feature 11 — Coding Lab](#18-feature-11--coding-lab)
19. [Feature 12 — Research Hub](#19-feature-12--research-hub)
20. [Feature 13 — Profile and Settings](#20-feature-13--profile-and-settings)
21. [Feature 14 — Interactive Feature Guide](#21-feature-14--interactive-feature-guide)
22. [The Reward and Gamification System](#22-the-reward-and-gamification-system)
23. [Dark Mode and Theming](#23-dark-mode-and-theming)
24. [How the AI Works](#24-how-the-ai-works)
25. [Push Notifications](#25-push-notifications)
26. [Security Measures](#26-security-measures)
27. [How the Project is Deployed Locally](#27-how-the-project-is-deployed-locally)
28. [Challenges and How They Were Solved](#28-challenges-and-how-they-were-solved)
29. [Summary of All Pages](#29-summary-of-all-pages)

---

## 1. What is Plug?

**Plug** is a web application that helps students in Cameroon prepare for their **GCE O-Level and A-Level examinations**. The name "Plug" means to connect — it connects students to their study materials, to each other, to teachers, and to artificial intelligence tools that make studying easier and more effective.

The platform lives at `http://localhost:3000` and is available on any modern web browser. A student opens the website, creates a free account, and immediately has access to structured study notes, quizzes, a timetable planner, video lessons, a community forum, and much more — all in one place.

---

## 2. Why Was Plug Built?

The problem this project solves is very specific: **GCE students in Cameroon often study alone, with poor-quality materials, and no way to track how well they are doing.**

Before Plug, a typical student would:
- Keep handwritten notes that are hard to revise from
- Search YouTube randomly without knowing which videos match their syllabus
- Have no way to test themselves regularly
- Study without a schedule and lose motivation
- Have no way to connect with qualified tutors nearby

**Plug fixes all of these problems in one place.** Every single feature was designed with one question in mind: *"How does this help a GCE student pass their exam?"*

---

## 3. Who is it For?

| User Type | What They Can Do |
|---|---|
| **O-Level student** | Study notes, take quizzes, watch videos, join the forum |
| **A-Level student** | All of the above, with harder content |
| **Teacher / Tutor** | Create a teacher profile, be discovered by students |
| **Anyone curious** | Use the Research Hub to learn about any topic with AI |

---

## 4. How the System is Organised

Plug is built as a **monorepo** — one folder (`auraprep/`) that contains two separate applications that work together.

```
auraprep/
├── apps/
│   ├── web/        ← The website (what students see)
│   └── api/        ← The server (handles data and AI)
```

### The Two Parts

**`apps/web` — The Frontend (Next.js)**
This is the website the student opens in their browser. It is built with **Next.js 14**, a modern React framework. It handles all the user interface — buttons, forms, pages, animations. It talks to the backend server to get and save data.

**`apps/api` — The Backend (NestJS)**
This is the invisible server that runs behind the scenes. Students never see it directly. It handles:
- Storing all data in the database
- Checking usernames and passwords
- Calling the Google Gemini AI to generate notes
- Sending push notifications
- Serving data to the frontend through a REST API

The two talk to each other over HTTP. The frontend sends a request (e.g., "give me the notes for user X"), and the backend responds with data in JSON format (a standard data format computers understand).

---

## 5. The Technology Used

### Frontend (`apps/web`)

| Technology | What it is | Why it was used |
|---|---|---|
| **Next.js 14** | A React framework for building websites | Fast, handles routing automatically, works well with TypeScript |
| **TypeScript** | JavaScript with type checking | Prevents bugs by catching errors before the code runs |
| **Tailwind CSS** | A CSS styling tool | Makes it very fast to style pages without writing custom CSS |
| **Framer Motion** | An animation library | Creates smooth page transitions, popup effects, and animated cards |
| **Recharts** | A chart drawing library | Draws the bar charts and line charts on the Progress page |
| **Monaco Editor** | The same code editor inside VS Code | Used in the Coding Lab feature |
| **Lucide React** | A set of icons | All the icons used throughout the application |

### Backend (`apps/api`)

| Technology | What it is | Why it was used |
|---|---|---|
| **NestJS** | A Node.js framework for building servers | Organises code into modules, makes large APIs easy to maintain |
| **Prisma** | A database tool (ORM) | Makes reading and writing to the database safe and easy |
| **PostgreSQL** | A relational database | Stores all user data, notes, quiz results, and messages |
| **JWT (JSON Web Token)** | An authentication system | Keeps users logged in securely |
| **Google Gemini AI** | An artificial intelligence API | Generates structured study notes and quiz questions |
| **Web Push / VAPID** | A browser notification system | Sends quiz reminders to students even when the app is closed |
| **bcryptjs** | A password hashing library | Protects passwords — stores them safely so no one can read them |
| **@nestjs/schedule** | A task scheduling tool | Runs the Quikz cron job every minute to send notifications |

---

## 6. The Database Design

The database is **PostgreSQL**, and it is managed through **Prisma**. Prisma allows the developer to describe the database in a simple text file (`schema.prisma`), and it automatically creates and updates the database tables.

### Main Tables (Models)

#### `User`
Stores one row per registered student or teacher.

| Field | Type | Meaning |
|---|---|---|
| id | Text | Unique identifier for the user (auto-generated) |
| name | Text | The user's full name |
| email | Text | Email address (must be unique — no two users share one) |
| password | Text | The hashed password (never stored in plain text) |
| level | Text | "O-Level" or "A-Level" — their exam level |
| points | Number | XP points earned through studying |
| streak | Number | How many days in a row they have studied |
| avatar | Text | A URL or base64 image for their profile picture |
| studyProfile | JSON | Their study preferences set during onboarding |

#### `Note`
Stores one row per study note.

| Field | Type | Meaning |
|---|---|---|
| title | Text | The name of the note |
| subject | Text | e.g., "Biology", "Mathematics" |
| sections | JSON | An array of sections, each with a heading, content, and key points |
| quiz | JSON | An array of 20 multiple-choice questions generated by AI |
| isBuiltIn | Boolean | If `true`, this note was pre-loaded by the admin and shown to all users |
| userId | Text | Links to the user who owns this note |

**Why JSON for sections and quiz?** Because the structure of a note is flexible — some notes have 5 sections, others have 7. Storing it as JSON is simpler than creating a separate table for every section.

#### `QuizResult`
Records every quiz a student completes.

| Field | Meaning |
|---|---|
| score | How many questions they got right |
| total | Total number of questions |
| percentage | score ÷ total × 100 |

#### `Session`
Represents one planned study session in the Timetable.

| Field | Meaning |
|---|---|
| subject | What subject they plan to study |
| date | The date of the session |
| time / endTime | Start and end time |
| completed | Whether they marked it as done |

#### `Thread` and `Reply`
These power the Community Forum. A `Thread` is a question or discussion post. A `Reply` is an answer to that thread.

#### `Badge`
Each earned achievement is stored as one row. The `@@unique([userId, name])` constraint means a student can only earn each badge once.

#### `QuikzSettings`
Stores one row per user for the Quikz feature:
- How often they want quiz questions (in minutes)
- Which notes to draw questions from
- Quiet hours (times when they don't want to be disturbed)
- Their push notification subscription (so the server can send notifications)

#### `QuikzAnswer`
Tracks how many times a student answered each quiz question correctly or incorrectly. This data is used for **spaced repetition** — questions they get wrong more often appear more frequently.

---

## 7. How Users Log In and Stay Safe

### Registration
When a new user signs up:
1. They fill in their name, email, and password
2. The backend receives the password and runs it through **bcrypt** — a one-way hashing algorithm
3. The hashed password (a scrambled version) is saved in the database
4. The original password is never stored anywhere

This means even if someone broke into the database, they would only see scrambled text, not real passwords.

### Login
When a user logs in:
1. They enter their email and password
2. The backend finds their account and runs bcrypt on the entered password
3. bcrypt compares the result to the stored hash — if they match, the password was correct
4. The server creates a **JWT (JSON Web Token)** — a signed digital pass that proves the user is who they say they are
5. This token is sent back to the browser and stored in a cookie

### Authentication on Every Request
Every time the frontend asks for data (e.g., "give me my notes"), it attaches the JWT to the request. The backend reads the token, verifies it was signed by this server, and extracts the user's ID. If the token is missing or fake, the server responds with `401 Unauthorized`.

This is handled by a **Passport.js JWT strategy** and a `JwtAuthGuard` decorator that is applied to every API endpoint.

---

## 8. Feature 1 — Dashboard

**File:** `apps/web/app/(app)/dashboard/page.tsx`

The Dashboard is the home page after login. It was designed to answer one question immediately: *"What should I do today?"*

### What it shows:
- A **time-aware greeting** — "Good morning", "Good afternoon", or "Good evening" depending on the actual time of day
- A **personalised motivational quote** that adapts to the student's study goal set during onboarding (pass / improve / master / top). If no goal is set, a daily rotating quote is shown instead
- Current **streak**, **XP points**, and **peak study time** shown as pill badges in the banner
- **4 animated stat cards** — the numbers count up from 0 to their real value using a smooth cubic easing animation when the page first loads
- **Quick Actions** panel: 4 cards with gradient icon backgrounds — Continue Learning, Daily Challenge, Study Timetable, Community
- **Recent Notes**: the last 4 notes the student can jump straight back into
- **Audio Mode promo card**: a shortcut to the Audio Notes feature
- **Weekly Goal** panel: 3 progress bars — Study Hours, Quizzes taken, Notes explored
- **Weekly Challenges**: 3 animated gradient bars (Study Hours, Help Classmates, Quiz Days) with a green "Done!" badge when the target is reached

### New — Animated Statistics:
Stat numbers animate from 0 to their real value in 1.2 seconds using a custom `useCountUp` hook. The hook uses `requestAnimationFrame` for smooth GPU-accelerated animation with a cubic ease-out curve — no external library needed.

### New — Personalised Greeting System:
The banner adapts to the individual student. If their `mainGoal` in their study profile is "top", the quote says *"Consistency + deliberate practice = the top spot."* If it is "pass" it says *"Focus on the key topics."* If the student set a peak study time (e.g., morning), a badge appears showing "Peak: morning". This makes the dashboard feel personal.

### How it works:
When the page loads, four API calls run simultaneously using `Promise.all()`: progress stats, notes list, threads list, and user profile. All four requests happen in parallel — the page loads as fast as the slowest single request, not the sum of all four.

---

## 9. Feature 2 — My Notes (AI Note Upload)

**Files:** `apps/web/app/(app)/notes/`, `apps/api/src/notes/`

This is one of the most important features of Plug. A student can upload any text (from their textbook, their handwritten notes typed up, a past paper, etc.) and the AI transforms it into a beautiful, structured study guide automatically.

### The Upload Process (Step by Step)

1. **Student opens** the Upload page and pastes their raw text (or types it in)
2. They choose the **subject** (e.g., Biology), **exam level** (O-Level or A-Level), and optional **tags**
3. They click **"Process with AI"**
4. The frontend calls `POST /api/notes/summarize` with the text and metadata
5. The backend sends the text to **Google Gemini 2.5 Flash** with a detailed instruction prompt
6. Gemini reads the text and returns a JSON object containing:
   - A **title** that reflects the actual content
   - A **summary** of the whole topic
   - An **AI study tip** specific to the content
   - **5–7 sections**, each with a heading, a detailed paragraph, and 5 key points
   - **20 multiple-choice quiz questions** with correct answers and explanations
7. The frontend receives the structured JSON and shows the student a preview
8. The student confirms, and `POST /api/notes` saves the note to the database

### The Reading Experience

When a student opens a note to read it:
- All sections start **collapsed** to avoid overwhelm — the student opens one at a time
- A **reading timer** in the top-right counts how long they have spent on the note
- Each section has a **"Mark as Read"** checkbox
- A **progress bar** shows how many sections have been read
- There is a **"Listen"** button per section — it uses the browser's built-in **Speech Synthesis API** to read the section aloud in a human-sounding voice
- At the bottom of each section is a list of **Key Points** highlighted in a tinted box
- Once ALL sections are marked as read, the **Quiz button unlocks** (it is locked with a padlock icon before that)

### The Quiz Lock System
The quiz is deliberately locked until the student has read everything. This was a deliberate design decision: it forces students to actually study the material before testing themselves, which is how real learning works.

### Related Videos
Each note has a **"Videos" tab**. When clicked, it searches YouTube for videos related to the note's title and subject. Videos play inside the app — no need to leave to YouTube.

### New — AI Chat Tab
Every note now has a third tab: **"Chat"**. This is a live AI tutor the student can ask questions to about the specific note they are reading.

**How it works:**
1. The student types a question — e.g., *"Can you explain the Calvin cycle in simpler terms?"* or *"What is the difference between ATP and ADP?"*
2. The frontend sends the question, the full note content, and the conversation history to `POST /api/research/chat`
3. The backend sends this to **Google Gemini 2.5 Flash** with the instruction: *"Answer in 2–4 sentences, stay focused on the note content, refer the student back to the relevant section if needed"*
4. The AI's response appears as a chat bubble and the conversation grows naturally
5. The full chat history is maintained in the React state — Gemini receives the entire conversation each time so its answers are context-aware

The chat is **grounded to the note** — the AI only answers based on the actual note content. If a question goes beyond the notes, it briefly answers and directs the student back to the relevant section. This prevents the AI from going off-topic.

### Note Printing
Students can now print any note directly from the browser. A print stylesheet is applied that hides all navigation, buttons, and dark-mode colours, and prints the note content in clean black-and-white format on paper.

---

## 10. Feature 3 — Audio Notes

**File:** `apps/web/app/(app)/audio-notes/page.tsx`

Audio Notes allows a student to have their notes read to them in a spoken voice. This is useful for:
- Studying while commuting or walking
- Students who find listening easier than reading
- Revision at night when looking at a screen is tiring

### How it works:
1. The student picks a note from their library
2. They click **"Play"**
3. The app uses the browser's built-in **Web Speech API** (`window.speechSynthesis`) — this is a free, built-in browser feature that requires no external service
4. The student can:
   - **Pause and resume** the audio
   - Choose from **available voices** (different accents and genders, depending on what the browser has installed)
   - Adjust the **reading speed** (0.75×, 1×, 1.25×, 1.5×)
   - Skip to a specific **section**

Because it uses the browser's built-in engine, this feature works completely offline and costs nothing to run.

---

## 11. Feature 4 — Quizzes

**Files:** `apps/web/app/(app)/quizzes/`, `apps/api/src/notes/notes.controller.ts`

The Quizzes feature lets students test themselves on what they have studied.

### How a Quiz Works:
1. The student opens a note and clicks **"Take Quiz"** (only available after reading all sections)
2. The quiz launches in **fullscreen mode** — the entire screen becomes the quiz to remove distractions
3. Questions appear **one at a time**, with four answer options (A, B, C, D)
4. **Keyboard shortcuts** work: press 1, 2, 3, or 4 to select an answer; Enter to move to the next question; Escape to exit
5. A **timer** at the top counts upward so the student knows how long they are taking
6. A **progress bar** at the top shows how many questions remain
7. After the last question, a **results screen** appears showing:
   - Their percentage score
   - A grade (A*, A, B, C, D, or F) based on the score
   - The **mascot** reacting to the result (celebrating for high scores, sad for low ones)
   - A full **answer review** — every question shown with the student's answer, the correct answer, and an explanation

### Saving Results
When the quiz is submitted, the result is saved to `QuizResult` in the database, and the student earns XP points (score × 10). This feeds into the Progress page.

---

## 12. Feature 5 — Quikz (Spaced Repetition Micro-Quizzes)

**Files:** `apps/api/src/quikz/`, `apps/web/components/quikz-popup.tsx`, `apps/web/public/sw.js`

Quikz is the most technically advanced feature in Plug. The idea is simple but powerful: **send the student a random quiz question at regular intervals throughout their day**, so they are constantly revising without sitting down for a formal study session.

### The Concept — Spaced Repetition
Research shows that reviewing information at spaced intervals (e.g., after 30 minutes, then 1 day, then 1 week) is far more effective than studying everything at once. Quikz implements a simple version of this:
- Questions the student has **never seen** get a weight of 10 (appear often)
- Questions they **mostly get right** get a weight of 1 (appear rarely — they know it)
- Questions they **mostly get wrong** get a weight of 12 (appear most often — they need practice)
- Questions they get **half right** get a weight of 4

When a question is randomly selected, the system uses **weighted random selection** — imagine placing 10 tickets for unseen questions, 12 for weak ones, and 1 for strong ones in a bag, then drawing one randomly. The result is that difficult questions appear much more frequently.

### Two Ways Questions are Delivered

**Option 1 — In-App Popup**
A small popup card appears in the bottom-right corner of the screen, animated in with a spring effect. It shows the question and four buttons. A 30-second countdown timer ticks down — if it hits zero, the question expires. After answering, the correct answer and explanation are shown before the popup closes.

**Option 2 — Push Notifications (Even When App is Closed)**
This uses the **Web Push API** with **VAPID keys** (Voluntary Application Server Identification). Here is how it works:

1. The student enables Quikz and clicks "Enable Notifications"
2. The browser asks permission to show notifications
3. If the student agrees, the browser creates a **push subscription** — a unique address where the server can send messages
4. This subscription is saved to the database in `QuikzSettings.pushSub`
5. A **cron job** on the backend server runs every single minute, checking all users who have Quikz enabled
6. For each user, it checks: Has enough time passed since the last question? Is it within quiet hours?
7. If yes, it picks a weighted random question and sends a push notification to the user's browser
8. The notification appears on the user's screen even if the browser is closed
9. If the student clicks the notification, they are taken to the quizzes page where the popup appears

### Configurable Settings
The student can control:
- **Frequency** — how many minutes between questions (can type any number, e.g., 15, 45, 120)
- **Source notes** — which specific notes to draw questions from
- **Quiet hours** — a start and end time during which no notifications are sent (e.g., 22:00 to 07:00)

---

## 13. Feature 6 — Videos

**File:** `apps/web/app/(app)/videos/page.tsx`, `apps/api/src/videos/`

The Videos page lets students search for educational YouTube videos without leaving the app.

### How it works:
1. The student types a search term (e.g., "osmosis biology O-Level")
2. The frontend calls `GET /api/videos/search?q=...`
3. The backend calls the **YouTube Data API v3** with the search term
4. Results are filtered to educational content and returned
5. The student sees video thumbnails, titles, and channel names
6. Clicking a video **plays it inside the app** using an embedded YouTube player

This keeps the student focused — they are not taken to YouTube where distractions (recommended videos, adverts) would interrupt their study session.

---

## 14. Feature 7 — Timetable

**File:** `apps/web/app/(app)/timetable/page.tsx`, `apps/api/src/sessions/`

The Timetable allows students to plan and track their study sessions.

### What a student can do:
- **Create a session**: choose a subject, date, start time, and end time
- **Add notes** to a session (e.g., "Focus on Chapter 4")
- **Mark a session as complete** after studying
- View all sessions in a **weekly calendar layout**
- **Delete** sessions they no longer need

Each completed session increments the student's **streak** counter (if it is a new day) and earns XP points. This connects the timetable directly to the gamification system.

---

## 15. Feature 8 — Progress Tracking

**File:** `apps/web/app/(app)/progress/page.tsx`, `apps/api/src/progress/`

The Progress page shows the student a visual summary of everything they have done on Plug.

### What it shows:
- A **level card** with the student's current level (calculated from total XP) and a progress bar to the next level
- **4 stat cards**: total study hours, average quiz score, quizzes taken, badges earned
- **Weekly challenges** with progress bars (Study Hours, Quiz Days, Community Answers)
- **Bar chart** of study hours each day this week
- **Line chart** of quiz scores this week
- **Area chart** of cumulative study hours over time
- **Radar chart** showing performance balance across different subjects
- **Subject performance cards** showing average score and grade per subject
- **Badge collection** — earned badges displayed as colourful cards, locked badges shown in grey

### How it is calculated:
- Quiz scores come from the `QuizResult` table
- Study hours come from a `StudyLog` table where entries are created when sessions are marked complete
- The level system is based on total XP points: every 500 XP is one level

---

## 16. Feature 9 — Community Forum

**Files:** `apps/web/app/(app)/social/`, `apps/api/src/threads/`

The Community Forum is like a school notice board where students can ask questions and help each other.

### What a student can do:
- **Post a thread** — ask a question, start a discussion, or share a tip
- **Tag their post** by subject (Biology, Mathematics, etc.)
- **Reply** to other students' threads with answers
- **Like** threads and replies
- **Mark a reply as "Best Answer"** — helps future students find the right answer quickly
- **Search** through threads by keyword or subject

### Why this matters:
Explaining a concept to someone else is one of the most effective ways to learn it. When a student writes a clear answer for a classmate, they consolidate their own understanding at the same time.

---

## 17. Feature 10 — Teacher Directory

**Files:** `apps/web/app/(app)/teachers/`, `apps/api/src/teachers/`

The Teacher Directory connects students with qualified tutors in their area.

### For Students:
- Browse teachers filtered by **subject** and **town**
- See each teacher's **bio**, subjects, school, and **star rating**
- **Follow a teacher** to stay updated
- Leave a **rating** after a lesson
- View a teacher's full profile page

### For Teachers:
- Create a **teacher profile** by filling in subjects, town, school, and bio
- Mark themselves as **available or unavailable**
- Receive followers and ratings from students

---

## 18. Feature 11 — Coding Lab

**Files:** `apps/web/app/(app)/lab/`, `apps/web/app/(app)/lab/[slug]/`

The Coding Lab is a feature for Computer Science students. It provides a full code editor inside the browser where students can write and run code.

### How it works:
- The editor is powered by **Monaco Editor** — the same engine that powers Microsoft Visual Studio Code
- Students can write **Python, JavaScript, HTML/CSS**, and more
- Pre-built templates are available covering common CS exam topics: sorting algorithms, data structures, string manipulation, etc.
- Code output (results, errors) appears in a console panel below the editor

### Why it is useful:
Computer Science students preparing for GCE A-Level practical papers need to practice writing real code. Having this inside the app means they can study theory and practice coding without switching between multiple tools.

---

## 19. Feature 12 — Research Hub

**Files:** `apps/web/app/(app)/research/`, `apps/api/src/research/`

The Research Hub connects Wikipedia's knowledge database with Google Gemini AI to give students instant AI-summarised study notes on any topic.

### How it works (step by step):

1. The student types a topic (e.g., "Photosynthesis")
2. The backend calls the **Wikipedia Search API** to find matching articles
3. The student picks the article they want
4. The backend fetches the full Wikipedia article text and strips out all the HTML formatting
5. The clean text is sent to **Google Gemini 2.5 Flash** with an instruction to restructure it as study notes
6. Gemini returns a JSON with sections, key points, and 20 quiz questions
7. The student sees a beautifully structured note they can read, listen to, or quiz themselves on
8. They can **save the note** to their personal library with one click

### Why Wikipedia?
Wikipedia is free, always available, and covers every topic in every GCE subject. By combining it with AI, Plug can generate study notes on any topic in the syllabus in seconds.

### New — `chatWithNote()` Backend Method
The Research Service now has a second AI method beyond note summarisation. The `chatWithNote()` method powers the AI Chat tab on every note page. It receives four inputs:
- The **note title**
- The **full note content** (all sections compiled into a single text block)
- The **conversation history** (all previous messages in the current session)
- The **student's new question**

It sends all of this to Gemini 2.5 Flash with a prompt that instructs the AI to act as an academic tutor, answer in 2–4 sentences, stay grounded in the note content, and refer the student to specific sections when relevant. The conversation history is included so the AI remembers what was discussed earlier in the same chat session.

---

## 20. Feature 13 — Profile and Settings

**File:** `apps/web/app/(app)/settings/page.tsx`

The Settings page allows students to personalise their account.

### What they can change:
- **Full name** and **email address**
- **Password** (requires entering the old password first for security)
- **Profile picture** — can upload a custom image (stored as base64 in the browser's localStorage)
- **Exam level** — O-Level or A-Level
- **Study profile** — preferences set during onboarding, like favourite subjects and study style

### Teacher Mode:
A student can also click "Become a Teacher" to create a teacher profile, making them discoverable in the Teacher Directory.

---

## 21. Feature 14 — Interactive Feature Guide

**File:** `apps/web/app/(app)/guide/page.tsx`

The Guide page is an onboarding experience that helps new students discover all features of Plug in an engaging way.

### How it works:
- There are **12 stops** on the guide — one for each major feature
- Each stop is an expandable card showing the feature's icon, a description, and 3 pro tips
- When a student clicks **"Explore [Feature]"**, they are taken to that feature and the stop is marked as complete (saved in `localStorage`)
- A **progress bar** and **XP counter** at the top show how many stops they have completed
- When all 12 stops are completed, a **confetti animation** plays and a completion card appears
- The mascot appears at each stop in a relevant mood (excited, thinking, celebrating, etc.)
- An "Explorer" badge is rewarded for completing all stops

---

## 22. The Reward and Gamification System

Plug uses a gamification system to keep students motivated. This is inspired by apps like Duolingo.

### XP Points
Every action earns XP:
- Completing a quiz: `score × 10` points
- Completing a study session: points awarded
- Helping in the community: points for being active

### Levels
XP is converted to levels. Every 500 XP advances the student one level. Level names go from "Novice" through to "Legend".

### Streaks
A streak counts consecutive days of studying. If a student studies today and yesterday, their streak is 2. Missing a day resets the streak to zero. Students have one **Streak Freeze** — a safety net that can be used once to protect a streak if they miss a day.

### Badges
Badges are earned automatically when a student reaches milestones. Examples:
- **"First Steps"** — upload your first note
- **"Quiz Master"** — score 100% on a quiz
- **"Scholar"** — reach Level 5
- **"Streak Week"** — maintain a 7-day streak

Badges are stored in the `Badge` table with `@@unique([userId, name])` so each badge can only be earned once per student.

### The Mascot
A custom animated owl mascot appears throughout the app. It changes its expression (happy, excited, thinking, sad, celebrating, sleeping) based on what is happening. For example, it celebrates when the student scores high on a quiz and looks sad when they score poorly. The mascot was drawn as an SVG (scalable vector graphic) directly in code — it requires no external image files.

---

## 23. Dark Mode and Theming

Plug supports both a **Light Mode** (default) and a **Dark Mode** that the student can toggle with the moon/sun button in the header.

### How it was built:

The theme system uses **CSS custom properties** (variables). Every colour in the application is not hardcoded — it references a variable. For example, instead of writing `color: white`, the code says `color: hsl(var(--foreground))`.

Two sets of colour values are defined in `globals.css`:
- `:root { }` — defines the light mode colours
- `.dark { }` — overrides the same variables with dark versions

When the student clicks the toggle button, a `dark` class is added to the `<html>` element. The browser immediately reads the `.dark` colour values and applies them everywhere.

**The key technical detail:** The colour variables store only the HSL channel numbers (e.g., `224 30% 10%`), not the full `hsl()` call. The Tailwind CSS configuration wraps them: `background: 'hsl(var(--background))'`. This is the standard shadcn/ui pattern that makes Tailwind's opacity system work correctly with CSS variables.

**Anti-flash script:** A small JavaScript snippet runs in the browser before the page is painted. It checks `localStorage` for the saved theme preference and immediately adds or removes the `dark` class. This prevents a white flash before the React app loads.

---

## 24. How the AI Works

### The AI Provider
Plug uses **Google Gemini 2.5 Flash** — a free AI model provided by Google. It is accessed through the `@google/generative-ai` npm package using an API key stored in the backend's `.env` file.

### What the AI is Asked to Do
The AI is given a **prompt** — a detailed written instruction. The prompt explains exactly what format the output must be in (JSON), what the sections should look like, and what the quiz questions must contain.

Here is an example of the instruction given for note summarization:
> "You are an expert academic tutor. Read the student's notes and return ONLY valid JSON with exactly this structure: a title, summary, aiTip, 5–7 sections (each with heading, content paragraph, and 5 key points), and exactly 20 multiple-choice quiz questions with correct answers and explanations. NEVER use generic placeholders."

### Why This Detail Matters
Without specific instructions, AI models tend to give vague, generic responses. The detailed prompt forces the AI to produce specific, useful, educationally sound content every time.

### Fallback System
If the AI is unavailable (no API key or network error), the system falls back to a simple text splitter that divides the raw text into sections without AI intelligence. The student still gets a note, but without the structured format, key points, or quiz questions.

---

## 25. Push Notifications

**File:** `apps/api/src/quikz/quikz.service.ts`, `apps/web/public/sw.js`

Push notifications allow the server to send messages to a student's device even when the Plug website is not open.

### How it works technically:

1. **VAPID Keys**: The server has two cryptographic keys (public and private). The public key is shared openly; the private key is secret. Together they prove that notifications come from this server and no one else.

2. **Service Worker**: A small JavaScript file (`sw.js`) is installed in the student's browser. Service workers run in the background, separate from the main web page. They can receive messages from the server even when no tab has the website open.

3. **Push Subscription**: When the student enables notifications, the browser creates a unique subscription object that tells the server how to reach that specific browser. This is saved in the database.

4. **Cron Job**: Every minute, the backend server runs a scheduled function. It looks at every user with Quikz enabled, checks if enough time has passed since their last question, and if so, picks a question and sends it using the `web-push` library.

5. **Receiving the Notification**: The service worker's `push` event handler receives the notification, parses the question data, and shows a system notification using `self.registration.showNotification()`.

6. **Handling the Click**: When the student taps the notification, the `notificationclick` event sends a message to open the Plug website and trigger the quiz popup.

---

## 26. Security Measures

| Threat | Protection Used |
|---|---|
| Stolen passwords | bcrypt password hashing (irreversible) |
| Unauthorised API access | JWT tokens required on every endpoint |
| Expired sessions | JWT expires after 7 days, user must log in again |
| Fake notifications | VAPID keys ensure only this server can send notifications |
| API key exposure | `.env` file is gitignored — never committed to GitHub |
| SQL injection | Prisma uses parameterised queries — user input is never inserted directly into SQL |
| CORS | The API only accepts requests from the trusted frontend URL |

---

## 27. How the Project is Deployed Locally

To run the full project on a local machine, three services must be running simultaneously:

### Step 1 — Start the Database
A **PostgreSQL** database named `auraprep` must be running on port 5432. The connection string is stored in `apps/api/.env`:
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/auraprep"
```

### Step 2 — Start the Backend API
```bash
cd apps/api
npm run dev
```
This starts the NestJS server on `http://localhost:4000`. The command `nest start --watch` automatically recompiles and restarts whenever a file changes.

### Step 3 — Start the Frontend
```bash
cd apps/web
npm run dev
```
This starts the Next.js development server on `http://localhost:3000`.

### Environment Variables (apps/api/.env)
```
DATABASE_URL=...        # PostgreSQL connection
JWT_SECRET=...          # Secret for signing login tokens
GEMINI_API_KEY=...      # Google AI Studio API key (free)
YOUTUBE_API_KEY=...     # YouTube Data API key (for video search)
VAPID_PUBLIC_KEY=...    # For push notifications
VAPID_PRIVATE_KEY=...   # For push notifications
VAPID_EMAIL=...         # Contact email for push service
```

### Seeding the Database
To add pre-built notes and a demo user:
```bash
cd apps/api
npm run db:seed
```
This creates a demo account (`alex@auraprep.com` / `demo1234!`) and 20+ built-in notes across all GCE subjects.

---

## 28. Challenges and How They Were Solved

### Challenge 1 — Dark Mode Not Working
**Problem:** Toggling dark mode did nothing except change the header. All other backgrounds remained white.

**Root Cause:** The CSS colour variables were stored as full `hsl()` strings (e.g., `--background: hsl(224, 30%, 10%)`). Tailwind CSS generates `rgb(var(--background) / opacity)` which becomes `rgb(hsl(224, 30%, 10%) / 1)` — this is invalid CSS and browsers silently ignore it. Only the `.dark .glass {}` rule (a pure CSS override) worked.

**Solution:** Variables were changed to store only the channel numbers (e.g., `--background: 224 30% 10%`), and the Tailwind config was changed to wrap them: `background: 'hsl(var(--background))'`. This is the same pattern used by the popular shadcn/ui library.

### Challenge 2 — Note Deletion Opening a New Window
**Problem:** Clicking "Delete" on a note card was opening the note's detail page instead of deleting it.

**Root Cause:** The delete button was inside a `<Link>` component. When clicked, the click event bubbled up to the parent `<Link>` and triggered navigation.

**Solution:** The note menu was moved outside the `<Link>` element and positioned absolutely over the card using CSS. This way the delete button is never inside the navigation element, so click events do not bubble incorrectly.

### Challenge 3 — AI Giving Generic Placeholder Responses
**Problem:** The AI was generating notes with text like "Key concept 1" and "Option A" instead of real content.

**Solution:** The prompt was made much more specific. It now says: *"NEVER use generic placeholders like 'Key concept 1' or 'Option A'. All content must be based on the actual notes provided."* It also specifies minimum word counts per section.

### Challenge 4 — Gemini API Model Not Found
**Problem:** After switching to Google Gemini, the `gemini-1.5-flash` model name returned a 404 error.

**Root Cause:** Google retired older model names. The correct model names must be fetched from the live API.

**Solution:** The `/v1beta/models` endpoint was queried to list available models. `gemini-2.5-flash` was found to work correctly on the free tier.

### Challenge 5 — Push Notifications Not Working After API Restart
**Problem:** After restarting the API server, push notifications stopped sending.

**Root Cause:** The NestJS `watch` mode was spawning a new process while the old one was still holding port 4000. The new process failed to start, so it never picked up the new environment variables.

**Solution:** All processes on port 4000 were explicitly killed using `netstat -ano` and `Stop-Process` before restarting.

---

## 29. Summary of All Pages

| Page URL | What it Does |
|---|---|
| `/login` | Student login form |
| `/register` | New student registration |
| `/onboarding` | First-time setup — picks study level and preferences |
| `/dashboard` | Home page — stats, goals, quick actions |
| `/notes` | Browse all notes (built-in and personal) |
| `/notes/upload` | Upload text and get AI-structured notes |
| `/notes/[id]` | Read a specific note, take its quiz, watch related videos |
| `/audio-notes` | Listen to notes as audio |
| `/quizzes` | Quiz library and Quikz settings |
| `/videos` | Search YouTube videos |
| `/timetable` | Plan and track study sessions |
| `/progress` | View stats, charts, badges, and achievements |
| `/social` | Community forum — threads and replies |
| `/teachers` | Browse and follow local tutors |
| `/teachers/[id]` | View a teacher's full profile |
| `/lab` | Coding Lab — browse starter projects |
| `/lab/[slug]` | Open and run a specific coding project |
| `/research` | Search Wikipedia and get AI summaries |
| `/settings` | Edit profile, password, and preferences |
| `/guide` | Interactive feature tour with the mascot |
| `/become-teacher` | Create a teacher profile |

---

*End of Document*

**Project Repository:** https://github.com/Alvarodylanx/plugs
**Current Version:** 3.0.0
**Stack Summary:** Next.js 14 + NestJS + PostgreSQL + Prisma + Google Gemini AI + Web Push API
