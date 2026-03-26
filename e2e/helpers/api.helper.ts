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
  otp: string,
  maxRetries = 3
): Promise<AuthResponse> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Step 1: Request OTP
      const loginRes = await fetch(`${API_BASE_URL}/auth/login/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const loginText = await loginRes.text();
      if (!loginRes.ok) {
        throw new Error(`Login request failed for ${email}: ${loginRes.status} ${loginText}`);
      }

      let loginData: ApiResponse<OtpResponse>;
      try {
        loginData = JSON.parse(loginText);
      } catch {
        throw new Error(`Login response for ${email} was not JSON: ${loginText.slice(0, 200)}`);
      }
      const otpReference = loginData.data.otpReference;

      // Step 2: Verify OTP
      const verifyRes = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otpReference, otp }),
      });

      const verifyText = await verifyRes.text();
      if (!verifyRes.ok) {
        throw new Error(`OTP verification failed for ${email}: ${verifyRes.status} ${verifyText}`);
      }

      let verifyData: ApiResponse<AuthResponse>;
      try {
        verifyData = JSON.parse(verifyText);
      } catch {
        throw new Error(`OTP verify response for ${email} was not JSON: ${verifyText.slice(0, 200)}`);
      }
      return verifyData.data;
    } catch (error) {
      if (attempt < maxRetries) {
        console.warn(`  ⚠ Auth attempt ${attempt + 1} failed for ${email}: ${(error as Error).message.slice(0, 100)}. Retrying...`);
        await new Promise(r => setTimeout(r, 2000 * (attempt + 1)));
        continue;
      }
      throw error;
    }
  }
  throw new Error(`authenticateAccount failed for ${email} after ${maxRetries} retries`);
}

/**
 * Make an authenticated API GET request with retry for transient errors.
 */
export async function apiGet<T>(
  path: string,
  accessToken: string,
  retries = 2
): Promise<ApiResponse<T>> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const body = await res.text();
      if (attempt < retries && res.status >= 500) {
        await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
        continue;
      }
      throw new Error(`API GET ${path} failed: ${res.status} ${body}`);
    }

    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      if (attempt < retries) {
        await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
        continue;
      }
      throw new Error(`API GET ${path} returned non-JSON (${res.status}): ${text.slice(0, 200)}`);
    }
  }
  throw new Error(`API GET ${path} failed after ${retries} retries`);
}

/**
 * Make an authenticated API POST request with retry for transient errors.
 */
export async function apiPost<T>(
  path: string,
  accessToken: string,
  body?: unknown,
  retries = 2
): Promise<ApiResponse<T>> {
  for (let attempt = 0; attempt <= retries; attempt++) {
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
      if (attempt < retries && (res.status >= 500 || res.status === 409)) {
        await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
        continue;
      }
      throw new Error(`API POST ${path} failed: ${res.status} ${text}`);
    }

    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      // Response was 200 but not JSON (e.g., CDN error page)
      if (attempt < retries) {
        await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
        continue;
      }
      throw new Error(`API POST ${path} returned non-JSON (${res.status}): ${text.slice(0, 200)}`);
    }
  }
  throw new Error(`API POST ${path} failed after ${retries} retries`);
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
