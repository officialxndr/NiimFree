// BLE scan + connect sheet. Lists discovered Niimbot printers and connects on tap.

import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, useWindowDimensions, View } from 'react-native';
import { ScanResult } from '../../lib/ble/transport';
import { usePrinter } from '../../store/printer';
import { useToast } from '../../store/toast';
import { useTheme } from '../../theme/ThemeProvider';
import { Banner, BottomSheet, DeviceRow, Txt } from '../ui';

export function ConnectSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const t = useTheme();
  const startScan = usePrinter((s) => s.startScan);
  const stopScan = usePrinter((s) => s.stopScan);
  const connect = usePrinter((s) => s.connect);
  const showToast = useToast((s) => s.show);

  const [devices, setDevices] = useState<ScanResult[]>([]);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const stopRef = useRef<(() => void) | null>(null);
  const { height } = useWindowDimensions();

  useEffect(() => {
    if (!visible) return;
    let active = true;
    setDevices([]);
    setError(null);
    setScanning(true);
    startScan(
      (d) => {
        if (active) setDevices((prev) => (prev.some((p) => p.id === d.id) ? prev : [...prev, d]));
      },
      (e) => {
        if (active) {
          setError(e.message);
          setScanning(false);
        }
      }
    ).then((stop) => {
      stopRef.current = stop;
    });
    return () => {
      active = false;
      stopRef.current?.();
      stopScan();
    };
  }, [visible, startScan, stopScan]);

  const onPick = async (d: ScanResult) => {
    stopRef.current?.();
    setConnectingId(d.id);
    setError(null);
    try {
      await connect(d.id, d.name);
      showToast(`Connected to ${d.name}`);
      onClose();
    } catch (e: any) {
      setError(e?.message ?? 'Could not connect.');
    } finally {
      setConnectingId(null);
    }
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Connect printer">
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        {scanning ? (
          <>
            <ActivityIndicator color={t.colors.primary} />
            <Txt variant="caption" color={t.colors.textMuted}>
              Scanning for printers…
            </Txt>
          </>
        ) : (
          <Txt variant="caption" color={t.colors.textMuted}>
            {devices.length} printer{devices.length === 1 ? '' : 's'} found
          </Txt>
        )}
      </View>

      {error && (
        <Banner variant="danger" icon="warning" title="Couldn't scan">
          <Txt variant="caption" color={t.colors.textMuted}>
            {error}
          </Txt>
        </Banner>
      )}

      <ScrollView
        style={{ minHeight: 80, maxHeight: height * 0.5 }}
        contentContainerStyle={{ gap: 10, paddingBottom: 4 }}
        showsVerticalScrollIndicator
        keyboardShouldPersistTaps="handled"
      >
        {devices.map((d) => (
          <View key={d.id}>
            <DeviceRow name={d.name} meta={d.id} rssi={d.rssi} onPress={() => onPick(d)} />
            {connectingId === d.id && (
              <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center', marginTop: 4, marginLeft: 4 }}>
                <ActivityIndicator size="small" color={t.colors.primary} />
                <Txt variant="caption" color={t.colors.textMuted}>
                  Connecting…
                </Txt>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </BottomSheet>
  );
}
