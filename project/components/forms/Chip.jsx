import { Icon } from "../icon/Icon";

/* Pill chip — quick offset chips, size presets, filters. Toggleable when `selected` driven. */

export function Chip({ children, selected = false, icon, onClick, className = "" }) {
  return (
    <button
      type="button"
      className={`nf-chip ${selected ? "nf-chip--selected" : ""} ${className}`}
      onClick={onClick}
      aria-pressed={selected}
    >
      {icon && <Icon name={icon} size={15} />}
      {children}
    </button>
  );
}
