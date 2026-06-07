Single-line text input. Use `mono` for barcodes / serials / dimensions, `icon` for a leading glyph.

```jsx
<TextField label="Item name" value={name} onChange={setName} placeholder="e.g. Soup" />
<TextField label="Barcode" mono icon="barcode" value={code} onChange={setCode} />
```
