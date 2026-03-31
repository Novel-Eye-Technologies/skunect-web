import type { Api } from '@/lib/api/schema';

// Response types from generated OpenAPI schemas
export type TeacherListItem = Api['UserResponse'];

// Request types from generated OpenAPI schemas
export type AssignSubjectRequest = Api['AssignSubjectTeacherRequest'];
