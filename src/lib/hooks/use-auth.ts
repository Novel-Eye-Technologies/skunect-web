'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  getCurrentUser,
  loginEmail,
  loginPhone,
  register,
  verifyOtp,
  googleOAuth,
  refreshToken as refreshTokenApi,
  logout as logoutApi,
} from '@/lib/api/auth';
import { useAuthStore } from '@/lib/stores/auth-store';
import type {
  LoginEmailRequest,
  LoginPhoneRequest,
  RegisterRequest,
  VerifyOtpRequest,
  GoogleOAuthRequest,
  RefreshTokenRequest,
  UserInfo,
} from '@/lib/types/auth';
import { queryClient } from '@/lib/query-client';

// ---------------------------------------------------------------------------
// Query keys
// ---------------------------------------------------------------------------
const authKeys = {
  all: ['auth'] as const,
  me: () => [...authKeys.all, 'me'] as const,
};

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/** Fetch the currently authenticated user. */
export function useCurrentUser() {
  const accessToken = useAuthStore((s) => s.accessToken);

  return useQuery({
    queryKey: authKeys.me(),
    queryFn: getCurrentUser,
    enabled: !!accessToken,
    staleTime: 5 * 60 * 1000,
  });
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

/** Email-based login – sends OTP. */
export function useLogin() {
  return useMutation({
    mutationFn: (data: LoginEmailRequest) => loginEmail(data),
  });
}

/** Phone-based login – sends OTP. */
export function useLoginPhone() {
  return useMutation({
    mutationFn: (data: LoginPhoneRequest) => loginPhone(data),
  });
}

/** Register a new user – sends OTP. */
export function useRegister() {
  return useMutation({
    mutationFn: (data: RegisterRequest) => register(data),
  });
}

/** Verify OTP and receive auth tokens. Navigation is left to the caller. */
export function useVerifyOtp() {
  const setTokens = useAuthStore((s) => s.setTokens);
  const setUser = useAuthStore((s) => s.setUser);
  return useMutation({
    mutationFn: (data: VerifyOtpRequest) => verifyOtp(data),
    onSuccess: (response) => {
      if (response.status === 'SUCCESS') {
        const data = response.data;
        setTokens(data.accessToken!, data.refreshToken!);
        setUser(data.user as UserInfo);
        queryClient.invalidateQueries({ queryKey: authKeys.me() });
      }
    },
  });
}

/** Sign in with Google ID token. */
export function useGoogleOAuth() {
  const setTokens = useAuthStore((s) => s.setTokens);
  const setUser = useAuthStore((s) => s.setUser);
  const router = useRouter();

  return useMutation({
    mutationFn: (data: GoogleOAuthRequest) => googleOAuth(data),
    onSuccess: (response) => {
      if (response.status === 'SUCCESS') {
        const data = response.data;
        setTokens(data.accessToken!, data.refreshToken!);
        setUser(data.user as UserInfo);
        queryClient.invalidateQueries({ queryKey: authKeys.me() });
        router.push('/dashboard');
      }
    },
  });
}

/** Manually refresh the access token. */
export function useRefreshToken() {
  const setTokens = useAuthStore((s) => s.setTokens);

  return useMutation({
    mutationFn: (data: RefreshTokenRequest) => refreshTokenApi(data),
    onSuccess: (response) => {
      if (response.status === 'SUCCESS') {
        setTokens(response.data.accessToken!, response.data.refreshToken!);
      }
    },
  });
}

/** Log the user out and redirect to login. */
export function useLogout() {
  const router = useRouter();

  return useMutation({
    mutationFn: logoutApi,
    onSettled: () => {
      queryClient.clear();
      router.replace('/login');
    },
  });
}
