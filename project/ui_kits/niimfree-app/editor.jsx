/* NiimFree — Label Editor (pushed full screen): Skia-style canvas + insert toolbar + inspector. */

const { useState: useStateE, useMemo: useMemoE } = React;

const TOOLS = [
  { id: "text", icon: "type", label: "Text" },
  { id: "shape", icon: "square", label: "Shape" },
  { id: "qr", icon: "qr-code", label: "QR" },
  { id: "barcode", icon: "barcode", label: "Barcode" },
  { id: "image", icon: "image", label: "Image" },
  { id: "date", icon: "calendar", label: "Date", accent: true },
  { id: "icon", icon: "shapes", label: "Icon" },
];

function initialElements(design) {
  if (design && design.elements) return design.elements;
  const isCable = design && design.shape === "cable";
  if (isCable) return [{ id: "e1", type: "text", x: 1, y: 14, w: 10, h: 12, text: design.lines?.[0]?.text || "Label", size: 9, align: "center", field: !!design.lines?.[0]?.field }];
  return [
    { id: "e1", type: "text", x: 3, y: 4, w: 34, h: 11, text: (design && design.lines?.[0]?.text) || "Soup", size: 16, bold: true, align: "center" },
    { id: "e2", type: "date", x: 3, y: 18, w: 34, h: 9, prefix: "Use by ", offset: 5, size: 11, align: "center", field: true, fieldName: "Expiry" },
  ];
}

function elementText(el) {
  if (el.type === "date") return (el.prefix || "") + dateFromOffset(el.offset ?? 5);
  if (el.type === "shape") return "";
  if (el.type === "qr") return "";
  return el.text || "";
}

function EditorScreen({ design, locked, onBack, onPreview, onToast }) {
  const w = design?.w || 40, h = design?.h || 30, shape = design?.shape || "rect";
  const [els, setEls] = useStateE(() => initialElements(design));
  const [sel, setSel] = useStateE(els[0]?.id || null);
  const isTemplate = !!design?.isTemplate;

  const scale = Math.min(300 / w, 200 / h, 8);
  const cw = Math.round(w * scale), ch = Math.round(h * scale);
  const selEl = els.find((e) => e.id === sel) || null;

  const update = (patch) => setEls((arr) => arr.map((e) => (e.id === sel ? { ...e, ...patch } : e)));
  const addEl = (type) => {
    const id = "e" + (els.length + 1) + Math.random().toString(36).slice(2, 5);
    const base = { id, x: w * 0.2, y: h * 0.4, w: w * 0.6, h: h * 0.25, size: 12, align: "center" };
    const el = type === "date"
      ? { ...base, type: "date", prefix: "Use by ", offset: 5, field: true, fieldName: "Expiry" }
      : type === "shape" ? { ...base, type: "shape", fill: "black" }
      : type === "qr" ? { ...base, type: "qr", w: h * 0.5, h: h * 0.5 }
      : { ...base, type: "text", text: "Text" };
    setEls((a) => [...a, el]); setSel(id);
    onToast(type === "date" ? "Date element added" : "Element added");
  };

  return (
    <div className="editor">
      <div className="editor__top">
        <IconButton icon="arrow-left" label="Back" onClick={onBack} />
        <div className="editor__size">
          {locked && <Icon name="lock" size={14} />}
          <span>{w}×{h} mm</span>
          <Icon name="chevron-down" size={14} />
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          <Button size="sm" variant="ghost" icon="eye" onClick={onPreview}>Preview</Button>
          <Button size="sm" variant="primary" onClick={() => onToast("Saved")}>Save</Button>
        </div>
      </div>

      {isTemplate && (
        <div style={{ padding: "8px 12px 0" }}>
          <Banner variant="accent" icon="sparkles" title="Template mode">
            <span style={{ fontSize: 12 }}>Toggle fields editable in the inspector.</span>
          </Banner>
        </div>
      )}

      <div className="editor__canvaswrap">
        <div className="canvas" style={{ width: cw, height: ch, borderRadius: shape === "round" ? "50%" : shape === "rounded" ? 10 : 2 }}>
          {els.map((el) => (
            <div
              key={el.id}
              className={`canvas__el ${el.id === sel ? "canvas__el--sel" : ""} ${el.field ? "canvas__el--field" : ""}`}
              style={{
                left: el.x * scale, top: el.y * scale, width: el.w * scale, height: el.h * scale,
                fontSize: (el.size || 12) * (scale / 7), fontWeight: el.bold ? 700 : 500,
                justifyContent: el.align === "left" ? "flex-start" : el.align === "right" ? "flex-end" : "center",
                background: el.type === "shape" ? (el.fill === "black" ? "#111" : el.fill === "white" ? "#fff" : "transparent") : "transparent",
                border: el.type === "shape" && el.fill === "none" ? "1.5px solid #111" : "none",
              }}
              onClick={() => setSel(el.id)}
            >
              {el.type === "qr"
                ? <Icon name="qr-code" size={el.w * scale * 0.9} color="#111" />
                : elementText(el)}
            </div>
          ))}
        </div>
      </div>

      <div className="toolbar">
        {TOOLS.map((t) => (
          <div key={t.id} className={`tool ${t.accent ? "tool--date" : ""}`} onClick={() => addEl(t.id)}>
            <Icon name={t.icon} /><span>{t.label}</span>
          </div>
        ))}
      </div>

      <Inspector el={selEl} update={update} isTemplate={isTemplate} />
    </div>
  );
}

function Inspector({ el, update, isTemplate }) {
  if (!el) return <div className="inspector"><span className="nf-caption">Select an element to edit it.</span></div>;

  return (
    <div className="inspector">
      {el.type === "text" && (
        <React.Fragment>
          <TextField label="Text" value={el.text} onChange={(v) => update({ text: v })} />
          <div className="inspector__row">
            <span className="inspector__label">Size</span>
            <Stepper value={el.size} min={6} max={48} onChange={(v) => update({ size: v })} />
          </div>
          <div className="inspector__row">
            <span className="inspector__label">Align</span>
            <SegmentedControl options={[{ value: "left", label: "L" }, { value: "center", label: "C" }, { value: "right", label: "R" }]} value={el.align} onChange={(v) => update({ align: v })} />
            <button className={`nf-iconbtn ${el.bold ? "nf-iconbtn--tonal" : ""}`} onClick={() => update({ bold: !el.bold })} aria-label="Bold"><Icon name="bold" size={18} /></button>
          </div>
        </React.Fragment>
      )}

      {el.type === "date" && (
        <React.Fragment>
          <TextField label="Prefix" value={el.prefix} onChange={(v) => update({ prefix: v })} />
          <div>
            <span className="nf-field__label" style={{ display: "block", marginBottom: 8 }}>Offset · {dateFromOffset(el.offset)}</span>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {[1, 3, 5, 7, 14, 30].map((n) => (
                <Chip key={n} selected={el.offset === n} onClick={() => update({ offset: n })}>+{n}d</Chip>
              ))}
            </div>
          </div>
        </React.Fragment>
      )}

      {el.type === "shape" && (
        <div className="inspector__row">
          <span className="inspector__label">Fill</span>
          <SegmentedControl options={[{ value: "black", label: "Black" }, { value: "white", label: "White" }, { value: "none", label: "Outline" }]} value={el.fill} onChange={(v) => update({ fill: v })} />
        </div>
      )}

      {el.type === "qr" && <span className="nf-caption">QR content is set per print or bound to a field.</span>}

      {(el.type === "text" || el.type === "date" || el.type === "qr") && (
        <div className="inspector__row" style={{ borderTop: "1px solid var(--border)", paddingTop: 12 }}>
          <div>
            <span className="inspector__label" style={{ display: "flex", alignItems: "center", gap: 6 }}><Icon name="pencil" size={14} color="var(--accent)" />Editable field</span>
            {el.field && <input className="nf-field" style={{ marginTop: 6, border: "1px solid var(--border)", borderRadius: 8, padding: "6px 10px", fontSize: 13, fontFamily: "var(--font-sans)", width: 150 }} value={el.fieldName || ""} placeholder="Field name" onChange={(e) => update({ fieldName: e.target.value })} />}
          </div>
          <Switch checked={!!el.field} onChange={(v) => update({ field: v })} label="Editable field" />
        </div>
      )}
    </div>
  );
}

Object.assign(window, { EditorScreen });
