import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Calendar, Clock, MapPin } from 'lucide-react';
import { SectionCard } from './ui/Card';
import { Badge, Button, Input, Select } from './ui/Table';
import { Modal } from './ui/Modal';
import { useToastStore } from '../hooks/useToast';
import { supabase, Class, Subject, ExamSchedule } from '../lib/supabase';

type LocalSchedule = ExamSchedule & { subject?: Subject; class?: Class };

const STORAGE_KEY = 'exam_schedules_local';

function loadLocal(): LocalSchedule[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
}

function saveLocal(data: LocalSchedule[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

interface Props {
  classes: Class[];
  subjects: Subject[];
  readOnly?: boolean;
  classId?: string;
}

const EXAM_TYPES = [
  { value: 'midterm', label: 'Midterm' },
  { value: 'final', label: 'Final' },
  { value: 'quiz', label: 'Quiz' },
  { value: 'term', label: 'Term Exam' },
  { value: 'other', label: 'Other' },
];

export function ExamScheduleManager({ classes, subjects, readOnly, classId }: Props) {
  const [schedules, setSchedules] = useState<LocalSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [useLocal, setUseLocal] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', class_id: classId || '', subject_id: '',
    exam_date: '', start_time: '', end_time: '', total_marks: 100, room: '', type: 'midterm',
  });
  const addToast = useToastStore((s) => s.addToast);
  const adminId = '00000001-1111-1111-1111-111111111111';

  useEffect(() => { fetchSchedules(); }, []);

  const fetchSchedules = async () => {
    setLoading(true);
    const { error } = await supabase.from('exam_schedules').select('id').limit(1).maybeSingle();
    if (error && error.message?.includes('schema cache')) {
      setUseLocal(true);
      setSchedules(loadLocal().filter(s => !classId || s.class_id === classId));
      addToast({ type: 'info', title: 'Using local storage',
        message: 'Apply migration supabase/migrations/20260614100004_012_exam_schedules.sql via Supabase SQL Editor for persistence.' });
      setLoading(false);
      return;
    }
    setUseLocal(false);
    let query = supabase.from('exam_schedules').select(`*, subject:subjects(*), class:classes(*)`).order('exam_date', { ascending: true });
    if (classId) query = query.eq('class_id', classId);
    const { data } = await query;
    setSchedules(data as any || []);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!form.title || !form.class_id || !form.subject_id || !form.exam_date || !form.start_time || !form.end_time) {
      addToast({ type: 'error', title: 'Fill all required fields' });
      return;
    }
    if (useLocal) {
      const localData = loadLocal();
      const entry: LocalSchedule = {
        id: crypto.randomUUID(),
        title: form.title,
        description: form.description || null,
        class_id: form.class_id,
        subject_id: form.subject_id,
        exam_date: form.exam_date,
        start_time: form.start_time,
        end_time: form.end_time,
        total_marks: Number(form.total_marks),
        room: form.room || null,
        type: form.type as any,
        created_by: adminId,
        created_at: new Date().toISOString(),
        subject: subjects.find((s) => s.id === form.subject_id),
        class: classes.find((c) => c.id === form.class_id),
      };
      saveLocal([...localData, entry]);
      setSchedules((prev) => [...prev, entry]);
      addToast({ type: 'success', title: 'Exam schedule created (local)' });
      setShowForm(false);
      setForm({ title: '', description: '', class_id: classId || '', subject_id: '', exam_date: '', start_time: '', end_time: '', total_marks: 100, room: '', type: 'midterm' });
      return;
    }
    try {
      const { error } = await supabase.from('exam_schedules').insert({
        title: form.title,
        description: form.description || null,
        class_id: form.class_id,
        subject_id: form.subject_id,
        exam_date: form.exam_date,
        start_time: form.start_time,
        end_time: form.end_time,
        total_marks: Number(form.total_marks),
        room: form.room || null,
        type: form.type,
        created_by: adminId,
      });
      if (error) {
        console.error('Supabase error:', error);
        addToast({ type: 'error', title: 'Failed to create schedule', message: error.message || JSON.stringify(error) });
        return;
      }
      addToast({ type: 'success', title: 'Exam schedule created' });
      setShowForm(false);
      setForm({ title: '', description: '', class_id: classId || '', subject_id: '', exam_date: '', start_time: '', end_time: '', total_marks: 100, room: '', type: 'midterm' });
      fetchSchedules();
    } catch (err) {
      console.error('Unexpected error:', err);
      addToast({ type: 'error', title: 'Failed to create schedule', message: (err as any)?.message || 'Unexpected error' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this exam schedule?')) return;
    if (useLocal) {
      const localData = loadLocal().filter((s) => s.id !== id);
      saveLocal(localData);
      setSchedules((prev) => prev.filter((s) => s.id !== id));
      addToast({ type: 'success', title: 'Exam schedule deleted' });
      return;
    }
    const { error } = await supabase.from('exam_schedules').delete().eq('id', id);
    if (error) { console.error(error); addToast({ type: 'error', title: 'Failed to delete' }); return; }
    addToast({ type: 'success', title: 'Exam schedule deleted' });
    fetchSchedules();
  };

  const getTypeVariant = (type: string) => {
    switch (type) {
      case 'final': return 'danger';
      case 'midterm': return 'warning';
      case 'quiz': return 'info';
      default: return 'default';
    }
  };

  if (loading) return <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-neutral-900">Exam Schedule</h2>
          <p className="text-sm text-neutral-500">{schedules.length} scheduled exam{schedules.length !== 1 ? 's' : ''}</p>
        </div>
        {!readOnly && (
          <Button onClick={() => setShowForm(true)} icon={<Plus className="w-4 h-4" />}>Add Exam</Button>
        )}
      </div>

      {schedules.length === 0 ? (
        <div className="text-center py-12 text-neutral-400">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="font-medium">No exam schedules yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {schedules.map((s) => {
            const examDate = new Date(s.exam_date);
            const isPast = examDate < new Date();
            return (
              <div key={s.id} className={`bg-white border rounded-xl p-4 ${isPast ? 'border-neutral-200 opacity-60' : 'border-neutral-200'}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`p-2.5 rounded-xl ${isPast ? 'bg-neutral-100' : 'bg-primary-50'}`}>
                      <Calendar className={`w-5 h-5 ${isPast ? 'text-neutral-400' : 'text-primary-600'}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-neutral-900">{s.title}</h3>
                        <Badge variant={getTypeVariant(s.type) as any}>{s.type}</Badge>
                        {isPast && <Badge variant="default">Completed</Badge>}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-sm text-neutral-500">
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {examDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {s.start_time?.substring(0, 5)} - {s.end_time?.substring(0, 5)}</span>
                        {s.room && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Room {s.room}</span>}
                        <span>Marks: {s.total_marks}</span>
                      </div>
                      {(s as any).subject && <span className="text-sm text-primary-600 font-medium mt-0.5 block">{(s as any).subject?.name}</span>}
                      {(s as any).class && <span className="text-xs text-neutral-400">Grade {(s as any).class?.name}-{(s as any).class?.section}</span>}
                    </div>
                  </div>
                  {!readOnly && (
                    <button onClick={() => handleDelete(s.id)} className="p-2 text-neutral-400 hover:text-danger-600 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Form */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Schedule Exam">
        <div className="space-y-4">
          <Input label="Exam Title *" value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Mathematics Midterm" />
          <div className="grid grid-cols-2 gap-4">
            {!classId && (
              <Select label="Class *" value={form.class_id} onChange={(e) => setForm(f => ({ ...f, class_id: e.target.value }))}
                options={[{ value: '', label: 'Select class' }, ...classes.map((c) => ({ value: c.id, label: `Grade ${c.name}-${c.section}` }))]} />
            )}
            <Select label="Subject *" value={form.subject_id} onChange={(e) => setForm(f => ({ ...f, subject_id: e.target.value }))}
              options={[{ value: '', label: 'Select subject' }, ...subjects.map((s) => ({ value: s.id, label: s.name }))]} />
          </div>
          <Select label="Exam Type" value={form.type} onChange={(e) => setForm(f => ({ ...f, type: e.target.value }))}
            options={EXAM_TYPES} />
          <Input label="Description" value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional description" />
          <Input label="Exam Date *" type="date" value={form.exam_date} onChange={(e) => setForm(f => ({ ...f, exam_date: e.target.value }))} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Start Time *" type="time" value={form.start_time} onChange={(e) => setForm(f => ({ ...f, start_time: e.target.value }))} />
            <Input label="End Time *" type="time" value={form.end_time} onChange={(e) => setForm(f => ({ ...f, end_time: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Total Marks" type="number" value={String(form.total_marks)} onChange={(e) => setForm(f => ({ ...f, total_marks: Number(e.target.value) }))} />
            <Input label="Room" value={form.room} onChange={(e) => setForm(f => ({ ...f, room: e.target.value }))} placeholder="e.g. 201" />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleSave}>Create Schedule</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
