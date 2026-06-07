import React, { createContext, useContext, useMemo } from 'react';
import { Platform, useColorScheme } from 'react-native';
import { ColorTokens, darkColors, lightColors } from './colors';
import { fonts, radius, spacing, tap, typography } from './tokens';

export type ThemeMode = 'system' | 'light' | 'dark';

export interface Theme {
  scheme: 'light' | 'dark';
  colors: ColorTokens;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
  tap: typeof tap;
  fonts: { sans: string | undefined; mono: string };
  // Elevation helpers — spread into a style object.
  shadow: (level: 'card' | 'sheet' | 'pop' | 'fab') => object;
}

const monoFamily = Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' })!;

function makeTheme(scheme: 'light' | 'dark'): Theme {
  const colors = scheme === 'dark' ? darkColors : lightColors;
  const shadowColor = '#000';
  const shadow = (level: 'card' | 'sheet' | 'pop' | 'fab'): object => {
    const presets = {
      card: { opacity: scheme === 'dark' ? 0.3 : 0.06, radius: 10, offset: 3, elevation: 2 },
      sheet: { opacity: scheme === 'dark' ? 0.5 : 0.18, radius: 24, offset: -4, elevation: 16 },
      pop: { opacity: scheme === 'dark' ? 0.5 : 0.16, radius: 28, offset: 12, elevation: 12 },
      fab: { opacity: scheme === 'dark' ? 0.5 : 0.3, radius: 12, offset: 4, elevation: 6 },
    } as const;
    const p = presets[level];
    return {
      shadowColor,
      shadowOpacity: p.opacity,
      shadowRadius: p.radius,
      shadowOffset: { width: 0, height: p.offset },
      elevation: p.elevation,
    };
  };
  return {
    scheme,
    colors,
    spacing,
    radius,
    typography,
    tap,
    fonts: { sans: fonts.sans, mono: monoFamily },
    shadow,
  };
}

const ThemeContext = createContext<Theme>(makeTheme('light'));

export function ThemeProvider({ mode, children }: { mode: ThemeMode; children: React.ReactNode }) {
  const system = useColorScheme();
  const scheme: 'light' | 'dark' = mode === 'system' ? (system === 'dark' ? 'dark' : 'light') : mode;
  const theme = useMemo(() => makeTheme(scheme), [scheme]);
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  return useContext(ThemeContext);
}
