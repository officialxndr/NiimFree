/* Themed surface card. `pressable` for tappable list/grid cards, `flat` to drop the shadow. */

export function Card({ children, pressable = false, flat = false, onClick, className = "", style }) {
  const cls = ["nf-card"];
  if (flat) cls.push("nf-card--flat");
  if (pressable) cls.push("nf-card--pressable");
  if (className) cls.push(className);
  return (
    <div className={cls.join(" ")} onClick={onClick} style={style}>
      {children}
    </div>
  );
}
