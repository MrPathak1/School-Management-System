import React, { useState, useEffect, useRef } from 'react';
import {
  Users,
  GraduationCap,
  DollarSign,
  AlertCircle,
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  BookOpen,
  Clock,
  Layers,
  Receipt,
} from 'lucide-react';
import { StatCard, SectionCard } from '../components/ui/Card';
import { Table, Badge, Button, Input, Select } from '../components/ui/Table';
import { Modal } from '../components/ui/Modal';
import { AnalyticsDashboard } from '../components/AnalyticsDashboard';
import { BusTracking } from '../components/BusTracking';
import { IdentityCardGenerator } from '../components/IdentityCardGenerator';
import { AdminFeeManager } from '../components/AdminFeeManager';
import { ScheduleManager } from '../components/ScheduleManager';
import { ExamScheduleManager } from '../components/ExamScheduleManager';
import { TeacherExamPanel } from '../components/TeacherExamPanel';
import { AdmitCardGenerator } from '../components/AdmitCardGenerator';
import { useToastStore } from '../hooks/useToast';
import { supabase, Student, Teacher, Class, Subject, User, StudentWithDetails, TeacherWithDetails } from '../lib/supabase';
import { EventCalendar } from '../components/EventCalendar';
import { MessagingPanel } from '../components/MessagingPanel';
import { StudyMaterials } from '../components/StudyMaterials';
import { LibraryPanel } from '../components/LibraryPanel';
import { HealthRecords } from '../components/HealthRecords';
import { CampusGallery } from '../components/CampusGallery';

interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  monthlyRevenue: number;
  pendingFees: number;
}

interface AdminDashboardProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function AdminDashboard({ activeTab, setActiveTab }: AdminDashboardProps) {
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalTeachers: 0,
    monthlyRevenue: 0,
    pendingFees: 0,
  });
  const [students, setStudents] = useState<StudentWithDetails[]>([]);
  const [teachers, setTeachers] = useState<TeacherWithDetails[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const addToast = useToastStore((s) => s.addToast);

  // Modal states
  const [studentModalOpen, setStudentModalOpen] = useState(false);
  const [teacherModalOpen, setTeacherModalOpen] = useState(false);
  const [classModalOpen, setClassModalOpen] = useState(false);
  const [subjectModalOpen, setSubjectModalOpen] = useState(false);

  // Form states
  const [editingStudent, setEditingStudent] = useState<StudentWithDetails | null>(null);
  const [editingTeacher, setEditingTeacher] = useState<TeacherWithDetails | null>(null);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  // Search
  const [studentSearch, setStudentSearch] = useState('');
  const [teacherSearch, setTeacherSearch] = useState('');

  // Exam creation teacher selector
  const [selectedExamTeacher, setSelectedExamTeacher] = useState('');

  // Attendance overview filters & data
  const [attendanceFilterTeacher, setAttendanceFilterTeacher] = useState('');
  const [attendanceFilterClass, setAttendanceFilterClass] = useState('');
  const [attendanceFilterSubject, setAttendanceFilterSubject] = useState('');
  const [attendanceStartDate, setAttendanceStartDate] = useState('');
  const [attendanceEndDate, setAttendanceEndDate] = useState('');
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch students with user and class data
      const { data: studentsData } = await supabase
        .from('students')
        .select(`*, user:users(*), class:classes(*)`)
        .order('created_at', { ascending: false });

      // Fetch teachers with user data
      const { data: teachersData } = await supabase
        .from('teachers')
        .select(`*, user:users(*)`)
        .order('created_at', { ascending: false });

      // Fetch classes
      const { data: classesData } = await supabase.from('classes').select('*');

      // Fetch subjects
      const { data: subjectsData } = await supabase.from('subjects').select('*').order('name');
      setSubjects(subjectsData || []);

      // Fetch fee stats
      const { data: feePayments } = await supabase
        .from('fee_payments')
        .select('amount_paid, status');

      const totalRevenue = feePayments?.reduce((sum, p) => sum + (p.status === 'paid' || p.status === 'partial' ? p.amount_paid : 0), 0) || 0;
      const pendingFees = feePayments?.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount_paid, 0) || 0;

      setStudents(studentsData as StudentWithDetails[] || []);
      setTeachers(teachersData as TeacherWithDetails[] || []);
      setClasses(classesData || []);
      setStats({
        totalStudents: studentsData?.length || 0,
        totalTeachers: teachersData?.length || 0,
        monthlyRevenue: totalRevenue,
        pendingFees: pendingFees,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceRecords = async () => {
    setAttendanceLoading(true);
    try {
      let query = supabase
        .from('attendance')
        .select(`*, student:students(user:users(full_name), class:classes(name, section)), subject:subjects(name), teacher:teachers!marked_by(user:users(full_name))`);

      if (attendanceFilterTeacher) {
        query = query.eq('marked_by', attendanceFilterTeacher);
      }
      if (attendanceFilterClass) {
        query = query.eq('class_id', attendanceFilterClass);
      }
      if (attendanceFilterSubject) {
        query = query.eq('subject_id', attendanceFilterSubject);
      }
      if (attendanceStartDate) {
        query = query.gte('date', attendanceStartDate);
      }
      if (attendanceEndDate) {
        query = query.lte('date', attendanceEndDate);
      }

      const { data } = await query.order('date', { ascending: false }).limit(500);

      if (data) {
        setAttendanceRecords(
          data.map((a: any) => ({
            id: a.id,
            date: a.date,
            status: a.status,
            student_name: a.student?.user?.full_name || null,
            class_name: a.student?.class ? `Grade ${a.student.class.name}-${a.student.class.section}` : null,
            subject_name: a.subject?.name || null,
            teacher_name: a.teacher?.user?.full_name || null,
          }))
        );
      } else {
        setAttendanceRecords([]);
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
      addToast({ type: 'error', title: 'Failed to load attendance records' });
    } finally {
      setAttendanceLoading(false);
    }
  };

  const filteredStudents = students.filter(
    (s) =>
      s.user.full_name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.roll_number.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const filteredTeachers = teachers.filter(
    (t) =>
      t.user.full_name.toLowerCase().includes(teacherSearch.toLowerCase()) ||
      t.employee_id.toLowerCase().includes(teacherSearch.toLowerCase())
  );

  const handleDeleteStudent = async (student: StudentWithDetails) => {
    if (!confirm(`Are you sure you want to delete ${student.user.full_name}?`)) return;
    await supabase.from('students').delete().eq('id', student.id);
    await supabase.from('users').delete().eq('id', student.user_id);
    addToast({ type: 'success', title: 'Student deleted successfully' });
    fetchData();
  };

  const handleDeleteTeacher = async (teacher: TeacherWithDetails) => {
    if (!confirm(`Are you sure you want to delete ${teacher.user.full_name}?`)) return;
    await supabase.from('teachers').delete().eq('id', teacher.id);
    await supabase.from('users').delete().eq('id', teacher.user_id);
    addToast({ type: 'success', title: 'Teacher deleted successfully' });
    fetchData();
  };

  const handleDeleteClass = async (cls: Class) => {
    if (!confirm(`Are you sure you want to delete Class ${cls.name}-${cls.section}?`)) return;
    await supabase.from('classes').delete().eq('id', cls.id);
    addToast({ type: 'success', title: 'Class deleted successfully' });
    fetchData();
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { id: 'dashboard', label: 'Overview' },
          { id: 'analytics', label: 'Analytics' },
          { id: 'students', label: 'Students' },
          { id: 'teachers', label: 'Teachers' },
          { id: 'classes', label: 'Classes' },
          { id: 'fees', label: 'Fees' },
          { id: 'bus', label: 'Bus Tracking' },
          { id: 'identity', label: 'Identity Cards' },
          { id: 'exam_dashboard', label: 'Exam' },
          { id: 'attendance_overview', label: 'Attendance' },
          { id: 'events_admin', label: 'Events' },
          { id: 'messages_admin', label: 'Messages' },
          { id: 'materials_admin', label: 'Materials' },
          { id: 'library_admin', label: 'Library' },
          { id: 'health_admin', label: 'Health' },
          { id: 'gallery_admin', label: 'Gallery' },
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

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <>
          {/* Analytics Tab */}
          {activeTab === 'analytics' && <AnalyticsDashboard />}

          {/* Bus Tracking Tab */}
          {activeTab === 'bus' && <BusTracking />}

          {/* Identity Cards Tab */}
          {activeTab === 'identity' && <IdentityCardGenerator />}

          {/* Exam Dashboard Tab */}
          {activeTab === 'exam_dashboard' && (
            <div className="space-y-8">
              {/* Online Exams (Teacher Exam Panel) */}
              <SectionCard title="Online Exams" subtitle="Create and manage MCQ exams">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Select Teacher for Exam Creation</label>
                  <select
                    value={selectedExamTeacher}
                    onChange={(e) => setSelectedExamTeacher(e.target.value)}
                    className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg text-sm"
                  >
                    <option value="">-- Select a teacher --</option>
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>{t.user.full_name} ({t.employee_id})</option>
                    ))}
                  </select>
                </div>
                  {selectedExamTeacher ? (
                  <TeacherExamPanel
                    teacherId={selectedExamTeacher}
                    assignedClasses={classes}
                    subjects={subjects}
                  />
                ) : (
                  <p className="text-center text-neutral-400 py-8 text-sm">Select a teacher to create or manage exams</p>
                )}
              </SectionCard>

              <div className="border-t border-neutral-200 pt-8">
                <ExamScheduleManager classes={classes} subjects={subjects} />
              </div>
              <div className="border-t border-neutral-200 pt-8">
                <AdmitCardGenerator />
              </div>
            </div>
          )}

          {/* Attendance Overview Tab */}
          {activeTab === 'attendance_overview' && (
            <div className="space-y-6">
              <SectionCard title="Attendance Overview" subtitle="View all attendance records across teachers and classes">
                <div className="flex flex-wrap gap-3 mb-6">
                  <Select
                    value={attendanceFilterTeacher}
                    onChange={(e) => setAttendanceFilterTeacher(e.target.value)}
                    options={[
                      { value: '', label: 'All Teachers' },
                      ...teachers.map((t) => ({ value: t.id, label: t.user.full_name })),
                    ]}
                  />
                  <Select
                    value={attendanceFilterClass}
                    onChange={(e) => setAttendanceFilterClass(e.target.value)}
                    options={[
                      { value: '', label: 'All Classes' },
                      ...classes.map((c) => ({ value: c.id, label: `Grade ${c.name}-${c.section}` })),
                    ]}
                  />
                  <Select
                    value={attendanceFilterSubject}
                    onChange={(e) => setAttendanceFilterSubject(e.target.value)}
                    options={[
                      { value: '', label: 'All Subjects' },
                      ...subjects.map((s) => ({ value: s.id, label: s.name })),
                    ]}
                  />
                  <Input type="date" value={attendanceStartDate} onChange={(e) => setAttendanceStartDate(e.target.value)} />
                  <Input type="date" value={attendanceEndDate} onChange={(e) => setAttendanceEndDate(e.target.value)} />
                  <Button onClick={fetchAttendanceRecords} loading={attendanceLoading}>
                    Search
                  </Button>
                </div>

                {attendanceRecords.length > 0 && (
                  <div className="grid grid-cols-4 gap-4 mb-6">
                    <div className="p-4 bg-success-50 rounded-lg text-center">
                      <p className="text-2xl font-bold text-success-700">{attendanceRecords.filter(r => r.status === 'present').length}</p>
                      <p className="text-sm text-success-600">Present</p>
                    </div>
                    <div className="p-4 bg-danger-50 rounded-lg text-center">
                      <p className="text-2xl font-bold text-danger-700">{attendanceRecords.filter(r => r.status === 'absent').length}</p>
                      <p className="text-sm text-danger-600">Absent</p>
                    </div>
                    <div className="p-4 bg-warning-50 rounded-lg text-center">
                      <p className="text-2xl font-bold text-warning-700">{attendanceRecords.filter(r => r.status === 'late').length}</p>
                      <p className="text-sm text-warning-600">Late</p>
                    </div>
                    <div className="p-4 bg-primary-50 rounded-lg text-center">
                      <p className="text-2xl font-bold text-primary-700">{attendanceRecords.filter(r => r.status === 'excused').length}</p>
                      <p className="text-sm text-primary-600">Excused</p>
                    </div>
                  </div>
                )}

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-neutral-200">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Student</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Class</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Subject</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Teacher</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {attendanceRecords.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-neutral-400">
                            {attendanceLoading ? 'Loading...' : 'Use the filters above and click Search to view attendance records'}
                          </td>
                        </tr>
                      ) : (
                        attendanceRecords.map((rec) => (
                          <tr key={rec.id} className="hover:bg-neutral-50">
                            <td className="px-4 py-3 text-sm text-neutral-900">{new Date(rec.date).toLocaleDateString()}</td>
                            <td className="px-4 py-3 text-sm text-neutral-900">{rec.student_name || '-'}</td>
                            <td className="px-4 py-3 text-sm text-neutral-700">{rec.class_name || '-'}</td>
                            <td className="px-4 py-3 text-sm text-neutral-700">{rec.subject_name || '-'}</td>
                            <td className="px-4 py-3 text-sm text-neutral-700">{rec.teacher_name || '-'}</td>
                            <td className="px-4 py-3">
                              <Badge variant={rec.status === 'present' ? 'success' : rec.status === 'absent' ? 'danger' : rec.status === 'late' ? 'warning' : 'info'}>
                                {rec.status}
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

          {/* Admin Events Tab */}
          {activeTab === 'events_admin' && <EventCalendar />}

          {/* Admin Messages Tab */}
          {activeTab === 'messages_admin' && <MessagingPanel mode="admin" userId="" />}

          {/* Admin Materials Tab */}
          {activeTab === 'materials_admin' && (
            <StudyMaterials mode="teacher" teacherId="" />
          )}

          {/* Admin Library Tab */}
          {activeTab === 'library_admin' && <LibraryPanel mode="admin" userId="" />}

          {/* Admin Health Records Tab */}
          {activeTab === 'health_admin' && <HealthRecords mode="admin" studentId={students[0]?.id || ''} readOnly={false} />}

          {/* Admin Gallery Tab */}

          {/* Admin Gallery Tab */}
          {activeTab === 'gallery_admin' && <CampusGallery mode="admin" userId="" />}

          {/* Overview Tab */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title="Total Students"
                  value={stats.totalStudents}
                  icon={Users}
                  color="blue"
                  trend={{ value: 12, isPositive: true }}
                />
                <StatCard
                  title="Total Teachers"
                  value={stats.totalTeachers}
                  icon={GraduationCap}
                  color="green"
                />
                <StatCard
                  title="Monthly Revenue"
                  value={`₹${stats.monthlyRevenue.toLocaleString()}`}
                  icon={DollarSign}
                  color="purple"
                  trend={{ value: 8, isPositive: true }}
                />
                <StatCard
                  title="Pending Fees"
                  value={`₹${stats.pendingFees.toLocaleString()}`}
                  icon={AlertCircle}
                  color="red"
                  subtitle="Requires attention"
                />
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SectionCard title="Recent Students" subtitle="Latest enrollments">
                  <div className="space-y-3">
                    {students.slice(0, 5).map((student) => (
                      <div key={student.id} className="flex items-center gap-3">
                        <img
                          src={student.user.avatar_url || 'https://via.placeholder.com/40'}
                          alt={student.user.full_name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-neutral-900">{student.user.full_name}</p>
                          <p className="text-sm text-neutral-500">
                            Class {student.class?.name || 'N/A'}-{student.class?.section || 'N/A'}
                          </p>
                        </div>
                        <Badge variant={student.status === 'active' ? 'success' : 'default'}>
                          {student.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </SectionCard>

                <SectionCard title="Recent Teachers" subtitle="Faculty members">
                  <div className="space-y-3">
                    {teachers.slice(0, 5).map((teacher) => (
                      <div key={teacher.id} className="flex items-center gap-3">
                        <img
                          src={teacher.user.avatar_url || 'https://via.placeholder.com/40'}
                          alt={teacher.user.full_name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-neutral-900">{teacher.user.full_name}</p>
                          <p className="text-sm text-neutral-500">{teacher.department}</p>
                        </div>
                        <Badge variant={teacher.status === 'active' ? 'success' : 'default'}>
                          {teacher.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              </div>

              {/* Class Overview */}
              <SectionCard title="Class Overview" subtitle="Academic year 2025-2026">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {classes.map((cls) => (
                    <div
                      key={cls.id}
                      className="bg-neutral-50 rounded-lg p-4 text-center hover:bg-neutral-100 transition-colors cursor-pointer"
                      onClick={() => setActiveTab('classes')}
                    >
                      <p className="text-2xl font-bold text-neutral-900">
                        {cls.name}-{cls.section}
                      </p>
                      <p className="text-sm text-neutral-500 mt-1">
                        {students.filter((s) => s.class_id === cls.id).length} students
                      </p>
                    </div>
                  ))}
                </div>
              </SectionCard>
            </div>
          )}

          {/* Students Tab */}
          {activeTab === 'students' && (
            <SectionCard
              title="Student Management"
              subtitle={`${filteredStudents.length} students enrolled`}
              action={
                <Button
                  icon={<Plus className="w-4 h-4" />}
                  onClick={() => {
                    setEditingStudent(null);
                    setStudentModalOpen(true);
                  }}
                >
                  Add Student
                </Button>
              }
            >
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Search students by name or roll number..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              <Table
                columns={[
                  {
                    key: 'name',
                    header: 'Student',
                    render: (s) => (
                      <div className="flex items-center gap-3">
                        <img
                          src={s.user.avatar_url || 'https://via.placeholder.com/40'}
                          alt={s.user.full_name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-medium text-neutral-900">{s.user.full_name}</p>
                          <p className="text-sm text-neutral-500">{s.user.email}</p>
                        </div>
                      </div>
                    ),
                  },
                  {
                    key: 'roll_number',
                    header: 'Roll No',
                    render: (s) => (
                      <span className="font-mono text-neutral-600">{s.roll_number}</span>
                    ),
                  },
                  {
                    key: 'class',
                    header: 'Class',
                    render: (s) => (
                      <Badge variant="info">
                        {s.class?.name || 'N/A'}-{s.class?.section || 'N/A'}
                      </Badge>
                    ),
                  },
                  {
                    key: 'guardian',
                    header: 'Guardian',
                    render: (s) => (
                      <div>
                        <p className="text-neutral-900">{s.guardian_name}</p>
                        <p className="text-sm text-neutral-500">{s.guardian_phone}</p>
                      </div>
                    ),
                  },
                  {
                    key: 'status',
                    header: 'Status',
                    render: (s) => (
                      <Badge variant={s.status === 'active' ? 'success' : 'default'}>
                        {s.status}
                      </Badge>
                    ),
                  },
                  {
                    key: 'actions',
                    header: '',
                    render: (s) => (
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingStudent(s);
                            setStudentModalOpen(true);
                          }}
                          className="p-1.5 text-neutral-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteStudent(s);
                          }}
                          className="p-1.5 text-neutral-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ),
                    className: 'w-24',
                  },
                ]}
                data={filteredStudents}
                keyExtractor={(s) => s.id}
              />
            </SectionCard>
          )}

          {/* Teachers Tab — Faculty + Salary sub-tabs */}
          {activeTab === 'teachers' && (
            <TeacherSection
              teachers={teachers}
              filteredTeachers={filteredTeachers}
              teacherSearch={teacherSearch}
              setTeacherSearch={setTeacherSearch}
              onAddTeacher={() => { setEditingTeacher(null); setTeacherModalOpen(true); }}
              onEditTeacher={(t) => { setEditingTeacher(t); setTeacherModalOpen(true); }}
              onDeleteTeacher={handleDeleteTeacher}
            />
          )}

          {/* Classes Tab — merged Classes, Subjects, Schedule */}
          {activeTab === 'classes' && (
            <MergedClassesSection
              classes={classes}
              subjects={subjects}
              teachers={teachers}
              students={students}
              onAddClass={() => { setEditingClass(null); setClassModalOpen(true); }}
              onEditClass={(cls) => { setEditingClass(cls); setClassModalOpen(true); }}
              onDeleteClass={handleDeleteClass}
              onAddSubject={() => { setEditingSubject(null); setSubjectModalOpen(true); }}
              onEditSubject={(subj) => { setEditingSubject(subj); setSubjectModalOpen(true); }}
              onDeleteSubject={async (id) => {
                if (!confirm('Delete this subject?')) return;
                await supabase.from('subjects').delete().eq('id', id);
                addToast({ type: 'success', title: 'Subject deleted' });
                fetchData();
              }}
            />
          )}

          {/* Fees Tab */}
          {activeTab === 'fees' && (
            <FeeSection students={students} classes={classes} onRefresh={fetchData} />
          )}
        </>
      )}

      {/* Student Modal */}
      <StudentModal
        isOpen={studentModalOpen}
        onClose={() => {
          setStudentModalOpen(false);
          setEditingStudent(null);
        }}
        student={editingStudent}
        classes={classes}
        onSave={() => {
          setStudentModalOpen(false);
          setEditingStudent(null);
          fetchData();
        }}
      />

      {/* Teacher Modal */}
      <TeacherModal
        isOpen={teacherModalOpen}
        onClose={() => {
          setTeacherModalOpen(false);
          setEditingTeacher(null);
        }}
        teacher={editingTeacher}
        onSave={() => {
          setTeacherModalOpen(false);
          setEditingTeacher(null);
          fetchData();
        }}
      />

      {/* Class Modal */}
      <ClassModal
        isOpen={classModalOpen}
        onClose={() => {
          setClassModalOpen(false);
          setEditingClass(null);
        }}
        existingClass={editingClass}
        onSave={() => {
          setClassModalOpen(false);
          setEditingClass(null);
          fetchData();
        }}
      />

      {/* Subject Modal */}
      <SubjectModal
        isOpen={subjectModalOpen}
        onClose={() => {
          setSubjectModalOpen(false);
          setEditingSubject(null);
        }}
        existingSubject={editingSubject}
        onSave={() => {
          setSubjectModalOpen(false);
          setEditingSubject(null);
          fetchData();
        }}
      />

    </div>
  );
}

// Student Modal Component
function StudentModal({
  isOpen,
  onClose,
  student,
  classes,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  student: StudentWithDetails | null;
  classes: Class[];
  onSave: () => void;
}) {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    roll_number: '',
    class_id: '',
    guardian_name: '',
    guardian_phone: '',
    guardian_email: '',
    address: '',
  });
  const [loading, setLoading] = useState(false);
  const addToast = useToastStore((s) => s.addToast);

  useEffect(() => {
    if (student) {
      setFormData({
        full_name: student.user.full_name,
        email: student.user.email,
        roll_number: student.roll_number,
        class_id: student.class_id,
        guardian_name: student.guardian_name,
        guardian_phone: student.guardian_phone,
        guardian_email: student.guardian_email || '',
        address: student.address || '',
      });
    } else {
      setFormData({
        full_name: '',
        email: '',
        roll_number: '',
        class_id: classes[0]?.id || '',
        guardian_name: '',
        guardian_phone: '',
        guardian_email: '',
        address: '',
      });
    }
  }, [student, isOpen, classes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (student) {
        // Update existing
        await supabase
          .from('users')
          .update({ full_name: formData.full_name, email: formData.email })
          .eq('id', student.user_id);
        await supabase
          .from('students')
          .update({
            roll_number: formData.roll_number,
            class_id: formData.class_id,
            guardian_name: formData.guardian_name,
            guardian_phone: formData.guardian_phone,
            guardian_email: formData.guardian_email,
            address: formData.address,
          })
          .eq('id', student.id);
        addToast({ type: 'success', title: 'Student updated successfully' });
      } else {
        // Create new
        const userId = crypto.randomUUID();
        await supabase.from('users').insert({
          id: userId,
          full_name: formData.full_name,
          email: formData.email,
          role: 'student',
          avatar_url: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop`,
        });
        await supabase.from('students').insert({
          user_id: userId,
          roll_number: formData.roll_number,
          class_id: formData.class_id,
          guardian_name: formData.guardian_name,
          guardian_phone: formData.guardian_phone,
          guardian_email: formData.guardian_email,
          address: formData.address,
          admission_date: new Date().toISOString().split('T')[0],
          status: 'active',
        });
        addToast({ type: 'success', title: 'Student added successfully' });
      }
      onSave();
    } catch (error) {
      console.error(error);
      addToast({ type: 'error', title: 'Failed to save student' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={student ? 'Edit Student' : 'Add Student'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Full Name"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            required
          />
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <Input
            label="Roll Number"
            value={formData.roll_number}
            onChange={(e) => setFormData({ ...formData, roll_number: e.target.value })}
            required
          />
          <Select
            label="Class"
            value={formData.class_id}
            onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
            options={classes.map((c) => ({ value: c.id, label: `Grade ${c.name}-${c.section}` }))}
          />
          <Input
            label="Guardian Name"
            value={formData.guardian_name}
            onChange={(e) => setFormData({ ...formData, guardian_name: e.target.value })}
            required
          />
          <Input
            label="Guardian Phone"
            value={formData.guardian_phone}
            onChange={(e) => setFormData({ ...formData, guardian_phone: e.target.value })}
            required
          />
          <Input
            label="Guardian Email"
            type="email"
            value={formData.guardian_email}
            onChange={(e) => setFormData({ ...formData, guardian_email: e.target.value })}
          />
          <Input
            label="Address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {student ? 'Update' : 'Add'} Student
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// Teacher Modal Component
function TeacherModal({
  isOpen,
  onClose,
  teacher,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  teacher: TeacherWithDetails | null;
  onSave: () => void;
}) {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    employee_id: '',
    qualification: '',
    department: '',
  });
  const [loading, setLoading] = useState(false);
  const addToast = useToastStore((s) => s.addToast);

  useEffect(() => {
    if (teacher) {
      setFormData({
        full_name: teacher.user.full_name,
        email: teacher.user.email,
        employee_id: teacher.employee_id,
        qualification: teacher.qualification || '',
        department: teacher.department || '',
      });
    } else {
      setFormData({
        full_name: '',
        email: '',
        employee_id: '',
        qualification: '',
        department: '',
      });
    }
  }, [teacher, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (teacher) {
        await supabase
          .from('users')
          .update({ full_name: formData.full_name, email: formData.email })
          .eq('id', teacher.user_id);
        await supabase
          .from('teachers')
          .update({
            employee_id: formData.employee_id,
            qualification: formData.qualification,
            department: formData.department,
          })
          .eq('id', teacher.id);
        addToast({ type: 'success', title: 'Teacher updated successfully' });
      } else {
        const userId = crypto.randomUUID();
        await supabase.from('users').insert({
          id: userId,
          full_name: formData.full_name,
          email: formData.email,
          role: 'teacher',
        });
        await supabase.from('teachers').insert({
          user_id: userId,
          employee_id: formData.employee_id,
          qualification: formData.qualification,
          department: formData.department,
          joining_date: new Date().toISOString().split('T')[0],
          status: 'active',
        });
        addToast({ type: 'success', title: 'Teacher added successfully' });
      }
      onSave();
    } catch (error) {
      console.error(error);
      addToast({ type: 'error', title: 'Failed to save teacher' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={teacher ? 'Edit Teacher' : 'Add Teacher'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full Name"
          value={formData.full_name}
          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
          required
        />
        <Input
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
        <Input
          label="Employee ID"
          value={formData.employee_id}
          onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
          required
        />
        <Input
          label="Qualification"
          value={formData.qualification}
          onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
        />
        <Input
          label="Department"
          value={formData.department}
          onChange={(e) => setFormData({ ...formData, department: e.target.value })}
        />
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {teacher ? 'Update' : 'Add'} Teacher
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// Class Modal Component
function ClassModal({
  isOpen,
  onClose,
  existingClass,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  existingClass: Class | null;
  onSave: () => void;
}) {
  const [formData, setFormData] = useState({
    name: '',
    section: '',
    academic_year: '2025-2026',
  });
  const [loading, setLoading] = useState(false);
  const addToast = useToastStore((s) => s.addToast);

  useEffect(() => {
    if (existingClass) {
      setFormData({
        name: existingClass.name,
        section: existingClass.section,
        academic_year: existingClass.academic_year,
      });
    } else {
      setFormData({ name: '', section: '', academic_year: '2025-2026' });
    }
  }, [existingClass, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (existingClass) {
        await supabase
          .from('classes')
          .update(formData)
          .eq('id', existingClass.id);
        addToast({ type: 'success', title: 'Class updated successfully' });
      } else {
        await supabase.from('classes').insert(formData);
        addToast({ type: 'success', title: 'Class added successfully' });
      }
      onSave();
    } catch (error) {
      console.error(error);
      addToast({ type: 'error', title: 'Failed to save class' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={existingClass ? 'Edit Class' : 'Add Class'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Grade/Class Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., 10"
          required
        />
        <Input
          label="Section"
          value={formData.section}
          onChange={(e) => setFormData({ ...formData, section: e.target.value })}
          placeholder="e.g., A"
          required
        />
        <Input
          label="Academic Year"
          value={formData.academic_year}
          onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
          required
        />
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {existingClass ? 'Update' : 'Add'} Class
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// Subject Modal Component
function SubjectModal({
  isOpen,
  onClose,
  existingSubject,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  existingSubject: Subject | null;
  onSave: () => void;
}) {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    credits: 1,
  });
  const [loading, setLoading] = useState(false);
  const addToast = useToastStore((s) => s.addToast);

  useEffect(() => {
    if (existingSubject) {
      setFormData({
        name: existingSubject.name,
        code: existingSubject.code,
        credits: existingSubject.credits,
      });
    } else {
      setFormData({ name: '', code: '', credits: 1 });
    }
  }, [existingSubject, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (existingSubject) {
        await supabase
          .from('subjects')
          .update(formData)
          .eq('id', existingSubject.id);
        addToast({ type: 'success', title: 'Subject updated successfully' });
      } else {
        await supabase.from('subjects').insert(formData);
        addToast({ type: 'success', title: 'Subject added successfully' });
      }
      onSave();
    } catch (error) {
      console.error(error);
      addToast({ type: 'error', title: 'Failed to save subject' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={existingSubject ? 'Edit Subject' : 'Add Subject'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Subject Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Mathematics"
          required
        />
        <Input
          label="Subject Code"
          value={formData.code}
          onChange={(e) => setFormData({ ...formData, code: e.target.value })}
          placeholder="e.g., MATH101"
          required
        />
        <Input
          label="Credits"
          type="number"
          value={formData.credits}
          onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) || 1 })}
          required
        />
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {existingSubject ? 'Update' : 'Add'} Subject
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Teacher Section (Faculty + Salary) ────────────────────────────
function TeacherSection({
  teachers, filteredTeachers, teacherSearch, setTeacherSearch,
  onAddTeacher, onEditTeacher, onDeleteTeacher,
}: {
  teachers: TeacherWithDetails[]; filteredTeachers: TeacherWithDetails[];
  teacherSearch: string; setTeacherSearch: (v: string) => void;
  onAddTeacher: () => void; onEditTeacher: (t: TeacherWithDetails) => void; onDeleteTeacher: (t: TeacherWithDetails) => void;
}) {
  const [subTab, setSubTab] = useState<'faculty' | 'salary'>('faculty');

  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button onClick={() => setSubTab('faculty')}
          className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap text-sm transition-colors ${
            subTab === 'faculty' ? 'bg-primary-600 text-white' : 'bg-white text-neutral-600 hover:bg-neutral-50 border border-neutral-200'
          }`}>Faculty</button>
        <button onClick={() => setSubTab('salary')}
          className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap text-sm transition-colors ${
            subTab === 'salary' ? 'bg-primary-600 text-white' : 'bg-white text-neutral-600 hover:bg-neutral-50 border border-neutral-200'
          }`}>Salary</button>
      </div>

      {subTab === 'faculty' && (
        <SectionCard
          title="Teacher Management"
          subtitle={`${filteredTeachers.length} faculty members`}
          action={<Button icon={<Plus className="w-4 h-4" />} onClick={onAddTeacher}>Add Teacher</Button>}
        >
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input type="text" placeholder="Search teachers by name or employee ID..." value={teacherSearch}
                onChange={(e) => setTeacherSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
          </div>
          <Table
            columns={[
              {
                key: 'name', header: 'Teacher',
                render: (t) => (
                  <div className="flex items-center gap-3">
                    <img src={t.user.avatar_url || 'https://via.placeholder.com/40'} alt="" className="w-10 h-10 rounded-full object-cover" />
                    <div>
                      <p className="font-medium text-neutral-900">{t.user.full_name}</p>
                      <p className="text-sm text-neutral-500">{t.user.email}</p>
                    </div>
                  </div>
                ),
              },
              { key: 'employee_id', header: 'Emp ID', render: (t) => <span className="font-mono text-neutral-600">{t.employee_id}</span> },
              { key: 'department', header: 'Department', render: (t) => <Badge variant="info">{t.department || 'N/A'}</Badge> },
              { key: 'qualification', header: 'Qualification', render: (t) => <span className="text-neutral-600">{t.qualification || 'N/A'}</span> },
              {
                key: 'status', header: 'Status',
                render: (t) => (
                  <Badge variant={t.status === 'active' ? 'success' : t.status === 'on_leave' ? 'warning' : 'default'}>
                    {t.status.replace('_', ' ')}
                  </Badge>
                ),
              },
              {
                key: 'actions', header: '',
                render: (t) => (
                  <div className="flex items-center gap-2 justify-end">
                    <button onClick={() => onEditTeacher(t)} className="p-1.5 text-neutral-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => onDeleteTeacher(t)} className="p-1.5 text-neutral-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ), className: 'w-24',
              },
            ]}
            data={filteredTeachers}
            keyExtractor={(t) => t.id}
          />
        </SectionCard>
      )}

      {subTab === 'salary' && <TeacherSalarySection teachers={teachers} />}
    </div>
  );
}

// ─── Teacher Salary Section ─────────────────────────────────────────
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function TeacherSalarySection({ teachers }: { teachers: TeacherWithDetails[] }) {
  const [salaryConfig, setSalaryConfig] = useState<Record<string, number>>({});
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [configForm, setConfigForm] = useState({ teacher_id: '', amount: '', month: '', year: String(new Date().getFullYear()) });
  const [payForm, setPayForm] = useState({ teacher_id: '', month: '', year: String(new Date().getFullYear()), amount: '' });
  const [editingConfig, setEditingConfig] = useState(false);
  const [printSlip, setPrintSlip] = useState({ teacher_id: '', month: '', year: String(new Date().getFullYear()) });
  const addToast = useToastStore((s) => s.addToast);

  useEffect(() => { loadData(); }, []);

  const loadData = () => {
    const stored = JSON.parse(localStorage.getItem('teacher_salary_config') || '{}');
    const storedPayments = JSON.parse(localStorage.getItem('salary_payments') || '[]');
    setSalaryConfig(stored);
    setPayments(storedPayments);
    setLoading(false);
  };

  const saveSalaryConfig = (config: Record<string, number>) => {
    localStorage.setItem('teacher_salary_config', JSON.stringify(config));
    setSalaryConfig(config);
  };

  const savePayments = (p: any[]) => {
    localStorage.setItem('salary_payments', JSON.stringify(p));
    setPayments(p);
  };

  const getSalary = (teacherId: string) => salaryConfig[teacherId] || 0;

  const getPaidForMonth = (teacherId: string, month: string, year: string) =>
    payments.find(p => p.teacher_id === teacherId && p.month === month && p.year === year);

  const getTotalPaid = (teacherId: string) =>
    payments.filter(p => p.teacher_id === teacherId).reduce((s, p) => s + p.amount, 0);

  const getLastPaidDate = (teacherId: string) => {
    const teacherPays = payments.filter(p => p.teacher_id === teacherId).sort((a, b) => b.year - a.year || MONTHS.indexOf(b.month) - MONTHS.indexOf(a.month));
    return teacherPays.length > 0 ? `${teacherPays[0].month} ${teacherPays[0].year}` : '—';
  };

  const getDueMonths = (teacherId: string) => {
    const salary = getSalary(teacherId);
    if (!salary) return [];
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    const dues: { month: string; year: string }[] = [];
    for (let y = new Date().getFullYear() - 2; y <= currentYear; y++) {
      const maxM = y === currentYear ? currentMonth : 11;
      for (let m = 0; m <= maxM; m++) {
        const monthName = MONTHS[m];
        if (!getPaidForMonth(teacherId, monthName, String(y))) {
          dues.push({ month: monthName, year: String(y) });
        }
      }
    }
    return dues;
  };

  const handleSaveConfig = () => {
    if (!configForm.teacher_id || !configForm.amount) { addToast({ type: 'error', title: 'Select teacher and enter amount' }); return; }
    const updated = { ...salaryConfig, [configForm.teacher_id]: parseFloat(configForm.amount) };
    saveSalaryConfig(updated);

    if (configForm.month && !getPaidForMonth(configForm.teacher_id, configForm.month, configForm.year)) {
      const newPayments = [...payments, {
        id: crypto.randomUUID(),
        teacher_id: configForm.teacher_id,
        month: configForm.month,
        year: configForm.year,
        amount: parseFloat(configForm.amount),
        payment_date: new Date().toISOString().split('T')[0],
      }];
      savePayments(newPayments);
    }

    addToast({ type: 'success', title: editingConfig ? 'Salary updated' : 'Salary set' });
    setShowConfigModal(false);
    setConfigForm({ teacher_id: '', amount: '', month: '', year: String(new Date().getFullYear()) });
    setEditingConfig(false);
  };

  const handlePaySalary = () => {
    if (!payForm.teacher_id || !payForm.month || !payForm.amount) { addToast({ type: 'error', title: 'Fill all fields' }); return; }
    if (getPaidForMonth(payForm.teacher_id, payForm.month, payForm.year)) {
      addToast({ type: 'error', title: 'Salary already paid for this month' });
      return;
    }
    const updated = [...payments, {
      id: crypto.randomUUID(),
      teacher_id: payForm.teacher_id,
      month: payForm.month,
      year: payForm.year,
      amount: parseFloat(payForm.amount),
      payment_date: new Date().toISOString().split('T')[0],
    }];
    savePayments(updated);
    addToast({ type: 'success', title: `Salary paid for ${payForm.month} ${payForm.year}` });
    setShowPayModal(false);
    setPayForm({ teacher_id: '', month: '', year: String(new Date().getFullYear()), amount: '' });
  };

  const handlePrintSlip = () => {
    if (!printSlip.teacher_id || !printSlip.month || !printSlip.year) { addToast({ type: 'error', title: 'Select teacher, month and year' }); return; }
    const teacher = teachers.find(t => t.id === printSlip.teacher_id);
    const payment = payments.find(p => p.teacher_id === printSlip.teacher_id && p.month === printSlip.month && p.year === printSlip.year);
    if (!teacher) return;
    const salary = getSalary(printSlip.teacher_id);
    const totalPaid = getTotalPaid(printSlip.teacher_id);
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`
      <!DOCTYPE html><html><head><title>Salary Slip - ${teacher.user.full_name}</title>
      <style>
        @page { margin: 12mm; }
        body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a1a; padding: 20px; }
        .header { text-align: center; border-bottom: 2px solid #1a56db; padding-bottom: 14px; margin-bottom: 20px; }
        .header h1 { margin: 0; font-size: 22px; color: #1a56db; }
        .header p { margin: 3px 0; font-size: 12px; color: #555; }
        .header .title { font-size: 16px; font-weight: 600; color: #1a1a1a; margin-top: 6px; }
        .employee-info { margin-bottom: 20px; }
        .employee-info table { width: 100%; font-size: 13px; }
        .employee-info td { padding: 3px 8px; }
        .employee-info td:first-child { font-weight: 600; width: 140px; color: #555; }
        .salary-details { width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 10px; }
        .salary-details th { background: #f3f4f6; text-align: left; padding: 8px 10px; border-bottom: 2px solid #d1d5db; }
        .salary-details td { padding: 8px 10px; border-bottom: 1px solid #e5e7eb; }
        .salary-details .total-row td { font-weight: 700; border-top: 2px solid #1a1a1a; font-size: 14px; }
        .status-badge { display: inline-block; padding: 2px 10px; border-radius: 10px; font-size: 11px; font-weight: 600; }
        .status-paid { background: #d1fae5; color: #065f46; }
        .status-unpaid { background: #fee2e2; color: #991b1b; }
        .footer { text-align: center; margin-top: 25px; font-size: 11px; color: #888; border-top: 1px solid #e5e7eb; padding-top: 12px; }
        .print-btn { text-align: center; margin-bottom: 20px; }
        .print-btn button { padding: 10px 30px; background: #1a56db; color: #fff; border: none; border-radius: 6px; font-size: 14px; cursor: pointer; }
        @media print { .no-print { display: none; } body { padding: 0; } }
      </style></head><body>
      <div class="no-print print-btn"><button onclick="window.print()">Print Salary Slip</button></div>
      <div class="header">
        <h1>Mr Pathak School</h1>
        <p>Sector 4, Dwarka, New Delhi - 110075</p>
        <div class="title">Salary Slip — ${printSlip.month} ${printSlip.year}</div>
      </div>
      <div class="employee-info">
        <table>
          <tr><td>Employee Name</td><td>: ${teacher.user.full_name}</td><td>Employee ID</td><td>: ${teacher.employee_id}</td></tr>
          <tr><td>Department</td><td>: ${teacher.department || 'N/A'}</td><td>Qualification</td><td>: ${teacher.qualification || 'N/A'}</td></tr>
          <tr><td>Status</td><td>: ${teacher.status.replace('_', ' ')}</td><td></td><td></td></tr>
        </table>
      </div>
      <table class="salary-details">
        <thead><tr><th>Description</th><th style="text-align:right">Amount (₹)</th></tr></thead>
        <tbody>
          <tr><td>Monthly Salary (${printSlip.month} ${printSlip.year})</td><td style="text-align:right">${salary.toLocaleString()}</td></tr>
          <tr><td>Total Paid (All time)</td><td style="text-align:right">${totalPaid.toLocaleString()}</td></tr>
          <tr><td>Payment for this month</td><td style="text-align:right">${payment ? payment.amount.toLocaleString() : '—'}</td></tr>
          <tr><td>Payment Date</td><td style="text-align:right">${payment ? new Date(payment.payment_date).toLocaleDateString() : '—'}</td></tr>
          <tr><td>Status</td><td style="text-align:right">${payment ? '<span class="status-badge status-paid">Paid</span>' : '<span class="status-badge status-unpaid">Unpaid</span>'}</td></tr>
          <tr class="total-row"><td>Net Salary (This Month)</td><td style="text-align:right">₹${salary.toLocaleString()}</td></tr>
        </tbody>
      </table>
      <div class="footer">
        <p>This is a computer-generated salary slip. Mr Pathak School, Dwarka, New Delhi</p>
        <p>Generated on ${new Date().toLocaleDateString()}</p>
      </div>
      </body></html>
    `);
    w.document.close();
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-primary-50 rounded-xl p-4">
          <p className="text-sm font-medium text-primary-600">Teachers</p>
          <p className="text-2xl font-bold text-primary-700 mt-1">{teachers.length}</p>
        </div>
        <div className="bg-success-50 rounded-xl p-4">
          <p className="text-sm font-medium text-success-600">With Salary Set</p>
          <p className="text-2xl font-bold text-success-700 mt-1">{Object.keys(salaryConfig).length}</p>
        </div>
        <div className="bg-warning-50 rounded-xl p-4">
          <p className="text-sm font-medium text-warning-600">Monthly Payroll</p>
          <p className="text-2xl font-bold text-warning-700 mt-1">₹{teachers.reduce((s, t) => s + getSalary(t.id), 0).toLocaleString()}</p>
        </div>
        <div className="bg-danger-50 rounded-xl p-4">
          <p className="text-sm font-medium text-danger-600">Total Paid</p>
          <p className="text-2xl font-bold text-danger-700 mt-1">₹{payments.reduce((s, p) => s + p.amount, 0).toLocaleString()}</p>
        </div>
      </div>

      {/* Salary per Teacher */}
      <SectionCard
        title="Teacher Salary Configuration"
        subtitle="Set monthly salary and record initial payment"
        action={
          <Button onClick={() => { setEditingConfig(false); setConfigForm({ teacher_id: '', amount: '', month: MONTHS[new Date().getMonth()], year: String(new Date().getFullYear()) }); setShowConfigModal(true); }} icon={<Plus className="w-4 h-4" />}>
            Set Salary
          </Button>
        }
      >
        <Table
          columns={[
            {
              key: 'teacher', header: 'Teacher',
              render: (t: TeacherWithDetails) => (
                <div className="flex items-center gap-2">
                  <img src={t.user.avatar_url || 'https://via.placeholder.com/32'} alt="" className="w-8 h-8 rounded-full object-cover" />
                  <span className="font-medium text-neutral-900">{t.user.full_name}</span>
                </div>
              ),
            },
            { key: 'dept', header: 'Department', render: (t: TeacherWithDetails) => <span className="text-neutral-600">{t.department || '—'}</span> },
            {
              key: 'salary', header: 'Monthly Salary',
              render: (t: TeacherWithDetails) => {
                const amt = getSalary(t.id);
                return amt ? <span className="font-semibold">₹{amt.toLocaleString()}</span> : <Badge variant="default">Not set</Badge>;
              },
            },
            {
              key: 'total_paid', header: 'Total Paid',
              render: (t: TeacherWithDetails) => <span className="text-success-600 font-medium">₹{getTotalPaid(t.id).toLocaleString()}</span>,
            },
            {
              key: 'last_paid', header: 'Last Paid',
              render: (t: TeacherWithDetails) => <span className="text-neutral-600 text-sm">{getLastPaidDate(t.id)}</span>,
            },
            {
              key: 'dues', header: 'Dues',
              render: (t: TeacherWithDetails) => {
                const dues = getDueMonths(t.id);
                if (!getSalary(t.id)) return <span className="text-neutral-400 text-sm">—</span>;
                return <span className="text-danger-600 text-sm">{dues.length} month{dues.length !== 1 ? 's' : ''} pending</span>;
              },
            },
            {
              key: 'actions', header: '',
              render: (t: TeacherWithDetails) => (
                <div className="flex gap-2 justify-end">
                  {getSalary(t.id) ? (
                    <button onClick={() => { setEditingConfig(true); setConfigForm({ teacher_id: t.id, amount: String(getSalary(t.id)), month: '', year: String(new Date().getFullYear()) }); setShowConfigModal(true); }}
                      className="p-1.5 text-neutral-400 hover:text-primary-600 rounded-lg"><Edit className="w-4 h-4" /></button>
                  ) : (
                    <button onClick={() => { setConfigForm({ teacher_id: t.id, amount: '', month: MONTHS[new Date().getMonth()], year: String(new Date().getFullYear()) }); setShowConfigModal(true); }}
                      className="p-1.5 text-primary-600 hover:bg-primary-50 rounded-lg text-xs font-medium">Set</button>
                  )}
                </div>
              ), className: 'w-16',
            },
          ]}
          data={teachers}
          keyExtractor={(t: TeacherWithDetails) => t.id}
        />
      </SectionCard>

      {/* Pay Salary */}
      <SectionCard
        title="Pay Salary"
        subtitle="Record salary payment for a teacher for a specific month"
        action={
          <Button onClick={() => { setPayForm({ teacher_id: '', month: '', year: String(new Date().getFullYear()), amount: '' }); setShowPayModal(true); }} icon={<Plus className="w-4 h-4" />}>
            Pay Salary
          </Button>
        }
      >
        <div className="space-y-3">
          {teachers.filter(t => getSalary(t.id) > 0).map((t) => {
            const dues = getDueMonths(t.id);
            if (dues.length === 0) return null;
            return (
              <div key={t.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <img src={t.user.avatar_url || 'https://via.placeholder.com/32'} alt="" className="w-8 h-8 rounded-full object-cover" />
                  <div>
                    <p className="font-medium text-neutral-900">{t.user.full_name}</p>
                    <p className="text-xs text-neutral-500">₹{getSalary(t.id).toLocaleString()}/month · {dues.length} due</p>
                  </div>
                </div>
                <div className="flex gap-1 flex-wrap max-w-[320px]">
                  {dues.slice(0, 5).map((d) => (
                    <button
                      key={`${d.month}${d.year}`}
                      onClick={() => { setPayForm({ teacher_id: t.id, month: d.month, year: d.year, amount: String(getSalary(t.id)) }); setShowPayModal(true); }}
                      className="text-xs px-2.5 py-1 bg-danger-50 text-danger-700 rounded-lg hover:bg-danger-100 transition-colors whitespace-nowrap"
                    >
                      {d.month.slice(0, 3)} {d.year}
                    </button>
                  ))}
                  {dues.length > 5 && <span className="text-xs text-neutral-400 self-center">+{dues.length - 5} more</span>}
                </div>
              </div>
            );
          })}
          {teachers.filter(t => getSalary(t.id) > 0).length === 0 && (
            <p className="text-center text-neutral-400 py-6 text-sm">No salaries configured yet. Set a salary for a teacher first.</p>
          )}
          {teachers.filter(t => getSalary(t.id) > 0).every(t => getDueMonths(t.id).length === 0) && Object.keys(salaryConfig).length > 0 && (
            <p className="text-center text-success-600 py-6 text-sm font-medium">All salaries are up to date!</p>
          )}
        </div>
      </SectionCard>

      {/* Print Salary Slip */}
      <SectionCard title="Print Salary Slip" subtitle="Generate printable salary slip per teacher per month">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Select
            label="Teacher"
            value={printSlip.teacher_id}
            onChange={(e) => { setPrintSlip(f => ({ ...f, teacher_id: e.target.value, month: '', year: '' })); }}
            options={[{ value: '', label: 'Select teacher' }, ...teachers.map(t => ({ value: t.id, label: `${t.user.full_name} (${t.employee_id})` }))]}
          />
          <Select
            label="Month"
            value={printSlip.month}
            onChange={(e) => setPrintSlip(f => ({ ...f, month: e.target.value }))}
            options={[
              { value: '', label: 'Month' },
              ...(printSlip.teacher_id
                ? payments
                    .filter(p => p.teacher_id === printSlip.teacher_id)
                    .map(p => ({ value: p.month, label: p.month }))
                    .filter((v, i, a) => a.findIndex(x => x.value === v.value) === i)
                : MONTHS.map(m => ({ value: m, label: m }))
              ),
            ]}
          />
          <Input label="Year" type="number" value={printSlip.year} onChange={(e) => setPrintSlip(f => ({ ...f, year: e.target.value }))} />
          <div className="flex items-end">
            <Button
              onClick={handlePrintSlip}
              disabled={!printSlip.teacher_id || !printSlip.month || !printSlip.year}
              className="w-full"
              icon={<Receipt className="w-4 h-4" />}
            >
              Print Slip
            </Button>
          </div>
        </div>
      </SectionCard>

      {/* Payment History */}
      <SectionCard title="Salary Payment History" subtitle="All recorded salary payments">
        <div className="space-y-2">
          {payments.slice().reverse().slice(0, 30).map((p: any) => {
            const teacher = teachers.find(t => t.id === p.teacher_id);
            return (
              <div key={p.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-4 h-4 text-neutral-400" />
                  <div>
                    <p className="text-sm font-medium text-neutral-900">{teacher?.user.full_name || 'Unknown'}</p>
                    <p className="text-xs text-neutral-500">{p.month} {p.year} · {new Date(p.payment_date).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className="font-semibold text-success-600">₹{p.amount.toLocaleString()}</span>
              </div>
            );
          })}
          {payments.length === 0 && <p className="text-center text-neutral-400 py-6 text-sm">No salary payments recorded yet.</p>}
        </div>
      </SectionCard>

      {/* Set/Edit Salary Modal */}
      <Modal isOpen={showConfigModal} onClose={() => setShowConfigModal(false)} title={editingConfig ? 'Edit Salary' : 'Set Salary'}>
        <div className="space-y-4">
          <Select label="Teacher" value={configForm.teacher_id} onChange={(e) => setConfigForm(f => ({ ...f, teacher_id: e.target.value }))}
            options={[{ value: '', label: 'Select teacher' }, ...teachers.map(t => ({ value: t.id, label: `${t.user.full_name} (${t.employee_id})` }))]} />
          <Input label="Monthly Salary (₹)" type="number" value={configForm.amount} onChange={(e) => setConfigForm(f => ({ ...f, amount: e.target.value }))} placeholder="e.g. 25000" />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Start Month (optional)" value={configForm.month} onChange={(e) => setConfigForm(f => ({ ...f, month: e.target.value }))}
              options={[{ value: '', label: 'None' }, ...MONTHS.map(m => ({ value: m, label: m }))]} />
            <Input label="Year" type="number" value={configForm.year} onChange={(e) => setConfigForm(f => ({ ...f, year: e.target.value }))} />
          </div>
          <p className="text-xs text-neutral-500">If a month is selected, salary for that month will also be recorded as paid.</p>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setShowConfigModal(false)}>Cancel</Button>
            <Button onClick={handleSaveConfig}>{editingConfig ? 'Update' : 'Save'} Salary</Button>
          </div>
        </div>
      </Modal>

      {/* Pay Salary Modal */}
      <Modal isOpen={showPayModal} onClose={() => setShowPayModal(false)} title="Pay Salary">
        <div className="space-y-4">
          <Select label="Teacher" value={payForm.teacher_id} onChange={(e) => setPayForm(f => ({ ...f, teacher_id: e.target.value, amount: String(getSalary(e.target.value) || '') }))}
            options={[{ value: '', label: 'Select teacher' }, ...teachers.map(t => ({ value: t.id, label: `${t.user.full_name} (${t.employee_id})` }))]} />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Month" value={payForm.month} onChange={(e) => setPayForm(f => ({ ...f, month: e.target.value }))}
              options={[{ value: '', label: 'Month' }, ...MONTHS.map(m => ({ value: m, label: m }))]} />
            <Input label="Year" type="number" value={payForm.year} onChange={(e) => setPayForm(f => ({ ...f, year: e.target.value }))} />
          </div>
          <Input label="Amount (₹)" type="number" value={payForm.amount} onChange={(e) => setPayForm(f => ({ ...f, amount: e.target.value }))} />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setShowPayModal(false)}>Cancel</Button>
            <Button onClick={handlePaySalary}>Pay Salary</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ─── Merged Classes Section ─────────────────────────────────────────
function MergedClassesSection({
  classes, subjects, teachers, students,
  onAddClass, onEditClass, onDeleteClass,
  onAddSubject, onEditSubject, onDeleteSubject,
}: {
  classes: Class[]; subjects: Subject[]; teachers: TeacherWithDetails[]; students: StudentWithDetails[];
  onAddClass: () => void; onEditClass: (c: Class) => void; onDeleteClass: (c: Class) => void;
  onAddSubject: () => void; onEditSubject: (s: Subject) => void; onDeleteSubject: (id: string) => void;
}) {
  const [subTab, setSubTab] = useState<'classes' | 'subjects' | 'schedule'>('classes');

  const SUB_TABS = [
    { id: 'classes' as const, label: 'Classes' },
    { id: 'subjects' as const, label: 'Subjects' },
    { id: 'schedule' as const, label: 'Schedule' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-2">
        {SUB_TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setSubTab(t.id)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap text-sm transition-colors ${
              subTab === t.id
                ? 'bg-primary-600 text-white'
                : 'bg-white text-neutral-600 hover:bg-neutral-50 border border-neutral-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {subTab === 'classes' && (
        <SectionCard
          title="Class Management"
          subtitle={`${classes.length} classes`}
          action={
            <Button icon={<Plus className="w-4 h-4" />} onClick={onAddClass}>Add Class</Button>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classes.map((cls) => (
              <div key={cls.id} className="bg-white border border-neutral-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-xl font-bold text-neutral-900">Grade {cls.name}-{cls.section}</h4>
                    <p className="text-sm text-neutral-500">{cls.academic_year}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => onEditClass(cls)} className="p-1.5 text-neutral-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => onDeleteClass(cls)} className="p-1.5 text-neutral-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-neutral-400" />
                  <span className="text-neutral-600">{students.filter((s) => s.class_id === cls.id).length} students</span>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {subTab === 'subjects' && (
        <SectionCard
          title="Subject Management"
          subtitle={`${subjects.length} subjects`}
          action={
            <Button icon={<Plus className="w-4 h-4" />} onClick={onAddSubject}>Add Subject</Button>
          }
        >
          <Table
            columns={[
              {
                key: 'name', header: 'Subject Name',
                render: (s) => (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-primary-600" />
                    </div>
                    <span className="font-medium text-neutral-900">{s.name}</span>
                  </div>
                ),
              },
              { key: 'code', header: 'Code', render: (s) => <Badge variant="info">{s.code}</Badge> },
              { key: 'credits', header: 'Credits', render: (s) => <span className="text-neutral-600">{s.credits}</span> },
              {
                key: 'actions', header: '',
                render: (s) => (
                  <div className="flex items-center gap-2 justify-end">
                    <button onClick={() => onEditSubject(s)} className="p-1.5 text-neutral-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => onDeleteSubject(s.id)} className="p-1.5 text-neutral-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ), className: 'w-24',
              },
            ]}
            data={subjects}
            keyExtractor={(s) => s.id}
          />
        </SectionCard>
      )}

      {subTab === 'schedule' && <ScheduleSection classes={classes} subjects={subjects} teachers={teachers} />}
    </div>
  );
}

// ─── Schedule Section (wraps ScheduleManager + print) ──────────────
function ScheduleSection({ classes, subjects, teachers }: { classes: Class[]; subjects: Subject[]; teachers: TeacherWithDetails[] }) {
  const [timetable, setTimetable] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.from('timetable').select(`*, subject:subjects(*), teacher:teachers(*, user:users(*))`).order('day_of_week').order('period')
      .then(({ data }) => setTimetable(data as any[] || []));
  }, []);

  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const PERIODS = [1, 2, 3, 4, 5, 6];

  const getClassTt = (classId: string) => timetable.filter(t => t.class_id === classId);
  const getSubjectName = (id: string) => subjects.find(s => s.id === id)?.name || 'N/A';
  const getTeacherName = (id: string | null) => id ? (teachers.find(t => t.id === id)?.user.full_name || '—') : '—';

  const handlePrint = () => {
    const cls = classes.find(c => c.id === selectedClass);
    const tt = getClassTt(selectedClass);
    if (!cls || tt.length === 0) return;
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`
      <!DOCTYPE html><html><head><title>Schedule - ${cls.name}-${cls.section}</title>
      <style>
        @page { margin: 10mm; }
        body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a1a; padding: 10px; }
        .header { text-align: center; border-bottom: 2px solid #1a56db; padding-bottom: 12px; margin-bottom: 16px; }
        .header h1 { margin: 0; font-size: 20px; color: #1a56db; }
        .header p { margin: 3px 0; font-size: 12px; color: #555; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        th { background: #1a56db; color: #fff; padding: 8px 10px; text-align: left; }
        td { padding: 8px 10px; border: 1px solid #d1d5db; vertical-align: top; }
        .slot { min-height: 50px; }
        .slot .subj { font-weight: 600; color: #1a56db; }
        .slot .teacher { font-size: 11px; color: #555; }
        .slot .meta { font-size: 10px; color: #888; }
        tr:nth-child(even) td { background: #f9fafb; }
        .footer { text-align: center; margin-top: 20px; font-size: 10px; color: #888; }
        .print-btn { text-align: center; margin-bottom: 16px; }
        .print-btn button { padding: 8px 24px; background: #1a56db; color: #fff; border: none; border-radius: 4px; cursor: pointer; }
        @media print { .no-print { display: none; } }
      </style></head><body>
      <div class="no-print print-btn"><button onclick="window.print()">Print Timetable</button></div>
      <div class="header">
        <h1>Mr Pathak School</h1>
        <p>Sector 4, Dwarka, New Delhi - 110075</p>
        <p>Class Timetable — Grade ${cls.name}-${cls.section}</p>
      </div>
      <table><thead><tr><th>Period</th>${DAYS.map((d, i) => `<th>${d}</th>`).join('')}</tr></thead>
      <tbody>${PERIODS.map(p => `<tr><td style="font-weight:600;background:#f3f4f6;width:50px">${p}</td>${
        DAYS.map((_, di) => {
          const slot = tt.find(t => t.day_of_week === di + 1 && t.period === p);
          return slot ? `<td><div class="slot"><div class="subj">${getSubjectName(slot.subject_id)}</div><div class="teacher">${getTeacherName(slot.teacher_id)}</div>${slot.room ? `<div class="meta">Room ${slot.room}</div>` : ''}${slot.start_time ? `<div class="meta">${slot.start_time?.substring(0,5)}-${slot.end_time?.substring(0,5)}</div>` : ''}</div></td>`
            : '<td><div class="slot" style="color:#ccc;text-align:center">—</div></td>';
        }).join('')
      }</tr>`).join('')}</tbody></table>
      <div class="footer"><p>Generated on ${new Date().toLocaleDateString()} · Mr Pathak School</p></div>
      </body></html>
    `);
    w.document.close();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Select a class to view & print schedule</option>
            {classes.map(c => <option key={c.id} value={c.id}>Grade {c.name}-{c.section}</option>)}
          </select>
        </div>
        {selectedClass && (
          <Button onClick={handlePrint} icon={<Receipt className="w-4 h-4" />}>
            Print Schedule
          </Button>
        )}
      </div>
      <ScheduleManager classes={classes} subjects={subjects} teachers={teachers} />
    </div>
  );
}

// ─── Fee Section with Tuition & Exam Fee sub-tabs ───────────────────
function FeeSection({ students, classes, onRefresh }: { students: StudentWithDetails[]; classes: Class[]; onRefresh: () => void }) {
  const [subTab, setSubTab] = useState<'tuition' | 'exam' | 'receipts'>('tuition');

  const SUB_TABS = [
    { id: 'tuition' as const, label: 'Tuition Fee' },
    { id: 'exam' as const, label: 'Exam Fee' },
    { id: 'receipts' as const, label: 'Receipts' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-2">
        {SUB_TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setSubTab(t.id)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap text-sm transition-colors ${
              subTab === t.id
                ? 'bg-primary-600 text-white'
                : 'bg-white text-neutral-600 hover:bg-neutral-50 border border-neutral-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {subTab === 'tuition' && <AdminFeeManager students={students} onRefresh={onRefresh} />}
      {subTab === 'exam' && <ExamFeeSection students={students} classes={classes} onRefresh={onRefresh} />}
      {subTab === 'receipts' && <PrintReceiptSection students={students} />}
    </div>
  );
}

// ─── Exam Fee Section ───────────────────────────────────────────────
const EXAM_MODES = ['Term 1', 'Term 2', 'Term 3', 'Final', 'Practical', 'Midterm', 'Other'];

function parseExamMode(feeType: string): string {
  if (!feeType || feeType === 'exam') return 'Standard';
  const parts = feeType.split('|');
  return parts.length > 1 ? parts[1] : 'Standard';
}

function ExamFeeSection({ students, classes, onRefresh }: { students: StudentWithDetails[]; classes: Class[]; onRefresh: () => void }) {
  const [examFeeStructures, setExamFeeStructures] = useState<any[]>([]);
  const [examPayments, setExamPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [editingFee, setEditingFee] = useState<any>(null);
  const [feeForm, setFeeForm] = useState({ class_id: '', mode: '', amount: '', due_date: '' });
  const [payForm, setPayForm] = useState({ student_id: '', amount: '', method: 'cash' });
  const addToast = useToastStore((s) => s.addToast);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    const [feeRes, payRes] = await Promise.all([
      supabase.from('fee_structures').select('*').like('fee_type', 'exam%'),
      supabase.from('fee_payments').select(`*, student:students(*, user:users(*), class:classes(*))`).like('fee_type', 'exam%').order('created_at', { ascending: false }),
    ]);
    setExamFeeStructures(feeRes.data || []);
    setExamPayments(payRes.data as any[] || []);
    setLoading(false);
  };

  const getExamFeesForClass = (classId: string) => examFeeStructures.filter(fs => fs.class_id === classId);

  const getTotalExamFeeForClass = (classId: string) =>
    getExamFeesForClass(classId).reduce((sum, fs) => sum + fs.amount, 0);

  const getStudentExamPaid = (studentId: string) =>
    examPayments.filter(p => p.student_id === studentId && (p.status === 'paid' || p.status === 'partial')).reduce((s, p) => s + p.amount_paid, 0);

  const handleSaveFee = async () => {
    if (!feeForm.class_id || !feeForm.amount || !feeForm.mode) { addToast({ type: 'error', title: 'Fill all fields' }); return; }
    const feeType = `exam|${feeForm.mode}`;
    if (editingFee) {
      await supabase.from('fee_structures').update({
        class_id: feeForm.class_id, amount: parseFloat(feeForm.amount), due_date: feeForm.due_date, fee_type: feeType,
      }).eq('id', editingFee.id);
    } else {
      await supabase.from('fee_structures').insert({
        class_id: feeForm.class_id, amount: parseFloat(feeForm.amount), fee_type: feeType,
        academic_year: '2025-2026', due_date: feeForm.due_date || new Date().toISOString().split('T')[0],
      });
    }
    addToast({ type: 'success', title: editingFee ? 'Exam fee updated' : 'Exam fee added' });
    setShowFeeModal(false);
    setEditingFee(null);
    setFeeForm({ class_id: '', mode: '', amount: '', due_date: '' });
    fetchData();
  };

  const handleRecordPayment = async () => {
    if (!payForm.student_id || !payForm.amount) { addToast({ type: 'error', title: 'Select student and enter amount' }); return; }
    const student = students.find(s => s.id === payForm.student_id);
    const totalFee = getTotalExamFeeForClass(student?.class_id || '');
    await supabase.from('fee_payments').insert({
      student_id: payForm.student_id, fee_structure_id: '00000000-0000-0000-0000-000000000000',
      amount_paid: parseFloat(payForm.amount), payment_date: new Date().toISOString().split('T')[0],
      payment_method: payForm.method, receipt_number: `EXM-${Date.now().toString(36).toUpperCase()}`,
      collected_by: '00000001-1111-1111-1111-111111111111',
      status: parseFloat(payForm.amount) >= totalFee ? 'paid' : 'partial',
      fee_type: 'exam',
    });
    addToast({ type: 'success', title: 'Exam fee payment recorded' });
    setShowPaymentModal(false);
    setPayForm({ student_id: '', amount: '', method: 'cash' });
    fetchData();
  };

  const totalCollected = examPayments.filter(p => p.status === 'paid' || p.status === 'partial').reduce((s, p) => s + p.amount_paid, 0);

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-primary-50 rounded-xl p-4">
          <p className="text-sm font-medium text-primary-600">Exam Fee Entries</p>
          <p className="text-2xl font-bold text-primary-700 mt-1">{examFeeStructures.length}</p>
        </div>
        <div className="bg-success-50 rounded-xl p-4">
          <p className="text-sm font-medium text-success-600">Total Exam Fee Collected</p>
          <p className="text-2xl font-bold text-success-700 mt-1">₹{totalCollected.toLocaleString()}</p>
        </div>
        <div className="bg-warning-50 rounded-xl p-4">
          <p className="text-sm font-medium text-warning-600">Students Paid</p>
          <p className="text-2xl font-bold text-warning-700 mt-1">{new Set(examPayments.filter(p => p.status === 'paid' || p.status === 'partial').map(p => p.student_id)).size}</p>
        </div>
      </div>

      {/* Exam Fee Structures */}
      <SectionCard
        title="Exam Fee per Class"
        subtitle="Set examination fees for each class and mode"
        action={
          <Button onClick={() => { setEditingFee(null); setFeeForm({ class_id: '', mode: '', amount: '', due_date: '' }); setShowFeeModal(true); }} icon={<Plus className="w-4 h-4" />}>
            Add Exam Fee
          </Button>
        }
      >
        <Table
          columns={[
            { key: 'class', header: 'Class', render: (fs: any) => <span className="font-medium">Grade {classes.find(c => c.id === fs.class_id)?.name}-{classes.find(c => c.id === fs.class_id)?.section}</span> },
            { key: 'mode', header: 'Exam Mode', render: (fs: any) => <Badge variant="info">{parseExamMode(fs.fee_type)}</Badge> },
            { key: 'amount', header: 'Amount', render: (fs: any) => <span className="font-semibold">₹{fs.amount.toLocaleString()}</span> },
            { key: 'due_date', header: 'Due Date', render: (fs: any) => <span className="text-neutral-600">{fs.due_date ? new Date(fs.due_date).toLocaleDateString() : 'N/A'}</span> },
            {
              key: 'actions', header: '',
              render: (fs: any) => (
                <div className="flex gap-2 justify-end">
                  <button onClick={() => { setEditingFee(fs); setFeeForm({ class_id: fs.class_id, mode: parseExamMode(fs.fee_type), amount: String(fs.amount), due_date: fs.due_date?.split('T')[0] || '' }); setShowFeeModal(true); }}
                    className="p-1.5 text-neutral-400 hover:text-primary-600 rounded-lg"><Edit className="w-4 h-4" /></button>
                  <button onClick={async () => { if (!confirm('Delete this exam fee?')) return; await supabase.from('fee_structures').delete().eq('id', fs.id); addToast({ type: 'success', title: 'Deleted' }); fetchData(); }}
                    className="p-1.5 text-neutral-400 hover:text-danger-600 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                </div>
              ), className: 'w-24',
            },
          ]}
          data={examFeeStructures}
          keyExtractor={(fs: any) => fs.id}
        />
        {examFeeStructures.length === 0 && <p className="text-center text-neutral-400 py-6 text-sm">No exam fees configured. Click "Add Exam Fee" to set one.</p>}
      </SectionCard>

      {/* Student Fee Status */}
      <SectionCard
        title="Student Exam Fee Status"
        subtitle="Track total exam fee payments per student (all modes)"
        action={
          <Button onClick={() => { setPayForm({ student_id: '', amount: '', method: 'cash' }); setShowPaymentModal(true); }} icon={<Plus className="w-4 h-4" />}>
            Record Payment
          </Button>
        }
      >
        <Table
          columns={[
            {
              key: 'student', header: 'Student',
              render: (s: StudentWithDetails) => (
                <div className="flex items-center gap-2">
                  <img src={s.user.avatar_url || 'https://via.placeholder.com/32'} alt="" className="w-8 h-8 rounded-full object-cover" />
                  <span className="font-medium text-neutral-900">{s.user.full_name}</span>
                </div>
              ),
            },
            { key: 'class', header: 'Class', render: (s: StudentWithDetails) => <span className="text-neutral-600">{s.class?.name}-{s.class?.section}</span> },
            {
              key: 'fee', header: 'Total Exam Fee',
              render: (s: StudentWithDetails) => {
                const total = getTotalExamFeeForClass(s.class_id);
                return <span className="font-medium">₹{total.toLocaleString() || '—'}</span>;
              },
            },
            {
              key: 'paid', header: 'Paid',
              render: (s: StudentWithDetails) => <span className="text-success-600 font-medium">₹{getStudentExamPaid(s.id).toLocaleString()}</span>,
            },
            {
              key: 'status', header: 'Status',
              render: (s: StudentWithDetails) => {
                const total = getTotalExamFeeForClass(s.class_id);
                const paid = getStudentExamPaid(s.id);
                if (total === 0) return <Badge variant="default">No fee set</Badge>;
                if (paid >= total) return <Badge variant="success">Paid</Badge>;
                if (paid > 0) return <Badge variant="warning">Partial</Badge>;
                return <Badge variant="danger">Unpaid</Badge>;
              },
            },
          ]}
          data={students}
          keyExtractor={(s: StudentWithDetails) => s.id}
        />
      </SectionCard>

      {/* Exam Fee Payments History */}
      <SectionCard title="Exam Fee Payments" subtitle="Recent exam fee transactions">
        <div className="space-y-2">
          {examPayments.slice(0, 20).map((p: any) => {
            const student = students.find(s => s.id === p.student_id);
            return (
              <div key={p.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Receipt className="w-4 h-4 text-neutral-400" />
                  <div>
                    <p className="text-sm font-medium text-neutral-900">{student?.user.full_name || 'Unknown'}</p>
                    <p className="text-xs text-neutral-500">{p.receipt_number} · {new Date(p.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-neutral-900">₹{p.amount_paid.toLocaleString()}</span>
                  <Badge variant={p.status === 'paid' ? 'success' : p.status === 'partial' ? 'warning' : 'default'}>{p.status}</Badge>
                </div>
              </div>
            );
          })}
          {examPayments.length === 0 && <p className="text-center text-neutral-400 py-6 text-sm">No exam fee payments recorded yet.</p>}
        </div>
      </SectionCard>

      {/* Add/Edit Exam Fee Modal */}
      <Modal isOpen={showFeeModal} onClose={() => setShowFeeModal(false)} title={editingFee ? 'Edit Exam Fee' : 'Add Exam Fee'}>
        <div className="space-y-4">
          <Select label="Class" value={feeForm.class_id} onChange={(e) => setFeeForm(f => ({ ...f, class_id: e.target.value }))}
            options={[{ value: '', label: 'Select class' }, ...classes.map(c => ({ value: c.id, label: `Grade ${c.name}-${c.section}` }))]} />
          <Select label="Exam Mode" value={feeForm.mode} onChange={(e) => setFeeForm(f => ({ ...f, mode: e.target.value }))}
            options={[{ value: '', label: 'Select exam mode' }, ...EXAM_MODES.map(m => ({ value: m, label: m }))]} />
          <Input label="Amount (₹)" type="number" value={feeForm.amount} onChange={(e) => setFeeForm(f => ({ ...f, amount: e.target.value }))} />
          <Input label="Due Date" type="date" value={feeForm.due_date} onChange={(e) => setFeeForm(f => ({ ...f, due_date: e.target.value }))} />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setShowFeeModal(false)}>Cancel</Button>
            <Button onClick={handleSaveFee}>{editingFee ? 'Update' : 'Add'} Fee</Button>
          </div>
        </div>
      </Modal>

      {/* Record Payment Modal */}
      <Modal isOpen={showPaymentModal} onClose={() => setShowPaymentModal(false)} title="Record Exam Fee Payment">
        <div className="space-y-4">
          <Select label="Student" value={payForm.student_id} onChange={(e) => setPayForm(f => ({ ...f, student_id: e.target.value }))}
            options={[{ value: '', label: 'Select student' }, ...students.map(s => ({ value: s.id, label: `${s.user.full_name} (${s.roll_number})` }))]} />
          {payForm.student_id && (() => {
            const total = getTotalExamFeeForClass(students.find(s => s.id === payForm.student_id)?.class_id || '');
            const paid = getStudentExamPaid(payForm.student_id);
            return (
              <div className="p-3 bg-neutral-50 rounded-lg text-sm space-y-1">
                <div className="flex justify-between"><span>Total Exam Fee:</span><span className="font-medium">₹{total.toLocaleString() || 'N/A'}</span></div>
                <div className="flex justify-between"><span>Already Paid:</span><span className="font-medium text-success-600">₹{paid.toLocaleString()}</span></div>
                <div className="flex justify-between font-semibold border-t border-neutral-200 pt-1"><span>Pending:</span><span className="text-danger-600">₹{Math.max(0, total - paid).toLocaleString()}</span></div>
              </div>
            );
          })()}
          <Input label="Amount (₹)" type="number" value={payForm.amount} onChange={(e) => setPayForm(f => ({ ...f, amount: e.target.value }))} />
          <Select label="Payment Method" value={payForm.method} onChange={(e) => setPayForm(f => ({ ...f, method: e.target.value }))}
            options={[{ value: 'cash', label: 'Cash' }, { value: 'online', label: 'Online' }, { value: 'bank_transfer', label: 'Bank Transfer' }]} />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setShowPaymentModal(false)}>Cancel</Button>
            <Button onClick={handleRecordPayment}>Record Payment</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ─── Print Receipt Section ──────────────────────────────────────────
function PrintReceiptSection({ students }: { students: StudentWithDetails[] }) {
  const [selectedStudent, setSelectedStudent] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [payments, setPayments] = useState<any[]>([]);
  const [feeStructures, setFeeStructures] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const addToast = useToastStore((s) => s.addToast);

  const handleSearch = async () => {
    if (!selectedStudent) { addToast({ type: 'error', title: 'Select a student' }); return; }
    if (!fromDate || !toDate) { addToast({ type: 'error', title: 'Select date range' }); return; }
    setLoading(true);
    setSearched(false);
    const [payRes, feeRes] = await Promise.all([
      supabase.from('fee_payments').select(`*, fee_structure:fee_structures(*)`).eq('student_id', selectedStudent)
        .gte('payment_date', fromDate).lte('payment_date', toDate).order('payment_date', { ascending: true }),
      supabase.from('fee_structures').select('*'),
    ]);
    setPayments(payRes.data || []);
    setFeeStructures(feeRes.data || []);
    setSearched(true);
    setLoading(false);
  };

  const student = students.find(s => s.id === selectedStudent);
  const tuitionFees = feeStructures.filter(fs => fs.fee_type === 'tuition' || (!fs.fee_type?.startsWith('exam') && fs.fee_type !== 'exam'));
  const examFees = feeStructures.filter(fs => fs.fee_type === 'exam' || fs.fee_type?.startsWith('exam'));
  const tuitionTotal = tuitionFees.filter(fs => fs.class_id === student?.class_id).reduce((s, fs) => s + fs.amount, 0);
  const examTotal = examFees.filter(fs => fs.class_id === student?.class_id).reduce((s, fs) => s + fs.amount, 0);
  const tuitionPaid = payments.filter(p => p.fee_type !== 'exam' && !p.fee_type?.startsWith('exam')).reduce((s, p) => s + p.amount_paid, 0);
  const examPaid = payments.filter(p => p.fee_type === 'exam' || p.fee_type?.startsWith('exam')).reduce((s, p) => s + p.amount_paid, 0);
  const totalPaid = payments.reduce((s, p) => s + p.amount_paid, 0);

  const handlePrint = () => {
    const w = window.open('', '_blank');
    if (!w) return;
    const tuitionPending = Math.max(0, tuitionTotal - tuitionPaid);
    const examPending = Math.max(0, examTotal - examPaid);
    w.document.write(`
      <!DOCTYPE html><html><head><title>Fee Statement - ${student?.user.full_name || ''}</title>
      <style>
        @page { margin: 12mm; }
        body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a1a; padding: 20px; }
        .header { text-align: center; border-bottom: 2px solid #1a56db; padding-bottom: 14px; margin-bottom: 20px; }
        .header h1 { margin: 0; font-size: 22px; color: #1a56db; }
        .header p { margin: 3px 0; font-size: 12px; color: #555; }
        .student-info { margin-bottom: 16px; }
        .student-info table { width: 100%; font-size: 13px; }
        .student-info td { padding: 2px 8px; }
        .student-info td:first-child { font-weight: 600; width: 150px; color: #555; }
        .fee-summary { width: 100%; border-collapse: collapse; font-size: 13px; margin: 16px 0; }
        .fee-summary th { background: #f3f4f6; text-align: left; padding: 8px 10px; border-bottom: 2px solid #d1d5db; }
        .fee-summary td { padding: 8px 10px; border-bottom: 1px solid #e5e7eb; }
        .fee-summary .total-row td { font-weight: 700; border-top: 2px solid #1a1a1a; font-size: 14px; }
        .badge-paid { color: #065f46; font-weight: 600; }
        .badge-pending { color: #991b1b; font-weight: 600; }
        .badge-partial { color: #92400e; font-weight: 600; }
        table.details { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 16px; }
        table.details th { background: #f3f4f6; text-align: left; padding: 6px 8px; border-bottom: 2px solid #d1d5db; }
        table.details td { padding: 6px 8px; border-bottom: 1px solid #e5e7eb; }
        .section-title { font-size: 15px; font-weight: 700; color: #1a1a1a; margin: 20px 0 8px; padding-bottom: 4px; border-bottom: 1px solid #d1d5db; }
        .footer { text-align: center; margin-top: 25px; font-size: 11px; color: #888; border-top: 1px solid #e5e7eb; padding-top: 12px; }
        .print-btn { text-align: center; margin-bottom: 20px; }
        .print-btn button { padding: 10px 30px; background: #1a56db; color: #fff; border: none; border-radius: 6px; font-size: 14px; cursor: pointer; }
        @media print { .no-print { display: none; } body { padding: 0; } }
      </style></head><body>
      <div class="no-print print-btn"><button onclick="window.print()">Print Statement</button></div>
      <div class="header">
        <h1>Mr Pathak School</h1>
        <p>Sector 4, Dwarka, New Delhi - 110075</p>
        <p>Fee Statement — ${new Date(fromDate).toLocaleDateString()} to ${new Date(toDate).toLocaleDateString()}</p>
      </div>
      <div class="student-info">
        <table>
          <tr><td>Student Name</td><td>: ${student?.user.full_name || ''}</td><td>Roll No</td><td>: ${student?.roll_number || ''}</td></tr>
          <tr><td>Class</td><td>: ${student?.class?.name || ''}-${student?.class?.section || ''}</td><td>Guardian</td><td>: ${student?.guardian_name || ''}</td></tr>
        </table>
      </div>

      <div class="section-title">Fee Summary</div>
      <table class="fee-summary">
        <thead><tr><th>Fee Type</th><th>Total Fee</th><th>Paid</th><th>Pending</th><th>Status</th></tr></thead>
        <tbody>
          <tr>
            <td>Tuition Fee</td>
            <td>₹${tuitionTotal.toLocaleString()}</td>
            <td class="badge-paid">₹${tuitionPaid.toLocaleString()}</td>
            <td class="${tuitionPending > 0 ? 'badge-pending' : 'badge-paid'}">₹${tuitionPending.toLocaleString()}</td>
            <td>${tuitionTotal === 0 ? 'N/A' : tuitionPaid >= tuitionTotal ? '<span class="badge-paid">Paid</span>' : tuitionPaid > 0 ? '<span class="badge-partial">Partial</span>' : '<span class="badge-pending">Unpaid</span>'}</td>
          </tr>
          <tr>
            <td>Exam Fee</td>
            <td>₹${examTotal.toLocaleString()}</td>
            <td class="badge-paid">₹${examPaid.toLocaleString()}</td>
            <td class="${examPending > 0 ? 'badge-pending' : 'badge-paid'}">₹${examPending.toLocaleString()}</td>
            <td>${examTotal === 0 ? 'N/A' : examPaid >= examTotal ? '<span class="badge-paid">Paid</span>' : examPaid > 0 ? '<span class="badge-partial">Partial</span>' : '<span class="badge-pending">Unpaid</span>'}</td>
          </tr>
          <tr class="total-row">
            <td>Grand Total</td>
            <td>₹${(tuitionTotal + examTotal).toLocaleString()}</td>
            <td class="badge-paid">₹${totalPaid.toLocaleString()}</td>
            <td class="${(tuitionPending + examPending) > 0 ? 'badge-pending' : 'badge-paid'}">₹${(tuitionPending + examPending).toLocaleString()}</td>
            <td>${(tuitionTotal + examTotal) === 0 ? 'N/A' : totalPaid >= (tuitionTotal + examTotal) ? '<span class="badge-paid">Paid</span>' : '<span class="badge-pending">Pending</span>'}</td>
          </tr>
        </tbody>
      </table>

      <div class="section-title">Payment Details (${new Date(fromDate).toLocaleDateString()} — ${new Date(toDate).toLocaleDateString()})</div>
      <table class="details">
        <thead><tr><th>Date</th><th>Receipt No</th><th>Fee Type</th><th>Method</th><th style="text-align:right">Amount</th></tr></thead>
        <tbody>
          ${payments.length === 0 ? '<tr><td colspan="5" style="text-align:center;color:#888;padding:20px">No payments in this period</td></tr>' : payments.map((p: any) => `
            <tr><td>${new Date(p.payment_date).toLocaleDateString()}</td>
            <td>${p.receipt_number || '—'}</td>
            <td>${p.fee_type === 'exam' || p.fee_type?.startsWith('exam') ? 'Exam Fee' : 'Tuition Fee'}</td>
            <td>${(p.payment_method || 'cash').replace('_', ' ')}</td>
            <td style="text-align:right">₹${p.amount_paid.toLocaleString()}</td></tr>
          `).join('')}
        </tbody>
      </table>
      <div class="footer"><p>This is a computer-generated fee statement. Mr Pathak School, Dwarka, New Delhi</p></div>
      </body></html>
    `);
    w.document.close();
  };

  const tuitionPending = Math.max(0, tuitionTotal - tuitionPaid);
  const examPending = Math.max(0, examTotal - examPaid);

  return (
    <div className="space-y-6">
      <SectionCard title="Print Fee Statement" subtitle="Per-student fee summary with tuition & exam fees — paid, pending, and history">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Select label="Select Student" value={selectedStudent}
            onChange={(e) => { setSelectedStudent(e.target.value); setPayments([]); setSearched(false); }}
            options={[{ value: '', label: 'Choose a student' }, ...students.map(s => ({ value: s.id, label: `${s.user.full_name} (${s.roll_number} - ${s.class?.name}${s.class?.section})` }))]} />
          <Input label="From Date" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          <Input label="To Date" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          <div className="flex items-end">
            <Button onClick={handleSearch} loading={loading} className="w-full">
              <Search className="w-4 h-4 mr-1.5" /> Search
            </Button>
          </div>
        </div>
      </SectionCard>

      {searched && (
        <>
          {/* Fee Summary Cards */}
          {student && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white border border-neutral-200 rounded-xl p-4">
                <h4 className="text-sm font-bold text-neutral-700 mb-3 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-primary-600" /> Tuition Fee
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-neutral-500">Total Fee:</span><span className="font-semibold">₹{tuitionTotal.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-neutral-500">Paid:</span><span className="font-semibold text-success-600">₹{tuitionPaid.toLocaleString()}</span></div>
                  <div className="flex justify-between border-t border-neutral-100 pt-2"><span className="text-neutral-500">Pending:</span><span className={`font-semibold ${tuitionPending > 0 ? 'text-danger-600' : 'text-success-600'}`}>₹{tuitionPending.toLocaleString()}</span></div>
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-neutral-500">Status:</span>
                    {tuitionTotal === 0 ? <Badge variant="default">N/A</Badge> : tuitionPaid >= tuitionTotal ? <Badge variant="success">Paid</Badge> : tuitionPaid > 0 ? <Badge variant="warning">Partial</Badge> : <Badge variant="danger">Unpaid</Badge>}
                  </div>
                </div>
              </div>
              <div className="bg-white border border-neutral-200 rounded-xl p-4">
                <h4 className="text-sm font-bold text-neutral-700 mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary-600" /> Exam Fee
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-neutral-500">Total Fee:</span><span className="font-semibold">₹{examTotal.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-neutral-500">Paid:</span><span className="font-semibold text-success-600">₹{examPaid.toLocaleString()}</span></div>
                  <div className="flex justify-between border-t border-neutral-100 pt-2"><span className="text-neutral-500">Pending:</span><span className={`font-semibold ${examPending > 0 ? 'text-danger-600' : 'text-success-600'}`}>₹{examPending.toLocaleString()}</span></div>
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-neutral-500">Status:</span>
                    {examTotal === 0 ? <Badge variant="default">N/A</Badge> : examPaid >= examTotal ? <Badge variant="success">Paid</Badge> : examPaid > 0 ? <Badge variant="warning">Partial</Badge> : <Badge variant="danger">Unpaid</Badge>}
                  </div>
                </div>
              </div>
            </div>
          )}

          <SectionCard
            title={student ? `${student.user.full_name} — Payment History` : ''}
            subtitle={`${fromDate ? new Date(fromDate).toLocaleDateString() : ''} to ${toDate ? new Date(toDate).toLocaleDateString() : ''}`}
            action={
              <Button onClick={handlePrint} icon={<Receipt className="w-4 h-4" />}>
                Print Full Statement
              </Button>
            }
          >
            {payments.length === 0 ? (
              <p className="text-center text-neutral-400 py-8">No payments found in the selected date range.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="text-left text-sm text-neutral-500 border-b border-neutral-200">
                      <th className="pb-3 font-medium">Date</th>
                      <th className="pb-3 font-medium">Receipt No</th>
                      <th className="pb-3 font-medium">Fee Type</th>
                      <th className="pb-3 font-medium">Method</th>
                      <th className="pb-3 font-medium text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p: any) => (
                      <tr key={p.id} className="border-b border-neutral-100">
                        <td className="py-3 text-sm">{new Date(p.payment_date).toLocaleDateString()}</td>
                        <td className="py-3 text-sm font-mono">{p.receipt_number || '—'}</td>
                        <td className="py-3 text-sm">{p.fee_type === 'exam' || p.fee_type?.startsWith('exam') ? 'Exam Fee' : 'Tuition Fee'}</td>
                        <td className="py-3 text-sm capitalize">{(p.payment_method || 'cash').replace('_', ' ')}</td>
                        <td className="py-3 text-sm font-semibold text-right">₹{p.amount_paid.toLocaleString()}</td>
                      </tr>
                    ))}
                    <tr className="font-bold text-neutral-900">
                      <td colSpan={4} className="py-3 text-sm text-right">Total Paid</td>
                      <td className="py-3 text-sm text-right">₹{totalPaid.toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </SectionCard>
        </>
      )}
    </div>
  );
}

