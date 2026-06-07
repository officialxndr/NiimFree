import * as React from "react";

/** Non-blocking inline banner for detections, warnings and mode notes. */
export interface BannerProps {
  variant?: "neutral" | "success" | "warning" | "danger" | "accent";
  /** Leading Lucide icon name. */
  icon?: string;
  title?: string;
  children?: React.ReactNode;
  /** Optional trailing action node (e.g. a Button). */
  action?: React.ReactNode;
  className?: string;
}

export function Banner(props: BannerProps): JSX.Element;
