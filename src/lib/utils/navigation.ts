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
} from 'lucide-react';

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  roles: ('ADMIN' | 'TEACHER')[];
  children?: Omit<NavItem, 'children'>[];
};

export const navigationConfig: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: ['ADMIN', 'TEACHER'],
  },
  {
    title: 'School Settings',
    href: '/school-settings',
    icon: School,
    roles: ['ADMIN'],
    children: [
      { title: 'General', href: '/school-settings', icon: School, roles: ['ADMIN'] },
      { title: 'Sessions & Terms', href: '/school-settings/sessions', icon: School, roles: ['ADMIN'] },
      { title: 'Classes', href: '/school-settings/classes', icon: School, roles: ['ADMIN'] },
      { title: 'Subjects', href: '/school-settings/subjects', icon: School, roles: ['ADMIN'] },
      { title: 'Grading Systems', href: '/school-settings/grading-systems', icon: School, roles: ['ADMIN'] },
    ],
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
    title: 'Academics',
    href: '/academics/assessments',
    icon: BookOpen,
    roles: ['ADMIN', 'TEACHER'],
    children: [
      { title: 'Assessments', href: '/academics/assessments', icon: BookOpen, roles: ['ADMIN', 'TEACHER'] },
      { title: 'Grade Entry', href: '/academics/grade-entry', icon: BookOpen, roles: ['ADMIN', 'TEACHER'] },
      { title: 'Report Cards', href: '/academics/report-cards', icon: BookOpen, roles: ['ADMIN', 'TEACHER'] },
    ],
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
    roles: ['ADMIN', 'TEACHER'],
  },
  {
    title: 'Communication',
    href: '/communication/messages',
    icon: MessageSquare,
    roles: ['ADMIN', 'TEACHER'],
    children: [
      { title: 'Messages', href: '/communication/messages', icon: MessageSquare, roles: ['ADMIN', 'TEACHER'] },
      { title: 'Announcements', href: '/communication/announcements', icon: Bell, roles: ['ADMIN', 'TEACHER'] },
      { title: 'Notifications', href: '/communication/notifications', icon: Bell, roles: ['ADMIN', 'TEACHER'] },
    ],
  },
  {
    title: 'Safety',
    href: '/safety/emergency-alerts',
    icon: Shield,
    roles: ['ADMIN', 'TEACHER'],
    children: [
      { title: 'Emergency Alerts', href: '/safety/emergency-alerts', icon: Shield, roles: ['ADMIN'] },
      { title: 'Pickup', href: '/safety/pickup', icon: Shield, roles: ['ADMIN', 'TEACHER'] },
    ],
  },
  {
    title: 'Fees',
    href: '/fees/structures',
    icon: DollarSign,
    roles: ['ADMIN'],
    children: [
      { title: 'Fee Structures', href: '/fees/structures', icon: DollarSign, roles: ['ADMIN'] },
      { title: 'Invoices', href: '/fees/invoices', icon: DollarSign, roles: ['ADMIN'] },
    ],
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
    children: [
      { title: 'Overview', href: '/analytics', icon: BarChart3, roles: ['ADMIN'] },
      { title: 'Attendance', href: '/analytics/attendance', icon: BarChart3, roles: ['ADMIN', 'TEACHER'] },
      { title: 'Academic', href: '/analytics/academic', icon: BarChart3, roles: ['ADMIN', 'TEACHER'] },
      { title: 'Fees', href: '/analytics/fees', icon: BarChart3, roles: ['ADMIN'] },
    ],
  },
];
