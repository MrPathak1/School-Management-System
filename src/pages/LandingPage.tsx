import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { useToastStore } from '../hooks/useToast';
import { SignupPage } from './SignupPage';
import {
  GraduationCap,
  Users,
  Award,
  BookOpen,
  ArrowRight,
  Lock,
  Mail,
  X,
  Compass,
  Laptop,
  Briefcase,
  Eye,
  EyeOff,
  AlertCircle
} from 'lucide-react';

export function LandingPage() {
  const { login } = useApp();
  const addToast = useToastStore((s) => s.addToast);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleQuickLogin = (presetEmail: string) => {
    setEmail(presetEmail);
    setPassword('');
    setErrorMsg('');
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email) {
      setErrorMsg('Please enter your email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await login(email, password);
      if (success) {
        addToast({ type: 'success', title: 'Login Successful', message: 'Welcome back to the portal!' });
        setIsModalOpen(false);
      } else {
        setErrorMsg('Invalid credentials. User with this email does not exist.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('An error occurred during login. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col font-sans">
      {/* Navigation */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-md shadow-primary-200">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg text-neutral-900 leading-none block">Mr Pathak School</span>
              <span className="text-xs text-neutral-500 font-medium">Affiliated to CBSE, New Delhi (Aff. No. 1930111)</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-600">
            <a href="#about" className="hover:text-primary-600 transition-colors">About Us</a>
            <a href="#academics" className="hover:text-primary-600 transition-colors">Academics</a>
            <a href="#campus" className="hover:text-primary-600 transition-colors">Campus Life</a>
            <a href="#contact" className="hover:text-primary-600 transition-colors">Contact</a>
          </nav>

          <div>
            <button
              onClick={() => {
                setErrorMsg('');
                setIsModalOpen(true);
              }}
              className="bg-primary-600 text-white hover:bg-primary-700 font-semibold text-sm px-5 py-2.5 rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-2"
            >
              <Lock className="w-4 h-4" />
              Portal Login
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-700 via-primary-800 to-indigo-900 text-white py-20 lg:py-28 relative overflow-hidden flex-shrink-0">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <span className="bg-white/15 text-primary-200 text-xs font-semibold uppercase tracking-wider px-3.5 py-1.5 rounded-full inline-block">
              Admissions Open for Academic Session 2026-27 (Grades K-12)
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-none text-white">
              Nurturing Learners, <br />
              <span className="text-primary-300">Building Character.</span>
            </h1>
            <p className="text-lg text-primary-100/90 leading-relaxed max-w-xl">
              Mr Pathak School is dedicated to providing quality CBSE education that prepares children to explore their true potentials and build strong moral foundations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => {
                  setErrorMsg('');
                  setIsModalOpen(true);
                }}
                className="bg-white text-primary-800 hover:bg-neutral-100 font-semibold px-6 py-3 rounded-lg shadow-md transition-colors flex items-center justify-center gap-2"
              >
                Login to Portal
                <ArrowRight className="w-5 h-5 text-primary-700" />
              </button>
              <a
                href="#about"
                className="border-2 border-white/30 hover:border-white text-white font-semibold px-6 py-3 rounded-lg transition-colors flex items-center justify-center"
              >
                Read About Us
              </a>
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
              <div className="relative rounded-xl overflow-hidden bg-neutral-900/40">
                <img
                  src="/school_campus.png"
                  alt="Mr Pathak School Campus"
                  className="w-full h-auto object-cover aspect-video hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-4">
                  <p className="text-sm font-bold text-white">Our Modern Campus</p>
                  <p className="text-xs text-primary-200 mt-0.5">Lush green environment promoting healthy learning cycles</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Counter Section */}
      <section className="bg-white py-12 border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center space-y-1">
              <div className="mx-auto w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600 mb-2">
                <Users className="w-6 h-6" />
              </div>
              <p className="text-3xl font-extrabold text-neutral-900">500+</p>
              <p className="text-sm text-neutral-500 font-medium">Students (K-12)</p>
            </div>
            <div className="text-center space-y-1">
              <div className="mx-auto w-12 h-12 bg-success-50 rounded-xl flex items-center justify-center text-success-600 mb-2">
                <Briefcase className="w-6 h-6" />
              </div>
              <p className="text-3xl font-extrabold text-neutral-900">30+</p>
              <p className="text-sm text-neutral-500 font-medium">Qualified Teachers</p>
            </div>
            <div className="text-center space-y-1">
              <div className="mx-auto w-12 h-12 bg-warning-50 rounded-xl flex items-center justify-center text-warning-600 mb-2">
                <Award className="w-6 h-6" />
              </div>
              <p className="text-3xl font-extrabold text-neutral-900">100%</p>
              <p className="text-sm text-neutral-500 font-medium">CBSE Pass Rate</p>
            </div>
            <div className="text-center space-y-1">
              <div className="mx-auto w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 mb-2">
                <BookOpen className="w-6 h-6" />
              </div>
              <p className="text-3xl font-extrabold text-neutral-900">10+</p>
              <p className="text-sm text-neutral-500 font-medium">Years of Excellence</p>
            </div>
          </div>
        </div>
      </section>

      {/* About / Pillars Section */}
      <section id="about" className="py-20 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-primary-600">Core Pillars</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-neutral-900 mt-2">
              Why Mr Pathak School?
            </p>
            <p className="text-neutral-500 mt-4 leading-relaxed">
              We focus on providing a well-rounded educational experience that balances the CBSE curriculum with strong character building, co-curricular arts, sports, and tech learning.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-neutral-200/60 shadow-sm hover:shadow-md transition-shadow space-y-4">
              <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900">Academic Foundations</h3>
              <p className="text-sm text-neutral-500 leading-relaxed">
                Structured curriculum aligned with CBSE guidelines, with emphasis on core languages, mathematics, logical reasoning, and active student-teacher dialogue.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-neutral-200/60 shadow-sm hover:shadow-md transition-shadow space-y-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                <Laptop className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900">Modern Facilities</h3>
              <p className="text-sm text-neutral-500 leading-relaxed">
                Smart classrooms, advanced composite science labs, modern IT learning labs, and digital portals facilitating seamless academic tracking.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-neutral-200/60 shadow-sm hover:shadow-md transition-shadow space-y-4">
              <div className="w-12 h-12 bg-warning-50 rounded-xl flex items-center justify-center text-warning-600">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900">Co-curricular & Sports</h3>
              <p className="text-sm text-neutral-500 leading-relaxed">
                Dedicated training in cricket, football, athletics, yoga, and visual/performing arts to foster a child's natural talents and leadership skills.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-neutral-900 text-neutral-400 py-12 border-t border-neutral-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-white text-base">Mr Pathak School</span>
            </div>
            <p className="text-sm">
              Nurturing character, integrity, and knowledge to empower the next generation.
            </p>
          </div>
          <div className="md:text-right space-y-2 text-sm">
            <p className="text-white font-medium">Contact Inquiries</p>
            <p>Sector 4, Dwarka, New Delhi - 110075</p>
            <p>info@mrpathakschool.edu.in | +91 11 4556 7890</p>
          </div>
        </div>
      </footer>

      {/* Login Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200 w-full max-w-lg overflow-hidden animate-fade-in flex flex-col">
            <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50">
              <div className="flex items-center gap-2.5">
                <Lock className="w-5 h-5 text-primary-600" />
                <h3 className="font-bold text-lg text-neutral-900">Portal Login</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-200/50 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 flex-1 overflow-y-auto">
              <p className="text-sm text-neutral-500">
                To test the portal, you can click on one of the demo role cards below to pre-fill credentials, or sign in using any valid student/teacher email.
              </p>

              {/* Quick Login Roles */}
              <div className="space-y-2.5">
                <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block">
                  Quick Login Demo Accounts
                </label>
                <div className="grid grid-cols-4 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('admin@school.edu')}
                    className="p-3 border border-neutral-200 hover:border-primary-500 hover:bg-primary-50/20 rounded-xl text-left transition-all"
                  >
                    <span className="block text-xs font-bold text-primary-700">Admin</span>
                    <span className="text-[10px] text-neutral-500 truncate block mt-0.5">John Admin</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('teacher1@school.edu')}
                    className="p-3 border border-neutral-200 hover:border-primary-500 hover:bg-primary-50/20 rounded-xl text-left transition-all"
                  >
                    <span className="block text-xs font-bold text-success-700">Teacher</span>
                    <span className="text-[10px] text-neutral-500 truncate block mt-0.5">Sarah J. (Math)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('student1@school.edu')}
                    className="p-3 border border-neutral-200 hover:border-primary-500 hover:bg-primary-50/20 rounded-xl text-left transition-all"
                  >
                    <span className="block text-xs font-bold text-warning-700">Student</span>
                    <span className="text-[10px] text-neutral-500 truncate block mt-0.5">Alice T. (Gr 10)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('robert.t@email.com')}
                    className="p-3 border border-neutral-200 hover:border-primary-500 hover:bg-primary-50/20 rounded-xl text-left transition-all"
                  >
                    <span className="block text-xs font-bold text-purple-700">Parent</span>
                    <span className="text-[10px] text-neutral-500 truncate block mt-0.5">Robert Thompson</span>
                  </button>
                </div>
              </div>

              {/* Login Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-700 block">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setErrorMsg('');
                      }}
                      placeholder="e.g. admin@school.edu"
                      className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-neutral-800"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-700 block">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      key={showPassword ? 'text' : 'password'}
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setErrorMsg('');
                      }}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-neutral-800"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 -mt-1">
                  <input
                    type="checkbox"
                    id="showPassLogin"
                    checked={showPassword}
                    onChange={() => setShowPassword(!showPassword)}
                    className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                  />
                  <label htmlFor="showPassLogin" className="text-sm text-neutral-600 select-none cursor-pointer">
                    Show password
                  </label>
                </div>

                {errorMsg && (
                  <div className="bg-danger-50 border border-danger-100 text-danger-700 text-xs px-4 py-3 rounded-xl flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-danger-500 flex-shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 rounded-xl shadow-md text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:bg-primary-400"
                >
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-4.5 w-4.5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      Verify and Login
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="text-center pt-1">
                <span className="text-sm text-neutral-500">Don't have an account? </span>
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setShowSignup(true);
                    setErrorMsg('');
                  }}
                  className="text-sm font-semibold text-primary-600 hover:text-primary-700"
                >
                  Sign up
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showSignup && (
        <SignupPage
          onClose={() => setShowSignup(false)}
          onSwitchToLogin={() => {
            setShowSignup(false);
            setIsModalOpen(true);
            setErrorMsg('');
          }}
        />
      )}
    </div>
  );
}
