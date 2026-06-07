import * as React from "react";

/** Transient dark toast for confirmations and detections. */
export interface ToastProps {
  /** Leading Lucide icon name. Default "check-circle-2". */
  icon?: string;
  children?: React.ReactNode;
}

export function Toast(props: ToastProps): JSX.Element;
