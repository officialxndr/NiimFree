import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, Pressable, View } from 'react-native';
import { Icon } from '../../src/components/Icon';
import { Header, Screen, SectionLabel } from '../../src/components/Screen';
import { Button, Card, EmptyState, LabelThumbnail, ScrollView, StatusPill, Txt } from '../../src/components/ui';
import { deleteLabel, duplicateLabel, listLabels, saveLabel } from '../../src/lib/db';
import { newDesign } from '../../src/lib/factory';
import { relativeTime, sizeLabel } from '../../src/lib/util';
import { usePrinter } from '../../src/store/printer';
import { useSession } from '../../src/store/session';
import { useToast } from '../../src/store/toast';
import { useTheme } from '../../src/theme/ThemeProvider';
import { LabelDesign } from '../../src/types/models';

function Wordmark() {
  const t = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: t.colors.primary, alignItems: 'center', justifyContent: 'center', ...t.shadow('fab') }}>
        <Icon name="tag" size={20} color="#fff" />
      </View>
      <Txt variant="display" style={{ fontSize: 26 }}>
        Niim<Txt variant="display" style={{ fontSize: 26 }} color={t.colors.primary}>Free</Txt>
      </Txt>
    </View>
  );
}

export default function LabelsScreen() {
  const t = useTheme();
  const router = useRouter();
  const connection = usePrinter((s) => s.connection);
  const detected = usePrinter((s) => s.detected);
  const setDraft = useSession((s) => s.setDraft);
  const setPreview = useSession((s) => s.setPreview);
  const showToast = useToast((s) => s.show);
  const [labels, setLabels] = useState<LabelDesign[]>([]);

  const reload = useCallback(async () => setLabels(await listLabels(false)), []);
  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  const startNew = (withText = true) => {
    const size = detected ?? { widthMm: 40, heightMm: 30, shape: 'rect' as const };
    const d = newDesign({ widthMm: size.widthMm, heightMm: size.heightMm, shape: size.shape, withText });
    setDraft(d);
    router.push('/editor');
  };

  const open = (l: LabelDesign) => {
    setDraft(l);
    router.push('/editor');
  };

  const menu = (l: LabelDesign) => {
    Alert.alert(l.name, sizeLabel(l.widthMm, l.heightMm, l.shape), [
      { text: 'Print', onPress: () => { setPreview(l); router.push('/preview'); } },
      { text: 'Duplicate', onPress: async () => { await duplicateLabel(l.id); showToast('Duplicated'); reload(); } },
      {
        text: 'Rename',
        onPress: () =>
          Alert.prompt?.('Rename label', undefined, async (name) => {
            if (name) { await saveLabel({ ...l, name, updatedAt: Date.now() }); reload(); }
          }, 'plain-text', l.name),
      },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteLabel(l.id); showToast('Deleted'); reload(); } },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <Screen>
      <Header
        title={<Wordmark />}
        right={
          <Pressable onPress={() => router.navigate('/print')}>
            <StatusPill status={connection === 'connected' ? 'ready' : 'idle'}>
              {connection === 'connected' ? 'Ready' : 'Not connected'}
            </StatusPill>
          </Pressable>
        }
      />
      <ScrollView contentContainerStyle={{ padding: t.spacing.lg, paddingTop: 0 }}>
        <Button variant="primary" size="lg" fullWidth icon="plus" onPress={() => startNew(true)}>
          New label
        </Button>

        <View style={{ flexDirection: 'row', gap: 9, marginTop: 12 }}>
          {[
            { k: 'blank', icon: 'square', label: 'Blank', onPress: () => startNew(false) },
            { k: 'template', icon: 'shapes', label: 'From template', onPress: () => router.navigate('/templates') },
            { k: 'text', icon: 'type', label: 'Quick text', onPress: () => startNew(true) },
          ].map((q) => (
            <Pressable
              key={q.k}
              onPress={q.onPress}
              style={{
                flex: 1,
                alignItems: 'center',
                gap: 6,
                paddingVertical: 12,
                borderRadius: t.radius.md,
                backgroundColor: t.colors.surface,
                borderWidth: 1,
                borderColor: t.colors.border,
              }}
            >
              <Icon name={q.icon} size={20} color={t.colors.primary} />
              <Txt variant="caption" style={{ fontWeight: '600' }}>
                {q.label}
              </Txt>
            </Pressable>
          ))}
        </View>

        <SectionLabel>Recent</SectionLabel>
        {labels.length === 0 ? (
          <Card>
            <EmptyState
              icon="tags"
              title="No labels yet"
              text="Create your first one — design it, then print."
              action={
                <Button variant="primary" icon="plus" onPress={() => startNew(true)}>
                  New label
                </Button>
              }
            />
          </Card>
        ) : (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 }}>
            {labels.map((l) => (
              <Card key={l.id} onPress={() => open(l)} onLongPress={() => menu(l)} style={{ width: '47.5%' }}>
                <View style={{ alignItems: 'center', paddingVertical: 4 }}>
                  <LabelThumbnail design={l} size={l.shape === 'cable' ? 44 : 120} />
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 8 }}>
                  <View style={{ flex: 1 }}>
                    <Txt variant="bodyStrong" numberOfLines={1}>
                      {l.name}
                    </Txt>
                    <Txt variant="caption" mono color={t.colors.textMuted}>
                      {sizeLabel(l.widthMm, l.heightMm, l.shape)}
                    </Txt>
                  </View>
                  <Txt variant="caption" color={t.colors.textFaint}>
                    {relativeTime(l.updatedAt)}
                  </Txt>
                </View>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}
