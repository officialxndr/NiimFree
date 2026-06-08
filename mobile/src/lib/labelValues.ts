// Helpers for resolving template field values into concrete element text, and for listing
// a design's editable fields in author order (Feature B + C).

import { FieldBinding, LabelDesign, LabelElement } from '../types/models';
import { computeDateText } from './util';

export type FillValues = Record<string, string | number>;

export interface FieldDescriptor extends FieldBinding {
  elementId: string;
}

/** All editable fields in a design, sorted by their authored order. */
export function listFields(design: LabelDesign): FieldDescriptor[] {
  return design.elements
    .filter((e): e is LabelElement & { field: FieldBinding } => !!e.field)
    .map((e) => ({ ...e.field, elementId: e.id }))
    .sort((a, b) => a.order - b.order);
}

/** Default fill values for a template (from each field's default / current content). */
export function defaultValues(design: LabelDesign): FillValues {
  const out: FillValues = {};
  for (const e of design.elements) {
    if (!e.field) continue;
    if (e.type === 'date') {
      out[e.field.name] = e.date.offsetDays;
    } else if (e.type === 'text') {
      out[e.field.name] = e.field.defaultValue ?? e.text;
    } else {
      out[e.field.name] = e.field.defaultValue ?? '';
    }
  }
  return out;
}

/** The string an element renders to right now, applying any filled value override. */
export function resolveText(el: LabelElement, values?: FillValues): string {
  switch (el.type) {
    case 'text': {
      const raw = el.field && values && values[el.field.name] != null ? String(values[el.field.name]) : el.text;
      // Field affixes (e.g. "$" / " lbs") wrap the value but live outside it.
      return `${el.field?.prefix ?? ''}${raw}${el.field?.suffix ?? ''}`;
    }
    case 'date': {
      const override = el.field && values && values[el.field.name] != null ? Number(values[el.field.name]) : undefined;
      return computeDateText(el.date, override);
    }
    case 'qr':
    case 'barcode': {
      if (el.field && values && values[el.field.name] != null) return String(values[el.field.name]);
      return el.content;
    }
    default:
      return '';
  }
}
