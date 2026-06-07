import * as React from "react";

/**
 * Friendly empty state with glyph, message and CTA.
 *
 * @startingPoint section="Feedback" subtitle="Empty state" viewport="320x260"
 */
export interface EmptyStateProps {
  /** Lucide icon name. Default "inbox". */
  icon?: string;
  title?: string;
  text?: string;
  /** CTA node (e.g. a Button). */
  action?: React.ReactNode;
}

export function EmptyState(props: EmptyStateProps): JSX.Element;
