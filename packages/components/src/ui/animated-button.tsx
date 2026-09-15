/**
 * @fusorb/facet-components: AnimatedButton
 *
 * A uniform animated button used by composed components (billing pages,
 * feedback page, auth forms) and available to consumers directly. Pick an
 * animation variant, disable it with "none", or fully replace it with
 * your own component via `renderButton`.
 *
 * Usage:
 *   <AnimatedButton animation="sparkle">Get started</AnimatedButton>
 *   <AnimatedButton animation="none">Plain button</AnimatedButton>
 *   <AnimatedButton renderButton={(props) => <MyButton {...props} />}>
 *     Custom
 *   </AnimatedButton>
 */

import * as React from "react";
import { Button } from "./button.js";
import { SparkleButton } from "./animated.js";
import {
  RippleButton,
  MagneticButton,
  ShineButton,
  DissolveButton,
} from "./micro-interactions.js";

export type AnimatedButtonVariant =
  "sparkle" | "ripple" | "magnetic" | "shine" | "dissolve" | "none";

export interface AnimatedButtonRenderProps {
  children?: React.ReactNode;
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  type?: "button" | "submit" | "reset";
  className?: string;
}

export interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Animation variant. Default: "sparkle". */
  animation?: AnimatedButtonVariant;
  /** Fully replace the built-in button with your own component. */
  renderButton?: (props: AnimatedButtonRenderProps) => React.ReactNode;
}

export function AnimatedButton({
  animation = "sparkle",
  renderButton,
  children,
  className,
  type = "button",
  disabled,
  onClick,
  ...props
}: AnimatedButtonProps) {
  const shared = { children, className, type, disabled, onClick };

  if (renderButton) {
    return <>{renderButton(shared)}</>;
  }

  switch (animation) {
    case "sparkle":
      return <SparkleButton {...shared} {...props} />;
    case "ripple":
      return <RippleButton {...shared} {...props} />;
    case "magnetic":
      return <MagneticButton {...shared} {...props} />;
    case "dissolve":
      return <DissolveButton {...shared} {...props} />;
    case "none":
      return <Button {...shared} {...props} />;
    default:
      return <ShineButton {...shared} {...props} />;
  }
}

AnimatedButton.displayName = "AnimatedButton";
