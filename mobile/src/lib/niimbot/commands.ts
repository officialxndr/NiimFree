// Niimbot command ids and packet builders. Command set per the NIIMBOT Community Wiki
// (printers.niim.blue). The print sequence here targets the "B1" print task used by the
// B1 / B21 / B3S family released in 2024.

import { NiimbotPacket } from './packet';

export enum Cmd {
  Connect = 0xc1,
  Heartbeat = 0xdc,
  PrinterInfo = 0x40,
  RfidInfo = 0x1a,
  SetLabelType = 0x23,
  SetDensity = 0x21,
  PrintStart = 0x01,
  PageStart = 0x03,
  SetPageSize = 0x13,
  PrintQuantity = 0x15,
  PrintBitmapRow = 0x85,
  PrintEmptyRow = 0x84,
  PrintStatus = 0xa3,
  PageEnd = 0xe3,
  PrintEnd = 0xf3,
  CancelPrint = 0xda,
  SoundSettings = 0x58,
}

// Sub-keys for PrinterInfo (0x40).
export enum InfoKey {
  Density = 1,
  Speed = 2,
  LabelType = 3,
  AutoShutdownTime = 7,
  DeviceType = 8,
  SoftVersion = 9,
  Battery = 10,
  DeviceSerial = 11,
  HardVersion = 12,
}

// Standard label types. 1 = die-cut labels with gaps (the common case).
export enum LabelType {
  Gap = 1,
  Black = 2,
  Continuous = 3,
  Perforated = 4,
  Transparent = 5,
}

const u16be = (n: number): [number, number] => [(n >> 8) & 0xff, n & 0xff];

const p = (type: Cmd, data: number[] | Uint8Array) =>
  new NiimbotPacket(type, data instanceof Uint8Array ? data : Uint8Array.from(data));

export const build = {
  connect: () => p(Cmd.Connect, [0x01]),
  heartbeat: () => p(Cmd.Heartbeat, [0x01]),
  getInfo: (key: InfoKey) => p(Cmd.PrinterInfo, [key]),
  getRfid: () => p(Cmd.RfidInfo, [0x01]),

  setLabelType: (type: LabelType = LabelType.Gap) => p(Cmd.SetLabelType, [type]),
  setDensity: (density: number) => p(Cmd.SetDensity, [Math.max(1, Math.min(5, Math.round(density)))]),
  setSound: (on: boolean) => p(Cmd.SoundSettings, [0x01, 0x01, on ? 0x01 : 0x00]),

  // B1: PrintStart [totalPages(u16), 0, 0, 0, 0, pageColor(u8)]
  printStart: (totalPages = 1, pageColor = 0) => p(Cmd.PrintStart, [...u16be(totalPages), 0, 0, 0, 0, pageColor]),
  pageStart: () => p(Cmd.PageStart, [0x01]),
  // B1: SetPageSize [rows(u16), cols(u16), copiesCount(u16)]
  setPageSize: (rows: number, cols: number, copies = 1) => p(Cmd.SetPageSize, [...u16be(rows), ...u16be(cols), ...u16be(copies)]),
  printQuantity: (qty: number) => p(Cmd.PrintQuantity, [...u16be(qty)]),
  pageEnd: () => p(Cmd.PageEnd, [0x01]),
  printEnd: () => p(Cmd.PrintEnd, [0x01]),
  printStatus: () => p(Cmd.PrintStatus, [0x01]),
  cancelPrint: () => p(Cmd.CancelPrint, [0x01]),
};
