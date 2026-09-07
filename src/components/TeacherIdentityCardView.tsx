import React, { useRef, useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { supabase, IdentityCard as IdentityCardType } from '../lib/supabase';
import { School, MapPin, Phone, Calendar, Briefcase, BookOpen, Award } from 'lucide-react';

const COLOR_THEMES: Record<string, { primary: string; secondary: string; text: string; accent: string; light: string }> = {
  blue: { primary: '#1e40af', secondary: '#dbeafe', text: '#1e3a5f', accent: '#3b82f6', light: '#eff6ff' },
  green: { primary: '#166534', secondary: '#dcfce7', text: '#14532d', accent: '#22c55e', light: '#f0fdf4' },
  purple: { primary: '#6b21a8', secondary: '#f3e8ff', text: '#581c87', accent: '#a855f7', light: '#faf5ff' },
  red: { primary: '#991b1b', secondary: '#fee2e2', text: '#7f1d1d', accent: '#ef4444', light: '#fef2f2' },
  orange: { primary: '#9a3412', secondary: '#ffedd5', text: '#7c2d12', accent: '#f97316', light: '#fff7ed' },
  teal: { primary: '#0f766e', secondary: '#ccfbf1', text: '#115e59', accent: '#14b8a6', light: '#f0fdfa' },
  gold: { primary: '#92400e', secondary: '#fef3c7', text: '#78350f', accent: '#f59e0b', light: '#fffbeb' },
  indigo: { primary: '#3730a3', secondary: '#e0e7ff', text: '#312e81', accent: '#6366f1', light: '#eef2ff' },
  pink: { primary: '#9d174d', secondary: '#fce7f3', text: '#831843', accent: '#ec4899', light: '#fdf2f8' },
  rose: { primary: '#9f1239', secondary: '#ffe4e6', text: '#881337', accent: '#f43f5e', light: '#fff1f2' },
  cyan: { primary: '#0e7490', secondary: '#cffafe', text: '#155e75', accent: '#06b6d4', light: '#ecfeff' },
  slate: { primary: '#334155', secondary: '#e2e8f0', text: '#1e293b', accent: '#64748b', light: '#f8fafc' },
};

const CARD_COLORS = ['blue', 'green', 'purple', 'red', 'orange', 'teal', 'gold', 'indigo', 'pink', 'rose', 'cyan', 'slate'] as const;
const CARD_DESIGNS = ['modern', 'classic', 'minimal', 'premium', 'corporate', 'sport'] as const;
const FONT_OPTIONS = ['sans', 'serif', 'rounded'] as const;
const BORDER_OPTIONS = ['rounded', 'square', 'soft'] as const;

const FONT_STYLES: Record<string, string> = { sans: 'font-sans', serif: 'font-serif', rounded: 'font-sans tracking-wide' };
const BORDER_STYLES: Record<string, string> = { rounded: 'rounded-2xl', square: 'rounded-none', soft: 'rounded-xl' };

/* ─── Teacher Card Designs ─── */

function TeacherModernCard({ data, color, fontStyle, borderStyle }: { data: Record<string, string>; color: string; fontStyle: string; borderStyle: string }) {
  const theme = COLOR_THEMES[color] || COLOR_THEMES.blue;
  const font = FONT_STYLES[fontStyle] || FONT_STYLES.sans;
  const border = BORDER_STYLES[borderStyle] || BORDER_STYLES.rounded;
  return (
    <div className={`w-[340px] h-[540px] ${border} overflow-hidden shadow-xl relative ${font}`} style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})` }}>
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10" /><div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-white/10" />
      <div className="relative z-10 p-5 flex flex-col h-full">
        <div className="text-center text-white"><School className="w-8 h-8 mx-auto mb-1 opacity-80" /><h2 className="text-sm font-bold tracking-wide uppercase">Mr Pathak School</h2><div className="w-12 h-0.5 bg-white/50 mx-auto mt-1.5" /><p className="text-[10px] opacity-80 mt-1">Staff Identity Card</p></div>
        <div className="flex justify-center my-3"><div className="w-24 h-24 rounded-full border-4 border-white/60 bg-white/20 flex items-center justify-center"><span className="text-3xl font-bold text-white/80">{data.fullName?.charAt(0) || 'T'}</span></div></div>
        <div className="text-center text-white mb-3"><p className="text-lg font-bold">{data.fullName || ''}</p><p className="text-xs opacity-80">{data.department || ''} | {data.employeeId || ''}</p></div>
        <div className="flex-1 bg-white/95 rounded-xl p-3.5 space-y-2 text-xs" style={{ color: theme.text }}>
          <div className="flex items-center gap-2"><Briefcase className="w-3.5 h-3.5" style={{ color: theme.accent }} /><span>{data.qualification || 'N/A'}</span></div>
          <div className="flex items-center gap-2"><BookOpen className="w-3.5 h-3.5" style={{ color: theme.accent }} /><span>{data.department || 'N/A'}</span></div>
          <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" style={{ color: theme.accent }} /><span>{data.phone || 'N/A'}</span></div>
          <div className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5" style={{ color: theme.accent }} /><span>Joined: {data.joiningDate ? new Date(data.joiningDate).toLocaleDateString() : 'N/A'}</span></div>
          <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5" style={{ color: theme.accent }} /><span>{data.address || 'N/A'}</span></div>
        </div>
        <div className="text-center text-white/70 text-[10px] mt-2"><p>Valid for academic year 2025-2026</p><p className="font-bold text-white/90 mt-0.5">Mr Pathak School</p></div>
      </div>
    </div>
  );
}

function TeacherClassicCard({ data, color, fontStyle, borderStyle }: { data: Record<string, string>; color: string; fontStyle: string; borderStyle: string }) {
  const theme = COLOR_THEMES[color] || COLOR_THEMES.blue;
  const font = FONT_STYLES[fontStyle] || FONT_STYLES.sans;
  const border = BORDER_STYLES[borderStyle] || BORDER_STYLES.rounded;
  return (
    <div className={`w-[340px] h-[540px] ${border} overflow-hidden shadow-xl border-2 ${font}`} style={{ borderColor: theme.primary }}>
      <div className="p-4 text-white text-center" style={{ background: theme.primary }}><School className="w-7 h-7 mx-auto mb-1" /><h2 className="text-sm font-bold">Mr Pathak School</h2><p className="text-[10px] opacity-80">Staff Identity Card</p></div>
      <div className="p-4 flex flex-col items-center" style={{ background: theme.secondary }}>
        <div className="w-20 h-20 rounded-full border-3 overflow-hidden mb-2" style={{ borderColor: theme.primary }}>
          <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-white" style={{ background: theme.primary }}>{data.fullName?.charAt(0) || 'T'}</div>
        </div>
        <p className="text-base font-bold" style={{ color: theme.text }}>{data.fullName || ''}</p>
        <p className="text-xs opacity-70">{data.employeeId || ''}</p>
      </div>
      <div className="p-4 space-y-2 text-xs" style={{ color: theme.text }}>
        <div className="flex justify-between border-b border-neutral-200 pb-1.5"><span className="font-medium">Department</span><span>{data.department || 'N/A'}</span></div>
        <div className="flex justify-between border-b border-neutral-200 pb-1.5"><span className="font-medium">Qualification</span><span>{data.qualification || 'N/A'}</span></div>
        <div className="flex justify-between border-b border-neutral-200 pb-1.5"><span className="font-medium">Phone</span><span>{data.phone || 'N/A'}</span></div>
        <div className="flex justify-between"><span className="font-medium">Joined</span><span>{data.joiningDate ? new Date(data.joiningDate).toLocaleDateString() : 'N/A'}</span></div>
      </div>
      <div className="text-center py-2 text-white text-[10px]" style={{ background: theme.primary }}>Valid for academic year 2025-2026</div>
    </div>
  );
}

function TeacherMinimalCard({ data, color, fontStyle, borderStyle }: { data: Record<string, string>; color: string; fontStyle: string; borderStyle: string }) {
  const theme = COLOR_THEMES[color] || COLOR_THEMES.blue;
  const font = FONT_STYLES[fontStyle] || FONT_STYLES.sans;
  const border = BORDER_STYLES[borderStyle] || BORDER_STYLES.rounded;
  return (
    <div className={`w-[340px] h-[540px] ${border} overflow-hidden shadow-lg border ${font}`} style={{ borderColor: theme.primary + '30' }}>
      <div className="p-6 flex flex-col h-full">
        <div className="flex items-center gap-3 pb-4 border-b" style={{ borderColor: theme.secondary }}>
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: theme.primary }}><School className="w-5 h-5 text-white" /></div>
          <div><p className="text-sm font-bold" style={{ color: theme.text }}>Mr Pathak School</p><p className="text-[10px] opacity-60">Staff Identity Card</p></div>
        </div>
        <div className="flex items-center gap-4 py-4">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 flex-shrink-0" style={{ borderColor: theme.accent }}>
            <div className="w-full h-full flex items-center justify-center text-xl font-bold text-white" style={{ background: theme.accent }}>{data.fullName?.charAt(0) || 'T'}</div>
          </div>
          <div><p className="text-base font-bold" style={{ color: theme.text }}>{data.fullName || ''}</p><p className="text-xs opacity-70">{data.employeeId || ''}</p><p className="text-xs opacity-70">{data.department || ''}</p></div>
        </div>
        <div className="flex-1 space-y-2.5 text-xs">
          {[
            { label: 'Qualification', value: data.qualification || 'N/A' },
            { label: 'Phone', value: data.phone || 'N/A' },
            { label: 'Address', value: data.address || 'N/A' },
            { label: 'Joined', value: data.joiningDate ? new Date(data.joiningDate).toLocaleDateString() : 'N/A' },
          ].map((item) => (
            <div key={item.label} className="flex justify-between items-center py-1.5 px-3 rounded-lg" style={{ background: theme.secondary + '60' }}>
              <span className="font-medium opacity-70">{item.label}</span><span>{item.value}</span>
            </div>
          ))}
        </div>
        <div className="pt-3 text-center text-[10px] opacity-50 border-t" style={{ borderColor: theme.secondary }}><p>Mr Pathak School • Valid 2025-2026</p></div>
      </div>
    </div>
  );
}

function TeacherPremiumCard({ data, color, fontStyle, borderStyle }: { data: Record<string, string>; color: string; fontStyle: string; borderStyle: string }) {
  const theme = COLOR_THEMES[color] || COLOR_THEMES.blue;
  const font = FONT_STYLES[fontStyle] || FONT_STYLES.serif;
  const border = BORDER_STYLES[borderStyle] || BORDER_STYLES.soft;
  return (
    <div className={`w-[340px] h-[540px] ${border} overflow-hidden shadow-2xl relative ${font}`}>
      <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${theme.primary} 0%, ${theme.primary}dd 40%, ${theme.light} 40%, ${theme.light} 100%)` }} />
      <div className="absolute top-0 inset-x-0 h-1" style={{ background: `linear-gradient(90deg, ${theme.accent}, ${theme.primary}, ${theme.accent})` }} />
      <div className="relative z-10 p-5 flex flex-col h-full">
        <div className="text-center text-white"><Award className="w-7 h-7 mx-auto mb-1" style={{ color: theme.accent }} /><h2 className="text-sm font-bold tracking-wider uppercase" style={{ color: theme.accent }}>Mr Pathak</h2><p className="text-[9px] opacity-80 uppercase tracking-widest text-white">Public School</p><div className="mx-auto mt-2" style={{ width: 40, height: 2, background: theme.accent }} /><p className="text-[9px] text-white/70 mt-1">Staff Identity Card</p></div>
        <div className="flex justify-center mt-4 mb-3"><div className="w-20 h-20 rounded-full overflow-hidden border-2 p-0.5" style={{ borderColor: theme.accent }}><div className="w-full h-full rounded-full flex items-center justify-center text-2xl font-bold text-white" style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})` }}>{data.fullName?.charAt(0) || 'T'}</div></div></div>
        <div className="text-center mb-4"><p className="text-base font-bold" style={{ color: theme.text }}>{data.fullName || ''}</p><p className="text-xs" style={{ color: theme.accent }}>{data.employeeId || ''}</p><p className="text-xs opacity-70" style={{ color: theme.text }}>{data.department || ''}</p></div>
        <div className="flex-1 bg-white/90 rounded-lg p-3.5 space-y-2 text-xs shadow-inner border" style={{ borderColor: theme.secondary, color: theme.text }}>
          {[
            { icon: <Briefcase className="w-3.5 h-3.5" />, label: 'Qualification', value: data.qualification || 'N/A' },
            { icon: <Phone className="w-3.5 h-3.5" />, label: 'Phone', value: data.phone || 'N/A' },
            { icon: <Calendar className="w-3.5 h-3.5" />, label: 'Joined', value: data.joiningDate ? new Date(data.joiningDate).toLocaleDateString() : 'N/A' },
            { icon: <MapPin className="w-3.5 h-3.5" />, label: 'Address', value: data.address || 'N/A' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 pb-1.5" style={{ borderBottom: i < 3 ? `1px solid ${theme.secondary}` : 'none' }}>
              <span style={{ color: theme.accent }}>{item.icon}</span><span className="font-medium opacity-70">{item.label}:</span><span className="ml-auto">{item.value}</span>
            </div>
          ))}
        </div>
        <div className="text-center pt-2"><p className="text-[9px] opacity-60" style={{ color: theme.text }}>Valid for academic year 2025-2026</p><p className="text-[9px] font-bold mt-0.5" style={{ color: theme.primary }}>Mr Pathak School</p></div>
      </div>
    </div>
  );
}

function TeacherCorporateCard({ data, color, fontStyle, borderStyle }: { data: Record<string, string>; color: string; fontStyle: string; borderStyle: string }) {
  const theme = COLOR_THEMES[color] || COLOR_THEMES.blue;
  const font = FONT_STYLES[fontStyle] || FONT_STYLES.sans;
  const border = BORDER_STYLES[borderStyle] || BORDER_STYLES.square;
  return (
    <div className={`w-[340px] h-[540px] ${border} overflow-hidden shadow-xl flex flex-col ${font}`}>
      <div className="flex items-stretch flex-1">
        <div className="w-20 flex flex-col items-center justify-center text-white p-2" style={{ background: theme.primary }}>
          <School className="w-6 h-6 mb-2" />
          <div className="text-[9px] font-bold uppercase tracking-widest" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>STAFF ID</div>
        </div>
        <div className="flex-1 flex flex-col p-4" style={{ background: theme.light }}>
          <div className="text-right mb-3"><p className="text-xs font-bold uppercase tracking-wider" style={{ color: theme.primary }}>Mr Pathak</p><p className="text-[8px] opacity-60" style={{ color: theme.text }}>Public School</p></div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-14 h-14 rounded overflow-hidden border" style={{ borderColor: theme.accent }}>
              <div className="w-full h-full flex items-center justify-center text-lg font-bold text-white" style={{ background: theme.accent }}>{data.fullName?.charAt(0) || 'T'}</div>
            </div>
            <div><p className="font-bold text-sm" style={{ color: theme.text }}>{data.fullName || ''}</p><p className="text-xs opacity-70">{data.employeeId || ''}</p></div>
          </div>
          <div className="flex-1 space-y-1.5 text-xs">
            {[
              { label: 'Department', value: data.department || 'N/A' },
              { label: 'Qualification', value: data.qualification || 'N/A' },
              { label: 'Phone', value: data.phone || 'N/A' },
              { label: 'Joined', value: data.joiningDate ? new Date(data.joiningDate).toLocaleDateString() : 'N/A' },
            ].map((item) => (
              <div key={item.label} className="flex justify-between py-1 px-2 bg-white rounded" style={{ borderLeft: `3px solid ${theme.accent}` }}>
                <span className="font-medium opacity-60 text-[10px]">{item.label}</span><span style={{ color: theme.text }}>{item.value}</span>
              </div>
            ))}
          </div>
          <div className="mt-2 pt-2 text-center border-t border-neutral-200"><p className="text-[8px] opacity-60">{data.address || 'N/A'}</p></div>
        </div>
      </div>
      <div className="py-1.5 text-center text-white text-[8px] uppercase tracking-wider" style={{ background: theme.primary }}>Valid 2025-2026 • Mr Pathak School</div>
    </div>
  );
}

function TeacherSportCard({ data, color, fontStyle, borderStyle }: { data: Record<string, string>; color: string; fontStyle: string; borderStyle: string }) {
  const theme = COLOR_THEMES[color] || COLOR_THEMES.blue;
  const font = FONT_STYLES[fontStyle] || FONT_STYLES.rounded;
  const border = BORDER_STYLES[borderStyle] || BORDER_STYLES.soft;
  return (
    <div className={`w-[340px] h-[540px] ${border} overflow-hidden shadow-xl relative ${font}`} style={{ background: theme.primary }}>
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-white/8 rotate-12" style={{ background: `${theme.accent}15` }} />
      <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 -rotate-12" style={{ background: `${theme.accent}10` }} />
      <div className="absolute top-32 -right-4 w-24 h-full bg-white/5 skew-y-6" style={{ background: `${theme.accent}08` }} />
      <div className="relative z-10 p-4 flex flex-col h-full">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center"><School className="w-4 h-4 text-white" /></div><div><p className="text-xs font-black uppercase tracking-wide text-white">Mr Pathak</p><p className="text-[8px] opacity-70 text-white">Public School</p></div></div>
          <div className="bg-white/20 rounded-full px-2.5 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider">STAFF</div>
        </div>
        <div className="flex justify-center my-2"><div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-white/40 bg-white/10 rotate-45"><div className="-rotate-45 w-full h-full"><div className="w-full h-full flex items-center justify-center text-2xl font-bold text-white/80">{data.fullName?.charAt(0) || 'T'}</div></div></div></div>
        <div className="text-center text-white mb-3"><p className="text-lg font-black uppercase tracking-wider">{data.fullName || ''}</p><div className="inline-flex items-center gap-2 bg-white/15 rounded-full px-3 py-0.5 mt-1"><p className="text-xs font-bold">#{data.employeeId || ''}</p><span className="w-1 h-1 rounded-full bg-white/60" /><p className="text-xs">{data.department || ''}</p></div></div>
        <div className="flex-1 bg-white/95 rounded-xl p-3 space-y-1.5 text-xs" style={{ color: theme.text }}>
          {[
            { label: 'Qualification', value: data.qualification || 'N/A', icon: Briefcase },
            { label: 'Contact', value: data.phone || 'N/A', icon: Phone },
            { label: 'Department', value: data.department || 'N/A', icon: BookOpen },
            { label: 'Address', value: data.address || 'N/A', icon: MapPin },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2 py-1 px-2 rounded-lg" style={{ background: theme.secondary + '40' }}>
              <item.icon className="w-3 h-3" style={{ color: theme.accent }} />
              <span className="font-medium text-[10px] uppercase tracking-wider opacity-60">{item.label}</span>
              <span className="ml-auto font-semibold">{item.value}</span>
            </div>
          ))}
          <div className="flex items-center gap-2 py-1 px-2"><Calendar className="w-3 h-3" style={{ color: theme.accent }} /><span className="font-medium text-[10px] uppercase tracking-wider opacity-60">Joined</span><span className="ml-auto font-semibold">{data.joiningDate ? new Date(data.joiningDate).toLocaleDateString() : 'N/A'}</span></div>
        </div>
        <div className="text-center mt-1.5"><div className="inline-block bg-white/15 rounded-full px-4 py-0.5"><p className="text-[8px] font-bold uppercase tracking-widest text-white">Valid 2025-2026</p></div></div>
      </div>
    </div>
  );
}

function TeacherCard({ data, color, design, fontStyle, borderStyle }: { data: Record<string, string>; color: string; design: string; fontStyle: string; borderStyle: string }) {
  switch (design) {
    case 'classic': return <TeacherClassicCard {...{ data, color, fontStyle, borderStyle }} />;
    case 'minimal': return <TeacherMinimalCard {...{ data, color, fontStyle, borderStyle }} />;
    case 'premium': return <TeacherPremiumCard {...{ data, color, fontStyle, borderStyle }} />;
    case 'corporate': return <TeacherCorporateCard {...{ data, color, fontStyle, borderStyle }} />;
    case 'sport': return <TeacherSportCard {...{ data, color, fontStyle, borderStyle }} />;
    default: return <TeacherModernCard {...{ data, color, fontStyle, borderStyle }} />;
  }
}

export function TeacherIdentityCardView() {
  const { currentUser } = useApp();
  const cardRef = useRef<HTMLDivElement>(null);
  const [color, setColor] = useState('blue');
  const [design, setDesign] = useState('modern');
  const [fontStyle, setFontStyle] = useState('sans');
  const [borderStyle, setBorderStyle] = useState('rounded');
  const [savedCard, setSavedCard] = useState<IdentityCardType | null>(null);
  const [loading, setLoading] = useState(true);

  const teacher = currentUser?.teacher;
  const userId = currentUser?.user.id;

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    const fetchCard = async () => {
      const { data } = await supabase.from('identity_cards').select('*').eq('user_id', userId).single();
      if (data) {
        setSavedCard(data);
        setColor(data.color_theme);
        setDesign(data.design_type);
        const cd = data.card_data as any;
        if (cd.fontStyle) setFontStyle(cd.fontStyle);
        if (cd.borderStyle) setBorderStyle(cd.borderStyle);
      }
      setLoading(false);
    };
    fetchCard();
  }, [userId]);

  const savedCardData = savedCard?.card_data || {};
  const autoData = teacher ? { fullName: currentUser!.user.full_name, employeeId: teacher.employee_id, department: teacher.department || '', qualification: teacher.qualification || '', joiningDate: teacher.joining_date, phone: currentUser!.user.phone || '', address: '' } : null;
  const displayData = savedCardData as Record<string, string>;
  const hasSavedData = savedCard && displayData.fullName;
  const hasAutoData = autoData && autoData.fullName;
  const cardFields = hasSavedData ? displayData : (autoData as Record<string, string>);

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow || !cardRef.current) return;
    printWindow.document.write(`<html><head><title>Identity Card - ${cardFields.fullName || currentUser?.user.full_name || ''}</title><style>body{display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}</style></head><body>${cardRef.current.innerHTML}</body></html>`);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
  };

  if (loading) return <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>;
  if (!hasSavedData && !hasAutoData) return <div className="text-center py-12 text-neutral-400">No teacher data available.</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-neutral-900">My Identity Card{savedCard && <span className="ml-2 text-sm font-normal text-success-600">(Generated by Admin)</span>}</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
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
              <div className="grid grid-cols-3 gap-2">
                {CARD_DESIGNS.map((d) => (
                  <button key={d} onClick={() => setDesign(d)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all capitalize ${design === d ? 'bg-primary-600 text-white shadow-md' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 border border-neutral-200'}`}>{d}</button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><h3 className="font-semibold text-neutral-900 mb-2 text-sm">Font</h3><div className="flex gap-1.5">{FONT_OPTIONS.map((f) => (<button key={f} onClick={() => setFontStyle(f)} className={`flex-1 px-2 py-2 rounded-lg text-xs font-medium transition-all capitalize ${fontStyle === f ? 'bg-primary-600 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}>{f}</button>))}</div></div>
              <div><h3 className="font-semibold text-neutral-900 mb-2 text-sm">Border</h3><div className="flex gap-1.5">{BORDER_OPTIONS.map((b) => (<button key={b} onClick={() => setBorderStyle(b)} className={`flex-1 px-2 py-2 rounded-lg text-xs font-medium transition-all capitalize ${borderStyle === b ? 'bg-primary-600 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}>{b}</button>))}</div></div>
            </div>
            {savedCard && <p className="text-xs text-neutral-500 text-center">This card was issued by the administration.</p>}
          </div>
          <button onClick={handlePrint} className="w-full px-4 py-2.5 bg-neutral-800 text-white rounded-xl font-medium hover:bg-neutral-900 transition-colors">🖨 Print Identity Card</button>
        </div>
        <div className="flex flex-col items-center justify-start" ref={cardRef}>
          <TeacherCard data={cardFields} color={color} design={design} fontStyle={fontStyle} borderStyle={borderStyle} />
        </div>
      </div>
    </div>
  );
}
