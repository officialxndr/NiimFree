// BLE transport over react-native-ble-plx. Handles scanning, connection, characteristic
// discovery, chunked writes and notification framing. Niimbot printers expose a single
// serial-style service; we prefer the well-known UUIDs and fall back to auto-discovery.

import { Platform } from 'react-native';
import {
  BleManager,
  Characteristic,
  Device,
  State,
  Subscription,
} from 'react-native-ble-plx';
import { NiimbotPacket, parsePackets } from '../niimbot/packet';
import { base64ToBytes, bytesToBase64 } from './base64';

const NIIMBOT_SERVICE = 'e7810a71-73ae-499d-8c15-faa9aef0c3f2';
const NIIMBOT_CHAR = 'bef8d6c9-9c21-4c9e-b632-bd58c1009f9f';

/**
 * Heuristic: is this advertised name a Niimbot printer? Niimbot devices advertise as
 * "Niimbot-…" or a model code like B1-XXXX / B18 / B21 / B3S / D11 / D101 / D110 / H1.
 * Consumer devices (AirPods, JBL, Galaxy Buds, …) don't match, so this keeps the list clean.
 */
export function isNiimbotName(name: string): boolean {
  const n = name.trim().toLowerCase();
  if (!n) return false;
  if (n.includes('niimbot')) return true;
  return /^[bdh]\d/.test(n); // B1, B18, B21, B3S, D11, D101, D110, H1, …
}

export interface ScanResult {
  id: string;
  name: string;
  rssi: number | null;
}

export type PacketHandler = (packet: NiimbotPacket) => void;

export class BleTransport {
  private manager = new BleManager();
  private device: Device | null = null;
  private writeChar: Characteristic | null = null;
  private notifySub: Subscription | null = null;
  private disconnectSub: Subscription | null = null;
  private rxBuffer = new Uint8Array(0);
  private handlers = new Set<PacketHandler>();
  private disconnectHandlers = new Set<() => void>();
  private chunkSize = 20;

  onPacket(handler: PacketHandler): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  onDisconnect(handler: () => void): () => void {
    this.disconnectHandlers.add(handler);
    return () => this.disconnectHandlers.delete(handler);
  }

  async waitForPoweredOn(timeoutMs = 8000): Promise<boolean> {
    const state = await this.manager.state();
    if (state === State.PoweredOn) return true;
    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        sub.remove();
        resolve(false);
      }, timeoutMs);
      const sub = this.manager.onStateChange((s) => {
        if (s === State.PoweredOn) {
          clearTimeout(timer);
          sub.remove();
          resolve(true);
        }
      }, true);
    });
  }

  /** Scan for nearby devices. Calls `onDevice` for each discovery; returns a stop fn. */
  startScan(onDevice: (d: ScanResult) => void, onError?: (e: Error) => void): () => void {
    const seen = new Set<string>();
    const report = (id: string, name: string, rssi: number | null) => {
      if (seen.has(id)) return;
      seen.add(id);
      onDevice({ id, name: name || 'Niimbot printer', rssi });
    };

    // A printer with a still-open BLE link (e.g. left connected by a previous session, or
    // after a force-quit) stops advertising, so it never appears in a normal scan. Surface
    // it from the OS list of connected peripherals so it can be re-selected — connect()
    // clears the stale link first. This is the usual "had to power-cycle the printer" case.
    this.manager
      .connectedDevices([NIIMBOT_SERVICE])
      .then((devices) => devices.forEach((d) => report(d.id, d.name ?? d.localName ?? '', d.rssi)))
      .catch(() => {});

    this.manager.startDeviceScan(null, { allowDuplicates: false }, (error, device) => {
      if (error) {
        onError?.(error);
        return;
      }
      if (!device || seen.has(device.id)) return;
      // Niimbot printers advertise names like "B1-XXXX", "B21-XXXX", "D110-XXXX".
      const name = device.name ?? device.localName ?? '';
      if (!name || !isNiimbotName(name)) return; // only surface Niimbot printers
      report(device.id, name, device.rssi);
    });
    return () => this.manager.stopDeviceScan();
  }

  stopScan(): void {
    this.manager.stopDeviceScan();
  }

  async connect(deviceId: string): Promise<Device> {
    this.manager.stopDeviceScan();
    // Clear any stale/lingering link to this printer first. Reconnecting on top of an
    // existing connection fails, and the leftover link is exactly what stops the printer
    // from advertising (the "have to power-cycle it" symptom).
    try {
      if (await this.manager.isDeviceConnected(deviceId)) {
        await this.manager.cancelDeviceConnection(deviceId);
      }
    } catch {
      /* no stale connection — fine */
    }
    let device = await this.manager.connectToDevice(deviceId, { requestMTU: 247, timeout: 12000 });
    device = await device.discoverAllServicesAndCharacteristics();
    this.device = device;
    this.chunkSize = Math.max(20, (device.mtu ?? 23) - 3);

    const { write, notify } = await this.findCharacteristics(device);
    this.writeChar = write;

    this.notifySub = notify.monitor((error, char) => {
      if (error || !char?.value) return;
      this.ingest(base64ToBytes(char.value));
    });

    this.disconnectSub = this.manager.onDeviceDisconnected(device.id, () => {
      this.handleDisconnected(true);
    });

    return device;
  }

  private async findCharacteristics(device: Device): Promise<{ write: Characteristic; notify: Characteristic }> {
    const services = await device.services();
    // Prefer the known Niimbot service/characteristic.
    const known = services.find((s) => s.uuid.toLowerCase() === NIIMBOT_SERVICE);
    const candidateServices = known ? [known, ...services.filter((s) => s !== known)] : services;

    let write: Characteristic | null = null;
    let notify: Characteristic | null = null;
    for (const service of candidateServices) {
      const chars = await service.characteristics();
      for (const c of chars) {
        if (c.uuid.toLowerCase() === NIIMBOT_CHAR) {
          if (c.isWritableWithoutResponse || c.isWritableWithResponse) write = c;
          if (c.isNotifiable || c.isIndicatable) notify = c;
        }
      }
      if (!write) write = chars.find((c) => c.isWritableWithoutResponse || c.isWritableWithResponse) ?? null;
      if (!notify) notify = chars.find((c) => c.isNotifiable || c.isIndicatable) ?? null;
      if (write && notify) break;
    }
    if (!write || !notify) throw new Error('No compatible Bluetooth service found on this device.');
    return { write, notify };
  }

  private ingest(chunk: Uint8Array): void {
    const merged = new Uint8Array(this.rxBuffer.length + chunk.length);
    merged.set(this.rxBuffer, 0);
    merged.set(chunk, this.rxBuffer.length);
    const { packets, rest } = parsePackets(merged);
    this.rxBuffer = rest;
    for (const pkt of packets) {
      for (const h of this.handlers) h(pkt);
    }
  }

  /** Write a fully framed packet, chunked to the negotiated MTU. */
  async send(bytes: Uint8Array): Promise<void> {
    if (!this.device || !this.writeChar) throw new Error('Not connected');
    // Prefer acknowledged writes when the characteristic supports them: write-without-response
    // gives no flow control, so a long stream of image-row packets can be silently dropped
    // (prints blank/partial). Fall back to without-response only when that's all that's offered.
    const useResponse = this.writeChar.isWritableWithResponse;
    for (let i = 0; i < bytes.length; i += this.chunkSize) {
      const slice = bytes.slice(i, i + this.chunkSize);
      const b64 = bytesToBase64(slice);
      if (useResponse) {
        await this.device.writeCharacteristicWithResponseForService(this.writeChar.serviceUUID, this.writeChar.uuid, b64);
      } else {
        await this.device.writeCharacteristicWithoutResponseForService(this.writeChar.serviceUUID, this.writeChar.uuid, b64);
      }
    }
  }

  private handleDisconnected(notify: boolean): void {
    this.device = null;
    this.writeChar = null;
    this.notifySub?.remove();
    this.notifySub = null;
    this.disconnectSub?.remove();
    this.disconnectSub = null;
    this.rxBuffer = new Uint8Array(0);
    if (notify) for (const h of this.disconnectHandlers) h();
  }

  get connected(): boolean {
    return this.device !== null;
  }

  async disconnect(): Promise<void> {
    const id = this.device?.id;
    this.handleDisconnected(false);
    if (id) {
      try {
        await this.manager.cancelDeviceConnection(id);
      } catch {
        /* already gone */
      }
    }
  }

  destroy(): void {
    this.handlers.clear();
    this.manager.destroy();
  }
}
