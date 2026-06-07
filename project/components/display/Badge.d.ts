import * as React from "react";

/** Small count/status badge. */
export interface BadgeProps {
  children?: React.ReactNode;
  variant?: "neutral" | "primary" | "accent" | "success" | "mono";
  /** Leading Lucide icon name. */
  icon?: string;
}

export function Badge(props: BadgeProps): JSX.Element;
