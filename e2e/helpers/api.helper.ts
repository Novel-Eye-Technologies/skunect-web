/**
 * Direct API helpers for test setup, teardown, and assertions.
 * Uses raw fetch() — no Playwright browser required.
 */
import { API_BASE_URL } from '../fixtures/test-accounts';

interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
  errors?: Record<string, string>;
  meta?: Record<string, unknown>;
}

interface OtpResponse {
  otpReference: string;
  expiresIn: number;
}

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    avatarUrl?: string;
    roles: Array<{
      schoolId: string | null;
      schoolName: string;
      role: string;
    }>;
  };
}

/**
 * Authenticate a test account via email OTP.
 * Returns the full AuthResponse (tokens + user).
 */
export async function authenticateAccount(
  email: string,
  otp: string
): Promise<AuthResponse> {
  // Step 1: Request OTP
  const loginRes = await fetch(`${API_BASE_URL}/auth/login/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  if (!loginRes.ok) {
    const body = await loginRes.text();
    throw new Error(
      `Login request failed for ${email}: ${loginRes.status} ${body}`
    );
  }

  const loginData: ApiResponse<OtpResponse> = await loginRes.json();
  const otpReference = loginData.data.otpReference;

  // Step 2: Verify OTP
  const verifyRes = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ otpReference, otp }),
  });

  if (!verifyRes.ok) {
    const body = await verifyRes.text();
    throw new Error(
      `OTP verification failed for ${email}: ${verifyRes.status} ${body}`
    );
  }

  const verifyData: ApiResponse<AuthResponse> = await verifyRes.json();
  return verifyData.data;
}

/**
 * Make an authenticated API GET request.
 */
export async function apiGet<T>(
  path: string,
  accessToken: string
): Promise<ApiResponse<T>> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API GET ${path} failed: ${res.status} ${body}`);
  }

  return res.json();
}

/**
 * Make an authenticated API POST request.
 */
export async function apiPost<T>(
  path: string,
  accessToken: string,
  body?: unknown
): Promise<ApiResponse<T>> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API POST ${path} failed: ${res.status} ${text}`);
  }

  return res.json();
}

/**
 * Make an authenticated API PUT request.
 */
export async function apiPut<T>(
  path: string,
  accessToken: string,
  body?: unknown
): Promise<ApiResponse<T>> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API PUT ${path} failed: ${res.status} ${text}`);
  }

  return res.json();
}

/**
 * Make an authenticated API PATCH request.
 */
export async function apiPatch<T>(
  path: string,
  accessToken: string,
  body?: unknown
): Promise<ApiResponse<T>> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API PATCH ${path} failed: ${res.status} ${text}`);
  }

  return res.json();
}

/**
 * Make an authenticated API DELETE request.
 */
export async function apiDelete<T>(
  path: string,
  accessToken: string
): Promise<ApiResponse<T>> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API DELETE ${path} failed: ${res.status} ${text}`);
  }

  return res.json();
}
