import React, { useRef, useState, useEffect } from 'react';
import { School, MapPin, Phone, Calendar, Search, Award, Star, User } from 'lucide-react';
import { supabase, IdentityCard as IdentityCardRow } from '../lib/supabase';
import { useToastStore } from '../hooks/useToast';
import { useApp } from '../contexts/AppContext';

interface StudentCardData {
  fullName: string;
  rollNumber: string;
  className: string;
  section: string;
  guardianName: string;
  guardianPhone: string;
  address: string;
  admissionDate: string;
  bloodGroup?: string;
  photoUrl?: string;
}

interface IdentityCardProps {
  data: StudentCardData;
  color: string;
  design: string;
  fontStyle?: string;
  borderStyle?: string;
}

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

const FONT_STYLES: Record<string, string> = {
  sans: 'font-sans',
  serif: 'font-serif',
  rounded: 'font-sans tracking-wide',
};

const BORDER_STYLES: Record<string, string> = {
  rounded: 'rounded-2xl',
  square: 'rounded-none',
  soft: 'rounded-xl',
};

/* ─── Card Designs ─── */

function ModernCard({ data, color, fontStyle, borderStyle }: IdentityCardProps) {
  const theme = COLOR_THEMES[color] || COLOR_THEMES.blue;
  const font = FONT_STYLES[fontStyle || 'sans'];
  const border = BORDER_STYLES[borderStyle || 'rounded'];
  return (
    <div className={`w-[340px] h-[540px] ${border} overflow-hidden shadow-xl relative ${font}`} style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})` }}>
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10" />
      <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-white/10" />
      <div className="absolute top-20 -left-5 w-20 h-20 rounded-full bg-white/5" />
      <div className="relative z-10 p-5 flex flex-col h-full">
        <div className="text-center text-white">
          <School className="w-8 h-8 mx-auto mb-1 opacity-80" />
          <h2 className="text-sm font-bold tracking-wide uppercase">Mr Pathak School</h2>
          <div className="w-12 h-0.5 bg-white/50 mx-auto mt-1.5" />
        </div>
        <div className="flex justify-center my-3">
          {data.photoUrl ? (
            <img src={data.photoUrl} alt="" className="w-24 h-24 rounded-full border-4 border-white/60 object-cover" />
          ) : (
            <div className="w-24 h-24 rounded-full border-4 border-white/60 bg-white/20 flex items-center justify-center">
              <span className="text-3xl font-bold text-white/80">{data.fullName.charAt(0)}</span>
            </div>
          )}
        </div>
        <div className="text-center text-white mb-3">
          <p className="text-lg font-bold">{data.fullName}</p>
          <p className="text-xs opacity-80">Class {data.className}-{data.section} | Roll: {data.rollNumber}</p>
        </div>
        <div className="flex-1 bg-white/95 rounded-xl p-3.5 space-y-2 text-xs" style={{ color: theme.text }}>
          <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5" style={{ color: theme.accent }} /><span>{data.address || 'N/A'}</span></div>
          <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" style={{ color: theme.accent }} /><span>{data.guardianPhone}</span></div>
          <div className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5" style={{ color: theme.accent }} /><span>Admitted: {new Date(data.admissionDate).toLocaleDateString()}</span></div>
          {data.bloodGroup && <div className="flex items-center gap-2"><span className="w-3.5 h-3.5 flex items-center justify-center text-xs font-bold" style={{ color: theme.accent }}>🩸</span><span>Blood: {data.bloodGroup}</span></div>}
        </div>
        <div className="text-center text-white/70 text-[10px] mt-2">
          <p>Valid for academic year 2025-2026</p>
          <p className="font-bold text-white/90 mt-0.5">Mr Pathak School</p>
        </div>
      </div>
    </div>
  );
}

function ClassicCard({ data, color, fontStyle, borderStyle }: IdentityCardProps) {
  const theme = COLOR_THEMES[color] || COLOR_THEMES.blue;
  const font = FONT_STYLES[fontStyle || 'sans'];
  const border = BORDER_STYLES[borderStyle || 'rounded'];
  return (
    <div className={`w-[340px] h-[540px] ${border} overflow-hidden shadow-xl border-2 ${font}`} style={{ borderColor: theme.primary }}>
      <div className="p-4 text-white text-center" style={{ background: theme.primary }}>
        <School className="w-7 h-7 mx-auto mb-1" />
        <h2 className="text-sm font-bold">Mr Pathak School</h2>
        <p className="text-[10px] opacity-80">Student Identity Card</p>
      </div>
      <div className="p-4 flex flex-col items-center" style={{ background: theme.secondary }}>
        <div className="w-20 h-20 rounded-full border-3 overflow-hidden mb-2" style={{ borderColor: theme.primary }}>
          {data.photoUrl ? (
            <img src={data.photoUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-white" style={{ background: theme.primary }}>{data.fullName.charAt(0)}</div>
          )}
        </div>
        <p className="text-base font-bold" style={{ color: theme.text }}>{data.fullName}</p>
        <p className="text-xs opacity-70 mb-3">Class {data.className}-{data.section} | Roll: {data.rollNumber}</p>
      </div>
      <div className="p-4 space-y-2 text-xs" style={{ color: theme.text }}>
        <div className="flex justify-between border-b border-neutral-200 pb-1.5"><span className="font-medium">Guardian</span><span>{data.guardianName}</span></div>
        <div className="flex justify-between border-b border-neutral-200 pb-1.5"><span className="font-medium">Phone</span><span>{data.guardianPhone}</span></div>
        <div className="flex justify-between border-b border-neutral-200 pb-1.5"><span className="font-medium">Address</span><span className="text-right max-w-[180px]">{data.address || 'N/A'}</span></div>
        {data.bloodGroup && <div className="flex justify-between border-b border-neutral-200 pb-1.5"><span className="font-medium">Blood Group</span><span>{data.bloodGroup}</span></div>}
        <div className="flex justify-between"><span className="font-medium">Admission</span><span>{new Date(data.admissionDate).toLocaleDateString()}</span></div>
      </div>
      <div className="text-center py-2 text-white text-[10px]" style={{ background: theme.primary }}>Valid for academic year 2025-2026</div>
    </div>
  );
}

function MinimalCard({ data, color, fontStyle, borderStyle }: IdentityCardProps) {
  const theme = COLOR_THEMES[color] || COLOR_THEMES.blue;
  const font = FONT_STYLES[fontStyle || 'sans'];
  const border = BORDER_STYLES[borderStyle || 'rounded'];
  return (
    <div className={`w-[340px] h-[540px] ${border} overflow-hidden shadow-lg border ${font}`} style={{ borderColor: theme.primary + '30' }}>
      <div className="p-6 flex flex-col h-full">
        <div className="flex items-center gap-3 pb-4 border-b" style={{ borderColor: theme.secondary }}>
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: theme.primary }}><School className="w-5 h-5 text-white" /></div>
          <div><p className="text-sm font-bold" style={{ color: theme.text }}>Mr Pathak School</p><p className="text-[10px] opacity-60">Student Identity Card</p></div>
        </div>
        <div className="flex items-center gap-4 py-4">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 flex-shrink-0" style={{ borderColor: theme.accent }}>
            {data.photoUrl ? <img src={data.photoUrl} alt="" className="w-full h-full object-cover" /> : (
              <div className="w-full h-full flex items-center justify-center text-xl font-bold text-white" style={{ background: theme.accent }}>{data.fullName.charAt(0)}</div>
            )}
          </div>
          <div><p className="text-base font-bold" style={{ color: theme.text }}>{data.fullName}</p><p className="text-xs opacity-70">Roll: {data.rollNumber}</p><p className="text-xs opacity-70">Class {data.className}-{data.section}</p></div>
        </div>
        <div className="flex-1 space-y-2.5 text-xs">
          {[
            { label: 'Guardian', value: data.guardianName },
            { label: 'Phone', value: data.guardianPhone },
            { label: 'Address', value: data.address || 'N/A' },
            { label: 'Blood Group', value: data.bloodGroup || 'N/A' },
            { label: 'Admission', value: new Date(data.admissionDate).toLocaleDateString() },
          ].map((item) => (
            <div key={item.label} className="flex justify-between items-center py-1.5 px-3 rounded-lg" style={{ background: theme.secondary + '60' }}>
              <span className="font-medium opacity-70">{item.label}</span><span>{item.value}</span>
            </div>
          ))}
        </div>
        <div className="pt-3 text-center text-[10px] opacity-50 border-t" style={{ borderColor: theme.secondary }}>
          <p>Mr Pathak School • Valid 2025-2026</p>
        </div>
      </div>
    </div>
  );
}

function PremiumCard({ data, color, fontStyle, borderStyle }: IdentityCardProps) {
  const theme = COLOR_THEMES[color] || COLOR_THEMES.blue;
  const font = FONT_STYLES[fontStyle || 'serif'];
  const border = BORDER_STYLES[borderStyle || 'soft'];
  return (
    <div className={`w-[340px] h-[540px] ${border} overflow-hidden shadow-2xl relative ${font}`}>
      <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${theme.primary} 0%, ${theme.primary}dd 40%, ${theme.light} 40%, ${theme.light} 100%)` }} />
      <div className="absolute top-0 inset-x-0 h-1" style={{ background: `linear-gradient(90deg, ${theme.accent}, ${theme.primary}, ${theme.accent})` }} />
      <div className="relative z-10 p-5 flex flex-col h-full">
        <div className="text-center text-white">
          <Award className="w-7 h-7 mx-auto mb-1" style={{ color: theme.accent }} />
          <h2 className="text-sm font-bold tracking-wider uppercase" style={{ color: theme.accent }}>Mr Pathak</h2>
          <p className="text-[9px] opacity-80 uppercase tracking-widest text-white">Public School</p>
          <div className="mx-auto mt-2" style={{ width: 40, height: 2, background: theme.accent }} />
        </div>
        <div className="flex justify-center mt-4 mb-3">
          <div className="w-20 h-20 rounded-full overflow-hidden border-2 p-0.5" style={{ borderColor: theme.accent }}>
            {data.photoUrl ? (
              <img src={data.photoUrl} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              <div className="w-full h-full rounded-full flex items-center justify-center text-2xl font-bold text-white" style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})` }}>
                {data.fullName.charAt(0)}
              </div>
            )}
          </div>
        </div>
        <div className="text-center mb-4">
          <p className="text-base font-bold" style={{ color: theme.text }}>{data.fullName}</p>
          <p className="text-xs" style={{ color: theme.accent }}>Roll: {data.rollNumber}</p>
          <p className="text-xs opacity-70" style={{ color: theme.text }}>Class {data.className}-{data.section}</p>
        </div>
        <div className="flex-1 bg-white/90 rounded-lg p-3.5 space-y-2 text-xs shadow-inner border" style={{ borderColor: theme.secondary, color: theme.text }}>
          {[
            { icon: <User className="w-3.5 h-3.5" />, label: 'Guardian', value: data.guardianName },
            { icon: <Phone className="w-3.5 h-3.5" />, label: 'Phone', value: data.guardianPhone },
            { icon: <MapPin className="w-3.5 h-3.5" />, label: 'Address', value: data.address || 'N/A' },
            { icon: <Calendar className="w-3.5 h-3.5" />, label: 'Admission', value: new Date(data.admissionDate).toLocaleDateString() },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 pb-1.5" style={{ borderBottom: i < 3 ? `1px solid ${theme.secondary}` : 'none' }}>
              <span style={{ color: theme.accent }}>{item.icon}</span>
              <span className="font-medium opacity-70">{item.label}:</span>
              <span className="ml-auto">{item.value}</span>
            </div>
          ))}
        </div>
        <div className="text-center pt-2">
          <p className="text-[9px] opacity-60" style={{ color: theme.text }}>Valid for academic year 2025-2026</p>
          <div className="flex items-center justify-center gap-1 mt-0.5">
            <Star className="w-2.5 h-2.5" style={{ color: theme.accent }} fill={theme.accent} />
            <p className="text-[9px] font-bold" style={{ color: theme.primary }}>Mr Pathak School</p>
            <Star className="w-2.5 h-2.5" style={{ color: theme.accent }} fill={theme.accent} />
          </div>
        </div>
      </div>
    </div>
  );
}

function CorporateCard({ data, color, fontStyle, borderStyle }: IdentityCardProps) {
  const theme = COLOR_THEMES[color] || COLOR_THEMES.blue;
  const font = FONT_STYLES[fontStyle || 'sans'];
  const border = BORDER_STYLES[borderStyle || 'square'];
  return (
    <div className={`w-[340px] h-[540px] ${border} overflow-hidden shadow-xl flex flex-col ${font}`}>
      <div className="flex items-stretch flex-1">
        <div className="w-20 flex flex-col items-center justify-center text-white p-2" style={{ background: theme.primary }}>
          <School className="w-6 h-6 mb-2" />
          <div className="text-[9px] font-bold uppercase tracking-widest" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>STUDENT ID</div>
        </div>
        <div className="flex-1 flex flex-col p-4" style={{ background: theme.light }}>
          <div className="text-right mb-3">
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: theme.primary }}>Mr Pathak</p>
            <p className="text-[8px] opacity-60" style={{ color: theme.text }}>Public School</p>
          </div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-14 h-14 rounded overflow-hidden border" style={{ borderColor: theme.accent }}>
              {data.photoUrl ? (
                <img src={data.photoUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-lg font-bold text-white" style={{ background: theme.accent }}>{data.fullName.charAt(0)}</div>
              )}
            </div>
            <div>
              <p className="font-bold text-sm" style={{ color: theme.text }}>{data.fullName}</p>
              <p className="text-xs opacity-70">{data.rollNumber}</p>
            </div>
          </div>
          <div className="flex-1 space-y-1.5 text-xs">
            {[
              { label: 'Class', value: `${data.className}-${data.section}` },
              { label: 'Guardian', value: data.guardianName },
              { label: 'Phone', value: data.guardianPhone },
              { label: 'Blood', value: data.bloodGroup || 'N/A' },
            ].map((item) => (
              <div key={item.label} className="flex justify-between py-1 px-2 bg-white rounded" style={{ borderLeft: `3px solid ${theme.accent}` }}>
                <span className="font-medium opacity-60 text-[10px]">{item.label}</span>
                <span style={{ color: theme.text }}>{item.value}</span>
              </div>
            ))}
          </div>
          <div className="mt-2 pt-2 text-center border-t border-neutral-200">
            <p className="text-[8px] opacity-60">{data.address || 'N/A'}</p>
          </div>
        </div>
      </div>
      <div className="py-1.5 text-center text-white text-[8px] uppercase tracking-wider" style={{ background: theme.primary }}>
        Valid 2025-2026 • Mr Pathak School
      </div>
    </div>
  );
}

function SportCard({ data, color, fontStyle, borderStyle }: IdentityCardProps) {
  const theme = COLOR_THEMES[color] || COLOR_THEMES.blue;
  const font = FONT_STYLES[fontStyle || 'rounded'];
  const border = BORDER_STYLES[borderStyle || 'soft'];
  return (
    <div className={`w-[340px] h-[540px] ${border} overflow-hidden shadow-xl relative ${font}`} style={{ background: theme.primary }}>
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-white/8 rotate-12" style={{ background: `${theme.accent}15` }} />
      <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 -rotate-12" style={{ background: `${theme.accent}10` }} />
      <div className="absolute top-32 -right-4 w-24 h-full bg-white/5 skew-y-6" style={{ background: `${theme.accent}08` }} />
      <div className="relative z-10 p-4 flex flex-col h-full">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center"><School className="w-4 h-4 text-white" /></div>
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-white">Mr Pathak</p>
              <p className="text-[8px] opacity-70 text-white">Public School</p>
            </div>
          </div>
          <div className="bg-white/20 rounded-full px-2.5 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider">
            ID Card
          </div>
        </div>
        <div className="flex justify-center my-2">
          <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-white/40 bg-white/10 rotate-45">
            <div className="-rotate-45 w-full h-full">
              {data.photoUrl ? (
                <img src={data.photoUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-white/80">{data.fullName.charAt(0)}</div>
              )}
            </div>
          </div>
        </div>
        <div className="text-center text-white mb-3">
          <p className="text-lg font-black uppercase tracking-wider">{data.fullName}</p>
          <div className="inline-flex items-center gap-2 bg-white/15 rounded-full px-3 py-0.5 mt-1">
            <p className="text-xs font-bold">#{data.rollNumber}</p>
            <span className="w-1 h-1 rounded-full bg-white/60" />
            <p className="text-xs">Class {data.className}-{data.section}</p>
          </div>
        </div>
        <div className="flex-1 bg-white/95 rounded-xl p-3 space-y-1.5 text-xs" style={{ color: theme.text }}>
          {[
            { label: 'Guardian', value: data.guardianName, icon: User },
            { label: 'Contact', value: data.guardianPhone, icon: Phone },
            { label: 'Blood', value: data.bloodGroup || 'N/A', icon: Award },
            { label: 'Address', value: data.address || 'N/A', icon: MapPin },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2 py-1 px-2 rounded-lg" style={{ background: theme.secondary + '40' }}>
              <item.icon className="w-3 h-3" style={{ color: theme.accent }} />
              <span className="font-medium text-[10px] uppercase tracking-wider opacity-60">{item.label}</span>
              <span className="ml-auto font-semibold">{item.value}</span>
            </div>
          ))}
          <div className="flex items-center gap-2 py-1 px-2">
            <Calendar className="w-3 h-3" style={{ color: theme.accent }} />
            <span className="font-medium text-[10px] uppercase tracking-wider opacity-60">Joined</span>
            <span className="ml-auto font-semibold">{new Date(data.admissionDate).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="text-center mt-1.5">
          <div className="inline-block bg-white/15 rounded-full px-4 py-0.5">
            <p className="text-[8px] font-bold uppercase tracking-widest text-white">Valid 2025-2026</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function IdentityCard({ data, color, design, fontStyle, borderStyle }: IdentityCardProps) {
  switch (design) {
    case 'classic': return <ClassicCard {...{ data, color, design, fontStyle, borderStyle }} />;
    case 'minimal': return <MinimalCard {...{ data, color, design, fontStyle, borderStyle }} />;
    case 'premium': return <PremiumCard {...{ data, color, design, fontStyle, borderStyle }} />;
    case 'corporate': return <CorporateCard {...{ data, color, design, fontStyle, borderStyle }} />;
    case 'sport': return <SportCard {...{ data, color, design, fontStyle, borderStyle }} />;
    default: return <ModernCard {...{ data, color, design, fontStyle, borderStyle }} />;
  }
}

const CARD_COLORS = ['blue', 'green', 'purple', 'red', 'orange', 'teal', 'gold', 'indigo', 'pink', 'rose', 'cyan', 'slate'] as const;
const CARD_DESIGNS = ['modern', 'classic', 'minimal', 'premium', 'corporate', 'sport'] as const;
const FONT_OPTIONS = ['sans', 'serif', 'rounded'] as const;
const BORDER_OPTIONS = ['rounded', 'square', 'soft'] as const;

interface UserOption {
  id: string;
  full_name: string;
  email: string;
  student?: { id: string; roll_number: string; class_name: string; section: string; guardian_name: string; guardian_phone: string; address: string | null; admission_date: string };
  teacher?: { id: string; employee_id: string; department: string | null; qualification: string | null; joining_date: string };
}

export function IdentityCardGenerator() {
  const { currentUser } = useApp();
  const addToast = useToastStore((s) => s.addToast);
  const cardRef = useRef<HTMLDivElement>(null);

  const [cardType, setCardType] = useState<'student' | 'teacher'>('student');
  const [users, setUsers] = useState<UserOption[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedCard, setSavedCard] = useState<IdentityCardRow | null>(null);

  const [form, setForm] = useState({ fullName: '', rollNumber: '', className: '', section: '', guardianName: '', guardianPhone: '', address: '', admissionDate: '', bloodGroup: '' });
  const [color, setColor] = useState('blue');
  const [design, setDesign] = useState('modern');
  const [fontStyle, setFontStyle] = useState('sans');
  const [borderStyle, setBorderStyle] = useState('rounded');
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      if (cardType === 'student') {
        const { data } = await supabase.from('students')
          .select(`id, user:users(full_name, email), roll_number, class:classes(name, section), guardian_name, guardian_phone, address, admission_date`);
        if (data) setUsers(data.map((s: any) => ({ id: s.user.id, full_name: s.user.full_name, email: s.user.email, student: { id: s.id, roll_number: s.roll_number, class_name: s.class.name, section: s.class.section, guardian_name: s.guardian_name, guardian_phone: s.guardian_phone, address: s.address, admission_date: s.admission_date } })));
      } else {
        const { data } = await supabase.from('teachers')
          .select(`id, user:users(full_name, email), employee_id, department, qualification, joining_date`);
        if (data) setUsers(data.map((t: any) => ({ id: t.user.id, full_name: t.user.full_name, email: t.user.email, teacher: { id: t.id, employee_id: t.employee_id, department: t.department, qualification: t.qualification, joining_date: t.joining_date } })));
      }
    };
    fetchUsers();
  }, [cardType]);

  useEffect(() => {
    if (!selectedUserId) return;
    const user = users.find((u) => u.id === selectedUserId);
    if (!user) return;
    if (cardType === 'student' && user.student) {
      setForm({ fullName: user.full_name, rollNumber: user.student.roll_number, className: user.student.class_name, section: user.student.section, guardianName: user.student.guardian_name, guardianPhone: user.student.guardian_phone, address: user.student.address || '', admissionDate: user.student.admission_date, bloodGroup: '' });
    } else if (cardType === 'teacher' && user.teacher) {
      setForm({ fullName: user.full_name, rollNumber: user.teacher.employee_id, className: user.teacher.department || '', section: '', guardianName: user.teacher.qualification || '', guardianPhone: '', address: '', admissionDate: user.teacher.joining_date, bloodGroup: '' });
    }
    setPreview(false);
  }, [selectedUserId, users, cardType]);

  useEffect(() => {
    if (!selectedUserId) { setSavedCard(null); return; }
    const fetchExisting = async () => {
      const { data } = await supabase.from('identity_cards').select('*').eq('user_id', selectedUserId).single();
      if (data) {
        setSavedCard(data);
        setColor(data.color_theme);
        setDesign(data.design_type);
        const cd = data.card_data as any;
        if (cd.fontStyle) setFontStyle(cd.fontStyle);
        if (cd.borderStyle) setBorderStyle(cd.borderStyle);
        setForm((prev) => ({ ...prev, ...cd }));
        setPreview(true);
      } else { setSavedCard(null); }
    };
    fetchExisting();
  }, [selectedUserId]);

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const content = cardRef.current?.innerHTML;
    if (!content) return;
    printWindow.document.write(`<html><head><title>Identity Card - ${form.fullName}</title><style>body{display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}</style></head><body>${content}</body></html>`);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
  };

  const handleSave = async () => {
    if (!selectedUserId || !form.fullName) return;
    setSaving(true);
    try {
      const cardData = { ...form, fontStyle, borderStyle };
      const payload = { user_id: selectedUserId, card_type: cardType, color_theme: color, design_type: design, card_data: cardData as unknown as Record<string, string>, generated_by: currentUser?.user.id || null };
      if (savedCard) {
        await supabase.from('identity_cards').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', savedCard.id);
        addToast({ type: 'success', title: 'Updated', message: 'Identity card updated successfully.' });
      } else {
        await supabase.from('identity_cards').insert(payload);
        addToast({ type: 'success', title: 'Saved', message: 'Identity card generated and saved.' });
      }
      setPreview(true);
    } catch (err) {
      console.error('Save error:', err);
      addToast({ type: 'error', title: 'Error', message: 'Failed to save identity card.' });
    } finally { setSaving(false); }
  };

  const filteredUsers = users.filter((u) => u.full_name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-neutral-900">Identity Card Generator</h2>
        {selectedUserId && savedCard && <span className="text-xs text-success-600 bg-success-50 px-3 py-1 rounded-lg font-medium">Previously Generated</span>}
      </div>
      <div className="flex gap-2">
        <button onClick={() => { setCardType('student'); setSelectedUserId(''); setPreview(false); setSavedCard(null); }}
          className={`px-5 py-2.5 rounded-xl font-medium transition-all ${cardType === 'student' ? 'bg-primary-600 text-white shadow-md' : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50'}`}>🎓 Student Card</button>
        <button onClick={() => { setCardType('teacher'); setSelectedUserId(''); setPreview(false); setSavedCard(null); }}
          className={`px-5 py-2.5 rounded-xl font-medium transition-all ${cardType === 'teacher' ? 'bg-primary-600 text-white shadow-md' : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50'}`}>👨‍🏫 Teacher Card</button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white border border-neutral-200 rounded-xl p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Select {cardType === 'student' ? 'Student' : 'Teacher'}</label>
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email..." className="w-full pl-9 pr-4 py-2 border border-neutral-200 rounded-lg text-sm" />
            </div>
            <select value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)} className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm" size={4}>
              {filteredUsers.length === 0 && <option value="" disabled>No {cardType}s found</option>}
              {filteredUsers.map((u) => (<option key={u.id} value={u.id} className="py-1">{u.full_name} ({u.email})</option>))}
            </select>
          </div>
          {selectedUserId && (
            <>
              <div>
                <h3 className="font-semibold text-neutral-900 mb-4">{cardType === 'student' ? 'Student Details' : 'Teacher Details'}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Full Name *</label>
                    <input value={form.fullName} onChange={(e) => setForm(f => ({ ...f, fullName: e.target.value }))} className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">{cardType === 'student' ? 'Roll Number' : 'Employee ID'} *</label>
                    <input value={form.rollNumber} onChange={(e) => setForm(f => ({ ...f, rollNumber: e.target.value }))} className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm" />
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-neutral-700 mb-1">{cardType === 'student' ? 'Class' : 'Department'} *</label>
                      <input value={form.className} onChange={(e) => setForm(f => ({ ...f, className: e.target.value }))} className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm" />
                    </div>
                    {cardType === 'student' && <div className="w-20"><label className="block text-sm font-medium text-neutral-700 mb-1">Section</label><input value={form.section} onChange={(e) => setForm(f => ({ ...f, section: e.target.value }))} className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm" /></div>}
                  </div>
                  {cardType === 'student' && (
                    <>
                      <div className="col-span-2"><label className="block text-sm font-medium text-neutral-700 mb-1">Guardian Name *</label><input value={form.guardianName} onChange={(e) => setForm(f => ({ ...f, guardianName: e.target.value }))} className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm" /></div>
                      <div><label className="block text-sm font-medium text-neutral-700 mb-1">Guardian Phone *</label><input value={form.guardianPhone} onChange={(e) => setForm(f => ({ ...f, guardianPhone: e.target.value }))} className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm" /></div>
                      <div><label className="block text-sm font-medium text-neutral-700 mb-1">Blood Group</label><input value={form.bloodGroup} onChange={(e) => setForm(f => ({ ...f, bloodGroup: e.target.value }))} className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm" placeholder="A+" /></div>
                      <div className="col-span-2"><label className="block text-sm font-medium text-neutral-700 mb-1">Address</label><input value={form.address} onChange={(e) => setForm(f => ({ ...f, address: e.target.value }))} className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm" /></div>
                    </>
                  )}
                  <div className="col-span-2"><label className="block text-sm font-medium text-neutral-700 mb-1">{cardType === 'student' ? 'Admission Date' : 'Joining Date'}</label><input type="date" value={form.admissionDate} onChange={(e) => setForm(f => ({ ...f, admissionDate: e.target.value }))} className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm" /></div>
                </div>
              </div>
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
                <h3 className="font-semibold text-neutral-900 mb-3">Card Design</h3>
                <div className="grid grid-cols-3 gap-2">
                  {CARD_DESIGNS.map((d) => (
                    <button key={d} onClick={() => setDesign(d)}
                      className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-all capitalize ${design === d ? 'bg-primary-600 text-white shadow-md' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 border border-neutral-200'}`}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-2 text-sm">Font Style</h3>
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
                  <h3 className="font-semibold text-neutral-900 mb-2 text-sm">Border Style</h3>
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
              <div className="flex gap-3">
                <button onClick={() => setPreview(true)} disabled={!form.fullName || !form.rollNumber}
                  className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors disabled:opacity-50">
                  👁 Preview Card
                </button>
                {preview && (
                  <button onClick={handlePrint} className="px-4 py-2.5 bg-neutral-800 text-white rounded-xl font-medium hover:bg-neutral-900 transition-colors">
                    🖨 Print
                  </button>
                )}
              </div>
              <button onClick={handleSave} disabled={saving || !form.fullName}
                className="w-full px-4 py-2.5 bg-success-600 text-white rounded-xl font-medium hover:bg-success-700 transition-colors disabled:opacity-50">
                {saving ? 'Saving...' : savedCard ? '🔄 Update Identity Card' : '💾 Save Identity Card'}
              </button>
            </>
          )}
        </div>
        <div className="flex flex-col items-center justify-start lg:sticky lg:top-6">
          {preview ? (
            <div ref={cardRef}><IdentityCard data={form} color={color} design={design} fontStyle={fontStyle} borderStyle={borderStyle} /></div>
          ) : (
            <div className="text-center py-20 text-neutral-400">
              <div className="w-20 h-28 mx-auto mb-4 rounded-xl border-2 border-dashed border-neutral-300 flex items-center justify-center">
                <span className="text-4xl">🪪</span>
              </div>
              <p className="font-medium">{selectedUserId ? 'Click Preview Card' : 'Select a ' + cardType + ' from the list'}</p>
              <p className="text-sm mt-1">Then customize & save</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
