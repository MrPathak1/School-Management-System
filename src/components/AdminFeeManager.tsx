import React, { useState, useEffect } from 'react';
import { Search, Plus, Receipt } from 'lucide-react';
import { SectionCard } from './ui/Card';
import { Badge, Button, Input, Select } from './ui/Table';
import { Modal } from './ui/Modal';
import { useToastStore } from '../hooks/useToast';
import { supabase, StudentWithDetails, FeeStructure, FeePaymentWithDetails } from '../lib/supabase';

interface Props {
  students: StudentWithDetails[];
  onRefresh: () => void;
}

export function AdminFeeManager({ students, onRefresh }: Props) {
  const [feePayments, setFeePayments] = useState<FeePaymentWithDetails[]>([]);
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paying, setPaying] = useState(false);
  const [filterStudent, setFilterStudent] = useState('');
  const [viewStudentId, setViewStudentId] = useState<string | null>(null);
  const addToast = useToastStore((s) => s.addToast);

  useEffect(() => { fetchFeeData(); }, []);

  const fetchFeeData = async () => {
    setLoading(true);
    try {
      const [feePaymentsRes, feeStructuresRes] = await Promise.all([
        supabase.from('fee_payments').select(`*, fee_structure:fee_structures(*), student:students(*, user:users(*), class:classes(*))`).order('created_at', { ascending: false }),
        supabase.from('fee_structures').select('*'),
      ]);
      setFeePayments(feePaymentsRes.data as FeePaymentWithDetails[] || []);
      setFeeStructures(feeStructuresRes.data || []);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const getStudentTotalFee = (studentId: string) => {
    return feeStructures
      .filter(fs => {
        const student = students.find(s => s.id === studentId);
        return student && fs.class_id === student.class_id;
      })
      .reduce((sum, fs) => sum + fs.amount, 0);
  };

  const getStudentPaid = (studentId: string) => {
    return feePayments
      .filter(fp => fp.student_id === studentId && (fp.status === 'paid' || fp.status === 'partial'))
      .reduce((sum, fp) => sum + fp.amount_paid, 0);
  };

  const getStudentPayments = (studentId: string) => {
    return feePayments.filter(fp => fp.student_id === studentId).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  };

  const handleRecordPayment = async () => {
    if (!selectedStudent || !paymentAmount) {
      addToast({ type: 'error', title: 'Select a student and enter amount' });
      return;
    }
    setPaying(true);
    try {
      const receipt = `RCP-${Date.now().toString(36).toUpperCase()}`;
      const totalFee = getStudentTotalFee(selectedStudent);
      if (totalFee <= 0) { addToast({ type: 'error', title: 'No fee structure found for this student' }); setPaying(false); return; }
      const paidSoFar = getStudentPaid(selectedStudent);
      const newStatus = (paidSoFar + parseFloat(paymentAmount)) >= totalFee ? 'paid' : 'partial';
      const studentClassId = students.find(s => s.id === selectedStudent)?.class_id;
      const matchedFee = feeStructures.find(fs => fs.class_id === studentClassId);
      if (!matchedFee) { addToast({ type: 'error', title: 'No fee structure for this student\'s class' }); setPaying(false); return; }

      const { error } = await supabase.from('fee_payments').insert({
        student_id: selectedStudent,
        fee_structure_id: matchedFee.id,
        amount_paid: parseFloat(paymentAmount),
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: paymentMethod,
        receipt_number: receipt,
        status: newStatus,
      });

      addToast({ type: 'success', title: `Payment recorded`, message: `Receipt: ${receipt}` });
      setShowPaymentModal(false);
      setSelectedStudent('');
      setPaymentAmount('');
      fetchFeeData();
      onRefresh();
    } catch (err) {
      console.error(err);
      addToast({ type: 'error', title: 'Failed to record payment' });
    } finally {
      setPaying(false);
    }
  };

  const totalCollected = feePayments.filter(p => p.status === 'paid' || p.status === 'partial').reduce((s, p) => s + p.amount_paid, 0);
  const totalPending = students.reduce((sum, s) => sum + Math.max(0, getStudentTotalFee(s.id) - getStudentPaid(s.id)), 0);

  const filteredStudents = filterStudent ? students.filter(s => s.user.full_name.toLowerCase().includes(filterStudent.toLowerCase()) || s.roll_number.includes(filterStudent)) : students;

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-primary-50 rounded-xl p-4">
          <p className="text-sm font-medium text-primary-600">Total Students</p>
          <p className="text-2xl font-bold text-primary-700 mt-1">{students.length}</p>
        </div>
        <div className="bg-success-50 rounded-xl p-4">
          <p className="text-sm font-medium text-success-600">Total Collected</p>
          <p className="text-2xl font-bold text-success-700 mt-1">₹{totalCollected.toLocaleString()}</p>
        </div>
        <div className="bg-danger-50 rounded-xl p-4">
          <p className="text-sm font-medium text-danger-600">Pending Dues</p>
          <p className="text-2xl font-bold text-danger-700 mt-1">₹{totalPending.toLocaleString()}</p>
        </div>
        <div className="bg-warning-50 rounded-xl p-4">
          <p className="text-sm font-medium text-warning-600">Paid in Full</p>
          <p className="text-2xl font-bold text-warning-700 mt-1">{students.filter(s => getStudentPaid(s.id) >= getStudentTotalFee(s.id)).length}</p>
        </div>
      </div>

      {/* Student Fee Table */}
      <SectionCard
        title="Student Fee Details"
        subtitle="Per-student fee breakdown and payment status"
        action={
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                value={filterStudent}
                onChange={(e) => setFilterStudent(e.target.value)}
                placeholder="Search student..."
                className="pl-8 pr-3 py-1.5 border border-neutral-200 rounded-lg text-sm w-48"
              />
            </div>
            <Button onClick={() => setShowPaymentModal(true)} icon={<Plus className="w-4 h-4" />}>
              Record Payment
            </Button>
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="text-left text-sm text-neutral-500 border-b border-neutral-200">
                <th className="pb-3 font-medium">Student</th>
                <th className="pb-3 font-medium">Class</th>
                <th className="pb-3 font-medium">Total Fee</th>
                <th className="pb-3 font-medium">Paid</th>
                <th className="pb-3 font-medium">Pending</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => {
                const totalFee = getStudentTotalFee(student.id);
                const paid = getStudentPaid(student.id);
                const pending = Math.max(0, totalFee - paid);
                const pct = totalFee > 0 ? (paid / totalFee) * 100 : 0;
                return (
                  <tr key={student.id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <img src={student.user.avatar_url || 'https://via.placeholder.com/32'} alt="" className="w-8 h-8 rounded-full object-cover" />
                        <span className="font-medium text-neutral-900">{student.user.full_name}</span>
                      </div>
                    </td>
                    <td className="py-3 text-sm text-neutral-600">{student.class?.name}-{student.class?.section}</td>
                    <td className="py-3 text-sm font-medium">₹{totalFee.toLocaleString()}</td>
                    <td className="py-3 text-sm text-success-600 font-medium">₹{paid.toLocaleString()}</td>
                    <td className="py-3 text-sm text-danger-600 font-medium">₹{pending.toLocaleString()}</td>
                    <td className="py-3">
                      {totalFee === 0 ? (
                        <Badge variant="default">No Fee</Badge>
                      ) : paid >= totalFee ? (
                        <Badge variant="success">Paid</Badge>
                      ) : paid > 0 ? (
                        <Badge variant="warning">Partial</Badge>
                      ) : (
                        <Badge variant="danger">Unpaid</Badge>
                      )}
                    </td>
                    <td className="py-3">
                      <div className="w-20 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${paid >= totalFee ? 'bg-success-500' : paid > 0 ? 'bg-warning-500' : 'bg-neutral-200'}`} style={{ width: `${Math.min(100, pct)}%` }} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredStudents.length === 0 && <p className="text-center text-neutral-400 py-8">No students found</p>}
      </SectionCard>

      {/* Payment History per Student */}
      {viewStudentId && (
        <SectionCard
          title={`Payment History - ${students.find(s => s.id === viewStudentId)?.user.full_name || ''}`}
          subtitle="All recorded payments"
          action={<button onClick={() => setViewStudentId(null)} className="text-sm text-primary-600 hover:text-primary-700">Close</button>}
        >
          {getStudentPayments(viewStudentId).length === 0 ? (
            <p className="text-neutral-400 py-4 text-center">No payments recorded</p>
          ) : (
            <div className="space-y-2">
              {getStudentPayments(viewStudentId).map((p) => (
                <div key={p.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Receipt className="w-4 h-4 text-neutral-400" />
                    <div>
                      <p className="text-sm font-medium text-neutral-900">₹{p.amount_paid.toLocaleString()}</p>
                      <p className="text-xs text-neutral-500">{new Date(p.payment_date).toLocaleDateString()} · {p.payment_method} {p.receipt_number && `· ${p.receipt_number}`}</p>
                    </div>
                  </div>
                  <Badge variant={p.status === 'paid' ? 'success' : p.status === 'partial' ? 'warning' : 'default'}>{p.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      )}

      {/* Recent All Payments */}
      <SectionCard title="Recent Payments" subtitle="Latest fee transactions">
        <div className="space-y-2">
          {feePayments.slice(0, 20).map((p) => {
            const student = students.find(s => s.id === p.student_id);
            return (
              <div key={p.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer" onClick={() => setViewStudentId(p.student_id)}>
                <div className="flex items-center gap-3">
                  <img src={student?.user.avatar_url || 'https://via.placeholder.com/32'} alt="" className="w-8 h-8 rounded-full object-cover" />
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
        </div>
        {feePayments.length === 0 && <p className="text-center text-neutral-400 py-8">No payments recorded yet</p>}
      </SectionCard>

      {/* Payment Modal */}
      <Modal isOpen={showPaymentModal} onClose={() => setShowPaymentModal(false)} title="Record Payment">
        <div className="space-y-4">
          <Select label="Student" value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)}
            options={[
              { value: '', label: 'Select a student' },
              ...students.map((s) => ({ value: s.id, label: `${s.user.full_name} (${s.roll_number} - ${s.class?.name}${s.class?.section})` })),
            ]}
          />
          {selectedStudent && (
            <div className="p-3 bg-neutral-50 rounded-lg text-sm">
              <div className="flex justify-between"><span>Total Fee:</span><span className="font-medium">₹{getStudentTotalFee(selectedStudent).toLocaleString()}</span></div>
              <div className="flex justify-between"><span>Already Paid:</span><span className="font-medium text-success-600">₹{getStudentPaid(selectedStudent).toLocaleString()}</span></div>
              <div className="flex justify-between font-semibold border-t border-neutral-200 mt-1 pt-1"><span>Pending:</span><span className="text-danger-600">₹{Math.max(0, getStudentTotalFee(selectedStudent) - getStudentPaid(selectedStudent)).toLocaleString()}</span></div>
            </div>
          )}
          <Input label="Amount (₹)" type="number" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} placeholder="0.00" />
          <Select label="Payment Method" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}
            options={[
              { value: 'cash', label: 'Cash' },
              { value: 'credit_card', label: 'Credit Card' },
              { value: 'bank_transfer', label: 'Bank Transfer' },
              { value: 'online', label: 'Online' },
            ]}
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setShowPaymentModal(false)}>Cancel</Button>
            <Button onClick={handleRecordPayment} loading={paying}>Record Payment</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
