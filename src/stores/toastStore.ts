import { create } from 'zustand';

// Toast types
export type ToastType = 'success' | 'error' | 'info' | 'warning';

// Toast interface
export interface ToastData {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

// Toast store interface
interface ToastStore {
  toasts: ToastData[];
  addToast: (type: ToastType, message: string, duration?: number) => string;
  removeToast: (id: string) => void;
}

// Create Zustand store
export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (type, message, duration = 5000) => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({
      toasts: [...state.toasts, { id, type, message, duration }],
    }));

    if (duration !== Infinity) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((toast) => toast.id !== id),
        }));
      }, duration);
    }

    return id;
  },
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  },
}));
