// Generates the app icon / adaptive icon / splash PNGs for NiimFree.
// Pure Node (zlib + a tiny PNG encoder), supersampled for anti-aliasing. No deps.
//   node scripts/gen-assets.js

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const SIZE = 1024;
const SS = 3; // supersample factor
const HR = SIZE * SS;

const BLUE = [43, 107, 243];
const WHITE = [255, 255, 255];

// ---- PNG encoder ----
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const t = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([t, data])), 0);
  return Buffer.concat([len, t, data, crc]);
}
function encodePng(w, h, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  const stride = w * 4;
  const raw = Buffer.alloc((stride + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (stride + 1)] = 0; // filter: none
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride);
  }
  const idat = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))]);
}

// ---- drawing (on the HR buffer; transparent base RGB=white to avoid dark fringe) ----
function newCanvas() {
  const buf = Buffer.alloc(HR * HR * 4);
  for (let i = 0; i < HR * HR; i++) {
    buf[i * 4] = 255;
    buf[i * 4 + 1] = 255;
    buf[i * 4 + 2] = 255;
    buf[i * 4 + 3] = 0;
  }
  return buf;
}
function set(buf, x, y, c) {
  if (x < 0 || y < 0 || x >= HR || y >= HR) return;
  const p = (y * HR + x) * 4;
  buf[p] = c[0];
  buf[p + 1] = c[1];
  buf[p + 2] = c[2];
  buf[p + 3] = 255;
}
function fillRectF(buf, x0, y0, w, h, c) {
  for (let y = Math.round(y0); y < Math.round(y0 + h); y++) for (let x = Math.round(x0); x < Math.round(x0 + w); x++) set(buf, x, y, c);
}
function fillRoundRect(buf, x, y, w, h, r, c) {
  const x1 = x + w;
  const y1 = y + h;
  for (let py = Math.round(y); py < Math.round(y1); py++) {
    for (let px = Math.round(x); px < Math.round(x1); px++) {
      let cx = px;
      let cy = py;
      let corner = null;
      if (px < x + r && py < y + r) corner = [x + r, y + r];
      else if (px > x1 - r && py < y + r) corner = [x1 - r, y + r];
      else if (px < x + r && py > y1 - r) corner = [x + r, y1 - r];
      else if (px > x1 - r && py > y1 - r) corner = [x1 - r, y1 - r];
      if (corner) {
        const dx = cx - corner[0];
        const dy = cy - corner[1];
        if (dx * dx + dy * dy > r * r) continue;
      }
      set(buf, px, py, c);
    }
  }
}
function fillCircle(buf, cx, cy, r, c) {
  for (let py = Math.round(cy - r); py <= Math.round(cy + r); py++) {
    for (let px = Math.round(cx - r); px <= Math.round(cx + r); px++) {
      const dx = px - cx;
      const dy = py - cy;
      if (dx * dx + dy * dy <= r * r) set(buf, px, py, c);
    }
  }
}

// The NiimFree mark: a white "label" card with a punch hole + three text lines.
function drawLabel(buf, rx, ry, rsize) {
  const lw = rsize * 0.66;
  const lh = rsize * 0.52;
  const lx = rx + (rsize - lw) / 2;
  const ly = ry + (rsize - lh) / 2;
  fillRoundRect(buf, lx, ly, lw, lh, rsize * 0.06, WHITE);
  // punch hole (top-left of the label)
  fillCircle(buf, lx + lh * 0.3, ly + lh * 0.3, lh * 0.11, BLUE);
  // text lines
  fillRoundRect(buf, lx + lh * 0.52, ly + lh * 0.2, lw * 0.4, lh * 0.13, lh * 0.06, BLUE);
  fillRoundRect(buf, lx + lw * 0.12, ly + lh * 0.46, lw * 0.76, lh * 0.12, lh * 0.06, BLUE);
  fillRoundRect(buf, lx + lw * 0.12, ly + lh * 0.66, lw * 0.55, lh * 0.12, lh * 0.06, BLUE);
}

function downsample(hr) {
  const out = Buffer.alloc(SIZE * SIZE * 4);
  const n = SS * SS;
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;
      for (let dy = 0; dy < SS; dy++) {
        for (let dx = 0; dx < SS; dx++) {
          const p = ((y * SS + dy) * HR + (x * SS + dx)) * 4;
          r += hr[p];
          g += hr[p + 1];
          b += hr[p + 2];
          a += hr[p + 3];
        }
      }
      const o = (y * SIZE + x) * 4;
      out[o] = (r / n) | 0;
      out[o + 1] = (g / n) | 0;
      out[o + 2] = (b / n) | 0;
      out[o + 3] = (a / n) | 0;
    }
  }
  return out;
}

function write(name, hr) {
  const png = encodePng(SIZE, SIZE, downsample(hr));
  const out = path.join(__dirname, '..', 'assets', name);
  fs.writeFileSync(out, png);
  console.log('wrote', out, `${(png.length / 1024).toFixed(1)} kB`);
}

fs.mkdirSync(path.join(__dirname, '..', 'assets'), { recursive: true });

// icon: full-bleed blue + mark
{
  const buf = newCanvas();
  fillRectF(buf, 0, 0, HR, HR, BLUE);
  drawLabel(buf, 0, 0, HR);
  write('icon.png', buf);
}
// adaptive foreground: mark on transparent, in the Android safe zone
{
  const buf = newCanvas();
  const r = HR * 0.66;
  drawLabel(buf, (HR - r) / 2, (HR - r) / 2, r);
  write('adaptive-icon.png', buf);
}
// splash: blue rounded-square logo on transparent
{
  const buf = newCanvas();
  const r = HR * 0.58;
  const o = (HR - r) / 2;
  fillRoundRect(buf, o, o, r, r, r * 0.22, BLUE);
  drawLabel(buf, o, o, r);
  write('splash-icon.png', buf);
}
console.log('done');
