Segmented control for 2–3 short, mutually exclusive options.

```jsx
<SegmentedControl
  options={["My templates", "Starter"]}
  value={tab}
  onChange={setTab}
/>
<SegmentedControl options={[{value:"design",label:"Design"},{value:"print",label:"Print output"}]} value={mode} onChange={setMode} />
```
