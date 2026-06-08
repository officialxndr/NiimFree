import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { View } from 'react-native';
import { Icon } from '../../src/components/Icon';
import { ConnectSheet } from '../../src/components/sheets/ConnectSheet';
import { SizeSheet } from '../../src/components/sheets/SizeSheet';
import { Header, Screen, SectionLabel } from '../../src/components/Screen';
import { Badge, Banner, Button, Card, EmptyState, IconButton, StatusPill, Stepper, ScrollView, Txt } from '../../src/components/ui';
import { makeTestBitmap } from '../../src/lib/testLabel';
import { sizeLabel } from '../../src/lib/util';
import { usePrinter } from '../../src/store/printer';
import { useSettings } from '../../src/store/settings';
import { useToast } from '../../src/store/toast';
import { useTheme } from '../../src/theme/ThemeProvider';

function Stat({ icon, label, value, ok }: { icon: string; label: string; value: string; ok?: boolean }) {
  const t = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, width: '47%' }}>
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: ok ? t.colors.successSoft : t.colors.surfaceAlt,
        }}
      >
        <Icon name={icon} size={18} color={ok ? t.colors.success : t.colors.textMuted} />
      </View>
      <View>
        <Txt variant="caption" color={t.colors.textFaint} style={{ fontWeight: '600' }}>
          {label}
        </Txt>
        <Txt variant="bodyStrong">{value}</Txt>
      </View>
    </View>
  );
}

export default function PrintScreen() {
  const t = useTheme();
  const printer = usePrinter();
  const settings = useSettings();
  const showToast = useToast((s) => s.show);
  const [connectOpen, setConnectOpen] = useState(false);
  const [sizeOpen, setSizeOpen] = useState(false);
  const [testing, setTesting] = useState(false);

  useFocusEffect(
    useCallback(() => {
      usePrinter.getState().autoConnect(); // (re)start watching for the last printer if disconnected
      printer.refreshStatus();
      const id = setInterval(() => printer.refreshStatus(), 3000); // live lid/paper while viewing
      return () => clearInterval(id);
    }, []) // eslint-disable-line react-hooks/exhaustive-deps
  );

  const connected = printer.connection === 'connected';
  const status = printer.status;
  const detected = printer.detected;

  const testPrint = async () => {
    const w = detected?.widthMm ?? 40;
    const h = detected?.heightMm ?? 30;
    setTesting(true);
    try {
      await printer.print(makeTestBitmap(w, h), { density: settings.defaultDensity, quantity: 1 });
      showToast('Test label printed');
    } catch (e: any) {
      showToast(e?.message ?? 'Print failed');
    } finally {
      setTesting(false);
    }
  };

  return (
    <Screen>
      <Header
        title="Print"
        right={connected ? <IconButton icon="refresh" onPress={() => printer.refreshStatus()} accessibilityLabel="Refresh status" /> : undefined}
      />
      <ScrollView contentContainerStyle={{ padding: t.spacing.lg, paddingTop: 0 }}>
        {connected ? (
          <Card>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: t.colors.successSoft, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="printer" size={22} color={t.colors.success} />
              </View>
              <View style={{ flex: 1 }}>
                <Txt variant="heading">{printer.identity?.model ?? 'Printer'}</Txt>
                <Txt variant="mono" color={t.colors.textMuted}>
                  {printer.identity?.serial ?? ''}
                </Txt>
              </View>
              <StatusPill status="ready">Ready</StatusPill>
            </View>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 16 }}>
              <Stat icon="battery" label="Battery" value={status.batteryPct != null ? `${status.batteryPct}%` : '—'} ok={(status.batteryPct ?? 0) > 20} />
              <Stat icon="lid" label="Lid" value={status.doorOpen == null ? '—' : status.doorOpen ? 'Open' : 'Closed'} ok={status.doorOpen === false} />
              <Stat icon="paper" label="Paper" value={status.paperPresent == null ? '—' : status.paperPresent ? 'Loaded' : 'Empty'} ok={status.paperPresent === true} />
              <Stat icon="radio" label="RFID" value={status.rfidOk == null ? '—' : status.rfidOk ? 'Read OK' : 'No tag'} ok={status.rfidOk === true} />
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: t.colors.border }}>
              <View style={{ width: 32, height: 32, borderRadius: 9, backgroundColor: t.colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="ruler" size={18} color={t.colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Txt variant="bodyStrong">Detected label</Txt>
                <Txt variant="caption" color={t.colors.textMuted}>
                  {detected ? 'Locked from RFID' : 'Unknown — tap to set'}
                </Txt>
              </View>
              {detected ? (
                <Badge variant="mono">{sizeLabel(detected.widthMm, detected.heightMm, detected.shape)}</Badge>
              ) : (
                <Button size="sm" variant="secondary" onPress={() => setSizeOpen(true)}>
                  Set
                </Button>
              )}
            </View>

            <Button variant="secondary" fullWidth icon="bluetooth-off" style={{ marginTop: 14 }} onPress={() => printer.disconnect()}>
              Disconnect
            </Button>
          </Card>
        ) : (
          <Card>
            <EmptyState
              icon="bluetooth"
              title="No printer connected"
              text="Connect over Bluetooth to print. No account needed."
              action={
                <Button variant="primary" icon="bluetooth" loading={printer.connection === 'connecting'} onPress={() => setConnectOpen(true)}>
                  Connect printer
                </Button>
              }
            />
          </Card>
        )}

        <SectionLabel>Defaults</SectionLabel>
        <Card>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Txt variant="bodyStrong">Density</Txt>
            <Stepper value={settings.defaultDensity} min={1} max={5} onChange={(v) => settings.update({ defaultDensity: v })} />
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
            <Txt variant="bodyStrong">Quantity</Txt>
            <Stepper value={settings.defaultQuantity} min={1} max={99} onChange={(v) => settings.update({ defaultQuantity: v })} />
          </View>
        </Card>

        <Button variant="secondary" fullWidth icon="flask" style={{ marginTop: 14 }} disabled={!connected} loading={testing} onPress={testPrint}>
          Test print
        </Button>

        {!connected && (
          <Banner variant="neutral" icon="info">
            <Txt variant="caption" color={t.colors.textMuted}>
              Make sure your Niimbot printer is on and nearby, then connect.
            </Txt>
          </Banner>
        )}
      </ScrollView>

      <ConnectSheet visible={connectOpen} onClose={() => setConnectOpen(false)} />
      <SizeSheet
        visible={sizeOpen}
        onClose={() => setSizeOpen(false)}
        onConfirm={(size) => {
          printer.confirmSize(size);
          setSizeOpen(false);
          showToast(`${size.widthMm}×${size.heightMm} label set`);
        }}
      />
    </Screen>
  );
}
