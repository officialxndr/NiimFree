import * as React from "react";

/**
 * Lucide glyph rendered as inline SVG. The web stand-in for the app's
 * `@expo/vector-icons` / `lucide-react-native` set. Requires the global `lucide`
 * UMD script on the page.
 *
 * @startingPoint section="Foundations" subtitle="Lucide icon" viewport="120x120"
 */
export interface IconProps {
  /** Lucide icon name, e.g. "printer", "tags", "qr-code". */
  name: string;
  /** Square size in px. Default 20. */
  size?: number;
  /** SVG stroke width. Default 2. */
  strokeWidth?: number;
  /** Overrides currentColor. */
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function Icon(props: IconProps): JSX.Element;
