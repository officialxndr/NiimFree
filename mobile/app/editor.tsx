import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Alert, PanResponder, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '../src/components/Icon';
import { ElementContent, shapeRadius } from '../src/components/LabelView';
import { SizeSheet } from '../src/components/sheets/SizeSheet';
import {
  Badge,
  Banner,
  Button,
  Chip,
  IconButton,
  ScrollView,
  SegmentedControl,
  Stepper,
  Switch,
  TextField,
  Txt,
} from '../src/components/ui';
import { saveLabel } from '../src/lib/db';
import { computeDateText, nowMs, sizeLabel, uid } from '../src/lib/util';
import { useSession } from '../src/store/session';
import { useToast } from '../src/store/toast';
import { useTheme } from '../src/theme/ThemeProvider';
import {
  DateElement,
  LabelDesign,
  LabelElement,
  ShapeElement,
  TextElement,
} from '../src/types/models';

const TOOLS: { id: LabelElement['type']; icon: string; label: string; accent?: boolean }[] = [
  { id: 'text', icon: 'type', label: 'Text' },
  { id: 'shape', icon: 'square', label: 'Shape' },
  { id: 'qr', icon: 'qr-code', label: 'QR' },
  { id: 'barcode', icon: 'barcode', label: 'Barcode' },
  { id: 'image', icon: 'image', label: 'Image' },
  { id: 'date', icon: 'calendar', label: 'Date', accent: true },
];

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

export default function EditorScreen() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const draft = useSession((s) => s.draft);
  const setDraft = useSession((s) => s.setDraft);
  const setPreview = useSession((s) => s.setPreview);
  const showToast = useToast((s) => s.show);

  const [design, setDesign] = useState<LabelDesign | null>(draft);
  const [selId, setSelId] = useState<string | null>(draft?.elements[0]?.id ?? null);
  const [dirty, setDirty] = useState(false);
  const [sizeOpen, setSizeOpen] = useState(false);
  const [area, setArea] = useState({ w: 0, h: 0 });

  if (!design) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: t.colors.bg }}>
        <Txt>Nothing to edit.</Txt>
        <Button variant="ghost" onPress={() => router.back()}>
          Go back
        </Button>
      </View>
    );
  }

  const scale = area.w && area.h ? Math.min((area.w - 48) / design.widthMm, (area.h - 48) / design.heightMm) : 6;
  const cw = design.widthMm * scale;
  const ch = design.heightMm * scale;
  const sel = design.elements.find((e) => e.id === selId) ?? null;

  const patchEl = (id: string, patch: Partial<LabelElement>) => {
    setDesign((d) => (d ? { ...d, elements: d.elements.map((e) => (e.id === id ? ({ ...e, ...patch } as LabelElement) : e)) } : d));
    setDirty(true);
  };
  const updateSel = (patch: Partial<LabelElement>) => sel && patchEl(sel.id, patch);

  const addElement = async (type: LabelElement['type']) => {
    let el: LabelElement | null = null;
    const base = { id: uid(), xMm: design.widthMm * 0.15, yMm: design.heightMm * 0.4, rotation: 0 };
    const fs = Math.round(design.heightMm * 1.4);
    if (type === 'image') {
      const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 1 });
      if (res.canceled) return;
      el = { ...base, type: 'image', wMm: design.widthMm * 0.4, hMm: design.heightMm * 0.4, uri: res.assets[0].uri, dither: 'threshold' };
    } else if (type === 'text') {
      el = { ...base, type: 'text', wMm: design.widthMm * 0.7, hMm: design.heightMm * 0.25, text: 'Text', fontSize: fs, align: 'center' };
    } else if (type === 'date') {
      el = {
        ...base,
        type: 'date',
        wMm: design.widthMm * 0.7,
        hMm: design.heightMm * 0.2,
        fontSize: Math.round(fs * 0.7),
        align: 'center',
        date: { base: 'today', offsetDays: 5, format: 'MMM d', prefix: 'Use by ' },
      };
    } else if (type === 'shape') {
      el = { ...base, type: 'shape', wMm: design.widthMm * 0.5, hMm: design.heightMm * 0.3, shape: 'rect', fill: 'black', strokeWidth: 1 };
    } else if (type === 'qr') {
      el = { ...base, type: 'qr', wMm: design.heightMm * 0.5, hMm: design.heightMm * 0.5, content: 'https://', ecc: 'M' };
    } else if (type === 'barcode') {
      el = { ...base, type: 'barcode', wMm: design.widthMm * 0.6, hMm: design.heightMm * 0.3, content: '12345678', symbology: 'code128' };
    }
    if (!el) return;
    setDesign((d) => (d ? { ...d, elements: [...d.elements, el!] } : d));
    setSelId(el.id);
    setDirty(true);
    showToast(type === 'date' ? 'Date element added' : 'Element added');
  };

  const deleteSel = () => {
    if (!sel) return;
    setDesign((d) => (d ? { ...d, elements: d.elements.filter((e) => e.id !== sel.id) } : d));
    setSelId(null);
    setDirty(true);
  };

  const onBack = () => {
    if (!dirty) return router.back();
    Alert.alert('Discard changes?', 'You have unsaved changes.', [
      { text: 'Keep editing', style: 'cancel' },
      { text: 'Discard', style: 'destructive', onPress: () => router.back() },
    ]);
  };

  const doSave = async (name: string) => {
    const next = { ...design, name, updatedAt: nowMs() };
    await saveLabel(next);
    setDesign(next);
    setDraft(next);
    setDirty(false);
    showToast('Saved');
  };

  const onSave = () => {
    if (design.name === 'Untitled label' || design.name === 'New template') {
      Alert.prompt?.('Name your label', undefined, (name) => name && doSave(name), 'plain-text', design.name);
    } else {
      doSave(design.name);
    }
  };

  const onPreview = () => {
    setPreview(design);
    router.push('/preview');
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.colors.surfaceAlt }}>
      {/* top bar */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          paddingHorizontal: 8,
          paddingTop: insets.top + 6,
          paddingBottom: 8,
          backgroundColor: t.colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: t.colors.border,
        }}
      >
        <IconButton icon="arrow-left" onPress={onBack} accessibilityLabel="Back" />
        <Pressable
          onPress={() => setSizeOpen(true)}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: t.radius.pill, backgroundColor: t.colors.surfaceAlt }}
        >
          <Txt variant="bodyStrong">{sizeLabel(design.widthMm, design.heightMm, design.shape)}</Txt>
          <Icon name="chevron-down" size={14} color={t.colors.textMuted} />
        </Pressable>
        <View style={{ flexDirection: 'row', gap: 4 }}>
          <Button size="sm" variant="ghost" icon="eye" onPress={onPreview}>
            Preview
          </Button>
          <Button size="sm" variant="primary" onPress={onSave}>
            Save
          </Button>
        </View>
      </View>

      {design.isTemplate && (
        <View style={{ paddingHorizontal: 12 }}>
          <Banner variant="accent" icon="sparkles" title="Template mode">
            <Txt variant="caption" color={t.colors.textMuted}>
              Toggle any element as an editable field in the inspector below.
            </Txt>
          </Banner>
        </View>
      )}

      {/* canvas */}
      <View style={{ flex: 1 }} onLayout={(e) => setArea({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Pressable onPress={() => setSelId(null)} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
          <View
            style={{
              width: cw,
              height: ch,
              backgroundColor: '#fff',
              borderRadius: shapeRadius(design.shape, cw, ch),
              ...t.shadow('pop'),
            }}
          >
            {design.elements.map((el) => (
              <EditableElement
                key={el.id}
                el={el}
                scale={scale}
                selected={el.id === selId}
                onSelect={() => setSelId(el.id)}
                onMove={(xMm, yMm) =>
                  patchEl(el.id, {
                    xMm: clamp(xMm, 0, design.widthMm - el.wMm),
                    yMm: clamp(yMm, 0, design.heightMm - el.hMm),
                  })
                }
                onResize={(wMm, hMm) =>
                  patchEl(el.id, { wMm: clamp(wMm, 2, design.widthMm - el.xMm), hMm: clamp(hMm, 2, design.heightMm - el.yMm) })
                }
              />
            ))}
          </View>
        </View>
      </View>

      {/* insert toolbar */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0, backgroundColor: t.colors.surface, borderTopWidth: 1, borderTopColor: t.colors.border }} contentContainerStyle={{ gap: 8, padding: 12 }}>
        {TOOLS.map((tool) => (
          <Pressable
            key={tool.id}
            onPress={() => addElement(tool.id)}
            style={{ alignItems: 'center', gap: 4, paddingVertical: 8, paddingHorizontal: 14, borderRadius: t.radius.md, backgroundColor: t.colors.surfaceAlt, minWidth: 60 }}
          >
            <Icon name={tool.icon} size={20} color={tool.accent ? t.colors.accent : t.colors.text} />
            <Txt variant="caption" color={t.colors.textMuted} style={{ fontWeight: '600' }}>
              {tool.label}
            </Txt>
          </Pressable>
        ))}
      </ScrollView>

      {/* inspector */}
      <Inspector el={sel} update={updateSel} onDelete={deleteSel} isTemplate={!!design.isTemplate} maxOrder={design.elements.length} />

      <SizeSheet
        visible={sizeOpen}
        onClose={() => setSizeOpen(false)}
        onConfirm={(size) => {
          setSizeOpen(false);
          setDesign((d) => (d ? { ...d, widthMm: size.widthMm, heightMm: size.heightMm, shape: size.shape } : d));
          setDirty(true);
        }}
      />
    </View>
  );
}

function EditableElement({
  el,
  scale,
  selected,
  onSelect,
  onMove,
  onResize,
}: {
  el: LabelElement;
  scale: number;
  selected: boolean;
  onSelect: () => void;
  onMove: (xMm: number, yMm: number) => void;
  onResize: (wMm: number, hMm: number) => void;
}) {
  const t = useTheme();
  const elRef = useRef(el);
  elRef.current = el;
  const scaleRef = useRef(scale);
  scaleRef.current = scale;
  const onMoveRef = useRef(onMove);
  onMoveRef.current = onMove;
  const onResizeRef = useRef(onResize);
  onResizeRef.current = onResize;
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  const startRef = useRef({ x: 0, y: 0, w: 0, h: 0 });

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_e, g) => Math.abs(g.dx) > 2 || Math.abs(g.dy) > 2,
      onPanResponderGrant: () => {
        startRef.current = { x: elRef.current.xMm, y: elRef.current.yMm, w: elRef.current.wMm, h: elRef.current.hMm };
        onSelectRef.current();
      },
      onPanResponderMove: (_e, g) => {
        const s = scaleRef.current;
        onMoveRef.current(startRef.current.x + g.dx / s, startRef.current.y + g.dy / s);
      },
    })
  ).current;

  const resize = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        startRef.current = { x: elRef.current.xMm, y: elRef.current.yMm, w: elRef.current.wMm, h: elRef.current.hMm };
      },
      onPanResponderMove: (_e, g) => {
        const s = scaleRef.current;
        onResizeRef.current(startRef.current.w + g.dx / s, startRef.current.h + g.dy / s);
      },
    })
  ).current;

  const isField = !!el.field;
  return (
    <View
      {...pan.panHandlers}
      style={{
        position: 'absolute',
        left: el.xMm * scale,
        top: el.yMm * scale,
        width: el.wMm * scale,
        height: el.hMm * scale,
        transform: [{ rotate: `${el.rotation}deg` }],
        alignItems: el.type === 'text' || el.type === 'date' ? 'stretch' : 'center',
        justifyContent: 'center',
        borderWidth: selected ? 1.5 : isField ? 1.5 : 0,
        borderStyle: isField && !selected ? 'dashed' : 'solid',
        borderColor: selected ? t.colors.primary : t.colors.accent,
        backgroundColor: isField ? 'rgba(255,243,214,0.5)' : 'transparent',
      }}
    >
      <ElementContent el={el} scale={scale} />
      {selected && (
        <View
          {...resize.panHandlers}
          style={{
            position: 'absolute',
            right: -9,
            bottom: -9,
            width: 18,
            height: 18,
            borderRadius: 9,
            backgroundColor: t.colors.primary,
            borderWidth: 2,
            borderColor: '#fff',
          }}
        />
      )}
    </View>
  );
}

function Inspector({
  el,
  update,
  onDelete,
  isTemplate,
  maxOrder,
}: {
  el: LabelElement | null;
  update: (patch: Partial<LabelElement>) => void;
  onDelete: () => void;
  isTemplate: boolean;
  maxOrder: number;
}) {
  const t = useTheme();
  if (!el) {
    return (
      <View style={{ backgroundColor: t.colors.surface, borderTopWidth: 1, borderTopColor: t.colors.border, padding: 16, paddingBottom: 28 }}>
        <Txt variant="caption" color={t.colors.textMuted}>
          Select an element to edit it, or add one from the toolbar.
        </Txt>
      </View>
    );
  }

  const toggleField = (on: boolean) => {
    if (on) {
      update({ field: { name: 'Field', type: el.type === 'date' ? 'date' : 'text', order: maxOrder } } as Partial<LabelElement>);
    } else {
      update({ field: undefined } as Partial<LabelElement>);
    }
  };
  const canField = el.type === 'text' || el.type === 'date' || el.type === 'qr' || el.type === 'barcode';

  return (
    <ScrollView
      style={{ maxHeight: 230, backgroundColor: t.colors.surface, borderTopWidth: 1, borderTopColor: t.colors.border }}
      contentContainerStyle={{ padding: 16, paddingBottom: 28, gap: 14 }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Badge>{el.type}</Badge>
        <IconButton icon="trash" size="sm" onPress={onDelete} accessibilityLabel="Delete element" />
      </View>

      {el.type === 'text' && (
        <>
          <TextField label="Text" value={(el as TextElement).text} onChangeText={(v) => update({ text: v } as Partial<LabelElement>)} />
          <Row label="Size">
            <Stepper value={(el as TextElement).fontSize} min={8} max={120} step={2} onChange={(v) => update({ fontSize: v } as Partial<LabelElement>)} />
          </Row>
          <Row label="Align">
            <SegmentedControl
              options={[{ value: 'left', label: 'L' }, { value: 'center', label: 'C' }, { value: 'right', label: 'R' }]}
              value={(el as TextElement).align}
              onChange={(v) => update({ align: v } as Partial<LabelElement>)}
              style={{ width: 130 }}
            />
            <IconButton icon="bold" variant={(el as TextElement).bold ? 'tonal' : 'plain'} onPress={() => update({ bold: !(el as TextElement).bold } as Partial<LabelElement>)} accessibilityLabel="Bold" />
          </Row>
        </>
      )}

      {el.type === 'date' && (
        <>
          <TextField label="Prefix" value={(el as DateElement).date.prefix ?? ''} onChangeText={(v) => update({ date: { ...(el as DateElement).date, prefix: v } } as Partial<LabelElement>)} />
          <View style={{ gap: 8 }}>
            <Txt variant="caption" color={t.colors.textMuted} style={{ fontWeight: '600' }}>
              Offset · {computeDateText((el as DateElement).date)}
            </Txt>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {[1, 3, 5, 7, 14, 30].map((n) => (
                <Chip key={n} selected={(el as DateElement).date.offsetDays === n} onPress={() => update({ date: { ...(el as DateElement).date, offsetDays: n } } as Partial<LabelElement>)}>
                  +{n}d
                </Chip>
              ))}
            </View>
          </View>
          <Row label="Format">
            <SegmentedControl
              options={[{ value: 'MMM d', label: 'Jun 12' }, { value: 'yyyy-MM-dd', label: 'ISO' }, { value: 'dd/MM/yy', label: 'D/M/Y' }]}
              value={(el as DateElement).date.format}
              onChange={(v) => update({ date: { ...(el as DateElement).date, format: v } } as Partial<LabelElement>)}
              style={{ flex: 1 }}
            />
          </Row>
        </>
      )}

      {el.type === 'shape' && (
        <Row label="Fill">
          <SegmentedControl
            options={[{ value: 'black', label: 'Black' }, { value: 'white', label: 'White' }, { value: 'none', label: 'Outline' }]}
            value={(el as ShapeElement).fill}
            onChange={(v) => update({ fill: v } as Partial<LabelElement>)}
            style={{ flex: 1 }}
          />
        </Row>
      )}

      {el.type === 'qr' && (
        <>
          <TextField label="Content" value={el.content} onChangeText={(v) => update({ content: v } as Partial<LabelElement>)} />
          <Row label="Correction">
            <SegmentedControl
              options={[{ value: 'L', label: 'L' }, { value: 'M', label: 'M' }, { value: 'Q', label: 'Q' }, { value: 'H', label: 'H' }]}
              value={el.ecc}
              onChange={(v) => update({ ecc: v } as Partial<LabelElement>)}
              style={{ width: 150 }}
            />
          </Row>
        </>
      )}

      {el.type === 'barcode' && (
        <>
          <TextField label="Content" value={el.content} onChangeText={(v) => update({ content: v } as Partial<LabelElement>)} />
          <Row label="Type">
            <SegmentedControl
              options={[{ value: 'code128', label: '128' }, { value: 'ean13', label: 'EAN-13' }, { value: 'code39', label: 'Code 39' }]}
              value={el.symbology}
              onChange={(v) => update({ symbology: v } as Partial<LabelElement>)}
              style={{ flex: 1 }}
            />
          </Row>
        </>
      )}

      {canField && (
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, borderTopWidth: 1, borderTopColor: t.colors.border, paddingTop: 12 }}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Icon name="pencil" size={14} color={t.colors.accent} />
              <Txt variant="bodyStrong">Editable field</Txt>
            </View>
            {el.field && (
              <View style={{ marginTop: 8 }}>
                <TextField label="Field name" value={el.field.name} onChangeText={(v) => update({ field: { ...el.field!, name: v } } as Partial<LabelElement>)} />
              </View>
            )}
          </View>
          <Switch value={!!el.field} onValueChange={toggleField} />
        </View>
      )}
    </ScrollView>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  const t = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
      <Txt variant="bodyStrong">{label}</Txt>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>{children}</View>
    </View>
  );
}
