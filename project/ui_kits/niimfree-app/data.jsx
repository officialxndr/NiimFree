/* Mock data for the NiimFree app kit — common Niimbot label sizes, recent labels,
   starter templates, BLE devices, and the connected-printer profile. */

const SIZES = [
  { id: "s1", name: "40 × 30 mm", w: 40, h: 30, shape: "rect" },
  { id: "s2", name: "50 × 30 mm", w: 50, h: 30, shape: "rect" },
  { id: "s3", name: "30 × 15 mm", w: 30, h: 15, shape: "rect" },
  { id: "s4", name: "50 × 80 mm", w: 50, h: 80, shape: "rect" },
  { id: "s5", name: "Ø 40 mm", w: 40, h: 40, shape: "round" },
  { id: "s6", name: "12 × 40 mm cable", w: 12, h: 40, shape: "cable" },
];

const RECENT_LABELS = [
  { id: "l1", name: "Soup", w: 40, h: 30, shape: "rect", when: "2h ago",
    lines: [{ text: "Soup", strong: true, size: 15 }, { text: "Use by Jun 12", size: 11 }] },
  { id: "l2", name: "Rack A · Port 24", w: 50, h: 30, shape: "rect", when: "Yesterday",
    lines: [{ text: "Server rack A", strong: true, size: 12 }, { text: "PORT 24", mono: true, size: 11 }] },
  { id: "l3", name: "USB-C", w: 12, h: 40, shape: "cable", when: "2 days ago",
    lines: [{ text: "USB-C", size: 9 }] },
  { id: "l4", name: "Sourdough", w: 40, h: 30, shape: "rect", when: "3 days ago",
    lines: [{ text: "Sourdough", strong: true, size: 13 }, { text: "Best before Jun 20", size: 10 }] },
  { id: "l5", name: "Olive oil", w: 30, h: 15, shape: "rect", when: "Last week",
    lines: [{ text: "Olive oil", strong: true, size: 11 }] },
  { id: "l6", name: "Cat meds", w: 40, h: 30, shape: "rect", when: "Last week",
    lines: [{ text: "Cat meds", strong: true, size: 13 }, { text: "2× daily", size: 10 }] },
];

const TEMPLATES = [
  { id: "t1", name: "Leftovers", group: "starter", w: 40, h: 30, shape: "rect",
    fields: [
      { name: "Item name", type: "text", default: "Soup" },
      { name: "Expiry", type: "date", offset: 5 },
    ],
    lines: [{ text: "Soup", strong: true, size: 15 }, { text: "Use by Jun 12", field: true, size: 11 }] },
  { id: "t2", name: "Cable label", group: "starter", w: 12, h: 40, shape: "cable",
    fields: [{ name: "Label", type: "text", default: "USB-C" }],
    lines: [{ text: "USB-C", field: true, size: 9 }] },
  { id: "t3", name: "Address", group: "starter", w: 50, h: 30, shape: "rect",
    fields: [
      { name: "Name", type: "text", default: "A. Müller" },
      { name: "Street", type: "text", default: "12 Maple Rd" },
      { name: "City", type: "text", default: "Bristol BS1" },
    ],
    lines: [{ text: "A. Müller", strong: true, size: 12, field: true }, { text: "12 Maple Rd", size: 10, field: true }, { text: "Bristol BS1", size: 10, field: true }] },
  { id: "t4", name: "Price tag", group: "my", w: 30, h: 15, shape: "rect",
    fields: [{ name: "Item", type: "text", default: "Mug" }, { name: "Price", type: "number", default: "9" }],
    lines: [{ text: "Mug", strong: true, size: 10, field: true }, { text: "£9", size: 10, field: true }] },
  { id: "t5", name: "Name badge", group: "my", w: 50, h: 30, shape: "rect",
    fields: [{ name: "Name", type: "text", default: "Sam" }],
    lines: [{ text: "HELLO", size: 9 }, { text: "Sam", strong: true, size: 16, field: true }] },
];

const DEVICES = [
  { id: "d1", name: "D110-8F2A", meta: "B1-2401-0837", rssi: "-58 dBm", model: "D110" },
  { id: "d2", name: "B1-3C77", meta: "A4-2310-1192", rssi: "-71 dBm", model: "B1" },
  { id: "d3", name: "D11-22A9", meta: "C2-2208-4471", rssi: "-83 dBm", model: "D11" },
];

const PRINTER = {
  model: "D110", serial: "B1-2401-0837", battery: 78,
  caps: { speed: false, cut: false, sound: true, autoShutdown: true },
};

const DATE_PRESETS = [
  { id: "p1", name: "Leftovers", offset: 5 },
  { id: "p2", name: "Best before", offset: 14 },
  { id: "p3", name: "Freezer", offset: 90 },
];

// Compute a "Jun 12"-style date N days from a fixed "today" (Jun 7, 2026).
function dateFromOffset(days) {
  const base = new Date(2026, 5, 7);
  base.setDate(base.getDate() + days);
  return base.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

Object.assign(window, { SIZES, RECENT_LABELS, TEMPLATES, DEVICES, PRINTER, DATE_PRESETS, dateFromOffset });
