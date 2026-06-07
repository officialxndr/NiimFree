---
name: niimfree-design
description: Use this skill to generate well-branded interfaces and assets for NiimFree (a free, local-first, open-source Niimbot label-printer app), either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the README.md file within this skill, and explore the other available files.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

## Quick map
- `readme.md` — full design guide: context, content voice, visual foundations, iconography, manifest.
- `styles.css` — the one stylesheet to link; `@import`s every token + font + component CSS.
- `tokens/` — colors (light+dark), typography, spacing, radii, components.css.
- `components/<group>/` — React primitives (`<Name>.jsx` + `.d.ts` + `.prompt.md`).
- `guidelines/*.card.html` — foundation + brand specimen cards.
- `ui_kits/niimfree-app/` — interactive phone-framed app recreation.

## Working notes
- **Fonts:** Inter (UI) + JetBrains Mono (data), via Google Fonts CDN. Swap for bundled `.woff2` for offline.
- **Icons:** Lucide (web sibling of `lucide-react-native`), inline SVG. Production app uses `@expo/vector-icons`.
- **Themes:** every token has a dark counterpart under `[data-theme="dark"]`.
- **Voice:** sentence case, plain & reassuring, "you", no emoji, `×` for dimensions, mono for data.
- The product is React Native (Expo); these web files are a visual translation, not production RN code.
