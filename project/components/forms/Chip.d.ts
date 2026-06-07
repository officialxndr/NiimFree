import * as React from "react";

/** Pill chip for quick offsets, size presets and filters. */
export interface ChipProps {
  children?: React.ReactNode;
  /** Selected (filled) state. */
  selected?: boolean;
  /** Leading Lucide icon name. */
  icon?: string;
  onClick?: () => void;
  className?: string;
}

export function Chip(props: ChipProps): JSX.Element;
