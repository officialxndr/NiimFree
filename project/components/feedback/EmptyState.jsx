import { Icon } from "../icon/Icon";

/* Friendly empty state — illustration glyph + message + CTA. */

export function EmptyState({ icon = "inbox", title, text, action }) {
  return (
    <div className="nf-empty">
      <div className="nf-empty__art"><Icon name={icon} size={34} /></div>
      {title && <div className="nf-empty__title">{title}</div>}
      {text && <div className="nf-empty__text">{text}</div>}
      {action}
    </div>
  );
}
