import { create } from "zustand";
import { persist } from "zustand/middleware";

const MAX_COMPARE_GRANTS = 3;

interface CompareState {
  selectedGrantIds: string[];
}

interface CompareActions {
  toggleGrant: (grantId: string) => boolean;
  removeGrant: (grantId: string) => void;
  clearCompare: () => void;
}

type CompareStore = CompareState & CompareActions;

export const useCompareStore = create<CompareStore>()(
  persist(
    (set, get) => ({
      selectedGrantIds: [],
      toggleGrant: (grantId) => {
        const selectedGrantIds = get().selectedGrantIds;
        if (selectedGrantIds.includes(grantId)) {
          set({ selectedGrantIds: selectedGrantIds.filter((id) => id !== grantId) });
          return true;
        }

        if (selectedGrantIds.length >= MAX_COMPARE_GRANTS) {
          return false;
        }

        set({ selectedGrantIds: [...selectedGrantIds, grantId] });
        return true;
      },
      removeGrant: (grantId) =>
        set({ selectedGrantIds: get().selectedGrantIds.filter((id) => id !== grantId) }),
      clearCompare: () => set({ selectedGrantIds: [] }),
    }),
    {
      name: "grantai-compare-store",
      partialize: (state) => ({ selectedGrantIds: state.selectedGrantIds }),
    }
  )
);

export { MAX_COMPARE_GRANTS };