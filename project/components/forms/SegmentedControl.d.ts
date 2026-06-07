/** Segmented control for 2–3 short options (My/Starter templates, design/print toggle). */
export interface SegmentedControlProps {
  options: Array<string | { value: string; label: string }>;
  value: string;
  onChange?: (value: string) => void;
  className?: string;
}

export function SegmentedControl(props: SegmentedControlProps): JSX.Element;
