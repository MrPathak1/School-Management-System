import React, { useState, useEffect } from 'react';
import { FileText, Download, Plus, Trash2 } from 'lucide-react';
import { SectionCard } from './ui/Card';
import { Button, Input, Select } from './ui/Table';
import { Modal } from './ui/Modal';
import { useToastStore } from '../hooks/useToast';
import { supabase, Subject, Class, StudyMaterial } from '../lib/supabase';

interface Props {
  mode: 'teacher' | 'student' | 'parent';
  teacherId?: string;
  classId?: string;
  subjects?: Subject[];
  assignedClasses?: Class[];
  childClassId?: string;
}

export function StudyMaterials({ mode, teacherId, classId, subjects, assignedClasses, childClassId }: Props) {
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [filterSubject, setFilterSubject] = useState('');
  const addToast = useToastStore((s) => s.addToast);

  const [form, setForm] = useState({ title: '', description: '', file_url: '', file_type: '', subject_id: '', class_id: '' });

  const effectiveClassId = classId || childClassId || '';

  useEffect(() => { fetchMaterials(); }, [effectiveClassId]);

  const fetchMaterials = async () => {
    let query = supabase.from('study_materials').select('*, subject:subjects(name)').order('created_at', { ascending: false });
    if (mode === 'teacher' && teacherId) {
      query = query.eq('teacher_id', teacherId);
    }
    if (effectiveClassId) {
      query = query.eq('class_id', effectiveClassId);
    }
    if (filterSubject) {
      query = query.eq('subject_id', filterSubject);
    }
    const { data } = await query;
    setMaterials(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchMaterials(); }, [filterSubject]);

  const handleCreate = async () => {
    if (!form.title || !form.file_url || !form.subject_id || !form.class_id) {
      addToast({ type: 'error', title: 'Title, file URL, subject, and class are required' });
      return;
    }
    const { error } = await supabase.from('study_materials').insert({
      title: form.title, description: form.description || null,
      file_url: form.file_url, file_type: form.file_type || null,
      subject_id: form.subject_id, class_id: form.class_id, teacher_id: teacherId!,
    });
    if (error) { addToast({ type: 'error', title: 'Failed to upload material' }); return; }
    addToast({ type: 'success', title: 'Material uploaded' });
    setModalOpen(false);
    setForm({ title: '', description: '', file_url: '', file_type: '', subject_id: '', class_id: '' });
    fetchMaterials();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this material?')) return;
    await supabase.from('study_materials').delete().eq('id', id);
    addToast({ type: 'success', title: 'Material deleted' });
    fetchMaterials();
  };

  const getFileIcon = (_url: string) => {
    return <FileText className="w-5 h-5 text-primary-600" />;
  };

  if (loading) return <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>;

  return (
    <SectionCard title="Study Materials" subtitle={mode === 'teacher' ? 'Upload notes and resources for your classes' : 'Access your learning materials'}
      action={mode === 'teacher' ? <Button onClick={() => setModalOpen(true)}><Plus className="w-4 h-4" /> Upload Material</Button> : undefined}>
      {mode !== 'teacher' && subjects && subjects.length > 0 && (
        <div className="mb-4">
          <Select value={filterSubject} onChange={(e) => setFilterSubject(e.target.value)}
            options={[{ value: '', label: 'All Subjects' }, ...subjects.map((s) => ({ value: s.id, label: s.name }))]} />
        </div>
      )}
      <div className="space-y-3">
        {materials.length === 0 ? (
          <p className="text-center text-neutral-400 py-8">No study materials available</p>
        ) : (
          materials.map((m) => (
            <div key={m.id} className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  {getFileIcon(m.file_url)}
                </div>
                <div>
                  <p className="font-medium text-neutral-900">{m.title}</p>
                  <p className="text-xs text-neutral-500">{(m as any).subject?.name || 'All subjects'} · {new Date(m.created_at).toLocaleDateString()}</p>
                  {m.description && <p className="text-xs text-neutral-400 mt-0.5">{m.description}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a href={m.file_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 transition-colors">
                  <Download className="w-4 h-4" /> Open
                </a>
                {mode === 'teacher' && (
                  <button onClick={() => handleDelete(m.id)} className="p-1.5 text-neutral-400 hover:text-danger-600"><Trash2 className="w-4 h-4" /></button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Upload Study Material">
        <div className="space-y-4">
          <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g., Chapter 5 Notes" />
          <Input label="File URL" value={form.file_url} onChange={(e) => setForm({ ...form, file_url: e.target.value })} placeholder="https://example.com/file.pdf" />
          <Input label="File Type (optional)" value={form.file_type} onChange={(e) => setForm({ ...form, file_type: e.target.value })} placeholder="pdf, doc, video..." />
          <Select label="Class" value={form.class_id} onChange={(e) => setForm({ ...form, class_id: e.target.value })}
            options={[{ value: '', label: 'Select Class' }, ...(assignedClasses || []).map((c) => ({ value: c.id, label: `Grade ${c.name}-${c.section}` }))]} />
          <Select label="Subject" value={form.subject_id} onChange={(e) => setForm({ ...form, subject_id: e.target.value })}
            options={[{ value: '', label: 'Select Subject' }, ...(subjects || []).map((s) => ({ value: s.id, label: s.name }))]} />
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Description (optional)</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="Brief description..." />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Upload</Button>
          </div>
        </div>
      </Modal>
    </SectionCard>
  );
}
