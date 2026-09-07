-- Exam schedules for admin-created exam timetable (separate from online exams)
CREATE TABLE IF NOT EXISTS exam_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  exam_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  total_marks INTEGER NOT NULL DEFAULT 100,
  room TEXT,
  type TEXT NOT NULL DEFAULT 'midterm' CHECK (type IN ('midterm', 'final', 'quiz', 'term', 'other')),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_exam_schedules_class ON exam_schedules(class_id);
CREATE INDEX IF NOT EXISTS idx_exam_schedules_subject ON exam_schedules(subject_id);
CREATE INDEX IF NOT EXISTS idx_exam_schedules_date ON exam_schedules(exam_date);
