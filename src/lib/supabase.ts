import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          role: 'admin' | 'teacher' | 'student' | 'parent';
          avatar_url: string | null;
          phone: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          full_name: string;
          role: 'admin' | 'teacher' | 'student' | 'parent';
          avatar_url?: string | null;
          phone?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          role?: 'admin' | 'teacher' | 'student' | 'parent';
          avatar_url?: string | null;
          phone?: string | null;
        };
      };
      classes: {
        Row: {
          id: string;
          name: string;
          section: string;
          academic_year: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          section: string;
          academic_year: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          section?: string;
          academic_year?: string;
        };
      };
      subjects: {
        Row: {
          id: string;
          name: string;
          code: string;
          credits: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          code: string;
          credits?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          code?: string;
          credits?: number;
        };
      };
      teachers: {
        Row: {
          id: string;
          user_id: string;
          employee_id: string;
          qualification: string | null;
          department: string | null;
          joining_date: string;
          status: 'active' | 'inactive' | 'on_leave';
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          employee_id: string;
          qualification?: string | null;
          department?: string | null;
          joining_date: string;
          status?: 'active' | 'inactive' | 'on_leave';
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          employee_id?: string;
          qualification?: string | null;
          department?: string | null;
          joining_date?: string;
          status?: 'active' | 'inactive' | 'on_leave';
        };
      };
      students: {
        Row: {
          id: string;
          user_id: string;
          roll_number: string;
          class_id: string;
          admission_date: string;
          guardian_name: string;
          guardian_phone: string;
          guardian_email: string | null;
          address: string | null;
          status: 'active' | 'inactive' | 'graduated' | 'transferred';
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          roll_number: string;
          class_id: string;
          admission_date: string;
          guardian_name: string;
          guardian_phone: string;
          guardian_email?: string | null;
          address?: string | null;
          status?: 'active' | 'inactive' | 'graduated' | 'transferred';
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          roll_number?: string;
          class_id?: string;
          admission_date?: string;
          guardian_name?: string;
          guardian_phone?: string;
          guardian_email?: string | null;
          address?: string | null;
          status?: 'active' | 'inactive' | 'graduated' | 'transferred';
        };
      };
      teacher_assignments: {
        Row: {
          id: string;
          teacher_id: string;
          subject_id: string;
          class_id: string;
          academic_year: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          teacher_id: string;
          subject_id: string;
          class_id: string;
          academic_year: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          teacher_id?: string;
          subject_id?: string;
          class_id?: string;
          academic_year?: string;
        };
      };
      timetable: {
        Row: {
          id: string;
          class_id: string;
          subject_id: string;
          teacher_id: string | null;
          day_of_week: number;
          period: number;
          start_time: string;
          end_time: string;
          room: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          class_id: string;
          subject_id: string;
          teacher_id?: string | null;
          day_of_week: number;
          period: number;
          start_time: string;
          end_time: string;
          room?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          class_id?: string;
          subject_id?: string;
          teacher_id?: string | null;
          day_of_week?: number;
          period?: number;
          start_time?: string;
          end_time?: string;
          room?: string | null;
        };
      };
      attendance: {
        Row: {
          id: string;
          student_id: string;
          class_id: string;
          subject_id: string | null;
          date: string;
          status: 'present' | 'absent' | 'late' | 'excused';
          remarks: string | null;
          marked_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          class_id: string;
          subject_id?: string | null;
          date: string;
          status: 'present' | 'absent' | 'late' | 'excused';
          remarks?: string | null;
          marked_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          class_id?: string;
          subject_id?: string | null;
          date?: string;
          status?: 'present' | 'absent' | 'late' | 'excused';
          remarks?: string | null;
          marked_by?: string | null;
        };
      };
      exam_types: {
        Row: {
          id: string;
          name: string;
          term: string;
          academic_year: string;
          max_marks: number;
          weight: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          term: string;
          academic_year: string;
          max_marks?: number;
          weight?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          term?: string;
          academic_year?: string;
          max_marks?: number;
          weight?: number;
        };
      };
      grades: {
        Row: {
          id: string;
          student_id: string;
          subject_id: string;
          exam_type_id: string;
          marks_obtained: number;
          max_marks: number;
          grade: string | null;
          remarks: string | null;
          graded_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          subject_id: string;
          exam_type_id: string;
          marks_obtained: number;
          max_marks?: number;
          grade?: string | null;
          remarks?: string | null;
          graded_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          subject_id?: string;
          exam_type_id?: string;
          marks_obtained?: number;
          max_marks?: number;
          grade?: string | null;
          remarks?: string | null;
          graded_by?: string | null;
          updated_at?: string;
        };
      };
      identity_cards: {
        Row: {
          id: string;
          user_id: string;
          card_type: 'student' | 'teacher';
          card_data: Record<string, string>;
          color_theme: string;
          design_type: string;
          generated_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          card_type: 'student' | 'teacher';
          card_data: Record<string, string>;
          color_theme?: string;
          design_type?: string;
          generated_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          card_type?: 'student' | 'teacher';
          card_data?: Record<string, string>;
          color_theme?: string;
          design_type?: string;
          generated_by?: string | null;
          updated_at?: string;
        };
      };
      fee_structures: {
        Row: {
          id: string;
          class_id: string;
          fee_type: string;
          amount: number;
          academic_year: string;
          due_date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          class_id: string;
          fee_type: string;
          amount: number;
          academic_year: string;
          due_date: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          class_id?: string;
          fee_type?: string;
          amount?: number;
          academic_year?: string;
          due_date?: string;
        };
      };
      fee_payments: {
        Row: {
          id: string;
          student_id: string;
          fee_structure_id: string;
          amount_paid: number;
          payment_date: string;
          payment_method: string;
          receipt_number: string | null;
          collected_by: string | null;
          status: 'paid' | 'pending' | 'partial' | 'waived';
          created_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          fee_structure_id: string;
          amount_paid: number;
          payment_date: string;
          payment_method?: string;
          receipt_number?: string | null;
          collected_by?: string | null;
          status?: 'paid' | 'pending' | 'partial' | 'waived';
          created_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          fee_structure_id?: string;
          amount_paid?: number;
          payment_date?: string;
          payment_method?: string;
          receipt_number?: string | null;
          collected_by?: string | null;
          status?: 'paid' | 'pending' | 'partial' | 'waived';
        };
      };
      assignments: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          subject_id: string;
          class_id: string;
          teacher_id: string;
          due_date: string;
          max_marks: number;
          status: 'active' | 'closed' | 'draft';
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          subject_id: string;
          class_id: string;
          teacher_id: string;
          due_date: string;
          max_marks?: number;
          status?: 'active' | 'closed' | 'draft';
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          subject_id?: string;
          class_id?: string;
          teacher_id?: string;
          due_date?: string;
          max_marks?: number;
          status?: 'active' | 'closed' | 'draft';
        };
      };
      exams: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          class_id: string;
          subject_id: string;
          teacher_id: string;
          duration_minutes: number;
          total_marks: number;
          pass_percentage: number;
          scheduled_at: string | null;
          status: 'draft' | 'published' | 'closed';
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          class_id: string;
          subject_id: string;
          teacher_id: string;
          duration_minutes?: number;
          total_marks?: number;
          pass_percentage?: number;
          scheduled_at?: string | null;
          status?: 'draft' | 'published' | 'closed';
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          class_id?: string;
          subject_id?: string;
          teacher_id?: string;
          duration_minutes?: number;
          total_marks?: number;
          pass_percentage?: number;
          scheduled_at?: string | null;
          status?: 'draft' | 'published' | 'closed';
        };
      };
      exam_questions: {
        Row: {
          id: string;
          exam_id: string;
          question_text: string;
          options: { key: string; text: string }[];
          correct_key: string;
          marks: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          exam_id: string;
          question_text: string;
          options: { key: string; text: string }[];
          correct_key: string;
          marks?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          exam_id?: string;
          question_text?: string;
          options?: { key: string; text: string }[];
          correct_key?: string;
          marks?: number;
        };
      };
      exam_attempts: {
        Row: {
          id: string;
          exam_id: string;
          student_id: string;
          started_at: string;
          submitted_at: string | null;
          score: number;
          total_marks: number;
          percentage: number;
          status: 'in_progress' | 'submitted' | 'graded';
          created_at: string;
        };
        Insert: {
          id?: string;
          exam_id: string;
          student_id: string;
          started_at?: string;
          submitted_at?: string | null;
          score?: number;
          total_marks?: number;
          percentage?: number;
          status?: 'in_progress' | 'submitted' | 'graded';
          created_at?: string;
        };
        Update: {
          id?: string;
          exam_id?: string;
          student_id?: string;
          started_at?: string;
          submitted_at?: string | null;
          score?: number;
          total_marks?: number;
          percentage?: number;
          status?: 'in_progress' | 'submitted' | 'graded';
        };
      };
      exam_answers: {
        Row: {
          id: string;
          attempt_id: string;
          question_id: string;
          selected_key: string | null;
          is_correct: boolean;
          marks_obtained: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          attempt_id: string;
          question_id: string;
          selected_key?: string | null;
          is_correct?: boolean;
          marks_obtained?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          attempt_id?: string;
          question_id?: string;
          selected_key?: string | null;
          is_correct?: boolean;
          marks_obtained?: number;
        };
      };
      documents: {
        Row: {
          id: string;
          user_id: string;
          student_id: string | null;
          title: string;
          description: string | null;
          file_url: string;
          file_type: string;
          file_size: number;
          category: 'report_card' | 'certificate' | 'assignment' | 'other';
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          student_id?: string | null;
          title: string;
          description?: string | null;
          file_url: string;
          file_type: string;
          file_size?: number;
          category?: 'report_card' | 'certificate' | 'assignment' | 'other';
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          student_id?: string | null;
          title?: string;
          description?: string | null;
          file_url?: string;
          file_type?: string;
          file_size?: number;
          category?: 'report_card' | 'certificate' | 'assignment' | 'other';
        };
      };
      bus_routes: {
        Row: {
          id: string;
          route_name: string;
          driver_name: string;
          driver_phone: string;
          bus_number: string;
          capacity: number;
          start_point: string;
          end_point: string;
          stops: string[];
          departure_time: string;
          arrival_time: string;
          status: 'active' | 'inactive' | 'maintenance';
          created_at: string;
        };
        Insert: {
          id?: string;
          route_name: string;
          driver_name: string;
          driver_phone: string;
          bus_number: string;
          capacity?: number;
          start_point: string;
          end_point: string;
          stops?: string[];
          departure_time: string;
          arrival_time: string;
          status?: 'active' | 'inactive' | 'maintenance';
          created_at?: string;
        };
        Update: {
          id?: string;
          route_name?: string;
          driver_name?: string;
          driver_phone?: string;
          bus_number?: string;
          capacity?: number;
          start_point?: string;
          end_point?: string;
          stops?: string[];
          departure_time?: string;
          arrival_time?: string;
          status?: 'active' | 'inactive' | 'maintenance';
        };
      };
      bus_tracking: {
        Row: {
          id: string;
          route_id: string;
          latitude: number;
          longitude: number;
          speed: number;
          last_updated: string;
        };
        Insert: {
          id?: string;
          route_id: string;
          latitude: number;
          longitude: number;
          speed?: number;
          last_updated?: string;
        };
        Update: {
          id?: string;
          route_id?: string;
          latitude?: number;
          longitude?: number;
          speed?: number;
        };
      };
      exam_schedules: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          class_id: string;
          subject_id: string;
          exam_date: string;
          start_time: string;
          end_time: string;
          total_marks: number;
          room: string | null;
          type: 'midterm' | 'final' | 'quiz' | 'term' | 'other';
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          class_id: string;
          subject_id: string;
          exam_date: string;
          start_time: string;
          end_time: string;
          total_marks?: number;
          room?: string | null;
          type?: 'midterm' | 'final' | 'quiz' | 'term' | 'other';
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          class_id?: string;
          subject_id?: string;
          exam_date?: string;
          start_time?: string;
          end_time?: string;
          total_marks?: number;
          room?: string | null;
          type?: 'midterm' | 'final' | 'quiz' | 'term' | 'other';
          created_by?: string | null;
        };
      };
      admit_cards: {
        Row: {
          id: string;
          student_id: string;
          exam_schedule_id: string;
          card_data: Record<string, string>;
          color_theme: string;
          design_type: string;
          generated_by: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          exam_schedule_id: string;
          card_data: Record<string, string>;
          color_theme?: string;
          design_type?: string;
          generated_by?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          exam_schedule_id?: string;
          card_data?: Record<string, string>;
          color_theme?: string;
          design_type?: string;
          generated_by?: string | null;
          status?: string;
          updated_at?: string;
        };
      };
      student_bus_assignments: {
        Row: {
          id: string;
          student_id: string;
          route_id: string;
          stop_name: string;
          pickup_time: string;
          drop_time: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          route_id: string;
          stop_name: string;
          pickup_time: string;
          drop_time: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          route_id?: string;
          stop_name?: string;
          pickup_time?: string;
          drop_time?: string;
        };
      };
      submissions: {
        Row: {
          id: string;
          assignment_id: string;
          student_id: string;
          submission_text: string | null;
          file_url: string | null;
          submitted_at: string;
          status: 'submitted' | 'graded' | 'late';
          marks_obtained: number | null;
          feedback: string | null;
        };
        Insert: {
          id?: string;
          assignment_id: string;
          student_id: string;
          submission_text?: string | null;
          file_url?: string | null;
          submitted_at?: string;
          status?: 'submitted' | 'graded' | 'late';
          marks_obtained?: number | null;
          feedback?: string | null;
        };
        Update: {
          id?: string;
          assignment_id?: string;
          student_id?: string;
          submission_text?: string | null;
          file_url?: string | null;
          submitted_at?: string;
          status?: 'submitted' | 'graded' | 'late';
          marks_obtained?: number | null;
          feedback?: string | null;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          message: string;
          type: 'info' | 'warning' | 'success' | 'error';
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          message: string;
          type?: 'info' | 'warning' | 'success' | 'error';
          read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          message?: string;
          type?: 'info' | 'warning' | 'success' | 'error';
          read?: boolean;
        };
      };
      events: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          event_date: string;
          end_date: string | null;
          location: string | null;
          type: 'holiday' | 'exam' | 'meeting' | 'sports' | 'cultural' | 'other';
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          event_date: string;
          end_date?: string | null;
          location?: string | null;
          type: 'holiday' | 'exam' | 'meeting' | 'sports' | 'cultural' | 'other';
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          event_date?: string;
          end_date?: string | null;
          location?: string | null;
          type?: 'holiday' | 'exam' | 'meeting' | 'sports' | 'cultural' | 'other';
          created_by?: string | null;
        };
      };
      study_materials: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          file_url: string;
          file_type: string | null;
          subject_id: string;
          class_id: string;
          teacher_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          file_url: string;
          file_type?: string | null;
          subject_id: string;
          class_id: string;
          teacher_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          file_url?: string;
          file_type?: string | null;
          subject_id?: string;
          class_id?: string;
          teacher_id?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          sender_id: string;
          receiver_id: string;
          subject: string;
          body: string;
          parent_id: string | null;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          sender_id: string;
          receiver_id: string;
          subject: string;
          body: string;
          parent_id?: string | null;
          read_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          read_at?: string | null;
        };
      };
      books: {
        Row: {
          id: string;
          title: string;
          author: string;
          isbn: string | null;
          publisher: string | null;
          quantity: number;
          available: number;
          subject_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          author: string;
          isbn?: string | null;
          publisher?: string | null;
          quantity?: number;
          available?: number;
          subject_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          author?: string;
          isbn?: string | null;
          publisher?: string | null;
          quantity?: number;
          available?: number;
          subject_id?: string | null;
        };
      };
      book_borrows: {
        Row: {
          id: string;
          book_id: string;
          borrower_id: string;
          borrower_type: 'student' | 'teacher';
          borrowed_date: string;
          due_date: string;
          returned_date: string | null;
          status: 'active' | 'returned' | 'overdue';
          created_at: string;
        };
        Insert: {
          id?: string;
          book_id: string;
          borrower_id: string;
          borrower_type: 'student' | 'teacher';
          borrowed_date: string;
          due_date: string;
          returned_date?: string | null;
          status?: 'active' | 'returned' | 'overdue';
          created_at?: string;
        };
        Update: {
          id?: string;
          returned_date?: string | null;
          status?: 'active' | 'returned' | 'overdue';
        };
      };
      health_records: {
        Row: {
          id: string;
          student_id: string;
          record_type: 'checkup' | 'vaccination' | 'illness' | 'injury' | 'other';
          title: string;
          description: string | null;
          record_date: string;
          notes: string | null;
          recorded_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          record_type: 'checkup' | 'vaccination' | 'illness' | 'injury' | 'other';
          title: string;
          description?: string | null;
          record_date: string;
          notes?: string | null;
          recorded_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          record_date?: string;
          notes?: string | null;
        };
      };
      gallery_albums: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          cover_url: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          cover_url?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          cover_url?: string | null;
        };
      };
      gallery_images: {
        Row: {
          id: string;
          album_id: string;
          image_url: string;
          caption: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          album_id: string;
          image_url: string;
          caption?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          caption?: string | null;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};

export type User = Database['public']['Tables']['users']['Row'];
export type Class = Database['public']['Tables']['classes']['Row'];
export type Subject = Database['public']['Tables']['subjects']['Row'];
export type Teacher = Database['public']['Tables']['teachers']['Row'];
export type Student = Database['public']['Tables']['students']['Row'];
export type TeacherAssignment = Database['public']['Tables']['teacher_assignments']['Row'];
export type Timetable = Database['public']['Tables']['timetable']['Row'];
export type Attendance = Database['public']['Tables']['attendance']['Row'];
export type ExamType = Database['public']['Tables']['exam_types']['Row'];
export type Grade = Database['public']['Tables']['grades']['Row'];
export type FeeStructure = Database['public']['Tables']['fee_structures']['Row'];
export type FeePayment = Database['public']['Tables']['fee_payments']['Row'];
export type Assignment = Database['public']['Tables']['assignments']['Row'];
export type Exam = Database['public']['Tables']['exams']['Row'];
export type ExamQuestion = Database['public']['Tables']['exam_questions']['Row'];
export type ExamAttempt = Database['public']['Tables']['exam_attempts']['Row'];
export type ExamAnswer = Database['public']['Tables']['exam_answers']['Row'];
export type Document = Database['public']['Tables']['documents']['Row'];
export type BusRoute = Database['public']['Tables']['bus_routes']['Row'];
export type BusTracking = Database['public']['Tables']['bus_tracking']['Row'];
export type StudentBusAssignment = Database['public']['Tables']['student_bus_assignments']['Row'];
export type ExamSchedule = Database['public']['Tables']['exam_schedules']['Row'];
export type AdmitCard = Database['public']['Tables']['admit_cards']['Row'];
export type IdentityCard = Database['public']['Tables']['identity_cards']['Row'];
export type Submission = Database['public']['Tables']['submissions']['Row'];
export type Notification = Database['public']['Tables']['notifications']['Row'];
export type CalendarEvent = Database['public']['Tables']['events']['Row'];
export type StudyMaterial = Database['public']['Tables']['study_materials']['Row'];
export type Message = Database['public']['Tables']['messages']['Row'];
export type Book = Database['public']['Tables']['books']['Row'];
export type BookBorrow = Database['public']['Tables']['book_borrows']['Row'];
export type HealthRecord = Database['public']['Tables']['health_records']['Row'];
export type GalleryAlbum = Database['public']['Tables']['gallery_albums']['Row'];
export type GalleryImage = Database['public']['Tables']['gallery_images']['Row'];

// Extended types with joins
export type StudentWithDetails = Student & {
  user: User;
  class: Class;
};

export type TeacherWithDetails = Teacher & {
  user: User;
};

export type GradeWithDetails = Grade & {
  subject: Subject;
  exam_type: ExamType;
  student: StudentWithDetails;
};

export type TimetableWithDetails = Timetable & {
  subject: Subject;
  teacher: TeacherWithDetails | null;
};

export type AttendanceWithDetails = Attendance & {
  student: StudentWithDetails;
  subject?: Subject | null;
  teacher?: TeacherWithDetails | null;
};

export type FeePaymentWithDetails = FeePayment & {
  fee_structure: FeeStructure;
  student: StudentWithDetails;
};

export type FeeWithStructure = FeePayment & {
  fee_structure: FeeStructure;
};

export type SubmissionWithAssignment = Submission & {
  assignment: Assignment;
};
