import * as React from "react";

/** Icon-only button with a 44×44 tap target. */
export interface IconButtonProps {
  /** Lucide icon name. */
  icon: string;
  /** Default "plain"; "tonal" = soft fill, "solid" = primary fill. */
  variant?: "plain" | "tonal" | "solid";
  size?: "sm" | "md";
  disabled?: boolean;
  /** Accessible label (required — icon-only). */
  label?: string;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
}

export function IconButton(props: IconButtonProps): JSX.Element;
