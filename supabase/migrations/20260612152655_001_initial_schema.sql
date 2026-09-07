-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Classes table
CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  section TEXT NOT NULL,
  academic_year TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(name, section, academic_year)
);

-- Subjects table
CREATE TABLE subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  credits INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users table (for auth and role management)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'teacher', 'student')),
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Teachers table
CREATE TABLE teachers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  employee_id TEXT NOT NULL UNIQUE,
  qualification TEXT,
  department TEXT,
  joining_date DATE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_leave')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Students table
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  roll_number TEXT NOT NULL UNIQUE,
  class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
  admission_date DATE NOT NULL,
  guardian_name TEXT NOT NULL,
  guardian_phone TEXT NOT NULL,
  guardian_email TEXT,
  address TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'graduated', 'transferred')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Teacher-Subject-Class assignments
CREATE TABLE teacher_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  academic_year TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(teacher_id, subject_id, class_id, academic_year)
);

-- Timetable entries
CREATE TABLE timetable (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES teachers(id) ON DELETE SET NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  period INTEGER NOT NULL CHECK (period BETWEEN 1 AND 8),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  room TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(class_id, day_of_week, period)
);

-- Attendance records
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
  remarks TEXT,
  marked_by UUID REFERENCES teachers(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, date)
);

-- Exam types
CREATE TABLE exam_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  term TEXT NOT NULL,
  academic_year TEXT NOT NULL,
  max_marks INTEGER DEFAULT 100,
  weight DECIMAL(5,2) DEFAULT 1.0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Grades/Results
CREATE TABLE grades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  exam_type_id UUID REFERENCES exam_types(id) ON DELETE CASCADE,
  marks_obtained DECIMAL(5,2) NOT NULL,
  max_marks DECIMAL(5,2) DEFAULT 100,
  grade TEXT,
  remarks TEXT,
  graded_by UUID REFERENCES teachers(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, subject_id, exam_type_id)
);

-- Fee structure
CREATE TABLE fee_structures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  fee_type TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  academic_year TEXT NOT NULL,
  due_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fee payments
CREATE TABLE fee_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  fee_structure_id UUID REFERENCES fee_structures(id) ON DELETE CASCADE,
  amount_paid DECIMAL(10,2) NOT NULL,
  payment_date DATE NOT NULL,
  payment_method TEXT DEFAULT 'cash',
  receipt_number TEXT UNIQUE,
  collected_by UUID REFERENCES users(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'paid' CHECK (status IN ('paid', 'pending', 'partial', 'waived')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assignments
CREATE TABLE assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE,
  due_date DATE NOT NULL,
  max_marks INTEGER DEFAULT 100,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed', 'draft')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'error')),
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetable ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for classes (public read for authenticated users)
CREATE POLICY "classes_select" ON classes FOR SELECT TO authenticated USING (true);
CREATE POLICY "classes_insert" ON classes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "classes_update" ON classes FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "classes_delete" ON classes FOR DELETE TO authenticated USING (true);

-- RLS Policies for subjects
CREATE POLICY "subjects_select" ON subjects FOR SELECT TO authenticated USING (true);
CREATE POLICY "subjects_insert" ON subjects FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "subjects_update" ON subjects FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "subjects_delete" ON subjects FOR DELETE TO authenticated USING (true);

-- RLS Policies for users
CREATE POLICY "users_select" ON users FOR SELECT TO authenticated USING (true);
CREATE POLICY "users_insert" ON users FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "users_update" ON users FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "users_delete" ON users FOR DELETE TO authenticated USING (true);

-- RLS Policies for teachers
CREATE POLICY "teachers_select" ON teachers FOR SELECT TO authenticated USING (true);
CREATE POLICY "teachers_insert" ON teachers FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "teachers_update" ON teachers FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "teachers_delete" ON teachers FOR DELETE TO authenticated USING (true);

-- RLS Policies for students
CREATE POLICY "students_select" ON students FOR SELECT TO authenticated USING (true);
CREATE POLICY "students_insert" ON students FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "students_update" ON students FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "students_delete" ON students FOR DELETE TO authenticated USING (true);

-- RLS Policies for teacher_assignments
CREATE POLICY "teacher_assignments_select" ON teacher_assignments FOR SELECT TO authenticated USING (true);
CREATE POLICY "teacher_assignments_insert" ON teacher_assignments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "teacher_assignments_update" ON teacher_assignments FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "teacher_assignments_delete" ON teacher_assignments FOR DELETE TO authenticated USING (true);

-- RLS Policies for timetable
CREATE POLICY "timetable_select" ON timetable FOR SELECT TO authenticated USING (true);
CREATE POLICY "timetable_insert" ON timetable FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "timetable_update" ON timetable FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "timetable_delete" ON timetable FOR DELETE TO authenticated USING (true);

-- RLS Policies for attendance
CREATE POLICY "attendance_select" ON attendance FOR SELECT TO authenticated USING (true);
CREATE POLICY "attendance_insert" ON attendance FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "attendance_update" ON attendance FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "attendance_delete" ON attendance FOR DELETE TO authenticated USING (true);

-- RLS Policies for exam_types
CREATE POLICY "exam_types_select" ON exam_types FOR SELECT TO authenticated USING (true);
CREATE POLICY "exam_types_insert" ON exam_types FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "exam_types_update" ON exam_types FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "exam_types_delete" ON exam_types FOR DELETE TO authenticated USING (true);

-- RLS Policies for grades
CREATE POLICY "grades_select" ON grades FOR SELECT TO authenticated USING (true);
CREATE POLICY "grades_insert" ON grades FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "grades_update" ON grades FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "grades_delete" ON grades FOR DELETE TO authenticated USING (true);

-- RLS Policies for fee_structures
CREATE POLICY "fee_structures_select" ON fee_structures FOR SELECT TO authenticated USING (true);
CREATE POLICY "fee_structures_insert" ON fee_structures FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "fee_structures_update" ON fee_structures FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "fee_structures_delete" ON fee_structures FOR DELETE TO authenticated USING (true);

-- RLS Policies for fee_payments
CREATE POLICY "fee_payments_select" ON fee_payments FOR SELECT TO authenticated USING (true);
CREATE POLICY "fee_payments_insert" ON fee_payments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "fee_payments_update" ON fee_payments FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "fee_payments_delete" ON fee_payments FOR DELETE TO authenticated USING (true);

-- RLS Policies for assignments
CREATE POLICY "assignments_select" ON assignments FOR SELECT TO authenticated USING (true);
CREATE POLICY "assignments_insert" ON assignments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "assignments_update" ON assignments FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "assignments_delete" ON assignments FOR DELETE TO authenticated USING (true);

-- RLS Policies for notifications
CREATE POLICY "notifications_select" ON notifications FOR SELECT TO authenticated USING (true);
CREATE POLICY "notifications_insert" ON notifications FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "notifications_update" ON notifications FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "notifications_delete" ON notifications FOR DELETE TO authenticated USING (true);