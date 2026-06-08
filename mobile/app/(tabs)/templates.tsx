import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, View } from 'react-native';
import { FillFieldsSheet } from '../../src/components/sheets/FillFieldsSheet';
import { Header, Screen } from '../../src/components/Screen';
import {
  Badge,
  Banner,
  Button,
  Card,
  Chip,
  EmptyState,
  IconButton,
  LabelThumbnail,
  ScrollView,
  SegmentedControl,
  Txt,
} from '../../src/components/ui';
import {
  createFolder,
  deleteFolder,
  deleteLabel,
  duplicateLabel,
  listFolders,
  listLabels,
  moveLabelToFolder,
  renameFolder,
} from '../../src/lib/db';
import { labelFromTemplate, newDesign } from '../../src/lib/factory';
import { listFields } from '../../src/lib/labelValues';
import { sizeLabel } from '../../src/lib/util';
import { useSession } from '../../src/store/session';
import { useToast } from '../../src/store/toast';
import { useTheme } from '../../src/theme/ThemeProvider';
import { Folder, LabelDesign } from '../../src/types/models';

const isStarter = (d: LabelDesign) => d.id.startsWith('tpl-');

// Sentinel folder filters alongside real folder ids.
const ALL = 'all';
const UNFILED = 'none';

export default function TemplatesScreen() {
  const t = useTheme();
  const router = useRouter();
  const setDraft = useSession((s) => s.setDraft);
  const setPreview = useSession((s) => s.setPreview);
  const showToast = useToast((s) => s.show);

  const [tab, setTab] = useState<'my' | 'starter'>('starter');
  const [all, setAll] = useState<LabelDesign[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [activeFolder, setActiveFolder] = useState<string>(ALL);
  const [fillFor, setFillFor] = useState<LabelDesign | null>(null);

  const scope: Folder['scope'] = tab === 'starter' ? 'starter' : 'mine';

  const reload = useCallback(async () => {
    const [labels, fs] = await Promise.all([listLabels(true), listFolders(scope)]);
    setAll(labels);
    setFolders(fs);
  }, [scope]);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  // Reset the folder filter when switching between My / Starter.
  useEffect(() => setActiveFolder(ALL), [tab]);

  const inTab = all.filter((d) => (tab === 'starter' ? isStarter(d) : !isStarter(d)));
  const counts: Record<string, number> = {};
  for (const d of inTab) if (d.folderId) counts[d.folderId] = (counts[d.folderId] ?? 0) + 1;
  const unfiledCount = inTab.filter((d) => !d.folderId).length;

  const list = inTab.filter((d) =>
    activeFolder === ALL ? true : activeFolder === UNFILED ? !d.folderId : d.folderId === activeFolder
  );

  const editTemplate = (d: LabelDesign) => {
    setDraft(d);
    router.push('/editor');
  };

  const newTemplate = () => {
    // Drop new templates straight into the folder you're viewing.
    const folderId = tab === 'my' && activeFolder !== ALL && activeFolder !== UNFILED ? activeFolder : undefined;
    const d = { ...newDesign({ widthMm: 40, heightMm: 30, shape: 'rect', withText: true }), isTemplate: true, name: 'New template', folderId };
    setDraft(d);
    router.push('/editor');
  };

  const createFolderPrompt = () => {
    Alert.prompt?.('New folder', 'Name this folder', async (name) => {
      const n = name?.trim();
      if (!n) return;
      const f = await createFolder(n, scope);
      await reload();
      setActiveFolder(f.id);
    });
  };

  const folderMenu = (f: Folder) => {
    Alert.alert(f.name, `${counts[f.id] ?? 0} template${(counts[f.id] ?? 0) === 1 ? '' : 's'}`, [
      {
        text: 'Rename',
        onPress: () =>
          Alert.prompt?.(
            'Rename folder',
            undefined,
            async (name) => {
              const n = name?.trim();
              if (n) {
                await renameFolder(f.id, n);
                reload();
              }
            },
            'plain-text',
            f.name
          ),
      },
      {
        text: 'Delete folder',
        style: 'destructive',
        onPress: async () => {
          await deleteFolder(f.id);
          if (activeFolder === f.id) setActiveFolder(ALL);
          reload();
          showToast('Folder deleted');
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const moveMenu = (d: LabelDesign) => {
    Alert.alert('Move to folder', d.name, [
      ...folders.map((f) => ({
        text: d.folderId === f.id ? `✓ ${f.name}` : f.name,
        onPress: async () => {
          await moveLabelToFolder(d.id, f.id);
          reload();
          showToast(`Moved to ${f.name}`);
        },
      })),
      ...(folders.length === 0
        ? [{ text: 'New folder…', onPress: createFolderPrompt }]
        : []),
      { text: 'No folder', onPress: async () => { await moveLabelToFolder(d.id, null); reload(); } },
      { text: 'Cancel', style: 'cancel' as const },
    ]);
  };

  const menu = (d: LabelDesign) => {
    Alert.alert(d.name, sizeLabel(d.widthMm, d.heightMm, d.shape), [
      { text: 'Edit', onPress: () => editTemplate(d) },
      { text: 'Duplicate', onPress: async () => { await duplicateLabel(d.id); showToast('Duplicated'); reload(); } },
      ...(isStarter(d) ? [] : [{ text: 'Move to folder…', onPress: () => moveMenu(d) }]),
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

        {/* Folder filter row */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingBottom: 14 }}
        >
          <Chip selected={activeFolder === ALL} onPress={() => setActiveFolder(ALL)}>
            All
          </Chip>
          {folders.map((f) => (
            <Chip
              key={f.id}
              icon="folder"
              selected={activeFolder === f.id}
              onPress={() => setActiveFolder(f.id)}
              onLongPress={scope === 'mine' ? () => folderMenu(f) : undefined}
            >
              {f.name}
              {counts[f.id] ? `  ${counts[f.id]}` : ''}
            </Chip>
          ))}
          {unfiledCount > 0 && folders.length > 0 && (
            <Chip selected={activeFolder === UNFILED} onPress={() => setActiveFolder(UNFILED)}>
              Unfiled
            </Chip>
          )}
          {scope === 'mine' && (
            <Chip icon="folder-plus" onPress={createFolderPrompt}>
              New folder
            </Chip>
          )}
        </ScrollView>

        {list.length === 0 ? (
          <Card>
            <EmptyState
              icon="layout-grid"
              title={
                activeFolder !== ALL
                  ? 'Nothing in this folder'
                  : tab === 'my'
                  ? 'No templates yet'
                  : 'No starter templates'
              }
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
            Mark any element as an editable field in the editor. Long-press a folder to rename or delete it.
          </Txt>
        </Banner>
      </ScrollView>

      <FillFieldsSheet
        visible={!!fillFor}
        template={fillFor}
        onClose={() => setFillFor(null)}
        onPreview={(values, design) => {
          const baked = labelFromTemplate(design, values);
          setFillFor(null);
          setPreview(baked);
          router.push('/preview');
        }}
      />
    </Screen>
  );
}
