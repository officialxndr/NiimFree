import { Icon } from "../icon/Icon";

/* Colored status pill — printer/connection state. */

export function StatusPill({ status = "idle", children, icon }) {
  const cls = status !== "idle" ? `nf-pill--${status}` : "";
  return (
    <span className={`nf-pill ${cls}`}>
      {icon ? <Icon name={icon} size={14} /> : <span className="nf-pill__dot" />}
      {children}
    </span>
  );
}
