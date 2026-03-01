'use client';

import { useEffect, useState, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth-store';
import { getCurrentUser } from '@/lib/api/auth';
import { ADMIN_ONLY_ROUTES } from '@/lib/utils/constants';

/** Routes that should be accessible without authentication. */
const PUBLIC_ROUTES = ['/login', '/register', '/verify-otp', '/forgot-password'];

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const pathname = usePathname();

  const accessToken = useAuthStore((s) => s.accessToken);
  const currentRole = useAuthStore((s) => s.currentRole);
  const setUser = useAuthStore((s) => s.setUser);
  const logout = useAuthStore((s) => s.logout);

  const [isValidating, setIsValidating] = useState(true);

  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  const handleLogout = useCallback(() => {
    logout();
    router.replace('/login');
  }, [logout, router]);

  useEffect(() => {
    // Public routes don't need auth validation
    if (isPublicRoute) {
      setIsValidating(false);
      return;
    }

    // No token → redirect immediately
    if (!accessToken) {
      handleLogout();
      return;
    }

    // Validate the token by fetching the current user
    let cancelled = false;

    async function validate() {
      try {
        const response = await getCurrentUser();
        if (!cancelled && response.status === 'SUCCESS') {
          setUser(response.data);
        }
      } catch {
        // Token invalid or expired (refresh also failed)
        if (!cancelled) {
          handleLogout();
          return;
        }
      } finally {
        if (!cancelled) {
          setIsValidating(false);
        }
      }
    }

    validate();

    return () => {
      cancelled = true;
    };
  }, [accessToken, isPublicRoute, setUser, handleLogout]);

  // ---------- Role-based route protection ----------
  useEffect(() => {
    if (isValidating || isPublicRoute) return;

    const isAdminRoute = ADMIN_ONLY_ROUTES.some(
      (route) => pathname === route || pathname.startsWith(`${route}/`)
    );

    if (isAdminRoute && currentRole !== 'ADMIN') {
      router.replace('/dashboard');
    }
  }, [isValidating, isPublicRoute, pathname, currentRole, router]);

  // Prevent flash of protected content
  if (!isPublicRoute && (isValidating || !accessToken)) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
