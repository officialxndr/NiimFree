import * as React from "react";

/** On-canvas marker for an editable template field. */
export interface FieldTagProps {
  children?: React.ReactNode;
  /** Lucide icon name. Default "pencil". */
  icon?: string;
}

export function FieldTag(props: FieldTagProps): JSX.Element;
