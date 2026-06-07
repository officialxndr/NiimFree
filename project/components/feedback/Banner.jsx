import { Icon } from "../icon/Icon";

/* Non-blocking inline banner — "label detected", size-mismatch warning, template-mode note. */

export function Banner({ variant = "neutral", icon, title, children, action, className = "" }) {
  const cls = variant !== "neutral" ? `nf-banner--${variant}` : "";
  return (
    <div className={`nf-banner ${cls} ${className}`}>
      {icon && <Icon name={icon} size={20} />}
      <div className="nf-banner__body">
        {title && <div className="nf-banner__title">{title}</div>}
        {children}
      </div>
      {action}
    </div>
  );
}
