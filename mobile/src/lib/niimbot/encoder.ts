// Convert a 1-bit raster into Niimbot bitmap-row packets.
//
// Input: a Bitmap whose `pixels` is one byte per pixel, row-major, where 1 = black (ink)
// and 0 = white. Output: an ordered list of PrintBitmapRow (0x85) / PrintEmptyRow (0x84)
// packets. Identical consecutive rows are merged via the repeat field to cut BLE traffic.
//
// PrintBitmapRow data layout: [row(u16 BE)][blackCount0][blackCount1][blackCount2][repeat][packedRowBytes…]
// The three black-pixel counts are the popcount of each horizontal third of the row.

import { Cmd } from './commands';
import { NiimbotPacket } from './packet';

export interface Bitmap {
  width: number;
  height: number;
  pixels: Uint8Array; // length width*height, 1 = black
}

/** Pack one row of the bitmap into ceil(width/8) bytes, MSB = leftmost pixel. */
function packRow(bmp: Bitmap, y: number): Uint8Array {
  const bytesPerRow = Math.ceil(bmp.width / 8);
  const row = new Uint8Array(bytesPerRow);
  const base = y * bmp.width;
  for (let x = 0; x < bmp.width; x++) {
    if (bmp.pixels[base + x]) {
      row[x >> 3] |= 0x80 >> (x & 7);
    }
  }
  return row;
}

function thirdCounts(row: Uint8Array, width: number): [number, number, number] {
  // Count black pixels in each horizontal third of the row.
  const counts: [number, number, number] = [0, 0, 0];
  const t1 = Math.floor(width / 3);
  const t2 = Math.floor((2 * width) / 3);
  for (let byteIdx = 0; byteIdx < row.length; byteIdx++) {
    const b = row[byteIdx];
    if (!b) continue;
    for (let bit = 0; bit < 8; bit++) {
      if (b & (0x80 >> bit)) {
        const x = byteIdx * 8 + bit;
        if (x >= width) break;
        const part = x < t1 ? 0 : x < t2 ? 1 : 2;
        counts[part] = Math.min(255, counts[part] + 1);
      }
    }
  }
  return counts;
}

function isEmpty(row: Uint8Array): boolean {
  for (let i = 0; i < row.length; i++) if (row[i] !== 0) return false;
  return true;
}

function bitmapRowPacket(y: number, repeat: number, row: Uint8Array, width: number): NiimbotPacket {
  const counts = thirdCounts(row, width);
  const header = Uint8Array.from([(y >> 8) & 0xff, y & 0xff, counts[0], counts[1], counts[2], repeat & 0xff]);
  const data = new Uint8Array(header.length + row.length);
  data.set(header, 0);
  data.set(row, header.length);
  return new NiimbotPacket(Cmd.PrintBitmapRow, data);
}

function emptyRowPacket(y: number, repeat: number): NiimbotPacket {
  return new NiimbotPacket(Cmd.PrintEmptyRow, Uint8Array.from([(y >> 8) & 0xff, y & 0xff, repeat & 0xff]));
}

/** Rotate a bitmap by 0/90/180/270 degrees clockwise. */
export function rotateBitmap(bmp: Bitmap, deg: 0 | 90 | 180 | 270): Bitmap {
  if (deg === 0) return bmp;
  const { width: w, height: h, pixels } = bmp;
  if (deg === 180) {
    const out = new Uint8Array(w * h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) out[(h - 1 - y) * w + (w - 1 - x)] = pixels[y * w + x];
    return { width: w, height: h, pixels: out };
  }
  // 90 / 270 swap dimensions
  const nw = h;
  const nh = w;
  const out = new Uint8Array(nw * nh);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const v = pixels[y * w + x];
      if (!v) continue;
      if (deg === 90) out[x * nw + (h - 1 - y)] = v;
      else out[(w - 1 - x) * nw + y] = v; // 270
    }
  }
  return { width: nw, height: nh, pixels: out };
}

export function encodeRows(bmp: Bitmap): NiimbotPacket[] {
  // One packet per scan-line (repeat = 1). We deliberately do NOT merge identical
  // consecutive lines via the `repeat` field: the B1/B21/B3S firmware does not reliably
  // expand it, so merging makes a tall image collapse to a few lines and print blank.
  const packets: NiimbotPacket[] = [];
  for (let y = 0; y < bmp.height; y++) {
    const row = packRow(bmp, y);
    packets.push(isEmpty(row) ? emptyRowPacket(y, 1) : bitmapRowPacket(y, 1, row, bmp.width));
  }
  return packets;
}
