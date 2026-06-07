// Minimal base64 <-> Uint8Array helpers. react-native-ble-plx exchanges characteristic
// values as base64 strings, and React Native has no Buffer by default.

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const LOOKUP = (() => {
  const t = new Uint8Array(128);
  for (let i = 0; i < CHARS.length; i++) t[CHARS.charCodeAt(i)] = i;
  return t;
})();

export function bytesToBase64(bytes: Uint8Array): string {
  let out = '';
  let i = 0;
  for (; i + 2 < bytes.length; i += 3) {
    const n = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
    out += CHARS[(n >> 18) & 63] + CHARS[(n >> 12) & 63] + CHARS[(n >> 6) & 63] + CHARS[n & 63];
  }
  const rem = bytes.length - i;
  if (rem === 1) {
    const n = bytes[i] << 16;
    out += CHARS[(n >> 18) & 63] + CHARS[(n >> 12) & 63] + '==';
  } else if (rem === 2) {
    const n = (bytes[i] << 16) | (bytes[i + 1] << 8);
    out += CHARS[(n >> 18) & 63] + CHARS[(n >> 12) & 63] + CHARS[(n >> 6) & 63] + '=';
  }
  return out;
}

export function base64ToBytes(b64: string): Uint8Array {
  const clean = b64.replace(/[^A-Za-z0-9+/]/g, '');
  const len = clean.length;
  const pad = b64.endsWith('==') ? 2 : b64.endsWith('=') ? 1 : 0;
  const outLen = Math.floor((len * 3) / 4) - pad;
  const out = new Uint8Array(outLen);
  let p = 0;
  for (let i = 0; i < len; i += 4) {
    const n =
      (LOOKUP[clean.charCodeAt(i)] << 18) |
      (LOOKUP[clean.charCodeAt(i + 1)] << 12) |
      (LOOKUP[clean.charCodeAt(i + 2)] << 6) |
      LOOKUP[clean.charCodeAt(i + 3)];
    if (p < outLen) out[p++] = (n >> 16) & 0xff;
    if (p < outLen) out[p++] = (n >> 8) & 0xff;
    if (p < outLen) out[p++] = n & 0xff;
  }
  return out;
}
