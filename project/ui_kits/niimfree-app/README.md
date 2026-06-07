# NiimFree app — UI kit

Interactive, click-through recreation of the NiimFree mobile app, rendered in a phone frame.
This is a **web (React + CSS) translation** of the React Native product, built from the design
spec (`uploads/niimbot-app-design-spec.md`). It composes the design-system look via the shared
`styles.css` classes and Lucide icons; it is self-contained (no build step) so it runs by opening
`index.html`.

## Run
Open `index.html`. Everything is fake/local — no network, no real Bluetooth.

## What you can do
- **Print tab → Connect printer** → BLE scan list → pick a device → **"New label detected"** sheet →
  choose a size → connects, "40×30 label detected" toast, live status grid (battery / lid / paper / RFID).
- **Labels (home)** → recent grid, quick-starts, **New label** → opens the editor.
- **Editor** → tap elements to select; inspector for text (size/align/bold/**mark as editable field**) and
  the **dynamic date** element (offset chips +1…+30); insert toolbar adds elements; **Preview**.
- **Templates → Use** → **Fill fields** sheet with a live mini-preview (smart date offset) → **Preview** →
  **Print** (1-bit "print output" view + density/quantity + print progress).
- **Settings** → remembered labels, date presets, cloud-lookup toggle (off by default), no-tracking note.

## Files
| File | Role |
|---|---|
| `index.html` | Loads React + Lucide + the JSX, mounts the app. |
| `app.css` | Phone shell + screen scaffolding (layout only; colors/type from tokens). |
| `ui.jsx` | Self-contained primitives mirroring the design-system components. |
| `data.jsx` | Mock sizes, labels, templates, BLE devices, printer, date presets. |
| `screens.jsx` | Labels, Templates, Print, Settings tab screens. |
| `editor.jsx` | Label Editor — canvas, insert toolbar, contextual inspector. |
| `sheets.jsx` | Connect, Set-size, Fill-fields, Print-preview overlays. |
| `app.jsx` | Shell: status bar, bottom tabs, router, sheet/modal orchestration. |

## Notes
- The three priority features are all represented: **A** label-size detection (connect → set-size →
  remembered + locked), **B** editable template fields (violet highlight + inspector toggle + fill form),
  **C** smart dates (offset chips, computed at fill time).
- Production is React Native; this kit cuts corners on real functionality but matches the visual design.
