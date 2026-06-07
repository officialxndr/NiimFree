// Label → 1-bit raster pipeline.
//
// We render the design off-screen at exactly 8 px/mm with the shared <LabelSurface>, capture
// it to a PNG with react-native-view-shot, decode the PNG with Skia and threshold (or
// Floyd–Steinberg dither) each pixel to ink/no-ink. This guarantees the printed output
// matches what the user sees, without re-implementing text/layout in Skia directly.

import { AlphaType, ColorType, Skia } from '@shopify/react-native-skia';
import React from 'react';
import { View } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import { LabelSurface } from '../components/LabelView';
import { Bitmap } from './niimbot/encoder';
import { FillValues } from './labelValues';
import { PX_PER_MM } from './util';
import { LabelDesign } from '../types/models';

export type DitherMode = 'threshold' | 'floydSteinberg';

/** Off-screen surface to be captured. Mount it (hidden) and pass `innerRef` to capture. */
export function RasterLabel({
  design,
  values,
  innerRef,
}: {
  design: LabelDesign;
  values?: FillValues;
  innerRef: React.RefObject<View>;
}) {
  return (
    <View style={{ position: 'absolute', left: -100000, top: 0 }} pointerEvents="none">
      <View ref={innerRef} collapsable={false}>
        <LabelSurface design={design} pxPerMm={PX_PER_MM} values={values} />
      </View>
    </View>
  );
}

function toGray(rgba: Uint8Array, width: number, height: number): Float32Array {
  const gray = new Float32Array(width * height);
  for (let i = 0, p = 0; i < gray.length; i++, p += 4) {
    const a = rgba[p + 3] / 255;
    // Composite over white paper, then luminance.
    const r = rgba[p] * a + 255 * (1 - a);
    const g = rgba[p + 1] * a + 255 * (1 - a);
    const b = rgba[p + 2] * a + 255 * (1 - a);
    gray[i] = 0.299 * r + 0.587 * g + 0.114 * b;
  }
  return gray;
}

function grayToBitmap(gray: Float32Array, width: number, height: number, mode: DitherMode): Bitmap {
  const pixels = new Uint8Array(width * height);
  if (mode === 'floydSteinberg') {
    const buf = Float32Array.from(gray);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        const old = buf[idx];
        const black = old < 128;
        pixels[idx] = black ? 1 : 0;
        const err = old - (black ? 0 : 255);
        if (x + 1 < width) buf[idx + 1] += (err * 7) / 16;
        if (y + 1 < height) {
          if (x > 0) buf[idx + width - 1] += (err * 3) / 16;
          buf[idx + width] += (err * 5) / 16;
          if (x + 1 < width) buf[idx + width + 1] += (err * 1) / 16;
        }
      }
    }
  } else {
    for (let i = 0; i < gray.length; i++) pixels[i] = gray[i] < 128 ? 1 : 0;
  }
  return { width, height, pixels };
}

/** Capture the off-screen RasterLabel ref and return its 1-bit bitmap. */
export async function captureBitmap(
  ref: React.RefObject<View>,
  design: LabelDesign,
  mode: DitherMode = 'threshold'
): Promise<Bitmap> {
  const widthPx = Math.round(design.widthMm * PX_PER_MM);
  const heightPx = Math.round(design.heightMm * PX_PER_MM);

  const base64 = await captureRef(ref, {
    result: 'base64',
    format: 'png',
    quality: 1,
    width: widthPx,
    height: heightPx,
  });

  const data = Skia.Data.fromBase64(base64);
  const image = Skia.Image.MakeImageFromEncoded(data);
  if (!image) throw new Error('Could not decode captured label image.');

  const rgba = image.readPixels(0, 0, {
    width: widthPx,
    height: heightPx,
    colorType: ColorType.RGBA_8888,
    alphaType: AlphaType.Unpremul,
  }) as Uint8Array | null;
  if (!rgba) throw new Error('Could not read label pixels.');

  const gray = toGray(rgba, widthPx, heightPx);
  return grayToBitmap(gray, widthPx, heightPx, mode);
}

/** A monochrome PNG (data URI) of the 1-bit bitmap — exactly what will print. */
export function bitmapToPngDataUri(bmp: Bitmap): string {
  const rgba = new Uint8Array(bmp.width * bmp.height * 4);
  for (let i = 0; i < bmp.pixels.length; i++) {
    const v = bmp.pixels[i] ? 0 : 255; // ink black, paper white
    const p = i * 4;
    rgba[p] = v;
    rgba[p + 1] = v;
    rgba[p + 2] = v;
    rgba[p + 3] = 255;
  }
  const data = Skia.Data.fromBytes(rgba);
  const image = Skia.Image.MakeImage(
    { width: bmp.width, height: bmp.height, colorType: ColorType.RGBA_8888, alphaType: AlphaType.Opaque },
    data,
    bmp.width * 4
  );
  if (!image) throw new Error('Could not build preview image.');
  return `data:image/png;base64,${image.encodeToBase64()}`;
}
