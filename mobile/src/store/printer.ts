import { create } from 'zustand';
import { BleTransport, ScanResult } from '../lib/ble/transport';
import { getRememberedByBarcode, upsertRemembered } from '../lib/db';
import { Bitmap } from '../lib/niimbot/encoder';
import { NiimbotPrinter, PrinterIdentity, PrinterStatus, PrintProgress } from '../lib/niimbot/printer';
import { LabelShape, PrinterCaps } from '../types/models';

export interface DetectedLabel {
  widthMm: number;
  heightMm: number;
  shape: LabelShape;
  barcode?: string;
  name?: string;
}

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected';

interface PrinterState {
  connection: ConnectionStatus;
  identity: PrinterIdentity | null;
  caps: PrinterCaps;
  status: PrinterStatus;
  detected: DetectedLabel | null;
  pendingBarcode: string | null; // unknown label awaiting a size answer
  printing: PrintProgress | null;
  error: string | null;

  startScan: (onDevice: (d: ScanResult) => void, onError?: (e: Error) => void) => Promise<() => void>;
  stopScan: () => void;
  connect: (deviceId: string, name: string) => Promise<void>;
  disconnect: () => Promise<void>;
  refreshStatus: () => Promise<void>;
  detectLabel: () => Promise<void>;
  confirmSize: (size: { widthMm: number; heightMm: number; shape: LabelShape; name?: string }) => Promise<void>;
  clearPending: () => void;
  setError: (e: string | null) => void;
  print: (bitmap: Bitmap, opts: { density: number; quantity: number }) => Promise<void>;
}

// Non-reactive singletons — the BLE manager and protocol client live for the app session.
const transport = new BleTransport();
const printer = new NiimbotPrinter(transport);

function capsForModel(model: string): PrinterCaps {
  // B1 / B21 / B3S: sound + auto-shutdown, no speed/cut controls.
  return { speed: false, cut: false, sound: true, autoShutdown: true };
}

export const usePrinter = create<PrinterState>((set, get) => {
  transport.onDisconnect(() => {
    set({ connection: 'disconnected', identity: null, status: {}, detected: null, pendingBarcode: null });
  });

  return {
    connection: 'disconnected',
    identity: null,
    caps: capsForModel(''),
    status: {},
    detected: null,
    pendingBarcode: null,
    printing: null,
    error: null,

    startScan: async (onDevice, onError) => {
      const on = await transport.waitForPoweredOn();
      if (!on) {
        onError?.(new Error('Bluetooth is off. Turn it on to scan for printers.'));
        return () => {};
      }
      return transport.startScan(onDevice, onError);
    },
    stopScan: () => transport.stopScan(),

    connect: async (deviceId, name) => {
      set({ connection: 'connecting', error: null });
      try {
        const on = await transport.waitForPoweredOn();
        if (!on) throw new Error('Bluetooth is off.');
        await transport.connect(deviceId);
        const identity = await printer.handshake(name);
        set({ connection: 'connected', identity, caps: capsForModel(identity.model) });
        await get().refreshStatus();
        await get().detectLabel();
      } catch (e: any) {
        set({ connection: 'disconnected', error: e?.message ?? 'Could not connect.' });
        throw e;
      }
    },

    disconnect: async () => {
      await transport.disconnect();
      set({ connection: 'disconnected', identity: null, status: {}, detected: null, pendingBarcode: null });
    },

    refreshStatus: async () => {
      if (get().connection !== 'connected') return;
      try {
        const status = await printer.readStatus();
        const batteryPct = status.batteryPct ?? (await printer.readBattery());
        set({ status: { ...status, batteryPct } });
      } catch {
        /* status is best-effort */
      }
    },

    detectLabel: async () => {
      if (get().connection !== 'connected') return;
      try {
        const rfid = await printer.readRfid();
        if (!rfid || !rfid.barcode) return; // no tag / unreadable — leave size manual
        const remembered = await getRememberedByBarcode(rfid.barcode);
        if (remembered) {
          await upsertRemembered(remembered); // bump last-used
          set({
            detected: {
              widthMm: remembered.widthMm,
              heightMm: remembered.heightMm,
              shape: remembered.shape,
              barcode: remembered.barcode,
              name: remembered.name,
            },
            pendingBarcode: null,
          });
        } else {
          set({ pendingBarcode: rfid.barcode, detected: null });
        }
      } catch {
        /* RFID read is best-effort */
      }
    },

    confirmSize: async (size) => {
      const barcode = get().pendingBarcode;
      if (barcode) {
        await upsertRemembered({ barcode, widthMm: size.widthMm, heightMm: size.heightMm, shape: size.shape, name: size.name });
      }
      set({
        detected: { ...size, barcode: barcode ?? undefined },
        pendingBarcode: null,
      });
    },

    clearPending: () => set({ pendingBarcode: null }),
    setError: (e) => set({ error: e }),

    print: async (bitmap, opts) => {
      if (get().connection !== 'connected') throw new Error('Not connected to a printer.');
      set({ printing: { phase: 'start', percent: 0 }, error: null });
      try {
        await printer.print(bitmap, {
          density: opts.density,
          quantity: opts.quantity,
          onProgress: (p) => set({ printing: p }),
        });
      } catch (e: any) {
        set({ error: e?.message ?? 'Print failed.' });
        throw e;
      } finally {
        // brief lingering "done" then clear
        setTimeout(() => set({ printing: null }), 600);
      }
    },
  };
});
