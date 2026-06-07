# HANDOFF — NiimFree Design System

Last updated: 2026-06-07. This file is the pickup point for continuing the project in VS Code / Claude Code.

---

## 1. What this project is

A **design system** for **NiimFree** — a free, local-first, open-source alternative client for Niimbot
label printers. The product itself is a **React Native (Expo) mobile app** (see
`uploads/niimbot-app-design-spec.md`, the source of truth). This repo is the **web (HTML/React + CSS)
translation** of that design so it can render in design tooling and seed prototypes. The components here
are thin React + CSS recreations — **not** production RN code.

Read **`readme.md`** first — it has the full brand guide (content voice, visual foundations, iconography,
manifest). Read **`uploads/niimbot-app-design-spec.md`** for the product spec (screens, the 3 priority
features, data model, component list).

---

## 2. How the compiler works (important — affects how you build & test)

An automated compiler watches the project and regenerates three files you must **never** edit by hand:
`_ds_bundle.js`, `_ds_manifest.json`, `_adherence.oxlintrc.json`. Discovery is by **file content +
sibling relationships**, not folder names.

- **Global CSS entry:** `styles.css` at root — must be **`@import` lines only**. Everything it transitively
  imports ships to consumers. Tokens = any `--*` custom property under `:root` (or `[data-theme="dark"]`).
- **A component** = `<Name>.jsx` (PascalCase, with `export function <Name>`) **+** a sibling `<Name>.d.ts`
  in the same dir. Add `<Name>.prompt.md` and one `@dsCard`-tagged `.html` per directory.
- **Design System tab cards** = any `.html` whose **first line** is
  `<!-- @dsCard group="…" viewport="WxH" name="…" subtitle="…" -->`.
- **Starting points** (consumer picker) = opt-in tags: `@startingPoint …` in a component's `.d.ts` JSDoc,
  or `<!-- @startingPoint … -->` as line 1 of a screen `.html`.
- The component **namespace** is `window.NiimFreeDesignSystem_8ff8e4`. Read it in card HTML as
  `const { Button } = window.NiimFreeDesignSystem_8ff8e4`. Run the `check_design_system` step (in tooling)
  to re-confirm the namespace if it ever changes.

### Two quirks I hit (will save you time)
1. **`_ds_bundle.js` is only (re)built at a turn boundary / `done`-style load.** During active iteration a
   plain reload of a bundle-dependent card 404s the bundle and shows a black page. This is expected — it
   resolves when the page is loaded fresh (e.g. opening it in the Design System tab, or in a normal
   browser via a dev server). Component **cards** depend on the bundle; the **UI kit is self-contained**
   and does not.
2. **html-to-image screenshots drop `position:absolute` overlays** (the phone sheets/modals). The overlays
   render fine in a real browser — verify them by interacting, not by screenshot.

In VS Code you don't have the compiler. To preview: serve the folder (`npx serve` or Live Server) and open
the card/kit HTML. For component cards you'll need a bundle — easiest is to keep using the design tool to
regenerate it, or write a tiny esbuild step that bundles `components/**/*.jsx` to
`window.NiimFreeDesignSystem_8ff8e4` (UMD-ish global). The **UI kit runs with no build** (Babel-in-browser).

---

## 3. File map

```
styles.css                      # @import-only entry
tokens/
  fonts.css                     # Inter + JetBrains Mono via Google Fonts CDN
  colors.css                    # base ramps + semantic aliases; light + [data-theme="dark"]
  typography.css                # display/title/heading/body/caption/mono scale
  spacing.css                   # 4-pt scale, tap-target/button-height mins
  radii.css                     # radii + elevation shadows (light + dark)
  base.css                      # reset + .nf-* text helpers
  components.css                # ALL component styling (class-based, token-driven)
guidelines/*.card.html          # foundation + brand specimen cards (Colors/Type/Spacing/Brand)
components/
  icon/      Icon.{jsx,d.ts,prompt.md} + icon.card.html
  buttons/   Button, IconButton (+ buttons.card.html)
  forms/     TextField, Stepper, SegmentedControl, Switch, Chip (+ forms.card.html)
  feedback/  StatusPill, Banner, Toast, EmptyState (+ feedback.card.html)
  display/   Card, Badge, LabelThumbnail, FieldTag, DeviceRow (+ display.card.html)
ui_kits/niimfree-app/           # interactive phone-framed app recreation (self-contained)
  index.html app.css ui.jsx data.jsx screens.jsx editor.jsx sheets.jsx app.jsx README.md
readme.md                       # full design guide + manifest
SKILL.md                        # Agent-Skill manifest (for Claude Code skill use)
uploads/niimbot-app-design-spec.md   # PRODUCT SPEC — source of truth
```

---

## 4. Conventions (match these when adding things)

- **Components** are class-based: styling lives in `tokens/components.css` under `.nf-*` classes; the JSX is
  thin and only toggles classes / passes props. No CSS-in-JS, no npm deps, React only. Reference design
  tokens (`var(--primary)` etc.) — never hard-code hex.
- **Icons:** Lucide. In a component use the local `Icon` (`<Icon name="printer" size={20} />`). Card HTML and
  the kit load `lucide@0.469.0` UMD and the Icon swaps `<i data-lucide>` for inline `<svg>`.
- **Multiple Babel `<script>` files don't share scope** — the kit shares via `Object.assign(window, {...})`
  at the end of each file, and destructures React hooks under unique names per file (`useStateA`,
  `useStateE`, …) to avoid any global collision. Keep that pattern.
- **Badges/pills/flex rows with `gap`:** wrap multi-node text children in a single `<span>` (a gapped
  flex container otherwise spaces out `{w}×{h} mm` into "40 × 30  mm"). Already fixed in `Badge`.
- **Voice:** sentence case, plain & reassuring, second person ("you"), no emoji, `×` for dimensions,
  monospace for data (barcodes/serials/sizes).
- **Every new token needs a dark-theme value** under `[data-theme="dark"]`.
- **New component checklist:** `<Name>.jsx` (`export function`), `<Name>.d.ts` (props interface;
  add `@startingPoint` JSDoc if it should seed designs), `<Name>.prompt.md`, add styles to
  `components.css`, and show it in that directory's `*.card.html`.

---

## 5. Status

### Done
- Full token layer (colors light+dark, type, spacing, radii, elevation) — 118 tokens.
- 17 components (icon/buttons/forms/feedback/display) with d.ts + prompt + cards.
- 18 `@dsCard` specimen/component cards; 4 starting points (Button, Icon, Card, EmptyState).
- Interactive UI kit: Labels, Templates, Print hub, Label Editor, Print Preview, Settings, plus the
  Connect / Set-size / Fill-fields / Preview overlays. All three priority features represented.
- `readme.md`, kit `README.md`, `SKILL.md`.
- Compiler reports **no issues**.

### Not done / next up (good tasks for Claude Code)
1. **Real assets the user owes us:** bundled font `.woff2` (replace the CDN `@import` in `tokens/fonts.css`
   with local `@font-face`); a real logo to replace the placeholder `Niim`**`Free`** wordmark in
   `guidelines/wordmark.card.html`, `ui_kits/.../app.css` (`.apphead__glyph`) and `screens.jsx`.
2. **Icon decision:** confirm Lucide vs pinning to actual `@expo/vector-icons` (Ionicons/MaterialIcons).
   If switching, remap names (close but not identical).
3. **More primitives from the spec's component list** not yet built: `Dialog`, `Tooltip`, `Tabs`, `Avatar`,
   `Checkbox`, `Radio`, `BottomSheet` (as a reusable component, currently inlined in the kit),
   `KeyboardSheet`. Follow the new-component checklist.
4. **More screen states** the spec calls for: BLE permission-denied recovery, connection-lost-mid-print,
   unsaved-changes guard, empty states for Templates/Remembered Labels, Edit-remembered-label screen,
   size-mismatch override path end-to-end.
5. **Dark mode in the kit:** the tokens support it; add a theme toggle and set `data-theme="dark"` on the
   phone root to demo parity.
6. **Starting points:** consider tagging `ui_kits/niimfree-app/index.html` as a `@startingPoint` screen
   (note: a file's line 1 can hold either `@dsCard` or `@startingPoint`, not both — if you want both a
   product card and a screen starting point, add a second thin HTML).
7. **Slide template:** none was provided, so none was built. Add `ui_kits` slides only if the user supplies
   a deck style.
8. **Accessibility & RTL pass**, and wiring real interactions if any of this graduates toward production.

---

## 6. Pointers
- Brand/voice/visual rules → `readme.md`.
- Product behavior, data model, the 3 features → `uploads/niimbot-app-design-spec.md`.
- How a component is wired → any `components/<group>/<Name>.{jsx,d.ts,prompt.md}` + that dir's `*.card.html`.
- How the app fits together → `ui_kits/niimfree-app/README.md` then `app.jsx`.
