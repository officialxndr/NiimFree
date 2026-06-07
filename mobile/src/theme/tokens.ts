// Non-color design tokens: spacing scale, radii, typography, tap targets (spec §5.3–5.6).

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

// Typography scale. lineHeight ≈ 1.35× size. `mono` is JetBrains Mono / system mono.
export const typography = {
  display: { fontSize: 28, fontWeight: '700', lineHeight: 34 },
  title: { fontSize: 22, fontWeight: '700', lineHeight: 28 },
  heading: { fontSize: 17, fontWeight: '600', lineHeight: 23 },
  body: { fontSize: 15, fontWeight: '400', lineHeight: 20 },
  bodyStrong: { fontSize: 15, fontWeight: '600', lineHeight: 20 },
  caption: { fontSize: 13, fontWeight: '400', lineHeight: 18 },
  mono: { fontSize: 13, fontWeight: '500', lineHeight: 18 },
} as const;

export const fonts = {
  sans: undefined as string | undefined, // system font; can be swapped for bundled Inter
  mono: 'monospace', // overridden per-platform in theme
} as const;

// Minimum interactive sizes.
export const tap = {
  min: 44,
  buttonHeight: 52,
} as const;

export type Spacing = typeof spacing;
export type Radius = typeof radius;
export type Typography = typeof typography;
