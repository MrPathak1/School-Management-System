CREATE TABLE IF NOT EXISTS admit_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  exam_schedule_id UUID REFERENCES exam_schedules(id) ON DELETE CASCADE NOT NULL,
  card_data JSONB NOT NULL DEFAULT '{}',
  color_theme TEXT NOT NULL DEFAULT 'blue',
  design_type TEXT NOT NULL DEFAULT 'modern',
  generated_by UUID REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(student_id, exam_schedule_id)
);

ALTER TABLE admit_cards ENABLE ROW LEVEL SECURITY;
