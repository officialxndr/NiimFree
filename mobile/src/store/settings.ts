import { create } from 'zustand';
import { getSettings, saveSettings, DEFAULT_SETTINGS } from '../lib/db';
import { AppSettings } from '../types/models';

interface SettingsState extends AppSettings {
  loaded: boolean;
  load: () => Promise<void>;
  update: (partial: Partial<AppSettings>) => Promise<void>;
}

export const useSettings = create<SettingsState>((set, get) => ({
  ...DEFAULT_SETTINGS,
  loaded: false,
  load: async () => {
    const s = await getSettings();
    set({ ...s, loaded: true });
  },
  update: async (partial) => {
    const next: AppSettings = {
      defaultDensity: get().defaultDensity,
      defaultQuantity: get().defaultQuantity,
      defaultSizeId: get().defaultSizeId,
      cloudLookupEnabled: get().cloudLookupEnabled,
      printerSound: get().printerSound,
      theme: get().theme,
      ...partial,
    };
    set(next);
    await saveSettings(next);
  },
}));
