/* NiimFree — sheets & modals: Connect (BLE scan), Set size, Fill fields, Print preview. */

const { useState: useStateSh, useEffect: useEffectSh } = React;

function Scrim({ children, center, onClose }) {
  return (
    <div className={`scrim ${center ? "scrim--center" : ""}`} onClick={(e) => { if (e.target === e.currentTarget) onClose && onClose(); }}>
      {children}
    </div>
  );
}

/* ---------- Connect (BLE scan) ---------- */
function ConnectSheet({ onClose, onConnect }) {
  const [scanning, setScanning] = useStateSh(true);
  const [shown, setShown] = useStateSh(0);
  useEffectSh(() => {
    const timers = [];
    DEVICES.forEach((_, i) => timers.push(setTimeout(() => setShown(i + 1), 500 + i * 450)));
    timers.push(setTimeout(() => setScanning(false), 500 + DEVICES.length * 450));
    return () => timers.forEach(clearTimeout);
  }, []);
  return (
    <Scrim onClose={onClose}>
      <div className="sheet">
        <div className="sheet__grab" />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div className="sheet__title">Connect printer</div>
          <IconButton icon="x" label="Close" onClick={onClose} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-muted)", fontSize: 13, marginBottom: 14 }}>
          {scanning ? <React.Fragment><span className="spinner" /> Scanning for devices…</React.Fragment> : <React.Fragment><Icon name="check" size={16} color="var(--success)" /> {DEVICES.length} printers found</React.Fragment>}
        </div>
        <div className="sheet__scroll" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {DEVICES.slice(0, shown).map((d) => (
            <DeviceRow key={d.id} name={d.name} meta={d.meta} rssi={d.rssi} onClick={() => onConnect(d)} />
          ))}
        </div>
      </div>
    </Scrim>
  );
}

/* ---------- Set size (new label detected) ---------- */
function SizeSheet({ onClose, onConfirm, detectedBarcode }) {
  const [picked, setPicked] = useStateSh("s1");
  const [shape, setShape] = useStateSh("rect");
  const size = SIZES.find((s) => s.id === picked);
  return (
    <Scrim onClose={onClose}>
      <div className="sheet">
        <div className="sheet__grab" />
        <div className="sheet__title">New label detected</div>
        <div className="nf-body" style={{ color: "var(--text-muted)", marginBottom: 4 }}>We haven't seen this label before. What size is it?</div>
        {detectedBarcode && <div className="nf-mono" style={{ color: "var(--text-faint)", fontSize: 12, marginBottom: 14 }}>{detectedBarcode}</div>}
        <div className="sheet__scroll">
          <div className="sizegrid">
            {SIZES.map((s) => (
              <div key={s.id} className={`sizeopt ${picked === s.id ? "sizeopt--on" : ""}`} onClick={() => { setPicked(s.id); setShape(s.shape); }}>
                <LabelThumbnail widthMm={s.w} heightMm={s.h} shape={s.shape} size={s.shape === "cable" ? 20 : 40} />
                <div><div className="sizeopt__name">{s.name}</div><div className="sizeopt__dim">{s.shape}</div></div>
              </div>
            ))}
          </div>
          <div className="section-label"><span>Shape</span></div>
          <SegmentedControl options={[{ value: "rect", label: "Rect" }, { value: "rounded", label: "Rounded" }, { value: "round", label: "Round" }, { value: "cable", label: "Cable" }]} value={shape} onChange={setShape} style={{ display: "flex" }} />
        </div>
        <Button variant="primary" fullWidth icon="check" style={{ marginTop: 16 }} onClick={() => onConfirm(size)}>Remember &amp; continue</Button>
      </div>
    </Scrim>
  );
}

/* ---------- Fill fields ---------- */
function FillFieldsSheet({ template, onClose, onPrint }) {
  const [vals, setVals] = useStateSh(() => {
    const v = {};
    template.fields.forEach((f) => { v[f.name] = f.type === "date" ? (f.offset ?? 5) : (f.default || ""); });
    return v;
  });
  const setV = (k, val) => setVals((p) => ({ ...p, [k]: val }));

  // build preview lines from the template, substituting filled values
  const previewLines = template.lines.map((ln) => {
    if (!ln.field) return ln;
    const f = template.fields.find((ff) => ff.type === "date") && /use by|jun|exp/i.test(ln.text) ? template.fields.find((ff) => ff.type === "date") : null;
    if (f && f.type === "date") return { ...ln, text: "Use by " + dateFromOffset(vals[f.name]) };
    // first text field maps to the first highlighted line
    const tf = template.fields.find((ff) => ff.type !== "date");
    if (tf) return { ...ln, text: vals[tf.name] || ln.text };
    return ln;
  });

  return (
    <Scrim onClose={onClose}>
      <div className="sheet">
        <div className="sheet__grab" />
        <div className="sheet__title">{template.name}</div>
        <div style={{ display: "flex", justifyContent: "center", margin: "8px 0 16px" }}>
          <LabelThumbnail widthMm={template.w} heightMm={template.h} shape={template.shape} size={template.shape === "cable" ? 60 : 170} lines={previewLines} />
        </div>
        <div className="sheet__scroll" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {template.fields.map((f) => (
            f.type === "date" ? (
              <div key={f.name}>
                <span className="nf-field__label" style={{ display: "block", marginBottom: 8 }}>{f.name} · Use by {dateFromOffset(vals[f.name])}</span>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {[1, 3, 5, 7, 14, 30].map((n) => <Chip key={n} selected={vals[f.name] === n} onClick={() => setV(f.name, n)}>+{n}d</Chip>)}
                </div>
              </div>
            ) : (
              <TextField key={f.name} label={f.name} value={vals[f.name]} onChange={(v) => setV(f.name, v)} inputMode={f.type === "number" ? "numeric" : undefined} />
            )
          ))}
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <Button variant="secondary" fullWidth onClick={onClose}>Cancel</Button>
          <Button variant="primary" fullWidth icon="eye" onClick={() => onPrint(previewLines)}>Preview</Button>
        </div>
      </div>
    </Scrim>
  );
}

/* ---------- Print preview (1-bit) ---------- */
function PreviewModal({ design, lines, printer, detected, density, setDensity, quantity, setQuantity, onClose, onToast }) {
  const [mode, setMode] = useStateSh("print");
  const [printing, setPrinting] = useStateSh(0); // 0 idle, 1..100 progress
  const w = design?.w || 40, h = design?.h || 30, shape = design?.shape || "rect";
  const scale = Math.min(220 / w, 150 / h, 6);
  const mismatch = detected && (detected.w !== w || detected.h !== h);
  const canPrint = printer.connected;

  useEffectSh(() => {
    if (printing > 0 && printing < 100) {
      const t = setTimeout(() => setPrinting((p) => Math.min(100, p + 12)), 130);
      return () => clearTimeout(t);
    }
    if (printing >= 100) {
      const t = setTimeout(() => { onToast("Printed " + quantity + "× " + w + "×" + h); onClose(); }, 500);
      return () => clearTimeout(t);
    }
  }, [printing]);

  const showLines = lines || design?.lines || [{ text: "Soup", strong: true, size: 16 }, { text: "Use by Jun 12", size: 11 }];

  return (
    <Scrim center onClose={printing ? null : onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div className="nf-title" style={{ fontSize: 19 }}>Preview</div>
          <IconButton icon="x" label="Close" onClick={onClose} disabled={!!printing} />
        </div>

        <SegmentedControl options={[{ value: "design", label: "Design" }, { value: "print", label: "Print output" }]} value={mode} onChange={setMode} style={{ display: "flex", marginBottom: 14 }} />

        <div style={{ display: "flex", justifyContent: "center", padding: "6px 0 14px" }}>
          <div className="preview-label" style={{ width: Math.round(w * scale), height: Math.round(h * scale), borderRadius: shape === "round" ? "50%" : 2 }}>
            <div style={{ position: "absolute", inset: "10%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3 }}>
              {showLines.map((l, i) => (
                <div key={i} style={{
                  fontFamily: l.mono ? "var(--font-mono)" : "var(--font-sans)",
                  fontWeight: l.strong ? 800 : 600, fontSize: (l.size || 11) * (scale / 6) * 1.1,
                  color: "#000", filter: mode === "print" ? "contrast(4) grayscale(1)" : "none",
                  WebkitFontSmoothing: mode === "print" ? "none" : "auto", whiteSpace: "nowrap",
                }}>{l.text}</div>
              ))}
            </div>
          </div>
        </div>

        {mismatch && <Banner variant="warning" icon="alert-triangle" title="Size mismatch"><span style={{ fontSize: 12 }}>Design is {w}×{h} but a {detected.w}×{detected.h} label is loaded.</span></Banner>}

        {printing > 0 ? (
          <div style={{ marginTop: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 600, marginBottom: 6 }}><span>Printing…</span><span className="nf-mono">{Math.round(printing)}%</span></div>
            <div style={{ height: 8, borderRadius: 4, background: "var(--surface-alt)", overflow: "hidden" }}><div style={{ height: "100%", width: printing + "%", background: "var(--primary)", transition: "width .12s" }} /></div>
          </div>
        ) : (
          <React.Fragment>
            <div className="inspector__row" style={{ marginTop: 6 }}><span className="inspector__label">Density</span><Stepper value={density} min={1} max={5} onChange={setDensity} /></div>
            <div className="inspector__row" style={{ marginTop: 12 }}><span className="inspector__label">Quantity</span><Stepper value={quantity} min={1} max={99} onChange={setQuantity} /></div>
            <Button variant="primary" fullWidth icon={canPrint ? "printer" : "bluetooth-off"} style={{ marginTop: 16 }} disabled={!canPrint} onClick={() => setPrinting(1)}>
              {canPrint ? "Print" : "Connect a printer to print"}
            </Button>
          </React.Fragment>
        )}
      </div>
    </Scrim>
  );
}

Object.assign(window, { Scrim, ConnectSheet, SizeSheet, FillFieldsSheet, PreviewModal });
