import type { Api } from '@/lib/api/schema';

export type SchoolSummary = Api['SchoolSummary'];
export type SystemDashboardResponse = Api['SystemDashboardResponse'];
export type SchoolHealthSummary = Api['SchoolHealthSummary'];
export type DashboardAlert = Api['DashboardAlert'];
export type SchoolDetailResponse = Api['SchoolDetailResponse'];

// SchoolDetail — no exact match in generated schema; keep hand-written
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
export type CreateSchoolAdminRequest = Api['CreateSchoolAdminRequest'];
export type UpdateSchoolAdminRequest = Api['UpdateSchoolAdminRequest'];

// UserRoleInfo — maps to SchoolRoleInfo in generated schema (different name)
export type UserRoleInfo = Api['SchoolRoleInfo'];

// SuperAdminUser — maps to UserResponse in generated schema
export type SuperAdminUser = Api['UserResponse'];
