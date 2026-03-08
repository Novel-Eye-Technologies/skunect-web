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
  totalSchools: number;
  totalStudents: number;
  totalTeachers: number;
  totalParents: number;
  totalAdmins: number;
  totalUsers: number;
  activeAcademicSessions: number;
  schoolSummaries: SchoolSummary[];
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

export interface CreateSchoolRequest {
  name: string;
  subscriptionTier?: 'STANDARD' | 'PREMIUM';
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
}

export interface UpdateSchoolRequest {
  name?: string;
  subscriptionTier?: 'STANDARD' | 'PREMIUM';
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
}

export interface CreateSuperAdminRequest {
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
}

export interface UpdateSuperAdminRequest {
  firstName: string;
  lastName: string;
  avatarUrl?: string;
}

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

export interface CreateSchoolAdminRequest {
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
}

export interface UpdateSchoolAdminRequest {
  firstName: string;
  lastName: string;
}

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
