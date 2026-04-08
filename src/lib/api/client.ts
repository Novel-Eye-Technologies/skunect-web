import axios, {
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios';
import { useAuthStore } from '@/lib/stores/auth-store';
import type { ApiResponse } from '@/lib/api/types';
import type { AuthResponse } from '@/lib/types/auth';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30_000,
});

// ---------------------------------------------------------------------------
// Request interceptor – attach Bearer token
// ---------------------------------------------------------------------------
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().accessToken;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ---------------------------------------------------------------------------
// Response interceptor – handle 401 with silent token refresh
// ---------------------------------------------------------------------------
let isRefreshing = false;
let failedQueue: {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}[] = [];

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token!);
    }
  });
  failedQueue = [];
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Handle 403 Forbidden — user lacks permission for this resource
    if (error.response?.status === 403) {
      const message =
        (error.response.data as { message?: string })?.message ||
        'You do not have permission to access this resource';
      return Promise.reject(new Error(message));
    }

    // Only attempt refresh for 401 errors that haven't been retried yet
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Don't try to refresh if the failing request IS the refresh request
    if (originalRequest.url?.includes('/auth/refresh-token')) {
      handleAuthFailure();
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // Another refresh is already in flight – queue this request
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((newToken) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          return apiClient(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    const refreshTokenValue = useAuthStore.getState().refreshToken;

    if (!refreshTokenValue) {
      isRefreshing = false;
      handleAuthFailure();
      return Promise.reject(error);
    }

    try {
      const { data } = await axios.post<ApiResponse<AuthResponse>>(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh-token`,
        { refreshToken: refreshTokenValue },
        { headers: { 'Content-Type': 'application/json' } }
      );

      const accessToken = data.data.accessToken!;
      const newRefreshToken = data.data.refreshToken!;

      useAuthStore.getState().setTokens(accessToken, newRefreshToken);

      processQueue(null, accessToken);

      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      }

      return apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      handleAuthFailure();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

/**
 * Clear auth state and trigger session expiry modal.
 * Safe to call from any context (server / client).
 */
function handleAuthFailure() {
  if (typeof window !== 'undefined') {
    useAuthStore.getState().setSessionExpired(true);
  } else {
    // If we're on the server, we just clear auth state and let it handle naturally.
    useAuthStore.getState().logout();
  }
}

export default apiClient;
