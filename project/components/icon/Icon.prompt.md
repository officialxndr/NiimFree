Inline Lucide SVG icon — use anywhere the UI needs a glyph (buttons, nav, status, editor toolbar).

```jsx
<Icon name="printer" size={22} />
<Icon name="check-circle-2" size={18} color="var(--success)" />
```

Names follow Lucide (kebab-case). Requires the `lucide` UMD script loaded on the page; the component swaps its placeholder for a real `<svg>` on mount so it renders and screenshots reliably. Size and color are set via CSS, stroke width via `strokeWidth`.
