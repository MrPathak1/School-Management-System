<div align="center">

# Mr Pathak School

### School Management System

A modern, full-featured school management platform built with React, TypeScript, and Supabase.

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=flat&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-2.57-3FCF8E?style=flat&logo=supabase&logoColor=white)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

[![Deploy](https://img.shields.io/badge/Deploy-ready-brightgreen)](#getting-started)
[![TypeScript](https://img.shields.io/badge/Type%20Check-passing-brightgreen)](#)
[![Build](https://img.shields.io/badge/Build-passing-brightgreen)](#)

<br>

**Mr Pathak School** is a comprehensive school management system that provides dedicated dashboards for **Admin**, **Teacher**, **Student**, and **Parent** roles. Manage attendance, grades, fees, exams, and more — all from one platform.

[Getting Started](#getting-started) | [Features](#features) | [Demo Accounts](#demo-accounts) | [Tech Stack](#tech-stack)

</div>

---

## Features

<details open>
<summary><strong>Admin Dashboard</strong></summary>

| Module | Description |
|--------|-------------|
| Student Management | Add, edit, delete, and view all students with class assignment |
| Teacher Management | Manage teacher profiles, departments, and qualifications |
| Fee Management | Create fee structures, record payments, generate receipts |
| Analytics | Revenue charts, attendance trends, grade distribution |
| Exam Schedules | Create and manage exam timetables |
| Identity Cards | Generate student/staff ID cards (6 design themes) |
| Admit Cards | Generate exam admit cards with multiple designs |
| Bus Routes | Manage bus routes, drivers, stops, and capacity |
| Health Records | Track student health data, vaccinations, and checkups |
| Gallery | Upload and organize campus photos in albums |
| Documents | Upload, categorize, and manage school documents |
| Library | Manage book catalog, track borrows and returns |
| Messaging | Send announcements and messages to all users |
| Events | Create and manage school events and holidays |

</details>

<details open>
<summary><strong>Teacher Dashboard</strong></summary>

| Module | Description |
|--------|-------------|
| Attendance | Mark daily attendance per class, subject, and date |
| Grade Book | Enter marks, auto-calculate grades and percentages |
| Assignments | Create assignments with due dates and max marks |
| Exams | Create MCQ exams with timed sessions and auto-grading |
| Schedule | View weekly teaching timetable |
| Materials | Upload study materials (notes, links) for students |
| Messages | Communicate with students and parents |
| Health | View student health records |

</details>

<details open>
<summary><strong>Student Dashboard</strong></summary>

| Module | Description |
|--------|-------------|
| Attendance | View attendance record with status per day |
| Grades | View marks, grades, and academic performance |
| Exams | Take online MCQ exams with countdown timer |
| Schedule | View class timetable |
| Materials | Access uploaded study materials |
| Identity Card | View generated student ID card |
| Admit Card | View exam admit card |
| Messages | Send messages to teachers |
| Library | Browse books and borrow/return |
| Bus Routes | View assigned bus route and stops |

</details>

<details open>
<summary><strong>Parent Dashboard</strong></summary>

| Module | Description |
|--------|-------------|
| Children Overview | View all linked children with quick stats |
| Attendance | Monitor attendance percentage per child |
| Grades | View grades and calculate GPA |
| Fees | View fee breakdown and payment history |
| Messages | Send messages to child's teachers |
| Health | View child's health records |

</details>

---

## Tech Stack

<div align="center">

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript 5.5 |
| **Build Tool** | Vite 5.4 |
| **Styling** | Tailwind CSS 3.4 |
| **Backend** | Supabase (PostgreSQL + REST API) |
| **State** | Zustand 5 |
| **Charts** | Recharts 3.8 |
| **Icons** | Lucide React |

</div>

---

## Getting Started

### Prerequisites

- **Node.js** 18+ (recommended: 20 LTS)
- **npm** or **yarn**
- A **Supabase** account (free tier works)

### 1. Clone the Repository

```bash
git clone https://github.com/MrPathak1/School-Management-System.git
cd School-Management-System
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Set Up Database

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Open the **SQL Editor**
3. Run each migration file in order from `supabase/migrations/`:

```
001_initial_schema.sql        → Creates all tables
002_seed_data_part1.sql       → Seeds users and classes
003_seed_data_part2.sql       → Seeds students and teachers
004_seed_attendance.sql       → Seeds attendance data
005_seed_grades.sql           → Seeds grades data
006_seed_final.sql            → Seeds remaining data
007_disable_rls_for_demo.sql  → Disables RLS for demo
008-014                       → Additional feature tables
```

### 5. Start Development Server

```bash
npm run dev
```

Open **http://localhost:5173** in your browser.

### 6. Production Build

```bash
npm run build
npm run preview
```

---

## Demo Accounts

Use these credentials to log in (no password required for demo):

| Role | Email | Quick Access |
|------|-------|-------------|
| **Admin** | `admin@school.edu` | Full system access |
| **Teacher** | `teacher1@school.edu` | Class management |
| **Student** | `student1@school.edu` | Student portal |
| **Parent** | `robert.t@email.com` | Parent portal |

---

## Project Structure

```
School-Management-System/
├── public/                          # Static assets
│   └── school_campus.png
├── src/
│   ├── components/                  # Feature components
│   │   ├── ui/                      # Base UI (Card, Modal, Table)
│   │   ├── AdminFeeManager.tsx      # Fee management
│   │   ├── AdmitCardGenerator.tsx   # Admit card designs
│   │   ├── AIAssistant.tsx          # AI chatbot
│   │   ├── AnalyticsDashboard.tsx   # Charts & stats
│   │   ├── BusTracking.tsx          # Bus route management
│   │   ├── CampusGallery.tsx        # Photo gallery
│   │   ├── DocumentManager.tsx      # Document uploads
│   │   ├── EventCalendar.tsx        # Event management
│   │   ├── ExamScheduleManager.tsx  # Exam timetables
│   │   ├── HealthRecords.tsx        # Health tracking
│   │   ├── IdentityCardGenerator.tsx# ID card designs
│   │   ├── Layout.tsx               # App layout & nav
│   │   ├── LibraryPanel.tsx         # Library management
│   │   ├── MessagingPanel.tsx       # Messaging system
│   │   ├── PaymentModal.tsx         # Payment recording
│   │   ├── ScheduleManager.tsx      # Timetable management
│   │   ├── StudentExamPanel.tsx     # Student exam taking
│   │   ├── StudyMaterials.tsx       # Study material uploads
│   │   ├── TeacherExamPanel.tsx     # Exam creation
│   │   └── *IdentityCardView.tsx    # Card display views
│   ├── contexts/
│   │   └── AppContext.tsx           # Global state & auth
│   ├── hooks/
│   │   ├── usePermissions.ts        # Role-based access
│   │   └── useToast.tsx             # Toast notifications
│   ├── lib/
│   │   └── supabase.ts              # Supabase client & types
│   ├── pages/
│   │   ├── AdminDashboard.tsx       # Admin portal
│   │   ├── LandingPage.tsx          # Public landing page
│   │   ├── ParentDashboard.tsx      # Parent portal
│   │   ├── SignupPage.tsx           # Teacher registration
│   │   ├── StudentDashboard.tsx     # Student portal
│   │   └── TeacherDashboard.tsx     # Teacher portal
│   ├── App.tsx                      # Root component
│   ├── main.tsx                     # Entry point
│   └── index.css                    # Global styles
├── supabase/
│   └── migrations/                  # Database migrations (14 files)
├── .env.example                     # Environment template
├── .gitignore
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## Key Improvements

### Bugs Fixed (19+)

| Severity | Issue | Fix |
|----------|-------|-----|
| **Critical** | ScheduleManager edit/delete buttons targeted wrong time slots | Iterate days (1-5) instead of periods |
| **Critical** | AnalyticsDashboard stale state — stats always showed zero | Use local variables instead of stale state |
| **Critical** | PaymentModal payAmount not syncing on re-render | Added useEffect to sync with props |
| **Critical** | StudentExamPanel timer memory leak on unmount | Store timer in useRef + cleanup on unmount |
| **High** | Error messages showed success (checkmark) icon | Replaced with AlertCircle icon |
| **High** | AdminFeeManager used wrong fee structure fallback | Match class_id properly, block zero-fee |
| **High** | AdminDashboard pending fees used hardcoded fake values | Calculate from actual payment data |
| **High** | TeacherDashboard grades not filtered by class | Added student_id filter to query |
| **High** | Grade input hardcoded cap at 100 | Use exam's max_marks as cap |
| **High** | HealthRecords allowed student write access | Restricted to admin/teacher only |
| **High** | DocumentManager ignored studentId prop | Added student_id filter to query |
| **Medium** | MessagingPanel unread count broken for parents | Fixed for all modes (teacher/parent/admin) |
| **Medium** | LibraryPanel null dereference on book return | Added null check on borrow.book |
| **Medium** | LibraryPanel race condition on availability | Use Math.max(0, available - 1) |
| **Medium** | BusTracking no error handling | Added error checks on all operations |
| **Medium** | Division by zero in grade calculation | Added max_marks > 0 guard |
| **Low** | LibraryPanel edit button used "+" icon | Changed to Edit icon |
| **Low** | LandingPage wrong email address | Updated to correct email |
| **Low** | ParentDashboard unused variable | Removed dead code |

### Features Removed (Inappropriate)

- **Fake payment card UI** — Removed pre-filled Stripe test card and fake processing
- **Student/parent self-registration** — Now admin-only creates accounts

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript type checking |

---

## Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with care for Mr Pathak School**

[![GitHub](https://img.shields.io/badge/GitHub-MrPathak1-181717?style=flat&logo=github)](https://github.com/MrPathak1)

</div>
