-- Seed Users
INSERT INTO users (id, email, full_name, role, avatar_url, phone) VALUES
  ('00000001-1111-1111-1111-111111111111', 'admin@school.edu', 'John Administrator', 'admin', 'https://images.unsplash.com/photo-1472099625465-112e30f1d302?w=100&h=100&fit=crop', '+1-555-0100'),
  ('00000002-2222-2222-2222-222222222222', 'teacher1@school.edu', 'Sarah Johnson', 'teacher', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop', '+1-555-0101'),
  ('00000003-3333-3333-3333-333333333333', 'teacher2@school.edu', 'Michael Chen', 'teacher', 'https://images.unsplash.com/photo-1507003211169-0a7dd7b8f0a2?w=100&h=100&fit=crop', '+1-555-0102'),
  ('00000004-4444-4444-4444-444444444444', 'teacher3@school.edu', 'Emily Davis', 'teacher', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop', '+1-555-0103'),
  ('00000005-5555-5555-5555-555555555555', 'student1@school.edu', 'Alice Thompson', 'student', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop', '+1-555-0201'),
  ('00000006-6666-6666-6666-666666666666', 'student2@school.edu', 'Bob Williams', 'student', 'https://images.unsplash.com/photo-1500648767791-00dcc994f227?w=100&h=100&fit=crop', '+1-555-0202'),
  ('00000007-7777-7777-7777-777777777777', 'student3@school.edu', 'Charlie Brown', 'student', 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&h=100&fit=crop', '+1-555-0203'),
  ('00000008-8888-8888-8888-888888888888', 'student4@school.edu', 'Diana Martinez', 'student', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop', '+1-555-0204'),
  ('00000009-9999-9999-9999-999999999999', 'student5@school.edu', 'Ethan Wilson', 'student', 'https://images.unsplash.com/photo-1539571696357-5a69c397d6a9?w=100&h=100&fit=crop', '+1-555-0205'),
  ('0000000a-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'student6@school.edu', 'Fiona Garcia', 'student', 'https://images.unsplash.com/photo-1580489944761-15a19d65495b?w=100&h=100&fit=crop', '+1-555-0206'),
  ('0000000b-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'student7@school.edu', 'George Lee', 'student', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop', '+1-555-0207'),
  ('0000000c-cccc-cccc-cccc-cccccccccccc', 'student8@school.edu', 'Hannah White', 'student', 'https://images.unsplash.com/photo-1589156289151-91b3a0e5c0e6?w=100&h=100&fit=crop', '+1-555-0208');

-- Seed Classes
INSERT INTO classes (id, name, section, academic_year) VALUES
  ('10000001-1111-1111-1111-111111111111', '10', 'A', '2025-2026'),
  ('10000002-2222-2222-2222-222222222222', '10', 'B', '2025-2026'),
  ('10000003-3333-3333-3333-333333333333', '11', 'A', '2025-2026'),
  ('10000004-4444-4444-4444-444444444444', '11', 'B', '2025-2026'),
  ('10000005-5555-5555-5555-555555555555', '12', 'A', '2025-2026');

-- Seed Subjects
INSERT INTO subjects (id, name, code, credits) VALUES
  ('20000001-1111-1111-1111-111111111111', 'Mathematics', 'MATH101', 4),
  ('20000002-2222-2222-2222-222222222222', 'Physics', 'PHY101', 4),
  ('20000003-3333-3333-3333-333333333333', 'Chemistry', 'CHEM101', 3),
  ('20000004-4444-4444-4444-444444444444', 'English', 'ENG101', 4),
  ('20000005-5555-5555-5555-555555555555', 'History', 'HIST101', 3),
  ('20000006-6666-6666-6666-666666666666', 'Biology', 'BIO101', 3),
  ('20000007-7777-7777-7777-777777777777', 'Computer Science', 'CS101', 4),
  ('20000008-8888-8888-8888-888888888888', 'Art', 'ART101', 2);

-- Seed Teachers
INSERT INTO teachers (id, user_id, employee_id, qualification, department, joining_date, status) VALUES
  ('30000001-1111-1111-1111-111111111111', '00000002-2222-2222-2222-222222222222', 'T001', 'M.Ed. Mathematics', 'Mathematics', '2020-08-15', 'active'),
  ('30000002-2222-2222-2222-222222222222', '00000003-3333-3333-3333-333333333333', 'T002', 'M.Sc. Physics', 'Science', '2019-01-10', 'active'),
  ('30000003-3333-3333-3333-333333333333', '00000004-4444-4444-4444-444444444444', 'T003', 'M.A. English Literature', 'Languages', '2021-06-01', 'active');

-- Seed Students
INSERT INTO students (id, user_id, roll_number, class_id, admission_date, guardian_name, guardian_phone, guardian_email, address, status) VALUES
  ('40000001-1111-1111-1111-111111111111', '00000005-5555-5555-5555-555555555555', '2025001', '10000001-1111-1111-1111-111111111111', '2024-08-01', 'Robert Thompson', '+1-555-1001', 'robert.t@email.com', '123 Oak Street, Springfield', 'active'),
  ('40000002-2222-2222-2222-222222222222', '00000006-6666-6666-6666-666666666666', '2025002', '10000001-1111-1111-1111-111111111111', '2024-08-01', 'Mary Williams', '+1-555-1002', 'mary.w@email.com', '456 Maple Avenue, Springfield', 'active'),
  ('40000003-3333-3333-3333-333333333333', '00000007-7777-7777-7777-777777777777', '2025003', '10000001-1111-1111-1111-111111111111', '2024-08-01', 'Sandra Brown', '+1-555-1003', 'sandra.b@email.com', '789 Pine Road, Springfield', 'active'),
  ('40000004-4444-4444-4444-444444444444', '00000008-8888-8888-8888-888888888888', '2025004', '10000002-2222-2222-2222-222222222222', '2024-08-01', 'Carlos Martinez', '+1-555-1004', 'carlos.m@email.com', '321 Cedar Lane, Springfield', 'active'),
  ('40000005-5555-5555-5555-555555555555', '00000009-9999-9999-9999-999999999999', '2025005', '10000002-2222-2222-2222-222222222222', '2024-08-01', 'Patricia Wilson', '+1-555-1005', 'patricia.w@email.com', '654 Birch Drive, Springfield', 'active'),
  ('40000006-6666-6666-6666-666666666666', '0000000a-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2025006', '10000003-3333-3333-3333-333333333333', '2023-08-01', 'Maria Garcia', '+1-555-1006', 'maria.g@email.com', '987 Elm Court, Springfield', 'active'),
  ('40000007-7777-7777-7777-777777777777', '0000000b-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2025007', '10000003-3333-3333-3333-333333333333', '2023-08-01', 'James Lee', '+1-555-1007', 'james.l@email.com', '147 Walnut Way, Springfield', 'active'),
  ('40000008-8888-8888-8888-888888888888', '0000000c-cccc-cccc-cccc-cccccccccccc', '2025008', '10000004-4444-4444-4444-444444444444', '2023-08-01', 'Linda White', '+1-555-1008', 'linda.w@email.com', '258 Spruce Street, Springfield', 'active');