import { Icon } from "../icon/Icon";

/* Single-line text input with optional label, leading icon, mono mode and hint. */

export function TextField({
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
  return (
    <div className={`nf-field ${mono ? "nf-field--mono" : ""} ${className}`}>
      {label && <label className="nf-field__label">{label}</label>}
      <div className="nf-field__control">
        {icon && <Icon name={icon} size={18} />}
        <input
          type={type}
          inputMode={inputMode}
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          onChange={(e) => onChange && onChange(e.target.value)}
          {...rest}
        />
      </div>
      {hint && <span className="nf-field__hint">{hint}</span>}
    </div>
  );
}
