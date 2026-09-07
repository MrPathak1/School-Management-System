import React, { useState, useEffect } from 'react';
import {
  Users,
  ClipboardCheck,
  FileWarning,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Save,
  Search,
  BookOpen,
  Plus,
  Trash2,
  FileText,
} from 'lucide-react';
import { StatCard, SectionCard } from '../components/ui/Card';
import { Table, Badge, Button, Input, Select } from '../components/ui/Table';
import { useToastStore } from '../hooks/useToast';
import { useApp } from '../contexts/AppContext';
import { supabase, Student, Class, Subject, ExamType, Attendance, Grade, Assignment, TimetableWithDetails } from '../lib/supabase';
import { TeacherExamPanel } from '../components/TeacherExamPanel';
import { DocumentManager } from '../components/DocumentManager';
import { ExamScheduleManager } from '../components/ExamScheduleManager';
import { TeacherIdentityCardView } from '../components/TeacherIdentityCardView';
import { StudyMaterials } from '../components/StudyMaterials';
import { MessagingPanel } from '../components/MessagingPanel';
import { EventCalendar } from '../components/EventCalendar';
import { LibraryPanel } from '../components/LibraryPanel';
import { HealthRecords } from '../components/HealthRecords';
import { CampusGallery } from '../components/CampusGallery';

interface StudentWithAttendance extends Student {
  user: { full_name: string; avatar_url: string | null };
  attendance_status?: 'present' | 'absent' | 'late' | 'excused';
}

interface TeacherDashboardProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function TeacherDashboard({ activeTab, setActiveTab }: TeacherDashboardProps) {
  const { currentUser, loading: appLoading } = useApp();
  const [loading, setLoading] = useState(true);

  // Data
  const [assignedClasses, setAssignedClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<StudentWithAttendance[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [examTypes, setExamTypes] = useState<ExamType[]>([]);
  const [timetable, setTimetable] = useState<TimetableWithDetails[]>([]);
  const [pendingGrades, setPendingGrades] = useState(0);
  const [teacherAssignmentLinks, setTeacherAssignmentLinks] = useState<Array<{ class_id: string; subject_id: string }>>([]);

  // Form states
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedExamType, setSelectedExamType] = useState('');
  const [attendanceSubject, setAttendanceSubject] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceData, setAttendanceData] = useState<Record<string, 'present' | 'absent' | 'late' | 'excused'>>({});
  const [gradesData, setGradesData] = useState<Record<string, number>>({});

  const [saving, setSaving] = useState(false);
  const addToast = useToastStore((s) => s.addToast);

  // Assignment state
  const [teacherAssignments, setTeacherAssignments] = useState<Assignment[]>([]);
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [assignmentForm, setAssignmentForm] = useState({
    title: '',
    description: '',
    subject_id: '',
    class_id: '',
    due_date: '',
    max_marks: 100,
  });

  const teacherId = currentUser?.teacher?.id;

  useEffect(() => {
    if (teacherId) {
      fetchTeacherData();
    } else if (!appLoading) {
      // AppContext finished loading but no teacher found — stop spinner
      setLoading(false);
    }
  }, [teacherId, appLoading]);

  const fetchTeacherData = async () => {
    setLoading(true);
    try {
      // Fetch teacher assignments
      const { data: assignments } = await supabase
        .from('teacher_assignments')
        .select(`*, class:classes(*), subject:subjects(*)`)
        .eq('teacher_id', teacherId);

      if (assignments && assignments.length > 0) {
        const classIds = [...new Set(assignments.map((a: any) => a.class_id))];
        const subjectIds = [...new Set(assignments.map((a: any) => a.subject_id))];

        // Fetch classes and subjects
        const classes = assignments.map((a: any) => a.class).filter(Boolean);
        const subjects = assignments.map((a: any) => a.subject).filter(Boolean);

        setAssignedClasses(classes as Class[]);
        setSubjects(subjects as Subject[]);
        setTeacherAssignmentLinks(assignments.map((a: any) => ({ class_id: a.class_id, subject_id: a.subject_id })));

        // Set default selections
        setSelectedClass(classIds[0] || '');
        setSelectedSubject(subjectIds[0] || '');
      }

      // Fetch teacher's assignments
      const { data: myAssignments } = await supabase
        .from('assignments')
        .select('*')
        .eq('teacher_id', teacherId)
        .order('created_at', { ascending: false });
      setTeacherAssignments(myAssignments || []);

      // Fetch exam types
      const { data: exams } = await supabase
        .from('exam_types')
        .select('*')
        .order('created_at', { ascending: true });
      setExamTypes(exams || []);
      if (exams && exams.length > 0) {
        setSelectedExamType(exams[0].id);
      }

      // Fetch timetable
      const { data: schedule } = await supabase
        .from('timetable')
        .select(`*, subject:subjects(*), teacher:teachers(*, user:users(*))`)
        .eq('teacher_id', teacherId)
        .order('day_of_week', { ascending: true })
        .order('period', { ascending: true });
      setTimetable(schedule as TimetableWithDetails[] || []);

      // Count pending grades (students without grades for current exam)
      const { count } = await supabase
        .from('grades')
        .select('*', { count: 'exact', head: true })
        .is('graded_by', null);
      setPendingGrades(count || 0);

    } catch (error) {
      console.error('Error fetching teacher data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentsForClass = async (classId: string) => {
    const { data: studentsData } = await supabase
      .from('students')
      .select(`*, user:users(full_name, avatar_url)`)
      .eq('class_id', classId)
      .eq('status', 'active')
      .order('roll_number');
    setStudents(studentsData as StudentWithAttendance[] || []);
  };

  const fetchAttendanceData = async (classId: string, date: string) => {
    let query = supabase
      .from('attendance')
      .select('student_id, status')
      .eq('class_id', classId)
      .eq('date', date);
    if (attendanceSubject) {
      query = query.eq('subject_id', attendanceSubject);
    }
    const { data: existingAttendance } = await query;

    const attendanceMap: Record<string, 'present' | 'absent' | 'late' | 'excused'> = {};
    existingAttendance?.forEach((a: any) => {
      attendanceMap[a.student_id] = a.status;
    });
    setAttendanceData(attendanceMap);
  };

  const fetchGradesForSubject = async (classId: string, subjectId: string, examTypeId: string) => {
    await fetchStudentsForClass(classId);

    const { data: existingGrades } = await supabase
      .from('grades')
      .select('student_id, marks_obtained')
      .eq('subject_id', subjectId)
      .eq('exam_type_id', examTypeId)
      .in('student_id', students.map(s => s.id).length > 0 ? students.map(s => s.id) : ['__none__']);

    const gradesMap: Record<string, number> = {};
    existingGrades?.forEach((g: any) => {
      gradesMap[g.student_id] = g.marks_obtained;
    });
    setGradesData(gradesMap);
  };

  useEffect(() => {
    if (selectedClass && activeTab === 'attendance') {
      fetchStudentsForClass(selectedClass);
      // Set default subject from assignment links
      const available = teacherAssignmentLinks.filter(l => l.class_id === selectedClass);
      const defaultSubj = available.length > 0 ? available[0].subject_id : '';
      if (defaultSubj && defaultSubj !== attendanceSubject) {
        setAttendanceSubject(defaultSubj);
      }
      fetchAttendanceData(selectedClass, selectedDate);
    }
  }, [selectedClass, selectedDate, activeTab]);

  useEffect(() => {
    if (selectedClass && selectedSubject && selectedExamType && activeTab === 'grades') {
      fetchGradesForSubject(selectedClass, selectedSubject, selectedExamType);
    }
  }, [selectedClass, selectedSubject, selectedExamType, activeTab]);

  const handleAttendanceChange = (studentId: string, status: 'present' | 'absent' | 'late' | 'excused') => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleGradeChange = (studentId: string, marks: number, maxMarks: number) => {
    setGradesData(prev => ({
      ...prev,
      [studentId]: Math.min(maxMarks, Math.max(0, marks)),
    }));
  };

  const handleCreateAssignment = async () => {
    if (!assignmentForm.title || !assignmentForm.subject_id || !assignmentForm.class_id || !assignmentForm.due_date) {
      addToast({ type: 'error', title: 'Please fill all required fields' });
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase.from('assignments').insert({
        title: assignmentForm.title,
        description: assignmentForm.description,
        subject_id: assignmentForm.subject_id,
        class_id: assignmentForm.class_id,
        teacher_id: teacherId,
        due_date: assignmentForm.due_date,
        max_marks: assignmentForm.max_marks,
        status: 'active',
      });
      if (error) throw error;

      // Send notifications to students in this class
      const { data: classStudents } = await supabase
        .from('students')
        .select('user_id')
        .eq('class_id', assignmentForm.class_id)
        .eq('status', 'active');
      if (classStudents) {
        const notifs = classStudents.map((s: any) => ({
          user_id: s.user_id,
          title: 'New Assignment',
          message: `${assignmentForm.title} has been posted - Due: ${new Date(assignmentForm.due_date).toLocaleDateString()}`,
          type: 'info',
        }));
        await supabase.from('notifications').insert(notifs);
      }

      addToast({ type: 'success', title: 'Assignment created successfully' });
      setShowAssignmentForm(false);
      setAssignmentForm({ title: '', description: '', subject_id: '', class_id: '', due_date: '', max_marks: 100 });
      // Refresh assignments
      const { data } = await supabase
        .from('assignments')
        .select('*')
        .eq('teacher_id', teacherId)
        .order('created_at', { ascending: false });
      setTeacherAssignments(data || []);
    } catch (error) {
      console.error(error);
      addToast({ type: 'error', title: 'Failed to create assignment' });
    } finally {
      setSaving(false);
    }
  };

  const handleCloseAssignment = async (id: string) => {
    await supabase.from('assignments').update({ status: 'closed' }).eq('id', id);
    setTeacherAssignments(prev => prev.map(a => a.id === id ? { ...a, status: 'closed' as const } : a));
    addToast({ type: 'success', title: 'Assignment closed' });
  };

  const handleDeleteAssignment = async (id: string) => {
    if (!confirm('Delete this assignment? This cannot be undone.')) return;
    await supabase.from('assignments').delete().eq('id', id);
    setTeacherAssignments(prev => prev.filter(a => a.id !== id));
    addToast({ type: 'success', title: 'Assignment deleted' });
  };

  const saveAttendance = async () => {
    if (!selectedClass || !selectedDate || !attendanceSubject) {
      addToast({ type: 'error', title: 'Please select a class, date, and subject' });
      return;
    }
    setSaving(true);
    try {
      // Delete existing attendance for this class/date/subject
      await supabase
        .from('attendance')
        .delete()
        .eq('class_id', selectedClass)
        .eq('date', selectedDate)
        .eq('subject_id', attendanceSubject);

      // Insert new attendance records
      const records = Object.entries(attendanceData).map(([studentId, status]) => ({
        student_id: studentId,
        class_id: selectedClass,
        subject_id: attendanceSubject,
        date: selectedDate,
        status,
        marked_by: teacherId,
      }));

      if (records.length > 0) {
        await supabase.from('attendance').insert(records);
      }

      // Notify absent students
      const absentStudents = Object.entries(attendanceData)
        .filter(([, status]) => status === 'absent')
        .map(([studentId]) => studentId);
      if (absentStudents.length > 0) {
        const { data: absentUsers } = await supabase
          .from('students')
          .select('user_id')
          .in('id', absentStudents);
        if (absentUsers) {
          await supabase.from('notifications').insert(
            absentUsers.map((s: any) => ({
              user_id: s.user_id,
              title: 'Attendance Alert',
              message: `You were marked absent on ${new Date(selectedDate).toLocaleDateString()}`,
              type: 'warning',
            }))
          );
        }
      }

      addToast({ type: 'success', title: 'Attendance saved successfully' });
    } catch (error) {
      console.error(error);
      addToast({ type: 'error', title: 'Failed to save attendance' });
    } finally {
      setSaving(false);
    }
  };

  const saveGrades = async () => {
    if (!selectedSubject || !selectedExamType) return;
    setSaving(true);
    try {
      const examType = examTypes.find(e => e.id === selectedExamType);
      const maxMarks = examType?.max_marks || 100;

      // Delete existing grades for this subject/exam
      await supabase
        .from('grades')
        .delete()
        .eq('subject_id', selectedSubject)
        .eq('exam_type_id', selectedExamType);

      // Insert new grades
      const records = Object.entries(gradesData)
        .filter(([, marks]) => marks !== undefined && marks !== null)
        .map(([studentId, marks]) => {
          const percentage = (marks / maxMarks) * 100;
          let grade = 'F';
          if (percentage >= 90) grade = 'A+';
          else if (percentage >= 85) grade = 'A';
          else if (percentage >= 80) grade = 'A-';
          else if (percentage >= 75) grade = 'B+';
          else if (percentage >= 70) grade = 'B';
          else if (percentage >= 65) grade = 'B-';
          else if (percentage >= 60) grade = 'C+';
          else if (percentage >= 55) grade = 'C';
          else if (percentage >= 50) grade = 'C-';
          else if (percentage >= 40) grade = 'D';

          return {
            student_id: studentId,
            subject_id: selectedSubject,
            exam_type_id: selectedExamType,
            marks_obtained: marks,
            max_marks: maxMarks,
            grade,
            graded_by: teacherId,
          };
        });

      if (records.length > 0) {
        await supabase.from('grades').insert(records);
      }

      // Notify students about their grades
      const subjectName = subjects.find(s => s.id === selectedSubject)?.name || 'Subject';
      const examName = examTypes.find(e => e.id === selectedExamType)?.name || 'Exam';
      const gradeRecipients = Object.keys(gradesData);
      if (gradeRecipients.length > 0) {
        const { data: gradeStudents } = await supabase
          .from('students')
          .select('user_id')
          .in('id', gradeRecipients);
        if (gradeStudents) {
          await supabase.from('notifications').insert(
            gradeStudents.map((s: any) => ({
              user_id: s.user_id,
              title: 'Results Published',
              message: `Your ${examName} results for ${subjectName} are now available`,
              type: 'success',
            }))
          );
        }
      }

      addToast({ type: 'success', title: 'Grades saved successfully' });
    } catch (error) {
      console.error(error);
      addToast({ type: 'error', title: 'Failed to save grades' });
    } finally {
      setSaving(false);
    }
  };

  const markAllPresent = () => {
    const newAttendance: Record<string, 'present' | 'absent' | 'late' | 'excused'> = {};
    students.forEach(s => {
      newAttendance[s.id] = 'present';
    });
    setAttendanceData(newAttendance);
  };

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = new Date().getDay();

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
          { id: 'attendance', label: 'Attendance' },
          { id: 'grades', label: 'Grade Book' },
          { id: 'assignments', label: 'Assignments' },
          { id: 'exams', label: 'Exams' },
          { id: 'exam_schedule', label: 'Exam Schedule' },
          { id: 'materials_teacher', label: 'Materials' },
          { id: 'messages_teacher', label: 'Messages' },
          { id: 'events_teacher', label: 'Events' },
          { id: 'library_teacher', label: 'Library' },
          { id: 'health_teacher', label: 'Health' },
          { id: 'gallery_teacher', label: 'Gallery' },
          { id: 'documents', label: 'Documents' },
          { id: 'identity', label: 'Identity Card' },
          { id: 'schedule', label: 'Schedule' },
          { id: 'students', label: 'My Students' },
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
              title="Assigned Classes"
              value={assignedClasses.length}
              icon={BookOpen}
              color="blue"
            />
            <StatCard
              title="Total Students"
              value={students.length || Object.keys(gradesData).length}
              icon={Users}
              color="green"
            />
            <StatCard
              title="Pending Grades"
              value={pendingGrades}
              icon={FileWarning}
              color="yellow"
              subtitle="Needs submission"
            />
            <StatCard
              title="Today's Classes"
              value={timetable.filter(t => t.day_of_week === today).length}
              icon={Calendar}
              color="purple"
            />
          </div>

          {/* Today's Schedule */}
          <SectionCard title="Today's Schedule" subtitle={dayNames[today]}>
            <div className="space-y-3">
              {timetable.filter(t => t.day_of_week === today).length === 0 ? (
                <p className="text-neutral-400 text-center py-4">No classes scheduled for today</p>
              ) : (
                timetable
                  .filter(t => t.day_of_week === today)
                  .map((slot, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-4 p-4 bg-neutral-50 rounded-lg"
                    >
                      <div className="w-16 text-center">
                        <p className="text-sm font-medium text-neutral-900">{slot.start_time}</p>
                        <p className="text-xs text-neutral-500">{slot.end_time}</p>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-neutral-900">{slot.subject?.name}</p>
                        <p className="text-sm text-neutral-500">Period {slot.period} - {slot.room || 'TBA'}</p>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </SectionCard>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setActiveTab('attendance')}
              className="p-6 bg-white border border-neutral-200 rounded-xl hover:shadow-md transition-shadow text-left"
            >
              <ClipboardCheck className="w-8 h-8 text-primary-600 mb-3" />
              <h3 className="font-semibold text-neutral-900">Mark Attendance</h3>
              <p className="text-sm text-neutral-500 mt-1">Record daily student attendance</p>
            </button>
            <button
              onClick={() => setActiveTab('grades')}
              className="p-6 bg-white border border-neutral-200 rounded-xl hover:shadow-md transition-shadow text-left"
            >
              <FileWarning className="w-8 h-8 text-warning-600 mb-3" />
              <h3 className="font-semibold text-neutral-900">Enter Grades</h3>
              <p className="text-sm text-neutral-500 mt-1">Submit student exam marks</p>
            </button>
          </div>
        </div>
      )}

      {/* Attendance Tab */}
      {activeTab === 'attendance' && (
        <SectionCard
          title="Attendance Tracker"
          subtitle="Mark student attendance for selected class, subject, and date"
          action={
            <div className="flex gap-3">
              <Select
                value={selectedClass}
                onChange={(e) => { setSelectedClass(e.target.value); setAttendanceSubject(''); }}
                options={[
                  { value: '', label: 'Select Class' },
                  ...assignedClasses.map((c) => ({ value: c.id, label: `Grade ${c.name}-${c.section}` })),
                ]}
              />
              <Select
                value={attendanceSubject}
                onChange={(e) => { setAttendanceSubject(e.target.value); fetchAttendanceData(selectedClass, selectedDate); }}
                options={[
                  { value: '', label: 'Select Subject' },
                  ...teacherAssignmentLinks
                    .filter(l => l.class_id === selectedClass)
                    .map(l => {
                      const subj = subjects.find(s => s.id === l.subject_id);
                      return { value: l.subject_id, label: subj?.name || 'Unknown' };
                    })
                    .filter((v, i, a) => a.findIndex(t => t.value === v.value) === i),
                ]}
              />
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
          }
        >
          {selectedClass && attendanceSubject ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-neutral-500">
                  {students.length} students | {subjects.find(s => s.id === attendanceSubject)?.name} | Date: {new Date(selectedDate).toLocaleDateString()}
                </p>
                <Button variant="secondary" onClick={markAllPresent}>
                  Mark All Present
                </Button>
              </div>
              <div className="space-y-2">
                {students.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={student.user.avatar_url || 'https://via.placeholder.com/40'}
                        alt={student.user.full_name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium text-neutral-900">{student.user.full_name}</p>
                        <p className="text-sm text-neutral-500">{student.roll_number}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {(['present', 'absent', 'late', 'excused'] as const).map((status) => {
                        const isSelected = attendanceData[student.id] === status;
                        const statusConfig = {
                          present: { icon: CheckCircle, color: 'success', label: 'Present' },
                          absent: { icon: XCircle, color: 'danger', label: 'Absent' },
                          late: { icon: Clock, color: 'warning', label: 'Late' },
                          excused: { icon: FileWarning, color: 'info', label: 'Excused' },
                        };
                        const config = statusConfig[status];
                        const Icon = config.icon;
                        return (
                          <button
                            key={status}
                            onClick={() => handleAttendanceChange(student.id, status)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                              isSelected
                                ? config.color === 'success'
                                  ? 'bg-success-500 text-white'
                                  : config.color === 'danger'
                                  ? 'bg-danger-500 text-white'
                                  : config.color === 'warning'
                                  ? 'bg-warning-500 text-white'
                                  : 'bg-primary-500 text-white'
                                : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                            <span className="hidden sm:inline">{config.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end mt-6">
                <Button icon={<Save className="w-4 h-4" />} onClick={saveAttendance} loading={saving}>
                  Save Attendance
                </Button>
              </div>
            </>
          ) : (
            <p className="text-center text-neutral-400 py-8">Select a class and subject to mark attendance</p>
          )}
        </SectionCard>
      )}

      {/* Grades Tab */}
      {activeTab === 'grades' && (
        <SectionCard
          title="Grade Book"
          subtitle="Enter student marks for examinations"
          action={
            <div className="flex gap-3">
              <Select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                options={[
                  { value: '', label: 'Select Class' },
                  ...assignedClasses.map((c) => ({ value: c.id, label: `Grade ${c.name}-${c.section}` })),
                ]}
              />
              <Select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                options={[
                  { value: '', label: 'Select Subject' },
                  ...subjects.map((s) => ({ value: s.id, label: s.name })),
                ]}
              />
              <Select
                value={selectedExamType}
                onChange={(e) => setSelectedExamType(e.target.value)}
                options={[
                  { value: '', label: 'Select Exam' },
                  ...examTypes.map((e) => ({ value: e.id, label: `${e.name} (${e.term})` })),
                ]}
              />
            </div>
          }
        >
          {selectedClass && selectedSubject && selectedExamType ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-neutral-500">
                  Max Marks: {examTypes.find(e => e.id === selectedExamType)?.max_marks || 100}
                </p>
              </div>
              <div className="space-y-2">
                {students.map((student) => {
                  const marks = gradesData[student.id];
                  const maxMarks = examTypes.find(e => e.id === selectedExamType)?.max_marks || 100;
                  const percentage = marks !== undefined ? Math.round((marks / maxMarks) * 100) : null;

                  return (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={student.user.avatar_url || 'https://via.placeholder.com/40'}
                          alt={student.user.full_name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-medium text-neutral-900">{student.user.full_name}</p>
                          <p className="text-sm text-neutral-500">{student.roll_number}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-24">
                          <input
                            type="number"
                            min="0"
                            max={maxMarks}
                            value={marks ?? ''}
                            onChange={(e) => handleGradeChange(student.id, parseInt(e.target.value) || 0, maxMarks)}
                            className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="Marks"
                          />
                        </div>
                        {percentage !== null && (
                          <Badge
                            variant={
                              percentage >= 80 ? 'success' : percentage >= 50 ? 'warning' : 'danger'
                            }
                          >
                            {percentage}%
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-end mt-6">
                <Button icon={<Save className="w-4 h-4" />} onClick={saveGrades} loading={saving}>
                  Save Grades
                </Button>
              </div>
            </>
          ) : (
            <p className="text-center text-neutral-400 py-8">
              Select class, subject, and exam type to enter grades
            </p>
          )}
        </SectionCard>
      )}

      {/* Assignments Tab */}
      {activeTab === 'assignments' && (
        <div className="space-y-6">
          {/* Create Assignment Button */}
          {!showAssignmentForm && (
            <button
              onClick={() => setShowAssignmentForm(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg font-medium text-sm hover:bg-primary-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Assignment
            </button>
          )}

          {/* Assignment Form */}
          {showAssignmentForm && (
            <SectionCard title="New Assignment" subtitle="Create an assignment for your class">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Input
                      label="Title *"
                      value={assignmentForm.title}
                      onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })}
                      placeholder="e.g., Chapter 5 Homework"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Input
                      label="Description"
                      value={assignmentForm.description}
                      onChange={(e) => setAssignmentForm({ ...assignmentForm, description: e.target.value })}
                      placeholder="Describe the assignment requirements..."
                    />
                  </div>
                  <Select
                    label="Class *"
                    value={assignmentForm.class_id}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, class_id: e.target.value })}
                    options={[
                      { value: '', label: 'Select class' },
                      ...assignedClasses.map((c) => ({ value: c.id, label: `Grade ${c.name}-${c.section}` })),
                    ]}
                  />
                  <Select
                    label="Subject *"
                    value={assignmentForm.subject_id}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, subject_id: e.target.value })}
                    options={[
                      { value: '', label: 'Select subject' },
                      ...subjects.map((s) => ({ value: s.id, label: s.name })),
                    ]}
                  />
                  <Input
                    label="Due Date *"
                    type="date"
                    value={assignmentForm.due_date}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, due_date: e.target.value })}
                  />
                  <Input
                    label="Max Marks"
                    type="number"
                    value={assignmentForm.max_marks}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, max_marks: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <Button variant="secondary" onClick={() => setShowAssignmentForm(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateAssignment} loading={saving}>
                    Create Assignment
                  </Button>
                </div>
              </div>
            </SectionCard>
          )}

          {/* Assignment List */}
          <SectionCard
            title="My Assignments"
            subtitle={`${teacherAssignments.length} total`}
          >
            {teacherAssignments.length === 0 ? (
              <p className="text-center text-neutral-400 py-8">No assignments created yet</p>
            ) : (
              <div className="space-y-3">
                {teacherAssignments.map((assignment) => {
                  const sub = subjects.find(s => s.id === assignment.subject_id);
                  const cls = assignedClasses.find(c => c.id === assignment.class_id);
                  const isActive = assignment.status === 'active';
                  return (
                    <div
                      key={assignment.id}
                      className={`p-4 rounded-lg border ${
                        isActive
                          ? 'bg-white border-neutral-200'
                          : 'bg-neutral-50 border-neutral-200 opacity-70'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-primary-600" />
                            <h4 className="font-semibold text-neutral-900">{assignment.title}</h4>
                          </div>
                          {assignment.description && (
                            <p className="text-sm text-neutral-500 mt-1 ml-6">{assignment.description}</p>
                          )}
                          <div className="flex items-center gap-4 mt-2 ml-6">
                            <Badge variant="info">{sub?.name || 'Subject'}</Badge>
                            <span className="text-sm text-neutral-500">
                              Grade {cls?.name || 'N/A'}-{cls?.section || 'N/A'}
                            </span>
                            <span className="text-sm text-neutral-500">
                              Due: {new Date(assignment.due_date).toLocaleDateString()}
                            </span>
                            <span className="text-sm text-neutral-500">
                              Max: {assignment.max_marks}
                            </span>
                            <Badge variant={isActive ? 'success' : 'default'}>
                              {assignment.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          {isActive && (
                            <button
                              onClick={() => handleCloseAssignment(assignment.id)}
                              className="p-1.5 text-neutral-400 hover:text-warning-600 hover:bg-warning-50 rounded-lg transition-colors"
                              title="Close assignment"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteAssignment(assignment.id)}
                            className="p-1.5 text-neutral-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                            title="Delete assignment"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </SectionCard>
        </div>
      )}

      {/* Exams Tab */}
      {activeTab === 'exams' && (
        <TeacherExamPanel teacherId={teacherId || ''} assignedClasses={assignedClasses} subjects={subjects} />
      )}

      {/* Exam Schedule Tab */}
      {activeTab === 'exam_schedule' && (
        <ExamScheduleManager classes={assignedClasses} subjects={subjects} readOnly />
      )}

      {/* Teacher Materials Tab */}
      {activeTab === 'materials_teacher' && (
        <StudyMaterials mode="teacher" teacherId={teacherId} subjects={subjects} assignedClasses={assignedClasses} />
      )}

      {/* Teacher Messages Tab */}
      {activeTab === 'messages_teacher' && (
        <MessagingPanel mode="teacher" userId={currentUser?.user.id || ''} teacherId={teacherId} />
      )}

      {/* Teacher Events Tab */}
      {activeTab === 'events_teacher' && (
        <EventCalendar readOnly />
      )}

      {/* Teacher Library Tab */}
      {activeTab === 'library_teacher' && (
        <LibraryPanel mode="teacher" userId={currentUser?.user.id || ''} borrowerId={teacherId} borrowerType="teacher" />
      )}

      {/* Teacher Health Records Tab */}
      {activeTab === 'health_teacher' && (
        <HealthRecords mode="teacher" studentId={students[0]?.id || ''} teacherId={teacherId} />
      )}

      {/* Teacher Gallery Tab */}
      {activeTab === 'gallery_teacher' && (
        <CampusGallery mode="viewer" />
      )}

      {/* Documents Tab */}
      {activeTab === 'documents' && (
        <DocumentManager userId={currentUser?.user.id || ''} />
      )}

      {/* Identity Card Tab */}
      {activeTab === 'identity' && <TeacherIdentityCardView />}

      {/* Schedule Tab */}
      {activeTab === 'schedule' && (
        <SectionCard title="My Schedule" subtitle="Weekly teaching schedule">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  {['Period', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => (
                    <th key={day} className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5].map((period) => (
                  <tr key={period} className="border-t border-neutral-100">
                    <td className="px-4 py-4 font-medium text-neutral-900">Period {period}</td>
                    {[1, 2, 3, 4, 5].map((day) => {
                      const slot = timetable.find(t => t.day_of_week === day && t.period === period);
                      return (
                        <td key={day} className="px-4 py-4">
                          {slot ? (
                            <div className="bg-primary-50 rounded-lg p-2">
                              <p className="font-medium text-primary-700 text-sm">{slot.subject?.name}</p>
                              <p className="text-xs text-primary-500">{slot.room || 'Room TBA'}</p>
                            </div>
                          ) : (
                            <div className="bg-neutral-50 rounded-lg p-2 text-center text-neutral-400 text-sm">
                              -
                            </div>
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

      {/* My Students Tab */}
      {activeTab === 'students' && (
        <SectionCard
          title="My Students"
          subtitle="Students in your assigned classes"
          action={
            <Select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                if (e.target.value) fetchStudentsForClass(e.target.value);
              }}
              options={[
                { value: '', label: 'All Classes' },
                ...assignedClasses.map((c) => ({ value: c.id, label: `Grade ${c.name}-${c.section}` })),
              ]}
            />
          }
        >
          <div className="space-y-2">
            {students.length === 0 ? (
              <p className="text-center text-neutral-400 py-8">Select a class to view students</p>
            ) : (
              students.map((student) => (
                <div key={student.id} className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                  <img
                    src={student.user.avatar_url || 'https://via.placeholder.com/40'}
                    alt={student.user.full_name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-neutral-900">{student.user.full_name}</p>
                    <p className="text-sm text-neutral-500">{student.roll_number}</p>
                  </div>
                  <Badge variant="success">Active</Badge>
                </div>
              ))
            )}
          </div>
        </SectionCard>
      )}
    </div>
  );
}
