import * as React from "react";

/** A line of text inside a LabelThumbnail. */
export interface LabelThumbnailLine {
  text: string;
  /** Bold weight. */
  strong?: boolean;
  /** Monospace face (barcodes, serials). */
  mono?: boolean;
  /** Font size in px. */
  size?: number;
  /** Render as an editable-field highlight. */
  field?: boolean;
}

/** Miniature physical label render at the label's true aspect ratio. */
export interface LabelThumbnailProps {
  widthMm?: number;
  heightMm?: number;
  shape?: "rect" | "rounded" | "round" | "cable";
  /** Display width in px (height derived from aspect ratio). */
  size?: number;
  /** Quick text content. */
  lines?: LabelThumbnailLine[];
  /** Custom content (overrides lines). */
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

export function LabelThumbnail(props: LabelThumbnailProps): JSX.Element;
