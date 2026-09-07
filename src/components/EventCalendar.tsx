import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Plus, Edit, Trash2, X } from 'lucide-react';
import { SectionCard } from './ui/Card';
import { Button, Input, Select, Badge } from './ui/Table';
import { Modal } from './ui/Modal';
import { useToastStore } from '../hooks/useToast';
import { supabase, CalendarEvent } from '../lib/supabase';

interface Props {
  readOnly?: boolean;
  userId?: string;
}

const typeColors: Record<string, 'success' | 'danger' | 'info' | 'warning' | 'default'> = {
  holiday: 'success',
  exam: 'danger',
  meeting: 'info',
  sports: 'warning',
  cultural: 'default',
  other: 'default',
};

export function EventCalendar({ readOnly, userId }: Props) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [editing, setEditing] = useState<CalendarEvent | null>(null);
  const addToast = useToastStore((s) => s.addToast);

  const [form, setForm] = useState({ title: '', description: '', event_date: '', end_date: '', location: '', type: 'other' as CalendarEvent['type'] });

  useEffect(() => { fetchEvents(); }, []);

  const fetchEvents = async () => {
    const { data } = await supabase.from('events').select('*').order('event_date', { ascending: true });
    setEvents(data || []);
    setLoading(false);
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ title: '', description: '', event_date: '', end_date: '', location: '', type: 'other' });
    setModalOpen(true);
  };

  const openEdit = (e: CalendarEvent) => {
    setEditing(e);
    setForm({ title: e.title, description: e.description || '', event_date: e.event_date, end_date: e.end_date || '', location: e.location || '', type: e.type });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.event_date) { addToast({ type: 'error', title: 'Title and date are required' }); return; }
    if (editing) {
      const { error } = await supabase.from('events').update({ title: form.title, description: form.description || null, event_date: form.event_date, end_date: form.end_date || null, location: form.location || null, type: form.type }).eq('id', editing.id);
      if (error) { addToast({ type: 'error', title: 'Failed to update event' }); return; }
      addToast({ type: 'success', title: 'Event updated' });
    } else {
      const { error } = await supabase.from('events').insert({ title: form.title, description: form.description || null, event_date: form.event_date, end_date: form.end_date || null, location: form.location || null, type: form.type, created_by: userId || null });
      if (error) { addToast({ type: 'error', title: 'Failed to create event' }); return; }
      addToast({ type: 'success', title: 'Event created' });
    }
    setModalOpen(false);
    fetchEvents();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this event?')) return;
    await supabase.from('events').delete().eq('id', id);
    addToast({ type: 'success', title: 'Event deleted' });
    fetchEvents();
  };

  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const today = new Date();

  const monthEvents = events.filter((e) => {
    const d = new Date(e.event_date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const getEventsForDay = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return monthEvents.filter((e) => e.event_date === dateStr || (e.end_date && e.end_date >= dateStr && e.event_date <= dateStr));
  };

  const prevMonth = () => { if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1); } else { setCurrentMonth(currentMonth - 1); } };
  const nextMonth = () => { if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1); } else { setCurrentMonth(currentMonth + 1); } };

  if (loading) return <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>;

  return (
    <SectionCard title="Events Calendar" subtitle={`${monthNames[currentMonth]} ${currentYear}`}
      action={!readOnly ? <Button onClick={openCreate}><Plus className="w-4 h-4" /> Add Event</Button> : undefined}>
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="p-2 hover:bg-neutral-100 rounded-lg"><ChevronLeft className="w-5 h-5" /></button>
        <span className="font-semibold text-lg">{monthNames[currentMonth]} {currentYear}</span>
        <button onClick={nextMonth} className="p-2 hover:bg-neutral-100 rounded-lg"><ChevronRight className="w-5 h-5" /></button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d) => (<div key={d} className="text-xs font-semibold text-neutral-500 p-2">{d}</div>))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDay }).map((_, i) => (<div key={`empty-${i}`} />))}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
          const dayEvents = getEventsForDay(day);
          const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
          return (
            <div key={day} className={`min-h-[80px] p-1 rounded-lg border ${isToday ? 'border-primary-400 bg-primary-50' : 'border-neutral-100'}`}>
              <span className={`text-sm font-medium ${isToday ? 'text-primary-700' : 'text-neutral-700'}`}>{day}</span>
              <div className="mt-1 space-y-0.5">
                {dayEvents.slice(0, 3).map((e) => (
                  <div key={e.id} className={`text-[10px] px-1 py-0.5 rounded truncate cursor-pointer ${typeColors[e.type] === 'success' ? 'bg-success-100 text-success-700' : typeColors[e.type] === 'danger' ? 'bg-danger-100 text-danger-700' : typeColors[e.type] === 'info' ? 'bg-primary-100 text-primary-700' : typeColors[e.type] === 'warning' ? 'bg-warning-100 text-warning-700' : 'bg-neutral-100 text-neutral-600'}`}
                    onClick={() => !readOnly && openEdit(e)} title={e.title}>
                    {e.title}
                  </div>
                ))}
                {dayEvents.length > 3 && <span className="text-[10px] text-neutral-400">+{dayEvents.length - 3} more</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Event List */}
      <div className="mt-6 space-y-2">
        <h4 className="font-semibold text-neutral-700">All Events</h4>
        {events.length === 0 ? <p className="text-sm text-neutral-400">No events scheduled</p> : (
          events.filter((e) => new Date(e.event_date) >= new Date(new Date().setMonth(new Date().getMonth() - 1))).map((e) => (
            <div key={e.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${typeColors[e.type] === 'success' ? 'bg-success-100' : typeColors[e.type] === 'danger' ? 'bg-danger-100' : typeColors[e.type] === 'info' ? 'bg-primary-100' : typeColors[e.type] === 'warning' ? 'bg-warning-100' : 'bg-neutral-100'}`}>
                  <Calendar className={`w-5 h-5 ${typeColors[e.type] === 'success' ? 'text-success-600' : typeColors[e.type] === 'danger' ? 'text-danger-600' : typeColors[e.type] === 'info' ? 'text-primary-600' : typeColors[e.type] === 'warning' ? 'text-warning-600' : 'text-neutral-600'}`} />
                </div>
                <div>
                  <p className="font-medium text-neutral-900">{e.title}</p>
                  <p className="text-xs text-neutral-500">{new Date(e.event_date).toLocaleDateString()}{e.location ? ` · ${e.location}` : ''}</p>
                  {e.description && <p className="text-xs text-neutral-400 mt-0.5">{e.description}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={typeColors[e.type] || 'default'}>{e.type}</Badge>
                {!readOnly && (
                  <>
                    <button onClick={() => openEdit(e)} className="p-1.5 text-neutral-400 hover:text-primary-600"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(e.id)} className="p-1.5 text-neutral-400 hover:text-danger-600"><Trash2 className="w-4 h-4" /></button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Event' : 'Create Event'}>
        <div className="space-y-4">
          <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Event title" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Start Date" type="date" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} />
            <Input label="End Date (optional)" type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
          </div>
          <Input label="Location (optional)" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g., Main Hall" />
          <Select label="Type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as any })} options={[
            { value: 'holiday', label: 'Holiday' },
            { value: 'exam', label: 'Exam' },
            { value: 'meeting', label: 'Meeting' },
            { value: 'sports', label: 'Sports' },
            { value: 'cultural', label: 'Cultural' },
            { value: 'other', label: 'Other' },
          ]} />
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="Event description..." />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editing ? 'Update' : 'Create'}</Button>
          </div>
        </div>
      </Modal>
    </SectionCard>
  );
}
