import { UserRole } from '../contexts/AppContext';

export type Action = 
  | 'manage:users' | 'manage:classes' | 'manage:subjects' | 'manage:fees'
  | 'manage:routes' | 'manage:documents'
  | 'view:analytics' | 'view:all_grades' | 'view:all_attendance'
  | 'create:exams' | 'create:assignments'
  | 'take:exams' | 'submit:assignments'
  | 'view:own_grades' | 'view:own_attendance'
  | 'pay:fees';

const PERMISSIONS: Record<UserRole, Action[]> = {
  admin: [
    'manage:users', 'manage:classes', 'manage:subjects', 'manage:fees',
    'manage:routes', 'manage:documents',
    'view:analytics', 'view:all_grades', 'view:all_attendance',
    'create:exams', 'create:assignments',
  ],
  teacher: [
    'manage:documents',
    'view:all_grades', 'view:all_attendance',
    'create:exams', 'create:assignments',
  ],
  student: [
    'manage:documents',
    'take:exams', 'submit:assignments',
    'view:own_grades', 'view:own_attendance',
    'pay:fees',
  ],
  parent: [
    'view:own_grades', 'view:own_attendance',
    'pay:fees',
  ],
};

export function usePermissions(role: UserRole) {
  const permissions = PERMISSIONS[role] || [];
  return {
    can: (action: Action) => permissions.includes(action),
    permissions,
  };
}
