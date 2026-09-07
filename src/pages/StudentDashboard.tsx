import React, { useState, useEffect } from 'react';
import {
  Users,
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Mail,
  Phone,
  MapPin,
  User,
  BookOpen,
  DollarSign,
  Upload,
  AlertTriangle,
  Download,
} from 'lucide-react';
import { StatCard, SectionCard } from '../components/ui/Card';
import { Badge } from '../components/ui/Table';
import { useApp } from '../contexts/AppContext';
import { supabase, Grade, Attendance, Assignment, Class, Subject, TimetableWithDetails, Submission, FeeWithStructure } from '../lib/supabase';
import { StudentExamPanel } from '../components/StudentExamPanel';
import { StudyMaterials } from '../components/StudyMaterials';
import { EventCalendar } from '../components/EventCalendar';
import { LibraryPanel } from '../components/LibraryPanel';
import { HealthRecords } from '../components/HealthRecords';
import { CampusGallery } from '../components/CampusGallery';
import { DocumentManager } from '../components/DocumentManager';
import { PaymentModal } from '../components/PaymentModal';
import { BusTracking } from '../components/BusTracking';
import { ExamScheduleManager } from '../components/ExamScheduleManager';
import { StudentIdentityCardView } from '../components/StudentIdentityCardView';
import { StudentAdmitCardView } from '../components/StudentAdmitCardView';

interface AttendanceDetail {
  id: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  subject_name?: string | null;
  teacher_name?: string | null;
}

interface GradeWithDetails extends Grade {
  subject: { name: string; code: string };
  exam_type: { name: string; term: string; max_marks: number };
}

interface StudentDashboardProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function StudentDashboard({ activeTab, setActiveTab }: StudentDashboardProps) {
  const { currentUser, loading: appLoading } = useApp();
  const [loading, setLoading] = useState(true);

  // Data
  const [attendanceHistory, setAttendanceHistory] = useState<Attendance[]>([]);
  const [grades, setGrades] = useState<GradeWithDetails[]>([]);
  const [timetable, setTimetable] = useState<TimetableWithDetails[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [attendanceStats, setAttendanceStats] = useState({ present: 0, absent: 0, late: 0, percentage: 0 });
  const [attendanceDetails, setAttendanceDetails] = useState<AttendanceDetail[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [submissionTexts, setSubmissionTexts] = useState<Record<string, string>>({});
  const [feeData, setFeeData] = useState<FeeWithStructure[]>([]);
  const [feeStructures, setFeeStructures] = useState<Array<{ id: string; fee_type: string; amount: number; due_date: string }>>([]);

  const student = currentUser?.student;

  useEffect(() => {
    if (student?.id) {
      fetchStudentData();
    } else if (!appLoading) {
      setLoading(false);
    }
  }, [student?.id, appLoading]);

  const fetchStudentData = async () => {
    if (!student?.id) return;
    setLoading(true);

    try {
      // Fetch attendance with subject and teacher info
      const { data: attendanceData } = await supabase
        .from('attendance')
        .select(`*, subject:subjects(name), teacher:teachers!marked_by(user:users(full_name))`)
        .eq('student_id', student.id)
        .order('date', { ascending: false });
      setAttendanceHistory(attendanceData || []);

      // Build detailed attendance list
      if (attendanceData) {
        const details: AttendanceDetail[] = attendanceData.map((a: any) => ({
          id: a.id,
          date: a.date,
          status: a.status,
          subject_name: a.subject?.name || null,
          teacher_name: a.teacher?.user?.full_name || null,
        }));
        setAttendanceDetails(details);
      }

      // Calculate attendance stats
      if (attendanceData && attendanceData.length > 0) {
        const present = attendanceData.filter(a => a.status === 'present').length;
        const late = attendanceData.filter(a => a.status === 'late').length;
        const absent = attendanceData.filter(a => a.status === 'absent').length;
        const percentage = Math.round(((present + late) / attendanceData.length) * 100);
        setAttendanceStats({ present, absent, late, percentage });
      }

      // Fetch grades with subject and exam type info
      const { data: gradesData } = await supabase
        .from('grades')
        .select(`
          *,
          subject:subjects(name, code),
          exam_type:exam_types(name, term, max_marks)
        `)
        .eq('student_id', student.id)
        .order('created_at', { ascending: false });
      setGrades(gradesData as GradeWithDetails[] || []);

      // Fetch timetable for student's class
      const { data: schedule } = await supabase
        .from('timetable')
        .select(`*, subject:subjects(*), teacher:teachers(*, user:users(*))`)
        .eq('class_id', student.class_id)
        .order('day_of_week', { ascending: true })
        .order('period', { ascending: true });
      setTimetable(schedule as TimetableWithDetails[] || []);

      // Fetch subjects for this class
      const { data: assignmentData } = await supabase
        .from('teacher_assignments')
        .select(`subject:subjects(*)`)
        .eq('class_id', student.class_id);
      const uniqueSubjects = [...new Set(assignmentData?.map((a: any) => a.subject))];
      setSubjects(uniqueSubjects.filter(Boolean) as Subject[]);

      // Fetch assignments
      const { data: assignmentList } = await supabase
        .from('assignments')
        .select('*')
        .eq('class_id', student.class_id)
        .eq('status', 'active')
        .order('due_date', { ascending: true });
      setAssignments(assignmentList || []);

      // Fetch submissions for this student
      const { data: subData } = await supabase
        .from('submissions')
        .select('*')
        .eq('student_id', student.id);
      setSubmissions(subData || []);

      // Fetch fee structures for student's class
      const { data: feeStructData } = await supabase
        .from('fee_structures')
        .select('*')
        .eq('class_id', student.class_id);
      setFeeStructures(feeStructData || []);

      // Fetch fee payments for this student
      const { data: feePayData } = await supabase
        .from('fee_payments')
        .select(`*, fee_structure:fee_structures(*)`)
        .eq('student_id', student.id);
      setFeeData(feePayData as FeeWithStructure[] || []);

    } catch (error) {
      console.error('Error fetching student data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAssignment = async (assignmentId: string) => {
    if (!submissionTexts[assignmentId]?.trim() || !student?.id) return;
    setSubmittingId(assignmentId);
    try {
      const { error } = await supabase.from('submissions').insert({
        assignment_id: assignmentId,
        student_id: student.id,
        submission_text: submissionTexts[assignmentId],
        status: 'submitted',
        submitted_at: new Date().toISOString(),
      });
      if (error) throw error;
      setSubmissionTexts(prev => ({ ...prev, [assignmentId]: '' }));
      const { data } = await supabase
        .from('submissions')
        .select('*')
        .eq('student_id', student.id);
      setSubmissions(data || []);
    } catch (error) {
      console.error('Error submitting assignment:', error);
    } finally {
      setSubmittingId(null);
    }
  };

  // Calculate GPA from grades
  const calculateGPA = () => {
    if (grades.length === 0) return 'N/A';
    const gradePoints: Record<string, number> = {
      'A+': 4.0, 'A': 4.0, 'A-': 3.7,
      'B+': 3.3, 'B': 3.0, 'B-': 2.7,
      'C+': 2.3, 'C': 2.0, 'C-': 1.7,
      'D': 1.0, 'F': 0
    };
    const finalGrades = grades.filter(g => g.exam_type?.name === 'Final Examination');
    if (finalGrades.length === 0) return 'N/A';
    const totalPoints = finalGrades.reduce((sum, g) => sum + (gradePoints[g.grade || 'F'] || 0), 0);
    return (totalPoints / finalGrades.length).toFixed(2);
  };

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = new Date().getDay();

  // Generate calendar data for current month
  const getCalendarData = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const calendar: Array<{ day: number; date: string; status?: string }[]> = [];
    let week: Array<{ day: number; date: string; status?: string }> = [];

    // Empty cells for days before first of month
    for (let i = 0; i < firstDay; i++) {
      week.push({ day: 0, date: '' });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const attendance = attendanceHistory.find(a => a.date === dateStr);
      week.push({ day, date: dateStr, status: attendance?.status });

      if (week.length === 7) {
        calendar.push(week);
        week = [];
      }
    }

    if (week.length > 0) {
      calendar.push(week);
    }

    return calendar;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { id: 'dashboard', label: 'Dashboard' },
          { id: 'profile', label: 'My Profile' },
          { id: 'attendance', label: 'Attendance' },
          { id: 'timetable', label: 'Timetable' },
          { id: 'assignments', label: 'Assignments' },
          { id: 'exam', label: 'Exam' },
          { id: 'materials_student', label: 'Materials' },
          { id: 'events_student', label: 'Events' },
          { id: 'library_student', label: 'Library' },
          { id: 'health_student', label: 'Health' },
          { id: 'gallery_student', label: 'Gallery' },
          { id: 'documents', label: 'Documents' },
          { id: 'identity', label: 'Identity Card' },
          { id: 'fees', label: 'Fees' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'bg-primary-600 text-white'
                : 'bg-white text-neutral-600 hover:bg-neutral-50 border border-neutral-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Attendance"
              value={`${attendanceStats.percentage}%`}
              icon={Calendar}
              color="green"
              subtitle={`${attendanceStats.present} days present`}
            />
            <StatCard
              title="Current GPA"
              value={calculateGPA()}
              icon={TrendingUp}
              color="blue"
              subtitle="Academic performance"
            />
            <StatCard
              title="Pending Assignments"
              value={assignments.filter(a => new Date(a.due_date) > new Date()).length}
              icon={FileText}
              color="yellow"
              subtitle="Upcoming deadlines"
            />
            <StatCard
              title="Today's Classes"
              value={timetable.filter(t => t.day_of_week === today).length}
              icon={Clock}
              color="purple"
              subtitle={`${dayNames[today]} schedule`}
            />
          </div>

          {/* Profile Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <SectionCard title="My Profile">
                <div className="text-center">
                  <img
                    src={currentUser?.user.avatar_url || 'https://via.placeholder.com/100'}
                    alt={currentUser?.user.full_name}
                    className="w-24 h-24 rounded-full mx-auto object-cover"
                  />
                  <h3 className="mt-4 text-xl font-bold text-neutral-900">{currentUser?.user.full_name}</h3>
                  <p className="text-neutral-500">Class {student?.class?.name || 'N/A'}-{student?.class?.section || 'N/A'}</p>
                  <div className="mt-4 pt-4 border-t border-neutral-100">
                    <p className="text-sm text-neutral-600">
                      <span className="font-medium">Roll No:</span> {student?.roll_number}
                    </p>
                    <p className="text-sm text-neutral-600 mt-1">
                      <span className="font-medium">Email:</span> {currentUser?.user.email}
                    </p>
                  </div>
                </div>
              </SectionCard>
            </div>

            <div className="lg:col-span-2">
              <SectionCard title="Recent Grades" subtitle="Latest academic performance">
                <div className="space-y-3">
                  {grades.slice(0, 4).map((grade) => (
                    <div key={grade.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                      <div>
                        <p className="font-medium text-neutral-900">{grade.subject?.name}</p>
                        <p className="text-sm text-neutral-500">{grade.exam_type?.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-neutral-900">{grade.marks_obtained}/{grade.max_marks}</p>
                        <Badge variant={
                          (grade.marks_obtained / grade.max_marks) >= 0.8 ? 'success' :
                          (grade.marks_obtained / grade.max_marks) >= 0.5 ? 'warning' : 'danger'
                        }>
                          {grade.grade}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            </div>
          </div>

          {/* Today's Schedule */}
          <SectionCard title="Today's Schedule" subtitle={dayNames[today]}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {timetable.filter(t => t.day_of_week === today).length === 0 ? (
                <p className="text-neutral-400 col-span-3 text-center py-4">No classes scheduled for today</p>
              ) : (
                timetable
                  .filter(t => t.day_of_week === today)
                  .map((slot, idx) => (
                    <div key={idx} className="p-4 bg-primary-50 rounded-lg">
                      <p className="font-medium text-primary-900">{slot.subject?.name}</p>
                      <p className="text-sm text-primary-600">{slot.start_time} - {slot.end_time}</p>
                      <p className="text-xs text-primary-500 mt-1">{slot.room || 'Room TBA'}</p>
                    </div>
                  ))
              )}
            </div>
          </SectionCard>
        </div>
      )}

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="max-w-2xl mx-auto">
          <SectionCard title="Student Profile" subtitle="Personal and enrollment details">
            <div className="text-center mb-6">
              <img
                src={currentUser?.user.avatar_url || 'https://via.placeholder.com/120'}
                alt={currentUser?.user.full_name}
                className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-primary-100"
              />
              <h2 className="mt-4 text-2xl font-bold text-neutral-900">{currentUser?.user.full_name}</h2>
              <p className="text-neutral-500">{currentUser?.user.email}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-neutral-700 border-b pb-2">Enrollment Details</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-sm text-neutral-500">Roll Number</p>
                      <p className="font-medium text-neutral-900">{student?.roll_number}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-success-100 rounded-full flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-success-600" />
                    </div>
                    <div>
                      <p className="text-sm text-neutral-500">Class</p>
                      <p className="font-medium text-neutral-900">
                        Grade {student?.class?.name || 'N/A'} - Section {student?.class?.section || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-warning-100 rounded-full flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-warning-600" />
                    </div>
                    <div>
                      <p className="text-sm text-neutral-500">Admission Date</p>
                      <p className="font-medium text-neutral-900">
                        {new Date(student?.admission_date || '').toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-neutral-600" />
                    </div>
                    <div>
                      <p className="text-sm text-neutral-500">Status</p>
                      <Badge variant={student?.status === 'active' ? 'success' : 'default'}>
                        {student?.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-neutral-700 border-b pb-2">Guardian Information</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-sm text-neutral-500">Guardian Name</p>
                      <p className="font-medium text-neutral-900">{student?.guardian_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-success-100 rounded-full flex items-center justify-center">
                      <Phone className="w-5 h-5 text-success-600" />
                    </div>
                    <div>
                      <p className="text-sm text-neutral-500">Phone</p>
                      <p className="font-medium text-neutral-900">{student?.guardian_phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-warning-100 rounded-full flex items-center justify-center">
                      <Mail className="w-5 h-5 text-warning-600" />
                    </div>
                    <div>
                      <p className="text-sm text-neutral-500">Email</p>
                      <p className="font-medium text-neutral-900">{student?.guardian_email || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-neutral-600" />
                    </div>
                    <div>
                      <p className="text-sm text-neutral-500">Address</p>
                      <p className="font-medium text-neutral-900">{student?.address || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SectionCard>
        </div>
      )}

      {/* Attendance Tab */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <SectionCard title="Attendance Summary">
                <div className="text-center">
                  <div className="relative w-40 h-40 mx-auto">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="80"
                        cy="80"
                        r="70"
                        fill="none"
                        stroke="#e4e4e7"
                        strokeWidth="12"
                      />
                      <circle
                        cx="80"
                        cy="80"
                        r="70"
                        fill="none"
                        stroke={attendanceStats.percentage >= 75 ? '#22c55e' : attendanceStats.percentage >= 60 ? '#f59e0b' : '#ef4444'}
                        strokeWidth="12"
                        strokeDasharray={`${(attendanceStats.percentage / 100) * 440} 440`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl font-bold text-neutral-900">{attendanceStats.percentage}%</span>
                      <span className="text-sm text-neutral-500">Attendance</span>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    <div className="flex items-center justify-between p-3 bg-success-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-success-600" />
                        <span className="text-success-700">Present</span>
                      </div>
                      <span className="font-bold text-success-700">{attendanceStats.present}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-warning-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-warning-600" />
                        <span className="text-warning-700">Late</span>
                      </div>
                      <span className="font-bold text-warning-700">{attendanceStats.late}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-danger-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <XCircle className="w-5 h-5 text-danger-600" />
                        <span className="text-danger-700">Absent</span>
                      </div>
                      <span className="font-bold text-danger-700">{attendanceStats.absent}</span>
                    </div>
                  </div>
                </div>
              </SectionCard>
            </div>

            <div className="lg:col-span-2">
              <SectionCard title="Monthly Calendar" subtitle={`${new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}`}>
                <div className="grid grid-cols-7 gap-1 text-center">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="p-2 text-xs font-medium text-neutral-500">
                      {day}
                    </div>
                  ))}
                  {getCalendarData().flat().map((cell, idx) => (
                    <div
                      key={idx}
                      className={`aspect-square flex items-center justify-center text-sm rounded-lg ${
                        cell.day === 0
                          ? ''
                          : cell.status === 'present'
                          ? 'bg-success-100 text-success-700'
                          : cell.status === 'absent'
                          ? 'bg-danger-100 text-danger-700'
                          : cell.status === 'late'
                          ? 'bg-warning-100 text-warning-700'
                          : 'bg-neutral-50 text-neutral-400'
                      }`}
                    >
                      {cell.day > 0 ? cell.day : ''}
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center gap-4 justify-center text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-success-100"></div>
                    <span className="text-neutral-600">Present</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-warning-100"></div>
                    <span className="text-neutral-600">Late</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-danger-100"></div>
                    <span className="text-neutral-600">Absent</span>
                  </div>
                </div>
              </SectionCard>
            </div>
          </div>

          {/* Detailed Attendance History */}
          <SectionCard title="Attendance Details" subtitle="Subject and teacher-wise attendance record">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-200">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Subject</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Marked By</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {attendanceDetails.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-neutral-400">No attendance records found</td>
                    </tr>
                  ) : (
                    attendanceDetails.map((a) => (
                      <tr key={a.id} className="hover:bg-neutral-50">
                        <td className="px-4 py-3 text-sm text-neutral-900">{new Date(a.date).toLocaleDateString()}</td>
                        <td className="px-4 py-3 text-sm text-neutral-700">{a.subject_name || '-'}</td>
                        <td className="px-4 py-3 text-sm text-neutral-700">{a.teacher_name || '-'}</td>
                        <td className="px-4 py-3">
                          <Badge variant={a.status === 'present' ? 'success' : a.status === 'absent' ? 'danger' : a.status === 'late' ? 'warning' : 'info'}>
                            {a.status}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </div>
      )}

      {/* Timetable Tab */}
      {activeTab === 'timetable' && (
        <SectionCard title="Class Timetable" subtitle="Weekly class schedule">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr>
                  <th className="px-2 py-3 text-left text-xs font-semibold text-neutral-500 uppercase w-20">Period</th>
                  <th className="px-2 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Monday</th>
                  <th className="px-2 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Tuesday</th>
                  <th className="px-2 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Wednesday</th>
                  <th className="px-2 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Thursday</th>
                  <th className="px-2 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Friday</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5, 6].map((period) => (
                  <tr key={period} className="border-t border-neutral-100">
                    <td className="px-2 py-2">
                      <div className="text-sm font-medium text-neutral-900">
                        {period}
                      </div>
                      <div className="text-xs text-neutral-400">
                        {period === 1 && '8:00'}
                        {period === 2 && '8:50'}
                        {period === 3 && '9:40'}
                        {period === 4 && '10:40'}
                        {period === 5 && '11:30'}
                        {period === 6 && '12:15'}
                      </div>
                    </td>
                    {[1, 2, 3, 4, 5].map((day) => {
                      const slot = timetable.find(t => t.day_of_week === day && t.period === period);
                      const isToday = day === today;
                      return (
                        <td key={day} className="px-2 py-2">
                          {slot ? (
                            <div className={`p-2 rounded-lg ${isToday ? 'bg-primary-100 border-2 border-primary-500' : 'bg-neutral-50'}`}>
                              <p className={`font-medium text-sm ${isToday ? 'text-primary-700' : 'text-neutral-900'}`}>
                                {slot.subject?.name}
                              </p>
                              <p className={`text-xs ${isToday ? 'text-primary-500' : 'text-neutral-500'}`}>
                                {slot.room || 'TBA'}
                              </p>
                            </div>
                          ) : (
                            <div className="p-2 text-center text-neutral-300 text-sm">-</div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      )}

      {/* Assignments Tab */}
      {activeTab === 'assignments' && (
        <SectionCard title="Assignments" subtitle="Active and upcoming assignments">
          <div className="space-y-4">
            {assignments.length === 0 ? (
              <p className="text-center text-neutral-400 py-8">No active assignments</p>
            ) : (
              assignments.map((assignment) => {
                const daysLeft = Math.ceil((new Date(assignment.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                const isOverdue = daysLeft < 0;
                const isUrgent = daysLeft <= 3 && !isOverdue;
                const mySubmission = submissions.find(s => s.assignment_id === assignment.id);
                const isSubmitted = !!mySubmission;
                const isLate = isSubmitted && mySubmission.status === 'late';

                return (
                  <div
                    key={assignment.id}
                    className={`p-4 rounded-lg border ${
                      isSubmitted
                        ? 'bg-success-50/50 border-success-200'
                        : isOverdue
                        ? 'bg-danger-50 border-danger-200'
                        : isUrgent
                        ? 'bg-warning-50 border-warning-200'
                        : 'bg-neutral-50 border-neutral-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-neutral-900">{assignment.title}</h4>
                        <p className="text-sm text-neutral-500 mt-1">{assignment.description}</p>
                        <div className="flex items-center gap-4 mt-3">
                          <span className="text-sm text-neutral-600">
                            <BookOpen className="w-4 h-4 inline mr-1" />
                            {subjects.find(s => s.id === assignment.subject_id)?.name || 'Subject'}
                          </span>
                          <span className="text-sm text-neutral-600">
                            Max Marks: {assignment.max_marks}
                          </span>
                        </div>

                        {isSubmitted && (
                          <div className="mt-3 p-3 bg-white rounded-lg border border-success-200">
                            <div className="flex items-center gap-2 text-success-700">
                              <CheckCircle className="w-4 h-4" />
                              <span className="font-medium text-sm">Submitted</span>
                              {isLate && (
                                <Badge variant="warning">Late Submission</Badge>
                              )}
                            </div>
                            {mySubmission.submission_text && (
                              <p className="text-sm text-neutral-600 mt-2">
                                Your response: {mySubmission.submission_text}
                              </p>
                            )}
                            {mySubmission.status === 'graded' && (
                              <div className="mt-2 pt-2 border-t border-success-100">
                                <div className="flex items-center gap-3">
                                  <span className="text-sm font-medium text-neutral-700">
                                    Marks: {mySubmission.marks_obtained}/{assignment.max_marks}
                                  </span>
                                  {mySubmission.feedback && (
                                    <span className="text-sm text-neutral-500">
                                      Feedback: {mySubmission.feedback}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="text-right ml-4">
                        {isSubmitted ? (
                          <Badge variant="success">Submitted</Badge>
                        ) : (
                          <Badge
                            variant={
                              isOverdue ? 'danger' : isUrgent ? 'warning' : 'info'
                            }
                          >
                            {isOverdue
                              ? 'Overdue'
                              : daysLeft === 0
                              ? 'Due Today'
                              : `${daysLeft} days left`}
                          </Badge>
                        )}
                        <p className="text-sm text-neutral-500 mt-2">
                          Due: {new Date(assignment.due_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {!isSubmitted && !isOverdue && (
                      <div className="mt-4 pt-4 border-t border-neutral-200">
                        <div className="flex gap-3">
                          <input
                            type="text"
                            placeholder="Type your answer or submission text..."
                            value={submissionTexts[assignment.id] || ''}
                            onChange={(e) => setSubmissionTexts(prev => ({
                              ...prev,
                              [assignment.id]: e.target.value
                            }))}
                            className="flex-1 px-4 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                          <button
                            onClick={() => handleSubmitAssignment(assignment.id)}
                            disabled={submittingId === assignment.id || !submissionTexts[assignment.id]?.trim()}
                            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg font-medium text-sm hover:bg-primary-700 transition-colors disabled:bg-primary-300"
                          >
                            {submittingId === assignment.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            ) : (
                              <>
                                <Upload className="w-4 h-4" />
                                Submit
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </SectionCard>
      )}

      {/* Exam Tab */}
      {activeTab === 'exam' && (
        <div className="space-y-8">
          {/* Report Card */}
          <SectionCard title="Report Card" subtitle="Academic performance across all subjects">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-200">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Subject</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Exam</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-neutral-500 uppercase">Marks</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-neutral-500 uppercase">Percentage</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-neutral-500 uppercase">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {grades.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-neutral-400">
                        No grades available yet
                      </td>
                    </tr>
                  ) : (
                    grades.map((grade) => {
                      const percentage = Math.round((grade.marks_obtained / grade.max_marks) * 100);
                      return (
                        <tr key={grade.id} className="hover:bg-neutral-50">
                          <td className="px-4 py-4">
                            <div>
                              <p className="font-medium text-neutral-900">{grade.subject?.name}</p>
                              <p className="text-sm text-neutral-500">{grade.subject?.code}</p>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div>
                              <p className="font-medium text-neutral-900">{grade.exam_type?.name}</p>
                              <p className="text-sm text-neutral-500">{grade.exam_type?.term}</p>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span className="font-mono text-neutral-900">
                              {grade.marks_obtained}/{grade.max_marks}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <Badge
                              variant={
                                percentage >= 80 ? 'success' :
                                percentage >= 60 ? 'warning' : 'danger'
                              }
                            >
                              {percentage}%
                            </Badge>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full font-bold ${
                              percentage >= 80 ? 'bg-success-100 text-success-700' :
                              percentage >= 60 ? 'bg-warning-100 text-warning-700' :
                              'bg-danger-100 text-danger-700'
                            }`}>
                              {grade.grade}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            {grades.length > 0 && (
              <div className="mt-6 pt-6 border-t border-neutral-200">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-primary-50 rounded-lg">
                    <p className="text-sm text-primary-600">Overall GPA</p>
                    <p className="text-3xl font-bold text-primary-700 mt-1">{calculateGPA()}</p>
                  </div>
                  <div className="text-center p-4 bg-success-50 rounded-lg">
                    <p className="text-sm text-success-600">Highest Score</p>
                    <p className="text-3xl font-bold text-success-700 mt-1">
                      {Math.max(...grades.map(g => (g.marks_obtained / g.max_marks) * 100)).toFixed(0)}%
                    </p>
                  </div>
                  <div className="text-center p-4 bg-warning-50 rounded-lg">
                    <p className="text-sm text-warning-600">Average Score</p>
                    <p className="text-3xl font-bold text-warning-700 mt-1">
                      {(grades.reduce((sum, g) => sum + (g.marks_obtained / g.max_marks) * 100, 0) / grades.length).toFixed(0)}%
                    </p>
                  </div>
                </div>
              </div>
            )}
          </SectionCard>

          {/* Online Exams */}
          <div className="border-t border-neutral-200 pt-8">
            <StudentExamPanel studentId={student?.id || ''} classId={student?.class_id || ''} />
          </div>
          <div className="border-t border-neutral-200 pt-8">
            <ExamScheduleManager classes={[]} subjects={subjects} readOnly classId={student?.class_id || ''} />
          </div>
          <div className="border-t border-neutral-200 pt-8">
            <StudentAdmitCardView />
          </div>
        </div>
      )}

      {/* Documents Tab */}
      {activeTab === 'documents' && (
        <DocumentManager userId={currentUser?.user.id || ''} studentId={student?.id} />
      )}

      {/* Student Materials Tab */}
      {activeTab === 'materials_student' && (
        <StudyMaterials mode="student" classId={student?.class_id || ''} subjects={subjects} />
      )}

      {/* Student Events Tab */}
      {activeTab === 'events_student' && (
        <EventCalendar readOnly />
      )}

      {/* Student Library Tab */}
      {activeTab === 'library_student' && (
        <LibraryPanel mode="student" userId={currentUser?.user.id || ''} borrowerId={student?.id} borrowerType="student" />
      )}

      {/* Student Health Records Tab */}
      {activeTab === 'health_student' && (
        <HealthRecords mode="student" studentId={student?.id || ''} readOnly />
      )}

      {/* Student Gallery Tab */}
      {activeTab === 'gallery_student' && (
        <CampusGallery mode="viewer" />
      )}

      {/* Identity Card Tab */}
      {activeTab === 'identity' && <StudentIdentityCardView />}

      {/* Bus Tracking Tab */}
      {activeTab === 'bus' && <BusTracking readOnly />}

      {/* Fees Tab */}
      {activeTab === 'fees' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-primary-50 rounded-xl p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm text-primary-600 font-medium">Total Fees</p>
                  <p className="text-2xl font-bold text-primary-700">
                    ₹{feeStructures.reduce((sum, f) => sum + f.amount, 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-success-50 rounded-xl p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-success-600" />
                </div>
                <div>
                  <p className="text-sm text-success-600 font-medium">Paid</p>
                  <p className="text-2xl font-bold text-success-700">
                    ₹{feeData.filter(f => f.status === 'paid').reduce((sum, f) => sum + f.amount_paid, 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-warning-50 rounded-xl p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-warning-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-warning-600" />
                </div>
                <div>
                  <p className="text-sm text-warning-600 font-medium">Pending</p>
                  <p className="text-2xl font-bold text-warning-700">
                    ₹{(feeStructures.reduce((sum, f) => sum + f.amount, 0) - feeData.filter(f => f.status === 'paid' || f.status === 'partial').reduce((sum, f) => sum + f.amount_paid, 0)).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <SectionCard title="Fee Breakdown" subtitle="Fee structure and payment status">
            {feeStructures.length === 0 ? (
              <p className="text-center text-neutral-400 py-8">No fee structure defined for your class</p>
            ) : (
              <div className="space-y-3">
                {feeStructures.map((fee) => {
                  const payments = feeData.filter(f => f.fee_structure_id === fee.id);
                  const totalPaid = payments.reduce((sum, p) => sum + p.amount_paid, 0);
                  const isFullyPaid = totalPaid >= fee.amount;
                  const isPartial = totalPaid > 0 && totalPaid < fee.amount;
                  const dueDate = new Date(fee.due_date);
                  const isDueOverdue = dueDate < new Date() && !isFullyPaid;

                  return (
                    <div key={fee.id} className="p-4 bg-neutral-50 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-neutral-900">{fee.fee_type}</h4>
                          <p className="text-sm text-neutral-500">
                            Due: {dueDate.toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-neutral-900">₹{fee.amount.toLocaleString()}</p>
                          <Badge
                            variant={
                              isFullyPaid ? 'success' :
                              isPartial ? 'warning' : 'danger'
                            }
                          >
                            {isFullyPaid ? 'Paid' : isPartial ? 'Partial' : 'Unpaid'}
                          </Badge>
                        </div>
                      </div>
                      {isDueOverdue && !isFullyPaid && (
                        <div className="flex items-center gap-2 text-xs text-danger-600 bg-danger-50 px-3 py-2 rounded-lg">
                          <AlertCircle className="w-3.5 h-3.5" />
                          Payment overdue
                        </div>
                      )}
                      {totalPaid > 0 && (
                        <div className="mt-2">
                          <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                isFullyPaid ? 'bg-success-500' : 'bg-warning-500'
                              }`}
                              style={{ width: `${Math.min(100, (totalPaid / fee.amount) * 100)}%` }}
                            />
                          </div>
                          <p className="text-xs text-neutral-500 mt-1">
                            ₹{totalPaid.toLocaleString()} paid of ₹{fee.amount.toLocaleString()}
                          </p>
                        </div>
                      )}
                      {!isFullyPaid && (
                        <div className="mt-3 flex justify-end">
                          <PaymentModal
                            feeId={fee.id}
                            feeType={fee.fee_type}
                            amount={fee.amount}
                            totalPaid={totalPaid}
                            studentId={student?.id || ''}
                            onSuccess={() => { setActiveTab('fees'); }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </SectionCard>
        </div>
      )}
    </div>
  );
}
