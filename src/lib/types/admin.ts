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
