// A built-in calibration/test pattern (border + crosshair) generated directly as a 1-bit
// bitmap, so "Test print" works without going through the raster pipeline.

import { Bitmap } from './niimbot/encoder';
import { PX_PER_MM } from './util';

export function makeTestBitmap(widthMm: number, heightMm: number): Bitmap {
  const width = Math.round(widthMm * PX_PER_MM);
  const height = Math.round(heightMm * PX_PER_MM);
  const pixels = new Uint8Array(width * height);
  const set = (x: number, y: number) => {
    if (x >= 0 && x < width && y >= 0 && y < height) pixels[y * width + x] = 1;
  };
  const border = 3;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const onBorder = x < border || x >= width - border || y < border || y >= height - border;
      if (onBorder) set(x, y);
    }
  }
  // crosshair
  const cy = Math.floor(height / 2);
  const cx = Math.floor(width / 2);
  for (let x = 0; x < width; x++) set(x, cy);
  for (let y = 0; y < height; y++) set(cx, y);
  // centre square
  const s = Math.floor(Math.min(width, height) * 0.18);
  for (let y = cy - s; y <= cy + s; y++) for (let x = cx - s; x <= cx + s; x++) set(x, y);
  return { width, height, pixels };
}
