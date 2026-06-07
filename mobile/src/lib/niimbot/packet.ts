// Niimbot BLE packet framing.
//   [0x55 0x55] [cmd:1] [len:1] [data:len] [checksum:1] [0xAA 0xAA]
// checksum = cmd XOR len XOR data[0] XOR … XOR data[len-1]
// (Matches niimprint / niimbotjs / niimbluelib — all use a single-byte length.)

export class NiimbotPacket {
  constructor(
    public readonly type: number,
    public readonly data: Uint8Array
  ) {}

  toBytes(): Uint8Array {
    const len = this.data.length;
    let checksum = this.type ^ len;
    for (const b of this.data) checksum ^= b;
    const out = new Uint8Array(7 + len);
    out[0] = 0x55;
    out[1] = 0x55;
    out[2] = this.type & 0xff;
    out[3] = len & 0xff;
    out.set(this.data, 4);
    out[4 + len] = checksum & 0xff;
    out[5 + len] = 0xaa;
    out[6 + len] = 0xaa;
    return out;
  }

  static fromBytes(bytes: Uint8Array): NiimbotPacket {
    if (bytes.length < 7) throw new Error('Niimbot packet too short');
    const type = bytes[2];
    const len = bytes[3];
    const data = bytes.slice(4, 4 + len);
    return new NiimbotPacket(type, data);
  }
}

/**
 * Extract complete packets from a rolling receive buffer. Returns the parsed packets and
 * whatever trailing bytes remain (an incomplete packet to be prepended to the next chunk).
 */
export function parsePackets(buffer: Uint8Array): { packets: NiimbotPacket[]; rest: Uint8Array } {
  const packets: NiimbotPacket[] = [];
  let i = 0;
  while (i + 1 < buffer.length) {
    // find header 0x55 0x55
    if (buffer[i] !== 0x55 || buffer[i + 1] !== 0x55) {
      i++;
      continue;
    }
    if (i + 4 > buffer.length) break; // need cmd + len
    const len = buffer[i + 3];
    const total = 7 + len; // head(2)+cmd(1)+len(1)+data+chk(1)+tail(2)
    if (i + total > buffer.length) break; // wait for more bytes
    const slice = buffer.slice(i, i + total);
    try {
      packets.push(NiimbotPacket.fromBytes(slice));
    } catch {
      // skip malformed framing
    }
    i += total;
  }
  return { packets, rest: buffer.slice(i) };
}
