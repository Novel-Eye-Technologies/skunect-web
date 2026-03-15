export type Role = 'ADMIN' | 'TEACHER' | 'PARENT' | 'SUPER_ADMIN';

export type AuthMethod = 'EMAIL_OTP' | 'PHONE_OTP' | 'GOOGLE';

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

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  authMethod: AuthMethod;
}

export interface LoginEmailRequest {
  email: string;
}

export interface LoginPhoneRequest {
  phone: string;
}

export interface VerifyOtpRequest {
  otpReference: string;
  otp: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface GoogleOAuthRequest {
  idToken: string;
}
