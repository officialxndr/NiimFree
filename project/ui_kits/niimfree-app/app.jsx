/* NiimFree app — shell: status bar, screen router, bottom tabs, sheet/modal orchestration. */

const { useState: useStateA, useEffect: useEffectA } = React;

const TABS = [
  { id: "labels", icon: "tags", label: "Labels" },
  { id: "templates", icon: "layout-grid", label: "Templates" },
  { id: "print", icon: "printer", label: "Print" },
  { id: "settings", icon: "settings", label: "Settings" },
];

function App() {
  const [tab, setTab] = useStateA("labels");
  const [printer, setPrinter] = useStateA({ connected: false, model: PRINTER.model, serial: PRINTER.serial, battery: PRINTER.battery, caps: PRINTER.caps });
  const [detected, setDetected] = useStateA(null);
  const [editor, setEditor] = useStateA(null); // { design, locked }
  const [sheet, setSheet] = useStateA(null);    // 'connect' | 'size' | {fill} | {preview}
  const [toast, setToast] = useStateA(null);
  const [density, setDensity] = useStateA(3);
  const [quantity, setQuantity] = useStateA(1);
  const [cloud, setCloud] = useStateA(false);
  const [sound, setSound] = useStateA(true);

  const showToast = (msg) => setToast({ id: Date.now(), msg });
  useEffectA(() => { if (!toast) return; const t = setTimeout(() => setToast(null), 2200); return () => clearTimeout(t); }, [toast]);

  const connectDevice = (d) => {
    setPrinter((p) => ({ ...p, connected: true, model: d.model, serial: d.meta }));
    setSheet("size"); // label inserted, unknown → "new label detected"
  };
  const confirmSize = (s) => {
    setDetected({ w: s.w, h: s.h, shape: s.shape });
    setSheet(null);
    showToast(s.w + "×" + s.h + " label detected");
  };

  const openEditor = (design) => setEditor({ design, locked: !!detected && detected.w === design.w && detected.h === design.h });
  const newLabel = () => openEditor({ w: detected?.w || 40, h: detected?.h || 30, shape: detected?.shape || "rect" });
  const openLabel = (l) => openEditor({ ...l, isTemplate: false });
  const useTemplate = (t) => setSheet({ fill: t });

  // ----- editor push view -----
  if (editor) {
    return (
      <Device toast={toast} sheet={sheet}
        sheetEl={renderSheet()}>
        <EditorScreen
          design={editor.design}
          locked={editor.locked}
          onBack={() => setEditor(null)}
          onPreview={() => setSheet({ preview: { design: editor.design } })}
          onToast={showToast}
        />
      </Device>
    );
  }

  function renderScreen() {
    switch (tab) {
      case "labels":
        return <LabelsScreen printer={printer} detected={detected} onStatusTap={() => setTab("print")} onNewLabel={newLabel} onOpenLabel={openLabel} onQuick={(k) => k === "template" ? setTab("templates") : newLabel()} />;
      case "templates":
        return <TemplatesScreen onUse={useTemplate} />;
      case "print":
        return <PrintScreen printer={printer} detected={detected} onConnect={() => setSheet("connect")} onDisconnect={() => { setPrinter((p) => ({ ...p, connected: false })); setDetected(null); }} onSetSize={() => setSheet("size")} density={density} setDensity={setDensity} quantity={quantity} setQuantity={setQuantity} />;
      case "settings":
        return <SettingsScreen cloud={cloud} setCloud={setCloud} sound={sound} setSound={setSound} />;
      default: return null;
    }
  }

  function renderSheet() {
    if (sheet === "connect") return <ConnectSheet onClose={() => setSheet(null)} onConnect={connectDevice} />;
    if (sheet === "size") return <SizeSheet onClose={() => setSheet(null)} onConfirm={confirmSize} detectedBarcode="6975728310042" />;
    if (sheet && sheet.fill) return <FillFieldsSheet template={sheet.fill} onClose={() => setSheet(null)} onPrint={(lines) => setSheet({ preview: { design: sheet.fill, lines } })} />;
    if (sheet && sheet.preview) return <PreviewModal design={sheet.preview.design} lines={sheet.preview.lines} printer={printer} detected={detected} density={density} setDensity={setDensity} quantity={quantity} setQuantity={setQuantity} onClose={() => setSheet(null)} onToast={showToast} />;
    return null;
  }

  return (
    <Device toast={toast} sheet={sheet} sheetEl={renderSheet()}>
      {renderScreen()}
      <div className="tabbar">
        {TABS.map((t) => (
          <button key={t.id} className={`tab ${tab === t.id ? "tab--active" : ""}`} onClick={() => setTab(t.id)}>
            <Icon name={t.icon} size={24} strokeWidth={tab === t.id ? 2.4 : 2} />
            <span>{t.label}</span>
          </button>
        ))}
      </div>
    </Device>
  );
}

/* Phone bezel + status bar wrapper. */
function Device({ children, toast, sheetEl }) {
  return (
    <div className="stage">
      <div className="device">
        <div className="notch" />
        <div className="phone">
          <div className="statusbar">
            <span>9:41</span>
            <div className="statusbar__right">
              <Icon name="signal" size={16} />
              <Icon name="wifi" size={16} />
              <Icon name="battery-full" size={18} />
            </div>
          </div>
          {children}
          {toast && <div className="toastwrap"><Toast>{toast.msg}</Toast></div>}
          {sheetEl}
          <div className="home-indicator" />
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
