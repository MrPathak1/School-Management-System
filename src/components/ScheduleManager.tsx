import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, Clock } from 'lucide-react';
import { SectionCard } from './ui/Card';
import { Badge, Button, Input, Select } from './ui/Table';
import { Modal } from './ui/Modal';
import { useToastStore } from '../hooks/useToast';
import { supabase, Class, Subject, TeacherWithDetails, Timetable } from '../lib/supabase';

interface Props {
  classes: Class[];
  subjects: Subject[];
  teachers: TeacherWithDetails[];
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const PERIODS = [1, 2, 3, 4, 5, 6];

export function ScheduleManager({ classes, subjects, teachers }: Props) {
  const [timetable, setTimetable] = useState<Timetable[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Timetable | null>(null);
  const [form, setForm] = useState({ class_id: '', subject_id: '', teacher_id: '', day_of_week: 1, period: 1, start_time: '', end_time: '', room: '' });
  const [selectedClass, setSelectedClass] = useState<string>('');
  const addToast = useToastStore((s) => s.addToast);

  useEffect(() => { fetchTimetable(); }, []);

  const fetchTimetable = async () => {
    const { data } = await supabase.from('timetable').select(`*, subject:subjects(*), teacher:teachers(*, user:users(*))`).order('day_of_week').order('period');
    setTimetable(data as any || []);
    setLoading(false);
  };

  const resetForm = () => {
    setForm({ class_id: '', subject_id: '', teacher_id: '', day_of_week: 1, period: 1, start_time: '', end_time: '', room: '' });
    setEditing(null);
    setShowForm(false);
  };

  const openEdit = (entry: Timetable) => {
    setForm({
      class_id: entry.class_id, subject_id: entry.subject_id, teacher_id: entry.teacher_id || '',
      day_of_week: entry.day_of_week, period: entry.period,
      start_time: entry.start_time?.substring(0, 5) || '', end_time: entry.end_time?.substring(0, 5) || '',
      room: entry.room || '',
    });
    setEditing(entry);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.class_id || !form.subject_id) {
      addToast({ type: 'error', title: 'Select class and subject' });
      return;
    }
    const payload = {
      class_id: form.class_id,
      subject_id: form.subject_id,
      teacher_id: form.teacher_id || null,
      day_of_week: form.day_of_week,
      period: form.period,
      start_time: form.start_time || null,
      end_time: form.end_time || null,
      room: form.room || null,
    };

    if (editing) {
      await supabase.from('timetable').update(payload).eq('id', editing.id);
      addToast({ type: 'success', title: 'Schedule updated' });
    } else {
      // Check for duplicate
      const { data: existing } = await supabase.from('timetable').select('id').eq('class_id', form.class_id).eq('day_of_week', form.day_of_week).eq('period', form.period);
      if (existing && existing.length > 0) {
        addToast({ type: 'error', title: 'This period already has a class scheduled' });
        return;
      }
      await supabase.from('timetable').insert(payload);
      addToast({ type: 'success', title: 'Schedule added' });
    }
    resetForm();
    fetchTimetable();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this schedule entry?')) return;
    await supabase.from('timetable').delete().eq('id', id);
    addToast({ type: 'success', title: 'Schedule entry deleted' });
    fetchTimetable();
  };

  const getClassTimetable = (classId: string) => timetable.filter(t => t.class_id === classId);
  const getSubjectName = (id: string) => subjects.find(s => s.id === id)?.name || 'N/A';
  const getTeacherName = (id: string | null) => {
    if (!id) return '—';
    const t = teachers.find(t => t.id === id);
    return t?.user.full_name || '—';
  };

  if (loading) return <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-neutral-900">Class Schedule Management</h2>
          <p className="text-sm text-neutral-500">Create and manage weekly timetables for each class</p>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(true); }} icon={<Plus className="w-4 h-4" />}>Add Period</Button>
      </div>

      {/* Class selector */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button onClick={() => setSelectedClass('')}
          className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap text-sm ${!selectedClass ? 'bg-primary-600 text-white' : 'bg-white text-neutral-600 border border-neutral-200'}`}>
          All Classes
        </button>
        {classes.map((cls) => (
          <button key={cls.id} onClick={() => setSelectedClass(cls.id)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap text-sm ${selectedClass === cls.id ? 'bg-primary-600 text-white' : 'bg-white text-neutral-600 border border-neutral-200'}`}>
            Grade {cls.name}-{cls.section}
          </button>
        ))}
      </div>

      {/* Timetable Grid */}
      {(selectedClass ? [classes.find(c => c.id === selectedClass)].filter(Boolean) : classes).map((cls) => {
        if (!cls) return null;
        const clsTt = getClassTimetable(cls.id);
        return (
          <SectionCard key={cls.id} title={`Grade ${cls.name}-${cls.section}`} subtitle="Weekly schedule">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="text-left text-sm text-neutral-500 border-b border-neutral-200">
                    <th className="pb-2 pr-4 font-medium">Period</th>
                    {DAYS.map((d, i) => (
                      <th key={i} className="pb-2 px-2 font-medium text-center">{d}</th>
                    ))}
                    <th className="pb-2 pl-4 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {PERIODS.map((period) => (
                    <tr key={period} className="border-b border-neutral-100">
                      <td className="py-2 pr-4 text-sm font-medium text-neutral-500 w-16">{period}</td>
                      {DAYS.map((_, dayIdx) => {
                        const slot = clsTt.find(t => t.day_of_week === dayIdx + 1 && t.period === period);
                        return (
                          <td key={dayIdx} className="px-1 py-1">
                            {slot ? (
                              <div className="bg-primary-50 rounded-lg p-2 text-xs text-center min-h-[60px] flex flex-col justify-center">
                                <p className="font-medium text-primary-800">{getSubjectName(slot.subject_id)}</p>
                                <p className="text-primary-600 truncate">{getTeacherName(slot.teacher_id)}</p>
                                {slot.room && <p className="text-primary-400">Room {slot.room}</p>}
                                {(slot.start_time || slot.end_time) && <p className="text-primary-400">{slot.start_time?.substring(0, 5) || ''}-{slot.end_time?.substring(0, 5) || ''}</p>}
                              </div>
                            ) : (
                              <div className="min-h-[60px] flex items-center justify-center">
                                <span className="text-neutral-300 text-xs">—</span>
                              </div>
                            )}
                          </td>
                        );
                      })}
                      <td className="py-1 pl-2">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((dayIdx) => {
                            const slot = clsTt.find(t => t.day_of_week === dayIdx && t.period === period);
                            if (!slot) return null;
                            return (
                              <React.Fragment key={slot.id}>
                                <button onClick={() => openEdit(slot)} className="p-1 text-neutral-400 hover:text-primary-600 rounded">
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={() => handleDelete(slot.id)} className="p-1 text-neutral-400 hover:text-danger-600 rounded">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </React.Fragment>
                            );
                          })}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {clsTt.length === 0 && <p className="text-center text-neutral-400 py-8">No schedule defined for this class</p>}
          </SectionCard>
        );
      })}

      {/* Add/Edit Modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editing ? 'Edit Period' : 'Add Period'}>
        <div className="space-y-4">
          <Select label="Class" value={form.class_id} onChange={(e) => setForm(f => ({ ...f, class_id: e.target.value }))}
            options={[{ value: '', label: 'Select class' }, ...classes.map((c) => ({ value: c.id, label: `Grade ${c.name}-${c.section}` }))]} />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Day" value={String(form.day_of_week)} onChange={(e) => setForm(f => ({ ...f, day_of_week: Number(e.target.value) }))}
              options={DAYS.map((d, i) => ({ value: String(i + 1), label: d }))} />
            <Select label="Period" value={String(form.period)} onChange={(e) => setForm(f => ({ ...f, period: Number(e.target.value) }))}
              options={PERIODS.map((p) => ({ value: String(p), label: `Period ${p}` }))} />
          </div>
          <Select label="Subject" value={form.subject_id} onChange={(e) => setForm(f => ({ ...f, subject_id: e.target.value }))}
            options={[{ value: '', label: 'Select subject' }, ...subjects.map((s) => ({ value: s.id, label: s.name }))]} />
          <Select label="Teacher" value={form.teacher_id} onChange={(e) => setForm(f => ({ ...f, teacher_id: e.target.value }))}
            options={[{ value: '', label: 'Not assigned' }, ...teachers.map((t) => ({ value: t.id, label: t.user.full_name }))]} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Start Time" type="time" value={form.start_time} onChange={(e) => setForm(f => ({ ...f, start_time: e.target.value }))} />
            <Input label="End Time" type="time" value={form.end_time} onChange={(e) => setForm(f => ({ ...f, end_time: e.target.value }))} />
          </div>
          <Input label="Room" value={form.room} onChange={(e) => setForm(f => ({ ...f, room: e.target.value }))} placeholder="e.g. 101" />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editing ? 'Update' : 'Add'} Period</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
