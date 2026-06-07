// Core data model for NiimFree (spec §8). All ids are uuid strings; timestamps are epoch ms.
// Geometry is stored in millimetres (the user's mental model); the rasterizer converts to
// pixels at 8 px/mm for the printer.

export type LabelShape = 'rect' | 'rounded' | 'round' | 'cable';
export type FieldType = 'text' | 'number' | 'date';
export type ElementType = 'text' | 'shape' | 'qr' | 'barcode' | 'image' | 'date' | 'icon';

export interface LabelSizePreset {
  id: string;
  name: string; // "40 × 30 mm"
  widthMm: number;
  heightMm: number;
  shape: LabelShape;
}

export interface RememberedLabel {
  id: string;
  barcode: string; // RFID "one-code"
  widthMm: number;
  heightMm: number;
  shape: LabelShape;
  name?: string;
  lastUsedAt: number;
  createdAt: number;
}

// Feature B — an element can be bound to a fill-in field.
export interface FieldBinding {
  name: string;
  type: FieldType;
  order: number;
  defaultValue?: string;
  placeholder?: string;
}

// Feature C — dynamic date computed at fill/print time.
export interface DateConfig {
  base: 'today' | string; // 'today' or ISO date
  offsetDays: number;
  format: string; // 'MMM d' | 'yyyy-MM-dd' | 'dd/MM/yy'
  prefix?: string;
  showBoth?: boolean;
}

interface BaseElement {
  id: string;
  xMm: number;
  yMm: number;
  wMm: number;
  hMm: number;
  rotation: number;
  field?: FieldBinding;
}

export interface TextElement extends BaseElement {
  type: 'text';
  text: string;
  fontSize: number; // points relative to label, ~ mm * 2.5 visual
  bold?: boolean;
  align: 'left' | 'center' | 'right';
  autosize?: boolean;
}

export interface DateElement extends BaseElement {
  type: 'date';
  fontSize: number;
  bold?: boolean;
  align: 'left' | 'center' | 'right';
  date: DateConfig;
}

export interface ShapeElement extends BaseElement {
  type: 'shape';
  shape: 'rect' | 'roundedRect' | 'line' | 'circle';
  fill: 'black' | 'white' | 'none';
  strokeWidth: number;
  cornerRadius?: number;
}

export interface QrElement extends BaseElement {
  type: 'qr';
  content: string;
  ecc: 'L' | 'M' | 'Q' | 'H';
}

export interface BarcodeElement extends BaseElement {
  type: 'barcode';
  content: string;
  symbology: 'code128' | 'ean13' | 'code39';
}

export interface ImageElement extends BaseElement {
  type: 'image';
  uri: string;
  dither: 'threshold' | 'floydSteinberg';
  invert?: boolean;
}

export interface IconElement extends BaseElement {
  type: 'icon';
  name: string;
}

export type LabelElement =
  | TextElement
  | DateElement
  | ShapeElement
  | QrElement
  | BarcodeElement
  | ImageElement
  | IconElement;

export interface LabelDesign {
  id: string;
  name: string;
  widthMm: number;
  heightMm: number;
  shape: LabelShape;
  elements: LabelElement[];
  isTemplate: boolean;
  sourceTemplateId?: string;
  createdAt: number;
  updatedAt: number;
}

export interface DatePreset {
  id: string;
  name: string;
  offsetDays: number;
  format: string;
  prefix?: string;
}

export interface AppSettings {
  defaultDensity: number; // 1–5
  defaultQuantity: number;
  defaultSizeId?: string;
  cloudLookupEnabled: boolean; // default false
  printerSound: boolean;
  theme: 'system' | 'light' | 'dark';
}

export interface PrinterCaps {
  speed: boolean;
  cut: boolean;
  sound: boolean;
  autoShutdown: boolean;
}

export interface PrinterProfile {
  id: string;
  model: string; // e.g. "B1", "B21"
  serial: string;
  lastConnectedAt: number;
  caps: PrinterCaps;
}
