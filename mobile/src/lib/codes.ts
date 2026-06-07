// Real QR-code and 1D-barcode generation, rendered to crisp monochrome PNG data URIs.
//
// We compute the module matrix (QR via qrcode-generator) or bar pattern (1D via jsbarcode's
// pure-JS encoders) ourselves, then paint it pixel-exact into a Skia image. Returning an
// <Image> source means it rasterizes perfectly through the view-shot → 1-bit print pipeline
// (no SVG/anti-aliasing fuzz on the modules).

import { AlphaType, ColorType, Skia } from '@shopify/react-native-skia';
import barcodes from 'jsbarcode/bin/barcodes/index.js';
import qrcode from 'qrcode-generator';
import { BarcodeElement, QrElement } from '../types/models';

/** Paint a logical grid (cols×rows of cells) to a PNG, scaling each cell by sx/sy pixels. */
function gridToPngDataUri(cols: number, rows: number, isDark: (cx: number, cy: number) => boolean, sx: number, sy: number): string {
  const W = cols * sx;
  const H = rows * sy;
  const rgba = new Uint8Array(W * H * 4);
  for (let y = 0; y < H; y++) {
    const cy = (y / sy) | 0;
    for (let x = 0; x < W; x++) {
      const cx = (x / sx) | 0;
      const v = isDark(cx, cy) ? 0 : 255;
      const p = (y * W + x) * 4;
      rgba[p] = v;
      rgba[p + 1] = v;
      rgba[p + 2] = v;
      rgba[p + 3] = 255;
    }
  }
  const data = Skia.Data.fromBytes(rgba);
  const img = Skia.Image.MakeImage({ width: W, height: H, colorType: ColorType.RGBA_8888, alphaType: AlphaType.Opaque }, data, W * 4);
  if (!img) throw new Error('Could not build code image.');
  return `data:image/png;base64,${img.encodeToBase64()}`;
}

export function qrToPngDataUri(content: string, ecc: QrElement['ecc'] = 'M'): string | null {
  if (!content) return null;
  try {
    const qr = qrcode(0, ecc); // type 0 = auto-size
    qr.addData(content);
    qr.make();
    const n: number = qr.getModuleCount();
    const quiet = 4; // required quiet zone
    const total = n + quiet * 2;
    const px = 6;
    return gridToPngDataUri(
      total,
      total,
      (cx, cy) => {
        const mx = cx - quiet;
        const my = cy - quiet;
        if (mx < 0 || my < 0 || mx >= n || my >= n) return false;
        return qr.isDark(my, mx);
      },
      px,
      px
    );
  } catch {
    return null;
  }
}

const FORMAT: Record<BarcodeElement['symbology'], string> = {
  code128: 'CODE128',
  ean13: 'EAN13',
  code39: 'CODE39',
};

export function barcodeToPngDataUri(content: string, symbology: BarcodeElement['symbology']): string | null {
  if (!content) return null;
  const fmt = FORMAT[symbology] ?? 'CODE128';
  try {
    const Cls = barcodes[fmt];
    if (!Cls) return null;
    const enc = new Cls(String(content), { width: 1, height: 100, format: fmt, flat: true, displayValue: false, mod43: false });
    if (!enc.valid()) return null;
    const bin: string = enc.encode().data;
    const cols = bin.length;
    if (!cols) return null;
    const quiet = 10; // quiet zone modules each side
    const barHeight = 60;
    return gridToPngDataUri(
      cols + quiet * 2,
      1,
      (cx) => {
        const i = cx - quiet;
        if (i < 0 || i >= cols) return false;
        return bin[i] === '1';
      },
      2,
      barHeight
    );
  } catch {
    return null;
  }
}
