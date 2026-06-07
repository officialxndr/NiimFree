import { Icon } from "../icon/Icon";

/* Primary action button. Variants: primary / accent / secondary / ghost / danger.
   Sizes sm / md / lg. Optional leading + trailing icons (Lucide names). */

export function Button({
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

  return (
    <button type={type} className={cls.join(" ")} disabled={disabled} onClick={onClick} {...rest}>
      {icon && <Icon name={icon} size={iconSize} />}
      {children != null && <span>{children}</span>}
      {iconRight && <Icon name={iconRight} size={iconSize} />}
    </button>
  );
}
