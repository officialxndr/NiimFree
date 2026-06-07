# NiimFree — Design & Build Specification

> **A free, open-source, subscription-free alternative client for Niimbot label printers.**
> Local-first. No account. No cloud dependency. Works offline.

---

## ⚠️ READ THIS FIRST — INSTRUCTIONS FOR CLAUDE DESIGN

**THIS IS A REACT NATIVE (EXPO) MOBILE APP. NOT A WEB APP.**

When generating any UI from this document, you **must**:

1. **Use React Native components only** — `View`, `Text`, `Pressable`, `ScrollView`, `FlatList`, `TextInput`, `Modal`, `SafeAreaView`, etc. **Never** use `<div>`, `<span>`, `<button>`, `<input>`, HTML tags, or web CSS classes.
2. **Style with `StyleSheet.create({...})`** and the RN style object model (flexbox-based; `flexDirection` defaults to `column`). **Do not** use Tailwind, CSS files, `className`, or web-style CSS.
3. **Assume Expo SDK + TypeScript.** All components are `.tsx`, typed, functional, with hooks.
4. **Use RN-native primitives for interaction** — `Pressable`/`TouchableOpacity` for taps, `onPress` (never `onClick`), `onChangeText` (never `onChange`), gestures via `react-native-gesture-handler` / `react-native-reanimated`.
5. **No `localStorage`, no `window`, no `document`, no DOM APIs.** Persistence is SQLite (`expo-sqlite`). In-session state is `useState`/`useReducer`/`Zustand`.
6. **Navigation is Expo Router (file-based) or React Navigation.** Screens are stack/tab based, not URL routes rendered in a browser.
7. **The label-design canvas is `@shopify/react-native-skia`,** not HTML `<canvas>` and not SVG-in-a-div.
8. **Icons** come from `@expo/vector-icons` (or `lucide-react-native`), never `lucide-react` (web) or inline SVG `<svg>` web tags.
9. **Lists** use `FlatList`/`SectionList` for performance, not `.map()` into a scrolling `<div>`.
10. **Safe areas, status bar, and keyboard avoidance** must be handled (`SafeAreaView`, `KeyboardAvoidingView`).

If you find yourself reaching for a `<div>` or a Tailwind class, stop — translate it to the React Native equivalent.

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Technical Foundation & Stack](#2-technical-foundation--stack)
3. [Hardware / Protocol Background (why the UI is shaped this way)](#3-hardware--protocol-background)
4. [Information Architecture & Navigation](#4-information-architecture--navigation)
5. [Design System](#5-design-system)
6. [Screen-by-Screen Specification](#6-screen-by-screen-specification)
7. [The Three Priority Features in Detail](#7-the-three-priority-features-in-detail)
8. [Data Model](#8-data-model)
9. [Component Library](#9-component-library)
10. [States, Edge Cases & Errors](#10-states-edge-cases--errors)
11. [Build Order](#11-build-order)

---

## 1. Product Overview

### 1.1 The problem
The official Niimbot app gates basic functionality (templates, fonts, certain features) behind accounts and subscriptions, phones home, and ties label sizing to a cloud lookup. This app replaces it with a fully local, free, open-source client.

### 1.2 Core value props (these should be visible/felt in the UI)
- **No account, ever.** Open app → connect printer → print.
- **Works offline.** All data lives on-device.
- **Can't mess up label size.** The app detects the inserted label and locks the canvas to its real dimensions.
- **Reusable templates with editable fields.** Design once, fill the blanks, print many.
- **Smart dates.** "Best before +7 days" auto-computed at print time — ideal for food/expiry labels.

### 1.3 Target platforms
iOS, Android (primary). Built with Expo so a web/self-host target is *possible* later, but **the design must be mobile-first and React Native native** — phones are the primary device.

### 1.4 Working name
`NiimFree` (placeholder — easy to rename; don't hardcode the brand string everywhere, pull from a constant).

---

## 2. Technical Foundation & Stack

| Concern | Choice | Notes |
|---|---|---|
| Framework | **Expo (SDK current) + React Native + TypeScript** | Custom dev client required (BLE needs native code) |
| Navigation | **Expo Router** (file-based) | Tabs + stacks |
| Canvas / label rendering | **`@shopify/react-native-skia`** | Rasterize design → 1-bit bitmap at 8 px/mm |
| Bluetooth | **`react-native-ble-plx`** | Needs `expo prebuild` + EAS build; **not Expo Go** |
| Protocol | **Port of `niimbluelib` (MIT, TypeScript)** | Reuse packet encoder/decoder + "print task" abstraction |
| Local DB | **`expo-sqlite`** | Templates, labels, barcode→size map |
| State | **Zustand** (global) + hooks (local) | Printer connection, current design |
| Gestures | **`react-native-gesture-handler` + `react-native-reanimated`** | Canvas drag/resize/pinch |
| Icons | **`@expo/vector-icons`** | Never the web `lucide-react` |

> **CRITICAL FOR DESIGN:** Because BLE requires a custom native build, there is **no Expo Go path**. Don't design any "scan this QR in Expo Go" onboarding. The dev/test loop is `eas build --profile development`.

### 2.1 Reference projects (already researched — for the engineer, not the designer)
- **NiimBlue / niimbluelib** (MultiMote) — most complete open-source protocol; the source of truth. MIT licensed.
- **niimprint** (Python) — protocol cross-reference.
- **niimbotjs** (Node) — protocol cross-reference.
- **NIIMBOT Community Wiki** (`printers.niim.blue`) — packet command list, heartbeat format, RFID tag structure, cloud API.

---

## 3. Hardware / Protocol Background

*(This explains **why** several screens exist. The designer should read it so the UI matches reality.)*

### 3.1 Resolution
Niimbot printers are **8 px/mm (~203 dpi)**. A 50×30 mm label is 400×240 px. The canvas must think in millimeters for the user but render in pixels for the printer.

### 3.2 The label-size detection reality (shapes Feature A)
- The printer reports, over BLE, whether a label/RFID is **present and read OK** (via the heartbeat: lid-closed, paper-inserted, paper-RFID-success flags).
- The printer can return RFID data (`RfidInfo`, cmd `0x1a`): **UUID, serial, and a barcode ("one-code")** — but **NOT the physical size in plaintext.** The size lives behind Niimbot's cloud (`getCloudTemplateByOneCode`), which also blocks CORS.
- **Therefore the offline strategy (what we build):** read the barcode locally → look it up in a **local barcode→size table** → if known, auto-lock the canvas to that size; if unknown, **ask the user once**, then remember it forever. Optional opt-in cloud lookup for first-time auto-fill.
- **UI consequence:** there must be (a) a "label detected" banner/flow, (b) a "first time seeing this label — what size is it?" prompt, and (c) a settings screen listing remembered labels you can edit/delete.

### 3.3 Model differences
`PrintStart` / `SetPageSize` / heartbeat byte formats differ across model families (D11/B21/D110 vs B1/newer). The engine handles this via "print tasks." **UI consequence:** the printer must be identified, and a small "model" indicator should appear in printer status. Some advanced print options (speed, cut) only exist on some models — hide options the connected model doesn't support.

### 3.4 Print pipeline (informs the Preview screen)
Design (vector-ish, mm) → rasterize to 1-bit bitmap (px) → dither/threshold (post-processing) → row-encode → stream over BLE. The **Preview must show the post-processed 1-bit result**, not the pretty editor version, so users see exactly what prints.

---

## 4. Information Architecture & Navigation

### 4.1 Top-level structure — Bottom Tab Bar (4 tabs)

```
┌─────────────────────────────────────────────┐
│                  [ Screen ]                   │
│                                               │
│                                               │
├───────────────────────────────────────────────┤
│  🏷️ Labels  │  📐 Templates │  🖨️ Print │ ⚙️ Settings │
└───────────────────────────────────────────────┘
```

| Tab | Purpose |
|---|---|
| **Labels** | Home. Recent/saved labels, big "＋ New Label" CTA, quick access to design. |
| **Templates** | Browse, create, edit templates; "Use template" → fill fields → print. |
| **Print** | Printer connection hub: connect/disconnect, status (battery, lid, paper, RFID, model), label-detection state, density/quantity defaults. |
| **Settings** | Remembered labels (barcode→size), default densities, date presets, fonts, about/open-source credits, opt-in cloud lookup toggle. |

### 4.2 Stacks (pushed screens, not tabs)
- **Label Editor** (full-screen, pushed from Labels/Templates) — the Skia canvas designer.
- **Print Preview** (modal) — 1-bit preview + density/quantity + print button.
- **Template Field Fill** (modal/sheet) — the quick "fill the blanks" form.
- **Connect Printer** (modal) — BLE scan list.
- **Edit Remembered Label** (pushed from Settings).

### 4.3 Primary user flows (design these end-to-end)

**Flow 1 — First print, brand-new label roll**
Open app → Print tab → "Connect printer" → scan → connect → insert label → **"New label detected — what size is this?"** sheet → pick/enter size → app remembers it → New Label → design → Preview → Print.

**Flow 2 — Reusing a remembered roll**
Insert label → app silently auto-selects size (toast: "40×30 label detected") → design → print.

**Flow 3 — Template-based quick print (the food/expiry case)**
Templates tab → "Leftovers" template → Fill Fields sheet shows: `Item name` (text), `Expiry` (date +N days, default +5) → type "Soup", confirm → Preview shows "Soup / Use by Jun 12" → Print.

**Flow 4 — Editing a template later**
Templates → long-press "Leftovers" → Edit → opens in Label Editor with field markers visible → change layout → Save (existing labels made from it are untouched).

---

## 5. Design System

> Implement as a `theme.ts` constants file consumed by `StyleSheet.create`. Support light + dark.

### 5.1 Design language
Clean, utilitarian, slightly playful. This is a maker/tinkerer tool that should still feel polished. Think "well-made hardware companion app." High legibility (labels are about text), generous tap targets, confident primary actions.

### 5.2 Color tokens

```ts
// theme.ts
export const colors = {
  light: {
    bg:            '#F7F8FA',
    surface:       '#FFFFFF',
    surfaceAlt:    '#EFF1F4',
    border:        '#E2E5EA',
    text:          '#15181E',
    textMuted:     '#5C6470',
    textFaint:     '#9098A3',
    primary:       '#2B6BF3', // actions, connect, print
    primaryText:   '#FFFFFF',
    success:       '#1FA971', // printer ready, label detected
    warning:       '#E8A33D', // lid open, low battery
    danger:        '#E0492F', // disconnected, errors
    accent:        '#7C4DFF', // templates / dynamic fields
    fieldHi:       '#FFF3D6', // highlight for editable template fields
  },
  dark: {
    bg:            '#0E1116',
    surface:       '#171B22',
    surfaceAlt:    '#1F242D',
    border:        '#2A2F3A',
    text:          '#F2F4F7',
    textMuted:     '#A2AAB6',
    textFaint:     '#6C7480',
    primary:       '#4F86F7',
    primaryText:   '#FFFFFF',
    success:       '#33C088',
    warning:       '#F0B259',
    danger:        '#F0664D',
    accent:        '#9B73FF',
    fieldHi:       '#3A3320',
  },
};
```

### 5.3 Typography
Use the system font stack (RN default) or bundle Inter via `expo-font`.

| Token | Size | Weight | Use |
|---|---|---|---|
| `display` | 28 | 700 | Screen hero titles |
| `title` | 22 | 700 | Section / screen titles |
| `heading` | 17 | 600 | Card titles, list headers |
| `body` | 15 | 400 | Default text |
| `bodyStrong` | 15 | 600 | Emphasis |
| `caption` | 13 | 400 | Secondary info |
| `mono` | 13 | 500 | Barcodes, serials, dimensions (e.g. `40×30 mm`) |

Line heights ≈ 1.35× size. All sizes in `fontSize` numbers (RN, unitless = density-independent px).

### 5.4 Spacing scale (4-pt base)
`spacing = { xs:4, sm:8, md:12, lg:16, xl:24, xxl:32, xxxl:48 }`

### 5.5 Radii & elevation
`radius = { sm:8, md:12, lg:16, xl:24, pill:999 }`
Elevation via subtle shadow on iOS (`shadowColor/Opacity/Radius/Offset`) and `elevation` on Android. Cards: radius `lg`, low elevation. Sheets: radius `xl` top corners only.

### 5.6 Tap targets
Minimum 44×44 pt. Primary buttons full-width, height 52, radius `md`, weight 600.

### 5.7 Motion
`react-native-reanimated`. Sheet slide-up 250ms ease-out. "Label detected" banner: slide + subtle scale pop. Connection status changes: color crossfade. Avoid gratuitous animation on the canvas.

---

## 6. Screen-by-Screen Specification

> For every screen below: build the **default**, **empty**, **loading**, and **error** states.

### 6.1 Labels (Home tab)

**Purpose:** Land here. Quick to a new design or a recent one.

**Layout (top → bottom):**
1. **Header row** — App name (`display`), small printer-status pill on the right (green dot "Ready" / gray "Not connected"). Tapping the pill jumps to Print tab.
2. **Primary CTA** — Large `＋ New Label` button (full width, primary). Below it a secondary row of quick-starts: `Blank`, `From template`, `Quick text`.
3. **"Recent" section** — `FlatList` (2-column grid) of recent label thumbnails. Each card: mini render of the label, name, size in `mono` (`40×30 mm`), relative date. Long-press → context menu (Duplicate, Rename, Delete, Print).
4. **Empty state** — friendly illustration + "No labels yet — create your first one." with the CTA.

**Interactions:** Tap card → open in Editor. Tap `＋ New Label` → if size not yet known, prompt size first (or default to last-used size), then Editor.

---

### 6.2 Templates (tab)

**Purpose:** Manage reusable templates and launch the "fill the blanks" flow.

**Layout:**
1. Header: "Templates" (`title`) + `＋` button (create new template).
2. Optional segmented control: `My Templates` / `Starter Templates` (a few bundled examples: Address, Cable label, Food/Expiry, Price tag, Name badge).
3. `FlatList` of template cards. Each card shows: thumbnail with **editable fields visually highlighted** (use `fieldHi` background swatches on the variable areas), name, field count ("3 fields"), and label size.
4. Primary action on each card: **`Use`** (opens Fill Fields sheet). Secondary (overflow / long-press): Edit, Duplicate, Delete.

**Empty state:** "Templates let you design once and fill in the blanks. Make one from any label."

---

### 6.3 Label Editor (pushed, full-screen) — the heart of the app

**This is the most complex screen. Build it carefully.**

**Layout (portrait):**

```
┌──────────────────────────────────────────────┐
│ ← Back        40×30 mm ▾        Preview  Save  │  ← top bar
├──────────────────────────────────────────────┤
│                                                │
│         ┌────────────────────────┐             │
│         │                        │             │  ← Skia canvas
│         │   [ label canvas ]     │             │     (the label,
│         │                        │             │      shown at the
│         └────────────────────────┘             │      label's real
│                                                │      aspect ratio)
│                                                │
├──────────────────────────────────────────────┤
│  [Aa Text] [▢ Shape] [QR] [Img] [⌗ Barcode]    │  ← insert toolbar
│  [📅 Date]  ...                                 │     (horizontal scroll)
├──────────────────────────────────────────────┤
│   ── contextual inspector for selection ──     │  ← inspector panel
│   (font, size, align, bold; or shape props;    │     (slides up when
│    or "make this an editable field" toggle)    │      something selected)
└──────────────────────────────────────────────┘
```

**Top bar:**
- Back (with unsaved-changes guard).
- **Size selector** (`40×30 mm ▾`) — tapping opens the size sheet. If a label is detected/locked, show a small 🔒 and a "detected" tag; changing size while locked warns the user.
- **Preview** → opens Print Preview modal.
- **Save** → persists to SQLite (as label or, if in template mode, as template).

**Canvas (Skia):**
- Renders the label at its true aspect ratio, centered, with a subtle paper shadow and a dashed bleed/edge guide.
- Supports: select (tap), move (drag), resize (corner handles), rotate (optional), pinch-zoom the *viewport* (not the element) to work precisely.
- Snapping/alignment guides (center, edges) with light haptic feedback.
- Multi-select optional (v2).
- Show rulers / mm readout optionally.

**Insert toolbar (horizontal scroll, RN `ScrollView horizontal`):**
- **Text** — adds a text box; autosize option (text scales to fit box, mirroring niimbluelib).
- **Shape** — rectangle, rounded rect, line, circle.
- **QR code** — content + error-correction options.
- **Barcode** — common 1D symbologies.
- **Image** — pick from library (`expo-image-picker`); auto-converted to 1-bit with selectable dithering.
- **Date** — inserts a **dynamic date element** (see Feature C). Distinct accent color so it reads as "dynamic."
- **Icon** — from a bundled SVG icon set.

**Inspector panel (contextual, slides up on selection):**
- **For text:** font (system fonts via query + bundled), size, bold, align (L/C/R), autosize toggle, line spacing, the text content field, **"Mark as editable field"** toggle (Feature B) + field-name input + field-type (text/number/date).
- **For shapes:** fill (black/white/none for 1-bit), stroke weight, corner radius.
- **For QR/barcode:** content, plus "Mark as editable field."
- **For images:** dithering algorithm picker (threshold / Floyd–Steinberg / etc.), invert, brightness/contrast.
- **For date element:** offset days (`+N`), base date (today/pick), format, label prefix (e.g. "Use by ") — see Feature C.

**Template mode banner:** When editing a *template*, show a persistent accent-colored banner: "Template mode — toggle fields editable in the inspector." Editable elements get an `fieldHi` outline on the canvas.

---

### 6.4 Print Preview (modal)

**Purpose:** Show the *true* 1-bit output and print controls.

**Layout:**
1. Title "Preview".
2. **Rendered 1-bit preview** (post-processed, exactly what will print) on a representation of the physical label. Toggle to compare "Design vs Print output."
3. **Controls:**
   - **Density** slider/stepper (1–5).
   - **Quantity** stepper.
   - **Rotation** (0/90/180/270).
   - **Print direction** (model-dependent — hide if unsupported).
4. **Printer status strip** — connected? right label detected? If size mismatch between design and detected label, show a **warning bar**: "This design is 50×30 but a 40×30 label is loaded."
5. **Big primary `Print` button.** Disabled with reason if not connected / lid open / no paper.
6. During print: progress (rows sent / page x of n) + Cancel.

---

### 6.5 Print (tab) — Printer hub

**Layout:**
1. **Connection card:**
   - Disconnected: "No printer connected" + `Connect` (opens BLE scan modal).
   - Connected: model name + serial (`mono`), big colored status, `Disconnect`.
2. **Status grid** (live from heartbeat): Battery %, Lid (open/closed), Paper (inserted?), RFID (read OK?), and **Detected label** (size + barcode in `mono`, or "Unknown — tap to set").
3. **Defaults card:** default density, default quantity, sound on/off (if supported), auto-shutdown time (if supported).
4. **Test print** button (prints a built-in calibration/test label).

**BLE Scan modal:**
- Scanning spinner + discovered devices `FlatList` (name + signal). Tap to connect. Handle permission prompts (Android 12+ `BLUETOOTH_SCAN`/`BLUETOOTH_CONNECT`/location; iOS `NSBluetoothAlwaysUsageDescription`). Show clear permission-denied recovery state.

---

### 6.6 Settings (tab)

Sections (grouped list, RN `SectionList`):
1. **Remembered Labels** — list of barcode→size associations. Each row: size (`mono`), barcode, last used. Tap → Edit screen (change size, rename, delete). This is how Feature A stays offline.
2. **Defaults** — density, quantity, default new-label size.
3. **Date Presets** — manage reusable expiry presets (e.g. "Leftovers +5", "Best before +14"). Used by Feature C.
4. **Fonts** — manage bundled/added fonts.
5. **Cloud lookup (optional, off by default)** — toggle: "Look up unknown labels online (Niimbot)." Clear copy that this is optional and the only feature that touches the network.
6. **About** — version, open-source licenses (credit niimbluelib/MIT etc.), link to repo, "no account, no tracking" statement.

---

## 7. The Three Priority Features in Detail

### 7.1 Feature A — Label Size Detection (offline-first)

**Behavior:**
- On connect and on paper-insert events (heartbeat), request RFID (`RfidInfo`). Extract **barcode**.
- Query local `remembered_labels` table:
  - **Match found** → auto-set the active label size; show a **non-blocking toast/banner**: "40×30 label detected." Lock the canvas size (with a small unlock affordance).
  - **No match** → show a **"New label detected" bottom sheet**: "We haven't seen this label before. What size is it?" with size presets (common Niimbot sizes) + custom W×H mm entry + shape (rect / rounded / round / cable). On confirm, write to `remembered_labels` and proceed.
  - **Optional cloud** (only if user enabled it) → attempt `getCloudTemplateByOneCode` to pre-fill the size in that sheet (still confirmable, still stored locally afterward).
- If the user designs at a size different from the detected label, **warn at Preview**, don't block (some users intentionally override).

**UI artifacts to design:**
- "Label detected" toast/banner (success color, dismissible, auto-hide).
- "New label detected — set size" bottom sheet (size preset grid + custom entry + shape picker).
- Settings → Remembered Labels list + edit row.
- Canvas size 🔒/unlock indicator.

### 7.2 Feature B — Templates with Editable Fields

**Concept:** A template = a label design + a set of **field bindings**. Any text/QR/barcode/date element can be flagged `editable` with a `fieldName`, `fieldType` (text | number | date), and optional default/placeholder. The **template is never mutated** by filling it; filling produces a brand-new label record. Editing the template later does not change previously generated labels.

**Authoring (in Editor, template mode):**
- Inspector "Mark as editable field" toggle on supported elements.
- Editable elements show an `fieldHi` outline + a small field-name tag on the canvas.
- A "Fields" overview button lists all fields and their order (drag to reorder how they appear in the fill form).

**Using (Fill Fields sheet):**
- Opens from `Use` on a template card.
- Renders a form (one input per editable field), in the authored order:
  - text → `TextInput`
  - number → numeric `TextInput`
  - date → date control with **offset support** (see Feature C)
- Live mini-preview updates as fields change.
- `Preview` → Print Preview; `Save as label` optional.

**UI artifacts to design:**
- Inspector "editable field" controls.
- On-canvas field highlight + tag.
- Fields overview / reorder list.
- Fill Fields sheet (with live preview).
- Template card with highlighted field regions.

### 7.3 Feature C — Smart / Future Dates (expiry)

**Concept:** A **dynamic date element** computes its value at *fill/print time*, not design time. Core control: **offset = +N days from a base date** (default base = today). Perfect for "use by" food labels.

**Date element properties (inspector):**
- **Base date:** Today (default) | Pick a date.
- **Offset:** `+N days` (stepper + quick chips: +1, +3, +5, +7, +14, +30).
- **Format:** e.g. `Jun 12`, `2026-06-12`, `12/06/26` (locale-aware options).
- **Prefix/label:** free text, e.g. `Use by `, `Best before `.
- **Show both dates option:** optionally render prep date + expiry date together.
- When used as an **editable field**, the fill form lets the user adjust `N` per print (so one "Leftovers" template handles 3-day and 14-day items).

**Date Presets (Settings):** named offset presets ("Leftovers +5", "Best before +14") selectable when adding/filling a date element.

**UI artifacts to design:**
- Date element inspector (base + offset chips + format + prefix + both-dates toggle).
- Date control inside Fill Fields (offset adjustable).
- Date Presets manager in Settings.
- Visual treatment so date elements read as "dynamic" (accent color cue in editor; renders as plain text in preview/print).

---

## 8. Data Model

> SQLite via `expo-sqlite`. Engineer-facing, but the designer should understand the entities behind the screens.

```ts
// All ids are uuid strings. Timestamps are epoch ms.

interface LabelSizePreset {
  id: string;
  name: string;        // "40 × 30 mm"
  widthMm: number;
  heightMm: number;
  shape: 'rect' | 'rounded' | 'round' | 'cable';
}

interface RememberedLabel {       // Feature A — barcode → size map
  id: string;
  barcode: string;                // RFID "one-code"
  widthMm: number;
  heightMm: number;
  shape: 'rect' | 'rounded' | 'round' | 'cable';
  name?: string;
  lastUsedAt: number;
  createdAt: number;
}

interface LabelElement {
  id: string;
  type: 'text' | 'shape' | 'qr' | 'barcode' | 'image' | 'date' | 'icon';
  xMm: number; yMm: number; wMm: number; hMm: number;
  rotation: number;
  // type-specific props (font, content, dithering, etc.) in `props`
  props: Record<string, unknown>;

  // Feature B — editable field binding (optional)
  field?: {
    name: string;
    type: 'text' | 'number' | 'date';
    order: number;
    defaultValue?: string;
    placeholder?: string;
  };

  // Feature C — dynamic date config (when type === 'date')
  date?: {
    base: 'today' | string;       // 'today' or ISO date
    offsetDays: number;
    format: string;
    prefix?: string;
    showBoth?: boolean;
  };
}

interface LabelDesign {
  id: string;
  name: string;
  widthMm: number; heightMm: number;
  shape: 'rect' | 'rounded' | 'round' | 'cable';
  elements: LabelElement[];
  isTemplate: boolean;            // true = template, false = concrete label
  sourceTemplateId?: string;      // set when generated from a template
  createdAt: number; updatedAt: number;
}

interface DatePreset {            // Feature C
  id: string; name: string; offsetDays: number; format: string; prefix?: string;
}

interface AppSettings {
  defaultDensity: number;         // 1–5
  defaultQuantity: number;
  defaultSizeId?: string;
  cloudLookupEnabled: boolean;    // default false
  theme: 'system' | 'light' | 'dark';
}

interface PrinterProfile {
  id: string;
  model: string;                  // e.g. "D110", "B1"
  serial: string;
  lastConnectedAt: number;
  // capability flags drive which print options show in UI
  caps: { speed: boolean; cut: boolean; sound: boolean; autoShutdown: boolean };
}
```

---

## 9. Component Library

Reusable RN components to build (all `.tsx`, themed):

| Component | Notes |
|---|---|
| `PrimaryButton` / `SecondaryButton` / `IconButton` | 52-tall primary, full-width variant; loading + disabled states |
| `StatusPill` | colored dot + label; variants ready/warning/danger/idle |
| `Card` | themed surface, radius `lg`, optional press |
| `BottomSheet` | wrap `@gorhom/bottom-sheet`; used for size-set, fill-fields, scan |
| `Toast` / `Banner` | "label detected" success banner; non-blocking |
| `Stepper` | density / quantity / offset days |
| `Chips` | quick offset chips, size presets |
| `SegmentedControl` | My/Starter templates; design/print-output toggle |
| `LabelThumbnail` | renders a `LabelDesign` to a small Skia preview |
| `LabelCanvas` | the editable Skia canvas (selection, drag, resize, snap) |
| `Inspector` | contextual property panel (text/shape/qr/image/date variants) |
| `FieldTag` | on-canvas editable-field marker |
| `DeviceRow` | BLE scan list row (name + RSSI + connect) |
| `EmptyState` | illustration + message + CTA |
| `KeyboardSheet` | sheet that avoids keyboard for text fields |

---

## 10. States, Edge Cases & Errors

Design these explicitly:

- **Not connected** anywhere a print action exists → disabled `Print` with reason + shortcut to connect.
- **Lid open / no paper / RFID read fail** → status surfaces it; Preview's print button explains why it's blocked.
- **Unknown label** → "new label detected" sheet (don't silently guess).
- **Size mismatch** (design size ≠ detected label) → warning bar at Preview, overridable.
- **BLE permission denied** → recovery screen with "open settings" guidance (Android 12+ and iOS differ).
- **Connection lost mid-print** → error state + retry; partial-print warning.
- **Empty states** for Labels, Templates, Remembered Labels.
- **Unsaved changes** guard on Editor back.
- **Model without a capability** (e.g. no speed/cut) → those controls simply absent, not greyed mysteriously.
- **Long text / autosize** behavior visible in preview.
- **Dark mode** parity for every screen.

---

## 11. Build Order

*(For the engineer; the designer can prioritize matching screens.)*

1. **Transport + protocol spike** — port niimbluelib, print one hardcoded bitmap over BLE. De-risks everything.
2. **Canvas → 1-bit rasterization** + Preview + density/quantity/rotation.
3. **Label Editor** (text, shapes, QR, image) on Skia.
4. **SQLite persistence**; Labels home + recent grid.
5. **Templates + editable fields** (Feature B).
6. **Dynamic date element + presets** (Feature C).
7. **RFID read + remembered-labels** (Feature A); Print hub + status; Settings.
8. **Polish:** dark mode, empty/error states, batch print, multi-model capability gating, optional cloud lookup.

---

### Final reminder to Claude Design
Everything here renders as a **React Native (Expo) mobile app**: `StyleSheet.create`, RN core components, `Pressable`/`onPress`, `expo-sqlite`, `@shopify/react-native-skia`, `@expo/vector-icons`, Expo Router. **No HTML, no `<div>`, no Tailwind, no web CSS, no `localStorage`.** If a pattern only exists on the web, translate it to its React Native equivalent before generating any code.
