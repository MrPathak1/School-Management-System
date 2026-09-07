# Mr Pathak School - School Management System

A full-featured School Management System built with **React**, **TypeScript**, **Vite**, **Tailwind CSS**, and **Supabase**. It provides dedicated dashboards for Admin, Teacher, Student, and Parent roles with comprehensive tools for managing school operations.

**Live Demo**: [https://mrpathak1.github.io/School-Management-System](https://mrpathak1.github.io/School-Management-System)

---

## Features

### Admin Dashboard
- Student, Teacher, Class, and Subject management
- Fee management with payment recording and receipts
- Analytics dashboard with charts (attendance, revenue, grades)
- Exam schedule management
- Identity card and admit card generators (6 designs each)
- Bus route management
- Health records management
- Campus photo gallery
- Document management
- Messaging system
- Event calendar
- Library management

### Teacher Dashboard
- Mark and manage student attendance
- Enter and manage grades
- Create and manage assignments
- Create and manage exams with MCQ questions
- View teaching schedule (timetable)
- Upload study materials
- Send and receive messages
- View student health records

### Student Dashboard
- View attendance record
- View grades and report cards
- Take online MCQ exams
- View exam schedule
- Access study materials
- View identity card and admit card
- Send messages to teachers
- View bus routes and library

### Parent Dashboard
- Monitor children's attendance and grades
- View fee payment history
- Track academic performance (GPA)
- Send messages to teachers
- View children's health records

### Authentication
- Role-based login (Admin, Teacher, Student, Parent)
- Quick login demo accounts for testing
- Teacher self-registration

---

## Tech Stack

| Technology | Purpose |
|-----------|---------|
| React 18 | Frontend UI |
| TypeScript | Type safety |
| Vite | Build tool & dev server |
| Tailwind CSS | Styling |
| Supabase | Backend database & API |
| Zustand | State management |
| Recharts | Charts & analytics |
| Lucide React | Icons |

---

## Getting Started

### Prerequisites
- Node.js 18+ installed
- A Supabase project (free tier works)

### Installation

```bash
# Clone the repository
git clone https://github.com/MrPathak1/School-Management-System.git

# Navigate to project directory
cd School-Management-System

# Install dependencies
npm install

# Set up environment variables
# Create a .env file in the root directory
```

### Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Database Setup

Run the SQL migration files in your Supabase SQL Editor in order:

1. `supabase/migrations/001_initial_schema.sql` - Creates all tables
2. `supabase/migrations/002_seed_data_part1.sql` - Seed users and classes
3. `supabase/migrations/003_seed_data_part2.sql` - Seed students and teachers
4. `supabase/migrations/004_seed_attendance.sql` - Seed attendance data
5. `supabase/migrations/005_seed_grades.sql` - Seed grades data
6. `supabase/migrations/006_seed_final.sql` - Seed remaining data
7. `supabase/migrations/007_disable_rls_for_demo.sql` - Disable RLS for demo
8. Remaining migration files for additional features

### Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build

```bash
npm run build
npm run preview
```

---

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@school.edu | any |
| Teacher | teacher1@school.edu | any |
| Student | student1@school.edu | any |
| Parent | robert.t@email.com | any |

---

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/              # Base UI components (Card, Modal, Table)
│   ├── AdminFeeManager.tsx
│   ├── AdmitCardGenerator.tsx
│   ├── AIAssistant.tsx
│   ├── AnalyticsDashboard.tsx
│   ├── BusTracking.tsx
│   ├── CampusGallery.tsx
│   ├── DocumentManager.tsx
│   ├── EventCalendar.tsx
│   ├── ExamScheduleManager.tsx
│   ├── HealthRecords.tsx
│   ├── IdentityCardGenerator.tsx
│   ├── Layout.tsx
│   ├── LibraryPanel.tsx
│   ├── MessagingPanel.tsx
│   ├── PaymentModal.tsx
│   ├── ScheduleManager.tsx
│   ├── StudyMaterials.tsx
│   ├── StudentExamPanel.tsx
│   ├── TeacherExamPanel.tsx
│   └── ...Card views
├── contexts/
│   └── AppContext.tsx   # Global state & auth
├── hooks/
│   ├── usePermissions.ts
│   └── useToast.tsx
├── lib/
│   └── supabase.ts      # Supabase client & types
├── pages/
│   ├── AdminDashboard.tsx
│   ├── LandingPage.tsx
│   ├── ParentDashboard.tsx
│   ├── SignupPage.tsx
│   ├── StudentDashboard.tsx
│   └── TeacherDashboard.tsx
├── App.tsx
├── main.tsx
└── index.css
```

---

## Bug Fixes

This project has undergone a thorough audit with **19+ bugs fixed**, including:

- ScheduleManager edit/delete buttons targeting wrong time slots
- AnalyticsDashboard stale state causing stats to always show zero
- PaymentModal payAmount not syncing when props change
- StudentExamPanel timer memory leak on component unmount
- Error messages showing success icons instead of error icons
- LibraryPanel null dereference on book return
- MessagingPanel unread count not working for parent/admin modes
- HealthRecords allowing student write access
- DocumentManager ignoring studentId prop
- Grade input hardcoded cap of 100 instead of using exam max marks
- AdminFeeManager using wrong fee structure fallback
- BusTracking missing error handling on Supabase operations
- Division by zero in grade percentage calculation

---

## License

This project is open source and available under the [MIT License](LICENSE).

---

Built with care for **Mr Pathak School**
