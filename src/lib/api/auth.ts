import apiClient from '@/lib/api/client';
import type { ApiResponse } from '@/lib/api/types';
import type {
  AuthResponse,
  GoogleOAuthRequest,
  LoginEmailRequest,
  LoginPhoneRequest,
  OtpResponse,
  RefreshTokenRequest,
  RegisterRequest,
  UserInfo,
  VerifyOtpRequest,
} from '@/lib/types/auth';
import { useAuthStore } from '@/lib/stores/auth-store';

export async function register(
  data: RegisterRequest
): Promise<ApiResponse<OtpResponse>> {
  const response = await apiClient.post<ApiResponse<OtpResponse>>(
    '/auth/register',
    data
  );
  return response.data;
}

export async function loginEmail(
  data: LoginEmailRequest
): Promise<ApiResponse<OtpResponse>> {
  const response = await apiClient.post<ApiResponse<OtpResponse>>(
    '/auth/login/email',
    data
  );
  return response.data;
}

export async function loginPhone(
  data: LoginPhoneRequest
): Promise<ApiResponse<OtpResponse>> {
  const response = await apiClient.post<ApiResponse<OtpResponse>>(
    '/auth/login/phone',
    data
  );
  return response.data;
}

export async function verifyOtp(
  data: VerifyOtpRequest
): Promise<ApiResponse<AuthResponse>> {
  const response = await apiClient.post<ApiResponse<AuthResponse>>(
    '/auth/verify-otp',
    data
  );
  return response.data;
}

export async function googleOAuth(
  data: GoogleOAuthRequest
): Promise<ApiResponse<AuthResponse>> {
  const response = await apiClient.post<ApiResponse<AuthResponse>>(
    '/auth/oauth/google',
    data
  );
  return response.data;
}

export async function appleOAuth(data: {
  identityToken: string;
  authorizationCode: string;
  firstName?: string;
  lastName?: string;
}): Promise<ApiResponse<AuthResponse>> {
  const response = await apiClient.post<ApiResponse<AuthResponse>>(
    '/auth/oauth/apple',
    data,
  );
  return response.data;
}

export async function refreshToken(
  data: RefreshTokenRequest
): Promise<ApiResponse<AuthResponse>> {
  const response = await apiClient.post<ApiResponse<AuthResponse>>(
    '/auth/refresh-token',
    data
  );
  return response.data;
}

export async function getCurrentUser(): Promise<ApiResponse<UserInfo>> {
  // The /auth/me endpoint returns ApiResponse<AuthResponse> (which includes tokens + user).
  // We extract just the UserInfo so callers don't need to unwrap it.
  const response = await apiClient.get<ApiResponse<AuthResponse>>('/auth/me');
  const apiResponse = response.data;
  return {
    status: apiResponse.status,
    message: apiResponse.message,
    data: apiResponse.data?.user,
    errors: apiResponse.errors,
    meta: apiResponse.meta,
  } as ApiResponse<UserInfo>;
}

export async function deleteAccount(reason?: string): Promise<ApiResponse<void>> {
  const response = await apiClient.delete<ApiResponse<void>>('/auth/me', {
    data: reason ? { reason } : undefined,
  });
  return response.data;
}

export async function logout(): Promise<void> {
  try {
    await apiClient.post('/auth/logout');
  } catch {
    // Swallow errors – we clear local state regardless
  } finally {
    useAuthStore.getState().logout();
  }
}
