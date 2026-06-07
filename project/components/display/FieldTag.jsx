import { Icon } from "../icon/Icon";

/* On-canvas marker for an editable template field (Feature B). */

export function FieldTag({ children, icon = "pencil" }) {
  return (
    <span className="nf-fieldtag">
      <Icon name={icon} />
      {children}
    </span>
  );
}
