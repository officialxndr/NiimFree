/* Segmented control — 2–3 short options. Controlled.
   `options` is string[] or { value, label }[]. */

export function SegmentedControl({ options, value, onChange, className = "" }) {
  return (
    <div className={`nf-seg ${className}`} role="tablist">
      {options.map((opt) => {
        const v = typeof opt === "string" ? opt : opt.value;
        const label = typeof opt === "string" ? opt : opt.label;
        const active = v === value;
        return (
          <button
            key={v}
            type="button"
            role="tab"
            aria-selected={active}
            className={`nf-seg__item ${active ? "nf-seg__item--active" : ""}`}
            onClick={() => onChange && onChange(v)}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
