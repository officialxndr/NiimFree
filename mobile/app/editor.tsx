import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Keyboard, PanResponder, Pressable, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '../src/components/Icon';
import { ElementContent, shapeRadius } from '../src/components/LabelView';
import { SizeSheet } from '../src/components/sheets/SizeSheet';
import {
  Badge,
  Banner,
  BottomSheet,
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
import { resizeDesign } from '../src/lib/factory';
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

// Slack around the label inside the canvas so selection handles parked at the label's edge
// stay within a touchable frame (iOS clips touches to each view's bounds). Kept tight so the
// label fills as much of the canvas as possible.
const CANVAS_MARGIN = 16;

// Font choices map to platform-installed families (no bundling needed). 'sans' = system.
const FONTS: { label: string; value: string }[] = [
  { label: 'Sans', value: 'sans' },
  { label: 'Serif', value: 'Georgia' },
  { label: 'Mono', value: 'Courier New' },
  { label: 'Round', value: 'Arial Rounded MT Bold' },
];

function elementLabel(el: LabelElement): string {
  switch (el.type) {
    case 'text':
      return (el as TextElement).text || 'Text';
    case 'date':
      return 'Date';
    case 'qr':
      return 'QR code';
    case 'barcode':
      return 'Barcode';
    case 'image':
      return 'Image';
    case 'shape':
      return 'Shape';
    default:
      return el.type;
  }
}

export default function EditorScreen() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const draft = useSession((s) => s.draft);
  const setDraft = useSession((s) => s.setDraft);
  const setPreview = useSession((s) => s.setPreview);
  const showToast = useToast((s) => s.show);
  const { width: winW, height: winH } = useWindowDimensions();

  const [design, setDesign] = useState<LabelDesign | null>(draft);
  const [selId, setSelId] = useState<string | null>(draft?.elements[0]?.id ?? null);
  const [dirty, setDirty] = useState(false);
  const [sizeOpen, setSizeOpen] = useState(false);
  const [layersOpen, setLayersOpen] = useState(false);
  const [kbOpen, setKbOpen] = useState(false);

  // Shrink the label preview while editing so the canvas gets shorter and the inspector's
  // top edge rises to make room for the keyboard.
  useEffect(() => {
    const show = Keyboard.addListener('keyboardWillShow', () => setKbOpen(true));
    const hide = Keyboard.addListener('keyboardWillHide', () => setKbOpen(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

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

  // Size the label to the screen width, capped in height so it stays compact. When the
  // keyboard is open the cap drops sharply, shrinking the canvas so the inspector rises.
  const heightFrac = kbOpen ? 0.13 : 0.28;
  const scale = Math.min((winW - CANVAS_MARGIN * 2) / design.widthMm, (winH * heightFrac) / design.heightMm);
  const cw = design.widthMm * scale;
  const ch = design.heightMm * scale;
  const sel = design.elements.find((e) => e.id === selId) ?? null;
  const selIndex = sel ? design.elements.findIndex((e) => e.id === sel.id) : -1;
  const canForward = selIndex >= 0 && selIndex < design.elements.length - 1;
  const canBackward = selIndex > 0;

  const patchEl = (id: string, patch: Partial<LabelElement>) => {
    setDesign((d) => (d ? { ...d, elements: d.elements.map((e) => (e.id === id ? ({ ...e, ...patch } as LabelElement) : e)) } : d));
    setDirty(true);
  };
  const updateSel = (patch: Partial<LabelElement>) => sel && patchEl(sel.id, patch);

  // z-order: array order is back→front, so +1 brings forward, -1 sends backward.
  const moveZ = (id: string, dir: 1 | -1) => {
    setDesign((d) => {
      if (!d) return d;
      const i = d.elements.findIndex((e) => e.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= d.elements.length) return d;
      const els = [...d.elements];
      [els[i], els[j]] = [els[j], els[i]];
      return { ...d, elements: els };
    });
    setDirty(true);
  };

  const duplicateEl = (id: string) => {
    const src = design.elements.find((e) => e.id === id);
    if (!src) return;
    const copy = {
      ...src,
      id: uid(),
      xMm: clamp(src.xMm + 2, 0, design.widthMm - src.wMm),
      yMm: clamp(src.yMm + 2, 0, design.heightMm - src.hMm),
      field: undefined, // a copy shouldn't share a fill-field name
    } as LabelElement;
    setDesign((d) => {
      if (!d) return d;
      const i = d.elements.findIndex((e) => e.id === id);
      const els = [...d.elements];
      els.splice(i + 1, 0, copy);
      return { ...d, elements: els };
    });
    setSelId(copy.id);
    setDirty(true);
  };

  const rotateEl = (id: string) => {
    const el = design.elements.find((e) => e.id === id);
    if (el) patchEl(id, { rotation: ((el.rotation || 0) + 90) % 360 });
  };

  const deleteEl = (id: string) => {
    setDesign((d) => (d ? { ...d, elements: d.elements.filter((e) => e.id !== id) } : d));
    if (selId === id) setSelId(null);
    setDirty(true);
  };

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
          gap: 6,
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
        <View style={{ flexDirection: 'row', gap: 2, alignItems: 'center' }}>
          <IconButton icon="layers" onPress={() => setLayersOpen(true)} disabled={design.elements.length === 0} accessibilityLabel="Layers" />
          <IconButton icon="eye" onPress={onPreview} accessibilityLabel="Preview" />
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

      {/* canvas — sized to the label (+ slight padding) so the inspector sits right below it */}
      <View style={{ height: ch + CANVAS_MARGIN * 2 }}>
        <Pressable onPress={() => setSelId(null)} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
        <View pointerEvents="box-none" style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <View
            pointerEvents="box-none"
            style={{ width: cw + CANVAS_MARGIN * 2, height: ch + CANVAS_MARGIN * 2, alignItems: 'center', justifyContent: 'center' }}
          >
            {/* label paper */}
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
                  onSelect={() => setSelId(el.id)}
                  onMove={(xMm, yMm) =>
                    patchEl(el.id, {
                      xMm: clamp(xMm, 0, design.widthMm - el.wMm),
                      yMm: clamp(yMm, 0, design.heightMm - el.hMm),
                    })
                  }
                />
              ))}
            </View>

            {/* selection chrome on the top layer — never clipped/covered by other elements */}
            {sel && (
              <SelectionOverlay
                key={sel.id}
                el={sel}
                scale={scale}
                margin={CANVAS_MARGIN}
                onResize={(wMm, hMm) =>
                  patchEl(sel.id, { wMm: clamp(wMm, 2, design.widthMm - sel.xMm), hMm: clamp(hMm, 2, design.heightMm - sel.yMm) })
                }
              />
            )}
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
      <Inspector
        el={sel}
        update={updateSel}
        onDelete={() => sel && deleteEl(sel.id)}
        onDuplicate={() => sel && duplicateEl(sel.id)}
        onRotate={() => sel && rotateEl(sel.id)}
        onForward={() => sel && moveZ(sel.id, 1)}
        onBackward={() => sel && moveZ(sel.id, -1)}
        canForward={canForward}
        canBackward={canBackward}
        isTemplate={!!design.isTemplate}
        maxOrder={design.elements.length}
      />

      <SizeSheet
        visible={sizeOpen}
        onClose={() => setSizeOpen(false)}
        onConfirm={(size) => {
          setSizeOpen(false);
          // Rescale elements to the new size so the design adapts instead of spilling off.
          setDesign((d) => (d ? resizeDesign(d, size.widthMm, size.heightMm, size.shape) : d));
          setDirty(true);
        }}
      />

      <LayersSheet
        visible={layersOpen}
        onClose={() => setLayersOpen(false)}
        design={design}
        selId={selId}
        onSelect={setSelId}
        onReorder={moveZ}
        onDelete={deleteEl}
      />
    </View>
  );
}

function EditableElement({
  el,
  scale,
  onSelect,
  onMove,
}: {
  el: LabelElement;
  scale: number;
  onSelect: () => void;
  onMove: (xMm: number, yMm: number) => void;
}) {
  const t = useTheme();
  const elRef = useRef(el);
  elRef.current = el;
  const scaleRef = useRef(scale);
  scaleRef.current = scale;
  const onMoveRef = useRef(onMove);
  onMoveRef.current = onMove;
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  const startRef = useRef({ x: 0, y: 0 });

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_e, g) => Math.abs(g.dx) > 2 || Math.abs(g.dy) > 2,
      onPanResponderGrant: () => {
        startRef.current = { x: elRef.current.xMm, y: elRef.current.yMm };
        onSelectRef.current();
      },
      onPanResponderMove: (_e, g) => {
        const s = scaleRef.current;
        onMoveRef.current(startRef.current.x + g.dx / s, startRef.current.y + g.dy / s);
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
        borderWidth: isField ? 1.5 : 0,
        borderStyle: 'dashed',
        borderColor: t.colors.accent,
        backgroundColor: isField ? 'rgba(255,243,214,0.5)' : 'transparent',
      }}
    >
      <ElementContent el={el} scale={scale} />
    </View>
  );
}

// Selection border + resize handle, drawn above every element so it is never clipped or
// hidden behind overlapping items. Positioned in the padded canvas frame (margin) so the
// corner handle stays inside a touchable area even when the element hugs the label edge.
function SelectionOverlay({
  el,
  scale,
  margin,
  onResize,
}: {
  el: LabelElement;
  scale: number;
  margin: number;
  onResize: (wMm: number, hMm: number) => void;
}) {
  const t = useTheme();
  const PAD = 16;
  const elRef = useRef(el);
  elRef.current = el;
  const scaleRef = useRef(scale);
  scaleRef.current = scale;
  const onResizeRef = useRef(onResize);
  onResizeRef.current = onResize;
  const startRef = useRef({ w: 0, h: 0 });

  const resize = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        startRef.current = { w: elRef.current.wMm, h: elRef.current.hMm };
      },
      onPanResponderMove: (_e, g) => {
        const s = scaleRef.current;
        onResizeRef.current(startRef.current.w + g.dx / s, startRef.current.h + g.dy / s);
      },
    })
  ).current;

  const elW = el.wMm * scale;
  const elH = el.hMm * scale;
  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        left: margin + el.xMm * scale - PAD,
        top: margin + el.yMm * scale - PAD,
        width: elW + PAD * 2,
        height: elH + PAD * 2,
        transform: [{ rotate: `${el.rotation}deg` }],
      }}
    >
      {/* outline */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: PAD,
          top: PAD,
          width: elW,
          height: elH,
          borderWidth: 1.5,
          borderColor: t.colors.primary,
          borderRadius: 2,
        }}
      />
      {/* resize handle at the bottom-right corner */}
      <View
        {...resize.panHandlers}
        hitSlop={{ top: 14, left: 14, right: 14, bottom: 14 }}
        style={{
          position: 'absolute',
          left: PAD + elW - 14,
          top: PAD + elH - 14,
          width: 28,
          height: 28,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: t.colors.primary, borderWidth: 2, borderColor: '#fff' }} />
      </View>
    </View>
  );
}

function LayersSheet({
  visible,
  onClose,
  design,
  selId,
  onSelect,
  onReorder,
  onDelete,
}: {
  visible: boolean;
  onClose: () => void;
  design: LabelDesign;
  selId: string | null;
  onSelect: (id: string) => void;
  onReorder: (id: string, dir: 1 | -1) => void;
  onDelete: (id: string) => void;
}) {
  const t = useTheme();
  const n = design.elements.length;
  // Show front-most first (array is back→front).
  const items = design.elements.map((el, i) => ({ el, i })).reverse();
  return (
    <BottomSheet visible={visible} onClose={onClose} title="Layers">
      {n === 0 ? (
        <Txt variant="caption" color={t.colors.textMuted} style={{ paddingVertical: 12 }}>
          No elements yet.
        </Txt>
      ) : (
        <ScrollView style={{ maxHeight: 380 }} contentContainerStyle={{ gap: 8, paddingBottom: 4 }}>
          {items.map(({ el, i }) => {
            const icon = TOOLS.find((tool) => tool.id === el.type)?.icon ?? 'square';
            const selected = el.id === selId;
            return (
              <Pressable
                key={el.id}
                onPress={() => {
                  onSelect(el.id);
                  onClose();
                }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                  padding: 10,
                  borderRadius: t.radius.md,
                  borderWidth: 1,
                  borderColor: selected ? t.colors.primary : t.colors.border,
                  backgroundColor: selected ? t.colors.primarySoft : t.colors.surface,
                }}
              >
                <Icon name={icon} size={18} color={selected ? t.colors.primary : t.colors.text} />
                <Txt variant="bodyStrong" numberOfLines={1} style={{ flex: 1 }}>
                  {elementLabel(el)}
                  {el.field ? '  ·  field' : ''}
                </Txt>
                <IconButton icon="chevron-up" size="sm" disabled={i === n - 1} onPress={() => onReorder(el.id, 1)} accessibilityLabel="Bring forward" />
                <IconButton icon="chevron-down" size="sm" disabled={i === 0} onPress={() => onReorder(el.id, -1)} accessibilityLabel="Send backward" />
                <IconButton icon="trash" size="sm" onPress={() => onDelete(el.id)} accessibilityLabel="Delete" />
              </Pressable>
            );
          })}
        </ScrollView>
      )}
    </BottomSheet>
  );
}

function Inspector({
  el,
  update,
  onDelete,
  onDuplicate,
  onRotate,
  onForward,
  onBackward,
  canForward,
  canBackward,
  isTemplate,
  maxOrder,
}: {
  el: LabelElement | null;
  update: (patch: Partial<LabelElement>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onRotate: () => void;
  onForward: () => void;
  onBackward: () => void;
  canForward: boolean;
  canBackward: boolean;
  isTemplate: boolean;
  maxOrder: number;
}) {
  const t = useTheme();
  if (!el) {
    return (
      <View style={{ flex: 1, backgroundColor: t.colors.surface, borderTopWidth: 1, borderTopColor: t.colors.border, padding: 16 }}>
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
      style={{ flex: 1, backgroundColor: t.colors.surface, borderTopWidth: 1, borderTopColor: t.colors.border }}
      contentContainerStyle={{ padding: 16, paddingBottom: 28, gap: 14 }}
      automaticallyAdjustKeyboardInsets
      keyboardShouldPersistTaps="handled"
    >
      {/* action bar */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Badge>{el.type}</Badge>
        <View style={{ flexDirection: 'row', gap: 2 }}>
          <IconButton icon="copy" size="sm" onPress={onDuplicate} accessibilityLabel="Duplicate" />
          <IconButton icon="arrange-back" size="sm" onPress={onBackward} disabled={!canBackward} accessibilityLabel="Send backward" />
          <IconButton icon="arrange-front" size="sm" onPress={onForward} disabled={!canForward} accessibilityLabel="Bring forward" />
          <IconButton icon="rotate" size="sm" onPress={onRotate} accessibilityLabel="Rotate 90°" />
          <IconButton icon="trash" size="sm" onPress={onDelete} accessibilityLabel="Delete element" />
        </View>
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
              style={{ flex: 1 }}
            />
          </Row>
          <StyleControls el={el as TextElement} update={update} />
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
          <Row label="Custom days">
            <Stepper
              value={(el as DateElement).date.offsetDays}
              min={0}
              max={3650}
              step={1}
              onChange={(v) => update({ date: { ...(el as DateElement).date, offsetDays: v } } as Partial<LabelElement>)}
              format={(v) => `+${v}d`}
            />
          </Row>
          <Row label="Format">
            <SegmentedControl
              options={[{ value: 'MMM d', label: 'Jun 12' }, { value: 'yyyy-MM-dd', label: 'ISO' }, { value: 'dd/MM/yy', label: 'D/M/Y' }]}
              value={(el as DateElement).date.format}
              onChange={(v) => update({ date: { ...(el as DateElement).date, format: v } } as Partial<LabelElement>)}
              style={{ flex: 1 }}
            />
          </Row>
          <Row label="Align">
            <SegmentedControl
              options={[{ value: 'left', label: 'L' }, { value: 'center', label: 'C' }, { value: 'right', label: 'R' }]}
              value={(el as DateElement).align}
              onChange={(v) => update({ align: v } as Partial<LabelElement>)}
              style={{ flex: 1 }}
            />
          </Row>
          <StyleControls el={el as DateElement} update={update} />
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
              <View style={{ marginTop: 8, gap: 10 }}>
                <TextField label="Field name" value={el.field.name} onChangeText={(v) => update({ field: { ...el.field!, name: v } } as Partial<LabelElement>)} />
                {el.type === 'text' && (
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <View style={{ flex: 1 }}>
                      <TextField label="Prefix" value={el.field.prefix ?? ''} onChangeText={(v) => update({ field: { ...el.field!, prefix: v } } as Partial<LabelElement>)} placeholder="$" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <TextField label="Suffix" value={el.field.suffix ?? ''} onChangeText={(v) => update({ field: { ...el.field!, suffix: v } } as Partial<LabelElement>)} placeholder="lbs" />
                    </View>
                  </View>
                )}
              </View>
            )}
          </View>
          <Switch value={!!el.field} onValueChange={toggleField} />
        </View>
      )}
    </ScrollView>
  );
}

function StyleControls({ el, update }: { el: TextElement | DateElement; update: (patch: Partial<LabelElement>) => void }) {
  const t = useTheme();
  const active = el.fontFamily ?? 'sans';
  return (
    <>
      <Row label="Style">
        <IconButton icon="bold" variant={el.bold ? 'tonal' : 'plain'} onPress={() => update({ bold: !el.bold } as Partial<LabelElement>)} accessibilityLabel="Bold" />
        <IconButton icon="italic" variant={el.italic ? 'tonal' : 'plain'} onPress={() => update({ italic: !el.italic } as Partial<LabelElement>)} accessibilityLabel="Italic" />
        <IconButton icon="underline" variant={el.underline ? 'tonal' : 'plain'} onPress={() => update({ underline: !el.underline } as Partial<LabelElement>)} accessibilityLabel="Underline" />
      </Row>
      <View style={{ gap: 6 }}>
        <Txt variant="bodyStrong">Font</Txt>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingRight: 8 }}>
          {FONTS.map((f) => {
            const on = active === f.value;
            return (
              <Pressable
                key={f.value}
                onPress={() => update({ fontFamily: f.value === 'sans' ? undefined : f.value } as Partial<LabelElement>)}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: t.radius.pill,
                  backgroundColor: on ? t.colors.primary : t.colors.surfaceAlt,
                  borderWidth: 1,
                  borderColor: on ? t.colors.primary : t.colors.border,
                }}
              >
                <Txt variant="body" color={on ? t.colors.primaryText : t.colors.text} style={{ fontWeight: '600', fontFamily: f.value === 'sans' ? undefined : f.value }}>
                  {f.label}
                </Txt>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    </>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <Txt variant="bodyStrong" style={{ minWidth: 64 }}>
        {label}
      </Txt>
      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 }}>{children}</View>
    </View>
  );
}
