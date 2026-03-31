import type { Api } from '@/lib/api/schema';

// Response types from generated OpenAPI schemas
export type UserRoleItem = Api['UserRoleResponse'];
export type UserListItem = Api['UserResponse'];

// Request types from generated OpenAPI schemas
export type InviteUserRequest = Api['InviteUserRequest'];
export type UpdateUserStatusRequest = Api['UpdateUserStatusRequest'];
export type UpdateSchoolUserRequest = Api['UpdateUserRequest'];
