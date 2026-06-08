// Shared, read-only renderer for a label design. Used by thumbnails, the print preview and
// the off-screen rasterizer. The editor reuses `ElementContent` for the inner content of
// each (interactive) element. Ink renders as near-black on a white "paper" surface so the
// same component drives both on-screen display and the 1-bit raster capture.

import React, { useMemo } from 'react';
import { Image, StyleProp, Text, View, ViewStyle } from 'react-native';
import { barcodeToPngDataUri, qrToPngDataUri } from '../lib/codes';
import { PX_PER_MM } from '../lib/util';
import { FillValues, resolveText } from '../lib/labelValues';
import { BarcodeElement, LabelDesign, LabelElement, LabelShape, QrElement } from '../types/models';
import { Icon } from './Icon';

export const INK = '#111111';

export function shapeRadius(shape: LabelShape, w: number, h: number): number {
  if (shape === 'round') return Math.min(w, h) / 2;
  if (shape === 'rounded') return Math.min(w, h) * 0.12;
  return 2;
}

/** Inner content of a single element (no positioning). Shared with the editor. */
export function ElementContent({ el, scale, values }: { el: LabelElement; scale: number; values?: FillValues }) {
  switch (el.type) {
    case 'text':
    case 'date': {
      const fontSize = el.fontSize * (scale / PX_PER_MM);
      return (
        <Text
          numberOfLines={2}
          adjustsFontSizeToFit
          style={{
            width: '100%',
            color: INK,
            fontSize,
            fontFamily: el.fontFamily,
            fontWeight: el.bold ? '800' : '600',
            fontStyle: el.italic ? 'italic' : 'normal',
            textDecorationLine: el.underline ? 'underline' : 'none',
            textAlign: el.align,
          }}
        >
          {resolveText(el, values)}
        </Text>
      );
    }
    case 'shape': {
      const w = el.wMm * scale;
      const h = el.hMm * scale;
      const isLine = el.shape === 'line';
      const radius =
        el.shape === 'circle' ? Math.min(w, h) / 2 : el.shape === 'roundedRect' ? (el.cornerRadius ?? 2) * scale : 0;
      return (
        <View
          style={{
            width: '100%',
            height: isLine ? Math.max(1, el.strokeWidth * scale) : '100%',
            backgroundColor: el.fill === 'black' ? INK : el.fill === 'white' ? '#fff' : 'transparent',
            borderColor: INK,
            borderWidth: el.fill === 'none' ? Math.max(1, el.strokeWidth * scale) : 0,
            borderRadius: radius,
          }}
        />
      );
    }
    case 'image':
      return <Image source={{ uri: el.uri }} resizeMode="contain" style={{ width: '100%', height: '100%' }} />;
    case 'icon':
      return <Icon name={el.name} size={Math.min(el.wMm, el.hMm) * scale * 0.8} color={INK} />;
    case 'qr':
      return <QrContent content={resolveText(el, values)} ecc={(el as QrElement).ecc} fallbackSize={Math.min(el.wMm, el.hMm) * scale} />;
    case 'barcode':
      return <BarcodeContent content={resolveText(el, values)} symbology={(el as BarcodeElement).symbology} fallbackSize={Math.min(el.wMm, el.hMm) * scale} />;
    default:
      return null;
  }
}

function CodePlaceholder({ kind, size }: { kind: 'qr' | 'barcode'; size: number }) {
  return (
    <View style={{ width: '100%', height: '100%', borderWidth: 1, borderColor: INK, alignItems: 'center', justifyContent: 'center', padding: 2 }}>
      <Icon name={kind === 'qr' ? 'qr-code' : 'barcode'} size={size * 0.5} color={INK} />
    </View>
  );
}

function QrContent({ content, ecc, fallbackSize }: { content: string; ecc: QrElement['ecc']; fallbackSize: number }) {
  const uri = useMemo(() => qrToPngDataUri(content, ecc), [content, ecc]);
  if (!uri) return <CodePlaceholder kind="qr" size={fallbackSize} />;
  return <Image source={{ uri }} resizeMode="contain" style={{ width: '100%', height: '100%' }} />;
}

function BarcodeContent({ content, symbology, fallbackSize }: { content: string; symbology: BarcodeElement['symbology']; fallbackSize: number }) {
  const uri = useMemo(() => barcodeToPngDataUri(content, symbology), [content, symbology]);
  if (!uri) return <CodePlaceholder kind="barcode" size={fallbackSize} />;
  return <Image source={{ uri }} resizeMode="stretch" style={{ width: '100%', height: '100%' }} />;
}

function PositionedElement({
  el,
  scale,
  values,
  highlightFields,
}: {
  el: LabelElement;
  scale: number;
  values?: FillValues;
  highlightFields?: boolean;
}) {
  const showHi = highlightFields && !!el.field;
  return (
    <View
      style={{
        position: 'absolute',
        left: el.xMm * scale,
        top: el.yMm * scale,
        width: el.wMm * scale,
        height: el.hMm * scale,
        transform: [{ rotate: `${el.rotation}deg` }],
        alignItems: el.type === 'text' || el.type === 'date' ? 'stretch' : 'center',
        justifyContent: 'center',
        backgroundColor: showHi ? 'rgba(255,243,214,0.7)' : 'transparent',
        borderWidth: showHi ? 1 : 0,
        borderColor: '#7C4DFF',
        borderStyle: 'dashed',
        borderRadius: showHi ? 3 : 0,
      }}
    >
      <ElementContent el={el} scale={scale} values={values} />
    </View>
  );
}

export interface LabelSurfaceProps {
  design: LabelDesign;
  pxPerMm: number;
  values?: FillValues;
  highlightFields?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** A white "paper" surface with the design's elements laid out at the given scale. */
export function LabelSurface({ design, pxPerMm, values, highlightFields, style }: LabelSurfaceProps) {
  const w = design.widthMm * pxPerMm;
  const h = design.heightMm * pxPerMm;
  return (
    <View
      style={[
        {
          width: w,
          height: h,
          backgroundColor: '#fff',
          borderRadius: shapeRadius(design.shape, w, h),
          overflow: 'hidden',
        },
        style,
      ]}
    >
      {design.elements.map((el) => (
        <PositionedElement key={el.id} el={el} scale={pxPerMm} values={values} highlightFields={highlightFields} />
      ))}
    </View>
  );
}
