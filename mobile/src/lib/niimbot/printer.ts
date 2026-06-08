// High-level Niimbot client: connection handshake, RFID/status reads and the B1-family
// print sequence. Sits on top of BleTransport. Response-bearing reads use a single-flight
// "next packet" wait; the print path is mostly fire-and-forget with status polling, since
// some B-series firmwares drop status replies over BLE.

import { BleTransport } from '../ble/transport';
import { build, Cmd, InfoKey, LabelType } from './commands';
import { Bitmap, encodeRows } from './encoder';
import { NiimbotPacket } from './packet';

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export interface RfidData {
  uuid: string;
  barcode: string;
  serial: string;
}

export interface PrinterStatus {
  batteryPct?: number;
  doorOpen?: boolean;
  paperPresent?: boolean;
  rfidOk?: boolean;
}

export interface PrinterIdentity {
  model: string;
  serial: string;
}

export interface PrintProgress {
  phase: 'start' | 'sending' | 'finishing' | 'done';
  percent: number; // 0–100
}

export interface PrintOptions {
  density: number;
  quantity: number;
  labelType?: LabelType;
  onProgress?: (p: PrintProgress) => void;
}

function asciiSlice(data: Uint8Array, start: number, len: number): string {
  let s = '';
  for (let i = start; i < start + len && i < data.length; i++) s += String.fromCharCode(data[i]);
  return s;
}

function hexSlice(data: Uint8Array, start: number, len: number): string {
  let s = '';
  for (let i = start; i < start + len && i < data.length; i++) s += data[i].toString(16).padStart(2, '0');
  return s;
}

export class NiimbotPrinter {
  constructor(private transport: BleTransport) {}

  /** Send a packet and resolve with the next inbound packet (optionally of a given type). */
  private requestNext(pkt: NiimbotPacket, timeoutMs = 1500, expectType?: number): Promise<NiimbotPacket | null> {
    return new Promise((resolve) => {
      let done = false;
      const finish = (p: NiimbotPacket | null) => {
        if (done) return;
        done = true;
        clearTimeout(timer);
        off();
        resolve(p);
      };
      const off = this.transport.onPacket((p) => {
        if (expectType !== undefined && p.type !== expectType) return;
        finish(p);
      });
      const timer = setTimeout(() => finish(null), timeoutMs);
      this.transport.send(pkt.toBytes()).catch(() => finish(null));
    });
  }

  private async send(pkt: NiimbotPacket): Promise<void> {
    await this.transport.send(pkt.toBytes());
  }

  /** Initial handshake; best-effort model/serial read (falls back to the advertised name). */
  async handshake(fallbackName: string): Promise<PrinterIdentity> {
    await this.send(build.connect());
    await sleep(50);
    const model = (await this.readInfoString(InfoKey.DeviceType)) || deriveModel(fallbackName);
    const serial = (await this.readInfoString(InfoKey.DeviceSerial)) || fallbackName;
    return { model, serial };
  }

  private async readInfoString(key: InfoKey): Promise<string | null> {
    // Info replies come back as type (0x40 + key); match on that so a slow reply from one
    // info request can't satisfy the next one (or the heartbeat read).
    const res = await this.requestNext(build.getInfo(key), 1200, Cmd.PrinterInfo + key);
    if (!res || res.data.length === 0) return null;
    // Device serial/type usually come back as ASCII; battery/etc. as a number.
    const printable = Array.from(res.data).every((b) => b >= 0x20 && b < 0x7f);
    return printable ? asciiSlice(res.data, 0, res.data.length).trim() : null;
  }

  async readBattery(): Promise<number | undefined> {
    const res = await this.requestNext(build.getInfo(InfoKey.Battery), 1200, Cmd.PrinterInfo + InfoKey.Battery);
    if (!res || res.data.length === 0) return undefined;
    const raw = res.data[res.data.length - 1];
    // Some firmwares report 0–4 bars, others 0–100. Normalise to a percentage.
    return raw <= 4 ? raw * 25 : Math.min(100, raw);
  }

  /** Read the inserted label's RFID one-code (Feature A). Returns null if no tag present. */
  async readRfid(): Promise<RfidData | null> {
    const res = await this.requestNext(build.getRfid(), 1500, Cmd.RfidInfo + 1) ?? (await this.requestNext(build.getRfid(), 1500));
    if (!res) return null;
    const data = res.data;
    if (data.length <= 1) return null; // no tag
    let offset = 8;
    const uuid = hexSlice(data, 0, 8);
    if (offset >= data.length) return { uuid, barcode: '', serial: '' };
    const barcodeLen = data[offset++];
    const barcode = asciiSlice(data, offset, barcodeLen);
    offset += barcodeLen;
    let serial = '';
    if (offset < data.length) {
      const serialLen = data[offset++];
      serial = asciiSlice(data, offset, serialLen);
    }
    return { uuid, barcode, serial };
  }

  /** Best-effort heartbeat read of lid / paper / rfid / battery state. */
  async readStatus(): Promise<PrinterStatus> {
    // Match the heartbeat reply by type (0xdc + 1 = 0xdd) so we don't mis-read a stray
    // serial/info reply as status. Tail layout (verified on B1, 13-byte reply):
    //   d[len-4] door  (1 = open),  d[len-3] battery level,
    //   d[len-2] paper (0 = present / 1 = missing),  d[len-1] rfid (1 = read ok).
    const res = await this.requestNext(build.heartbeat(), 1200, Cmd.Heartbeat + 1);
    if (!res) return {};
    const d = res.data;
    const len = d.length;
    if (len >= 4) {
      return {
        doorOpen: len >= 13 ? d[len - 4] === 1 : undefined,
        batteryPct: normaliseBattery(d[len - 3]),
        paperPresent: d[len - 2] === 0,
        rfidOk: d[len - 1] === 1,
      };
    }
    return {};
  }

  /** Run the full B1-family print sequence for a single rasterized label. */
  async print(bitmap: Bitmap, opts: PrintOptions): Promise<void> {
    const { density, quantity, labelType = LabelType.Gap, onProgress } = opts;
    onProgress?.({ phase: 'start', percent: 0 });

    await this.send(build.setDensity(density));
    await sleep(30);
    await this.send(build.setLabelType(labelType));
    await sleep(30);
    await this.send(build.printStart(1));
    await sleep(60); // B21: the first packet after PrintStart can be dropped — give it room
    await this.send(build.pageStart());
    await sleep(30);
    await this.send(build.setPageSize(bitmap.height, bitmap.width, quantity));
    await sleep(30);

    const rows = encodeRows(bitmap);
    // Stream the row packets in MTU-packed batches instead of one acknowledged BLE write per
    // scan-line. One write-per-row means ~N connection intervals of latency before the
    // printer even starts (the slow-to-start delay); packing many rows per write removes it.
    const BATCH = 48;
    for (let i = 0; i < rows.length; i += BATCH) {
      const parts = rows.slice(i, i + BATCH).map((p) => p.toBytes());
      const total = parts.reduce((n, b) => n + b.length, 0);
      const buf = new Uint8Array(total);
      let off = 0;
      for (const b of parts) {
        buf.set(b, off);
        off += b.length;
      }
      await this.transport.send(buf);
      onProgress?.({ phase: 'sending', percent: Math.round((Math.min(i + BATCH, rows.length) / rows.length) * 85) });
    }
    onProgress?.({ phase: 'sending', percent: 85 });

    await this.send(build.pageEnd());
    onProgress?.({ phase: 'finishing', percent: 90 });

    await this.waitForComplete(quantity, rows.length, onProgress);

    await this.send(build.printEnd());
    onProgress?.({ phase: 'done', percent: 100 });
  }

  private async waitForComplete(quantity: number, rowCount: number, onProgress?: (p: PrintProgress) => void): Promise<void> {
    const deadline = Date.now() + rowCount * quantity * 14 + 5000;
    while (Date.now() < deadline) {
      const res = await this.requestNext(build.printStatus(), 600, Cmd.PrintStatusReply);
      if (res && res.data.length >= 2) {
        const printedPages = (res.data[0] << 8) | res.data[1];
        if (printedPages >= quantity) return;
        const pct = 90 + Math.min(9, Math.round((printedPages / quantity) * 9));
        onProgress?.({ phase: 'finishing', percent: pct });
      }
      await sleep(350);
    }
  }

  async cancel(): Promise<void> {
    await this.send(build.cancelPrint());
  }
}

function normaliseBattery(raw: number): number {
  return raw <= 4 ? raw * 25 : Math.min(100, raw);
}

function deriveModel(name: string): string {
  const m = name.match(/^(B1|B21|B3S|B18|D11|D110|D101)/i);
  return m ? m[1].toUpperCase() : name.split('-')[0] || 'Niimbot';
}
