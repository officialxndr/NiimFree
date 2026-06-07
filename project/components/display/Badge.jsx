import { Icon } from "../icon/Icon";

/* Small status/count badge. `mono` variant for dimensions. */

export function Badge({ children, variant = "neutral", icon }) {
  const cls = variant !== "neutral" ? `nf-badge--${variant}` : "";
  return (
    <span className={`nf-badge ${cls}`}>
      {icon && <Icon name={icon} size={12} />}
      <span>{children}</span>
    </span>
  );
}
