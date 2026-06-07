// "New label detected — what size is this?" (Feature A) and the manual size picker.

import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { SIZE_PRESETS } from '../../data/presets';
import { useTheme } from '../../theme/ThemeProvider';
import { LabelShape } from '../../types/models';
import { BottomSheet, Button, LabelThumbnail, ScrollView, SegmentedControl, Txt } from '../ui';

const SHAPES: { value: LabelShape; label: string }[] = [
  { value: 'rect', label: 'Rect' },
  { value: 'rounded', label: 'Rounded' },
  { value: 'round', label: 'Round' },
  { value: 'cable', label: 'Cable' },
];

export function SizeSheet({
  visible,
  onClose,
  barcode,
  onConfirm,
}: {
  visible: boolean;
  onClose: () => void;
  barcode?: string | null;
  onConfirm: (size: { widthMm: number; heightMm: number; shape: LabelShape }) => void;
}) {
  const t = useTheme();
  const [pickedId, setPickedId] = useState(SIZE_PRESETS[0].id);
  const [shape, setShape] = useState<LabelShape>('rect');
  const picked = SIZE_PRESETS.find((s) => s.id === pickedId)!;

  return (
    <BottomSheet visible={visible} onClose={onClose} title={barcode ? 'New label detected' : 'Set label size'}>
      <Txt variant="body" color={t.colors.textMuted}>
        {barcode ? "We haven't seen this label before. What size is it?" : 'Choose the size of the loaded label.'}
      </Txt>
      {barcode ? (
        <Txt variant="mono" color={t.colors.textFaint} style={{ marginTop: 4, marginBottom: 8 }}>
          {barcode}
        </Txt>
      ) : (
        <View style={{ height: 8 }} />
      )}

      <ScrollView style={{ maxHeight: 360 }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {SIZE_PRESETS.map((s) => {
            const on = s.id === pickedId;
            return (
              <Pressable
                key={s.id}
                onPress={() => {
                  setPickedId(s.id);
                  setShape(s.shape);
                }}
                style={{
                  width: '47%',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                  padding: 12,
                  borderRadius: t.radius.md,
                  borderWidth: 1.5,
                  borderColor: on ? t.colors.primary : t.colors.border,
                  backgroundColor: on ? t.colors.primarySoft : t.colors.surface,
                }}
              >
                <LabelThumbnail design={presetDesign(s)} size={s.shape === 'cable' ? 22 : 40} />
                <View>
                  <Txt variant="bodyStrong">{s.name}</Txt>
                  <Txt variant="mono" color={t.colors.textMuted}>
                    {s.shape}
                  </Txt>
                </View>
              </Pressable>
            );
          })}
        </View>

        <Txt variant="caption" color={t.colors.textMuted} style={{ fontWeight: '600', marginTop: 16, marginBottom: 8 }}>
          Shape
        </Txt>
        <SegmentedControl options={SHAPES} value={shape} onChange={setShape} />
      </ScrollView>

      <Button
        variant="primary"
        fullWidth
        icon="check"
        style={{ marginTop: 16 }}
        onPress={() => onConfirm({ widthMm: picked.widthMm, heightMm: picked.heightMm, shape })}
      >
        {barcode ? 'Remember & continue' : 'Use this size'}
      </Button>
    </BottomSheet>
  );
}

// A throwaway one-element design so the thumbnail shows the size's proportions.
function presetDesign(s: (typeof SIZE_PRESETS)[number]) {
  return {
    id: s.id,
    name: s.name,
    widthMm: s.widthMm,
    heightMm: s.heightMm,
    shape: s.shape,
    elements: [],
    isTemplate: false,
    createdAt: 0,
    updatedAt: 0,
  };
}
