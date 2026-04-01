import type { Api } from '@/lib/api/schema';

// Request types from generated OpenAPI schemas
export type RegisterRequest = Api['RegisterRequest'];
export type LoginEmailRequest = Api['LoginEmailRequest'];
export type LoginPhoneRequest = Api['LoginPhoneRequest'];
export type VerifyOtpRequest = Api['VerifyOtpRequest'];
export type RefreshTokenRequest = Api['RefreshTokenRequest'];
export type GoogleOAuthRequest = Api['GoogleOAuthRequest'];
export type AppleOAuthRequest = Api['AppleOAuthRequest'];
export type DeleteAccountRequest = Api['DeleteAccountRequest'];

// Union types not in generated schema — keep hand-written
export type Role = 'ADMIN' | 'TEACHER' | 'PARENT' | 'SUPER_ADMIN';
export type AuthMethod = 'EMAIL_OTP' | 'PHONE_OTP' | 'GOOGLE';

// Response types from generated OpenAPI schemas
export type SchoolRoleInfo = Api['SchoolRoleInfo'];
export type UserInfo = Api['UserInfo'];
export type AuthResponse = Api['AuthResponse'];
export type OtpResponse = Api['OtpResponse'];
