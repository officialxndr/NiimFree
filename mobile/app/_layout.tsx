import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SizeSheet } from '../src/components/sheets/SizeSheet';
import { ToastHost } from '../src/components/ToastHost';
import { getDb } from '../src/lib/db';
import { sizeLabel } from '../src/lib/util';
import { usePrinter } from '../src/store/printer';
import { useSettings } from '../src/store/settings';
import { useToast } from '../src/store/toast';
import { ThemeProvider, useTheme } from '../src/theme/ThemeProvider';

function RootContent() {
  const t = useTheme();
  const pendingBarcode = usePrinter((s) => s.pendingBarcode);
  const confirmSize = usePrinter((s) => s.confirmSize);
  const clearPending = usePrinter((s) => s.clearPending);
  const showToast = useToast((s) => s.show);

  return (
    <>
      <StatusBar style={t.scheme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: t.colors.bg } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="editor" />
        <Stack.Screen name="preview" options={{ presentation: 'modal' }} />
      </Stack>

      {/* Global "new label detected" sheet, driven by an unknown RFID barcode. */}
      <SizeSheet
        visible={!!pendingBarcode}
        barcode={pendingBarcode}
        onClose={clearPending}
        onConfirm={(size) => {
          confirmSize(size);
          showToast(`${sizeLabel(size.widthMm, size.heightMm)} label detected`);
        }}
      />
      <ToastHost />
    </>
  );
}

export default function RootLayout() {
  const theme = useSettings((s) => s.theme);
  const loadSettings = useSettings((s) => s.load);

  useEffect(() => {
    getDb(); // open + migrate + seed
    loadSettings();
  }, [loadSettings]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider mode={theme}>
          <RootContent />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
