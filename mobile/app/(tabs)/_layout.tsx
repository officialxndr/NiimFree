import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { Icon } from '../../src/components/Icon';
import { useTheme } from '../../src/theme/ThemeProvider';

export default function TabsLayout() {
  const t = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: t.colors.primary,
        tabBarInactiveTintColor: t.colors.textFaint,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarStyle: {
          backgroundColor: t.colors.surface,
          borderTopColor: t.colors.border,
          height: Platform.OS === 'ios' ? 84 : 64,
          paddingTop: 6,
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Labels', tabBarIcon: ({ color }) => <Icon name="tags" size={24} color={color} /> }} />
      <Tabs.Screen name="templates" options={{ title: 'Templates', tabBarIcon: ({ color }) => <Icon name="layout-grid" size={24} color={color} /> }} />
      <Tabs.Screen name="print" options={{ title: 'Print', tabBarIcon: ({ color }) => <Icon name="printer" size={24} color={color} /> }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings', tabBarIcon: ({ color }) => <Icon name="settings" size={24} color={color} /> }} />
    </Tabs>
  );
}
