import * as React from "react";

/** Single-line text input with optional label, leading icon, mono mode and hint. */
export interface TextFieldProps {
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  /** Leading Lucide icon name. */
  icon?: string;
  /** Use the monospace face (barcodes, serials, dimensions). */
  mono?: boolean;
  hint?: string;
  type?: string;
  inputMode?: string;
  disabled?: boolean;
  className?: string;
}

export function TextField(props: TextFieldProps): JSX.Element;
