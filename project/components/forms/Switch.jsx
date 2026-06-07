/* On/off switch. Controlled — green when on, per the status palette. */

export function Switch({ checked = false, onChange, label, disabled = false }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      className={`nf-switch ${checked ? "nf-switch--on" : ""}`}
      onClick={() => onChange && onChange(!checked)}
    >
      <span className="nf-switch__knob" />
    </button>
  );
}
