import React, { useRef, useState, useEffect } from 'react';
import { School, MapPin, Phone, Calendar, Clock, Search, Award, Star, BookOpen, CheckCircle, XCircle } from 'lucide-react';
import { supabase, AdmitCard as AdmitCardRow, ExamSchedule, StudentWithDetails } from '../lib/supabase';
import { useToastStore } from '../hooks/useToast';
import { useApp } from '../contexts/AppContext';

interface AdmitCardData {
  fullName: string;
  rollNumber: string;
  className: string;
  section: string;
  guardianName: string;
  guardianPhone: string;
  address: string;
  examTitle: string;
  examDate: string;
  startTime: string;
  endTime: string;
  room: string;
  subjectName: string;
  subjectCode: string;
  totalMarks: number;
  examType: string;
  photoUrl?: string;
}

interface AdmitCardProps {
  data: AdmitCardData;
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

function AdmitCardModern({ data, color, fontStyle, borderStyle }: AdmitCardProps) {
  const theme = COLOR_THEMES[color] || COLOR_THEMES.blue;
  const font = FONT_STYLES[fontStyle || 'sans'];
  const border = BORDER_STYLES[borderStyle || 'rounded'];
  return (
    <div className={`w-[340px] h-[540px] ${border} overflow-hidden shadow-xl relative ${font}`} style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})` }}>
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10" />
      <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-white/10" />
      <div className="relative z-10 p-5 flex flex-col h-full">
        <div className="text-center text-white">
          <School className="w-7 h-7 mx-auto mb-1 opacity-80" />
          <h2 className="text-xs font-bold tracking-wide uppercase">Mr Pathak School</h2>
          <div className="inline-block bg-white/20 rounded-full px-3 py-0.5 mt-1">
            <p className="text-[10px] font-bold uppercase tracking-widest">ADMIT CARD</p>
          </div>
          <div className="w-12 h-0.5 bg-white/50 mx-auto mt-1" />
        </div>
        <div className="flex justify-center my-2">
          {data.photoUrl ? (
            <img src={data.photoUrl} alt="" className="w-20 h-20 rounded-full border-3 border-white/60 object-cover" />
          ) : (
            <div className="w-20 h-20 rounded-full border-3 border-white/60 bg-white/20 flex items-center justify-center">
              <span className="text-2xl font-bold text-white/80">{data.fullName.charAt(0)}</span>
            </div>
          )}
        </div>
        <div className="text-center text-white mb-2">
          <p className="text-base font-bold">{data.fullName}</p>
          <p className="text-[10px] opacity-80">Class {data.className}-{data.section} | Roll: {data.rollNumber}</p>
        </div>
        <div className="flex-1 bg-white/95 rounded-xl p-3 space-y-1.5 text-[10px]" style={{ color: theme.text }}>
          <p className="font-bold text-xs text-center pb-1 border-b border-neutral-200" style={{ color: theme.accent }}>{data.examTitle}</p>
          <div className="flex items-center gap-1.5"><BookOpen className="w-3 h-3 shrink-0" style={{ color: theme.accent }} /><span>{data.subjectName} ({data.subjectCode})</span></div>
          <div className="flex items-center gap-1.5"><Calendar className="w-3 h-3 shrink-0" style={{ color: theme.accent }} /><span>{new Date(data.examDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span></div>
          <div className="flex items-center gap-1.5"><Clock className="w-3 h-3 shrink-0" style={{ color: theme.accent }} /><span>{data.startTime?.substring(0, 5)} - {data.endTime?.substring(0, 5)}</span></div>
          {data.room && <div className="flex items-center gap-1.5"><MapPin className="w-3 h-3 shrink-0" style={{ color: theme.accent }} /><span>Room: {data.room}</span></div>}
          <div className="flex items-center gap-1.5"><Award className="w-3 h-3 shrink-0" style={{ color: theme.accent }} /><span>Max Marks: {data.totalMarks}</span></div>
          <div className="border-t border-neutral-200 pt-1.5 mt-1.5 space-y-1">
            <div className="flex items-center gap-1.5"><Phone className="w-3 h-3 shrink-0" style={{ color: theme.accent }} /><span>{data.guardianPhone}</span></div>
            {data.address && <div className="flex items-center gap-1.5"><MapPin className="w-3 h-3 shrink-0" style={{ color: theme.accent }} /><span className="truncate">{data.address}</span></div>}
          </div>
        </div>
        <div className="text-center text-white/70 text-[9px] mt-1.5">
          <p className="font-bold text-white/90">Mr Pathak School</p>
        </div>
      </div>
    </div>
  );
}

function AdmitCardClassic({ data, color, fontStyle, borderStyle }: AdmitCardProps) {
  const theme = COLOR_THEMES[color] || COLOR_THEMES.blue;
  const font = FONT_STYLES[fontStyle || 'sans'];
  const border = BORDER_STYLES[borderStyle || 'rounded'];
  return (
    <div className={`w-[340px] h-[540px] ${border} overflow-hidden shadow-xl border-2 ${font}`} style={{ borderColor: theme.primary }}>
      <div className="p-3 text-white text-center" style={{ background: theme.primary }}>
        <School className="w-6 h-6 mx-auto mb-1" />
        <h2 className="text-xs font-bold">Mr Pathak School</h2>
        <p className="text-[9px] opacity-80">ADMIT CARD</p>
      </div>
      <div className="p-3 flex flex-col items-center" style={{ background: theme.secondary }}>
        <div className="w-16 h-16 rounded-full border-3 overflow-hidden mb-1" style={{ borderColor: theme.primary }}>
          {data.photoUrl ? (
            <img src={data.photoUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xl font-bold text-white" style={{ background: theme.primary }}>{data.fullName.charAt(0)}</div>
          )}
        </div>
        <p className="text-sm font-bold" style={{ color: theme.text }}>{data.fullName}</p>
        <p className="text-[10px] opacity-70">Class {data.className}-{data.section} | Roll: {data.rollNumber}</p>
      </div>
      <div className="p-3 space-y-1.5 text-[10px] flex-1" style={{ color: theme.text }}>
        <p className="font-semibold text-xs text-center" style={{ color: theme.accent }}>{data.examTitle}</p>
        <div className="flex justify-between border-b border-neutral-200 pb-1"><span className="font-medium">Subject</span><span>{data.subjectName}</span></div>
        <div className="flex justify-between border-b border-neutral-200 pb-1"><span className="font-medium">Date</span><span>{new Date(data.examDate).toLocaleDateString()}</span></div>
        <div className="flex justify-between border-b border-neutral-200 pb-1"><span className="font-medium">Time</span><span>{data.startTime?.substring(0, 5)} - {data.endTime?.substring(0, 5)}</span></div>
        {data.room && <div className="flex justify-between border-b border-neutral-200 pb-1"><span className="font-medium">Room</span><span>{data.room}</span></div>}
        <div className="flex justify-between border-b border-neutral-200 pb-1"><span className="font-medium">Marks</span><span>{data.totalMarks}</span></div>
        <div className="flex justify-between border-b border-neutral-200 pb-1"><span className="font-medium">Guardian</span><span>{data.guardianName}</span></div>
        <div className="flex justify-between"><span className="font-medium">Phone</span><span>{data.guardianPhone}</span></div>
      </div>
      <div className="text-center py-1.5 text-white text-[9px]" style={{ background: theme.primary }}>Mr Pathak School</div>
    </div>
  );
}

function AdmitCardMinimal({ data, color, fontStyle, borderStyle }: AdmitCardProps) {
  const theme = COLOR_THEMES[color] || COLOR_THEMES.blue;
  const font = FONT_STYLES[fontStyle || 'sans'];
  const border = BORDER_STYLES[borderStyle || 'rounded'];
  return (
    <div className={`w-[340px] h-[540px] ${border} overflow-hidden shadow-lg border ${font}`} style={{ borderColor: theme.primary + '30' }}>
      <div className="p-5 flex flex-col h-full">
        <div className="flex items-center gap-3 pb-3 border-b" style={{ borderColor: theme.secondary }}>
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: theme.primary }}><School className="w-4 h-4 text-white" /></div>
          <div><p className="text-xs font-bold" style={{ color: theme.text }}>Mr Pathak School</p><p className="text-[9px] opacity-60">Admit Card</p></div>
        </div>
        <div className="flex items-center gap-3 py-2">
          <div className="w-14 h-14 rounded-full overflow-hidden border-2 shrink-0" style={{ borderColor: theme.accent }}>
            {data.photoUrl ? <img src={data.photoUrl} alt="" className="w-full h-full object-cover" /> : (
              <div className="w-full h-full flex items-center justify-center text-lg font-bold text-white" style={{ background: theme.accent }}>{data.fullName.charAt(0)}</div>
            )}
          </div>
          <div><p className="text-sm font-bold" style={{ color: theme.text }}>{data.fullName}</p><p className="text-[10px] opacity-70">Roll: {data.rollNumber} | Class {data.className}-{data.section}</p></div>
        </div>
        <div className="flex-1 space-y-1.5 text-[10px]">
          <p className="font-semibold text-xs text-center py-1" style={{ color: theme.accent }}>{data.examTitle}</p>
          {[
            { label: 'Subject', value: `${data.subjectName} (${data.subjectCode})` },
            { label: 'Date', value: new Date(data.examDate).toLocaleDateString() },
            { label: 'Time', value: `${data.startTime?.substring(0, 5)} - ${data.endTime?.substring(0, 5)}` },
            { label: 'Room', value: data.room || 'N/A' },
            { label: 'Max Marks', value: String(data.totalMarks) },
            { label: 'Guardian', value: data.guardianName },
            { label: 'Phone', value: data.guardianPhone },
          ].map((item) => (
            <div key={item.label} className="flex justify-between items-center py-1 px-2.5 rounded-lg" style={{ background: theme.secondary + '60' }}>
              <span className="font-medium opacity-70">{item.label}</span><span>{item.value}</span>
            </div>
          ))}
        </div>
        <div className="pt-2 text-center text-[9px] opacity-50 border-t" style={{ borderColor: theme.secondary }}>
          <p>Mr Pathak School</p>
        </div>
      </div>
    </div>
  );
}

function AdmitCardPremium({ data, color, fontStyle, borderStyle }: AdmitCardProps) {
  const theme = COLOR_THEMES[color] || COLOR_THEMES.blue;
  const font = FONT_STYLES[fontStyle || 'serif'];
  const border = BORDER_STYLES[borderStyle || 'soft'];
  return (
    <div className={`w-[340px] h-[540px] ${border} overflow-hidden shadow-2xl relative ${font}`}>
      <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${theme.primary} 0%, ${theme.primary}dd 35%, ${theme.light} 35%, ${theme.light} 100%)` }} />
      <div className="absolute top-0 inset-x-0 h-1" style={{ background: `linear-gradient(90deg, ${theme.accent}, ${theme.primary}, ${theme.accent})` }} />
      <div className="relative z-10 p-5 flex flex-col h-full">
        <div className="text-center text-white">
          <Award className="w-6 h-6 mx-auto mb-1" style={{ color: theme.accent }} />
          <h2 className="text-xs font-bold tracking-wider uppercase" style={{ color: theme.accent }}>Mr Pathak</h2>
          <p className="text-[8px] opacity-80 uppercase tracking-widest text-white">Public School</p>
          <div className="mx-auto mt-1" style={{ width: 36, height: 2, background: theme.accent }} />
          <p className="text-[9px] font-bold text-white mt-1">ADMIT CARD</p>
        </div>
        <div className="flex justify-center mt-2 mb-2">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 p-0.5" style={{ borderColor: theme.accent }}>
            {data.photoUrl ? (
              <img src={data.photoUrl} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              <div className="w-full h-full rounded-full flex items-center justify-center text-xl font-bold text-white" style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})` }}>
                {data.fullName.charAt(0)}
              </div>
            )}
          </div>
        </div>
        <div className="text-center mb-2">
          <p className="text-sm font-bold" style={{ color: theme.text }}>{data.fullName}</p>
          <p className="text-[10px]" style={{ color: theme.accent }}>Roll: {data.rollNumber} | Class {data.className}-{data.section}</p>
        </div>
        <div className="flex-1 bg-white/90 rounded-lg p-3 space-y-1.5 text-[10px] shadow-inner border" style={{ borderColor: theme.secondary, color: theme.text }}>
          <p className="font-semibold text-xs text-center" style={{ color: theme.accent }}>{data.examTitle}</p>
          {[
            { icon: <BookOpen className="w-3 h-3" />, label: 'Subject', value: `${data.subjectName} (${data.subjectCode})` },
            { icon: <Calendar className="w-3 h-3" />, label: 'Date', value: new Date(data.examDate).toLocaleDateString() },
            { icon: <Clock className="w-3 h-3" />, label: 'Time', value: `${data.startTime?.substring(0, 5)} - ${data.endTime?.substring(0, 5)}` },
            { icon: <MapPin className="w-3 h-3" />, label: 'Room', value: data.room || 'N/A' },
            { icon: <Award className="w-3 h-3" />, label: 'Marks', value: String(data.totalMarks) },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 pb-1" style={{ borderBottom: i < 4 ? `1px solid ${theme.secondary}` : 'none' }}>
              <span style={{ color: theme.accent }}>{item.icon}</span>
              <span className="font-medium opacity-70">{item.label}:</span>
              <span className="ml-auto">{item.value}</span>
            </div>
          ))}
        </div>
        <div className="text-center pt-1.5">
          <div className="flex items-center justify-center gap-1">
            <Star className="w-2 h-2" style={{ color: theme.accent }} fill={theme.accent} />
            <p className="text-[8px] font-bold" style={{ color: theme.primary }}>Mr Pathak School</p>
            <Star className="w-2 h-2" style={{ color: theme.accent }} fill={theme.accent} />
          </div>
        </div>
      </div>
    </div>
  );
}

function AdmitCardSport({ data, color, fontStyle, borderStyle }: AdmitCardProps) {
  const theme = COLOR_THEMES[color] || COLOR_THEMES.blue;
  const font = FONT_STYLES[fontStyle || 'rounded'];
  const border = BORDER_STYLES[borderStyle || 'soft'];
  return (
    <div className={`w-[340px] h-[540px] ${border} overflow-hidden shadow-xl relative ${font}`} style={{ background: theme.primary }}>
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-white/8 rotate-12" style={{ background: `${theme.accent}15` }} />
      <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 -rotate-12" style={{ background: `${theme.accent}10` }} />
      <div className="relative z-10 p-4 flex flex-col h-full">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center"><School className="w-3.5 h-3.5 text-white" /></div>
            <div><p className="text-[10px] font-black uppercase tracking-wide text-white">Mr Pathak</p><p className="text-[7px] opacity-70 text-white">Public School</p></div>
          </div>
          <div className="bg-white/20 rounded-full px-2 py-0.5 text-[8px] font-bold text-white uppercase tracking-wider">ADMIT CARD</div>
        </div>
        <div className="flex justify-center my-1">
          <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white/40 bg-white/10 rotate-45">
            <div className="-rotate-45 w-full h-full">
              {data.photoUrl ? (
                <img src={data.photoUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xl font-bold text-white/80">{data.fullName.charAt(0)}</div>
              )}
            </div>
          </div>
        </div>
        <div className="text-center text-white mb-2">
          <p className="text-sm font-black uppercase tracking-wider">{data.fullName}</p>
          <div className="inline-flex items-center gap-2 bg-white/15 rounded-full px-2.5 py-0.5 mt-0.5">
            <p className="text-[9px] font-bold">#{data.rollNumber}</p>
            <span className="w-1 h-1 rounded-full bg-white/60" />
            <p className="text-[9px]">Class {data.className}-{data.section}</p>
          </div>
        </div>
        <div className="flex-1 bg-white/95 rounded-xl p-2.5 space-y-1 text-[10px]" style={{ color: theme.text }}>
          <p className="font-bold text-xs text-center" style={{ color: theme.accent }}>{data.examTitle}</p>
          {[
            { label: 'Subject', value: `${data.subjectName} (${data.subjectCode})`, icon: BookOpen },
            { label: 'Date', value: new Date(data.examDate).toLocaleDateString(), icon: Calendar },
            { label: 'Time', value: `${data.startTime?.substring(0, 5)} - ${data.endTime?.substring(0, 5)}`, icon: Clock },
            { label: 'Room', value: data.room || 'N/A', icon: MapPin },
            { label: 'Marks', value: String(data.totalMarks), icon: Award },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5 py-1 px-2 rounded-lg" style={{ background: theme.secondary + '40' }}>
              <item.icon className="w-2.5 h-2.5 shrink-0" style={{ color: theme.accent }} />
              <span className="font-medium text-[8px] uppercase tracking-wider opacity-60">{item.label}</span>
              <span className="ml-auto font-semibold">{item.value}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5 py-1 px-2">
            <Phone className="w-2.5 h-2.5 shrink-0" style={{ color: theme.accent }} />
            <span className="font-medium text-[8px] uppercase tracking-wider opacity-60">Contact</span>
            <span className="ml-auto font-semibold">{data.guardianPhone}</span>
          </div>
        </div>
        <div className="text-center mt-1">
          <div className="inline-block bg-white/15 rounded-full px-3 py-0.5">
            <p className="text-[7px] font-bold uppercase tracking-widest text-white">Mr Pathak School</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdmitCardCorporate({ data, color, fontStyle, borderStyle }: AdmitCardProps) {
  const theme = COLOR_THEMES[color] || COLOR_THEMES.blue;
  const font = FONT_STYLES[fontStyle || 'sans'];
  const border = BORDER_STYLES[borderStyle || 'square'];
  return (
    <div className={`w-[340px] h-[540px] ${border} overflow-hidden shadow-xl flex flex-col ${font}`}>
      <div className="flex items-stretch flex-1">
        <div className="w-20 flex flex-col items-center justify-center text-white p-2" style={{ background: theme.primary }}>
          <School className="w-6 h-6 mb-2" />
          <div className="text-[8px] font-bold uppercase tracking-widest text-center" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>ADMIT CARD</div>
        </div>
        <div className="flex-1 flex flex-col p-4" style={{ background: theme.light }}>
          <div className="text-right mb-2">
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: theme.primary }}>Mr Pathak</p>
            <p className="text-[8px] opacity-60" style={{ color: theme.text }}>Public School</p>
          </div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-14 h-14 rounded overflow-hidden border shrink-0" style={{ borderColor: theme.accent }}>
              {data.photoUrl ? (
                <img src={data.photoUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-lg font-bold text-white" style={{ background: theme.accent }}>{data.fullName.charAt(0)}</div>
              )}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-sm" style={{ color: theme.text }}>{data.fullName}</p>
              <p className="text-xs opacity-70">Roll: {data.rollNumber} | Class {data.className}-{data.section}</p>
            </div>
          </div>
          <p className="font-semibold text-xs mb-2 text-center" style={{ color: theme.accent }}>{data.examTitle}</p>
          <div className="flex-1 space-y-1.5 text-[10px]">
            {[
              { label: 'Subject', value: `${data.subjectName} (${data.subjectCode})` },
              { label: 'Date', value: new Date(data.examDate).toLocaleDateString() },
              { label: 'Time', value: `${data.startTime?.substring(0, 5)} - ${data.endTime?.substring(0, 5)}` },
              { label: 'Room', value: data.room || 'N/A' },
              { label: 'Marks', value: String(data.totalMarks) },
              { label: 'Guardian', value: data.guardianName },
              { label: 'Phone', value: data.guardianPhone },
            ].map((item) => (
              <div key={item.label} className="flex justify-between py-1 px-2 bg-white rounded" style={{ borderLeft: `3px solid ${theme.accent}` }}>
                <span className="font-medium opacity-60 text-[9px]">{item.label}</span>
                <span style={{ color: theme.text }}>{item.value}</span>
              </div>
            ))}
          </div>
          <div className="mt-2 pt-2 text-center border-t border-neutral-200">
            <p className="text-[8px] opacity-60">{data.address || ''}</p>
          </div>
        </div>
      </div>
      <div className="py-1.5 text-center text-white text-[8px] uppercase tracking-wider" style={{ background: theme.primary }}>
        Mr Pathak School
      </div>
    </div>
  );
}

export function AdmitCard({ data, color, design, fontStyle, borderStyle }: AdmitCardProps) {
  switch (design) {
    case 'classic': return <AdmitCardClassic {...{ data, color, design, fontStyle, borderStyle }} />;
    case 'minimal': return <AdmitCardMinimal {...{ data, color, design, fontStyle, borderStyle }} />;
    case 'premium': return <AdmitCardPremium {...{ data, color, design, fontStyle, borderStyle }} />;
    case 'corporate': return <AdmitCardCorporate {...{ data, color, design, fontStyle, borderStyle }} />;
    case 'sport': return <AdmitCardSport {...{ data, color, design, fontStyle, borderStyle }} />;
    default: return <AdmitCardModern {...{ data, color, design, fontStyle, borderStyle }} />;
  }
}

const CARD_COLORS = ['blue', 'green', 'purple', 'red', 'orange', 'teal', 'gold', 'indigo', 'pink', 'rose', 'cyan', 'slate'] as const;
const CARD_DESIGNS = ['modern', 'classic', 'minimal', 'premium', 'corporate', 'sport'] as const;
const FONT_OPTIONS = ['sans', 'serif', 'rounded'] as const;
const BORDER_OPTIONS = ['rounded', 'square', 'soft'] as const;

interface StudentOption {
  id: string;
  user_id: string;
  full_name: string;
  roll_number: string;
  class_name: string;
  section: string;
  guardian_name: string;
  guardian_phone: string;
  address: string | null;
  admission_date: string;
  photoUrl?: string;
}

type AdmitCardEntry = AdmitCardRow & { _local?: boolean };

const ADMIT_STORAGE_KEY = 'admit_cards_local';

function loadAdmitLocal(): AdmitCardEntry[] {
  try { return JSON.parse(localStorage.getItem(ADMIT_STORAGE_KEY) || '[]'); } catch { return []; }
}

function saveAdmitLocal(data: AdmitCardEntry[]) {
  localStorage.setItem(ADMIT_STORAGE_KEY, JSON.stringify(data));
}

const EXAM_SCHEDULES_KEY = 'exam_schedules_local';

function loadExamSchedulesLocal(): any[] {
  try { return JSON.parse(localStorage.getItem(EXAM_SCHEDULES_KEY) || '[]'); } catch { return []; }
}

export function AdmitCardGenerator() {
  const { currentUser } = useApp();
  const addToast = useToastStore((s) => s.addToast);
  const cardRef = useRef<HTMLDivElement>(null);

  const [examSchedules, setExamSchedules] = useState<(ExamSchedule & { subject?: { name: string; code: string }; class?: { name: string; section: string } })[]>([]);
  const [selectedExamId, setSelectedExamId] = useState('');
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<StudentOption[]>([]);
  const [search, setSearch] = useState('');
  const [generatedCards, setGeneratedCards] = useState<Map<string, AdmitCardEntry>>(new Map());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [useLocal, setUseLocal] = useState(false);

  const [previewStudent, setPreviewStudent] = useState<StudentOption | null>(null);
  const [color, setColor] = useState('blue');
  const [design, setDesign] = useState('modern');
  const [fontStyle, setFontStyle] = useState('sans');
  const [borderStyle, setBorderStyle] = useState('rounded');

  const selectedExam = examSchedules.find((s) => s.id === selectedExamId);

  useEffect(() => {
    fetchExamSchedules();
  }, []);

  useEffect(() => {
    if (!selectedExamId) { setStudents([]); setFilteredStudents([]); return; }
    fetchStudents();
  }, [selectedExamId]);

  useEffect(() => {
    setFilteredStudents(
      students.filter((s) =>
        s.full_name.toLowerCase().includes(search.toLowerCase()) ||
        s.roll_number.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, students]);

  const fetchExamSchedules = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('exam_schedules')
      .select(`*, subject:subjects(name, code), class:classes(name, section)`)
      .order('exam_date', { ascending: false });
    if (error && error.message?.includes('schema cache')) {
      setUseLocal(true);
      const local = loadExamSchedulesLocal();
      setExamSchedules(local as any || []);
      setLoading(false);
      return;
    }
    setExamSchedules(data as any || []);
    setLoading(false);
  };

  const fetchStudents = async () => {
    if (!selectedExam || !selectedExam.class_id) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('students')
      .select(`*, user:users(full_name, avatar_url), class:classes(name, section)`)
      .eq('class_id', selectedExam.class_id)
      .order('roll_number', { ascending: true });
    if (error) {
      console.error('fetchStudents error:', error);
      addToast({ type: 'error', title: 'Failed to load students', message: error.message });
      setLoading(false);
      return;
    }
    if (data) {
      const mapped: StudentOption[] = data.map((s: any) => ({
        id: s.id,
        user_id: s.user_id,
        full_name: s.user?.full_name || '',
        roll_number: s.roll_number,
        class_name: s.class?.name || '',
        section: s.class?.section || '',
        guardian_name: s.guardian_name,
        guardian_phone: s.guardian_phone,
        address: s.address,
        admission_date: s.admission_date,
        photoUrl: s.user?.avatar_url,
      }));
      setStudents(mapped);
      checkExistingCards(mapped);
    }
    setLoading(false);
  };

  const checkExistingCards = async (studentList: StudentOption[]) => {
    if (!selectedExamId || studentList.length === 0) return;
    const map = new Map<string, AdmitCardEntry>();
    if (useLocal) {
      const local = loadAdmitLocal().filter((c) => c.exam_schedule_id === selectedExamId);
      local.forEach((card) => map.set(card.student_id, { ...card, _local: true }));
      setGeneratedCards(map);
      return;
    }
    const studentIds = studentList.map((s) => s.id);
    const { data, error } = await supabase
      .from('admit_cards')
      .select('*')
      .eq('exam_schedule_id', selectedExamId)
      .in('student_id', studentIds);
    if (error) {
      setUseLocal(true);
      const local = loadAdmitLocal().filter((c) => c.exam_schedule_id === selectedExamId);
      local.forEach((card) => map.set(card.student_id, { ...card, _local: true }));
    } else if (data) {
      data.forEach((card) => map.set(card.student_id, card));
    }
    setGeneratedCards(map);
  };

  const buildCardData = (student: StudentOption): AdmitCardData => ({
    fullName: student.full_name,
    rollNumber: student.roll_number,
    className: student.class_name,
    section: student.section,
    guardianName: student.guardian_name,
    guardianPhone: student.guardian_phone,
    address: student.address || '',
    examTitle: selectedExam?.title || '',
    examDate: selectedExam?.exam_date || '',
    startTime: selectedExam?.start_time || '',
    endTime: selectedExam?.end_time || '',
    room: selectedExam?.room || '',
    subjectName: (selectedExam as any)?.subject?.name || '',
    subjectCode: (selectedExam as any)?.subject?.code || '',
    totalMarks: selectedExam?.total_marks || 0,
    examType: selectedExam?.type || '',
    photoUrl: student.photoUrl,
  });

  const handleGenerateAll = async () => {
    if (!selectedExamId || students.length === 0) return;
    setSaving(true);
    try {
      const existingIds = new Set(generatedCards.keys());
      const toInsert = students.filter((s) => !existingIds.has(s.id));
      if (toInsert.length === 0) {
        addToast({ type: 'info', title: 'All admit cards already generated' });
        setSaving(false);
        return;
      }
      const cardData = toInsert.map((s) => ({
        student_id: s.id,
        exam_schedule_id: selectedExamId,
        card_data: buildCardData(s) as unknown as Record<string, string>,
        color_theme: color,
        design_type: design,
        generated_by: currentUser?.user.id || null,
        status: 'active',
      }));
      if (useLocal) {
        const local = loadAdmitLocal();
        const newEntries: AdmitCardEntry[] = cardData.map((c, i) => ({
          ...c, id: crypto.randomUUID(), created_at: new Date().toISOString(), updated_at: new Date().toISOString(), _local: true,
        }));
        saveAdmitLocal([...local, ...newEntries]);
        addToast({ type: 'success', title: 'Admit cards generated', message: `${toInsert.length} card(s) created (local).` });
        checkExistingCards(students);
        setSaving(false);
        return;
      }
      const { error } = await supabase.from('admit_cards').insert(cardData);
      if (error) { addToast({ type: 'error', title: 'Failed to generate', message: error.message }); setSaving(false); return; }
      addToast({ type: 'success', title: 'Admit cards generated', message: `${toInsert.length} card(s) created.` });
      checkExistingCards(students);
    } catch (err) {
      console.error(err);
      addToast({ type: 'error', title: 'Failed to generate admit cards' });
    } finally { setSaving(false); }
  };

  const handleToggleStudent = async (student: StudentOption) => {
    const existing = generatedCards.get(student.id);
    if (existing) {
      addToast({ type: 'info', title: 'Admit card already exists for this student' });
      return;
    }
    setSaving(true);
    try {
      const cardPayload = {
        student_id: student.id,
        exam_schedule_id: selectedExamId,
        card_data: buildCardData(student) as unknown as Record<string, string>,
        color_theme: color,
        design_type: design,
        generated_by: currentUser?.user.id || null,
        status: 'active',
      };
      if (useLocal) {
        const local = loadAdmitLocal();
        const entry: AdmitCardEntry = {
          ...cardPayload, id: crypto.randomUUID(), created_at: new Date().toISOString(), updated_at: new Date().toISOString(), _local: true,
        };
        saveAdmitLocal([...local, entry]);
        setGeneratedCards((prev) => { const m = new Map(prev); m.set(student.id, entry); return m; });
        addToast({ type: 'success', title: 'Admit card generated', message: `For ${student.full_name}` });
        setSaving(false);
        return;
      }
      const { error } = await supabase.from('admit_cards').insert(cardPayload);
      if (error) { addToast({ type: 'error', title: 'Failed to generate', message: error.message }); setSaving(false); return; }
      addToast({ type: 'success', title: 'Admit card generated', message: `For ${student.full_name}` });
      checkExistingCards(students);
    } catch (err) {
      console.error(err);
      addToast({ type: 'error', title: 'Failed to generate admit card' });
    } finally { setSaving(false); }
  };

  const handleDeleteCard = async (studentId: string) => {
    const card = generatedCards.get(studentId);
    if (!card) return;
    if (!confirm('Delete this admit card?')) return;
    if (useLocal || (card as any)._local) {
      const local = loadAdmitLocal().filter((c) => c.id !== card.id);
      saveAdmitLocal(local);
      setGeneratedCards((prev) => { const m = new Map(prev); m.delete(studentId); return m; });
      addToast({ type: 'success', title: 'Admit card deleted' });
      return;
    }
    const { error } = await supabase.from('admit_cards').delete().eq('id', card.id);
    if (error) { addToast({ type: 'error', title: 'Failed to delete', message: error.message }); return; }
    setGeneratedCards((prev) => {
      const next = new Map(prev);
      next.delete(studentId);
      return next;
    });
    addToast({ type: 'success', title: 'Admit card deleted' });
  };

  const handlePrint = (student: StudentOption) => {
    const data = buildCardData(student);
    const printWindow = window.open('', '_blank');
    if (!printWindow || !cardRef.current) return;
    printWindow.document.write(`<html><head><title>Admit Card - ${data.fullName}</title><style>body{display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}</style></head><body>${cardRef.current.innerHTML}</body></html>`);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
  };

  const selectedExamLabel = selectedExam
    ? `${selectedExam.title} - ${new Date(selectedExam.exam_date).toLocaleDateString()}${(selectedExam as any)?.subject ? ` (${(selectedExam as any).subject.name})` : ''}`
    : '';

  if (loading && examSchedules.length === 0) {
    return <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-neutral-900">Admit Card Generator</h2>
        {selectedExamId && students.length > 0 && (
          <button
            onClick={handleGenerateAll}
            disabled={saving}
            className="px-4 py-2 bg-primary-600 text-white rounded-xl font-medium text-sm hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            {saving ? 'Generating...' : `Generate All (${students.length - generatedCards.size} remaining)`}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white border border-neutral-200 rounded-xl p-6 space-y-6">
          {/* Exam Schedule Selection */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Select Exam Schedule</label>
            <select
              value={selectedExamId}
              onChange={(e) => { setSelectedExamId(e.target.value); setSearch(''); setPreviewStudent(null); }}
              className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg text-sm"
            >
              <option value="">-- Choose an exam schedule --</option>
              {examSchedules.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title} - {new Date(s.exam_date).toLocaleDateString()} {(s as any).subject?.name ? `(${(s as any).subject.name})` : ''} {(s as any).class ? `[Grade ${(s as any).class.name}-${(s as any).class.section}]` : ''}
                </option>
              ))}
            </select>
          </div>

          {selectedExamId && (
            <>
              {/* Search Students */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Students in Class {selectedExam && `Grade ${(selectedExam as any).class?.name}-${(selectedExam as any).class?.section}`}
                  <span className="ml-2 text-xs text-neutral-400">({students.length})</span>
                </label>
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name or roll number..."
                    className="w-full pl-9 pr-4 py-2 border border-neutral-200 rounded-lg text-sm"
                  />
                </div>
              </div>

              {/* Student List */}
              <div className="max-h-[400px] overflow-y-auto space-y-2 border border-neutral-200 rounded-lg p-2">
                {loading ? (
                  <div className="flex justify-center py-4"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600" /></div>
                ) : filteredStudents.length === 0 ? (
                  <p className="text-center py-6 text-neutral-400 text-sm">No students found</p>
                ) : (
                  filteredStudents.map((student) => {
                    const hasCard = generatedCards.has(student.id);
                    return (
                      <div
                        key={student.id}
                        className={`flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer ${
                          previewStudent?.id === student.id
                            ? 'border-primary-400 bg-primary-50'
                            : hasCard
                            ? 'border-success-200 bg-success-50/50'
                            : 'border-neutral-200 hover:bg-neutral-50'
                        }`}
                        onClick={() => setPreviewStudent(student)}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center text-sm font-bold text-neutral-600 shrink-0">
                            {student.full_name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-sm text-neutral-900 truncate">{student.full_name}</p>
                            <p className="text-xs text-neutral-500">Roll: {student.roll_number}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {hasCard ? (
                            <span className="flex items-center gap-1 text-xs text-success-600 font-medium"><CheckCircle className="w-3.5 h-3.5" /> Generated</span>
                          ) : (
                            <span className="flex items-center gap-1 text-xs text-neutral-400"><XCircle className="w-3.5 h-3.5" /> Not generated</span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Color & Design Options */}
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
            </>
          )}
        </div>

        {/* Preview & Actions */}
        <div className="flex flex-col items-center justify-start lg:sticky lg:top-6 space-y-4">
          {previewStudent && selectedExamId ? (
            <>
              <div ref={cardRef}>
                <AdmitCard
                  data={buildCardData(previewStudent)}
                  color={color}
                  design={design}
                  fontStyle={fontStyle}
                  borderStyle={borderStyle}
                />
              </div>
              <div className="flex gap-3 w-full max-w-[340px]">
                {generatedCards.has(previewStudent.id) ? (
                  <>
                    <button
                      onClick={() => handlePrint(previewStudent)}
                      className="flex-1 px-4 py-2.5 bg-neutral-800 text-white rounded-xl font-medium text-sm hover:bg-neutral-900 transition-colors"
                    >
                      🖨 Print
                    </button>
                    <button
                      onClick={() => handleDeleteCard(previewStudent.id)}
                      className="px-4 py-2.5 bg-danger-600 text-white rounded-xl font-medium text-sm hover:bg-danger-700 transition-colors"
                    >
                      Delete
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleToggleStudent(previewStudent)}
                    disabled={saving}
                    className="w-full px-4 py-2.5 bg-success-600 text-white rounded-xl font-medium text-sm hover:bg-success-700 transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Generating...' : '💾 Generate Admit Card'}
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-20 text-neutral-400">
              <div className="w-20 h-28 mx-auto mb-4 rounded-xl border-2 border-dashed border-neutral-300 flex items-center justify-center">
                <span className="text-4xl">🎫</span>
              </div>
              <p className="font-medium">{selectedExamId ? 'Select a student from the list' : 'Select an exam schedule first'}</p>
              <p className="text-sm mt-1">Then customize & generate admit cards</p>
            </div>
          )}
          {selectedExamId && previewStudent && (
            <div className="text-xs text-neutral-400 text-center max-w-[340px]">
              <p>Exam: {selectedExamLabel}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
