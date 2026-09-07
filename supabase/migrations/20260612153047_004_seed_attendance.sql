-- Seed Attendance (Last 30 days for class 10A students)
INSERT INTO attendance (student_id, class_id, date, status, marked_by)
SELECT 
  '40000001-1111-1111-1111-111111111111',
  '10000001-1111-1111-1111-111111111111',
  CURRENT_DATE - i,
  CASE 
    WHEN i % 7 = 0 THEN 'late'
    WHEN i % 15 = 0 THEN 'absent'
    ELSE 'present'
  END,
  '30000001-1111-1111-1111-111111111111'
FROM generate_series(0, 29) AS i;

INSERT INTO attendance (student_id, class_id, date, status, marked_by)
SELECT 
  '40000002-2222-2222-2222-222222222222',
  '10000001-1111-1111-1111-111111111111',
  CURRENT_DATE - i,
  CASE 
    WHEN i % 10 = 0 THEN 'absent'
    WHEN i % 12 = 0 THEN 'late'
    ELSE 'present'
  END,
  '30000001-1111-1111-1111-111111111111'
FROM generate_series(0, 29) AS i;

INSERT INTO attendance (student_id, class_id, date, status, marked_by)
SELECT 
  '40000003-3333-3333-3333-333333333333',
  '10000001-1111-1111-1111-111111111111',
  CURRENT_DATE - i,
  CASE 
    WHEN i % 20 = 0 THEN 'absent'
    ELSE 'present'
  END,
  '30000001-1111-1111-1111-111111111111'
FROM generate_series(0, 29) AS i;

INSERT INTO attendance (student_id, class_id, date, status, marked_by)
SELECT 
  '40000004-4444-4444-4444-444444444444',
  '10000002-2222-2222-2222-222222222222',
  CURRENT_DATE - i,
  CASE 
    WHEN i % 8 = 0 THEN 'late'
    ELSE 'present'
  END,
  '30000002-2222-2222-2222-222222222222'
FROM generate_series(0, 29) AS i;

INSERT INTO attendance (student_id, class_id, date, status, marked_by)
SELECT 
  '40000005-5555-5555-5555-555555555555',
  '10000002-2222-2222-2222-222222222222',
  CURRENT_DATE - i,
  'present',
  '30000002-2222-2222-2222-222222222222'
FROM generate_series(0, 29) AS i;