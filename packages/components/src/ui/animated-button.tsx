/**
 * @fusorb/facet-components: AnimatedButton
 *
 * A uniform animated button used by composed components (billing pages,
 * feedback page, auth forms) and available to consumers directly. Pick an
 * animation variant, disable it with "none", or fully replace it with
 * your own component via `renderButton`.
 *
 * Default animation is "shine" (a light sweep). The burst/sparkle effect
 * remains available as the standalone `SparkleButton`.
 *
 * Usage:
 *   <AnimatedButton>Get started</AnimatedButton>
 *   <AnimatedButton animation="none">Plain button</AnimatedButton>
 *   <AnimatedButton renderButton={(props) => <MyButton {...props} />}>
 *     Custom
 *   </AnimatedButton>
 */

import * as React from "react";
import { Button, buttonVariants } from "./button.js";
import {
  RippleButton,
  MagneticButton,
  ShineButton,
  DissolveButton,
} from "./micro-interactions.js";
import { cn } from "../utils.js";

export type AnimatedButtonVariant =
  | "ripple"
  | "magnetic"
  | "shine"
  | "dissolve"
  | "none";

export interface AnimatedButtonRenderProps {
  children?: React.ReactNode;
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  type?: "button" | "submit" | "reset";
  className?: string;
}

export interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Animation variant. Default: "shine". */
  animation?: AnimatedButtonVariant;
  /** Fully replace the built-in button with your own component. */
  renderButton?: (props: AnimatedButtonRenderProps) => React.ReactNode;
}

export function AnimatedButton({
  animation = "shine",
  renderButton,
  children,
  className,
  type = "button",
  disabled,
  onClick,
  ...props
}: AnimatedButtonProps) {
  const shared = { children, className, type, disabled, onClick };
  // Ripple / magnetic / shine are unstyled effect wrappers, so give them the
  // full Button surface; dissolve bakes its own styling in.
  const styled = { ...shared, className: cn(buttonVariants(), className) };

  if (renderButton) {
    return <>{renderButton(shared)}</>;
  }

  switch (animation) {
    case "ripple":
      return <RippleButton {...styled} {...props} />;
    case "magnetic":
      return <MagneticButton {...styled} {...props} />;
    case "dissolve":
      return <DissolveButton {...shared} {...props} />;
    case "none":
      return <Button {...shared} {...props} />;
    default:
      return <ShineButton {...styled} {...props} />;
  }
}

AnimatedButton.displayName = "AnimatedButton";
