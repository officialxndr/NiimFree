// Fill-the-blanks sheet (Feature B). Renders one input per editable field with a live
// mini-preview; date fields use smart offset chips (Feature C).

import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { defaultValues, FillValues, listFields } from '../../lib/labelValues';
import { computeDateText } from '../../lib/util';
import { useTheme } from '../../theme/ThemeProvider';
import { DateElement, LabelDesign } from '../../types/models';
import { BottomSheet, Button, Chip, LabelThumbnail, ScrollView, TextField, Txt } from '../ui';

const OFFSETS = [1, 3, 5, 7, 14, 30];

export function FillFieldsSheet({
  visible,
  template,
  onClose,
  onPreview,
}: {
  visible: boolean;
  template: LabelDesign | null;
  onClose: () => void;
  onPreview: (values: FillValues) => void;
}) {
  const t = useTheme();
  const fields = useMemo(() => (template ? listFields(template) : []), [template]);
  const [values, setValues] = useState<FillValues>({});

  // Reset values whenever a new template is opened.
  const key = template?.id ?? '';
  const [lastKey, setLastKey] = useState('');
  if (template && key !== lastKey) {
    setValues(defaultValues(template));
    setLastKey(key);
  }

  if (!template) return null;
  const setV = (name: string, v: string | number) => setValues((prev) => ({ ...prev, [name]: v }));

  return (
    <BottomSheet visible={visible} onClose={onClose} title={template.name}>
      <View style={{ alignItems: 'center', marginVertical: 12 }}>
        <LabelThumbnail design={template} values={values} size={template.shape === 'cable' ? 80 : 190} />
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
            />
          );
        })}
      </ScrollView>

      <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
        <Button variant="secondary" fullWidth onPress={onClose} style={{ flex: 1 }}>
          Cancel
        </Button>
        <Button variant="primary" fullWidth icon="eye" onPress={() => onPreview(values)} style={{ flex: 1 }}>
          Preview
        </Button>
      </View>
    </BottomSheet>
  );
}
