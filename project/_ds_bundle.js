/* @ds-bundle: {"format":3,"namespace":"NiimFreeDesignSystem_8ff8e4","components":[{"name":"Button","sourcePath":"components/buttons/Button.jsx"},{"name":"IconButton","sourcePath":"components/buttons/IconButton.jsx"},{"name":"Badge","sourcePath":"components/display/Badge.jsx"},{"name":"Card","sourcePath":"components/display/Card.jsx"},{"name":"DeviceRow","sourcePath":"components/display/DeviceRow.jsx"},{"name":"FieldTag","sourcePath":"components/display/FieldTag.jsx"},{"name":"LabelThumbnail","sourcePath":"components/display/LabelThumbnail.jsx"},{"name":"Banner","sourcePath":"components/feedback/Banner.jsx"},{"name":"EmptyState","sourcePath":"components/feedback/EmptyState.jsx"},{"name":"StatusPill","sourcePath":"components/feedback/StatusPill.jsx"},{"name":"Toast","sourcePath":"components/feedback/Toast.jsx"},{"name":"Chip","sourcePath":"components/forms/Chip.jsx"},{"name":"SegmentedControl","sourcePath":"components/forms/SegmentedControl.jsx"},{"name":"Stepper","sourcePath":"components/forms/Stepper.jsx"},{"name":"Switch","sourcePath":"components/forms/Switch.jsx"},{"name":"TextField","sourcePath":"components/forms/TextField.jsx"},{"name":"Icon","sourcePath":"components/icon/Icon.jsx"}],"sourceHashes":{"components/buttons/Button.jsx":"f0ae68003453","components/buttons/IconButton.jsx":"3627d8fb8a62","components/display/Badge.jsx":"f27ccdb4b858","components/display/Card.jsx":"162a74cb41a6","components/display/DeviceRow.jsx":"205a1b409bd8","components/display/FieldTag.jsx":"45233aeb9147","components/display/LabelThumbnail.jsx":"f6a5ec31e36b","components/feedback/Banner.jsx":"568ef951b63f","components/feedback/EmptyState.jsx":"2703a416ac9a","components/feedback/StatusPill.jsx":"1fd125d20ee5","components/feedback/Toast.jsx":"aca9f0983c2f","components/forms/Chip.jsx":"3acf9c4b8262","components/forms/SegmentedControl.jsx":"9e046c9640dd","components/forms/Stepper.jsx":"d1fea86aea4b","components/forms/Switch.jsx":"edcb28014434","components/forms/TextField.jsx":"8f404684902c","components/icon/Icon.jsx":"fce7026e803c","ui_kits/niimfree-app/app.jsx":"d39d11d3a618","ui_kits/niimfree-app/data.jsx":"e2bdf46e604c","ui_kits/niimfree-app/editor.jsx":"a12fb12cc6b6","ui_kits/niimfree-app/screens.jsx":"ec08807c5d26","ui_kits/niimfree-app/sheets.jsx":"38f246453453","ui_kits/niimfree-app/ui.jsx":"ee383018eaf3"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.NiimFreeDesignSystem_8ff8e4 = window.NiimFreeDesignSystem_8ff8e4 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/display/Card.jsx
try { (() => {
/* Themed surface card. `pressable` for tappable list/grid cards, `flat` to drop the shadow. */

function Card({
  children,
  pressable = false,
  flat = false,
  onClick,
  className = "",
  style
}) {
  const cls = ["nf-card"];
  if (flat) cls.push("nf-card--flat");
  if (pressable) cls.push("nf-card--pressable");
  if (className) cls.push(className);
  return /*#__PURE__*/React.createElement("div", {
    className: cls.join(" "),
    onClick: onClick,
    style: style
  }, children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/display/Card.jsx", error: String((e && e.message) || e) }); }

// components/display/LabelThumbnail.jsx
try { (() => {
/* Miniature label render — physical black-on-white at the label's real aspect ratio.
   Pass `lines` for quick text, or `children` for custom content. `shape` round → circle.
   `fields` (array of indices) highlights editable regions for template thumbnails. */

function LabelThumbnail({
  widthMm = 40,
  heightMm = 30,
  shape = "rect",
  size = 120,
  lines,
  children,
  style
}) {
  const ratio = heightMm / widthMm;
  const w = size;
  const h = Math.round(size * ratio);
  const cls = "nf-thumb" + (shape === "round" ? " nf-thumb--round" : "");
  return /*#__PURE__*/React.createElement("div", {
    className: cls,
    style: {
      width: w,
      height: h,
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "nf-thumb__inner"
  }, children, !children && (lines || []).map((l, i) => {
    const isField = l.field;
    const baseStyle = {
      fontSize: l.size || 11,
      fontWeight: l.strong ? 700 : 500,
      fontFamily: l.mono ? "var(--font-mono)" : "var(--font-sans)",
      lineHeight: 1.2,
      whiteSpace: "nowrap",
      ...(isField ? {
        background: "var(--field-highlight)",
        border: "1px dashed var(--accent)",
        borderRadius: 3,
        padding: "1px 4px",
        color: "#15181E"
      } : {})
    };
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      style: baseStyle
    }, l.text);
  })));
}
Object.assign(__ds_scope, { LabelThumbnail });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/display/LabelThumbnail.jsx", error: String((e && e.message) || e) }); }

// components/forms/SegmentedControl.jsx
try { (() => {
/* Segmented control — 2–3 short options. Controlled.
   `options` is string[] or { value, label }[]. */

function SegmentedControl({
  options,
  value,
  onChange,
  className = ""
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: `nf-seg ${className}`,
    role: "tablist"
  }, options.map(opt => {
    const v = typeof opt === "string" ? opt : opt.value;
    const label = typeof opt === "string" ? opt : opt.label;
    const active = v === value;
    return /*#__PURE__*/React.createElement("button", {
      key: v,
      type: "button",
      role: "tab",
      "aria-selected": active,
      className: `nf-seg__item ${active ? "nf-seg__item--active" : ""}`,
      onClick: () => onChange && onChange(v)
    }, label);
  }));
}
Object.assign(__ds_scope, { SegmentedControl });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/SegmentedControl.jsx", error: String((e && e.message) || e) }); }

// components/forms/Switch.jsx
try { (() => {
/* On/off switch. Controlled — green when on, per the status palette. */

function Switch({
  checked = false,
  onChange,
  label,
  disabled = false
}) {
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    role: "switch",
    "aria-checked": checked,
    "aria-label": label,
    disabled: disabled,
    className: `nf-switch ${checked ? "nf-switch--on" : ""}`,
    onClick: () => onChange && onChange(!checked)
  }, /*#__PURE__*/React.createElement("span", {
    className: "nf-switch__knob"
  }));
}
Object.assign(__ds_scope, { Switch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Switch.jsx", error: String((e && e.message) || e) }); }

// components/icon/Icon.jsx
try { (() => {
/* Icon — renders a Lucide glyph as inline SVG.
   Relies on the global `lucide` UMD script being present on the page; it swaps the
   placeholder <i data-lucide> for a real <svg> on mount, so screenshots capture it. */

const {
  useRef,
  useEffect
} = React;
function Icon({
  name,
  size = 20,
  strokeWidth,
  color,
  className = "",
  style = {}
}) {
  const ref = useRef(null);
  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    host.innerHTML = "";
    const placeholder = document.createElement("i");
    placeholder.setAttribute("data-lucide", name);
    host.appendChild(placeholder);
    if (typeof window !== "undefined" && window.lucide && window.lucide.createIcons) {
      try {
        window.lucide.createIcons();
      } catch (e) {/* lucide not ready yet */}
    }
  }, [name]);
  const resolved = {
    width: size,
    height: size,
    color,
    ...(strokeWidth ? {
      "--icon-sw": strokeWidth
    } : {}),
    ...style
  };
  return /*#__PURE__*/React.createElement("span", {
    ref: ref,
    className: `nf-icon ${className}`,
    style: resolved
  });
}
Object.assign(__ds_scope, { Icon });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/icon/Icon.jsx", error: String((e && e.message) || e) }); }

// components/buttons/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Primary action button. Variants: primary / accent / secondary / ghost / danger.
   Sizes sm / md / lg. Optional leading + trailing icons (Lucide names). */

function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  icon,
  iconRight,
  disabled = false,
  children,
  onClick,
  type = "button",
  className = "",
  ...rest
}) {
  const cls = ["nf-btn", `nf-btn--${variant}`];
  if (size === "sm") cls.push("nf-btn--sm");
  if (size === "lg") cls.push("nf-btn--lg");
  if (fullWidth) cls.push("nf-btn--full");
  if (className) cls.push(className);
  const iconSize = size === "sm" ? 16 : size === "lg" ? 22 : 20;
  return /*#__PURE__*/React.createElement("button", _extends({
    type: type,
    className: cls.join(" "),
    disabled: disabled,
    onClick: onClick
  }, rest), icon && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: iconSize
  }), children != null && /*#__PURE__*/React.createElement("span", null, children), iconRight && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: iconRight,
    size: iconSize
  }));
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/buttons/Button.jsx", error: String((e && e.message) || e) }); }

// components/buttons/IconButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Icon-only button (44×44 tap target). Variants: plain / tonal / solid. */

function IconButton({
  icon,
  variant = "plain",
  size = "md",
  disabled = false,
  label,
  onClick,
  className = "",
  ...rest
}) {
  const cls = ["nf-iconbtn"];
  if (variant !== "plain") cls.push(`nf-iconbtn--${variant}`);
  if (size === "sm") cls.push("nf-iconbtn--sm");
  if (className) cls.push(className);
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    className: cls.join(" "),
    disabled: disabled,
    "aria-label": label,
    onClick: onClick
  }, rest), /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: size === "sm" ? 18 : 22
  }));
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/buttons/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/display/Badge.jsx
try { (() => {
/* Small status/count badge. `mono` variant for dimensions. */

function Badge({
  children,
  variant = "neutral",
  icon
}) {
  const cls = variant !== "neutral" ? `nf-badge--${variant}` : "";
  return /*#__PURE__*/React.createElement("span", {
    className: `nf-badge ${cls}`
  }, icon && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 12
  }), /*#__PURE__*/React.createElement("span", null, children));
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/display/Badge.jsx", error: String((e && e.message) || e) }); }

// components/display/DeviceRow.jsx
try { (() => {
/* BLE scan-list row — printer name + serial + signal. */

function DeviceRow({
  name,
  meta,
  rssi,
  icon = "printer",
  onClick
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "nf-devicerow",
    onClick: onClick,
    role: "button"
  }, /*#__PURE__*/React.createElement("div", {
    className: "nf-devicerow__icon"
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 20
  })), /*#__PURE__*/React.createElement("div", {
    className: "nf-devicerow__main"
  }, /*#__PURE__*/React.createElement("div", {
    className: "nf-devicerow__name"
  }, name), meta && /*#__PURE__*/React.createElement("div", {
    className: "nf-devicerow__meta"
  }, meta)), rssi != null && /*#__PURE__*/React.createElement("div", {
    className: "nf-devicerow__rssi"
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "signal",
    size: 16
  }), rssi));
}
Object.assign(__ds_scope, { DeviceRow });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/display/DeviceRow.jsx", error: String((e && e.message) || e) }); }

// components/display/FieldTag.jsx
try { (() => {
/* On-canvas marker for an editable template field (Feature B). */

function FieldTag({
  children,
  icon = "pencil"
}) {
  return /*#__PURE__*/React.createElement("span", {
    className: "nf-fieldtag"
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon
  }), children);
}
Object.assign(__ds_scope, { FieldTag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/display/FieldTag.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Banner.jsx
try { (() => {
/* Non-blocking inline banner — "label detected", size-mismatch warning, template-mode note. */

function Banner({
  variant = "neutral",
  icon,
  title,
  children,
  action,
  className = ""
}) {
  const cls = variant !== "neutral" ? `nf-banner--${variant}` : "";
  return /*#__PURE__*/React.createElement("div", {
    className: `nf-banner ${cls} ${className}`
  }, icon && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 20
  }), /*#__PURE__*/React.createElement("div", {
    className: "nf-banner__body"
  }, title && /*#__PURE__*/React.createElement("div", {
    className: "nf-banner__title"
  }, title), children), action);
}
Object.assign(__ds_scope, { Banner });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Banner.jsx", error: String((e && e.message) || e) }); }

// components/feedback/EmptyState.jsx
try { (() => {
/* Friendly empty state — illustration glyph + message + CTA. */

function EmptyState({
  icon = "inbox",
  title,
  text,
  action
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "nf-empty"
  }, /*#__PURE__*/React.createElement("div", {
    className: "nf-empty__art"
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 34
  })), title && /*#__PURE__*/React.createElement("div", {
    className: "nf-empty__title"
  }, title), text && /*#__PURE__*/React.createElement("div", {
    className: "nf-empty__text"
  }, text), action);
}
Object.assign(__ds_scope, { EmptyState });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/EmptyState.jsx", error: String((e && e.message) || e) }); }

// components/feedback/StatusPill.jsx
try { (() => {
/* Colored status pill — printer/connection state. */

function StatusPill({
  status = "idle",
  children,
  icon
}) {
  const cls = status !== "idle" ? `nf-pill--${status}` : "";
  return /*#__PURE__*/React.createElement("span", {
    className: `nf-pill ${cls}`
  }, icon ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 14
  }) : /*#__PURE__*/React.createElement("span", {
    className: "nf-pill__dot"
  }), children);
}
Object.assign(__ds_scope, { StatusPill });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/StatusPill.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Toast.jsx
try { (() => {
/* Transient dark toast — "Saved", "40×30 label detected". */

function Toast({
  icon = "check-circle-2",
  children
}) {
  return /*#__PURE__*/React.createElement("span", {
    className: "nf-toast"
  }, icon && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 18
  }), children);
}
Object.assign(__ds_scope, { Toast });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Toast.jsx", error: String((e && e.message) || e) }); }

// components/forms/Chip.jsx
try { (() => {
/* Pill chip — quick offset chips, size presets, filters. Toggleable when `selected` driven. */

function Chip({
  children,
  selected = false,
  icon,
  onClick,
  className = ""
}) {
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: `nf-chip ${selected ? "nf-chip--selected" : ""} ${className}`,
    onClick: onClick,
    "aria-pressed": selected
  }, icon && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 15
  }), children);
}
Object.assign(__ds_scope, { Chip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Chip.jsx", error: String((e && e.message) || e) }); }

// components/forms/Stepper.jsx
try { (() => {
/* −/＋ stepper for density, quantity, offset days. Controlled. */

function Stepper({
  value,
  min = -Infinity,
  max = Infinity,
  step = 1,
  onChange,
  formatValue,
  ariaLabel
}) {
  const dec = () => onChange && onChange(Math.max(min, value - step));
  const inc = () => onChange && onChange(Math.min(max, value + step));
  return /*#__PURE__*/React.createElement("div", {
    className: "nf-stepper",
    role: "group",
    "aria-label": ariaLabel
  }, /*#__PURE__*/React.createElement("button", {
    className: "nf-stepper__btn",
    onClick: dec,
    disabled: value <= min,
    "aria-label": "Decrease",
    type: "button"
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "minus",
    size: 18
  })), /*#__PURE__*/React.createElement("div", {
    className: "nf-stepper__val"
  }, formatValue ? formatValue(value) : value), /*#__PURE__*/React.createElement("button", {
    className: "nf-stepper__btn",
    onClick: inc,
    disabled: value >= max,
    "aria-label": "Increase",
    type: "button"
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "plus",
    size: 18
  })));
}
Object.assign(__ds_scope, { Stepper });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Stepper.jsx", error: String((e && e.message) || e) }); }

// components/forms/TextField.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Single-line text input with optional label, leading icon, mono mode and hint. */

function TextField({
  label,
  value,
  onChange,
  placeholder,
  icon,
  mono = false,
  hint,
  type = "text",
  inputMode,
  disabled = false,
  className = "",
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: `nf-field ${mono ? "nf-field--mono" : ""} ${className}`
  }, label && /*#__PURE__*/React.createElement("label", {
    className: "nf-field__label"
  }, label), /*#__PURE__*/React.createElement("div", {
    className: "nf-field__control"
  }, icon && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 18
  }), /*#__PURE__*/React.createElement("input", _extends({
    type: type,
    inputMode: inputMode,
    value: value,
    placeholder: placeholder,
    disabled: disabled,
    onChange: e => onChange && onChange(e.target.value)
  }, rest))), hint && /*#__PURE__*/React.createElement("span", {
    className: "nf-field__hint"
  }, hint));
}
Object.assign(__ds_scope, { TextField });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/TextField.jsx", error: String((e && e.message) || e) }); }

// ui_kits/niimfree-app/app.jsx
try { (() => {
/* NiimFree app — shell: status bar, screen router, bottom tabs, sheet/modal orchestration. */

const {
  useState: useStateA,
  useEffect: useEffectA
} = React;
const TABS = [{
  id: "labels",
  icon: "tags",
  label: "Labels"
}, {
  id: "templates",
  icon: "layout-grid",
  label: "Templates"
}, {
  id: "print",
  icon: "printer",
  label: "Print"
}, {
  id: "settings",
  icon: "settings",
  label: "Settings"
}];
function App() {
  const [tab, setTab] = useStateA("labels");
  const [printer, setPrinter] = useStateA({
    connected: false,
    model: PRINTER.model,
    serial: PRINTER.serial,
    battery: PRINTER.battery,
    caps: PRINTER.caps
  });
  const [detected, setDetected] = useStateA(null);
  const [editor, setEditor] = useStateA(null); // { design, locked }
  const [sheet, setSheet] = useStateA(null); // 'connect' | 'size' | {fill} | {preview}
  const [toast, setToast] = useStateA(null);
  const [density, setDensity] = useStateA(3);
  const [quantity, setQuantity] = useStateA(1);
  const [cloud, setCloud] = useStateA(false);
  const [sound, setSound] = useStateA(true);
  const showToast = msg => setToast({
    id: Date.now(),
    msg
  });
  useEffectA(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);
  const connectDevice = d => {
    setPrinter(p => ({
      ...p,
      connected: true,
      model: d.model,
      serial: d.meta
    }));
    setSheet("size"); // label inserted, unknown → "new label detected"
  };
  const confirmSize = s => {
    setDetected({
      w: s.w,
      h: s.h,
      shape: s.shape
    });
    setSheet(null);
    showToast(s.w + "×" + s.h + " label detected");
  };
  const openEditor = design => setEditor({
    design,
    locked: !!detected && detected.w === design.w && detected.h === design.h
  });
  const newLabel = () => openEditor({
    w: detected?.w || 40,
    h: detected?.h || 30,
    shape: detected?.shape || "rect"
  });
  const openLabel = l => openEditor({
    ...l,
    isTemplate: false
  });
  const useTemplate = t => setSheet({
    fill: t
  });

  // ----- editor push view -----
  if (editor) {
    return /*#__PURE__*/React.createElement(Device, {
      toast: toast,
      sheet: sheet,
      sheetEl: renderSheet()
    }, /*#__PURE__*/React.createElement(EditorScreen, {
      design: editor.design,
      locked: editor.locked,
      onBack: () => setEditor(null),
      onPreview: () => setSheet({
        preview: {
          design: editor.design
        }
      }),
      onToast: showToast
    }));
  }
  function renderScreen() {
    switch (tab) {
      case "labels":
        return /*#__PURE__*/React.createElement(LabelsScreen, {
          printer: printer,
          detected: detected,
          onStatusTap: () => setTab("print"),
          onNewLabel: newLabel,
          onOpenLabel: openLabel,
          onQuick: k => k === "template" ? setTab("templates") : newLabel()
        });
      case "templates":
        return /*#__PURE__*/React.createElement(TemplatesScreen, {
          onUse: useTemplate
        });
      case "print":
        return /*#__PURE__*/React.createElement(PrintScreen, {
          printer: printer,
          detected: detected,
          onConnect: () => setSheet("connect"),
          onDisconnect: () => {
            setPrinter(p => ({
              ...p,
              connected: false
            }));
            setDetected(null);
          },
          onSetSize: () => setSheet("size"),
          density: density,
          setDensity: setDensity,
          quantity: quantity,
          setQuantity: setQuantity
        });
      case "settings":
        return /*#__PURE__*/React.createElement(SettingsScreen, {
          cloud: cloud,
          setCloud: setCloud,
          sound: sound,
          setSound: setSound
        });
      default:
        return null;
    }
  }
  function renderSheet() {
    if (sheet === "connect") return /*#__PURE__*/React.createElement(ConnectSheet, {
      onClose: () => setSheet(null),
      onConnect: connectDevice
    });
    if (sheet === "size") return /*#__PURE__*/React.createElement(SizeSheet, {
      onClose: () => setSheet(null),
      onConfirm: confirmSize,
      detectedBarcode: "6975728310042"
    });
    if (sheet && sheet.fill) return /*#__PURE__*/React.createElement(FillFieldsSheet, {
      template: sheet.fill,
      onClose: () => setSheet(null),
      onPrint: lines => setSheet({
        preview: {
          design: sheet.fill,
          lines
        }
      })
    });
    if (sheet && sheet.preview) return /*#__PURE__*/React.createElement(PreviewModal, {
      design: sheet.preview.design,
      lines: sheet.preview.lines,
      printer: printer,
      detected: detected,
      density: density,
      setDensity: setDensity,
      quantity: quantity,
      setQuantity: setQuantity,
      onClose: () => setSheet(null),
      onToast: showToast
    });
    return null;
  }
  return /*#__PURE__*/React.createElement(Device, {
    toast: toast,
    sheet: sheet,
    sheetEl: renderSheet()
  }, renderScreen(), /*#__PURE__*/React.createElement("div", {
    className: "tabbar"
  }, TABS.map(t => /*#__PURE__*/React.createElement("button", {
    key: t.id,
    className: `tab ${tab === t.id ? "tab--active" : ""}`,
    onClick: () => setTab(t.id)
  }, /*#__PURE__*/React.createElement(Icon, {
    name: t.icon,
    size: 24,
    strokeWidth: tab === t.id ? 2.4 : 2
  }), /*#__PURE__*/React.createElement("span", null, t.label)))));
}

/* Phone bezel + status bar wrapper. */
function Device({
  children,
  toast,
  sheetEl
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "stage"
  }, /*#__PURE__*/React.createElement("div", {
    className: "device"
  }, /*#__PURE__*/React.createElement("div", {
    className: "notch"
  }), /*#__PURE__*/React.createElement("div", {
    className: "phone"
  }, /*#__PURE__*/React.createElement("div", {
    className: "statusbar"
  }, /*#__PURE__*/React.createElement("span", null, "9:41"), /*#__PURE__*/React.createElement("div", {
    className: "statusbar__right"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "signal",
    size: 16
  }), /*#__PURE__*/React.createElement(Icon, {
    name: "wifi",
    size: 16
  }), /*#__PURE__*/React.createElement(Icon, {
    name: "battery-full",
    size: 18
  }))), children, toast && /*#__PURE__*/React.createElement("div", {
    className: "toastwrap"
  }, /*#__PURE__*/React.createElement(Toast, null, toast.msg)), sheetEl, /*#__PURE__*/React.createElement("div", {
    className: "home-indicator"
  }))));
}
ReactDOM.createRoot(document.getElementById("root")).render(/*#__PURE__*/React.createElement(App, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/niimfree-app/app.jsx", error: String((e && e.message) || e) }); }

// ui_kits/niimfree-app/data.jsx
try { (() => {
/* Mock data for the NiimFree app kit — common Niimbot label sizes, recent labels,
   starter templates, BLE devices, and the connected-printer profile. */

const SIZES = [{
  id: "s1",
  name: "40 × 30 mm",
  w: 40,
  h: 30,
  shape: "rect"
}, {
  id: "s2",
  name: "50 × 30 mm",
  w: 50,
  h: 30,
  shape: "rect"
}, {
  id: "s3",
  name: "30 × 15 mm",
  w: 30,
  h: 15,
  shape: "rect"
}, {
  id: "s4",
  name: "50 × 80 mm",
  w: 50,
  h: 80,
  shape: "rect"
}, {
  id: "s5",
  name: "Ø 40 mm",
  w: 40,
  h: 40,
  shape: "round"
}, {
  id: "s6",
  name: "12 × 40 mm cable",
  w: 12,
  h: 40,
  shape: "cable"
}];
const RECENT_LABELS = [{
  id: "l1",
  name: "Soup",
  w: 40,
  h: 30,
  shape: "rect",
  when: "2h ago",
  lines: [{
    text: "Soup",
    strong: true,
    size: 15
  }, {
    text: "Use by Jun 12",
    size: 11
  }]
}, {
  id: "l2",
  name: "Rack A · Port 24",
  w: 50,
  h: 30,
  shape: "rect",
  when: "Yesterday",
  lines: [{
    text: "Server rack A",
    strong: true,
    size: 12
  }, {
    text: "PORT 24",
    mono: true,
    size: 11
  }]
}, {
  id: "l3",
  name: "USB-C",
  w: 12,
  h: 40,
  shape: "cable",
  when: "2 days ago",
  lines: [{
    text: "USB-C",
    size: 9
  }]
}, {
  id: "l4",
  name: "Sourdough",
  w: 40,
  h: 30,
  shape: "rect",
  when: "3 days ago",
  lines: [{
    text: "Sourdough",
    strong: true,
    size: 13
  }, {
    text: "Best before Jun 20",
    size: 10
  }]
}, {
  id: "l5",
  name: "Olive oil",
  w: 30,
  h: 15,
  shape: "rect",
  when: "Last week",
  lines: [{
    text: "Olive oil",
    strong: true,
    size: 11
  }]
}, {
  id: "l6",
  name: "Cat meds",
  w: 40,
  h: 30,
  shape: "rect",
  when: "Last week",
  lines: [{
    text: "Cat meds",
    strong: true,
    size: 13
  }, {
    text: "2× daily",
    size: 10
  }]
}];
const TEMPLATES = [{
  id: "t1",
  name: "Leftovers",
  group: "starter",
  w: 40,
  h: 30,
  shape: "rect",
  fields: [{
    name: "Item name",
    type: "text",
    default: "Soup"
  }, {
    name: "Expiry",
    type: "date",
    offset: 5
  }],
  lines: [{
    text: "Soup",
    strong: true,
    size: 15
  }, {
    text: "Use by Jun 12",
    field: true,
    size: 11
  }]
}, {
  id: "t2",
  name: "Cable label",
  group: "starter",
  w: 12,
  h: 40,
  shape: "cable",
  fields: [{
    name: "Label",
    type: "text",
    default: "USB-C"
  }],
  lines: [{
    text: "USB-C",
    field: true,
    size: 9
  }]
}, {
  id: "t3",
  name: "Address",
  group: "starter",
  w: 50,
  h: 30,
  shape: "rect",
  fields: [{
    name: "Name",
    type: "text",
    default: "A. Müller"
  }, {
    name: "Street",
    type: "text",
    default: "12 Maple Rd"
  }, {
    name: "City",
    type: "text",
    default: "Bristol BS1"
  }],
  lines: [{
    text: "A. Müller",
    strong: true,
    size: 12,
    field: true
  }, {
    text: "12 Maple Rd",
    size: 10,
    field: true
  }, {
    text: "Bristol BS1",
    size: 10,
    field: true
  }]
}, {
  id: "t4",
  name: "Price tag",
  group: "my",
  w: 30,
  h: 15,
  shape: "rect",
  fields: [{
    name: "Item",
    type: "text",
    default: "Mug"
  }, {
    name: "Price",
    type: "number",
    default: "9"
  }],
  lines: [{
    text: "Mug",
    strong: true,
    size: 10,
    field: true
  }, {
    text: "£9",
    size: 10,
    field: true
  }]
}, {
  id: "t5",
  name: "Name badge",
  group: "my",
  w: 50,
  h: 30,
  shape: "rect",
  fields: [{
    name: "Name",
    type: "text",
    default: "Sam"
  }],
  lines: [{
    text: "HELLO",
    size: 9
  }, {
    text: "Sam",
    strong: true,
    size: 16,
    field: true
  }]
}];
const DEVICES = [{
  id: "d1",
  name: "D110-8F2A",
  meta: "B1-2401-0837",
  rssi: "-58 dBm",
  model: "D110"
}, {
  id: "d2",
  name: "B1-3C77",
  meta: "A4-2310-1192",
  rssi: "-71 dBm",
  model: "B1"
}, {
  id: "d3",
  name: "D11-22A9",
  meta: "C2-2208-4471",
  rssi: "-83 dBm",
  model: "D11"
}];
const PRINTER = {
  model: "D110",
  serial: "B1-2401-0837",
  battery: 78,
  caps: {
    speed: false,
    cut: false,
    sound: true,
    autoShutdown: true
  }
};
const DATE_PRESETS = [{
  id: "p1",
  name: "Leftovers",
  offset: 5
}, {
  id: "p2",
  name: "Best before",
  offset: 14
}, {
  id: "p3",
  name: "Freezer",
  offset: 90
}];

// Compute a "Jun 12"-style date N days from a fixed "today" (Jun 7, 2026).
function dateFromOffset(days) {
  const base = new Date(2026, 5, 7);
  base.setDate(base.getDate() + days);
  return base.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric"
  });
}
Object.assign(window, {
  SIZES,
  RECENT_LABELS,
  TEMPLATES,
  DEVICES,
  PRINTER,
  DATE_PRESETS,
  dateFromOffset
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/niimfree-app/data.jsx", error: String((e && e.message) || e) }); }

// ui_kits/niimfree-app/editor.jsx
try { (() => {
/* NiimFree — Label Editor (pushed full screen): Skia-style canvas + insert toolbar + inspector. */

const {
  useState: useStateE,
  useMemo: useMemoE
} = React;
const TOOLS = [{
  id: "text",
  icon: "type",
  label: "Text"
}, {
  id: "shape",
  icon: "square",
  label: "Shape"
}, {
  id: "qr",
  icon: "qr-code",
  label: "QR"
}, {
  id: "barcode",
  icon: "barcode",
  label: "Barcode"
}, {
  id: "image",
  icon: "image",
  label: "Image"
}, {
  id: "date",
  icon: "calendar",
  label: "Date",
  accent: true
}, {
  id: "icon",
  icon: "shapes",
  label: "Icon"
}];
function initialElements(design) {
  if (design && design.elements) return design.elements;
  const isCable = design && design.shape === "cable";
  if (isCable) return [{
    id: "e1",
    type: "text",
    x: 1,
    y: 14,
    w: 10,
    h: 12,
    text: design.lines?.[0]?.text || "Label",
    size: 9,
    align: "center",
    field: !!design.lines?.[0]?.field
  }];
  return [{
    id: "e1",
    type: "text",
    x: 3,
    y: 4,
    w: 34,
    h: 11,
    text: design && design.lines?.[0]?.text || "Soup",
    size: 16,
    bold: true,
    align: "center"
  }, {
    id: "e2",
    type: "date",
    x: 3,
    y: 18,
    w: 34,
    h: 9,
    prefix: "Use by ",
    offset: 5,
    size: 11,
    align: "center",
    field: true,
    fieldName: "Expiry"
  }];
}
function elementText(el) {
  if (el.type === "date") return (el.prefix || "") + dateFromOffset(el.offset ?? 5);
  if (el.type === "shape") return "";
  if (el.type === "qr") return "";
  return el.text || "";
}
function EditorScreen({
  design,
  locked,
  onBack,
  onPreview,
  onToast
}) {
  const w = design?.w || 40,
    h = design?.h || 30,
    shape = design?.shape || "rect";
  const [els, setEls] = useStateE(() => initialElements(design));
  const [sel, setSel] = useStateE(els[0]?.id || null);
  const isTemplate = !!design?.isTemplate;
  const scale = Math.min(300 / w, 200 / h, 8);
  const cw = Math.round(w * scale),
    ch = Math.round(h * scale);
  const selEl = els.find(e => e.id === sel) || null;
  const update = patch => setEls(arr => arr.map(e => e.id === sel ? {
    ...e,
    ...patch
  } : e));
  const addEl = type => {
    const id = "e" + (els.length + 1) + Math.random().toString(36).slice(2, 5);
    const base = {
      id,
      x: w * 0.2,
      y: h * 0.4,
      w: w * 0.6,
      h: h * 0.25,
      size: 12,
      align: "center"
    };
    const el = type === "date" ? {
      ...base,
      type: "date",
      prefix: "Use by ",
      offset: 5,
      field: true,
      fieldName: "Expiry"
    } : type === "shape" ? {
      ...base,
      type: "shape",
      fill: "black"
    } : type === "qr" ? {
      ...base,
      type: "qr",
      w: h * 0.5,
      h: h * 0.5
    } : {
      ...base,
      type: "text",
      text: "Text"
    };
    setEls(a => [...a, el]);
    setSel(id);
    onToast(type === "date" ? "Date element added" : "Element added");
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "editor"
  }, /*#__PURE__*/React.createElement("div", {
    className: "editor__top"
  }, /*#__PURE__*/React.createElement(IconButton, {
    icon: "arrow-left",
    label: "Back",
    onClick: onBack
  }), /*#__PURE__*/React.createElement("div", {
    className: "editor__size"
  }, locked && /*#__PURE__*/React.createElement(Icon, {
    name: "lock",
    size: 14
  }), /*#__PURE__*/React.createElement("span", null, w, "\xD7", h, " mm"), /*#__PURE__*/React.createElement(Icon, {
    name: "chevron-down",
    size: 14
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 4
    }
  }, /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    variant: "ghost",
    icon: "eye",
    onClick: onPreview
  }, "Preview"), /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    variant: "primary",
    onClick: () => onToast("Saved")
  }, "Save"))), isTemplate && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "8px 12px 0"
    }
  }, /*#__PURE__*/React.createElement(Banner, {
    variant: "accent",
    icon: "sparkles",
    title: "Template mode"
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12
    }
  }, "Toggle fields editable in the inspector."))), /*#__PURE__*/React.createElement("div", {
    className: "editor__canvaswrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "canvas",
    style: {
      width: cw,
      height: ch,
      borderRadius: shape === "round" ? "50%" : shape === "rounded" ? 10 : 2
    }
  }, els.map(el => /*#__PURE__*/React.createElement("div", {
    key: el.id,
    className: `canvas__el ${el.id === sel ? "canvas__el--sel" : ""} ${el.field ? "canvas__el--field" : ""}`,
    style: {
      left: el.x * scale,
      top: el.y * scale,
      width: el.w * scale,
      height: el.h * scale,
      fontSize: (el.size || 12) * (scale / 7),
      fontWeight: el.bold ? 700 : 500,
      justifyContent: el.align === "left" ? "flex-start" : el.align === "right" ? "flex-end" : "center",
      background: el.type === "shape" ? el.fill === "black" ? "#111" : el.fill === "white" ? "#fff" : "transparent" : "transparent",
      border: el.type === "shape" && el.fill === "none" ? "1.5px solid #111" : "none"
    },
    onClick: () => setSel(el.id)
  }, el.type === "qr" ? /*#__PURE__*/React.createElement(Icon, {
    name: "qr-code",
    size: el.w * scale * 0.9,
    color: "#111"
  }) : elementText(el))))), /*#__PURE__*/React.createElement("div", {
    className: "toolbar"
  }, TOOLS.map(t => /*#__PURE__*/React.createElement("div", {
    key: t.id,
    className: `tool ${t.accent ? "tool--date" : ""}`,
    onClick: () => addEl(t.id)
  }, /*#__PURE__*/React.createElement(Icon, {
    name: t.icon
  }), /*#__PURE__*/React.createElement("span", null, t.label)))), /*#__PURE__*/React.createElement(Inspector, {
    el: selEl,
    update: update,
    isTemplate: isTemplate
  }));
}
function Inspector({
  el,
  update,
  isTemplate
}) {
  if (!el) return /*#__PURE__*/React.createElement("div", {
    className: "inspector"
  }, /*#__PURE__*/React.createElement("span", {
    className: "nf-caption"
  }, "Select an element to edit it."));
  return /*#__PURE__*/React.createElement("div", {
    className: "inspector"
  }, el.type === "text" && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(TextField, {
    label: "Text",
    value: el.text,
    onChange: v => update({
      text: v
    })
  }), /*#__PURE__*/React.createElement("div", {
    className: "inspector__row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "inspector__label"
  }, "Size"), /*#__PURE__*/React.createElement(Stepper, {
    value: el.size,
    min: 6,
    max: 48,
    onChange: v => update({
      size: v
    })
  })), /*#__PURE__*/React.createElement("div", {
    className: "inspector__row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "inspector__label"
  }, "Align"), /*#__PURE__*/React.createElement(SegmentedControl, {
    options: [{
      value: "left",
      label: "L"
    }, {
      value: "center",
      label: "C"
    }, {
      value: "right",
      label: "R"
    }],
    value: el.align,
    onChange: v => update({
      align: v
    })
  }), /*#__PURE__*/React.createElement("button", {
    className: `nf-iconbtn ${el.bold ? "nf-iconbtn--tonal" : ""}`,
    onClick: () => update({
      bold: !el.bold
    }),
    "aria-label": "Bold"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "bold",
    size: 18
  })))), el.type === "date" && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(TextField, {
    label: "Prefix",
    value: el.prefix,
    onChange: v => update({
      prefix: v
    })
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    className: "nf-field__label",
    style: {
      display: "block",
      marginBottom: 8
    }
  }, "Offset \xB7 ", dateFromOffset(el.offset)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 6,
      flexWrap: "wrap"
    }
  }, [1, 3, 5, 7, 14, 30].map(n => /*#__PURE__*/React.createElement(Chip, {
    key: n,
    selected: el.offset === n,
    onClick: () => update({
      offset: n
    })
  }, "+", n, "d"))))), el.type === "shape" && /*#__PURE__*/React.createElement("div", {
    className: "inspector__row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "inspector__label"
  }, "Fill"), /*#__PURE__*/React.createElement(SegmentedControl, {
    options: [{
      value: "black",
      label: "Black"
    }, {
      value: "white",
      label: "White"
    }, {
      value: "none",
      label: "Outline"
    }],
    value: el.fill,
    onChange: v => update({
      fill: v
    })
  })), el.type === "qr" && /*#__PURE__*/React.createElement("span", {
    className: "nf-caption"
  }, "QR content is set per print or bound to a field."), (el.type === "text" || el.type === "date" || el.type === "qr") && /*#__PURE__*/React.createElement("div", {
    className: "inspector__row",
    style: {
      borderTop: "1px solid var(--border)",
      paddingTop: 12
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    className: "inspector__label",
    style: {
      display: "flex",
      alignItems: "center",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "pencil",
    size: 14,
    color: "var(--accent)"
  }), "Editable field"), el.field && /*#__PURE__*/React.createElement("input", {
    className: "nf-field",
    style: {
      marginTop: 6,
      border: "1px solid var(--border)",
      borderRadius: 8,
      padding: "6px 10px",
      fontSize: 13,
      fontFamily: "var(--font-sans)",
      width: 150
    },
    value: el.fieldName || "",
    placeholder: "Field name",
    onChange: e => update({
      fieldName: e.target.value
    })
  })), /*#__PURE__*/React.createElement(Switch, {
    checked: !!el.field,
    onChange: v => update({
      field: v
    }),
    label: "Editable field"
  })));
}
Object.assign(window, {
  EditorScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/niimfree-app/editor.jsx", error: String((e && e.message) || e) }); }

// ui_kits/niimfree-app/screens.jsx
try { (() => {
/* NiimFree — main tab screens: Labels (home), Templates, Print hub, Settings. */

const {
  useState: useStateS
} = React;
function LabelsScreen({
  printer,
  detected,
  onStatusTap,
  onNewLabel,
  onOpenLabel,
  onQuick
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "screen"
  }, /*#__PURE__*/React.createElement("div", {
    className: "apphead"
  }, /*#__PURE__*/React.createElement("div", {
    className: "apphead__title"
  }, /*#__PURE__*/React.createElement("div", {
    className: "apphead__glyph"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "tag",
    size: 20
  })), /*#__PURE__*/React.createElement("div", {
    className: "nf-display",
    style: {
      fontSize: 26
    }
  }, "Niim", /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--primary)"
    }
  }, "Free"))), /*#__PURE__*/React.createElement("div", {
    onClick: onStatusTap,
    style: {
      cursor: "pointer"
    }
  }, printer.connected ? /*#__PURE__*/React.createElement(StatusPill, {
    status: "ready"
  }, "Ready") : /*#__PURE__*/React.createElement(StatusPill, null, "Not connected"))), /*#__PURE__*/React.createElement("div", {
    className: "screen__scroll"
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    fullWidth: true,
    icon: "plus",
    onClick: onNewLabel,
    style: {
      height: 56,
      fontSize: 17
    }
  }, "New label"), /*#__PURE__*/React.createElement("div", {
    className: "quickrow",
    style: {
      marginTop: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "quick",
    onClick: () => onQuick("blank")
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "square"
  }), /*#__PURE__*/React.createElement("span", null, "Blank")), /*#__PURE__*/React.createElement("div", {
    className: "quick",
    onClick: () => onQuick("template")
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "shapes"
  }), /*#__PURE__*/React.createElement("span", null, "From template")), /*#__PURE__*/React.createElement("div", {
    className: "quick",
    onClick: () => onQuick("text")
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "type"
  }), /*#__PURE__*/React.createElement("span", null, "Quick text"))), /*#__PURE__*/React.createElement("div", {
    className: "section-label"
  }, /*#__PURE__*/React.createElement("span", null, "Recent")), /*#__PURE__*/React.createElement("div", {
    className: "grid2"
  }, RECENT_LABELS.map(l => /*#__PURE__*/React.createElement(Card, {
    key: l.id,
    pressable: true,
    className: "labelcard",
    onClick: () => onOpenLabel(l),
    style: {
      padding: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "center",
      padding: "4px 0 2px"
    }
  }, /*#__PURE__*/React.createElement(LabelThumbnail, {
    widthMm: l.w,
    heightMm: l.h,
    shape: l.shape,
    size: l.shape === "cable" ? 44 : 124,
    lines: l.lines
  })), /*#__PURE__*/React.createElement("div", {
    className: "labelcard__meta"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "labelcard__name"
  }, l.name), /*#__PURE__*/React.createElement("div", {
    className: "labelcard__sub"
  }, l.w, "\xD7", l.h, " mm")), /*#__PURE__*/React.createElement("span", {
    className: "nf-caption",
    style: {
      fontSize: 11
    }
  }, l.when)))))));
}
function TemplateCard({
  t,
  onUse
}) {
  return /*#__PURE__*/React.createElement(Card, {
    style: {
      padding: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(LabelThumbnail, {
    widthMm: t.w,
    heightMm: t.h,
    shape: t.shape,
    size: t.shape === "cable" ? 38 : 96,
    lines: t.lines
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "nf-heading"
  }, t.name), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 6,
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    variant: "accent"
  }, t.fields.length, " field", t.fields.length > 1 ? "s" : ""), /*#__PURE__*/React.createElement(Badge, {
    variant: "mono"
  }, t.w, "\xD7", t.h, " mm")), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    variant: "accent",
    icon: "sparkles",
    onClick: () => onUse(t)
  }, "Use"), /*#__PURE__*/React.createElement(IconButton, {
    size: "sm",
    variant: "tonal",
    icon: "more-horizontal",
    label: "More"
  })))));
}
function TemplatesScreen({
  onUse
}) {
  const [tab, setTab] = useStateS("starter");
  const list = TEMPLATES.filter(t => t.group === tab);
  return /*#__PURE__*/React.createElement("div", {
    className: "screen"
  }, /*#__PURE__*/React.createElement("div", {
    className: "apphead"
  }, /*#__PURE__*/React.createElement("div", {
    className: "nf-title"
  }, "Templates"), /*#__PURE__*/React.createElement(IconButton, {
    variant: "tonal",
    icon: "plus",
    label: "New template"
  })), /*#__PURE__*/React.createElement("div", {
    className: "screen__scroll"
  }, /*#__PURE__*/React.createElement(SegmentedControl, {
    options: [{
      value: "my",
      label: "My templates"
    }, {
      value: "starter",
      label: "Starter"
    }],
    value: tab,
    onChange: setTab,
    style: {
      display: "flex",
      marginBottom: 14
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 12
    }
  }, list.map(t => /*#__PURE__*/React.createElement(TemplateCard, {
    key: t.id,
    t: t,
    onUse: onUse
  }))), /*#__PURE__*/React.createElement(Banner, {
    variant: "accent",
    icon: "info",
    title: "Design once, fill the blanks"
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13
    }
  }, "Make a template from any label."))));
}
function PrintScreen({
  printer,
  detected,
  onConnect,
  onDisconnect,
  onSetSize,
  density,
  setDensity,
  quantity,
  setQuantity
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "screen"
  }, /*#__PURE__*/React.createElement("div", {
    className: "apphead"
  }, /*#__PURE__*/React.createElement("div", {
    className: "nf-title"
  }, "Print")), /*#__PURE__*/React.createElement("div", {
    className: "screen__scroll"
  }, printer.connected ? /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "stat__ic",
    style: {
      background: "var(--success-bg)",
      color: "var(--success)",
      width: 44,
      height: 44
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "printer",
    size: 22
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "nf-heading"
  }, printer.model), /*#__PURE__*/React.createElement("div", {
    className: "nf-mono",
    style: {
      color: "var(--text-muted)"
    }
  }, printer.serial)), /*#__PURE__*/React.createElement(StatusPill, {
    status: "ready"
  }, "Ready")), /*#__PURE__*/React.createElement("div", {
    className: "statgrid",
    style: {
      marginTop: 16
    }
  }, /*#__PURE__*/React.createElement(Stat, {
    ic: "battery-medium",
    k: "Battery",
    v: printer.battery + "%",
    tone: "success"
  }), /*#__PURE__*/React.createElement(Stat, {
    ic: "package-check",
    k: "Lid",
    v: "Closed",
    tone: "success"
  }), /*#__PURE__*/React.createElement(Stat, {
    ic: "scroll",
    k: "Paper",
    v: "Loaded",
    tone: "success"
  }), /*#__PURE__*/React.createElement(Stat, {
    ic: "radio",
    k: "RFID",
    v: "Read OK",
    tone: "success"
  })), /*#__PURE__*/React.createElement("div", {
    className: "listrow",
    style: {
      borderTop: "1px solid var(--border)",
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "listrow__ic",
    style: {
      background: "var(--blue-50)",
      color: "var(--primary)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "ruler",
    size: 18
  })), /*#__PURE__*/React.createElement("div", {
    className: "listrow__main"
  }, /*#__PURE__*/React.createElement("div", {
    className: "listrow__name"
  }, "Detected label"), /*#__PURE__*/React.createElement("div", {
    className: "listrow__sub"
  }, detected ? "Auto-locked from RFID" : "Unknown — tap to set")), detected ? /*#__PURE__*/React.createElement(Badge, {
    variant: "mono"
  }, detected.w, "\xD7", detected.h, " mm") : /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    variant: "secondary",
    onClick: onSetSize
  }, "Set")), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    fullWidth: true,
    icon: "bluetooth-off",
    onClick: onDisconnect,
    style: {
      marginTop: 14
    }
  }, "Disconnect")) : /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("div", {
    className: "nf-empty",
    style: {
      padding: "14px 8px 18px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "nf-empty__art"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "bluetooth",
    size: 34
  })), /*#__PURE__*/React.createElement("div", {
    className: "nf-empty__title"
  }, "No printer connected"), /*#__PURE__*/React.createElement("div", {
    className: "nf-empty__text"
  }, "Connect over Bluetooth to print. No account needed."), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    icon: "bluetooth",
    onClick: onConnect
  }, "Connect printer"))), /*#__PURE__*/React.createElement("div", {
    className: "section-label"
  }, /*#__PURE__*/React.createElement("span", null, "Defaults")), /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("div", {
    className: "inspector__row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "inspector__label"
  }, "Density"), /*#__PURE__*/React.createElement(Stepper, {
    value: density,
    min: 1,
    max: 5,
    onChange: setDensity
  })), /*#__PURE__*/React.createElement("div", {
    className: "inspector__row",
    style: {
      marginTop: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "inspector__label"
  }, "Quantity"), /*#__PURE__*/React.createElement(Stepper, {
    value: quantity,
    min: 1,
    max: 99,
    onChange: setQuantity
  }))), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    fullWidth: true,
    icon: "flask-conical",
    style: {
      marginTop: 14
    },
    disabled: !printer.connected
  }, "Test print")));
}
function Stat({
  ic,
  k,
  v,
  tone
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "stat"
  }, /*#__PURE__*/React.createElement("div", {
    className: "stat__ic",
    style: tone === "success" ? {
      background: "var(--success-bg)",
      color: "var(--success)"
    } : {}
  }, /*#__PURE__*/React.createElement(Icon, {
    name: ic,
    size: 18
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "stat__k"
  }, k), /*#__PURE__*/React.createElement("div", {
    className: "stat__v"
  }, v)));
}
function SettingsScreen({
  cloud,
  setCloud,
  sound,
  setSound
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "screen"
  }, /*#__PURE__*/React.createElement("div", {
    className: "apphead"
  }, /*#__PURE__*/React.createElement("div", {
    className: "nf-title"
  }, "Settings")), /*#__PURE__*/React.createElement("div", {
    className: "screen__scroll"
  }, /*#__PURE__*/React.createElement("div", {
    className: "section-label"
  }, /*#__PURE__*/React.createElement("span", null, "Remembered labels")), /*#__PURE__*/React.createElement(Card, {
    style: {
      padding: "4px 14px"
    }
  }, [{
    s: "40×30 mm",
    b: "6975728310042",
    w: "Today"
  }, {
    s: "50×30 mm",
    b: "6975728310059",
    w: "Yesterday"
  }, {
    s: "12×40 cable",
    b: "6975728310110",
    w: "Last week"
  }].map((r, i) => /*#__PURE__*/React.createElement("div", {
    className: "listrow",
    key: i
  }, /*#__PURE__*/React.createElement("div", {
    className: "listrow__ic"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "ruler",
    size: 18
  })), /*#__PURE__*/React.createElement("div", {
    className: "listrow__main"
  }, /*#__PURE__*/React.createElement("div", {
    className: "listrow__name",
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 13
    }
  }, r.s), /*#__PURE__*/React.createElement("div", {
    className: "listrow__sub",
    style: {
      fontFamily: "var(--font-mono)"
    }
  }, r.b)), /*#__PURE__*/React.createElement("span", {
    className: "nf-caption",
    style: {
      fontSize: 11
    }
  }, r.w), /*#__PURE__*/React.createElement(Icon, {
    name: "chevron-right",
    size: 18,
    color: "var(--text-faint)"
  })))), /*#__PURE__*/React.createElement("div", {
    className: "section-label"
  }, /*#__PURE__*/React.createElement("span", null, "Date presets")), /*#__PURE__*/React.createElement(Card, {
    style: {
      padding: "4px 14px"
    }
  }, DATE_PRESETS.map(p => /*#__PURE__*/React.createElement("div", {
    className: "listrow",
    key: p.id
  }, /*#__PURE__*/React.createElement("div", {
    className: "listrow__ic",
    style: {
      background: "var(--violet-100)",
      color: "var(--accent)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "calendar-clock",
    size: 18
  })), /*#__PURE__*/React.createElement("div", {
    className: "listrow__main"
  }, /*#__PURE__*/React.createElement("div", {
    className: "listrow__name"
  }, p.name)), /*#__PURE__*/React.createElement(Badge, {
    variant: "accent"
  }, "+", p.offset, " days")))), /*#__PURE__*/React.createElement("div", {
    className: "section-label"
  }, /*#__PURE__*/React.createElement("span", null, "Privacy")), /*#__PURE__*/React.createElement(Card, {
    style: {
      padding: "4px 14px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "listrow"
  }, /*#__PURE__*/React.createElement("div", {
    className: "listrow__ic"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "cloud",
    size: 18
  })), /*#__PURE__*/React.createElement("div", {
    className: "listrow__main"
  }, /*#__PURE__*/React.createElement("div", {
    className: "listrow__name"
  }, "Cloud lookup"), /*#__PURE__*/React.createElement("div", {
    className: "listrow__sub"
  }, "Look up unknown labels online. Off by default.")), /*#__PURE__*/React.createElement(Switch, {
    checked: cloud,
    onChange: setCloud,
    label: "Cloud lookup"
  })), /*#__PURE__*/React.createElement("div", {
    className: "listrow"
  }, /*#__PURE__*/React.createElement("div", {
    className: "listrow__ic"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "volume-2",
    size: 18
  })), /*#__PURE__*/React.createElement("div", {
    className: "listrow__main"
  }, /*#__PURE__*/React.createElement("div", {
    className: "listrow__name"
  }, "Printer sound")), /*#__PURE__*/React.createElement(Switch, {
    checked: sound,
    onChange: setSound,
    label: "Sound"
  }))), /*#__PURE__*/React.createElement(Banner, {
    variant: "success",
    icon: "shield-check",
    title: "No account \xB7 No tracking"
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13
    }
  }, "Everything lives on this device. Open-source under MIT."))));
}
Object.assign(window, {
  LabelsScreen,
  TemplatesScreen,
  PrintScreen,
  SettingsScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/niimfree-app/screens.jsx", error: String((e && e.message) || e) }); }

// ui_kits/niimfree-app/sheets.jsx
try { (() => {
/* NiimFree — sheets & modals: Connect (BLE scan), Set size, Fill fields, Print preview. */

const {
  useState: useStateSh,
  useEffect: useEffectSh
} = React;
function Scrim({
  children,
  center,
  onClose
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: `scrim ${center ? "scrim--center" : ""}`,
    onClick: e => {
      if (e.target === e.currentTarget) onClose && onClose();
    }
  }, children);
}

/* ---------- Connect (BLE scan) ---------- */
function ConnectSheet({
  onClose,
  onConnect
}) {
  const [scanning, setScanning] = useStateSh(true);
  const [shown, setShown] = useStateSh(0);
  useEffectSh(() => {
    const timers = [];
    DEVICES.forEach((_, i) => timers.push(setTimeout(() => setShown(i + 1), 500 + i * 450)));
    timers.push(setTimeout(() => setScanning(false), 500 + DEVICES.length * 450));
    return () => timers.forEach(clearTimeout);
  }, []);
  return /*#__PURE__*/React.createElement(Scrim, {
    onClose: onClose
  }, /*#__PURE__*/React.createElement("div", {
    className: "sheet"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sheet__grab"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "sheet__title"
  }, "Connect printer"), /*#__PURE__*/React.createElement(IconButton, {
    icon: "x",
    label: "Close",
    onClick: onClose
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      color: "var(--text-muted)",
      fontSize: 13,
      marginBottom: 14
    }
  }, scanning ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
    className: "spinner"
  }), " Scanning for devices\u2026") : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    size: 16,
    color: "var(--success)"
  }), " ", DEVICES.length, " printers found")), /*#__PURE__*/React.createElement("div", {
    className: "sheet__scroll",
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 10
    }
  }, DEVICES.slice(0, shown).map(d => /*#__PURE__*/React.createElement(DeviceRow, {
    key: d.id,
    name: d.name,
    meta: d.meta,
    rssi: d.rssi,
    onClick: () => onConnect(d)
  })))));
}

/* ---------- Set size (new label detected) ---------- */
function SizeSheet({
  onClose,
  onConfirm,
  detectedBarcode
}) {
  const [picked, setPicked] = useStateSh("s1");
  const [shape, setShape] = useStateSh("rect");
  const size = SIZES.find(s => s.id === picked);
  return /*#__PURE__*/React.createElement(Scrim, {
    onClose: onClose
  }, /*#__PURE__*/React.createElement("div", {
    className: "sheet"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sheet__grab"
  }), /*#__PURE__*/React.createElement("div", {
    className: "sheet__title"
  }, "New label detected"), /*#__PURE__*/React.createElement("div", {
    className: "nf-body",
    style: {
      color: "var(--text-muted)",
      marginBottom: 4
    }
  }, "We haven't seen this label before. What size is it?"), detectedBarcode && /*#__PURE__*/React.createElement("div", {
    className: "nf-mono",
    style: {
      color: "var(--text-faint)",
      fontSize: 12,
      marginBottom: 14
    }
  }, detectedBarcode), /*#__PURE__*/React.createElement("div", {
    className: "sheet__scroll"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sizegrid"
  }, SIZES.map(s => /*#__PURE__*/React.createElement("div", {
    key: s.id,
    className: `sizeopt ${picked === s.id ? "sizeopt--on" : ""}`,
    onClick: () => {
      setPicked(s.id);
      setShape(s.shape);
    }
  }, /*#__PURE__*/React.createElement(LabelThumbnail, {
    widthMm: s.w,
    heightMm: s.h,
    shape: s.shape,
    size: s.shape === "cable" ? 20 : 40
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "sizeopt__name"
  }, s.name), /*#__PURE__*/React.createElement("div", {
    className: "sizeopt__dim"
  }, s.shape))))), /*#__PURE__*/React.createElement("div", {
    className: "section-label"
  }, /*#__PURE__*/React.createElement("span", null, "Shape")), /*#__PURE__*/React.createElement(SegmentedControl, {
    options: [{
      value: "rect",
      label: "Rect"
    }, {
      value: "rounded",
      label: "Rounded"
    }, {
      value: "round",
      label: "Round"
    }, {
      value: "cable",
      label: "Cable"
    }],
    value: shape,
    onChange: setShape,
    style: {
      display: "flex"
    }
  })), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    fullWidth: true,
    icon: "check",
    style: {
      marginTop: 16
    },
    onClick: () => onConfirm(size)
  }, "Remember & continue")));
}

/* ---------- Fill fields ---------- */
function FillFieldsSheet({
  template,
  onClose,
  onPrint
}) {
  const [vals, setVals] = useStateSh(() => {
    const v = {};
    template.fields.forEach(f => {
      v[f.name] = f.type === "date" ? f.offset ?? 5 : f.default || "";
    });
    return v;
  });
  const setV = (k, val) => setVals(p => ({
    ...p,
    [k]: val
  }));

  // build preview lines from the template, substituting filled values
  const previewLines = template.lines.map(ln => {
    if (!ln.field) return ln;
    const f = template.fields.find(ff => ff.type === "date") && /use by|jun|exp/i.test(ln.text) ? template.fields.find(ff => ff.type === "date") : null;
    if (f && f.type === "date") return {
      ...ln,
      text: "Use by " + dateFromOffset(vals[f.name])
    };
    // first text field maps to the first highlighted line
    const tf = template.fields.find(ff => ff.type !== "date");
    if (tf) return {
      ...ln,
      text: vals[tf.name] || ln.text
    };
    return ln;
  });
  return /*#__PURE__*/React.createElement(Scrim, {
    onClose: onClose
  }, /*#__PURE__*/React.createElement("div", {
    className: "sheet"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sheet__grab"
  }), /*#__PURE__*/React.createElement("div", {
    className: "sheet__title"
  }, template.name), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "center",
      margin: "8px 0 16px"
    }
  }, /*#__PURE__*/React.createElement(LabelThumbnail, {
    widthMm: template.w,
    heightMm: template.h,
    shape: template.shape,
    size: template.shape === "cable" ? 60 : 170,
    lines: previewLines
  })), /*#__PURE__*/React.createElement("div", {
    className: "sheet__scroll",
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 14
    }
  }, template.fields.map(f => f.type === "date" ? /*#__PURE__*/React.createElement("div", {
    key: f.name
  }, /*#__PURE__*/React.createElement("span", {
    className: "nf-field__label",
    style: {
      display: "block",
      marginBottom: 8
    }
  }, f.name, " \xB7 Use by ", dateFromOffset(vals[f.name])), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 6,
      flexWrap: "wrap"
    }
  }, [1, 3, 5, 7, 14, 30].map(n => /*#__PURE__*/React.createElement(Chip, {
    key: n,
    selected: vals[f.name] === n,
    onClick: () => setV(f.name, n)
  }, "+", n, "d")))) : /*#__PURE__*/React.createElement(TextField, {
    key: f.name,
    label: f.name,
    value: vals[f.name],
    onChange: v => setV(f.name, v),
    inputMode: f.type === "number" ? "numeric" : undefined
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      marginTop: 16
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    fullWidth: true,
    onClick: onClose
  }, "Cancel"), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    fullWidth: true,
    icon: "eye",
    onClick: () => onPrint(previewLines)
  }, "Preview"))));
}

/* ---------- Print preview (1-bit) ---------- */
function PreviewModal({
  design,
  lines,
  printer,
  detected,
  density,
  setDensity,
  quantity,
  setQuantity,
  onClose,
  onToast
}) {
  const [mode, setMode] = useStateSh("print");
  const [printing, setPrinting] = useStateSh(0); // 0 idle, 1..100 progress
  const w = design?.w || 40,
    h = design?.h || 30,
    shape = design?.shape || "rect";
  const scale = Math.min(220 / w, 150 / h, 6);
  const mismatch = detected && (detected.w !== w || detected.h !== h);
  const canPrint = printer.connected;
  useEffectSh(() => {
    if (printing > 0 && printing < 100) {
      const t = setTimeout(() => setPrinting(p => Math.min(100, p + 12)), 130);
      return () => clearTimeout(t);
    }
    if (printing >= 100) {
      const t = setTimeout(() => {
        onToast("Printed " + quantity + "× " + w + "×" + h);
        onClose();
      }, 500);
      return () => clearTimeout(t);
    }
  }, [printing]);
  const showLines = lines || design?.lines || [{
    text: "Soup",
    strong: true,
    size: 16
  }, {
    text: "Use by Jun 12",
    size: 11
  }];
  return /*#__PURE__*/React.createElement(Scrim, {
    center: true,
    onClose: printing ? null : onClose
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "nf-title",
    style: {
      fontSize: 19
    }
  }, "Preview"), /*#__PURE__*/React.createElement(IconButton, {
    icon: "x",
    label: "Close",
    onClick: onClose,
    disabled: !!printing
  })), /*#__PURE__*/React.createElement(SegmentedControl, {
    options: [{
      value: "design",
      label: "Design"
    }, {
      value: "print",
      label: "Print output"
    }],
    value: mode,
    onChange: setMode,
    style: {
      display: "flex",
      marginBottom: 14
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "center",
      padding: "6px 0 14px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "preview-label",
    style: {
      width: Math.round(w * scale),
      height: Math.round(h * scale),
      borderRadius: shape === "round" ? "50%" : 2
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: "10%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 3
    }
  }, showLines.map((l, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      fontFamily: l.mono ? "var(--font-mono)" : "var(--font-sans)",
      fontWeight: l.strong ? 800 : 600,
      fontSize: (l.size || 11) * (scale / 6) * 1.1,
      color: "#000",
      filter: mode === "print" ? "contrast(4) grayscale(1)" : "none",
      WebkitFontSmoothing: mode === "print" ? "none" : "auto",
      whiteSpace: "nowrap"
    }
  }, l.text))))), mismatch && /*#__PURE__*/React.createElement(Banner, {
    variant: "warning",
    icon: "alert-triangle",
    title: "Size mismatch"
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12
    }
  }, "Design is ", w, "\xD7", h, " but a ", detected.w, "\xD7", detected.h, " label is loaded.")), printing > 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      fontSize: 13,
      fontWeight: 600,
      marginBottom: 6
    }
  }, /*#__PURE__*/React.createElement("span", null, "Printing\u2026"), /*#__PURE__*/React.createElement("span", {
    className: "nf-mono"
  }, Math.round(printing), "%")), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 8,
      borderRadius: 4,
      background: "var(--surface-alt)",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: "100%",
      width: printing + "%",
      background: "var(--primary)",
      transition: "width .12s"
    }
  }))) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "inspector__row",
    style: {
      marginTop: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "inspector__label"
  }, "Density"), /*#__PURE__*/React.createElement(Stepper, {
    value: density,
    min: 1,
    max: 5,
    onChange: setDensity
  })), /*#__PURE__*/React.createElement("div", {
    className: "inspector__row",
    style: {
      marginTop: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "inspector__label"
  }, "Quantity"), /*#__PURE__*/React.createElement(Stepper, {
    value: quantity,
    min: 1,
    max: 99,
    onChange: setQuantity
  })), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    fullWidth: true,
    icon: canPrint ? "printer" : "bluetooth-off",
    style: {
      marginTop: 16
    },
    disabled: !canPrint,
    onClick: () => setPrinting(1)
  }, canPrint ? "Print" : "Connect a printer to print"))));
}
Object.assign(window, {
  Scrim,
  ConnectSheet,
  SizeSheet,
  FillFieldsSheet,
  PreviewModal
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/niimfree-app/sheets.jsx", error: String((e && e.message) || e) }); }

// ui_kits/niimfree-app/ui.jsx
try { (() => {
/* Shared UI primitives for the NiimFree app kit.
   These mirror the design-system components but are self-contained (same CSS classes
   from styles.css + Lucide), so the kit runs standalone and stays visually identical. */

const {
  useRef,
  useEffect,
  useState
} = React;
function Icon({
  name,
  size = 20,
  color,
  strokeWidth,
  style = {},
  className = ""
}) {
  const ref = useRef(null);
  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    host.innerHTML = "";
    const i = document.createElement("i");
    i.setAttribute("data-lucide", name);
    host.appendChild(i);
    if (window.lucide) {
      try {
        window.lucide.createIcons();
      } catch (e) {}
    }
  }, [name]);
  return /*#__PURE__*/React.createElement("span", {
    ref: ref,
    className: `nf-icon ${className}`,
    style: {
      width: size,
      height: size,
      color,
      ...(strokeWidth ? {
        "--icon-sw": strokeWidth
      } : {}),
      ...style
    }
  });
}
function Button({
  variant = "primary",
  size = "md",
  fullWidth,
  icon,
  iconRight,
  disabled,
  children,
  onClick,
  style
}) {
  const cls = ["nf-btn", `nf-btn--${variant}`];
  if (size === "sm") cls.push("nf-btn--sm");
  if (size === "lg") cls.push("nf-btn--lg");
  if (fullWidth) cls.push("nf-btn--full");
  const is = size === "sm" ? 16 : size === "lg" ? 22 : 20;
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: cls.join(" "),
    disabled: disabled,
    onClick: onClick,
    style: style
  }, icon && /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: is
  }), children != null && /*#__PURE__*/React.createElement("span", null, children), iconRight && /*#__PURE__*/React.createElement(Icon, {
    name: iconRight,
    size: is
  }));
}
function IconButton({
  icon,
  variant = "plain",
  size = "md",
  disabled,
  label,
  onClick,
  style
}) {
  const cls = ["nf-iconbtn"];
  if (variant !== "plain") cls.push(`nf-iconbtn--${variant}`);
  if (size === "sm") cls.push("nf-iconbtn--sm");
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: cls.join(" "),
    disabled: disabled,
    "aria-label": label,
    onClick: onClick,
    style: style
  }, /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: size === "sm" ? 18 : 22
  }));
}
function StatusPill({
  status = "idle",
  children,
  icon
}) {
  return /*#__PURE__*/React.createElement("span", {
    className: `nf-pill ${status !== "idle" ? "nf-pill--" + status : ""}`
  }, icon ? /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 14
  }) : /*#__PURE__*/React.createElement("span", {
    className: "nf-pill__dot"
  }), children);
}
function Card({
  children,
  pressable,
  flat,
  onClick,
  className = "",
  style
}) {
  const cls = ["nf-card"];
  if (flat) cls.push("nf-card--flat");
  if (pressable) cls.push("nf-card--pressable");
  if (className) cls.push(className);
  return /*#__PURE__*/React.createElement("div", {
    className: cls.join(" "),
    onClick: onClick,
    style: style
  }, children);
}
function Badge({
  children,
  variant = "neutral",
  icon
}) {
  return /*#__PURE__*/React.createElement("span", {
    className: `nf-badge ${variant !== "neutral" ? "nf-badge--" + variant : ""}`
  }, icon && /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 12
  }), /*#__PURE__*/React.createElement("span", null, children));
}
function Chip({
  children,
  selected,
  icon,
  onClick,
  style
}) {
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: `nf-chip ${selected ? "nf-chip--selected" : ""}`,
    onClick: onClick,
    style: style
  }, icon && /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 15
  }), children);
}
function Stepper({
  value,
  min = -Infinity,
  max = Infinity,
  step = 1,
  onChange,
  formatValue
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "nf-stepper"
  }, /*#__PURE__*/React.createElement("button", {
    className: "nf-stepper__btn",
    type: "button",
    disabled: value <= min,
    onClick: () => onChange(Math.max(min, value - step)),
    "aria-label": "Decrease"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "minus",
    size: 18
  })), /*#__PURE__*/React.createElement("div", {
    className: "nf-stepper__val"
  }, formatValue ? formatValue(value) : value), /*#__PURE__*/React.createElement("button", {
    className: "nf-stepper__btn",
    type: "button",
    disabled: value >= max,
    onClick: () => onChange(Math.min(max, value + step)),
    "aria-label": "Increase"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "plus",
    size: 18
  })));
}
function SegmentedControl({
  options,
  value,
  onChange,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "nf-seg",
    style: style
  }, options.map(opt => {
    const v = typeof opt === "string" ? opt : opt.value;
    const label = typeof opt === "string" ? opt : opt.label;
    return /*#__PURE__*/React.createElement("button", {
      key: v,
      type: "button",
      className: `nf-seg__item ${v === value ? "nf-seg__item--active" : ""}`,
      onClick: () => onChange(v),
      style: {
        flex: 1
      }
    }, label);
  }));
}
function Switch({
  checked,
  onChange,
  label
}) {
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    role: "switch",
    "aria-checked": checked,
    "aria-label": label,
    className: `nf-switch ${checked ? "nf-switch--on" : ""}`,
    onClick: () => onChange(!checked)
  }, /*#__PURE__*/React.createElement("span", {
    className: "nf-switch__knob"
  }));
}
function TextField({
  label,
  value,
  onChange,
  placeholder,
  icon,
  mono,
  hint,
  inputMode
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: `nf-field ${mono ? "nf-field--mono" : ""}`
  }, label && /*#__PURE__*/React.createElement("label", {
    className: "nf-field__label"
  }, label), /*#__PURE__*/React.createElement("div", {
    className: "nf-field__control"
  }, icon && /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 18
  }), /*#__PURE__*/React.createElement("input", {
    value: value,
    placeholder: placeholder,
    inputMode: inputMode,
    onChange: e => onChange(e.target.value)
  })), hint && /*#__PURE__*/React.createElement("span", {
    className: "nf-field__hint"
  }, hint));
}
function Banner({
  variant = "neutral",
  icon,
  title,
  children,
  action
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: `nf-banner ${variant !== "neutral" ? "nf-banner--" + variant : ""}`
  }, icon && /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 20
  }), /*#__PURE__*/React.createElement("div", {
    className: "nf-banner__body"
  }, title && /*#__PURE__*/React.createElement("div", {
    className: "nf-banner__title"
  }, title), children), action);
}
function Toast({
  icon = "check-circle-2",
  children
}) {
  return /*#__PURE__*/React.createElement("span", {
    className: "nf-toast"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 18
  }), children);
}
function EmptyState({
  icon = "inbox",
  title,
  text,
  action
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "nf-empty"
  }, /*#__PURE__*/React.createElement("div", {
    className: "nf-empty__art"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 34
  })), title && /*#__PURE__*/React.createElement("div", {
    className: "nf-empty__title"
  }, title), text && /*#__PURE__*/React.createElement("div", {
    className: "nf-empty__text"
  }, text), action);
}
function FieldTag({
  children,
  icon = "pencil"
}) {
  return /*#__PURE__*/React.createElement("span", {
    className: "nf-fieldtag"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: icon
  }), children);
}
function DeviceRow({
  name,
  meta,
  rssi,
  icon = "printer",
  onClick
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "nf-devicerow",
    role: "button",
    onClick: onClick
  }, /*#__PURE__*/React.createElement("div", {
    className: "nf-devicerow__icon"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 20
  })), /*#__PURE__*/React.createElement("div", {
    className: "nf-devicerow__main"
  }, /*#__PURE__*/React.createElement("div", {
    className: "nf-devicerow__name"
  }, name), meta && /*#__PURE__*/React.createElement("div", {
    className: "nf-devicerow__meta"
  }, meta)), rssi != null && /*#__PURE__*/React.createElement("div", {
    className: "nf-devicerow__rssi"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "signal",
    size: 16
  }), rssi));
}
function LabelThumbnail({
  widthMm = 40,
  heightMm = 30,
  shape = "rect",
  size = 120,
  lines,
  children,
  style
}) {
  const ratio = heightMm / widthMm;
  const cls = "nf-thumb" + (shape === "round" ? " nf-thumb--round" : "");
  return /*#__PURE__*/React.createElement("div", {
    className: cls,
    style: {
      width: size,
      height: Math.round(size * ratio),
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "nf-thumb__inner"
  }, children, !children && (lines || []).map((l, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      fontSize: l.size || 11,
      fontWeight: l.strong ? 700 : 500,
      lineHeight: 1.2,
      whiteSpace: "nowrap",
      fontFamily: l.mono ? "var(--font-mono)" : "var(--font-sans)",
      ...(l.field ? {
        background: "var(--field-highlight)",
        border: "1px dashed var(--accent)",
        borderRadius: 3,
        padding: "1px 4px",
        color: "#15181E"
      } : {})
    }
  }, l.text))));
}
Object.assign(window, {
  Icon,
  Button,
  IconButton,
  StatusPill,
  Card,
  Badge,
  Chip,
  Stepper,
  SegmentedControl,
  Switch,
  TextField,
  Banner,
  Toast,
  EmptyState,
  FieldTag,
  DeviceRow,
  LabelThumbnail
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/niimfree-app/ui.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Button = __ds_scope.Button;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.DeviceRow = __ds_scope.DeviceRow;

__ds_ns.FieldTag = __ds_scope.FieldTag;

__ds_ns.LabelThumbnail = __ds_scope.LabelThumbnail;

__ds_ns.Banner = __ds_scope.Banner;

__ds_ns.EmptyState = __ds_scope.EmptyState;

__ds_ns.StatusPill = __ds_scope.StatusPill;

__ds_ns.Toast = __ds_scope.Toast;

__ds_ns.Chip = __ds_scope.Chip;

__ds_ns.SegmentedControl = __ds_scope.SegmentedControl;

__ds_ns.Stepper = __ds_scope.Stepper;

__ds_ns.Switch = __ds_scope.Switch;

__ds_ns.TextField = __ds_scope.TextField;

__ds_ns.Icon = __ds_scope.Icon;

})();
