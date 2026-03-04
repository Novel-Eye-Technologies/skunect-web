'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface ChildSummary {
  id: string;
  firstName: string;
  lastName: string;
  className: string;
  photo: string | null;
}

interface ChildState {
  selectedChildId: string | null;
  children: ChildSummary[];
}

interface ChildActions {
  setSelectedChild: (childId: string) => void;
  setChildren: (children: ChildSummary[]) => void;
  clearChildren: () => void;
}

type ChildStore = ChildState & ChildActions;

export const useChildStore = create<ChildStore>()(
  persist(
    (set) => ({
      selectedChildId: null,
      children: [],

      setSelectedChild: (childId: string) => {
        set({ selectedChildId: childId });
      },

      setChildren: (children: ChildSummary[]) => {
        set((state) => {
          // Auto-select first child if none selected
          const selectedChildId =
            state.selectedChildId &&
            children.some((c) => c.id === state.selectedChildId)
              ? state.selectedChildId
              : children[0]?.id ?? null;
          return { children, selectedChildId };
        });
      },

      clearChildren: () => {
        set({ children: [], selectedChildId: null });
      },
    }),
    {
      name: 'skunect-child-store',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
