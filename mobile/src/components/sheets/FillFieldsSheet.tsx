// Fill-the-blanks sheet (Feature B). Renders one input per editable field with a live
// mini-preview; date fields use smart offset chips (Feature C).

import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { resizeDesign } from '../../lib/factory';
import { defaultValues, FillValues, listFields } from '../../lib/labelValues';
import { computeDateText } from '../../lib/util';
import { usePrinter } from '../../store/printer';
import { useTheme } from '../../theme/ThemeProvider';
import { DateElement, LabelDesign } from '../../types/models';
import { BottomSheet, Button, Chip, LabelThumbnail, ScrollView, TextField, Txt } from '../ui';

const OFFSETS = [1, 3, 5, 7, 14, 30];

// Common roll sizes a template can be retargeted to when filling it.
const SIZES = [
  { label: '40×30', widthMm: 40, heightMm: 30 },
  { label: '50×30', widthMm: 50, heightMm: 30 },
  { label: '30×15', widthMm: 30, heightMm: 15 },
];

export function FillFieldsSheet({
  visible,
  template,
  onClose,
  onPreview,
}: {
  visible: boolean;
  template: LabelDesign | null;
  onClose: () => void;
  onPreview: (values: FillValues, design: LabelDesign) => void;
}) {
  const t = useTheme();
  const detected = usePrinter((s) => s.detected);
  const fields = useMemo(() => (template ? listFields(template) : []), [template]);
  const [values, setValues] = useState<FillValues>({});
  const [size, setSize] = useState<{ widthMm: number; heightMm: number }>({ widthMm: 40, heightMm: 30 });

  // Reset values + size whenever a new template is opened. Default to the size of the label
  // currently loaded in the printer (from RFID), falling back to the template's own size.
  const key = template?.id ?? '';
  const [lastKey, setLastKey] = useState('');
  if (template && key !== lastKey) {
    setValues(defaultValues(template));
    setSize(
      detected
        ? { widthMm: detected.widthMm, heightMm: detected.heightMm }
        : { widthMm: template.widthMm, heightMm: template.heightMm }
    );
    setLastKey(key);
  }

  // The template rescaled to the chosen size — used for the preview and the printed label.
  const sized = useMemo(
    () => (template ? resizeDesign(template, size.widthMm, size.heightMm) : null),
    [template, size.widthMm, size.heightMm]
  );

  if (!template || !sized) return null;
  const setV = (name: string, v: string | number) => setValues((prev) => ({ ...prev, [name]: v }));

  return (
    <BottomSheet visible={visible} onClose={onClose} title={template.name}>
      <View style={{ alignItems: 'center', marginTop: 2, marginBottom: 6 }}>
        <LabelThumbnail design={sized} values={values} size={sized.shape === 'cable' ? 90 : 240} />
      </View>

      <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'center', marginBottom: 10 }}>
        {SIZES.map((s) => (
          <Chip
            key={s.label}
            selected={size.widthMm === s.widthMm && size.heightMm === s.heightMm}
            onPress={() => setSize({ widthMm: s.widthMm, heightMm: s.heightMm })}
          >
            {s.label} mm
          </Chip>
        ))}
      </View>

      <ScrollView style={{ maxHeight: 280 }} contentContainerStyle={{ gap: 14 }}>
        {fields.map((f) => {
          if (f.type === 'date') {
            const el = template.elements.find((e) => e.id === f.elementId) as DateElement | undefined;
            const offset = Number(values[f.name] ?? el?.date.offsetDays ?? 5);
            const display = el ? computeDateText(el.date, offset) : `+${offset}d`;
            return (
              <View key={f.name} style={{ gap: 8 }}>
                <Txt variant="caption" color={t.colors.textMuted} style={{ fontWeight: '600' }}>
                  {f.name} · {display}
                </Txt>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {OFFSETS.map((n) => (
                    <Chip key={n} selected={offset === n} onPress={() => setV(f.name, n)}>
                      +{n}d
                    </Chip>
                  ))}
                </View>
              </View>
            );
          }
          return (
            <TextField
              key={f.name}
              label={f.name}
              value={String(values[f.name] ?? '')}
              onChangeText={(v) => setV(f.name, v)}
              keyboardType={f.type === 'number' ? 'numeric' : 'default'}
              placeholder={f.placeholder}
              hint={f.prefix || f.suffix ? `Prints as ${f.prefix ?? ''}value${f.suffix ?? ''}` : undefined}
            />
          );
        })}
      </ScrollView>

      <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
        <Button variant="secondary" fullWidth onPress={onClose} style={{ flex: 1 }}>
          Cancel
        </Button>
        <Button variant="primary" fullWidth icon="eye" onPress={() => onPreview(values, sized)} style={{ flex: 1 }}>
          Preview
        </Button>
      </View>
    </BottomSheet>
  );
}
