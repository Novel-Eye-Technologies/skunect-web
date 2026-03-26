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
  Smile,
  Stethoscope,
  HelpCircle,
  Calendar,
  CalendarDays,
  ScrollText,
  Bus,
  CreditCard,
  Tag,
  Layers,
  ArrowUpDown,
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
    title: 'Super Admins',
    href: '/system/super-admins',
    icon: Shield,
    roles: ['SUPER_ADMIN'],
  },
  {
    title: 'Subscription Plans',
    href: '/system/subscription-plans',
    icon: CreditCard,
    roles: ['SUPER_ADMIN'],
  },
  {
    title: 'Subscription Dashboard',
    href: '/system/subscription-dashboard',
    icon: BarChart3,
    roles: ['SUPER_ADMIN'],
  },
  {
    title: 'Bulk Subscriptions',
    href: '/system/subscription-bulk',
    icon: Layers,
    roles: ['SUPER_ADMIN'],
  },
  {
    title: 'Discounts',
    href: '/system/subscription-discounts',
    icon: Tag,
    roles: ['SUPER_ADMIN'],
  },
  {
    title: 'Seed Data',
    href: '/system/seed',
    icon: Database,
    roles: ['SUPER_ADMIN'],
  },

  // ─── School Admin, Teacher & Parent ───
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: ['ADMIN', 'TEACHER', 'PARENT'],
  },
  {
    title: 'People',
    href: '/users',
    icon: Users,
    roles: ['ADMIN'],
    children: [
      { title: 'All Users', href: '/users', icon: Users, roles: ['ADMIN'] },
      { title: 'Teachers', href: '/teachers', icon: UserCheck, roles: ['ADMIN'] },
      { title: 'Parents', href: '/parents', icon: UserRound, roles: ['ADMIN'] },
      { title: 'Students', href: '/students', icon: GraduationCap, roles: ['ADMIN'] },
    ],
  },
  {
    title: 'Students',
    href: '/students',
    icon: GraduationCap,
    roles: ['TEACHER'],
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
    children: [
      { title: 'Academic Overview', href: '/academics', icon: BookOpen, roles: ['ADMIN', 'TEACHER'] },
      { title: 'Timetable', href: '/timetable', icon: Calendar, roles: ['ADMIN', 'TEACHER'] },
      { title: 'Attendance Marking', href: '/attendance', icon: ClipboardCheck, roles: ['ADMIN', 'TEACHER'] },
      { title: 'Homework Management', href: '/homework', icon: FileText, roles: ['ADMIN', 'TEACHER'] },
      { title: 'Assessments & Grading', href: '/academics?tab=assessments', icon: ClipboardCheck, roles: ['ADMIN', 'TEACHER'] },
      { title: 'Report Cards', href: '/academics?tab=report-cards', icon: ScrollText, roles: ['ADMIN', 'TEACHER'] },
    ],
  },
  {
    title: 'Academics',
    href: '/academics',
    icon: BookOpen,
    roles: ['PARENT'],
    children: [
      { title: 'Attendance', href: '/attendance', icon: ClipboardCheck, roles: ['PARENT'] },
      { title: 'Homework', href: '/homework', icon: FileText, roles: ['PARENT'] },
    ],
  },
  {
    title: 'Promotions',
    href: '/promotions',
    icon: ArrowUpDown,
    roles: ['ADMIN'],
  },
  {
    title: 'Calendar',
    href: '/calendar',
    icon: CalendarDays,
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
      // { title: 'Events', href: '/events', icon: CalendarDays, roles: ['ADMIN', 'TEACHER', 'PARENT'] },
    ],
  },
  {
    title: 'Safety & Welfare',
    href: '/safety',
    icon: Shield,
    roles: ['ADMIN', 'TEACHER', 'PARENT'],
    children: [
      { title: 'Emergency Alerts', href: '/safety', icon: Shield, roles: ['ADMIN', 'TEACHER'] },
      { title: 'Pickup Authorization', href: '/safety/pickup', icon: UserCheck, roles: ['PARENT'] },
      { title: 'Welfare Logs', href: '/welfare', icon: HeartPulse, roles: ['ADMIN', 'TEACHER'] },
      { title: 'Mood Tracker', href: '/welfare/mood', icon: Smile, roles: ['ADMIN', 'TEACHER'] },
      { title: 'Health Records', href: '/welfare/health-records', icon: Stethoscope, roles: ['ADMIN', 'TEACHER'] },
    ],
  },
  {
    title: 'School Bus',
    href: '/bus',
    icon: Bus,
    roles: ['ADMIN'],
    children: [
      { title: 'Bus Management', href: '/bus', icon: Bus, roles: ['ADMIN'] },
    ],
  },
  {
    title: 'Bus Tracking',
    href: '/bus/tracking',
    icon: Bus,
    roles: ['PARENT'],
  },
  {
    title: 'Fees',
    href: '/fees',
    icon: DollarSign,
    roles: ['ADMIN', 'PARENT'],
  },
  {
    title: 'Subscription',
    href: '/subscription',
    icon: CreditCard,
    roles: ['ADMIN'],
  },
  {
    title: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    roles: ['ADMIN'],
    children: [
      { title: 'Reports', href: '/analytics', icon: BarChart3, roles: ['ADMIN'] },
      { title: 'Audit Trail', href: '/audit-logs', icon: ScrollText, roles: ['ADMIN'] },
    ],
  },
  {
    title: 'Settings',
    href: '/school-settings',
    icon: Settings2,
    roles: ['ADMIN'],
    children: [
      { title: 'School Settings', href: '/school-settings', icon: School, roles: ['ADMIN'] },
      { title: 'Data Migration', href: '/data-migration', icon: Upload, roles: ['ADMIN'] },
      { title: 'Notification Preferences', href: '/notification-preferences', icon: Settings2, roles: ['ADMIN'] },
    ],
  },
  {
    title: 'Notification Preferences',
    href: '/notification-preferences',
    icon: Settings2,
    roles: ['TEACHER', 'PARENT'],
  },
  {
    title: 'Help & Support',
    href: '/help',
    icon: HelpCircle,
    roles: ['ADMIN', 'TEACHER', 'PARENT', 'SUPER_ADMIN'],
  },
];
