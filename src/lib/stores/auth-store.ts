'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { UserInfo, Role } from '@/lib/types/auth';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: UserInfo | null;
  currentSchoolId: string | null;
  currentRole: Role | null;
  schoolActive: boolean;
  subscriptionStatus: string | null;
  /** Internal flag — true once Zustand persist has restored state from localStorage. */
  _hydrated: boolean;
  sessionExpired: boolean;
}

interface AuthActions {
  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (user: UserInfo) => void;
  setCurrentSchool: (schoolId: string) => void;
  setSessionExpired: (expired: boolean) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
  getCurrentSchoolRole: () => Role | null;
  isSuperAdmin: () => boolean;
}

type AuthStore = AuthState & AuthActions;

const initialState: AuthState = {
  accessToken: null,
  refreshToken: null,
  user: null,
  currentSchoolId: null,
  currentRole: null,
  schoolActive: true,
  subscriptionStatus: null,
  _hydrated: false,
  sessionExpired: false,
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setTokens: (accessToken: string, refreshToken: string) => {
        set({ accessToken, refreshToken });
      },

      setUser: (user: UserInfo) => {
        const state = get();

        // Check for SUPER_ADMIN (no school)
        const superAdminRole = user.roles.find((r) => r.role === 'SUPER_ADMIN');
        if (superAdminRole) {
          set({
            user,
            currentSchoolId: null,
            currentRole: 'SUPER_ADMIN',
            schoolActive: true,
            subscriptionStatus: null,
          });
          return;
        }

        const hasExistingSchool =
          state.currentSchoolId &&
          user.roles.some((r) => r.schoolId === state.currentSchoolId);

        if (hasExistingSchool) {
          // Keep current selection, just update user data
          const currentSchoolRole = user.roles.find(
            (r) => r.schoolId === state.currentSchoolId
          );
          set({
            user,
            currentRole: (currentSchoolRole?.role as Role) ?? null,
            schoolActive: currentSchoolRole?.isSchoolActive !== false,
            subscriptionStatus: currentSchoolRole?.subscriptionStatus ?? null,
          });
        } else if (user.roles.length > 0) {
          // Auto-select first school
          const firstRole = user.roles[0];
          set({
            user,
            currentSchoolId: firstRole.schoolId,
            currentRole: firstRole.role as Role,
            schoolActive: firstRole.isSchoolActive !== false,
            subscriptionStatus: firstRole.subscriptionStatus ?? null,
          });
        } else {
          set({ user, currentSchoolId: null, currentRole: null, schoolActive: true, subscriptionStatus: null });
        }
      },

      setCurrentSchool: (schoolId: string) => {
        const { user } = get();
        if (!user) return;

        // SUPER_ADMIN doesn't switch schools
        if (get().currentRole === 'SUPER_ADMIN') return;

        const schoolRole = user.roles.find((r) => r.schoolId === schoolId);
        if (schoolRole) {
          set({
            currentSchoolId: schoolRole.schoolId,
            currentRole: schoolRole.role as Role,
            schoolActive: schoolRole.isSchoolActive !== false,
            subscriptionStatus: schoolRole.subscriptionStatus ?? null,
          });
        }
      },

      setSessionExpired: (expired: boolean) => set({ sessionExpired: expired }),

      logout: () => {
        // Keep _hydrated true — the store is still hydrated, just empty
        set({ ...initialState, _hydrated: true });
      },

      isAuthenticated: () => {
        return !!get().accessToken;
      },

      getCurrentSchoolRole: () => {
        return get().currentRole;
      },

      isSuperAdmin: () => {
        return get().currentRole === 'SUPER_ADMIN';
      },
    }),
    {
      name: 'skunect-auth',
      storage: createJSONStorage(() => {
        if (typeof window === 'undefined') {
          // SSR fallback: return a no-op storage
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          };
        }
        return localStorage;
      }),
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        currentSchoolId: state.currentSchoolId,
        currentRole: state.currentRole,
        schoolActive: state.schoolActive,
        subscriptionStatus: state.subscriptionStatus,
      }),
    }
  )
);

// After the store is created, subscribe to hydration completion.
// This MUST be outside `create()` so `useAuthStore` is already assigned.
// When persist finishes restoring from localStorage, we set `_hydrated: true`
// in the same store. Because React subscribes to the whole store via
// useSyncExternalStore, the token values and _hydrated flag are guaranteed
// to be seen in the same render cycle.
if (useAuthStore.persist.hasHydrated()) {
  useAuthStore.setState({ _hydrated: true });
} else {
  useAuthStore.persist.onFinishHydration(() => {
    useAuthStore.setState({ _hydrated: true });
  });
}

/**
 * React hook that returns `true` once the Zustand persist middleware has
 * finished restoring state from localStorage. Because `_hydrated` lives
 * inside the same Zustand store as the auth tokens, React guarantees that
 * both values update in the same render cycle — avoiding the race condition
 * where a separate useState/onFinishHydration hook could see `hydrated=true`
 * while the token selector still returns `null`.
 */
export function useAuthHydrated(): boolean {
  return useAuthStore((s) => s._hydrated);
}
