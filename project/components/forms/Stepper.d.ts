/** −/＋ stepper for density (1–5), quantity, or date-offset days. Controlled. */
export interface StepperProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange?: (value: number) => void;
  /** Format the displayed value, e.g. (n) => `+${n}d`. */
  formatValue?: (value: number) => React.ReactNode;
  ariaLabel?: string;
}

import * as React from "react";
export function Stepper(props: StepperProps): JSX.Element;
