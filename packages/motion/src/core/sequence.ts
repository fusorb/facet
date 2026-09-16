/**
 * Core: sequential animation.
 *
 * Runs a series of animations one after another — useful for multi-step
 * transitions (e.g. fade out old view, then fade in new view).
 */

import type { MotionValue } from "../values/motion-value.js";
import { motionValue } from "../values/motion-value.js";
import type { AnimateOptions, AnimationController } from "./animate.js";
import { animate } from "./animate.js";

export interface SequenceStep {
  /** Motion value to animate; if a number, a throwaway is created. */
  value: MotionValue | number;
  /** Target value. */
  to: number;
  /** Animation options for this step. */
  options?: AnimateOptions;
}

/**
 * Run animations sequentially.
 *
 * Each step waits for the previous to complete before starting.
 * Returns a controller with `stop()` and `finished` promise.
 *
 * @example
 * await sequence([
 *   { value: opacity, to: 0, options: { duration: 200 } },
 *   { value: opacity, to: 1, options: { duration: 200 } },
 * ]);
 */
export function sequence(steps: SequenceStep[]): AnimationController {
  let running = true;
  let currentController: AnimationController | null = null;

  let resolveFinished: () => void;
  const finished = new Promise<void>((resolve) => {
    resolveFinished = resolve;
  });

  playStep(0);

  function playStep(index: number): void {
    if (index >= steps.length || !running) {
      resolveFinished();
      return;
    }
    const step = steps[index]!
    currentController = animate(step.value, step.to, {
      ...step.options,
      onComplete: () => playStep(index + 1),
    });
  }

  return {
    stop: () => {
      running = false;
      currentController?.stop();
      resolveFinished();
    },
    finished,
    value: (currentController as AnimationController | null)?.value ?? motionValue(0),
  };
}
