import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, Users, DollarSign, GraduationCap } from 'lucide-react';
import { StatCard } from './ui/Card';
import { supabase } from '../lib/supabase';

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export function AnalyticsDashboard() {
  const [loading, setLoading] = useState(true);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [feeData, setFeeData] = useState<any[]>([]);
  const [gradeData, setGradeData] = useState<any[]>([]);
  const [studentGrowth, setStudentGrowth] = useState<any[]>([]);
  const [stats, setStats] = useState({ students: 0, teachers: 0, revenue: 0, avgAttendance: 0 });

  useEffect(() => { fetchAnalytics(); }, []);

  const fetchAnalytics = async () => {
    try {
      // Attendance by month
      let attendanceArray: { month: string; rate: number }[] = [];
      const { data: attData } = await supabase.from('attendance').select('date, status');
      if (attData) {
        const byMonth: Record<string, { present: number; total: number }> = {};
        attData.forEach((a) => {
          const month = a.date?.substring(0, 7) || '';
          if (!byMonth[month]) byMonth[month] = { present: 0, total: 0 };
          byMonth[month].total++;
          if (a.status === 'present' || a.status === 'late') byMonth[month].present++;
        });
        attendanceArray = Object.entries(byMonth).map(([m, d]) => ({
          month: m,
          rate: Math.round((d.present / d.total) * 100),
        })).sort((a, b) => a.month.localeCompare(b.month));
        setAttendanceData(attendanceArray);
      }

      // Fee collection by month
      let feeArray: { month: string; amount: number }[] = [];
      const { data: feePayData } = await supabase.from('fee_payments').select('amount_paid, payment_date, status');
      if (feePayData) {
        const byMonth: Record<string, number> = {};
        feePayData.forEach((f) => {
          if (f.status === 'paid' || f.status === 'partial') {
            const month = f.payment_date?.substring(0, 7) || '';
            byMonth[month] = (byMonth[month] || 0) + f.amount_paid;
          }
        });
        feeArray = Object.entries(byMonth).map(([m, v]) => ({ month: m, amount: v })).sort((a, b) => a.month.localeCompare(b.month));
        setFeeData(feeArray);
      }

      // Class performance (average grade per class)
      const { data: gData } = await supabase.from('grades').select('marks_obtained, max_marks, student_id');
      if (gData) {
        const pcts = gData.filter(g => g.max_marks > 0).map((g) => Math.round((g.marks_obtained / g.max_marks) * 100));
        const avg = pcts.length > 0 ? Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length) : 0;
        setGradeData([
          { name: '90-100%', count: pcts.filter(p => p >= 90).length },
          { name: '75-89%', count: pcts.filter(p => p >= 75 && p < 90).length },
          { name: '50-74%', count: pcts.filter(p => p >= 50 && p < 75).length },
          { name: 'Below 50%', count: pcts.filter(p => p < 50).length },
        ]);
      }

      // Counts
      const [studRes, teachRes] = await Promise.all([
        supabase.from('students').select('*', { count: 'exact', head: true }),
        supabase.from('teachers').select('*', { count: 'exact', head: true }),
      ]);
      setStats({
        students: studRes.count || 0,
        teachers: teachRes.count || 0,
        revenue: feeArray.reduce((s, f) => s + f.amount, 0),
        avgAttendance: attendanceArray.length > 0 ? Math.round(attendanceArray.reduce((s, a) => s + a.rate, 0) / attendanceArray.length) : 0,
      });

    } catch (err) { console.error(err); }
    setLoading(false);
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-neutral-900">Analytics Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Students" value={stats.students} icon={Users} color="blue" />
        <StatCard title="Total Teachers" value={stats.teachers} icon={GraduationCap} color="green" />
        <StatCard title="Revenue Collected" value={`₹${stats.revenue.toLocaleString()}`} icon={DollarSign} color="purple" />
        <StatCard title="Avg Attendance" value={`${stats.avgAttendance}%`} icon={TrendingUp} color="yellow" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Trend */}
        <div className="bg-white border border-neutral-200 rounded-xl p-6">
          <h3 className="font-semibold text-neutral-900 mb-4">Attendance % by Month</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={attendanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="rate" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1' }} name="Attendance %" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Fee Collection */}
        <div className="bg-white border border-neutral-200 rounded-xl p-6">
          <h3 className="font-semibold text-neutral-900 mb-4">Fee Collection by Month</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={feeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="amount" fill="#22c55e" radius={[4, 4, 0, 0]} name="Amount (₹)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Grade Distribution */}
        <div className="bg-white border border-neutral-200 rounded-xl p-6">
          <h3 className="font-semibold text-neutral-900 mb-4">Grade Distribution</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={gradeData} cx="50%" cy="50%" outerRadius={90} dataKey="count" label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}>
                {gradeData.map((_, i) => (<Cell key={i} fill={COLORS[i % COLORS.length]} />))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Class Performance Comparison */}
        <div className="bg-white border border-neutral-200 rounded-xl p-6">
          <h3 className="font-semibold text-neutral-900 mb-4">Score Distribution</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={gradeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} name="Students" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
