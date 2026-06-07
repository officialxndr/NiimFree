import React, { useEffect } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useToast } from '../store/toast';
import { Toast } from './ui';

export function ToastHost() {
  const message = useToast((s) => s.message);
  const token = useToast((s) => s.token);
  const clear = useToast((s) => s.clear);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!message) return;
    const id = setTimeout(clear, 2200);
    return () => clearTimeout(id);
  }, [token, message, clear]);

  if (!message) return null;
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, bottom: insets.bottom + 90, alignItems: 'center' }}>
      <Toast message={message} />
    </View>
  );
}
