import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase, User, Student, Teacher, Notification } from '../lib/supabase';
import { useToastStore } from '../hooks/useToast';
import { usePermissions } from '../hooks/usePermissions';

export type UserRole = 'admin' | 'teacher' | 'student' | 'parent';

interface CurrentUser {
  user: User;
  student?: Student & { class: { name: string; section: string } };
  teacher?: Teacher;
  children?: Array<Student & { user: User; class: { name: string; section: string } }>;
}

interface AppContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  currentUser: CurrentUser | null;
  notifications: Notification[];
  loading: boolean;
  refreshNotifications: () => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  authRole: UserRole | null;
  authUserId: string | null;
  isAuthenticated: boolean;
  can: (action: import('../hooks/usePermissions').Action) => boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Predefined users for role switching simulation
const USERS: Record<UserRole, string> = {
  admin: '00000001-1111-1111-1111-111111111111',
  teacher: '00000002-2222-2222-2222-222222222222',
  student: '00000005-5555-5555-5555-555555555555',
  parent: '00000009-9999-9999-9999-999999999999',
};

// Demo users hardcoded fallback (mirrors seed data in migrations)
const DEMO_USERS: Record<string, {
  id: string; email: string; full_name: string; role: UserRole;
  student?: { id: string; roll_number: string; class_id: string; class_name: string; class_section: string; guardian_name: string; guardian_email: string; guardian_phone: string };
  teacher?: { id: string; employee_id: string; department: string; qualification: string };
}> = {
  'admin@school.edu': {
    id: '00000001-1111-1111-1111-111111111111', email: 'admin@school.edu', full_name: 'John Administrator', role: 'admin',
  },
  'teacher1@school.edu': {
    id: '00000002-2222-2222-2222-222222222222', email: 'teacher1@school.edu', full_name: 'Sarah Johnson', role: 'teacher',
    teacher: { id: '30000001-1111-1111-1111-111111111111', employee_id: 'T001', department: 'Mathematics', qualification: 'M.Ed. Mathematics' },
  },
  'teacher2@school.edu': {
    id: '00000003-3333-3333-3333-333333333333', email: 'teacher2@school.edu', full_name: 'Michael Chen', role: 'teacher',
    teacher: { id: '30000002-2222-2222-2222-222222222222', employee_id: 'T002', department: 'Science', qualification: 'M.Sc. Physics' },
  },
  'teacher3@school.edu': {
    id: '00000004-4444-4444-4444-444444444444', email: 'teacher3@school.edu', full_name: 'Emily Davis', role: 'teacher',
    teacher: { id: '30000003-3333-3333-3333-333333333333', employee_id: 'T003', department: 'Languages', qualification: 'M.A. English Literature' },
  },
  'student1@school.edu': {
    id: '00000005-5555-5555-5555-555555555555', email: 'student1@school.edu', full_name: 'Alice Thompson', role: 'student',
    student: { id: '40000001-1111-1111-1111-111111111111', roll_number: '2025001', class_id: '10000001-1111-1111-1111-111111111111', class_name: '10', class_section: 'A', guardian_name: 'Robert Thompson', guardian_email: 'robert.t@email.com', guardian_phone: '+1-555-1001' },
  },
  'student2@school.edu': {
    id: '00000006-6666-6666-6666-666666666666', email: 'student2@school.edu', full_name: 'Bob Williams', role: 'student',
    student: { id: '40000002-2222-2222-2222-222222222222', roll_number: '2025002', class_id: '10000001-1111-1111-1111-111111111111', class_name: '10', class_section: 'A', guardian_name: 'Mary Williams', guardian_email: 'mary.w@email.com', guardian_phone: '+1-555-1002' },
  },
  'student3@school.edu': {
    id: '00000007-7777-7777-7777-777777777777', email: 'student3@school.edu', full_name: 'Charlie Brown', role: 'student',
    student: { id: '40000003-3333-3333-3333-333333333333', roll_number: '2025003', class_id: '10000001-1111-1111-1111-111111111111', class_name: '10', class_section: 'A', guardian_name: 'Sandra Brown', guardian_email: 'sandra.b@email.com', guardian_phone: '+1-555-1003' },
  },
  'student4@school.edu': {
    id: '00000008-8888-8888-8888-888888888888', email: 'student4@school.edu', full_name: 'Diana Martinez', role: 'student',
    student: { id: '40000004-2222-2222-2222-222222222222', roll_number: '2025004', class_id: '10000002-2222-2222-2222-222222222222', class_name: '10', class_section: 'B', guardian_name: 'Carlos Martinez', guardian_email: 'carlos.m@email.com', guardian_phone: '+1-555-1004' },
  },
  'student5@school.edu': {
    id: '00000009-9999-9999-9999-999999999999', email: 'student5@school.edu', full_name: 'Ethan Wilson', role: 'student',
    student: { id: '40000005-5555-5555-5555-555555555555', roll_number: '2025005', class_id: '10000002-2222-2222-2222-222222222222', class_name: '10', class_section: 'B', guardian_name: 'Patricia Wilson', guardian_email: 'patricia.w@email.com', guardian_phone: '+1-555-1005' },
  },
  'student6@school.edu': {
    id: '0000000a-aaaa-aaaa-aaaa-aaaaaaaaaaaa', email: 'student6@school.edu', full_name: 'Fiona Garcia', role: 'student',
    student: { id: '40000006-6666-6666-6666-666666666666', roll_number: '2025006', class_id: '10000003-3333-3333-3333-333333333333', class_name: '11', class_section: 'A', guardian_name: 'Maria Garcia', guardian_email: 'maria.g@email.com', guardian_phone: '+1-555-1006' },
  },
  'student7@school.edu': {
    id: '0000000b-bbbb-bbbb-bbbb-bbbbbbbbbbbb', email: 'student7@school.edu', full_name: 'George Lee', role: 'student',
    student: { id: '40000007-7777-7777-7777-777777777777', roll_number: '2025007', class_id: '10000003-3333-3333-3333-333333333333', class_name: '11', class_section: 'A', guardian_name: 'James Lee', guardian_email: 'james.l@email.com', guardian_phone: '+1-555-1007' },
  },
  'student8@school.edu': {
    id: '0000000c-cccc-cccc-cccc-cccccccccccc', email: 'student8@school.edu', full_name: 'Hannah White', role: 'student',
    student: { id: '40000008-8888-8888-8888-888888888888', roll_number: '2025008', class_id: '10000004-4444-4444-4444-444444444444', class_name: '11', class_section: 'B', guardian_name: 'Linda White', guardian_email: 'linda.w@email.com', guardian_phone: '+1-555-1008' },
  },
};

const DEMO_PARENTS: Record<string, { email: string; guardian_name: string; guardian_phone: string; children: Array<{ student_id: string; user_id: string; roll_number: string; student_name: string; class_id: string; class_name: string; class_section: string }> }> = {
  'robert.t@email.com': {
    email: 'robert.t@email.com', guardian_name: 'Robert Thompson', guardian_phone: '+1-555-1001',
    children: [{ student_id: '40000001-1111-1111-1111-111111111111', user_id: '00000005-5555-5555-5555-555555555555', roll_number: '2025001', student_name: 'Alice Thompson', class_id: '10000001-1111-1111-1111-111111111111', class_name: '10', class_section: 'A' }],
  },
  'mary.w@email.com': {
    email: 'mary.w@email.com', guardian_name: 'Mary Williams', guardian_phone: '+1-555-1002',
    children: [{ student_id: '40000002-2222-2222-2222-222222222222', user_id: '00000006-6666-6666-6666-666666666666', roll_number: '2025002', student_name: 'Bob Williams', class_id: '10000001-1111-1111-1111-111111111111', class_name: '10', class_section: 'A' }],
  },
  'sandra.b@email.com': {
    email: 'sandra.b@email.com', guardian_name: 'Sandra Brown', guardian_phone: '+1-555-1003',
    children: [{ student_id: '40000003-3333-3333-3333-333333333333', user_id: '00000007-7777-7777-7777-777777777777', roll_number: '2025003', student_name: 'Charlie Brown', class_id: '10000001-1111-1111-1111-111111111111', class_name: '10', class_section: 'A' }],
  },
  'carlos.m@email.com': {
    email: 'carlos.m@email.com', guardian_name: 'Carlos Martinez', guardian_phone: '+1-555-1004',
    children: [{ student_id: '40000004-2222-2222-2222-222222222222', user_id: '00000008-8888-8888-8888-888888888888', roll_number: '2025004', student_name: 'Diana Martinez', class_id: '10000002-2222-2222-2222-222222222222', class_name: '10', class_section: 'B' }],
  },
  'patricia.w@email.com': {
    email: 'patricia.w@email.com', guardian_name: 'Patricia Wilson', guardian_phone: '+1-555-1005',
    children: [{ student_id: '40000005-5555-5555-5555-555555555555', user_id: '00000009-9999-9999-9999-999999999999', roll_number: '2025005', student_name: 'Ethan Wilson', class_id: '10000002-2222-2222-2222-222222222222', class_name: '10', class_section: 'B' }],
  },
  'maria.g@email.com': {
    email: 'maria.g@email.com', guardian_name: 'Maria Garcia', guardian_phone: '+1-555-1006',
    children: [{ student_id: '40000006-6666-6666-6666-666666666666', user_id: '0000000a-aaaa-aaaa-aaaa-aaaaaaaaaaaa', roll_number: '2025006', student_name: 'Fiona Garcia', class_id: '10000003-3333-3333-3333-333333333333', class_name: '11', class_section: 'A' }],
  },
  'james.l@email.com': {
    email: 'james.l@email.com', guardian_name: 'James Lee', guardian_phone: '+1-555-1007',
    children: [{ student_id: '40000007-7777-7777-7777-777777777777', user_id: '0000000b-bbbb-bbbb-bbbb-bbbbbbbbbbbb', roll_number: '2025007', student_name: 'George Lee', class_id: '10000003-3333-3333-3333-333333333333', class_name: '11', class_section: 'A' }],
  },
  'linda.w@email.com': {
    email: 'linda.w@email.com', guardian_name: 'Linda White', guardian_phone: '+1-555-1008',
    children: [{ student_id: '40000008-8888-8888-8888-888888888888', user_id: '0000000c-cccc-cccc-cccc-cccccccccccc', roll_number: '2025008', student_name: 'Hannah White', class_id: '10000004-4444-4444-4444-444444444444', class_name: '11', class_section: 'B' }],
  },
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [authRole, setAuthRole] = useState<UserRole | null>(null);
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState<UserRole>('admin');
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const saved = localStorage.getItem('school_session');
    if (saved) {
      try {
        const session = JSON.parse(saved);
        setAuthRole(session.role);
        setAuthUserId(session.id);
        setRole(session.role);
        setIsAuthenticated(true);
      } catch (e) {
        console.error('Error parsing session:', e);
        localStorage.removeItem('school_session');
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const loadUserData = useCallback(async (userRole: UserRole, targetUserId: string) => {
    setLoading(true);
    try {
      // Handle parent role separately
      if (userRole === 'parent') {
        const session = JSON.parse(localStorage.getItem('school_session') || '{}');
        const parentEmail = session.email || '';

        // 1) Try DB
        const { data: parentStudents } = await supabase
          .from('students')
          .select(`*, user:users(*), class:classes(name, section)`)
          .eq('guardian_email', parentEmail);

        if (parentStudents && parentStudents.length > 0) {
          const guardianName = parentStudents[0].guardian_name;
          const virtualUser: User = {
            id: targetUserId,
            email: parentEmail,
            full_name: guardianName,
            role: 'parent',
            avatar_url: null,
            phone: parentStudents[0].guardian_phone,
            created_at: new Date().toISOString(),
          };
          const children = parentStudents as Array<Student & { user: User; class: { name: string; section: string } }>;
          setCurrentUser({ user: virtualUser, children });
        } else {
          // 2) Fallback: hardcoded demo parent
          const demoParent = DEMO_PARENTS[parentEmail];
          if (demoParent) {
            const virtualUser: User = {
              id: targetUserId,
              email: parentEmail,
              full_name: demoParent.guardian_name,
              role: 'parent',
              avatar_url: null,
              phone: demoParent.guardian_phone,
              created_at: new Date().toISOString(),
            };
            const children = demoParent.children.map(c => ({
              id: c.student_id,
              user_id: c.user_id,
              roll_number: c.roll_number,
              class_id: c.class_id,
              admission_date: '',
              guardian_name: demoParent.guardian_name,
              guardian_phone: demoParent.guardian_phone,
              guardian_email: parentEmail,
              address: null,
              status: 'active' as const,
              created_at: new Date().toISOString(),
              user: { id: c.user_id, email: c.student_name.toLowerCase().replace(' ', '.') + '@school.edu', full_name: c.student_name, role: 'student' as const, avatar_url: null, phone: '', created_at: '' },
              class: { name: c.class_name, section: c.class_section },
            }));
            setCurrentUser({ user: virtualUser, children: children as any });
          }
        }

        setNotifications([]);
        setLoading(false);
        return;
      }

      // 1) Try DB
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', targetUserId)
        .single();

      if (!userError && userData) {
        let currentUserData: CurrentUser = { user: userData };

        // Fetch role-specific data
        if (userRole === 'student') {
          const { data: studentData } = await supabase
            .from('students')
            .select(`*, class:classes(name, section)`)
            .eq('user_id', targetUserId)
            .single();

          if (studentData) {
            currentUserData.student = studentData as Student & { class: { name: string; section: string } };
          }
        } else if (userRole === 'teacher') {
          const { data: teacherData } = await supabase
            .from('teachers')
            .select('*')
            .eq('user_id', targetUserId)
            .single();

          if (teacherData) {
            currentUserData.teacher = teacherData;
          }
        }

        setCurrentUser(currentUserData);

        // Fetch notifications
        const { data: notifData } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', targetUserId)
          .order('created_at', { ascending: false });

        setNotifications(notifData || []);
        setLoading(false);
        return;
      }

      // 2) Fallback: hardcoded demo user
      const session = JSON.parse(localStorage.getItem('school_session') || '{}');
      const demoUser = DEMO_USERS[session.email || ''];
      if (demoUser) {
        const fallbackUser: User = {
          id: demoUser.id, email: demoUser.email, full_name: demoUser.full_name,
          role: demoUser.role, avatar_url: null, phone: '', created_at: '',
        };
        let currentUserData: CurrentUser = { user: fallbackUser };

        if (demoUser.role === 'student' && demoUser.student) {
          currentUserData.student = {
            id: demoUser.student.id, user_id: demoUser.id, roll_number: demoUser.student.roll_number,
            class_id: demoUser.student.class_id, admission_date: '', guardian_name: demoUser.student.guardian_name,
            guardian_phone: demoUser.student.guardian_phone, guardian_email: demoUser.student.guardian_email,
            address: null, status: 'active', created_at: '',
            class: { name: demoUser.student.class_name, section: demoUser.student.class_section },
          } as any;
        } else if (demoUser.role === 'teacher' && demoUser.teacher) {
          currentUserData.teacher = {
            id: demoUser.teacher.id, user_id: demoUser.id, employee_id: demoUser.teacher.employee_id,
            qualification: demoUser.teacher.qualification, department: demoUser.teacher.department,
            joining_date: '', status: 'active', created_at: '',
          } as any;
        }

        setCurrentUser(currentUserData);
        setNotifications([]);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update user data on active role switch
  useEffect(() => {
    if (isAuthenticated && authUserId) {
      if (role === authRole) {
        loadUserData(role, authUserId);
      } else {
        loadUserData(role, USERS[role]);
      }
    } else {
      setLoading(false);
    }
  }, [role, authRole, authUserId, isAuthenticated, loadUserData]);

  // Realtime subscription for notifications
  useEffect(() => {
    if (!isAuthenticated || !currentUser?.user.id) return;

    const channel = supabase
      .channel('notifications-realtime')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${currentUser.user.id}` },
        (payload) => {
          const newNotif = payload.new as Notification;
          setNotifications(prev => [newNotif, ...prev]);
          useToastStore.getState().addToast({
            type: newNotif.type === 'error' ? 'error' : newNotif.type === 'warning' ? 'warning' : newNotif.type === 'success' ? 'success' : 'info',
            title: newNotif.title,
            message: newNotif.message,
          });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [isAuthenticated, currentUser?.user.id]);

  const login = async (email: string, password?: string): Promise<boolean> => {
    setLoading(true);
    try {
      // 0) Check localStorage registered_users first (email + password)
      const registered = JSON.parse(localStorage.getItem('registered_users') || '[]');
      const foundRegistered = registered.find((u: any) => u.email === email);
      if (foundRegistered) {
        const storedPass = foundRegistered.password || '';
        const inputPass = btoa(password || '');
        if (storedPass !== inputPass) {
          throw new Error('Invalid password');
        }
        localStorage.setItem('school_session', JSON.stringify({ email: foundRegistered.email, role: foundRegistered.role, id: foundRegistered.id }));
        setAuthRole(foundRegistered.role);
        setAuthUserId(foundRegistered.id);
        setRole(foundRegistered.role);
        setIsAuthenticated(true);
        return true;
      }

      // 1) Try users table first (admin, teacher, student)
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (!userError && userData) {
        const userRole = userData.role as UserRole;
        const userId = userData.id;
        localStorage.setItem('school_session', JSON.stringify({ email: userData.email, role: userRole, id: userId }));
        setAuthRole(userRole);
        setAuthUserId(userId);
        setRole(userRole);
        setIsAuthenticated(true);
        return true;
      }

      // 2) Try parent login via guardian_email in students table
      const { data: parentStudents } = await supabase
        .from('students')
        .select(`*, user:users(*), class:classes(name, section)`)
        .eq('guardian_email', email);

      if (parentStudents && parentStudents.length > 0) {
        const parentId = 'parent-' + email.replace(/[^a-zA-Z0-9]/g, '_');
        localStorage.setItem('school_session', JSON.stringify({ email, role: 'parent', id: parentId }));
        setAuthRole('parent');
        setAuthUserId(parentId);
        setRole('parent');
        setIsAuthenticated(true);
        return true;
      }

      // 3) Fallback: hardcoded demo users (works when DB is missing seed data)
      const demoUser = DEMO_USERS[email];
      if (demoUser) {
        localStorage.setItem('school_session', JSON.stringify({ email: demoUser.email, role: demoUser.role, id: demoUser.id }));
        setAuthRole(demoUser.role);
        setAuthUserId(demoUser.id);
        setRole(demoUser.role);
        setIsAuthenticated(true);
        return true;
      }

      // 4) Fallback: hardcoded demo parent (by guardian_email)
      const demoParent = DEMO_PARENTS[email];
      if (demoParent) {
        const parentId = 'parent-' + email.replace(/[^a-zA-Z0-9]/g, '_');
        localStorage.setItem('school_session', JSON.stringify({ email, role: 'parent', id: parentId }));
        setAuthRole('parent');
        setAuthUserId(parentId);
        setRole('parent');
        setIsAuthenticated(true);
        return true;
      }

      throw new Error('User not found');
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('school_session');
    setAuthRole(null);
    setAuthUserId(null);
    setIsAuthenticated(false);
    setCurrentUser(null);
    setNotifications([]);
  };

  const { can } = usePermissions(role);

  const refreshNotifications = async () => {
    if (!currentUser) return;
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', currentUser.user.id)
      .order('created_at', { ascending: false });
    setNotifications(data || []);
  };

  const markNotificationRead = async (id: string) => {
    await supabase.from('notifications').update({ read: true }).eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <AppContext.Provider value={{
      role,
      setRole,
      currentUser,
      notifications,
      loading,
      refreshNotifications,
      markNotificationRead,
      authRole,
      authUserId,
      isAuthenticated,
      can,
      login,
      logout
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
