import type { Api } from '@/lib/api/schema';

export interface SchoolSummary {
  id: string;
  name: string;
  code: string;
  city: string;
  state: string;
  subscriptionTier: string;
  isActive: boolean;
  studentCount: number;
  teacherCount: number;
  adminCount: number;
  createdAt: string;
}

export interface SystemDashboardResponse {
  // Scale
  totalSchools: number;
  activeSchools: number;
  totalStudents: number;
  totalTeachers: number;
  totalParents: number;
  totalUsers: number;

  // Revenue
  mrr: number;
  totalRevenue: number;
  totalOutstanding: number;
  revenuePerStudent: number;
  activeSubscriptions: number;
  gracePeriodSubscriptions: number;
  expiredSubscriptions: number;

  // Growth
  fullySetUpSchools: number;
  avgDaysToFirstAttendance: number | null;
  studentsAddedThisMonth: number;
  studentsRemovedThisMonth: number;
  netStudentGrowth: number;

  // Engagement
  teacherAttendanceRate: number;
  parentActivationRate: number;
  weeklyActiveParentRate: number;
  homeworkCompletionRate: number;
  messagesToday: number;

  // Schools
  schoolSummaries: SchoolHealthSummary[];

  // Alerts
  alerts: DashboardAlert[];
}

export interface SchoolHealthSummary {
  id: string;
  name: string;
  code: string;
  city: string;
  state: string;
  subscriptionTier: string;
  isActive: boolean;
  studentCount: number;
  teacherCount: number;
  parentCount: number;
  todayAttendanceRate: number;
  feeCollectionRate: number;
  messagesThisWeek: number;
  parentActivationRate: number;
  isFullySetUp: boolean;
  subscriptionStatus: string | null;
  daysUntilExpiry: number | null;
  createdAt: string;
  lastActivityAt: string | null;
}

export interface DashboardAlert {
  severity: 'warning' | 'danger' | 'info';
  title: string;
  message: string;
  schoolId: string | null;
}

export interface SchoolDetail {
  id: string;
  name: string;
  code: string;
  logoUrl: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  phone: string | null;
  email: string | null;
  subscriptionTier: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Request types from generated OpenAPI schemas
export type CreateSchoolRequest = Api['CreateSchoolRequest'];
export type UpdateSchoolRequest = Api['UpdateSchoolRequest'];
export type CreateSuperAdminRequest = Api['CreateSuperAdminRequest'];
export type UpdateSuperAdminRequest = Api['UpdateSuperAdminRequest'];

export interface SchoolDetailResponse {
  id: string;
  name: string;
  code: string;
  logoUrl: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  phone: string | null;
  email: string | null;
  subscriptionTier: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  studentCount: number;
  teacherCount: number;
  adminCount: number;
  parentCount: number;
  classCount: number;
  subjectCount: number;
  activeSessionCount: number;
  admins: SuperAdminUser[];
}

export type CreateSchoolAdminRequest = Api['CreateSchoolAdminRequest'];
export type UpdateSchoolAdminRequest = Api['UpdateSchoolAdminRequest'];

export interface UserRoleInfo {
  schoolId: string | null;
  role: string;
  isActive: boolean;
}

export interface SuperAdminUser {
  id: string;
  email: string;
  phone: string | null;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  isActive: boolean;
  roles: UserRoleInfo[];
}
