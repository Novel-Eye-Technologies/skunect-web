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
}

interface AuthActions {
  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (user: UserInfo) => void;
  setCurrentSchool: (schoolId: string) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
  getCurrentSchoolRole: () => Role | null;
}

type AuthStore = AuthState & AuthActions;

const initialState: AuthState = {
  accessToken: null,
  refreshToken: null,
  user: null,
  currentSchoolId: null,
  currentRole: null,
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
        const hasExistingSchool =
          state.currentSchoolId &&
          user.roles.some((r) => r.schoolId === state.currentSchoolId);

        if (hasExistingSchool) {
          // Keep current selection, just update user data
          const currentRole = user.roles.find(
            (r) => r.schoolId === state.currentSchoolId
          )?.role ?? null;
          set({ user, currentRole });
        } else if (user.roles.length > 0) {
          // Auto-select first school
          const firstRole = user.roles[0];
          set({
            user,
            currentSchoolId: firstRole.schoolId,
            currentRole: firstRole.role,
          });
        } else {
          set({ user, currentSchoolId: null, currentRole: null });
        }
      },

      setCurrentSchool: (schoolId: string) => {
        const { user } = get();
        if (!user) return;

        const schoolRole = user.roles.find((r) => r.schoolId === schoolId);
        if (schoolRole) {
          set({
            currentSchoolId: schoolRole.schoolId,
            currentRole: schoolRole.role,
          });
        }
      },

      logout: () => {
        set(initialState);
      },

      isAuthenticated: () => {
        return !!get().accessToken;
      },

      getCurrentSchoolRole: () => {
        return get().currentRole;
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
      }),
    }
  )
);
