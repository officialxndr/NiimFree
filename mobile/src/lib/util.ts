import * as Crypto from 'expo-crypto';
import { DateConfig } from '../types/models';

export const APP_NAME = 'NiimFree';
export const PX_PER_MM = 8; // Niimbot printers are 8 px/mm (~203 dpi)

export function uid(): string {
  return Crypto.randomUUID();
}

export function nowMs(): number {
  return Date.now();
}

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const pad = (n: number) => String(n).padStart(2, '0');

/** Minimal date formatter supporting the three formats offered in the UI. */
export function formatDate(d: Date, format: string): string {
  switch (format) {
    case 'yyyy-MM-dd':
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    case 'dd/MM/yy':
      return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${String(d.getFullYear()).slice(2)}`;
    case 'MMM d':
    default:
      return `${MONTHS_SHORT[d.getMonth()]} ${d.getDate()}`;
  }
}

/** Resolve a dynamic-date element to its printed string at the current moment. */
export function computeDateText(cfg: DateConfig, offsetOverride?: number): string {
  const base = cfg.base === 'today' ? new Date() : new Date(cfg.base);
  const offset = offsetOverride ?? cfg.offsetDays;
  const target = new Date(base);
  target.setDate(target.getDate() + offset);
  const prefix = cfg.prefix ?? '';
  if (cfg.showBoth) {
    return `${prefix}${formatDate(base, cfg.format)} → ${formatDate(target, cfg.format)}`;
  }
  return `${prefix}${formatDate(target, cfg.format)}`;
}

/** Friendly "2h ago" / "Yesterday" relative time for label cards. */
export function relativeTime(ms: number): string {
  const diff = Date.now() - ms;
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'Just now';
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day === 1) return 'Yesterday';
  if (day < 7) return `${day} days ago`;
  if (day < 14) return 'Last week';
  return new Date(ms).toLocaleDateString();
}

export function sizeLabel(widthMm: number, heightMm: number, shape?: string): string {
  if (shape === 'round') return `Ø ${widthMm} mm`;
  return `${widthMm}×${heightMm} mm`;
}
