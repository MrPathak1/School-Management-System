import React, { useState } from 'react';
import { useToastStore } from '../hooks/useToast';
import { supabase } from '../lib/supabase';
import {
  GraduationCap,
  UserRound,
  Eye,
  EyeOff,
  ArrowLeft,
  AlertCircle,
  X,
  Mail,
  Lock,
  Briefcase,
  Phone,
  ChevronDown
} from 'lucide-react';

type Role = 'teacher' | 'student' | 'parent';

interface SignupProps {
  onClose: () => void;
  onSwitchToLogin: () => void;
}

export function SignupPage({ onClose, onSwitchToLogin }: SignupProps) {
  const addToast = useToastStore((s) => s.addToast);

  const [step, setStep] = useState<'role' | 'form'>('role');
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
  });
  const [studentFields, setStudentFields] = useState({ className: '', guardianName: '', guardianPhone: '', guardianEmail: '' });
  const [teacherFields, setTeacherFields] = useState({ department: '', qualification: '', employeeId: '' });

  const [errorMsg, setErrorMsg] = useState('');

  const updateForm = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrorMsg('');
  };

  const handleSelectRole = (role: Role) => {
    setSelectedRole(role);
    setStep('form');
    setErrorMsg('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!form.fullName || !form.email || !form.password) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }
    if (form.password.length < 4) {
      setErrorMsg('Password must be at least 4 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      const existing = JSON.parse(localStorage.getItem('registered_users') || '[]');
      if (existing.some((u: any) => u.email === form.email)) {
        setErrorMsg('An account with this email already exists.');
        setIsSubmitting(false);
        return;
      }

      const newUser = {
        id: crypto.randomUUID ? crypto.randomUUID() : 'usr_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9),
        email: form.email,
        full_name: form.fullName,
        role: selectedRole,
        password: btoa(form.password),
        phone: form.phone || '',
        created_at: new Date().toISOString(),
        ...(selectedRole === 'student' ? {
          student: {
            className: studentFields.className,
            guardianName: studentFields.guardianName,
            guardianPhone: studentFields.guardianPhone,
            guardianEmail: studentFields.guardianEmail,
          }
        } : {}),
        ...(selectedRole === 'teacher' ? {
          teacher: {
            department: teacherFields.department,
            qualification: teacherFields.qualification,
            employeeId: teacherFields.employeeId,
          }
        } : {}),
      };

      existing.push(newUser);
      localStorage.setItem('registered_users', JSON.stringify(existing));

      try {
        await supabase.from('users').insert({
          id: newUser.id,
          email: newUser.email,
          full_name: newUser.full_name,
          role: newUser.role as any,
          phone: newUser.phone || null,
        });
      } catch (_dbErr) {
        // DB insert is best-effort; fallback uses localStorage
      }

      addToast({ type: 'success', title: 'Account Created!', message: 'You can now login with your email and password.' });
      onSwitchToLogin();
    } catch (err) {
      console.error(err);
      setErrorMsg('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200 w-full max-w-lg overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            {step === 'form' ? (
              <button onClick={() => { setStep('role'); setSelectedRole(null); setErrorMsg(''); }} className="p-1 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-200/50 transition-all">
                <ArrowLeft className="w-5 h-5" />
              </button>
            ) : (
              <GraduationCap className="w-5 h-5 text-primary-600" />
            )}
            <h3 className="font-bold text-lg text-neutral-900">
              {step === 'role' ? 'Create New Account' : `Sign Up as ${selectedRole === 'teacher' ? 'Teacher' : selectedRole === 'student' ? 'Student' : 'Parent'}`}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-200/50 transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 flex-1 overflow-y-auto">
          {step === 'role' && (
            <>
              <p className="text-sm text-neutral-500">Create a teacher account:</p>
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => handleSelectRole('teacher')}
                  className="w-full p-4 border border-neutral-200 hover:border-success-500 hover:bg-success-50/20 rounded-xl text-left transition-all flex items-center gap-4"
                >
                  <div className="w-12 h-12 bg-success-50 rounded-xl flex items-center justify-center text-success-700 flex-shrink-0">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="block font-bold text-neutral-900">Teacher</span>
                    <span className="text-sm text-neutral-500">Faculty & staff members</span>
                  </div>
                  <ChevronDown className="w-5 h-5 text-neutral-400 ml-auto -rotate-90" />
                </button>
              </div>
              <p className="text-xs text-neutral-400 text-center">Students and parents are registered by the admin.</p>
              <div className="text-center pt-2">
                <span className="text-sm text-neutral-500">Already have an account? </span>
                <button type="button" onClick={onSwitchToLogin} className="text-sm font-semibold text-primary-600 hover:text-primary-700">
                  Login here
                </button>
              </div>
            </>
          )}

          {step === 'form' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-700 block">Full Name *</label>
                <div className="relative">
                  <UserRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input type="text" value={form.fullName} onChange={(e) => updateForm('fullName', e.target.value)} placeholder="e.g. John Doe" className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-neutral-800" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-700 block">Email Address *</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input type="email" value={form.email} onChange={(e) => updateForm('email', e.target.value)} placeholder="e.g. name@email.com" className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-neutral-800" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-700 block">Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                   <input key={showPassword ? 'text' : 'password'} type={showPassword ? 'text' : 'password'} value={form.password} onChange={(e) => updateForm('password', e.target.value)} placeholder="Min. 4 characters" className="w-full pl-10 pr-10 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-neutral-800" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="showPassSignup" checked={showPassword} onChange={() => setShowPassword(!showPassword)} className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500" />
                <label htmlFor="showPassSignup" className="text-sm text-neutral-600 select-none cursor-pointer">Show password</label>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-700 block">Phone (optional)</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input type="tel" value={form.phone} onChange={(e) => updateForm('phone', e.target.value)} placeholder="e.g. +91 9876543210" className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-neutral-800" />
                </div>
              </div>

              {selectedRole === 'teacher' && (
                <div className="bg-neutral-50 rounded-xl p-4 space-y-3 border border-neutral-100">
                  <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Teacher Details</p>
                  <div>
                    <label className="text-xs font-medium text-neutral-700 block mb-1">Department</label>
                    <input type="text" value={teacherFields.department} onChange={(e) => setTeacherFields(p => ({ ...p, department: e.target.value }))} placeholder="e.g. Mathematics" className="w-full px-3.5 py-2 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-neutral-800" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-neutral-700 block mb-1">Qualification</label>
                    <input type="text" value={teacherFields.qualification} onChange={(e) => setTeacherFields(p => ({ ...p, qualification: e.target.value }))} placeholder="e.g. M.Ed. Mathematics" className="w-full px-3.5 py-2 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-neutral-800" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-neutral-700 block mb-1">Employee ID</label>
                    <input type="text" value={teacherFields.employeeId} onChange={(e) => setTeacherFields(p => ({ ...p, employeeId: e.target.value }))} placeholder="e.g. T001" className="w-full px-3.5 py-2 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-neutral-800" />
                  </div>
                </div>
              )}

              {errorMsg && (
                <div className="bg-danger-50 border border-danger-100 text-danger-700 text-xs px-4 py-3 rounded-xl flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-danger-500 flex-shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button type="submit" disabled={isSubmitting} className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 rounded-xl shadow-md text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:bg-primary-400">
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-4.5 w-4.5 border-b-2 border-white"></div>
                ) : (
                  'Create Account'
                )}
              </button>

              <p className="text-center text-sm text-neutral-500">
                Already have an account?{' '}
                <button type="button" onClick={onSwitchToLogin} className="font-semibold text-primary-600 hover:text-primary-700">
                  Login
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
