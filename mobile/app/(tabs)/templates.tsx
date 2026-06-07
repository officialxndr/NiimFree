import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, View } from 'react-native';
import { FillFieldsSheet } from '../../src/components/sheets/FillFieldsSheet';
import { Header, Screen } from '../../src/components/Screen';
import {
  Badge,
  Banner,
  Button,
  Card,
  EmptyState,
  IconButton,
  LabelThumbnail,
  ScrollView,
  SegmentedControl,
  Txt,
} from '../../src/components/ui';
import { deleteLabel, duplicateLabel, listLabels, saveLabel } from '../../src/lib/db';
import { labelFromTemplate, newDesign } from '../../src/lib/factory';
import { listFields } from '../../src/lib/labelValues';
import { sizeLabel } from '../../src/lib/util';
import { useSession } from '../../src/store/session';
import { useToast } from '../../src/store/toast';
import { useTheme } from '../../src/theme/ThemeProvider';
import { LabelDesign } from '../../src/types/models';

const isStarter = (d: LabelDesign) => d.id.startsWith('tpl-');

export default function TemplatesScreen() {
  const t = useTheme();
  const router = useRouter();
  const setDraft = useSession((s) => s.setDraft);
  const setPreview = useSession((s) => s.setPreview);
  const showToast = useToast((s) => s.show);

  const [tab, setTab] = useState<'my' | 'starter'>('starter');
  const [all, setAll] = useState<LabelDesign[]>([]);
  const [fillFor, setFillFor] = useState<LabelDesign | null>(null);

  const reload = useCallback(async () => setAll(await listLabels(true)), []);
  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  const list = all.filter((d) => (tab === 'starter' ? isStarter(d) : !isStarter(d)));

  const editTemplate = (d: LabelDesign) => {
    setDraft(d);
    router.push('/editor');
  };

  const newTemplate = () => {
    const d = { ...newDesign({ widthMm: 40, heightMm: 30, shape: 'rect', withText: true }), isTemplate: true, name: 'New template' };
    setDraft(d);
    router.push('/editor');
  };

  const menu = (d: LabelDesign) => {
    Alert.alert(d.name, sizeLabel(d.widthMm, d.heightMm, d.shape), [
      { text: 'Edit', onPress: () => editTemplate(d) },
      { text: 'Duplicate', onPress: async () => { await duplicateLabel(d.id); showToast('Duplicated'); reload(); } },
      ...(isStarter(d) ? [] : [{ text: 'Delete', style: 'destructive' as const, onPress: async () => { await deleteLabel(d.id); reload(); } }]),
      { text: 'Cancel', style: 'cancel' as const },
    ]);
  };

  return (
    <Screen>
      <Header title="Templates" right={<IconButton variant="tonal" icon="plus" onPress={newTemplate} accessibilityLabel="New template" />} />
      <ScrollView contentContainerStyle={{ padding: t.spacing.lg, paddingTop: 0 }}>
        <SegmentedControl
          options={[
            { value: 'my', label: 'My templates' },
            { value: 'starter', label: 'Starter' },
          ]}
          value={tab}
          onChange={(v) => setTab(v as 'my' | 'starter')}
          style={{ marginBottom: 14 }}
        />

        {list.length === 0 ? (
          <Card>
            <EmptyState
              icon="layout-grid"
              title={tab === 'my' ? 'No templates yet' : 'No starter templates'}
              text="Templates let you design once and fill in the blanks. Make one from any label."
              action={
                <Button variant="primary" icon="plus" onPress={newTemplate}>
                  New template
                </Button>
              }
            />
          </Card>
        ) : (
          <View style={{ gap: 12 }}>
            {list.map((d) => {
              const fields = listFields(d);
              return (
                <Card key={d.id} onLongPress={() => menu(d)}>
                  <View style={{ flexDirection: 'row', gap: 14 }}>
                    <LabelThumbnail design={d} size={d.shape === 'cable' ? 40 : 96} highlightFields />
                    <View style={{ flex: 1, gap: 6 }}>
                      <Txt variant="heading">{d.name}</Txt>
                      <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
                        <Badge variant="accent">
                          {fields.length} field{fields.length === 1 ? '' : 's'}
                        </Badge>
                        <Badge variant="mono">{sizeLabel(d.widthMm, d.heightMm, d.shape)}</Badge>
                      </View>
                      <View style={{ flex: 1 }} />
                      <View style={{ flexDirection: 'row', gap: 8 }}>
                        <Button size="sm" variant="accent" icon="sparkles" onPress={() => setFillFor(d)}>
                          Use
                        </Button>
                        <IconButton size="sm" variant="tonal" icon="more" onPress={() => menu(d)} accessibilityLabel="More" />
                      </View>
                    </View>
                  </View>
                </Card>
              );
            })}
          </View>
        )}

        <Banner variant="accent" icon="info" title="Design once, fill the blanks">
          <Txt variant="caption" color={t.colors.textMuted}>
            Mark any element as an editable field in the editor.
          </Txt>
        </Banner>
      </ScrollView>

      <FillFieldsSheet
        visible={!!fillFor}
        template={fillFor}
        onClose={() => setFillFor(null)}
        onPreview={(values) => {
          if (!fillFor) return;
          const baked = labelFromTemplate(fillFor, values);
          setFillFor(null);
          setPreview(baked);
          router.push('/preview');
        }}
      />
    </Screen>
  );
}
