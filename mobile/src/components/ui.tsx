// NiimFree UI primitives — React Native translations of the design-system components.
// All styling is token-driven via useTheme(); no hard-coded colors.

import React, { useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  Modal,
  Pressable,
  ScrollView,
  StyleProp,
  Switch as RNSwitch,
  Text,
  TextInput,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LabelDesign } from '../types/models';
import { FillValues } from '../lib/labelValues';
import { useTheme } from '../theme/ThemeProvider';
import { Icon } from './Icon';
import { LabelSurface, shapeRadius } from './LabelView';

type Variant = 'primary' | 'secondary' | 'accent' | 'ghost' | 'danger';
type Status = 'idle' | 'ready' | 'warning' | 'danger';

// ---- Typography ---------------------------------------------------------

export function Txt({
  variant = 'body',
  color,
  mono,
  center,
  style,
  numberOfLines,
  children,
}: {
  variant?: keyof ReturnType<typeof useTheme>['typography'];
  color?: string;
  mono?: boolean;
  center?: boolean;
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
  children: React.ReactNode;
}) {
  const t = useTheme();
  const base = t.typography[variant];
  return (
    <Text
      numberOfLines={numberOfLines}
      style={[
        {
          color: color ?? t.colors.text,
          fontFamily: mono ? t.fonts.mono : t.fonts.sans,
          fontSize: base.fontSize,
          fontWeight: base.fontWeight as TextStyle['fontWeight'],
          lineHeight: base.lineHeight,
          textAlign: center ? 'center' : undefined,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

// ---- Buttons ------------------------------------------------------------

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth,
  icon,
  iconRight,
  disabled,
  loading,
  onPress,
  children,
  style,
}: {
  variant?: Variant;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  icon?: string;
  iconRight?: string;
  disabled?: boolean;
  loading?: boolean;
  onPress?: () => void;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const t = useTheme();
  const height = size === 'sm' ? 38 : size === 'lg' ? 56 : 52;
  const bg: Record<Variant, string> = {
    primary: t.colors.primary,
    secondary: t.colors.surfaceAlt,
    accent: t.colors.accent,
    ghost: 'transparent',
    danger: t.colors.danger,
  };
  const fg: Record<Variant, string> = {
    primary: t.colors.primaryText,
    secondary: t.colors.text,
    accent: '#fff',
    ghost: t.colors.primary,
    danger: '#fff',
  };
  const iconSize = size === 'sm' ? 16 : size === 'lg' ? 22 : 20;
  return (
    <Pressable
      onPress={disabled || loading ? undefined : onPress}
      style={({ pressed }) => [
        {
          height,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          paddingHorizontal: size === 'sm' ? 14 : 20,
          borderRadius: t.radius.md,
          backgroundColor: bg[variant],
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg[variant]} />
      ) : (
        <>
          {icon && <Icon name={icon} size={iconSize} color={fg[variant]} />}
          {children != null && (
            <Txt variant={size === 'sm' ? 'bodyStrong' : 'heading'} color={fg[variant]}>
              {children}
            </Txt>
          )}
          {iconRight && <Icon name={iconRight} size={iconSize} color={fg[variant]} />}
        </>
      )}
    </Pressable>
  );
}

export function IconButton({
  icon,
  variant = 'plain',
  size = 'md',
  disabled,
  onPress,
  accessibilityLabel,
  style,
}: {
  icon: string;
  variant?: 'plain' | 'tonal' | 'primary';
  size?: 'sm' | 'md';
  disabled?: boolean;
  onPress?: () => void;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const t = useTheme();
  const dim = size === 'sm' ? 36 : 44;
  const bg = variant === 'primary' ? t.colors.primary : variant === 'tonal' ? t.colors.surfaceAlt : 'transparent';
  const fg = variant === 'primary' ? t.colors.primaryText : t.colors.text;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        {
          width: dim,
          height: dim,
          borderRadius: t.radius.md,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: bg,
          opacity: disabled ? 0.4 : pressed ? 0.7 : 1,
        },
        style,
      ]}
    >
      <Icon name={icon} size={size === 'sm' ? 18 : 22} color={fg} />
    </Pressable>
  );
}

// ---- Status / labels ----------------------------------------------------

export function StatusPill({ status = 'idle', children }: { status?: Status; children: React.ReactNode }) {
  const t = useTheme();
  const map = {
    idle: { bg: t.colors.surfaceAlt, fg: t.colors.textMuted, dot: t.colors.textFaint },
    ready: { bg: t.colors.successSoft, fg: t.colors.success, dot: t.colors.success },
    warning: { bg: t.colors.warningSoft, fg: t.colors.warning, dot: t.colors.warning },
    danger: { bg: t.colors.dangerSoft, fg: t.colors.danger, dot: t.colors.danger },
  }[status];
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: t.radius.pill,
        backgroundColor: map.bg,
      }}
    >
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: map.dot }} />
      <Txt variant="caption" color={map.fg} style={{ fontWeight: '600' }}>
        {children}
      </Txt>
    </View>
  );
}

export function Badge({
  children,
  variant = 'neutral',
  icon,
}: {
  children: React.ReactNode;
  variant?: 'neutral' | 'accent' | 'mono' | 'success';
  icon?: string;
}) {
  const t = useTheme();
  const map = {
    neutral: { bg: t.colors.surfaceAlt, fg: t.colors.textMuted },
    accent: { bg: t.colors.accentSoft, fg: t.colors.accent },
    mono: { bg: t.colors.surfaceAlt, fg: t.colors.textMuted },
    success: { bg: t.colors.successSoft, fg: t.colors.success },
  }[variant];
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: t.radius.sm,
        backgroundColor: map.bg,
      }}
    >
      {icon && <Icon name={icon} size={12} color={map.fg} />}
      <Text style={{ color: map.fg, fontSize: 12, fontWeight: '600', fontFamily: variant === 'mono' ? t.fonts.mono : t.fonts.sans }}>
        {children}
      </Text>
    </View>
  );
}

export function FieldTag({ children }: { children: React.ReactNode }) {
  const t = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: t.radius.sm,
        backgroundColor: t.colors.accent,
      }}
    >
      <Icon name="pencil" size={10} color="#fff" />
      <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>{children}</Text>
    </View>
  );
}

// ---- Surfaces -----------------------------------------------------------

export function Card({
  children,
  onPress,
  onLongPress,
  style,
  padded = true,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
}) {
  const t = useTheme();
  const base: ViewStyle = {
    backgroundColor: t.colors.surface,
    borderRadius: t.radius.lg,
    borderWidth: 1,
    borderColor: t.colors.border,
    padding: padded ? t.spacing.lg : 0,
    ...t.shadow('card'),
  };
  if (onPress || onLongPress) {
    return (
      <Pressable onPress={onPress} onLongPress={onLongPress} style={({ pressed }) => [base, { opacity: pressed ? 0.9 : 1 }, style]}>
        {children}
      </Pressable>
    );
  }
  return <View style={[base, style]}>{children}</View>;
}

export function Banner({
  variant = 'neutral',
  icon,
  title,
  children,
}: {
  variant?: 'neutral' | 'accent' | 'success' | 'warning' | 'danger';
  icon?: string;
  title?: string;
  children?: React.ReactNode;
}) {
  const t = useTheme();
  const map = {
    neutral: { bg: t.colors.surfaceAlt, fg: t.colors.text, ic: t.colors.textMuted },
    accent: { bg: t.colors.accentSoft, fg: t.colors.text, ic: t.colors.accent },
    success: { bg: t.colors.successSoft, fg: t.colors.text, ic: t.colors.success },
    warning: { bg: t.colors.warningSoft, fg: t.colors.text, ic: t.colors.warning },
    danger: { bg: t.colors.dangerSoft, fg: t.colors.text, ic: t.colors.danger },
  }[variant];
  return (
    <View style={{ flexDirection: 'row', gap: 12, padding: t.spacing.md, borderRadius: t.radius.md, backgroundColor: map.bg, marginTop: t.spacing.md }}>
      {icon && <Icon name={icon} size={20} color={map.ic} />}
      <View style={{ flex: 1, gap: 2 }}>
        {title && (
          <Txt variant="bodyStrong" color={map.fg}>
            {title}
          </Txt>
        )}
        {children}
      </View>
    </View>
  );
}

export function EmptyState({
  icon = 'inbox',
  title,
  text,
  action,
}: {
  icon?: string;
  title?: string;
  text?: string;
  action?: React.ReactNode;
}) {
  const t = useTheme();
  return (
    <View style={{ alignItems: 'center', paddingVertical: t.spacing.xl, gap: t.spacing.sm }}>
      <View
        style={{
          width: 72,
          height: 72,
          borderRadius: 36,
          backgroundColor: t.colors.surfaceAlt,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: t.spacing.xs,
        }}
      >
        <Icon name={icon} size={34} color={t.colors.textMuted} />
      </View>
      {title && <Txt variant="heading">{title}</Txt>}
      {text && (
        <Txt variant="body" color={t.colors.textMuted} center style={{ maxWidth: 280 }}>
          {text}
        </Txt>
      )}
      {action && <View style={{ marginTop: t.spacing.sm }}>{action}</View>}
    </View>
  );
}

// ---- Inputs -------------------------------------------------------------

export function Chip({ children, selected, onPress }: { children: React.ReactNode; selected?: boolean; onPress?: () => void }) {
  const t = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: t.radius.pill,
        backgroundColor: selected ? t.colors.primary : t.colors.surfaceAlt,
        borderWidth: 1,
        borderColor: selected ? t.colors.primary : t.colors.border,
      }}
    >
      <Txt variant="caption" color={selected ? t.colors.primaryText : t.colors.text} style={{ fontWeight: '600' }}>
        {children}
      </Txt>
    </Pressable>
  );
}

export function Stepper({
  value,
  min = -Infinity,
  max = Infinity,
  step = 1,
  onChange,
  format,
}: {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
}) {
  const t = useTheme();
  const btn = (icon: string, dis: boolean, onPress: () => void) => (
    <Pressable
      onPress={dis ? undefined : onPress}
      style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center', opacity: dis ? 0.3 : 1 }}
    >
      <Icon name={icon} size={18} color={t.colors.text} />
    </Pressable>
  );
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: t.colors.surfaceAlt, borderRadius: t.radius.md }}>
      {btn('minus', value <= min, () => onChange(Math.max(min, value - step)))}
      <Txt variant="bodyStrong" style={{ minWidth: 44, textAlign: 'center' }}>
        {format ? format(value) : value}
      </Txt>
      {btn('plus', value >= max, () => onChange(Math.min(max, value + step)))}
    </View>
  );
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  style,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  style?: StyleProp<ViewStyle>;
}) {
  const t = useTheme();
  return (
    <View style={[{ flexDirection: 'row', backgroundColor: t.colors.surfaceAlt, borderRadius: t.radius.md, padding: 3 }, style]}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            style={{
              flex: 1,
              paddingVertical: 8,
              borderRadius: t.radius.sm,
              alignItems: 'center',
              backgroundColor: active ? t.colors.surface : 'transparent',
              ...(active ? t.shadow('card') : {}),
            }}
          >
            <Txt variant="caption" color={active ? t.colors.text : t.colors.textMuted} style={{ fontWeight: '600' }}>
              {o.label}
            </Txt>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Switch({ value, onValueChange }: { value: boolean; onValueChange: (v: boolean) => void }) {
  const t = useTheme();
  return (
    <RNSwitch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: t.colors.border, true: t.colors.primary }}
      thumbColor="#fff"
      ios_backgroundColor={t.colors.border}
    />
  );
}

export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  icon,
  mono,
  hint,
  keyboardType,
  autoFocus,
}: {
  label?: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  icon?: string;
  mono?: boolean;
  hint?: string;
  keyboardType?: 'default' | 'numeric';
  autoFocus?: boolean;
}) {
  const t = useTheme();
  return (
    <View style={{ gap: 6 }}>
      {label && (
        <Txt variant="caption" color={t.colors.textMuted} style={{ fontWeight: '600' }}>
          {label}
        </Txt>
      )}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          backgroundColor: t.colors.surface,
          borderWidth: 1,
          borderColor: t.colors.border,
          borderRadius: t.radius.md,
          paddingHorizontal: 12,
          height: 46,
        }}
      >
        {icon && <Icon name={icon} size={18} color={t.colors.textMuted} />}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={t.colors.textFaint}
          keyboardType={keyboardType}
          autoFocus={autoFocus}
          style={{ flex: 1, color: t.colors.text, fontSize: 15, fontFamily: mono ? t.fonts.mono : t.fonts.sans }}
        />
      </View>
      {hint && (
        <Txt variant="caption" color={t.colors.textFaint}>
          {hint}
        </Txt>
      )}
    </View>
  );
}

export function DeviceRow({ name, meta, rssi, onPress }: { name: string; meta?: string; rssi?: number | null; onPress?: () => void }) {
  const t = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 12,
        borderRadius: t.radius.md,
        borderWidth: 1,
        borderColor: t.colors.border,
        backgroundColor: pressed ? t.colors.surfaceAlt : t.colors.surface,
      })}
    >
      <View style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: t.colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="printer" size={20} color={t.colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Txt variant="bodyStrong">{name}</Txt>
        {meta && (
          <Txt variant="caption" color={t.colors.textMuted} mono>
            {meta}
          </Txt>
        )}
      </View>
      {rssi != null && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Icon name="signal" size={16} color={t.colors.textMuted} />
          <Txt variant="caption" color={t.colors.textMuted}>
            {rssi} dBm
          </Txt>
        </View>
      )}
    </Pressable>
  );
}

// ---- Label thumbnail ----------------------------------------------------

export function LabelThumbnail({
  design,
  size = 120,
  highlightFields,
  values,
}: {
  design: LabelDesign;
  size?: number;
  highlightFields?: boolean;
  values?: FillValues;
}) {
  const t = useTheme();
  const ratio = design.heightMm / design.widthMm;
  let w = size;
  let h = size * ratio;
  if (h > size) {
    h = size;
    w = size / ratio;
  }
  const pxPerMm = w / design.widthMm;
  return (
    <View
      style={{
        borderRadius: shapeRadius(design.shape, w, h),
        borderWidth: 1,
        borderColor: t.colors.border,
        ...t.shadow('card'),
      }}
    >
      <LabelSurface design={design} pxPerMm={pxPerMm} highlightFields={highlightFields} values={values} />
    </View>
  );
}

// ---- Overlays -----------------------------------------------------------

export function BottomSheet({
  visible,
  onClose,
  title,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const slide = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(slide, { toValue: visible ? 1 : 0, duration: 240, useNativeDriver: true }).start();
  }, [visible, slide]);
  const translateY = slide.interpolate({ inputRange: [0, 1], outputRange: [600, 0] });
  return (
    <Modal transparent visible={visible} animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: t.colors.scrim }} onPress={onClose} />
      <Animated.View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          maxHeight: '88%',
          backgroundColor: t.colors.surface,
          borderTopLeftRadius: t.radius.xl,
          borderTopRightRadius: t.radius.xl,
          paddingHorizontal: t.spacing.lg,
          paddingTop: t.spacing.sm,
          paddingBottom: insets.bottom + t.spacing.lg,
          transform: [{ translateY }],
          ...t.shadow('sheet'),
        }}
      >
        <View style={{ width: 40, height: 4, borderRadius: 3, backgroundColor: t.colors.border, alignSelf: 'center', marginBottom: t.spacing.md }} />
        {title && (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: t.spacing.sm }}>
            <Txt variant="title">{title}</Txt>
            <IconButton icon="x" onPress={onClose} accessibilityLabel="Close" />
          </View>
        )}
        {children}
      </Animated.View>
    </Modal>
  );
}

export function CenterModal({ visible, onClose, children }: { visible: boolean; onClose?: () => void; children: React.ReactNode }) {
  const t = useTheme();
  return (
    <Modal transparent visible={visible} animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: t.colors.scrim, alignItems: 'center', justifyContent: 'center', padding: t.spacing.xl }}>
        <View
          style={{
            width: '100%',
            backgroundColor: t.colors.surface,
            borderRadius: t.radius.xl,
            padding: t.spacing.lg,
            ...t.shadow('pop'),
          }}
        >
          {children}
        </View>
      </View>
    </Modal>
  );
}

export function Toast({ message, icon = 'check-circle' }: { message: string; icon?: string }) {
  const t = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: t.scheme === 'dark' ? '#000' : '#15181E',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: t.radius.pill,
        ...t.shadow('pop'),
      }}
    >
      <Icon name={icon} size={18} color={t.colors.success} />
      <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>{message}</Text>
    </View>
  );
}

export { ScrollView };
