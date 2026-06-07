import { create } from 'zustand';

interface ToastState {
  message: string | null;
  token: number;
  show: (message: string) => void;
  clear: () => void;
}

export const useToast = create<ToastState>((set) => ({
  message: null,
  token: 0,
  show: (message) => set((s) => ({ message, token: s.token + 1 })),
  clear: () => set({ message: null }),
}));
