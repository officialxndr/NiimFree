import { Icon } from "../icon/Icon";

/* BLE scan-list row — printer name + serial + signal. */

export function DeviceRow({ name, meta, rssi, icon = "printer", onClick }) {
  return (
    <div className="nf-devicerow" onClick={onClick} role="button">
      <div className="nf-devicerow__icon"><Icon name={icon} size={20} /></div>
      <div className="nf-devicerow__main">
        <div className="nf-devicerow__name">{name}</div>
        {meta && <div className="nf-devicerow__meta">{meta}</div>}
      </div>
      {rssi != null && (
        <div className="nf-devicerow__rssi">
          <Icon name="signal" size={16} />
          {rssi}
        </div>
      )}
    </div>
  );
}
