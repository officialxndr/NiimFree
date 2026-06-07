// SQLite persistence (expo-sqlite). Stores labels/templates, the barcode→size map
// (Feature A), date presets (Feature C) and app settings. Label element trees are stored
// as a JSON blob; queryable fields live in their own columns.

import * as SQLite from 'expo-sqlite';
import { DEFAULT_DATE_PRESETS, STARTER_TEMPLATES } from '../data/presets';
import {
  AppSettings,
  DatePreset,
  LabelDesign,
  LabelElement,
  LabelShape,
  RememberedLabel,
} from '../types/models';
import { nowMs, uid } from './util';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export const DEFAULT_SETTINGS: AppSettings = {
  defaultDensity: 3,
  defaultQuantity: 1,
  cloudLookupEnabled: false,
  printerSound: true,
  theme: 'system',
};

async function open(): Promise<SQLite.SQLiteDatabase> {
  const db = await SQLite.openDatabaseAsync('niimfree.db');
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS labels (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      is_template INTEGER NOT NULL DEFAULT 0,
      width_mm REAL NOT NULL,
      height_mm REAL NOT NULL,
      shape TEXT NOT NULL,
      source_template_id TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      data TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS remembered_labels (
      id TEXT PRIMARY KEY NOT NULL,
      barcode TEXT NOT NULL UNIQUE,
      width_mm REAL NOT NULL,
      height_mm REAL NOT NULL,
      shape TEXT NOT NULL,
      name TEXT,
      last_used_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS date_presets (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      offset_days INTEGER NOT NULL,
      format TEXT NOT NULL,
      prefix TEXT
    );
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );
  `);
  await seed(db);
  return db;
}

async function seed(db: SQLite.SQLiteDatabase): Promise<void> {
  const seeded = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM settings WHERE key = ?',
    'seeded'
  );
  if (seeded) return;

  for (const tpl of STARTER_TEMPLATES) {
    await db.runAsync(
      `INSERT OR REPLACE INTO labels
         (id, name, is_template, width_mm, height_mm, shape, source_template_id, created_at, updated_at, data)
       VALUES (?, ?, 1, ?, ?, ?, NULL, ?, ?, ?)`,
      tpl.id,
      tpl.name,
      tpl.widthMm,
      tpl.heightMm,
      tpl.shape,
      tpl.createdAt,
      tpl.updatedAt,
      JSON.stringify(tpl.elements)
    );
  }
  for (const p of DEFAULT_DATE_PRESETS) {
    await db.runAsync(
      'INSERT OR REPLACE INTO date_presets (id, name, offset_days, format, prefix) VALUES (?, ?, ?, ?, ?)',
      p.id,
      p.name,
      p.offsetDays,
      p.format,
      p.prefix ?? null
    );
  }
  await db.runAsync('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', 'app', JSON.stringify(DEFAULT_SETTINGS));
  await db.runAsync('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', 'seeded', '1');
}

export function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) dbPromise = open();
  return dbPromise;
}

// ---- Labels & templates -------------------------------------------------

interface LabelRow {
  id: string;
  name: string;
  is_template: number;
  width_mm: number;
  height_mm: number;
  shape: string;
  source_template_id: string | null;
  created_at: number;
  updated_at: number;
  data: string;
}

function rowToDesign(r: LabelRow): LabelDesign {
  return {
    id: r.id,
    name: r.name,
    isTemplate: r.is_template === 1,
    widthMm: r.width_mm,
    heightMm: r.height_mm,
    shape: r.shape as LabelShape,
    sourceTemplateId: r.source_template_id ?? undefined,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    elements: JSON.parse(r.data) as LabelElement[],
  };
}

export async function listLabels(isTemplate: boolean): Promise<LabelDesign[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<LabelRow>(
    'SELECT * FROM labels WHERE is_template = ? ORDER BY updated_at DESC',
    isTemplate ? 1 : 0
  );
  return rows.map(rowToDesign);
}

export async function getLabel(id: string): Promise<LabelDesign | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<LabelRow>('SELECT * FROM labels WHERE id = ?', id);
  return row ? rowToDesign(row) : null;
}

export async function saveLabel(design: LabelDesign): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT OR REPLACE INTO labels
       (id, name, is_template, width_mm, height_mm, shape, source_template_id, created_at, updated_at, data)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    design.id,
    design.name,
    design.isTemplate ? 1 : 0,
    design.widthMm,
    design.heightMm,
    design.shape,
    design.sourceTemplateId ?? null,
    design.createdAt,
    design.updatedAt,
    JSON.stringify(design.elements)
  );
}

export async function deleteLabel(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM labels WHERE id = ?', id);
}

export async function duplicateLabel(id: string): Promise<LabelDesign | null> {
  const src = await getLabel(id);
  if (!src) return null;
  const copy: LabelDesign = {
    ...src,
    id: uid(),
    name: `${src.name} copy`,
    createdAt: nowMs(),
    updatedAt: nowMs(),
  };
  await saveLabel(copy);
  return copy;
}

// ---- Remembered labels (Feature A) -------------------------------------

interface RememberedRow {
  id: string;
  barcode: string;
  width_mm: number;
  height_mm: number;
  shape: string;
  name: string | null;
  last_used_at: number;
  created_at: number;
}

function rowToRemembered(r: RememberedRow): RememberedLabel {
  return {
    id: r.id,
    barcode: r.barcode,
    widthMm: r.width_mm,
    heightMm: r.height_mm,
    shape: r.shape as LabelShape,
    name: r.name ?? undefined,
    lastUsedAt: r.last_used_at,
    createdAt: r.created_at,
  };
}

export async function listRemembered(): Promise<RememberedLabel[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<RememberedRow>('SELECT * FROM remembered_labels ORDER BY last_used_at DESC');
  return rows.map(rowToRemembered);
}

export async function getRememberedByBarcode(barcode: string): Promise<RememberedLabel | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<RememberedRow>('SELECT * FROM remembered_labels WHERE barcode = ?', barcode);
  return row ? rowToRemembered(row) : null;
}

export async function upsertRemembered(label: Omit<RememberedLabel, 'id' | 'createdAt' | 'lastUsedAt'> & { id?: string }): Promise<RememberedLabel> {
  const db = await getDb();
  const existing = await getRememberedByBarcode(label.barcode);
  const now = nowMs();
  const record: RememberedLabel = {
    id: existing?.id ?? label.id ?? uid(),
    barcode: label.barcode,
    widthMm: label.widthMm,
    heightMm: label.heightMm,
    shape: label.shape,
    name: label.name,
    createdAt: existing?.createdAt ?? now,
    lastUsedAt: now,
  };
  await db.runAsync(
    `INSERT OR REPLACE INTO remembered_labels
       (id, barcode, width_mm, height_mm, shape, name, last_used_at, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    record.id,
    record.barcode,
    record.widthMm,
    record.heightMm,
    record.shape,
    record.name ?? null,
    record.lastUsedAt,
    record.createdAt
  );
  return record;
}

export async function deleteRemembered(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM remembered_labels WHERE id = ?', id);
}

// ---- Date presets (Feature C) ------------------------------------------

export async function listDatePresets(): Promise<DatePreset[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ id: string; name: string; offset_days: number; format: string; prefix: string | null }>(
    'SELECT * FROM date_presets ORDER BY offset_days ASC'
  );
  return rows.map((r) => ({ id: r.id, name: r.name, offsetDays: r.offset_days, format: r.format, prefix: r.prefix ?? undefined }));
}

export async function saveDatePreset(p: DatePreset): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'INSERT OR REPLACE INTO date_presets (id, name, offset_days, format, prefix) VALUES (?, ?, ?, ?, ?)',
    p.id,
    p.name,
    p.offsetDays,
    p.format,
    p.prefix ?? null
  );
}

export async function deleteDatePreset(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM date_presets WHERE id = ?', id);
}

// ---- Settings -----------------------------------------------------------

export async function getSettings(): Promise<AppSettings> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ value: string }>('SELECT value FROM settings WHERE key = ?', 'app');
  if (!row) return { ...DEFAULT_SETTINGS };
  try {
    return { ...DEFAULT_SETTINGS, ...(JSON.parse(row.value) as Partial<AppSettings>) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  const db = await getDb();
  await db.runAsync('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', 'app', JSON.stringify(settings));
}
