import React, { useState, useEffect } from 'react';
import { Plus, Heart, Activity, Syringe, Stethoscope } from 'lucide-react';
import { SectionCard } from './ui/Card';
import { Badge, Button, Input, Select } from './ui/Table';
import { Modal } from './ui/Modal';
import { useToastStore } from '../hooks/useToast';
import { supabase, HealthRecord } from '../lib/supabase';

interface Props {
  mode: 'admin' | 'teacher' | 'student' | 'parent';
  studentId: string;
  teacherId?: string;
  readOnly?: boolean;
}

export function HealthRecords({ mode, studentId, teacherId, readOnly }: Props) {
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const addToast = useToastStore((s) => s.addToast);

  const [form, setForm] = useState({ record_type: 'checkup' as HealthRecord['record_type'], title: '', description: '', record_date: new Date().toISOString().split('T')[0], notes: '' });

  const canAdd = mode === 'admin' || mode === 'teacher';

  useEffect(() => { fetchRecords(); }, [studentId]);

  const fetchRecords = async () => {
    if (!studentId) { setLoading(false); return; }
    const { data } = await supabase.from('health_records').select('*').eq('student_id', studentId).order('record_date', { ascending: false });
    setRecords(data || []);
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!form.title || !form.record_date) { addToast({ type: 'error', title: 'Title and date required' }); return; }
    const { error } = await supabase.from('health_records').insert({
      student_id: studentId, record_type: form.record_type, title: form.title,
      description: form.description || null, record_date: form.record_date,
      notes: form.notes || null, recorded_by: teacherId || null,
    });
    if (error) { addToast({ type: 'error', title: 'Failed to add record' }); return; }
    addToast({ type: 'success', title: 'Health record added' });
    setModalOpen(false);
    setForm({ record_type: 'checkup', title: '', description: '', record_date: new Date().toISOString().split('T')[0], notes: '' });
    fetchRecords();
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'checkup': return <Stethoscope className="w-5 h-5 text-primary-600" />;
      case 'vaccination': return <Syringe className="w-5 h-5 text-success-600" />;
      case 'illness': return <Activity className="w-5 h-5 text-warning-600" />;
      case 'injury': return <Heart className="w-5 h-5 text-danger-600" />;
      default: return <Activity className="w-5 h-5 text-neutral-600" />;
    }
  };

  const typeColors: Record<string, 'success' | 'danger' | 'warning' | 'info' | 'default'> = {
    checkup: 'info', vaccination: 'success', illness: 'warning', injury: 'danger', other: 'default',
  };

  if (loading) return <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>;
  if (!studentId) return <p className="text-center text-neutral-400 py-8">No student selected</p>;

  return (
    <SectionCard title="Health Records" subtitle={`${records.length} records`}
      action={canAdd ? <Button onClick={() => setModalOpen(true)}><Plus className="w-4 h-4" /> Add Record</Button> : undefined}>
      <div className="space-y-3">
        {records.length === 0 ? (
          <p className="text-center text-neutral-400 py-8">No health records found</p>
        ) : (
          records.map((r) => (
            <div key={r.id} className="flex items-start gap-3 p-4 bg-neutral-50 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0">
                {getIcon(r.record_type)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-neutral-900">{r.title}</p>
                  <Badge variant={typeColors[r.record_type] || 'default'}>{r.record_type}</Badge>
                </div>
                <p className="text-sm text-neutral-500 mt-1">{new Date(r.record_date).toLocaleDateString()}</p>
                {r.description && <p className="text-sm text-neutral-600 mt-1">{r.description}</p>}
                {r.notes && <p className="text-xs text-neutral-400 mt-1 italic">Notes: {r.notes}</p>}
              </div>
            </div>
          ))
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Health Record">
        <div className="space-y-4">
          <Select label="Record Type" value={form.record_type} onChange={(e) => setForm({ ...form, record_type: e.target.value as any })}
            options={[
              { value: 'checkup', label: 'Checkup' },
              { value: 'vaccination', label: 'Vaccination' },
              { value: 'illness', label: 'Illness' },
              { value: 'injury', label: 'Injury' },
              { value: 'other', label: 'Other' },
            ]} />
          <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g., Annual Checkup" />
          <Input label="Date" type="date" value={form.record_date} onChange={(e) => setForm({ ...form, record_date: e.target.value })} />
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Description (optional)</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Notes (optional)</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd}>Add Record</Button>
          </div>
        </div>
      </Modal>
    </SectionCard>
  );
}
