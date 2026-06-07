import { Icon } from "../icon/Icon";

/* Transient dark toast — "Saved", "40×30 label detected". */

export function Toast({ icon = "check-circle-2", children }) {
  return (
    <span className="nf-toast">
      {icon && <Icon name={icon} size={18} />}
      {children}
    </span>
  );
}
