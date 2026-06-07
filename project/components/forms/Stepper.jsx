import { Icon } from "../icon/Icon";

/* −/＋ stepper for density, quantity, offset days. Controlled. */

export function Stepper({
  value,
  min = -Infinity,
  max = Infinity,
  step = 1,
  onChange,
  formatValue,
  ariaLabel,
}) {
  const dec = () => onChange && onChange(Math.max(min, value - step));
  const inc = () => onChange && onChange(Math.min(max, value + step));
  return (
    <div className="nf-stepper" role="group" aria-label={ariaLabel}>
      <button className="nf-stepper__btn" onClick={dec} disabled={value <= min} aria-label="Decrease" type="button">
        <Icon name="minus" size={18} />
      </button>
      <div className="nf-stepper__val">{formatValue ? formatValue(value) : value}</div>
      <button className="nf-stepper__btn" onClick={inc} disabled={value >= max} aria-label="Increase" type="button">
        <Icon name="plus" size={18} />
      </button>
    </div>
  );
}
