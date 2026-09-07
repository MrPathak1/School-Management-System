import { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Bus,
  Calendar,
  CreditCard,
  DollarSign,
  ClipboardCheck,
  FileText,
  Bell,
  ChevronDown,
  Menu,
  X,
  LogOut,
  User,
  ClockIcon,
  TrendingUp,
  MessageSquare,
  Library,
  Heart,
  Image,
} from 'lucide-react';
import { useApp, UserRole } from '../contexts/AppContext';
import { AIAssistant } from './AIAssistant';

const navItems: Record<UserRole, Array<{ icon: React.ElementType; label: string; id: string }>> = {
  admin: [
    { icon: LayoutDashboard, label: 'Dashboard', id: 'dashboard' },
    { icon: TrendingUp, label: 'Analytics', id: 'analytics' },
    { icon: Users, label: 'Students', id: 'students' },
    { icon: GraduationCap, label: 'Teachers', id: 'teachers' },
    { icon: BookOpen, label: 'Classes', id: 'classes' },
    { icon: BookOpen, label: 'Subjects', id: 'subjects' },
    { icon: Calendar, label: 'Schedule', id: 'schedule' },
    { icon: ClipboardCheck, label: 'Attendance', id: 'attendance_overview' },
    { icon: DollarSign, label: 'Fees', id: 'fees' },
    { icon: Bus, label: 'Bus Tracking', id: 'bus' },
    { icon: CreditCard, label: 'Identity Cards', id: 'identity' },
    { icon: Calendar, label: 'Exam', id: 'exam_dashboard' },
    { icon: Calendar, label: 'Events', id: 'events_admin' },
    { icon: MessageSquare, label: 'Messages', id: 'messages_admin' },
    { icon: BookOpen, label: 'Materials', id: 'materials_admin' },
    { icon: Library, label: 'Library', id: 'library_admin' },
    { icon: Heart, label: 'Health', id: 'health_admin' },
    { icon: Image, label: 'Gallery', id: 'gallery_admin' },
  ],
  teacher: [
    { icon: LayoutDashboard, label: 'Dashboard', id: 'dashboard' },
    { icon: ClipboardCheck, label: 'Attendance', id: 'attendance' },
    { icon: FileText, label: 'Grade Book', id: 'grades' },
    { icon: BookOpen, label: 'Assignments', id: 'assignments' },
    { icon: FileText, label: 'Exams', id: 'exams' },
    { icon: FileText, label: 'Exam Schedule', id: 'exam_schedule' },
    { icon: FileText, label: 'Documents', id: 'documents' },
    { icon: BookOpen, label: 'Materials', id: 'materials_teacher' },
    { icon: MessageSquare, label: 'Messages', id: 'messages_teacher' },
    { icon: Calendar, label: 'Events', id: 'events_teacher' },
    { icon: Library, label: 'Library', id: 'library_teacher' },
    { icon: Heart, label: 'Health', id: 'health_teacher' },
    { icon: Image, label: 'Gallery', id: 'gallery_teacher' },
    { icon: Calendar, label: 'Schedule', id: 'schedule' },
    { icon: Users, label: 'My Students', id: 'students' },
  ],
  parent: [
    { icon: LayoutDashboard, label: 'Dashboard', id: 'dashboard' },
    { icon: Users, label: 'My Children', id: 'children' },
    { icon: TrendingUp, label: 'Performance', id: 'performance' },
    { icon: ClipboardCheck, label: 'Attendance', id: 'attendance' },
    { icon: DollarSign, label: 'Fees', id: 'fees' },
    { icon: MessageSquare, label: 'Messages', id: 'messages_parent' },
    { icon: BookOpen, label: 'Materials', id: 'materials_parent' },
    { icon: Calendar, label: 'Events', id: 'events_parent' },
    { icon: Heart, label: 'Health', id: 'health_parent' },
    { icon: Image, label: 'Gallery', id: 'gallery_parent' },
    { icon: Bell, label: 'Notices', id: 'notices' },
    { icon: Bus, label: 'Bus Tracking', id: 'bus' },
    { icon: FileText, label: 'Exam Schedule', id: 'exam_schedule' },
  ],
  student: [
    { icon: LayoutDashboard, label: 'Dashboard', id: 'dashboard' },
    { icon: User, label: 'My Profile', id: 'profile' },
    { icon: ClipboardCheck, label: 'Attendance', id: 'attendance' },
    { icon: Calendar, label: 'Timetable', id: 'timetable' },
    { icon: ClockIcon, label: 'Assignments', id: 'assignments' },
    { icon: FileText, label: 'Exam', id: 'exam' },
    { icon: BookOpen, label: 'Materials', id: 'materials_student' },
    { icon: Calendar, label: 'Events', id: 'events_student' },
    { icon: Library, label: 'Library', id: 'library_student' },
    { icon: Heart, label: 'Health', id: 'health_student' },
    { icon: Image, label: 'Gallery', id: 'gallery_student' },
    { icon: FileText, label: 'Documents', id: 'documents' },
    { icon: DollarSign, label: 'Fees', id: 'fees' },
    { icon: Bus, label: 'Bus Tracking', id: 'bus' },
  ],
};

interface LayoutProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  children: React.ReactNode;
}

export function Layout({ activeTab, setActiveTab, children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const { role, setRole, currentUser, notifications, loading, markNotificationRead, authRole, logout } = useApp();

  const currentNav = navItems[role];
  const unreadCount = notifications.filter(n => !n.read).length;

  const getAllowedSwitchRoles = (): UserRole[] => {
    return [];
  };

  const allowedRoles = getAllowedSwitchRoles();

  const roleLabels: Record<UserRole, string> = {
    admin: 'Administrator',
    teacher: 'Teacher',
    student: 'Student',
    parent: 'Parent',
  };

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    setActiveTab('dashboard');
    setProfileDropdownOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const SidebarContent = () => (
    <>
      <div className="flex items-center gap-3 px-4 py-6 border-b border-primary-800">
        <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
          <GraduationCap className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-white font-bold text-lg">Mr Pathak School</h1>
          <p className="text-primary-200 text-xs">Excellence in Education</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {currentNav.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${
                isActive
                  ? 'bg-white/10 text-white'
                  : 'text-primary-100 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {allowedRoles.length > 1 && (
        <div className="p-4 border-t border-primary-800 animate-fade-in">
          <p className="text-primary-200 text-xs mb-2">Switch Role (Testing)</p>
          <div className="flex gap-1">
            {allowedRoles.map((r) => (
              <button
                key={r}
                onClick={() => handleRoleChange(r)}
                className={`flex-1 py-2 px-2 rounded text-xs font-medium transition-colors ${
                  role === r
                    ? 'bg-white text-primary-700'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-primary-700 flex flex-col transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-20'
        } ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        {sidebarOpen ? (
          <SidebarContent />
        ) : (
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-primary-800">
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center lg:hidden"
              >
                <X className="w-5 h-5 text-white" />
              </button>
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hidden lg:flex">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
            </div>
            <nav className="flex-1 p-2 space-y-1">
              {currentNav.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-center p-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-white/10 text-white'
                        : 'text-primary-100 hover:bg-white/5 hover:text-white'
                    }`}
                    title={item.label}
                  >
                    <Icon className="w-5 h-5" />
                  </button>
                );
              })}
            </nav>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <div
        className={`transition-all duration-300 ${
          sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'
        }`}
      >
        {/* Header */}
        <header className="bg-white border-b border-neutral-200 sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-neutral-100 text-neutral-600"
              >
                <Menu className="w-5 h-5" />
              </button>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="hidden lg:block p-2 rounded-lg hover:bg-neutral-100 text-neutral-600"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-lg font-semibold text-neutral-900">
                  {currentNav.find((item) => item.id === activeTab)?.label || 'Dashboard'}
                </h2>
                <p className="text-sm text-neutral-500">{roleLabels[role]} View</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                  className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-600 relative"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-danger-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {notifDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setNotifDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-neutral-100 z-20 max-h-96 overflow-hidden">
                      <div className="px-4 py-3 border-b border-neutral-100">
                        <h3 className="font-semibold text-neutral-900">Notifications</h3>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <p className="p-4 text-neutral-400 text-sm text-center">No notifications</p>
                        ) : (
                          notifications.slice(0, 5).map((notif) => (
                            <button
                              key={notif.id}
                              onClick={() => markNotificationRead(notif.id)}
                              className={`w-full px-4 py-3 text-left hover:bg-neutral-50 transition-colors border-b border-neutral-50 ${
                                !notif.read ? 'bg-primary-50/50' : ''
                              }`}
                            >
                              <p className="text-sm font-medium text-neutral-900">{notif.title}</p>
                              <p className="text-xs text-neutral-500 mt-1">{notif.message}</p>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Profile */}
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 p-2 pr-3 rounded-lg hover:bg-neutral-100"
                >
                  <img
                    src={currentUser?.user.avatar_url || 'https://via.placeholder.com/40'}
                    alt={currentUser?.user.full_name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="hidden sm:block text-sm font-medium text-neutral-700">
                    {currentUser?.user.full_name}
                  </span>
                  <ChevronDown className="w-4 h-4 text-neutral-400" />
                </button>

                {profileDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setProfileDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-neutral-100 z-20">
                      <div className="px-4 py-3 border-b border-neutral-100">
                        <p className="font-medium text-neutral-900">{currentUser?.user.full_name}</p>
                        <p className="text-sm text-neutral-500">{currentUser?.user.email}</p>
                      </div>
                      <div className="p-2">
                        {allowedRoles.length > 1 && (
                          <>
                            <p className="px-3 py-2 text-xs font-medium text-neutral-400 uppercase">Switch Role</p>
                            {allowedRoles.map((r) => (
                              <button
                                key={r}
                                onClick={() => handleRoleChange(r)}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                                  role === r
                                    ? 'bg-primary-50 text-primary-700'
                                    : 'hover:bg-neutral-50 text-neutral-700'
                                }`}
                              >
                                {r.charAt(0).toUpperCase() + r.slice(1)}
                              </button>
                            ))}
                          </>
                        )}
                        <div className="border-t border-neutral-100 mt-1 pt-1">
                          <button
                            onClick={logout}
                            className="w-full text-left px-3 py-2 rounded-lg text-sm text-danger-600 hover:bg-danger-50 transition-colors flex items-center gap-2"
                          >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-6">{children}</main>
      </div>
      <AIAssistant />
    </div>
  );
}
