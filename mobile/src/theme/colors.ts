// Color tokens for NiimFree. Light + dark, mirroring the design spec (§5.2) plus a
// handful of derived "soft" background tones used by status chips and icon tiles.

export interface ColorTokens {
  bg: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  text: string;
  textMuted: string;
  textFaint: string;
  primary: string;
  primaryText: string;
  primarySoft: string; // tinted primary background (blue-50)
  success: string;
  successSoft: string;
  warning: string;
  warningSoft: string;
  danger: string;
  dangerSoft: string;
  accent: string;
  accentSoft: string; // violet-100
  fieldHi: string; // editable-field highlight
  scrim: string; // modal/sheet backdrop
}

export const lightColors: ColorTokens = {
  bg: '#F7F8FA',
  surface: '#FFFFFF',
  surfaceAlt: '#EFF1F4',
  border: '#E2E5EA',
  text: '#15181E',
  textMuted: '#5C6470',
  textFaint: '#9098A3',
  primary: '#2B6BF3',
  primaryText: '#FFFFFF',
  primarySoft: '#E7EEFE',
  success: '#1FA971',
  successSoft: '#E2F5EC',
  warning: '#E8A33D',
  warningSoft: '#FBF0DC',
  danger: '#E0492F',
  dangerSoft: '#FBE5E0',
  accent: '#7C4DFF',
  accentSoft: '#EDE6FF',
  fieldHi: '#FFF3D6',
  scrim: 'rgba(10, 13, 18, 0.45)',
};

export const darkColors: ColorTokens = {
  bg: '#0E1116',
  surface: '#171B22',
  surfaceAlt: '#1F242D',
  border: '#2A2F3A',
  text: '#F2F4F7',
  textMuted: '#A2AAB6',
  textFaint: '#6C7480',
  primary: '#4F86F7',
  primaryText: '#FFFFFF',
  primarySoft: '#1B2638',
  success: '#33C088',
  successSoft: '#15281F',
  warning: '#F0B259',
  warningSoft: '#2C2310',
  danger: '#F0664D',
  dangerSoft: '#2E1813',
  accent: '#9B73FF',
  accentSoft: '#241B3A',
  fieldHi: '#3A3320',
  scrim: 'rgba(0, 0, 0, 0.6)',
};
