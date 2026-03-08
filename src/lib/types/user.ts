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

export interface InviteUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'TEACHER';
  phone?: string;
}

export interface UpdateUserStatusRequest {
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
}

export interface UpdateSchoolUserRequest {
  firstName: string;
  lastName: string;
  phone?: string;
}
