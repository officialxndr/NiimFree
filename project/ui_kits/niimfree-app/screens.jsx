/* NiimFree — main tab screens: Labels (home), Templates, Print hub, Settings. */

const { useState: useStateS } = React;

function LabelsScreen({ printer, detected, onStatusTap, onNewLabel, onOpenLabel, onQuick }) {
  return (
    <div className="screen">
      <div className="apphead">
        <div className="apphead__title">
          <div className="apphead__glyph"><Icon name="tag" size={20} /></div>
          <div className="nf-display" style={{ fontSize: 26 }}>Niim<span style={{ color: "var(--primary)" }}>Free</span></div>
        </div>
        <div onClick={onStatusTap} style={{ cursor: "pointer" }}>
          {printer.connected
            ? <StatusPill status="ready">Ready</StatusPill>
            : <StatusPill>Not connected</StatusPill>}
        </div>
      </div>
      <div className="screen__scroll">
        <Button variant="primary" fullWidth icon="plus" onClick={onNewLabel} style={{ height: 56, fontSize: 17 }}>New label</Button>
        <div className="quickrow" style={{ marginTop: 12 }}>
          <div className="quick" onClick={() => onQuick("blank")}><Icon name="square" /><span>Blank</span></div>
          <div className="quick" onClick={() => onQuick("template")}><Icon name="shapes" /><span>From template</span></div>
          <div className="quick" onClick={() => onQuick("text")}><Icon name="type" /><span>Quick text</span></div>
        </div>

        <div className="section-label"><span>Recent</span></div>
        <div className="grid2">
          {RECENT_LABELS.map((l) => (
            <Card key={l.id} pressable className="labelcard" onClick={() => onOpenLabel(l)} style={{ padding: 12 }}>
              <div style={{ display: "flex", justifyContent: "center", padding: "4px 0 2px" }}>
                <LabelThumbnail widthMm={l.w} heightMm={l.h} shape={l.shape} size={l.shape === "cable" ? 44 : 124} lines={l.lines} />
              </div>
              <div className="labelcard__meta">
                <div>
                  <div className="labelcard__name">{l.name}</div>
                  <div className="labelcard__sub">{l.w}×{l.h} mm</div>
                </div>
                <span className="nf-caption" style={{ fontSize: 11 }}>{l.when}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function TemplateCard({ t, onUse }) {
  return (
    <Card style={{ padding: 14 }}>
      <div style={{ display: "flex", gap: 14 }}>
        <LabelThumbnail widthMm={t.w} heightMm={t.h} shape={t.shape} size={t.shape === "cable" ? 38 : 96} lines={t.lines} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
          <div className="nf-heading">{t.name}</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <Badge variant="accent">{t.fields.length} field{t.fields.length > 1 ? "s" : ""}</Badge>
            <Badge variant="mono">{t.w}×{t.h} mm</Badge>
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ display: "flex", gap: 8 }}>
            <Button size="sm" variant="accent" icon="sparkles" onClick={() => onUse(t)}>Use</Button>
            <IconButton size="sm" variant="tonal" icon="more-horizontal" label="More" />
          </div>
        </div>
      </div>
    </Card>
  );
}

function TemplatesScreen({ onUse }) {
  const [tab, setTab] = useStateS("starter");
  const list = TEMPLATES.filter((t) => t.group === tab);
  return (
    <div className="screen">
      <div className="apphead">
        <div className="nf-title">Templates</div>
        <IconButton variant="tonal" icon="plus" label="New template" />
      </div>
      <div className="screen__scroll">
        <SegmentedControl options={[{ value: "my", label: "My templates" }, { value: "starter", label: "Starter" }]} value={tab} onChange={setTab} style={{ display: "flex", marginBottom: 14 }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {list.map((t) => <TemplateCard key={t.id} t={t} onUse={onUse} />)}
        </div>
        <Banner variant="accent" icon="info" title="Design once, fill the blanks" >
          <span style={{ fontSize: 13 }}>Make a template from any label.</span>
        </Banner>
      </div>
    </div>
  );
}

function PrintScreen({ printer, detected, onConnect, onDisconnect, onSetSize, density, setDensity, quantity, setQuantity }) {
  return (
    <div className="screen">
      <div className="apphead"><div className="nf-title">Print</div></div>
      <div className="screen__scroll">
        {/* Connection card */}
        {printer.connected ? (
          <Card>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div className="stat__ic" style={{ background: "var(--success-bg)", color: "var(--success)", width: 44, height: 44 }}><Icon name="printer" size={22} /></div>
              <div style={{ flex: 1 }}>
                <div className="nf-heading">{printer.model}</div>
                <div className="nf-mono" style={{ color: "var(--text-muted)" }}>{printer.serial}</div>
              </div>
              <StatusPill status="ready">Ready</StatusPill>
            </div>
            <div className="statgrid" style={{ marginTop: 16 }}>
              <Stat ic="battery-medium" k="Battery" v={printer.battery + "%"} tone="success" />
              <Stat ic="package-check" k="Lid" v="Closed" tone="success" />
              <Stat ic="scroll" k="Paper" v="Loaded" tone="success" />
              <Stat ic="radio" k="RFID" v="Read OK" tone="success" />
            </div>
            <div className="listrow" style={{ borderTop: "1px solid var(--border)", marginTop: 8 }}>
              <div className="listrow__ic" style={{ background: "var(--blue-50)", color: "var(--primary)" }}><Icon name="ruler" size={18} /></div>
              <div className="listrow__main">
                <div className="listrow__name">Detected label</div>
                <div className="listrow__sub">{detected ? "Auto-locked from RFID" : "Unknown — tap to set"}</div>
              </div>
              {detected ? <Badge variant="mono">{detected.w}×{detected.h} mm</Badge> : <Button size="sm" variant="secondary" onClick={onSetSize}>Set</Button>}
            </div>
            <Button variant="secondary" fullWidth icon="bluetooth-off" onClick={onDisconnect} style={{ marginTop: 14 }}>Disconnect</Button>
          </Card>
        ) : (
          <Card>
            <div className="nf-empty" style={{ padding: "14px 8px 18px" }}>
              <div className="nf-empty__art"><Icon name="bluetooth" size={34} /></div>
              <div className="nf-empty__title">No printer connected</div>
              <div className="nf-empty__text">Connect over Bluetooth to print. No account needed.</div>
              <Button variant="primary" icon="bluetooth" onClick={onConnect}>Connect printer</Button>
            </div>
          </Card>
        )}

        <div className="section-label"><span>Defaults</span></div>
        <Card>
          <div className="inspector__row"><span className="inspector__label">Density</span><Stepper value={density} min={1} max={5} onChange={setDensity} /></div>
          <div className="inspector__row" style={{ marginTop: 12 }}><span className="inspector__label">Quantity</span><Stepper value={quantity} min={1} max={99} onChange={setQuantity} /></div>
        </Card>

        <Button variant="secondary" fullWidth icon="flask-conical" style={{ marginTop: 14 }} disabled={!printer.connected}>Test print</Button>
      </div>
    </div>
  );
}

function Stat({ ic, k, v, tone }) {
  return (
    <div className="stat">
      <div className="stat__ic" style={tone === "success" ? { background: "var(--success-bg)", color: "var(--success)" } : {}}><Icon name={ic} size={18} /></div>
      <div><div className="stat__k">{k}</div><div className="stat__v">{v}</div></div>
    </div>
  );
}

function SettingsScreen({ cloud, setCloud, sound, setSound }) {
  return (
    <div className="screen">
      <div className="apphead"><div className="nf-title">Settings</div></div>
      <div className="screen__scroll">
        <div className="section-label"><span>Remembered labels</span></div>
        <Card style={{ padding: "4px 14px" }}>
          {[{ s: "40×30 mm", b: "6975728310042", w: "Today" }, { s: "50×30 mm", b: "6975728310059", w: "Yesterday" }, { s: "12×40 cable", b: "6975728310110", w: "Last week" }].map((r, i) => (
            <div className="listrow" key={i}>
              <div className="listrow__ic"><Icon name="ruler" size={18} /></div>
              <div className="listrow__main"><div className="listrow__name" style={{ fontFamily: "var(--font-mono)", fontSize: 13 }}>{r.s}</div><div className="listrow__sub" style={{ fontFamily: "var(--font-mono)" }}>{r.b}</div></div>
              <span className="nf-caption" style={{ fontSize: 11 }}>{r.w}</span>
              <Icon name="chevron-right" size={18} color="var(--text-faint)" />
            </div>
          ))}
        </Card>

        <div className="section-label"><span>Date presets</span></div>
        <Card style={{ padding: "4px 14px" }}>
          {DATE_PRESETS.map((p) => (
            <div className="listrow" key={p.id}>
              <div className="listrow__ic" style={{ background: "var(--violet-100)", color: "var(--accent)" }}><Icon name="calendar-clock" size={18} /></div>
              <div className="listrow__main"><div className="listrow__name">{p.name}</div></div>
              <Badge variant="accent">+{p.offset} days</Badge>
            </div>
          ))}
        </Card>

        <div className="section-label"><span>Privacy</span></div>
        <Card style={{ padding: "4px 14px" }}>
          <div className="listrow">
            <div className="listrow__ic"><Icon name="cloud" size={18} /></div>
            <div className="listrow__main"><div className="listrow__name">Cloud lookup</div><div className="listrow__sub">Look up unknown labels online. Off by default.</div></div>
            <Switch checked={cloud} onChange={setCloud} label="Cloud lookup" />
          </div>
          <div className="listrow">
            <div className="listrow__ic"><Icon name="volume-2" size={18} /></div>
            <div className="listrow__main"><div className="listrow__name">Printer sound</div></div>
            <Switch checked={sound} onChange={setSound} label="Sound" />
          </div>
        </Card>

        <Banner variant="success" icon="shield-check" title="No account · No tracking" >
          <span style={{ fontSize: 13 }}>Everything lives on this device. Open-source under MIT.</span>
        </Banner>
      </div>
    </div>
  );
}

Object.assign(window, { LabelsScreen, TemplatesScreen, PrintScreen, SettingsScreen });
