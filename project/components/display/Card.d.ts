import * as React from "react";

/**
 * Themed surface card — radius lg, hairline border, soft shadow.
 *
 * @startingPoint section="Layout" subtitle="Surface card" viewport="320x160"
 */
export interface CardProps {
  children?: React.ReactNode;
  /** Adds hover-lift + press affordance for tappable cards. */
  pressable?: boolean;
  /** Drop the shadow (flat container). */
  flat?: boolean;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export function Card(props: CardProps): JSX.Element;
