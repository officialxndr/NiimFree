/* Miniature label render — physical black-on-white at the label's real aspect ratio.
   Pass `lines` for quick text, or `children` for custom content. `shape` round → circle.
   `fields` (array of indices) highlights editable regions for template thumbnails. */

export function LabelThumbnail({
  widthMm = 40,
  heightMm = 30,
  shape = "rect",
  size = 120,
  lines,
  children,
  style,
}) {
  const ratio = heightMm / widthMm;
  const w = size;
  const h = Math.round(size * ratio);
  const cls = "nf-thumb" + (shape === "round" ? " nf-thumb--round" : "");
  return (
    <div className={cls} style={{ width: w, height: h, ...style }}>
      <div className="nf-thumb__inner">
        {children}
        {!children &&
          (lines || []).map((l, i) => {
            const isField = l.field;
            const baseStyle = {
              fontSize: l.size || 11,
              fontWeight: l.strong ? 700 : 500,
              fontFamily: l.mono ? "var(--font-mono)" : "var(--font-sans)",
              lineHeight: 1.2,
              whiteSpace: "nowrap",
              ...(isField
                ? {
                    background: "var(--field-highlight)",
                    border: "1px dashed var(--accent)",
                    borderRadius: 3,
                    padding: "1px 4px",
                    color: "#15181E",
                  }
                : {}),
            };
            return (
              <div key={i} style={baseStyle}>
                {l.text}
              </div>
            );
          })}
      </div>
    </div>
  );
}
