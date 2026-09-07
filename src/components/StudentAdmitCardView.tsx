import React, { useRef, useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { AdmitCard } from './AdmitCardGenerator';
import { supabase, AdmitCard as AdmitCardRow, ExamSchedule } from '../lib/supabase';
import { Calendar, Clock, MapPin, BookOpen, Download, Trash2 } from 'lucide-react';

const CARD_COLORS = ['blue', 'green', 'purple', 'red', 'orange', 'teal', 'gold', 'indigo', 'pink', 'rose', 'cyan', 'slate'] as const;
const CARD_DESIGNS = ['modern', 'classic', 'minimal', 'premium', 'corporate', 'sport'] as const;
const FONT_OPTIONS = ['sans', 'serif', 'rounded'] as const;
const BORDER_OPTIONS = ['rounded', 'square', 'soft'] as const;
const COLOR_THEMES: Record<string, { primary: string }> = {
  blue: { primary: '#1e40af' }, green: { primary: '#166534' }, purple: { primary: '#6b21a8' },
  red: { primary: '#991b1b' }, orange: { primary: '#9a3412' }, teal: { primary: '#0f766e' },
  gold: { primary: '#92400e' }, indigo: { primary: '#3730a3' }, pink: { primary: '#9d174d' },
  rose: { primary: '#9f1239' }, cyan: { primary: '#0e7490' }, slate: { primary: '#334155' },
};

function loadAdmitLocal(): any[] {
  try { return JSON.parse(localStorage.getItem('admit_cards_local') || '[]'); } catch { return []; }
}

function getExamSchedulesLocal(): any[] {
  try { return JSON.parse(localStorage.getItem('exam_schedules_local') || '[]'); } catch { return []; }
}

export function StudentAdmitCardView() {
  const { currentUser } = useApp();
  const cardRef = useRef<HTMLDivElement>(null);
  const [admitCards, setAdmitCards] = useState<(AdmitCardRow & { exam_schedule?: ExamSchedule & { subject?: { name: string; code: string } } })[]>([]);
  const [selectedCard, setSelectedCard] = useState<AdmitCardRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [color, setColor] = useState('blue');
  const [design, setDesign] = useState('modern');
  const [fontStyle, setFontStyle] = useState('sans');
  const [borderStyle, setBorderStyle] = useState('rounded');

  const studentId = currentUser?.student?.id;

  useEffect(() => {
    if (studentId) fetchAdmitCards();
    else setLoading(false);
  }, [studentId]);

  const fetchAdmitCards = async () => {
    if (!studentId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('admit_cards')
      .select(`*, exam_schedule:exam_schedules(*, subject:subjects(name, code))`)
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });
    let cards = data as any || [];
    if ((error && error.message?.includes('schema cache')) || !data) {
      const local = loadAdmitLocal().filter((c) => c.student_id === studentId);
      const localExams = getExamSchedulesLocal();
      cards = local.map((c) => ({
        ...c,
        exam_schedule: localExams.find((e) => e.id === c.exam_schedule_id),
      }));
    }
    setAdmitCards(cards);
    if (cards.length > 0) {
      setSelectedCard(cards[0]);
      setColor(cards[0].color_theme);
      setDesign(cards[0].design_type);
      const cd = cards[0].card_data as any;
      if (cd.fontStyle) setFontStyle(cd.fontStyle);
      if (cd.borderStyle) setBorderStyle(cd.borderStyle);
    }
    setLoading(false);
  };

  const selectCard = (card: AdmitCardRow) => {
    setSelectedCard(card);
    setColor(card.color_theme);
    setDesign(card.design_type);
    const cd = card.card_data as any;
    if (cd.fontStyle) setFontStyle(cd.fontStyle);
    if (cd.borderStyle) setBorderStyle(cd.borderStyle);
  };

  const buildDisplayData = (card: AdmitCardRow) => {
    const cd = card.card_data as any;
    const exam = (card as any).exam_schedule;
    return {
      fullName: cd.fullName || currentUser?.user.full_name || '',
      rollNumber: cd.rollNumber || currentUser?.student?.roll_number || '',
      className: cd.className || currentUser?.student?.class?.name || '',
      section: cd.section || currentUser?.student?.class?.section || '',
      guardianName: cd.guardianName || currentUser?.student?.guardian_name || '',
      guardianPhone: cd.guardianPhone || currentUser?.student?.guardian_phone || '',
      address: cd.address || currentUser?.student?.address || '',
      examTitle: cd.examTitle || exam?.title || '',
      examDate: cd.examDate || exam?.exam_date || '',
      startTime: cd.startTime || exam?.start_time || '',
      endTime: cd.endTime || exam?.end_time || '',
      room: cd.room || exam?.room || '',
      subjectName: cd.subjectName || exam?.subject?.name || '',
      subjectCode: cd.subjectCode || exam?.subject?.code || '',
      totalMarks: cd.totalMarks || exam?.total_marks || 0,
      examType: cd.examType || exam?.type || '',
      photoUrl: cd.photoUrl,
    };
  };

  const handlePrint = () => {
    if (!cardRef.current || !selectedCard) return;
    const data = buildDisplayData(selectedCard);
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`<html><head><title>Admit Card - ${data.fullName}</title><style>body{display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}</style></head><body>${cardRef.current.innerHTML}</body></html>`);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
  };

  if (loading) {
    return <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>;
  }

  if (admitCards.length === 0) {
    return (
      <div className="text-center py-16 text-neutral-400">
        <div className="w-20 h-28 mx-auto mb-4 rounded-xl border-2 border-dashed border-neutral-300 flex items-center justify-center">
          <span className="text-4xl">🎫</span>
        </div>
        <p className="font-medium text-neutral-600">No admit cards generated yet</p>
        <p className="text-sm mt-1">Admit cards will appear here once generated by the administration.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-neutral-900">My Admit Cards</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          {/* Card list */}
          <div className="bg-white border border-neutral-200 rounded-xl p-4 space-y-3">
            <h3 className="font-semibold text-neutral-900 text-sm mb-2">Generated Admit Cards</h3>
            {admitCards.map((card) => {
              const cd = card.card_data as any;
              const exam = (card as any).exam_schedule;
              const isSelected = selectedCard?.id === card.id;
              return (
                <button
                  key={card.id}
                  onClick={() => selectCard(card)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    isSelected ? 'border-primary-400 bg-primary-50' : 'border-neutral-200 hover:bg-neutral-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center shrink-0">
                      <BookOpen className="w-5 h-5 text-primary-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-neutral-900 truncate">{cd.examTitle || exam?.title || 'Admit Card'}</p>
                      <p className="text-xs text-neutral-500">
                        {cd.subjectName || exam?.subject?.name} - {new Date(cd.examDate || exam?.exam_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Customization */}
          {selectedCard && (
            <div className="bg-white border border-neutral-200 rounded-xl p-6 space-y-5">
              <div>
                <h3 className="font-semibold text-neutral-900 mb-3">Color Theme</h3>
                <div className="flex flex-wrap gap-2">
                  {CARD_COLORS.map((c) => (
                    <button key={c} onClick={() => setColor(c)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${color === c ? 'border-neutral-900 scale-110 ring-2 ring-offset-1 ring-neutral-900' : 'border-transparent hover:scale-105'}`}
                      style={{ background: COLOR_THEMES[c].primary }} title={c} />
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900 mb-3">Design</h3>
                <div className="grid grid-cols-6 gap-2">
                  {CARD_DESIGNS.map((d) => (
                    <button key={d} onClick={() => setDesign(d)}
                      className={`px-2 py-2 rounded-lg text-xs font-medium transition-all capitalize ${design === d ? 'bg-primary-600 text-white shadow-md' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 border border-neutral-200'}`}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-2 text-sm">Font</h3>
                  <div className="flex gap-1.5">
                    {FONT_OPTIONS.map((f) => (
                      <button key={f} onClick={() => setFontStyle(f)}
                        className={`flex-1 px-2 py-2 rounded-lg text-xs font-medium transition-all capitalize ${fontStyle === f ? 'bg-primary-600 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}>
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-2 text-sm">Border</h3>
                  <div className="flex gap-1.5">
                    {BORDER_OPTIONS.map((b) => (
                      <button key={b} onClick={() => setBorderStyle(b)}
                        className={`flex-1 px-2 py-2 rounded-lg text-xs font-medium transition-all capitalize ${borderStyle === b ? 'bg-primary-600 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}>
                        {b}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <button onClick={handlePrint} className="w-full px-4 py-2.5 bg-neutral-800 text-white rounded-xl font-medium hover:bg-neutral-900 transition-colors">
                🖨 Print Admit Card
              </button>
            </div>
          )}
        </div>

        {/* Preview */}
        <div className="flex flex-col items-center justify-start lg:sticky lg:top-6 space-y-4">
          {selectedCard ? (
            <>
              <div ref={cardRef}>
                <AdmitCard
                  data={buildDisplayData(selectedCard)}
                  color={color}
                  design={design}
                  fontStyle={fontStyle}
                  borderStyle={borderStyle}
                />
              </div>
              {selectedCard && (
                <div className="text-xs text-neutral-400 text-center">
                  <p>Generated by administration</p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20 text-neutral-400">
              <div className="w-20 h-28 mx-auto mb-4 rounded-xl border-2 border-dashed border-neutral-300 flex items-center justify-center">
                <span className="text-4xl">🎫</span>
              </div>
              <p className="font-medium">Select an admit card from the list</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
