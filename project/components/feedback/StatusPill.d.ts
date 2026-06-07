import * as React from "react";

/** Colored status pill for printer/connection state. */
export interface StatusPillProps {
  /** Drives color. Default "idle" (neutral gray dot). */
  status?: "ready" | "warning" | "danger" | "idle";
  /** Optional Lucide icon replacing the dot. */
  icon?: string;
  children?: React.ReactNode;
}

export function StatusPill(props: StatusPillProps): JSX.Element;
