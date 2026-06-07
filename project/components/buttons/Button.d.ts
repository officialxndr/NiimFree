import * as React from "react";

/**
 * Primary action button — full-width by default on mobile screens.
 *
 * @startingPoint section="Forms" subtitle="Action button" viewport="240x72"
 */
export interface ButtonProps {
  /** Visual style. Default "primary". */
  variant?: "primary" | "accent" | "secondary" | "ghost" | "danger";
  /** Height/scale. Default "md" (52px); "lg" is 56px. */
  size?: "sm" | "md" | "lg";
  /** Stretch to container width. */
  fullWidth?: boolean;
  /** Leading Lucide icon name. */
  icon?: string;
  /** Trailing Lucide icon name. */
  iconRight?: string;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  type?: "button" | "submit" | "reset";
  children?: React.ReactNode;
  className?: string;
}

export function Button(props: ButtonProps): JSX.Element;
