import type { Api } from '@/lib/api/schema';

export interface UserRoleItem {
  schoolId: string;
  role: string;
  isActive: boolean;
}

export interface UserListItem {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  isActive: boolean;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  lastLogin: string | null;
  createdAt: string;
  roles: UserRoleItem[];
}

// Request types from generated OpenAPI schemas
export type InviteUserRequest = Api['InviteUserRequest'];
export type UpdateUserStatusRequest = Api['UpdateUserStatusRequest'];
export type UpdateSchoolUserRequest = Api['UpdateUserRequest'];
