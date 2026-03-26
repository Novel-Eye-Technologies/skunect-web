import type { Api } from '@/lib/api/schema';

// Request types from generated OpenAPI schemas
export type RegisterRequest = Api['RegisterRequest'];
export type LoginEmailRequest = Api['LoginEmailRequest'];
export type LoginPhoneRequest = Api['LoginPhoneRequest'];
export type VerifyOtpRequest = Api['VerifyOtpRequest'];
export type RefreshTokenRequest = Api['RefreshTokenRequest'];
export type GoogleOAuthRequest = Api['GoogleOAuthRequest'];

// Union types not in generated schema — keep hand-written
export type Role = 'ADMIN' | 'TEACHER' | 'PARENT' | 'SUPER_ADMIN';
export type AuthMethod = 'EMAIL_OTP' | 'PHONE_OTP' | 'GOOGLE';

// Response types — generated schemas have all fields optional, keep
// hand-written versions with correct required/optional marking.
export interface SchoolRoleInfo {
  schoolId: string | null;
  schoolName: string;
  role: Role;
  isSchoolActive?: boolean;
  subscriptionStatus?: string | null;
}

export interface UserInfo {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  roles: SchoolRoleInfo[];
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: UserInfo;
}

export interface OtpResponse {
  otpReference: string;
  expiresIn: number;
}
