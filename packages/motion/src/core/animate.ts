/**
 * Core animation engine - `animate()`.
 *
 * Zero DOM knowledge, zero CSS, zero React. Drives a `MotionValue`
 * from its current value to a target using a generator (tween or spring)
 * and a scheduler abstraction. Unit tests run in plain Node with
 * `vi.useFakeTimers()`.
 */

import type { MotionValue } from "../values/motion-value.js";
import { motionValue } from "../values/motion-value.js";
import type { EasingFunction, SpringOpts } from "./generators.js";
import { spring, tween } from "./generators.js";
import type { Scheduler, Unscheduler } from "./scheduler.js";
import { defaultScheduler } from "./scheduler.js";

export type AnimationType = "tween" | "spring";

export interface AnimateOptions {
  /** "tween" (default) or "spring". */
  type?: AnimationType;
  /** Duration in ms (tween only). */
  duration?: number;
  /** Easing function or CSS easing name (tween only). */
  ease?: EasingFunction | string;
  /** Spring stiffness (spring only). */
  stiffness?: number;
  /** Spring damping (spring only). */
  damping?: number;
  /** Spring mass (spring only). */
  mass?: number;
  /** Initial delay in ms. */
  delay?: number;
  /** Inject a custom scheduler (defaults to rAF / setInterval). */
  scheduler?: Scheduler;
  onStart?: () => void;
  onUpdate?: (value: number) => void;
  onComplete?: () => void;
}

export interface AnimationController {
  /** Stop the animation immediately. */
  stop: () => void;
  /** Resolves when the animation completes or is stopped. */
  finished: Promise<void>;
  /** The motion value being driven. */
  value: MotionValue;
}

const DEFAULT_STIFFNESS = 300;
const DEFAULT_DAMPING = 20;
const DEFAULT_TWEEN_DURATION = 300;
const SPRING_SETTLE_THRESHOLD = 0.001;
const SPRING_MAX_DURATION = 5000;

/**
 * Animate a motion value from its current value to `to` over time.
 *
 * @example
 * const v = motionValue(0);
 * const { stop, finished } = animate(v, 1, { type: "spring", stiffness: 300, damping: 20 });
 * finished.then(() => console.log("done"));
 */
export function animate(
  target: MotionValue | number,
  to: number,
  options: AnimateOptions = {},
): AnimationController {
  const value: MotionValue =
    typeof target === "number" ? motionValue(target) : target;

  const from = value.get();
  const {
    type = "tween",
    duration = DEFAULT_TWEEN_DURATION,
    ease,
    stiffness = DEFAULT_STIFFNESS,
    damping = DEFAULT_DAMPING,
    mass,
    delay = 0,
    scheduler = defaultScheduler,
    onStart,
    onUpdate,
    onComplete,
  } = options;

  let generator: (elapsedMs: number) => number;
  let expectedDuration: number;

  if (type === "spring") {
    const sOpts: SpringOpts = { from, to, stiffness, damping, mass };
    generator = spring(sOpts);
    expectedDuration = SPRING_MAX_DURATION;
  } else {
    const eased: EasingFunction =
      typeof ease === "function" ? ease : (t: number) => t;
    generator = tween({ from, to, duration, ease: eased });
    expectedDuration = duration;
  }

  let elapsed = 0;
  let running = true;
  let resolveFinished: () => void;
  const finished = new Promise<void>((resolve) => {
    resolveFinished = resolve;
  });

  const tick = (delta: number) => {
    if (!running) return;
    elapsed += delta;

    const rawValue = generator(elapsed);
    value.set(rawValue);
    onUpdate?.(rawValue);

    const done =
      type === "spring"
        ? Math.abs(rawValue - to) < SPRING_SETTLE_THRESHOLD
        : elapsed >= expectedDuration;

    if (done) {
      running = false;
      stopScheduler?.();
      value.set(to);
      onComplete?.();
      resolveFinished();
    }
  };

  onStart?.();

  let stopScheduler: Unscheduler;

  if (delay > 0) {
    const timer = setTimeout(() => {
      if (!running) return;
      stopScheduler = scheduler(tick);
    }, delay);
    stopScheduler = () => {
      running = false;
      clearTimeout(timer);
    };
  } else {
    stopScheduler = scheduler(tick);
  }

  return {
    stop: () => {
      running = false;
      stopScheduler?.();
      resolveFinished();
    },
    finished,
    value,
  };
}
