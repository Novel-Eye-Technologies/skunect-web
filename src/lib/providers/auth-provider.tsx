'use client';

import { useEffect, useState, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore, useAuthHydrated } from '@/lib/stores/auth-store';
import { getCurrentUser } from '@/lib/api/auth';
import { ADMIN_ONLY_ROUTES, SUPER_ADMIN_ONLY_ROUTES, TEACHER_BLOCKED_ROUTES } from '@/lib/utils/constants';
import { SessionExpiryModal } from '@/components/shared/session-expiry-modal';

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
  const schoolActive = useAuthStore((s) => s.schoolActive);
  const setUser = useAuthStore((s) => s.setUser);
  const logout = useAuthStore((s) => s.logout);
  const setSessionExpired = useAuthStore((s) => s.setSessionExpired);

  const hydrated = useAuthHydrated();
  const [isValidating, setIsValidating] = useState(true);

  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  const handleLogout = useCallback(() => {
    logout();
    const searchParams = new URLSearchParams();
    if (pathname && !PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`))) {
      searchParams.set('returnUrl', pathname);
    }
    const query = searchParams.toString();
    router.replace(query ? `/login?${query}` : '/login');
  }, [logout, router, pathname]);

  useEffect(() => {
    // Wait for Zustand to finish restoring persisted state from localStorage.
    // Because `_hydrated` lives in the same Zustand store as the tokens,
    // React guarantees both values update in the same render cycle.
    if (!hydrated) return;

    // Public routes don't need auth validation
    if (isPublicRoute) {
      setIsValidating(false);
      return;
    }

    // No token → redirect immediately
    if (!accessToken) {
      setIsValidating(false);
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
          setSessionExpired(true);
          setIsValidating(false);
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
  }, [hydrated, accessToken, isPublicRoute, setUser, handleLogout]);

  // ---------- Role-based route protection ----------
  useEffect(() => {
    if (isValidating || isPublicRoute) return;

    const isAdminRoute = ADMIN_ONLY_ROUTES.some(
      (route) => pathname === route || pathname.startsWith(`${route}/`)
    );

    const isSuperAdminRoute = SUPER_ADMIN_ONLY_ROUTES.some(
      (route) => pathname === route || pathname.startsWith(`${route}/`)
    );

    // SUPER_ADMIN can access everything
    if (currentRole === 'SUPER_ADMIN') return;

    // Non-super-admins can't access super admin routes
    if (isSuperAdminRoute) {
      router.replace('/dashboard');
      return;
    }

    if (isAdminRoute && currentRole !== 'ADMIN') {
      router.replace('/dashboard');
      return;
    }

    // Teachers can't access certain routes that are shared between ADMIN and PARENT
    const isTeacherBlocked = TEACHER_BLOCKED_ROUTES.some(
      (route) => pathname === route || pathname.startsWith(`${route}/`)
    );
    if (isTeacherBlocked && currentRole === 'TEACHER') {
      router.replace('/dashboard');
      return;
    }

    // ── Inactive school routing ──
    if (!schoolActive) {
      // Allow subscription-related pages and school-inactive page
      const isSubscriptionPage = pathname === '/subscription' || pathname.startsWith('/subscription/');
      const isSchoolInactivePage = pathname === '/school-inactive';

      if (currentRole === 'ADMIN') {
        // Admins at inactive schools can only access the subscription page
        if (!isSubscriptionPage) {
          router.replace('/subscription');
        }
      } else if (currentRole === 'TEACHER' || currentRole === 'PARENT') {
        // Teachers/Parents at inactive schools see the inactive page
        if (!isSchoolInactivePage) {
          router.replace('/school-inactive');
        }
      }
    }
  }, [isValidating, isPublicRoute, pathname, currentRole, schoolActive, router]);

  // Prevent flash of protected content (also wait for hydration)
  if (!isPublicRoute && (!hydrated || isValidating || !accessToken)) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      {children}
      <SessionExpiryModal />
    </>
  );
}
