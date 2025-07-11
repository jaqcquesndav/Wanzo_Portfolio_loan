import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AdhaWriteModeStore {
  isActive: boolean;
  setActive: (active: boolean) => void;
  toggle: () => void;
}

export const useAdhaWriteMode = create<AdhaWriteModeStore>()(
  persist(
    (set) => ({
      isActive: false,
      setActive: (active) => set({ isActive: active }),
      toggle: () => set((state) => ({ isActive: !state.isActive }))
    }),
    {
      name: 'adha-write-mode-storage'
    }
  )
);
