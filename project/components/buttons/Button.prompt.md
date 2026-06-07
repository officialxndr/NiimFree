Primary tap action. Full-width primary on mobile; secondary/ghost for lower-emphasis actions, danger for destructive.

```jsx
<Button variant="primary" icon="printer" fullWidth>Print</Button>
<Button variant="secondary" icon="plus">New label</Button>
<Button variant="ghost" size="sm">Cancel</Button>
<Button variant="danger" disabled>Disconnect</Button>
```

Variants: primary, accent (templates/dynamic), secondary, ghost, danger. Sizes: sm (40), md (52), lg (56). `icon`/`iconRight` take Lucide names.
