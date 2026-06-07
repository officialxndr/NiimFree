Miniature physical-label render at the label's true aspect ratio (black on white). Use in the Labels grid and Template cards. Pass `field: true` on a line to show it as an editable region.

```jsx
<LabelThumbnail widthMm={40} heightMm={30} size={120}
  lines={[{text:"Soup", strong:true, size:14}, {text:"Use by Jun 12", field:true}]} />
<LabelThumbnail widthMm={12} heightMm={40} shape="cable" size={60} />
```
