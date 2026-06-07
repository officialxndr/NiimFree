import { create } from 'zustand';
import { FillValues } from '../lib/labelValues';
import { LabelDesign } from '../types/models';

// Carries non-serializable working state between routes (Expo Router params are strings only).
interface SessionState {
  draft: LabelDesign | null; // the design currently open in the editor
  preview: { design: LabelDesign; values?: FillValues } | null;
  setDraft: (design: LabelDesign | null) => void;
  setPreview: (design: LabelDesign, values?: FillValues) => void;
  clearPreview: () => void;
}

export const useSession = create<SessionState>((set) => ({
  draft: null,
  preview: null,
  setDraft: (draft) => set({ draft }),
  setPreview: (design, values) => set({ preview: { design, values } }),
  clearPreview: () => set({ preview: null }),
}));
