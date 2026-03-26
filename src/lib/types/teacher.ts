import type { Api } from '@/lib/api/schema';

export interface TeacherListItem {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  lastLogin: string | null;
  createdAt: string;
  assignedClasses?: string[];
}

// Request types from generated OpenAPI schemas
export type AssignSubjectRequest = Api['AssignSubjectTeacherRequest'];
