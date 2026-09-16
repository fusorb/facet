import { Motion } from "./motion.js";
import type { MotionProps } from "./motion.js";

export interface RevealProps extends Omit<MotionProps, "effect" | "direction"> {
  /** Override the reveal direction. Defaults to "up". */
  direction?: MotionProps["direction"];
}

/**
 * Reveal is a thin convenience wrapper around <Motion> using the
 * `reveal` family (scaleY / opacity clip reveal).
 */
export function Reveal({
  direction = "up",
  intensity,
  duration,
  ease,
  delay,
  initial = true,
  children,
  ...rest
}: RevealProps) {
  return (
    <Motion
      effect="reveal"
      direction={direction}
      intensity={intensity}
      duration={duration}
      ease={ease}
      delay={delay}
      initial={initial}
      {...rest}
    >
      {children}
    </Motion>
  );
}
