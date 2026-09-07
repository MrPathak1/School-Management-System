import React, { useState, useEffect } from 'react';
import {
  Users,
  TrendingUp,
  ClipboardCheck,
  DollarSign,
  Bell,
  Calendar,
  BookOpen,
  Mail,
  Phone,
  MapPin,
  User,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { StatCard, SectionCard } from '../components/ui/Card';
import { Badge, Button, Select } from '../components/ui/Table';
import { useApp } from '../contexts/AppContext';
import { ExamScheduleManager } from '../components/ExamScheduleManager';
import { StudyMaterials } from '../components/StudyMaterials';
import { MessagingPanel } from '../components/MessagingPanel';
import { EventCalendar } from '../components/EventCalendar';
import { HealthRecords } from '../components/HealthRecords';
import { CampusGallery } from '../components/CampusGallery';
import { supabase, Grade, Attendance, FeeWithStructure, Student, Subject } from '../lib/supabase';

interface ChildWithDetails extends Student {
  user: { full_name: string; email: string; avatar_url: string | null };
  class: { name: string; section: string };
}

interface GradeWithDetails extends Grade {
  subject: { name: string; code: string };
  exam_type: { name: string; term: string; max_marks: number };
}

interface ParentDashboardProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function ParentDashboard({ activeTab, setActiveTab }: ParentDashboardProps) {
  const { currentUser, loading: appLoading } = useApp();
  const [loading, setLoading] = useState(true);
  const [selectedChildId, setSelectedChildId] = useState('');

  const children = (currentUser?.children || []) as ChildWithDetails[];

  // Data per child
  const [grades, setGrades] = useState<GradeWithDetails[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [feeData, setFeeData] = useState<FeeWithStructure[]>([]);

  const selectedChild = children.find(c => c.id === selectedChildId) || children[0];
  const childId = selectedChild?.id;

  useEffect(() => {
    if (children.length > 0 && !selectedChildId) {
      setSelectedChildId(children[0].id);
    }
  }, [children, selectedChildId]);

  useEffect(() => {
    if (childId) {
      fetchChildData(childId);
    } else if (!appLoading) {
      setLoading(false);
    }
  }, [childId, appLoading]);

  const fetchChildData = async (studentId: string) => {
    setLoading(true);
    try {
      const [gradesRes, attendanceRes, feesRes] = await Promise.all([
        supabase.from('grades').select('*, subject:subjects(name, code), exam_type:exam_types(name, term)').eq('student_id', studentId),
        supabase.from('attendance').select('*').eq('student_id', studentId).order('date', { ascending: false }),
        supabase.from('fee_payments').select(`*, fee_structure:fee_structures(*)`).eq('student_id', studentId),
      ]);
      setGrades((gradesRes.data || []) as GradeWithDetails[]);
      setAttendance(attendanceRes.data || []);
      setFeeData(feesRes.data as FeeWithStructure[] || []);
    } catch (error) {
      console.error('Error loading child data:', error);
    } finally {
      setLoading(false);
    }
  };

  const attendanceStats = (records: Attendance[]) => {
    if (records.length === 0) return { present: 0, absent: 0, late: 0, percentage: 0 };
    const present = records.filter(a => a.status === 'present').length;
    const late = records.filter(a => a.status === 'late').length;
    const absent = records.filter(a => a.status === 'absent').length;
    return { present, late, absent, percentage: Math.round(((present + late) / records.length) * 100) };
  };

  const calculateGPA = (gradesList: Grade[]) => {
    if (gradesList.length === 0) return 'N/A';
    const gradePoints: Record<string, number> = {
      'A+': 4.0, 'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0,
      'B-': 2.7, 'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'D': 1.0, 'F': 0,
    };
    const finals = gradesList.filter(g => (g as GradeWithDetails).exam_type?.name === 'Final Examination');
    if (finals.length === 0) return 'N/A';
    return (finals.reduce((sum, g) => sum + (gradePoints[g.grade || 'F'] || 0), 0) / finals.length).toFixed(2);
  };

  if (loading && children.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-neutral-900">No Children Linked</h3>
        <p className="text-neutral-500 mt-1">No students are associated with this guardian email.</p>
      </div>
    );
  }

  const stats = attendanceStats(attendance);
  const totalFees = feeData.reduce((sum, f) => sum + f.amount_paid, 0);
  const months = [...new Set(attendance.map(a => a.date?.substring(0, 7)))].sort().reverse();

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { id: 'dashboard', label: 'Dashboard' },
          { id: 'children', label: 'My Children' },
          { id: 'performance', label: 'Performance' },
          { id: 'attendance', label: 'Attendance' },
          { id: 'fees', label: 'Fees' },
          { id: 'messages_parent', label: 'Messages' },
          { id: 'materials_parent', label: 'Materials' },
          { id: 'events_parent', label: 'Events' },
          { id: 'health_parent', label: 'Health' },
          { id: 'gallery_parent', label: 'Gallery' },
          { id: 'exam_schedule', label: 'Exam Schedule' },
          { id: 'notices', label: 'Notices' },
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
            <StatCard title="My Children" value={children.length} icon={Users} color="blue" subtitle="Linked students" />
            <StatCard title="Attendance" value={`${stats.percentage}%`} icon={ClipboardCheck} color="green" subtitle="Overall average" />
            <StatCard title="Current GPA" value={calculateGPA(grades)} icon={TrendingUp} color="purple" subtitle="Academic performance" />
            <StatCard title="Fees Paid" value={`₹${totalFees.toLocaleString()}`} icon={DollarSign} color="yellow" subtitle="Total payments made" />
          </div>

          <SectionCard title="Children Overview" subtitle="Quick summary of all your children">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {children.map((child) => {
                return (
                  <div key={child.id} className="flex items-center gap-4 p-4 bg-neutral-50 rounded-lg">
                    <img
                      src={child.user.avatar_url || 'https://via.placeholder.com/48'}
                      alt={child.user.full_name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-neutral-900">{child.user.full_name}</p>
                      <p className="text-sm text-neutral-500">
                        Class {child.class?.name || 'N/A'}-{child.class?.section || 'N/A'} | Roll: {child.roll_number}
                      </p>
                    </div>
                    <Badge variant="success">Active</Badge>
                  </div>
                );
              })}
            </div>
          </SectionCard>

          <SectionCard title="Recent Grades" subtitle="Latest academic results">
            {grades.slice(0, 5).length === 0 ? (
              <p className="text-neutral-400 text-center py-4">No grades available</p>
            ) : (
              <div className="space-y-2">
                {grades.slice(0, 5).map((g) => (
                  <div key={g.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                    <div>
                      <p className="font-medium text-neutral-900">{g.subject?.name}</p>
                      <p className="text-sm text-neutral-500">{g.exam_type?.name}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-neutral-900">{g.marks_obtained}/{g.max_marks}</span>
                      <Badge variant={g.marks_obtained / g.max_marks >= 0.8 ? 'success' : g.marks_obtained / g.max_marks >= 0.5 ? 'warning' : 'danger'}>
                        {g.grade}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>
      )}

      {/* My Children Tab */}
      {activeTab === 'children' && (
        <SectionCard title="My Children" subtitle="All students linked to your guardian account">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {children.map((child) => (
              <div key={child.id} className="bg-white border border-neutral-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <img
                    src={child.user.avatar_url || 'https://via.placeholder.com/56'}
                    alt={child.user.full_name}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-neutral-900">{child.user.full_name}</h3>
                    <p className="text-sm text-neutral-500">{child.user.email}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <Badge variant="info">Class {child.class?.name}-{child.class?.section}</Badge>
                      <span className="text-sm text-neutral-500">Roll: {child.roll_number}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-neutral-100 grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-neutral-600">
                    <Phone className="w-4 h-4 text-neutral-400" />
                    {child.guardian_phone}
                  </div>
                  <div className="flex items-center gap-2 text-neutral-600">
                    <MapPin className="w-4 h-4 text-neutral-400" />
                    {child.address || 'N/A'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Performance Tab */}
      {activeTab === 'performance' && (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Select
              value={selectedChildId || children[0]?.id}
              onChange={(e) => setSelectedChildId(e.target.value)}
              options={children.map((c) => ({ value: c.id, label: c.user.full_name }))}
            />
            <span className="text-sm text-neutral-500">
              Showing results for: <strong>{selectedChild?.user.full_name}</strong>
            </span>
          </div>

          {loading ? (
            <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>
          ) : (
            <SectionCard title="Report Card" subtitle={`Academic performance for ${selectedChild?.user.full_name}`}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-neutral-200">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Subject</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Exam</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-neutral-500 uppercase">Marks</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-neutral-500 uppercase">Grade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {grades.length === 0 ? (
                      <tr><td colSpan={4} className="px-4 py-8 text-center text-neutral-400">No grades available</td></tr>
                    ) : (
                      grades.map((g) => (
                        <tr key={g.id} className="hover:bg-neutral-50">
                          <td className="px-4 py-3 font-medium text-neutral-900">{g.subject?.name}</td>
                          <td className="px-4 py-3 text-neutral-500">{g.exam_type?.name}</td>
                          <td className="px-4 py-3 text-center font-mono">{g.marks_obtained}/{g.max_marks}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full font-bold ${
                              g.marks_obtained / g.max_marks >= 0.8 ? 'bg-success-100 text-success-700' :
                              g.marks_obtained / g.max_marks >= 0.5 ? 'bg-warning-100 text-warning-700' :
                              'bg-danger-100 text-danger-700'
                            }`}>{g.grade}</span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          )}
        </div>
      )}

      {/* Attendance Tab */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Select
              value={selectedChildId || children[0]?.id}
              onChange={(e) => setSelectedChildId(e.target.value)}
              options={children.map((c) => ({ value: c.id, label: c.user.full_name }))}
            />
            <span className="text-sm text-neutral-500">
              Showing for: <strong>{selectedChild?.user.full_name}</strong>
            </span>
          </div>

          {loading ? (
            <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <SectionCard title="Summary">
                  <div className="text-center">
                    <div className="relative w-40 h-40 mx-auto">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="80" cy="80" r="70" fill="none" stroke="#e4e4e7" strokeWidth="12" />
                        <circle cx="80" cy="80" r="70" fill="none"
                          stroke={stats.percentage >= 75 ? '#22c55e' : stats.percentage >= 60 ? '#f59e0b' : '#ef4444'}
                          strokeWidth="12" strokeDasharray={`${(stats.percentage / 100) * 440} 440`} strokeLinecap="round" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-bold text-neutral-900">{stats.percentage}%</span>
                        <span className="text-sm text-neutral-500">Attendance</span>
                      </div>
                    </div>
                    <div className="mt-6 space-y-3">
                      <div className="flex items-center justify-between p-3 bg-success-50 rounded-lg">
                        <div className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-success-600" /><span className="text-success-700">Present</span></div>
                        <span className="font-bold text-success-700">{stats.present}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-warning-50 rounded-lg">
                        <div className="flex items-center gap-2"><Clock className="w-5 h-5 text-warning-600" /><span className="text-warning-700">Late</span></div>
                        <span className="font-bold text-warning-700">{stats.late}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-danger-50 rounded-lg">
                        <div className="flex items-center gap-2"><XCircle className="w-5 h-5 text-danger-600" /><span className="text-danger-700">Absent</span></div>
                        <span className="font-bold text-danger-700">{stats.absent}</span>
                      </div>
                    </div>
                  </div>
                </SectionCard>
              </div>

              <div className="lg:col-span-2">
                <SectionCard title="Monthly History">
                  {months.length === 0 ? (
                    <p className="text-neutral-400 text-center py-8">No attendance records</p>
                  ) : (
                    <div className="space-y-3">
                      {months.slice(0, 6).map((month) => {
                        const monthRecords = attendance.filter(a => a.date?.startsWith(month));
                        const present = monthRecords.filter(a => a.status === 'present' || a.status === 'late').length;
                        const total = monthRecords.length;
                        const pct = total > 0 ? Math.round((present / total) * 100) : 0;
                        return (
                          <div key={month} className="flex items-center gap-4 p-3 bg-neutral-50 rounded-lg">
                            <div className="w-24 text-sm font-medium text-neutral-700">
                              {new Date(month + '-01').toLocaleString('default', { month: 'short', year: 'numeric' })}
                            </div>
                            <div className="flex-1 h-3 bg-neutral-200 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${pct >= 75 ? 'bg-success-500' : pct >= 60 ? 'bg-warning-500' : 'bg-danger-500'}`}
                                style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-sm font-semibold text-neutral-700 w-12 text-right">{pct}%</span>
                            <span className="text-xs text-neutral-500 w-20 text-right">{present}/{total} days</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </SectionCard>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Fees Tab */}
      {activeTab === 'fees' && (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Select
              value={selectedChildId || children[0]?.id}
              onChange={(e) => setSelectedChildId(e.target.value)}
              options={children.map((c) => ({ value: c.id, label: c.user.full_name }))}
            />
            <span className="text-sm text-neutral-500">
              Showing for: <strong>{selectedChild?.user.full_name}</strong>
            </span>
          </div>

          {loading ? (
            <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-primary-50 rounded-xl p-5">
                  <p className="text-sm text-primary-600 font-medium">Total Paid</p>
                  <p className="text-2xl font-bold text-primary-700 mt-1">
                    ₹{feeData.filter(f => f.status === 'paid').reduce((s, f) => s + f.amount_paid, 0).toLocaleString()}
                  </p>
                </div>
                <div className="bg-success-50 rounded-xl p-5">
                  <p className="text-sm text-success-600 font-medium">Payments Made</p>
                  <p className="text-2xl font-bold text-success-700 mt-1">{feeData.filter(f => f.status === 'paid').length}</p>
                </div>
                <div className="bg-warning-50 rounded-xl p-5">
                  <p className="text-sm text-warning-600 font-medium">Pending / Partial</p>
                  <p className="text-2xl font-bold text-warning-700 mt-1">{feeData.filter(f => f.status === 'pending' || f.status === 'partial').length}</p>
                </div>
              </div>

              <SectionCard title="Payment History" subtitle="All recorded fee payments">
                {feeData.length === 0 ? (
                  <p className="text-center text-neutral-400 py-8">No payment records found</p>
                ) : (
                  <div className="space-y-3">
                    {feeData.map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
                        <div>
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-neutral-400" />
                            <span className="font-medium text-neutral-900">
                              {payment.fee_structure?.fee_type || 'Fee'}
                            </span>
                          </div>
                          <p className="text-sm text-neutral-500 mt-1">
                            {new Date(payment.payment_date).toLocaleDateString()}
                            {payment.receipt_number && ` | Receipt: ${payment.receipt_number}`}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-neutral-900">₹{payment.amount_paid.toLocaleString()}</p>
                          <Badge variant={payment.status === 'paid' ? 'success' : payment.status === 'partial' ? 'warning' : 'danger'}>
                            {payment.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </SectionCard>
            </>
          )}
        </div>
      )}

      {/* Exam Schedule Tab */}
      {activeTab === 'exam_schedule' && (
        <div className="space-y-4">
          {children.length > 1 && (
            <Select
              value={selectedChildId || children[0]?.id}
              onChange={(e) => setSelectedChildId(e.target.value)}
              options={children.map((c) => ({ value: c.id, label: c.user.full_name }))}
            />
          )}
          <ExamScheduleManager key={selectedChildId || children[0]?.id} classes={[]} subjects={[]} readOnly classId={selectedChild?.class_id || children[0]?.class_id || ''} />
        </div>
      )}

      {/* Parent Messages Tab */}
      {activeTab === 'messages_parent' && (
        <MessagingPanel mode="parent" userId={currentUser?.user.id || ''} parentId={currentUser?.user.id || ''} />
      )}

      {/* Parent Materials Tab */}
      {activeTab === 'materials_parent' && (
        <StudyMaterials mode="parent" childClassId={selectedChild?.class_id || children[0]?.class_id || ''} />
      )}

      {/* Parent Events Tab */}
      {activeTab === 'events_parent' && (
        <EventCalendar readOnly />
      )}

      {/* Parent Health Records Tab */}
      {activeTab === 'health_parent' && (
        <HealthRecords mode="parent" studentId={selectedChild?.id || children[0]?.id || ''} readOnly />
      )}

      {/* Parent Gallery Tab */}
      {activeTab === 'gallery_parent' && (
        <CampusGallery mode="viewer" />
      )}

      {/* Notices Tab */}
      {activeTab === 'notices' && (
        <SectionCard title="School Notices" subtitle="Important announcements and notifications">
          {[].length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-neutral-900">No Notices Yet</h3>
              <p className="text-neutral-500 mt-1">School notices and announcements will appear here.</p>
            </div>
          ) : (
            <p className="text-neutral-400 text-center py-4">Notices will be displayed here.</p>
          )}
        </SectionCard>
      )}
    </div>
  );
}
