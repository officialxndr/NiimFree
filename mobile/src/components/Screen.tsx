import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { Txt } from './ui';

export function Screen({ children }: { children: React.ReactNode }) {
  const t = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: t.colors.bg }}>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        {children}
      </SafeAreaView>
    </View>
  );
}

export function Header({
  title,
  large,
  left,
  right,
}: {
  title?: React.ReactNode;
  large?: boolean;
  left?: React.ReactNode;
  right?: React.ReactNode;
}) {
  const t = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        paddingHorizontal: t.spacing.lg,
        paddingTop: t.spacing.sm,
        paddingBottom: t.spacing.md,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
        {left}
        {typeof title === 'string' ? <Txt variant={large ? 'display' : 'title'}>{title}</Txt> : title}
      </View>
      {right}
    </View>
  );
}

export function SectionLabel({ children, right }: { children: React.ReactNode; right?: React.ReactNode }) {
  const t = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: t.spacing.lg, marginBottom: t.spacing.sm }}>
      <Txt variant="caption" color={t.colors.textMuted} style={{ fontWeight: '700' }}>
        {children}
      </Txt>
      {right}
    </View>
  );
}
