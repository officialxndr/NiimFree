import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, Pressable, View } from 'react-native';
import { Icon } from '../../src/components/Icon';
import { Header, Screen, SectionLabel } from '../../src/components/Screen';
import { Badge, Banner, Card, EmptyState, ScrollView, SegmentedControl, Switch, Txt } from '../../src/components/ui';
import { deleteDatePreset, deleteRemembered, listDatePresets, listRemembered, saveDatePreset } from '../../src/lib/db';
import { relativeTime, sizeLabel, uid } from '../../src/lib/util';
import { useSettings } from '../../src/store/settings';
import { useToast } from '../../src/store/toast';
import { useTheme } from '../../src/theme/ThemeProvider';
import { DatePreset, RememberedLabel } from '../../src/types/models';

function Row({ children, onPress, divider }: { children: React.ReactNode; onPress?: () => void; divider?: boolean }) {
  const t = useTheme();
  const Comp: any = onPress ? Pressable : View;
  return (
    <Comp
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 14,
        borderTopWidth: divider ? 1 : 0,
        borderTopColor: t.colors.border,
      }}
    >
      {children}
    </Comp>
  );
}

export default function SettingsScreen() {
  const t = useTheme();
  const settings = useSettings();
  const showToast = useToast((s) => s.show);
  const [remembered, setRemembered] = useState<RememberedLabel[]>([]);
  const [presets, setPresets] = useState<DatePreset[]>([]);

  const reload = useCallback(async () => {
    setRemembered(await listRemembered());
    setPresets(await listDatePresets());
  }, []);
  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  const editRemembered = (r: RememberedLabel) => {
    Alert.alert(sizeLabel(r.widthMm, r.heightMm, r.shape), r.barcode, [
      { text: 'Forget label', style: 'destructive', onPress: async () => { await deleteRemembered(r.id); reload(); } },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const addPreset = () => {
    Alert.prompt?.('New date preset', 'Name', (name) => {
      if (!name) return;
      Alert.prompt?.('Offset in days', 'e.g. 7', async (days) => {
        const offset = parseInt(days, 10);
        if (!Number.isFinite(offset)) return;
        await saveDatePreset({ id: uid(), name, offsetDays: offset, format: 'MMM d', prefix: 'Use by ' });
        reload();
      }, 'plain-text', '7');
    });
  };

  const editPreset = (p: DatePreset) => {
    Alert.alert(p.name, `+${p.offsetDays} days`, [
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteDatePreset(p.id); reload(); } },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <Screen>
      <Header title="Settings" />
      <ScrollView contentContainerStyle={{ padding: t.spacing.lg, paddingTop: 0 }}>
        <SectionLabel>Appearance</SectionLabel>
        <Card>
          <SegmentedControl
            options={[
              { value: 'system', label: 'System' },
              { value: 'light', label: 'Light' },
              { value: 'dark', label: 'Dark' },
            ]}
            value={settings.theme}
            onChange={(v) => settings.update({ theme: v as 'system' | 'light' | 'dark' })}
          />
        </Card>

        <SectionLabel>Remembered labels</SectionLabel>
        <Card>
          {remembered.length === 0 ? (
            <EmptyState icon="ruler" text="Labels you confirm will be remembered here, mapped to their barcode." />
          ) : (
            remembered.map((r, i) => (
              <Row key={r.id} divider={i > 0} onPress={() => editRemembered(r)}>
                <View style={{ width: 32, height: 32, borderRadius: 9, backgroundColor: t.colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="ruler" size={18} color={t.colors.textMuted} />
                </View>
                <View style={{ flex: 1 }}>
                  <Txt variant="bodyStrong" mono>
                    {sizeLabel(r.widthMm, r.heightMm, r.shape)}
                  </Txt>
                  <Txt variant="caption" mono color={t.colors.textMuted}>
                    {r.barcode}
                  </Txt>
                </View>
                <Txt variant="caption" color={t.colors.textFaint}>
                  {relativeTime(r.lastUsedAt)}
                </Txt>
                <Icon name="chevron-right" size={18} color={t.colors.textFaint} />
              </Row>
            ))
          )}
        </Card>

        <SectionLabel right={<Pressable onPress={addPreset}><Txt variant="caption" color={t.colors.primary} style={{ fontWeight: '700' }}>Add</Txt></Pressable>}>
          Date presets
        </SectionLabel>
        <Card>
          {presets.map((p, i) => (
            <Row key={p.id} divider={i > 0} onPress={() => editPreset(p)}>
              <View style={{ width: 32, height: 32, borderRadius: 9, backgroundColor: t.colors.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="calendar-clock" size={18} color={t.colors.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Txt variant="bodyStrong">{p.name}</Txt>
              </View>
              <Badge variant="accent">+{p.offsetDays} days</Badge>
            </Row>
          ))}
        </Card>

        <SectionLabel>Privacy</SectionLabel>
        <Card>
          <Row>
            <View style={{ width: 32, height: 32, borderRadius: 9, backgroundColor: t.colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="cloud" size={18} color={t.colors.textMuted} />
            </View>
            <View style={{ flex: 1 }}>
              <Txt variant="bodyStrong">Cloud lookup</Txt>
              <Txt variant="caption" color={t.colors.textMuted}>
                Look up unknown labels online. Off by default.
              </Txt>
            </View>
            <Switch value={settings.cloudLookupEnabled} onValueChange={(v) => settings.update({ cloudLookupEnabled: v })} />
          </Row>
          <Row divider>
            <View style={{ width: 32, height: 32, borderRadius: 9, backgroundColor: t.colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="volume" size={18} color={t.colors.textMuted} />
            </View>
            <View style={{ flex: 1 }}>
              <Txt variant="bodyStrong">Printer sound</Txt>
            </View>
            <Switch value={settings.printerSound} onValueChange={(v) => settings.update({ printerSound: v })} />
          </Row>
        </Card>

        <Banner variant="success" icon="shield-check" title="No account · No tracking">
          <Txt variant="caption" color={t.colors.textMuted}>
            Everything lives on this device. Open-source under MIT.
          </Txt>
        </Banner>
      </ScrollView>
    </Screen>
  );
}
