import React, { useState, useEffect, useRef } from 'react';
import { Clock, CheckCircle, XCircle } from 'lucide-react';
import { SectionCard } from './ui/Card';
import { Badge, Button } from './ui/Table';
import { useToastStore } from '../hooks/useToast';
import { supabase, Exam, ExamQuestion, ExamAttempt } from '../lib/supabase';

interface LocalExam extends Exam {
  questions?: { text: string; options: string[]; correct: number }[];
}

interface LocalAttempt {
  id: string;
  exam_id: string;
  student_id: string;
  status: string;
  score?: number;
  total_marks?: number;
  percentage?: number;
  started_at?: string;
  submitted_at?: string;
}

const EXAMS_KEY = 'teacher_exams_local';
const ATTEMPTS_KEY = 'student_attempts_local';

function loadLocalExams(): LocalExam[] {
  try { return JSON.parse(localStorage.getItem(EXAMS_KEY) || '[]'); } catch { return []; }
}

function loadLocalAttempts(): LocalAttempt[] {
  try { return JSON.parse(localStorage.getItem(ATTEMPTS_KEY) || '[]'); } catch { return []; }
}

function saveLocalAttempts(data: LocalAttempt[]) {
  localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(data));
}

interface Props {
  studentId: string;
  classId: string;
}

export function StudentExamPanel({ studentId, classId }: Props) {
  const [exams, setExams] = useState<Exam[]>([]);
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [useLocal, setUseLocal] = useState(false);
  const addToast = useToastStore((s) => s.addToast);

  const [activeExam, setActiveExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [examStarted, setExamStarted] = useState(false);
  const [result, setResult] = useState<{ score: number; total: number; pct: number; passed: boolean } | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    fetchData();
  }, [studentId, classId]);

  const fetchData = async () => {
    if (!classId || !studentId) {
      setExams([]);
      setAttempts([]);
      setLoading(false);
      return;
    }

    const [examsRes, attemptsRes] = await Promise.all([
      supabase.from('exams').select('*').eq('class_id', classId).eq('status', 'published').order('created_at', { ascending: false }),
      supabase.from('exam_attempts').select('*').eq('student_id', studentId),
    ]);
    if ((examsRes.error && examsRes.error.message?.includes('schema cache')) ||
        (attemptsRes.error && attemptsRes.error.message?.includes('schema cache'))) {
      setUseLocal(true);
      const localExams = loadLocalExams()
        .filter((e) => e.class_id === classId && e.status === 'published')
        .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
      const localAttempts = loadLocalAttempts().filter((a) => a.student_id === studentId);
      setExams(localExams);
      setAttempts(localAttempts as any);
      setLoading(false);
      return;
    }
    if (examsRes.error || attemptsRes.error) {
      addToast({ type: 'error', title: 'Failed to load exams', message: examsRes.error?.message || attemptsRes.error?.message });
    }
    setExams(examsRes.data || []);
    setAttempts(attemptsRes.data || []);
    setLoading(false);
  };

  const startExam = async (exam: Exam) => {
    setActiveExam(exam);
    setExamStarted(false);
    setResult(null);

    let qData: ExamQuestion[] = [];

    if (useLocal) {
      const localExam = loadLocalExams().find((e) => e.id === exam.id);
      if (localExam?.questions) {
        qData = localExam.questions.map((q, i) => ({
          id: crypto.randomUUID(),
          exam_id: exam.id,
          question_text: q.text,
          options: q.options.map((opt, idx) => ({ key: String.fromCharCode(65 + idx), text: opt })),
          correct_key: String.fromCharCode(65 + q.correct),
          marks: 1,
          created_at: new Date().toISOString(),
        })) as ExamQuestion[];
      }
      setQuestions(qData);
      setAnswers({});
      setTimeLeft(exam.duration_minutes * 60);
      const localAttempts = loadLocalAttempts();
      const attempt: LocalAttempt = {
        id: crypto.randomUUID(),
        exam_id: exam.id,
        student_id: studentId,
        status: 'in_progress',
        started_at: new Date().toISOString(),
      };
      saveLocalAttempts([...localAttempts, attempt]);
      setExamStarted(true);
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) { if (timerRef.current) clearInterval(timerRef.current); submitExam(attempt.id); return 0; }
          return prev - 1;
        });
      }, 1000);
      return;
    }

    const { data: qDataRes } = await supabase
      .from('exam_questions')
      .select('*')
      .eq('exam_id', exam.id)
      .order('created_at');
    setQuestions(qDataRes || []);
    setAnswers({});
    setTimeLeft(exam.duration_minutes * 60);

    // Create attempt
    const { data: attempt } = await supabase.from('exam_attempts').insert({
      exam_id: exam.id,
      student_id: studentId,
      status: 'in_progress',
    }).select().single();

    if (attempt) {
      setExamStarted(true);
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) { if (timerRef.current) clearInterval(timerRef.current); submitExam(attempt.id); return 0; }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const submitExam = async (attemptId?: string) => {
    if (!activeExam) return;

    if (useLocal) {
      let localAttempts = loadLocalAttempts();
      let att = attemptId ? localAttempts.find((a) => a.id === attemptId) : localAttempts.find((a) => a.exam_id === activeExam.id && a.student_id === studentId);
      if (!att) return;
      let score = 0;
      questions.forEach((q) => {
        if (answers[q.id] === q.correct_key) score += q.marks;
      });
      const totalMarks = questions.reduce((s, q) => s + q.marks, 0);
      const pct = totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0;
      att = {
        ...att, submitted_at: new Date().toISOString(), score, total_marks: totalMarks, percentage: pct, status: 'submitted',
      };
      localAttempts = localAttempts.map((a) => a.id === att!.id ? att! : a);
      saveLocalAttempts(localAttempts);
      setResult({ score, total: totalMarks, pct, passed: pct >= activeExam.pass_percentage });
      setExamStarted(false);
      fetchData();
      return;
    }

    let attempt: ExamAttempt | null = null;
    if (!attemptId) {
      const { data: existing } = await supabase
        .from('exam_attempts')
        .select('*')
        .eq('exam_id', activeExam.id)
        .eq('student_id', studentId)
        .single();
      attempt = existing;
    }

    const attId = attemptId || attempt?.id;
    if (!attId) return;

    let score = 0;
    const answerRecords = questions.map((q) => {
      const selected = answers[q.id] || '';
      const correct = selected === q.correct_key;
      if (correct) score += q.marks;
      return {
        attempt_id: attId,
        question_id: q.id,
        selected_key: selected,
        is_correct: correct,
        marks_obtained: correct ? q.marks : 0,
      };
    });

    const totalMarks = questions.reduce((s, q) => s + q.marks, 0);
    const pct = totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0;

    await supabase.from('exam_answers').insert(answerRecords);
    await supabase.from('exam_attempts').update({
      submitted_at: new Date().toISOString(),
      score,
      total_marks: totalMarks,
      percentage: pct,
      status: 'submitted',
    }).eq('id', attId);

    setResult({ score, total: totalMarks, pct, passed: pct >= activeExam.pass_percentage });
    setExamStarted(false);

    // Send notification
    const { data: studentData } = await supabase.from('students').select('user_id').eq('id', studentId).single();
    if (studentData) {
      await supabase.from('notifications').insert({
        user_id: studentData.user_id,
        title: 'Exam Submitted',
        message: `You scored ${score}/${totalMarks} (${pct}%) in ${activeExam.title}`,
        type: pct >= activeExam.pass_percentage ? 'success' : 'warning',
      });
    }

    fetchData();
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const hasAttempted = (examId: string) => attempts.some((a) => a.exam_id === examId && (a.status === 'submitted' || a.status === 'graded'));

  if (loading) return <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>;

  if (result) {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 ${result.passed ? 'bg-success-100' : 'bg-danger-100'}`}>
          {result.passed ? <CheckCircle className="w-10 h-10 text-success-600" /> : <XCircle className="w-10 h-10 text-danger-600" />}
        </div>
        <h2 className="text-2xl font-bold text-neutral-900">{result.passed ? 'Passed!' : 'Not Passed'}</h2>
        <p className="text-neutral-500 mt-2">{activeExam?.title}</p>
        <div className="mt-6 p-6 bg-neutral-50 rounded-xl">
          <p className="text-4xl font-bold text-neutral-900">{result.score}/{result.total}</p>
          <p className="text-lg text-neutral-500 mt-1">{result.pct}%</p>
        </div>
        <button onClick={() => { setActiveExam(null); setResult(null); }}
          className="mt-6 px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
          Back to Exams
        </button>
      </div>
    );
  }

  if (activeExam && examStarted) {
    return (
      <div className="space-y-4">
        <div className="sticky top-0 bg-white border-b border-neutral-200 p-4 z-10 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-neutral-900">{activeExam.title}</h2>
            <p className="text-sm text-neutral-500">{questions.length} questions</p>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg font-bold ${timeLeft < 60 ? 'bg-danger-50 text-danger-700' : 'bg-neutral-50 text-neutral-700'}`}>
            <Clock className="w-5 h-5" />
            {formatTime(timeLeft)}
          </div>
        </div>

        <div className="space-y-4 p-4">
          {questions.map((q, qi) => (
            <div key={q.id} className="bg-white border border-neutral-200 rounded-xl p-5">
              <p className="font-medium text-neutral-900 mb-3">
                <span className="text-primary-600 mr-2">Q{qi + 1}.</span>
                {q.question_text}
              </p>
              <div className="space-y-2">
                {(q.options as { key: string; text: string }[]).map((opt) => (
                  <label key={opt.key}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      answers[q.id] === opt.key ? 'border-primary-500 bg-primary-50' : 'border-neutral-200 hover:bg-neutral-50'
                    }`}>
                    <input type="radio" name={`q-${q.id}`} value={opt.key}
                      checked={answers[q.id] === opt.key}
                      onChange={() => setAnswers({ ...answers, [q.id]: opt.key })}
                      className="accent-primary-600" />
                    <span className="text-sm text-neutral-700">{opt.text}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="sticky bottom-0 bg-white border-t border-neutral-200 p-4 flex justify-end">
          <Button onClick={() => submitExam()} icon={<CheckCircle className="w-4 h-4" />}>
            Submit Exam
          </Button>
        </div>
      </div>
    );
  }

  return (
    <SectionCard title="Online Exams" subtitle="Available MCQ tests">
      {exams.length === 0 ? (
        <p className="text-center text-neutral-400 py-8">No exams available</p>
      ) : (
        <div className="space-y-3">
          {exams.map((exam) => {
            const attempted = hasAttempted(exam.id);
            const att = attempts.find(a => a.exam_id === exam.id);
            return (
              <div key={exam.id} className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-semibold text-neutral-900">{exam.title}</h4>
                  <p className="text-sm text-neutral-500 mt-1">{exam.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-neutral-500">
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {exam.duration_minutes} min</span>
                    <span>{exam.total_marks} marks</span>
                    <span>Pass: {exam.pass_percentage}%</span>
                  </div>
                </div>
                <div className="text-right ml-4">
                  {attempted ? (
                    <div>
                      <Badge variant={att && att.percentage >= exam.pass_percentage ? 'success' : 'danger'}>
                        {att?.percentage}%
                      </Badge>
                      <p className="text-xs text-neutral-500 mt-1">Attempted</p>
                    </div>
                  ) : (
                    <Button onClick={() => startExam(exam)}>Start Exam</Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </SectionCard>
  );
}
