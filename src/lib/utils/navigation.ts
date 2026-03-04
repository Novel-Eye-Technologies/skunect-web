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
  UserCheck,
  UserRound,
  HeartPulse,
  Settings2,
  Activity,
  Smile,
  Stethoscope,
  HelpCircle,
  Calendar,
  Send,
  CalendarDays,
  ScrollText,
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
    title: 'Teachers',
    href: '/teachers',
    icon: UserCheck,
    roles: ['ADMIN'],
  },
  {
    title: 'Parents',
    href: '/parents',
    icon: UserRound,
    roles: ['ADMIN'],
  },
  {
    title: 'Students',
    href: '/students',
    icon: GraduationCap,
    roles: ['ADMIN', 'TEACHER'],
  },
  {
    title: 'My Classes',
    href: '/my-classes',
    icon: BookOpen,
    roles: ['TEACHER'],
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
    title: 'Timetable',
    href: '/timetable',
    icon: Calendar,
    roles: ['ADMIN'],
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
    title: 'Broadcasts',
    href: '/broadcasts',
    icon: Send,
    roles: ['ADMIN'],
  },
  {
    title: 'Events',
    href: '/events',
    icon: CalendarDays,
    roles: ['ADMIN'],
  },
  {
    title: 'Activity',
    href: '/activity',
    icon: Activity,
    roles: ['ADMIN'],
  },
  {
    title: 'Safety',
    href: '/safety',
    icon: Shield,
    roles: ['ADMIN', 'TEACHER'],
    children: [
      { title: 'Emergency Alerts', href: '/safety', icon: Shield, roles: ['ADMIN', 'TEACHER'] },
      { title: 'Welfare Logs', href: '/welfare', icon: HeartPulse, roles: ['ADMIN', 'TEACHER'] },
      { title: 'Mood Tracker', href: '/welfare/mood', icon: Smile, roles: ['ADMIN', 'TEACHER'] },
      { title: 'Health Records', href: '/welfare/health-records', icon: Stethoscope, roles: ['ADMIN', 'TEACHER'] },
    ],
  },
  {
    title: 'Fees',
    href: '/fees',
    icon: DollarSign,
    roles: ['ADMIN', 'PARENT'],
  },
  {
    title: 'Audit Trail',
    href: '/audit-logs',
    icon: ScrollText,
    roles: ['ADMIN'],
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
  {
    title: 'Notification Preferences',
    href: '/notification-preferences',
    icon: Settings2,
    roles: ['ADMIN', 'TEACHER', 'PARENT'],
  },
  {
    title: 'Help & Support',
    href: '/help',
    icon: HelpCircle,
    roles: ['ADMIN', 'TEACHER', 'PARENT', 'SUPER_ADMIN'],
  },
];
