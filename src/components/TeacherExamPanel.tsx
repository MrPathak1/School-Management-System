import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Play, XCircle, FileText, Clock } from 'lucide-react';
import { SectionCard } from './ui/Card';
import { Table, Badge, Button, Input, Select } from './ui/Table';
import { Modal } from './ui/Modal';
import { useToastStore } from '../hooks/useToast';
import { supabase, Exam, ExamQuestion, Class, Subject } from '../lib/supabase';

interface ExamWithQuestions extends Exam {
  questions?: { text: string; options: string[]; correct: number }[];
}

const EXAMS_KEY = 'teacher_exams_local';

function loadExamsLocal(): ExamWithQuestions[] {
  try { return JSON.parse(localStorage.getItem(EXAMS_KEY) || '[]'); } catch { return []; }
}

function saveExamsLocal(data: ExamWithQuestions[]) {
  localStorage.setItem(EXAMS_KEY, JSON.stringify(data));
}

interface Props {
  teacherId: string;
  assignedClasses: Class[];
  subjects: Subject[];
}

export function TeacherExamPanel({ teacherId, assignedClasses, subjects }: Props) {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [useLocal, setUseLocal] = useState(false);
  const addToast = useToastStore((s) => s.addToast);

  // Form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [classId, setClassId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [duration, setDuration] = useState(30);
  const [passPct, setPassPct] = useState(40);
  const [questions, setQuestions] = useState<Array<{ text: string; options: string[]; correct: number }>>([]);

  useEffect(() => { fetchExams(); }, []);

  const fetchExams = async () => {
    const { data, error } = await supabase
      .from('exams')
      .select('*')
      .eq('teacher_id', teacherId)
      .order('created_at', { ascending: false });
    if (error && error.message?.includes('schema cache')) {
      setUseLocal(true);
      setExams(loadExamsLocal().filter((e) => e.teacher_id === teacherId));
      setLoading(false);
      return;
    }
    if (error) {
      addToast({ type: 'error', title: 'Failed to load exams', message: error.message });
    }
    setExams(data || []);
    setLoading(false);
  };

  const addQuestion = () => {
    setQuestions([...questions, { text: '', options: ['', '', '', ''], correct: 0 }]);
  };

  const updateQuestion = (idx: number, field: string, value: any) => {
    const updated = [...questions];
    (updated as any)[idx][field] = value;
    setQuestions(updated);
  };

  const updateOption = (qIdx: number, oIdx: number, value: string) => {
    const updated = [...questions];
    updated[qIdx].options[oIdx] = value;
    setQuestions(updated);
  };

  const removeQuestion = (idx: number) => {
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const handleCreate = async () => {
    if (!title || !classId || !subjectId || questions.length === 0) {
      addToast({ type: 'error', title: 'Fill all required fields and add at least 1 question' });
      return;
    }
    const totalMarks = questions.length;
    if (useLocal) {
      const localExams = loadExamsLocal();
      const now = new Date().toISOString();
      const newExam: ExamWithQuestions = {
        id: crypto.randomUUID(),
        title,
        description: description || null,
        class_id: classId,
        subject_id: subjectId,
        teacher_id: teacherId,
        duration_minutes: duration,
        total_marks: totalMarks,
        pass_percentage: passPct,
        scheduled_at: null,
        status: 'published',
        created_at: now,
        questions,
      };
      saveExamsLocal([newExam, ...localExams]);
      setExams((prev) => [newExam, ...prev]);
      addToast({ type: 'success', title: 'Exam created (local)' });
      setModalOpen(false);
      resetForm();
      return;
    }
    try {
      const { data: exam, error } = await supabase.from('exams').insert({
        title, description, class_id: classId, subject_id: subjectId,
        teacher_id: teacherId, duration_minutes: duration, total_marks: totalMarks,
        pass_percentage: passPct, status: 'published',
      }).select().single();
      if (error) throw error;

      const qRecords = questions.map((q, i) => ({
        exam_id: exam.id,
        question_text: q.text,
        options: q.options.map((opt, idx) => ({ key: String.fromCharCode(65 + idx), text: opt })),
        correct_key: String.fromCharCode(65 + q.correct),
        marks: 1,
      }));
      const { error: qErr } = await supabase.from('exam_questions').insert(qRecords);
      if (qErr) throw qErr;

      addToast({ type: 'success', title: 'Exam created' });
      setModalOpen(false);
      resetForm();
      fetchExams();
    } catch (err) {
      console.error(err);
      addToast({ type: 'error', title: 'Failed to create exam', message: (err as any)?.message || 'Unexpected error' });
    }
  };

  const handlePublish = async (id: string) => {
    if (useLocal) {
      const local = loadExamsLocal().map((e) => e.id === id ? { ...e, status: 'published' as const } : e);
      saveExamsLocal(local);
      setExams((prev) => prev.map((e) => e.id === id ? { ...e, status: 'published' } : e));
      addToast({ type: 'success', title: 'Exam published' });
      return;
    }
    const { error } = await supabase.from('exams').update({ status: 'published' }).eq('id', id);
    if (error) { addToast({ type: 'error', title: 'Failed to publish', message: error.message }); return; }
    addToast({ type: 'success', title: 'Exam published' });
    fetchExams();
  };

  const handleClose = async (id: string) => {
    if (useLocal) {
      const local = loadExamsLocal().map((e) => e.id === id ? { ...e, status: 'closed' as const } : e);
      saveExamsLocal(local);
      setExams((prev) => prev.map((e) => e.id === id ? { ...e, status: 'closed' } : e));
      addToast({ type: 'success', title: 'Exam closed' });
      return;
    }
    const { error } = await supabase.from('exams').update({ status: 'closed' }).eq('id', id);
    if (error) { addToast({ type: 'error', title: 'Failed to close', message: error.message }); return; }
    addToast({ type: 'success', title: 'Exam closed' });
    fetchExams();
  };

  const resetForm = () => {
    setTitle(''); setDescription(''); setClassId(''); setSubjectId('');
    setDuration(30); setPassPct(40); setQuestions([]);
  };

  if (loading) return <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>;

  return (
    <div className="space-y-6">
      <button onClick={() => { resetForm(); setModalOpen(true); }}
        className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 transition-colors">
        <Plus className="w-4 h-4" /> Create Exam
      </button>

      <SectionCard title="My Exams" subtitle={`${exams.length} total`}>
        {exams.length === 0 ? (
          <p className="text-center text-neutral-400 py-8">No exams created yet</p>
        ) : (
          <Table
            columns={[
              { key: 'title', header: 'Exam', render: (e) => (
                <div><p className="font-medium text-neutral-900">{e.title}</p><p className="text-sm text-neutral-500">{e.description}</p></div>
              )},
              { key: 'duration', header: 'Duration', render: (e) => <span>{e.duration_minutes} min</span> },
              { key: 'marks', header: 'Marks', render: (e) => <span>{e.total_marks}</span> },
              { key: 'status', header: 'Status', render: (e) => (
                <Badge variant={e.status === 'published' ? 'success' : e.status === 'draft' ? 'info' : 'default'}>{e.status}</Badge>
              )},
              { key: 'actions', header: '', render: (e) => (
                <div className="flex gap-1 justify-end">
                  {e.status === 'draft' && (
                    <button onClick={() => handlePublish(e.id)} className="p-1.5 text-neutral-400 hover:text-success-600 rounded-lg" title="Publish">
                      <Play className="w-4 h-4" />
                    </button>
                  )}
                  {e.status === 'published' && (
                    <button onClick={() => handleClose(e.id)} className="p-1.5 text-neutral-400 hover:text-warning-600 rounded-lg" title="Close">
                      <XCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ), className: 'w-24' },
            ]}
            data={exams}
            keyExtractor={(e) => e.id}
          />
        )}
      </SectionCard>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create Exam" size="lg">
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Input label="Exam Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Midterm Mathematics" />
            </div>
            <div className="col-span-2">
              <Input label="Description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Instructions for students..." />
            </div>
            <Select label="Class" value={classId} onChange={(e) => setClassId(e.target.value)}
              options={[{ value: '', label: 'Select' }, ...assignedClasses.map((c) => ({ value: c.id, label: `Grade ${c.name}-${c.section}` }))]} />
            <Select label="Subject" value={subjectId} onChange={(e) => setSubjectId(e.target.value)}
              options={[{ value: '', label: 'Select' }, ...subjects.map((s) => ({ value: s.id, label: s.name }))]} />
            <Input label="Duration (min)" type="number" value={duration} onChange={(e) => setDuration(parseInt(e.target.value) || 30)} />
            <Input label="Pass %" type="number" value={passPct} onChange={(e) => setPassPct(Math.min(100, Math.max(0, parseInt(e.target.value) || 40)))} />
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-neutral-700">Questions ({questions.length})</h4>
              <Button variant="secondary" onClick={addQuestion}><Plus className="w-4 h-4" /> Add Question</Button>
            </div>
            {questions.length === 0 && (
              <p className="text-neutral-400 text-sm text-center py-4">No questions added yet</p>
            )}
            {questions.map((q, qi) => (
              <div key={qi} className="p-4 bg-neutral-50 rounded-lg mb-3">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-sm font-medium text-neutral-500">Q{qi + 1}</span>
                  <button onClick={() => removeQuestion(qi)} className="p-1 text-neutral-400 hover:text-danger-600"><Trash2 className="w-4 h-4" /></button>
                </div>
                <input type="text" placeholder="Question text..." value={q.text}
                  onChange={(e) => updateQuestion(qi, 'text', e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 mb-2" />
                {q.options.map((opt, oi) => (
                  <div key={oi} className="flex items-center gap-2 mb-1.5">
                    <input type="radio" name={`correct-${qi}`} checked={q.correct === oi}
                      onChange={() => updateQuestion(qi, 'correct', oi)} className="accent-primary-600" />
                    <span className="text-xs font-mono text-neutral-400 w-5">{String.fromCharCode(65 + oi)}.</span>
                    <input type="text" placeholder={`Option ${String.fromCharCode(65 + oi)}...`} value={opt}
                      onChange={(e) => updateOption(qi, oi, e.target.value)}
                      className="flex-1 px-3 py-1.5 border border-neutral-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Create Exam</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
