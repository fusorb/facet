import { createContext, useContext } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import type { MotionProps } from "./motion.js";

export const StaggerContext = createContext<number>(100);

export interface StaggerProps extends HTMLAttributes<HTMLDivElement> {
  /** Base delay in ms between each child's animation start. */
  delay?: number;
  children: ReactNode;
}

/**
 * Stagger wraps children and provides a stagger-delay context.
 *
 * Each <Motion> child that reads this context offsets its animation
 * start by `staggerIndex * delay`.
 */
export function Stagger({ delay = 100, children, ...rest }: StaggerProps) {
  return (
    <StaggerContext.Provider value={delay}>
      <div {...rest}>{children}</div>
    </StaggerContext.Provider>
  );
}

export function useStagger(): number {
  return useContext(StaggerContext);
}

export const REVEAL_DEFAULT: Partial<MotionProps> = {
  effect: "reveal",
  direction: "up",
  intensity: "medium",
};
