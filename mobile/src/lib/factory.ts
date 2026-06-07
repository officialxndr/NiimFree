// Factories for new designs and for turning a template + filled values into a concrete label.

import { FillValues, resolveText } from './labelValues';
import { nowMs, uid } from './util';
import { LabelDesign, LabelElement, LabelShape } from '../types/models';

export interface NewDesignOpts {
  widthMm: number;
  heightMm: number;
  shape: LabelShape;
  withText?: boolean;
}

export function newDesign({ widthMm, heightMm, shape, withText }: NewDesignOpts): LabelDesign {
  const elements: LabelElement[] = withText
    ? [
        {
          id: uid(),
          type: 'text',
          xMm: widthMm * 0.1,
          yMm: heightMm * 0.4,
          wMm: widthMm * 0.8,
          hMm: heightMm * 0.25,
          rotation: 0,
          text: 'Text',
          fontSize: Math.round(heightMm * 1.6),
          align: 'center',
        },
      ]
    : [];
  const now = nowMs();
  return {
    id: uid(),
    name: 'Untitled label',
    widthMm,
    heightMm,
    shape,
    elements,
    isTemplate: false,
    createdAt: now,
    updatedAt: now,
  };
}

/** Produce a brand-new concrete label from a template, baking in the filled values.
 *  The template is never mutated (spec §7.2). */
export function labelFromTemplate(template: LabelDesign, values: FillValues): LabelDesign {
  const now = nowMs();
  const elements: LabelElement[] = template.elements.map((el) => {
    const copy = { ...el, id: uid(), field: undefined };
    if (el.type === 'text') {
      return { ...copy, type: 'text', text: resolveText(el, values) } as LabelElement;
    }
    if (el.type === 'date') {
      const override = el.field && values[el.field.name] != null ? Number(values[el.field.name]) : el.date.offsetDays;
      return { ...copy, type: 'date', date: { ...el.date, offsetDays: override } } as LabelElement;
    }
    if (el.type === 'qr' || el.type === 'barcode') {
      return { ...copy, content: resolveText(el, values) } as LabelElement;
    }
    return copy as LabelElement;
  });
  return {
    id: uid(),
    name: template.name,
    widthMm: template.widthMm,
    heightMm: template.heightMm,
    shape: template.shape,
    elements,
    isTemplate: false,
    sourceTemplateId: template.id,
    createdAt: now,
    updatedAt: now,
  };
}

export function duplicateAsTemplate(design: LabelDesign): LabelDesign {
  const now = nowMs();
  return { ...design, id: uid(), isTemplate: true, name: `${design.name}`, createdAt: now, updatedAt: now };
}
