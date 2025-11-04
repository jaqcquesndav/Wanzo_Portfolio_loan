import { create } from 'zustand';

interface ChatModeStore {
  isFloating: boolean;
  isOpen: boolean;
  setFloating: (floating: boolean) => void;
  setOpen: (open: boolean) => void;
  toggle: () => void;
}

export const useChatMode = create<ChatModeStore>((set) => ({
  isFloating: true,
  isOpen: false,
  setFloating: (floating) => set({ isFloating: floating }),
  setOpen: (open) => set({ isOpen: open }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen }))
}));
