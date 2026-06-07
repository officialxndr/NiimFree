/** On/off switch — green when on. Controlled. */
export interface SwitchProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  /** Accessible label. */
  label?: string;
  disabled?: boolean;
}

export function Switch(props: SwitchProps): JSX.Element;
