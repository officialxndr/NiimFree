import { Icon } from "../icon/Icon";

/* Icon-only button (44×44 tap target). Variants: plain / tonal / solid. */

export function IconButton({
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

  return (
    <button
      type="button"
      className={cls.join(" ")}
      disabled={disabled}
      aria-label={label}
      onClick={onClick}
      {...rest}
    >
      <Icon name={icon} size={size === "sm" ? 18 : 22} />
    </button>
  );
}
