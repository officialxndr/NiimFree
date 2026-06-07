−/＋ stepper for bounded numbers: print density (1–5), quantity, or date offset days.

```jsx
<Stepper value={density} min={1} max={5} onChange={setDensity} />
<Stepper value={offset} min={0} max={365} onChange={setOffset} formatValue={(n) => `+${n}d`} />
```
