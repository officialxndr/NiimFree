/* Shared UI primitives for the NiimFree app kit.
   These mirror the design-system components but are self-contained (same CSS classes
   from styles.css + Lucide), so the kit runs standalone and stays visually identical. */

const { useRef, useEffect, useState } = React;

function Icon({ name, size = 20, color, strokeWidth, style = {}, className = "" }) {
  const ref = useRef(null);
  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    host.innerHTML = "";
    const i = document.createElement("i");
    i.setAttribute("data-lucide", name);
    host.appendChild(i);
    if (window.lucide) { try { window.lucide.createIcons(); } catch (e) {} }
  }, [name]);
  return <span ref={ref} className={`nf-icon ${className}`} style={{ width: size, height: size, color, ...(strokeWidth ? { "--icon-sw": strokeWidth } : {}), ...style }} />;
}

function Button({ variant = "primary", size = "md", fullWidth, icon, iconRight, disabled, children, onClick, style }) {
  const cls = ["nf-btn", `nf-btn--${variant}`];
  if (size === "sm") cls.push("nf-btn--sm");
  if (size === "lg") cls.push("nf-btn--lg");
  if (fullWidth) cls.push("nf-btn--full");
  const is = size === "sm" ? 16 : size === "lg" ? 22 : 20;
  return (
    <button type="button" className={cls.join(" ")} disabled={disabled} onClick={onClick} style={style}>
      {icon && <Icon name={icon} size={is} />}
      {children != null && <span>{children}</span>}
      {iconRight && <Icon name={iconRight} size={is} />}
    </button>
  );
}

function IconButton({ icon, variant = "plain", size = "md", disabled, label, onClick, style }) {
  const cls = ["nf-iconbtn"];
  if (variant !== "plain") cls.push(`nf-iconbtn--${variant}`);
  if (size === "sm") cls.push("nf-iconbtn--sm");
  return (
    <button type="button" className={cls.join(" ")} disabled={disabled} aria-label={label} onClick={onClick} style={style}>
      <Icon name={icon} size={size === "sm" ? 18 : 22} />
    </button>
  );
}

function StatusPill({ status = "idle", children, icon }) {
  return (
    <span className={`nf-pill ${status !== "idle" ? "nf-pill--" + status : ""}`}>
      {icon ? <Icon name={icon} size={14} /> : <span className="nf-pill__dot" />}
      {children}
    </span>
  );
}

function Card({ children, pressable, flat, onClick, className = "", style }) {
  const cls = ["nf-card"];
  if (flat) cls.push("nf-card--flat");
  if (pressable) cls.push("nf-card--pressable");
  if (className) cls.push(className);
  return <div className={cls.join(" ")} onClick={onClick} style={style}>{children}</div>;
}

function Badge({ children, variant = "neutral", icon }) {
  return (
    <span className={`nf-badge ${variant !== "neutral" ? "nf-badge--" + variant : ""}`}>
      {icon && <Icon name={icon} size={12} />}
      <span>{children}</span>
    </span>
  );
}

function Chip({ children, selected, icon, onClick, style }) {
  return (
    <button type="button" className={`nf-chip ${selected ? "nf-chip--selected" : ""}`} onClick={onClick} style={style}>
      {icon && <Icon name={icon} size={15} />}
      {children}
    </button>
  );
}

function Stepper({ value, min = -Infinity, max = Infinity, step = 1, onChange, formatValue }) {
  return (
    <div className="nf-stepper">
      <button className="nf-stepper__btn" type="button" disabled={value <= min} onClick={() => onChange(Math.max(min, value - step))} aria-label="Decrease"><Icon name="minus" size={18} /></button>
      <div className="nf-stepper__val">{formatValue ? formatValue(value) : value}</div>
      <button className="nf-stepper__btn" type="button" disabled={value >= max} onClick={() => onChange(Math.min(max, value + step))} aria-label="Increase"><Icon name="plus" size={18} /></button>
    </div>
  );
}

function SegmentedControl({ options, value, onChange, style }) {
  return (
    <div className="nf-seg" style={style}>
      {options.map((opt) => {
        const v = typeof opt === "string" ? opt : opt.value;
        const label = typeof opt === "string" ? opt : opt.label;
        return (
          <button key={v} type="button" className={`nf-seg__item ${v === value ? "nf-seg__item--active" : ""}`} onClick={() => onChange(v)} style={{ flex: 1 }}>
            {label}
          </button>
        );
      })}
    </div>
  );
}

function Switch({ checked, onChange, label }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} className={`nf-switch ${checked ? "nf-switch--on" : ""}`} onClick={() => onChange(!checked)}>
      <span className="nf-switch__knob" />
    </button>
  );
}

function TextField({ label, value, onChange, placeholder, icon, mono, hint, inputMode }) {
  return (
    <div className={`nf-field ${mono ? "nf-field--mono" : ""}`}>
      {label && <label className="nf-field__label">{label}</label>}
      <div className="nf-field__control">
        {icon && <Icon name={icon} size={18} />}
        <input value={value} placeholder={placeholder} inputMode={inputMode} onChange={(e) => onChange(e.target.value)} />
      </div>
      {hint && <span className="nf-field__hint">{hint}</span>}
    </div>
  );
}

function Banner({ variant = "neutral", icon, title, children, action }) {
  return (
    <div className={`nf-banner ${variant !== "neutral" ? "nf-banner--" + variant : ""}`}>
      {icon && <Icon name={icon} size={20} />}
      <div className="nf-banner__body">
        {title && <div className="nf-banner__title">{title}</div>}
        {children}
      </div>
      {action}
    </div>
  );
}

function Toast({ icon = "check-circle-2", children }) {
  return <span className="nf-toast"><Icon name={icon} size={18} />{children}</span>;
}

function EmptyState({ icon = "inbox", title, text, action }) {
  return (
    <div className="nf-empty">
      <div className="nf-empty__art"><Icon name={icon} size={34} /></div>
      {title && <div className="nf-empty__title">{title}</div>}
      {text && <div className="nf-empty__text">{text}</div>}
      {action}
    </div>
  );
}

function FieldTag({ children, icon = "pencil" }) {
  return <span className="nf-fieldtag"><Icon name={icon} />{children}</span>;
}

function DeviceRow({ name, meta, rssi, icon = "printer", onClick }) {
  return (
    <div className="nf-devicerow" role="button" onClick={onClick}>
      <div className="nf-devicerow__icon"><Icon name={icon} size={20} /></div>
      <div className="nf-devicerow__main">
        <div className="nf-devicerow__name">{name}</div>
        {meta && <div className="nf-devicerow__meta">{meta}</div>}
      </div>
      {rssi != null && <div className="nf-devicerow__rssi"><Icon name="signal" size={16} />{rssi}</div>}
    </div>
  );
}

function LabelThumbnail({ widthMm = 40, heightMm = 30, shape = "rect", size = 120, lines, children, style }) {
  const ratio = heightMm / widthMm;
  const cls = "nf-thumb" + (shape === "round" ? " nf-thumb--round" : "");
  return (
    <div className={cls} style={{ width: size, height: Math.round(size * ratio), ...style }}>
      <div className="nf-thumb__inner">
        {children}
        {!children && (lines || []).map((l, i) => (
          <div key={i} style={{
            fontSize: l.size || 11, fontWeight: l.strong ? 700 : 500, lineHeight: 1.2, whiteSpace: "nowrap",
            fontFamily: l.mono ? "var(--font-mono)" : "var(--font-sans)",
            ...(l.field ? { background: "var(--field-highlight)", border: "1px dashed var(--accent)", borderRadius: 3, padding: "1px 4px", color: "#15181E" } : {}),
          }}>{l.text}</div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, {
  Icon, Button, IconButton, StatusPill, Card, Badge, Chip, Stepper,
  SegmentedControl, Switch, TextField, Banner, Toast, EmptyState,
  FieldTag, DeviceRow, LabelThumbnail,
});
