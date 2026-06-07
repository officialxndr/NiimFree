# NiimFree — Design System

> A free, open-source, subscription-free alternative client for **Niimbot** thermal label printers.
> Local-first. No account. No cloud dependency. Works offline.

NiimFree replaces the official Niimbot app, which gates basic functionality (templates, fonts,
features) behind accounts and subscriptions, phones home, and ties label sizing to a cloud lookup.
NiimFree is fully local: open app → connect printer → print.

**Working name:** `NiimFree` (placeholder, easy to rename — the brand string is pulled from a constant,
never hard-coded). The reference open-source protocol project is **NiimBlue / niimbluelib** (MIT).

---

## Source material

- **Product/build spec:** `uploads/niimbot-app-design-spec.md` — the full design & build specification this
  system is derived from (information architecture, screens, the three priority features, data model,
  component list, color/type/spacing tokens).
- **Reference projects** (engineering, for context): NiimBlue / niimbluelib (MultiMote, MIT) — the
  source-of-truth protocol; niimprint (Python) & niimbotjs (Node) protocol cross-references; the NIIMBOT
  Community Wiki (`printers.niim.blue`).

> ⚠️ The product itself is a **React Native (Expo) mobile app** (`StyleSheet.create`, RN core components,
> `@shopify/react-native-skia` canvas, `@expo/vector-icons`, `expo-sqlite`). This *design system* is the
> **web (HTML/React) translation** of that mobile design so it can render in the Design System tooling.
> Components here are thin React + CSS recreations that match the app's look 1:1; they are **not** the
> production RN code. When building production, port the visual tokens & rules, not these files verbatim.

---

## What's in here (manifest)

| Path | What |
|---|---|
| `styles.css` | Global entry point — `@import`s only. Consumers link this one file. |
| `tokens/colors.css` | Brand/accent/status ramps + semantic aliases, light **and** dark themes. |
| `tokens/typography.css` | Inter (UI) + JetBrains Mono (data) scale: display/title/heading/body/caption/mono. |
| `tokens/spacing.css` | 4-pt spacing scale, tap-target & button-height minimums. |
| `tokens/radii.css` | Corner radii + soft elevation shadow set. |
| `tokens/fonts.css` | `@import` of Inter + JetBrains Mono webfonts (Google Fonts CDN). |
| `tokens/base.css` | Element reset + `.nf-*` text-style helper classes. |
| `tokens/components.css` | Class-based styling for every component (consumed by the JSX). |
| `guidelines/*.card.html` | Foundation specimen cards (Design System tab). |
| `components/<group>/` | Reusable React UI primitives (Icon, Button, forms, feedback, display). |
| `ui_kits/niimfree-app/` | Interactive phone-framed recreation of the NiimFree app. |
| `SKILL.md` | Agent-Skill manifest for downstream use. |

### Components
- `components/icon/` — **Icon** (Lucide inline-SVG)
- `components/buttons/` — **Button**, **IconButton**
- `components/forms/` — **TextField**, **Stepper**, **SegmentedControl**, **Switch**, **Chip**
- `components/feedback/` — **StatusPill**, **Banner**, **Toast**, **EmptyState**
- `components/display/` — **Card**, **Badge**, **LabelThumbnail**, **FieldTag**, **DeviceRow**

### UI kits
- `ui_kits/niimfree-app/` — Labels (home), Print hub, Label Editor, Print Preview, Templates.

---

## Design language

Clean, utilitarian, slightly playful — a maker/tinkerer tool that still feels polished, like a
"well-made hardware companion app." High legibility (the app is mostly about text on labels), generous
tap targets, confident primary actions. Light + dark parity is mandatory.

---

## CONTENT FUNDAMENTALS

**Voice.** Plain, direct, reassuring. The app sells *freedom and trust* (no account, works offline), so
copy is calm and concrete, never hypey.

- **Person:** addresses the user as **you**; the app refers to itself rarely and never as "I". System
  status is stated as fact: "40×30 label detected", "No printer connected".
- **Tense/mood:** imperative for actions ("Connect printer", "Print", "Set size"), present tense for
  status ("Printer ready", "Lid open").
- **Casing:** **Sentence case** everywhere — buttons, titles, menu items ("New label", not "New Label").
  Screen/section titles are short nouns ("Templates", "Remembered labels", "Preview").
- **Length:** terse. Buttons are 1–2 words ("Print", "Use template", "New label"). Helper text is one
  short sentence ("Auto-computed at print time.").
- **Numbers & units:** dimensions, serials and barcodes are **monospace** and use `×` (not "x"):
  `40×30 mm`, `B1-2401-0837`. Density 1–5, quantity as plain integers.
- **Reassurance copy:** lean into the value props — "No account, ever.", "Works offline.",
  "We haven't seen this label before — what size is it?". Empty states are friendly and actionable
  ("No labels yet — create your first one.").
- **Emoji:** **not used** in UI chrome. Icons carry meaning instead (Lucide). The spec's tab emoji are
  shorthand for the doc, not the product.
- **Errors:** explain *why* and offer the fix ("Can't print — lid is open", "Bluetooth permission needed —
  open Settings"). Never blame the user; never silently guess (unknown label → ask once, remember forever).

---

## VISUAL FOUNDATIONS

**Color.** A near-white app ground (`--bg #F7F8FA`) with white cards. One **primary blue** (`#2B6BF3`)
for all the load-bearing actions (connect, print, primary CTAs). A **violet accent** (`#7C4DFF`) is
reserved exclusively for *templates and dynamic/editable fields* — when you see violet, it means "this
is variable." Three status colors: **green** (ready / label detected), **amber** (lid open / low
battery), **red** (disconnected / error). A warm **field-highlight** (`#FFF3D6`) marks editable template
regions on the canvas. Dark theme is a true dark (`--bg #0E1116`) with lifted surfaces; every token has a
dark counterpart. Imagery is minimal — this is a chrome-and-data app, not a photographic one; the only
"imagery" is the 1-bit label renders themselves (pure black on white, hard threshold, no anti-aliasing —
that's what actually prints).

**Type.** **Inter** for all UI text; **JetBrains Mono** for data (dimensions, serials, barcodes). Six
roles: display 28/700, title 22/700, heading 17/600, body 15/400, caption 13/400, mono 13/500. Display &
title carry slight negative tracking (-0.02em). Line-height ≈ 1.35×. No condensed or decorative faces.

**Spacing & layout.** 4-pt base (4/8/12/16/24/32/48). Screens are single-column, edge-padded 16px.
Cards stack with 12–16px gaps. Bottom tab bar is the fixed nav; sheets slide up from the bottom and round
their **top** corners (radius xl, 24). Primary buttons are full-width, 52 tall. Minimum tap target 44×44.

**Corners & cards.** Radii: sm 8, md 12 (buttons, inputs), lg 16 (**cards**), xl 24 (**sheets**), pill 999
(status pills, chips). Cards = white surface, 1px `--border` hairline, radius lg, and a **soft low
shadow** (`--shadow-card`: tiny 2px + 8px ambient). Nothing is heavily shadowed; elevation is subtle.
Pressable cards lift to `--shadow-pop` on hover and scale to 0.99 on press.

**Borders & shadows.** Hairline 1px borders in `--border` define most containment; shadows are soft and
low-contrast (never harsh). No glows, no neon. The floating "new label" FAB-style primary uses a tinted
blue shadow (`--shadow-fab`).

**Backgrounds.** Flat color only — **no gradients**, no textures, no patterns, no blur/glass. Surfaces are
solid. The only translucency is the modal **scrim** (`--scrim`, ~45% ink) behind sheets and dialogs.

**Motion.** Restrained and purposeful. Sheets slide up ~250ms ease-out. The "label detected" banner
slides in with a subtle scale pop. Connection-status color changes crossfade. Button press scales to
0.98. **No** gratuitous canvas animation, no infinite loops, no bounce on content.

**Interaction states.** Hover = a small darken (`--overlay-press`) or one step up the ramp
(primary→primary-press). Press = scale-down (0.94–0.98) plus the darker tone. Focus on inputs = primary
border + a 3px soft blue ring. Disabled = 0.45 opacity, no pointer events.

**Iconography vibe.** Lucide outline, 2px stroke, 20–24px — clean and friendly without being childish.
Active nav/state icons take the primary tint; everything else is `--text`.

---

## ICONOGRAPHY

The production app uses **`@expo/vector-icons`** (primarily Ionicons / MaterialIcons) — icon **fonts**, not
inline SVG. The spec also explicitly lists **`lucide-react-native`** as an option.

In this web design system we standardize on **Lucide** (the web sibling of `lucide-react-native`), loaded
from CDN (`lucide@0.469.0` UMD) and rendered as **inline `<svg>`** via the `Icon` component. This was a
deliberate choice: Lucide injects real SVG nodes (so it renders and screenshots reliably in tooling),
matches the clean 2px-outline utilitarian aesthetic, and is a faithful stand-in for the RN icon set.

- **Style:** outline, 2px stroke, square 20–24px. Filled variants only for "on" states (e.g.
  `check-circle-2`).
- **Color:** `--text` by default; `--primary` for active nav/selected; status colors inside status chips.
- **No emoji** in product chrome. **No** Unicode-glyph icons. `×` (multiplication sign) is used as a
  typographic separator in dimensions (`40×30 mm`), not as an icon.
- **Common names:** `tags` (Labels), `layout-grid`/`shapes` (Templates), `printer` (Print), `settings`
  (Settings); editor: `type`, `square`, `qr-code`, `barcode`, `image`, `calendar`; status: `bluetooth`,
  `battery-medium`, `lock`, `check-circle-2`, `alert-triangle`.

> ⚠️ **Substitution flag:** for a fully offline production build, swap Lucide for the actual
> `@expo/vector-icons` glyphs (or bundle `lucide-react-native`). Icon *names* map closely between Lucide
> and Ionicons but are not identical — verify per icon.

---

## Fonts — substitution note

Inter and JetBrains Mono are loaded from the **Google Fonts CDN** (`tokens/fonts.css`), not bundled as
local `.woff2`. The compiler therefore reports **0 `@font-face` rules** (the rules live in Google's remote
CSS). Fonts render correctly everywhere; for a self-hosted/offline build, drop real `.woff2` files into
the project and replace the `@import` with local `@font-face` declarations.

---

## The three priority features (why the UI is shaped this way)

- **A — Label size detection (offline-first):** the printer reports an RFID barcode but **not** the
  physical size. NiimFree keeps a local barcode→size table: known → auto-lock the canvas + "label
  detected" toast; unknown → "new label detected, what size?" sheet, then remembers it forever.
- **B — Templates with editable fields:** a template = a design + field bindings. Any text/QR/barcode/date
  element can be flagged editable (violet `--accent` cue + `--field-highlight`). Filling a template makes a
  *new* label; the template is never mutated.
- **C — Smart / future dates:** a dynamic date element computes its value at print time (`base + N days`),
  perfect for "Use by" food labels. Renders as plain text in the 1-bit print output.
