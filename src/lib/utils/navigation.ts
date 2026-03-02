import {
  type LucideIcon,
  LayoutDashboard,
  School,
  Users,
  GraduationCap,
  BookOpen,
  ClipboardCheck,
  FileText,
  MessageSquare,
  Bell,
  Shield,
  DollarSign,
  Upload,
  BarChart3,
  Building2,
  Database,
} from 'lucide-react';

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  roles: ('ADMIN' | 'TEACHER' | 'PARENT' | 'SUPER_ADMIN')[];
  children?: Omit<NavItem, 'children'>[];
};

export const navigationConfig: NavItem[] = [
  // ─── Super Admin ───
  {
    title: 'System Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: ['SUPER_ADMIN'],
  },
  {
    title: 'All Schools',
    href: '/system/schools',
    icon: Building2,
    roles: ['SUPER_ADMIN'],
  },
  {
    title: 'Seed Data',
    href: '/system/seed',
    icon: Database,
    roles: ['SUPER_ADMIN'],
  },

  // ─── School Admin & Teacher ───
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: ['ADMIN', 'TEACHER', 'PARENT'],
  },
  {
    title: 'School Settings',
    href: '/school-settings',
    icon: School,
    roles: ['ADMIN'],
  },
  {
    title: 'Users',
    href: '/users',
    icon: Users,
    roles: ['ADMIN'],
  },
  {
    title: 'Students',
    href: '/students',
    icon: GraduationCap,
    roles: ['ADMIN', 'TEACHER'],
  },
  {
    title: 'My Children',
    href: '/students',
    icon: GraduationCap,
    roles: ['PARENT'],
  },
  {
    title: 'Academics',
    href: '/academics',
    icon: BookOpen,
    roles: ['ADMIN', 'TEACHER'],
  },
  {
    title: 'Attendance',
    href: '/attendance',
    icon: ClipboardCheck,
    roles: ['ADMIN', 'TEACHER'],
  },
  {
    title: 'Homework',
    href: '/homework',
    icon: FileText,
    roles: ['ADMIN', 'TEACHER', 'PARENT'],
  },
  {
    title: 'Communication',
    href: '/communication/messages',
    icon: MessageSquare,
    roles: ['ADMIN', 'TEACHER', 'PARENT'],
    children: [
      { title: 'Messages', href: '/communication/messages', icon: MessageSquare, roles: ['ADMIN', 'TEACHER', 'PARENT'] },
      { title: 'Announcements', href: '/communication/announcements', icon: Bell, roles: ['ADMIN', 'TEACHER', 'PARENT'] },
      { title: 'Notifications', href: '/communication/notifications', icon: Bell, roles: ['ADMIN', 'TEACHER', 'PARENT'] },
    ],
  },
  {
    title: 'Safety',
    href: '/safety',
    icon: Shield,
    roles: ['ADMIN', 'TEACHER'],
  },
  {
    title: 'Fees',
    href: '/fees',
    icon: DollarSign,
    roles: ['ADMIN', 'PARENT'],
  },
  {
    title: 'Data Migration',
    href: '/data-migration',
    icon: Upload,
    roles: ['ADMIN'],
  },
  {
    title: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    roles: ['ADMIN'],
  },
];
