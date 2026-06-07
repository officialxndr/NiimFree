/** BLE scan-list row: printer name, serial (mono), signal strength. */
export interface DeviceRowProps {
  name: string;
  /** Secondary mono line (serial / address). */
  meta?: string;
  /** Signal strength label (e.g. "-58 dBm"); hidden when null. */
  rssi?: string | null;
  /** Lucide icon name. Default "printer". */
  icon?: string;
  onClick?: () => void;
}

export function DeviceRow(props: DeviceRowProps): JSX.Element;
