/**
 * @fusorb/facet-motion - frame scheduler.
 *
 * Drives a `MotionValue` from its current value to a target using a generator
 * (tween or spring) and a scheduler abstraction. Unit tests run in plain Node
 * with `vi.useFakeTimers()`.
 */

import type { MotionValue } from "../values/motion-value.js";
import { motionValue } from "../values/motion-value.js";
import type { EasingFunction } from "./generators.js";
import { spring, tween } from "./generators.js";
import type { Scheduler, Unscheduler } from "./scheduler.js";
import { defaultScheduler } from "./scheduler.js";

export type AnimationType = "tween" | "spring";
export type RepeatType = "loop" | "reverse";

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
  /** Intermediate keyframe values between `from` and `to`. */
  keyframes?: number[];
  /** Number of additional repetitions, or "infinite". */
  repeat?: number | "infinite";
  /** "loop" (restart) or "reverse" (alternate/ping-pong). */
  repeatType?: RepeatType;
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
  const keyframes = options.keyframes ?? [];
  const original = [from, ...keyframes, to];
  let waypoints = [...original];
  const n = waypoints.length;

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
    repeat,
    repeatType = "loop",
  } = options;

  let running = true;
  let resolveFinished: () => void;
  const finished = new Promise<void>((resolve) => {
    resolveFinished = resolve;
  });

  let segIndex = 0;
  let segElapsed = 0;
  let gen: (elapsedMs: number) => number;
  let segDuration: number;
  let repeats = 0;

  function createGenerator(
    segFrom: number,
    segTo: number,
  ): { gen: (e: number) => number; dur: number } {
    if (type === "spring") {
      return {
        gen: spring({ from: segFrom, to: segTo, stiffness, damping, mass }),
        dur: SPRING_MAX_DURATION,
      };
    }
    const eased: EasingFunction =
      typeof ease === "function" ? ease : (t: number) => t;
    return {
      gen: tween({ from: segFrom, to: segTo, duration, ease: eased }),
      dur: duration,
    };
  }

  function startSegment(idx: number) {
    const { gen: g, dur } = createGenerator(waypoints[idx]!, waypoints[idx + 1]!);
    gen = g;
    segDuration = dur;
    segElapsed = 0;
    value.set(waypoints[idx]!);
  }

  function tick(delta: number) {
    if (!running) return;
    segElapsed += delta;

    const raw = gen(segElapsed);
    value.set(raw);
    onUpdate?.(raw);

    const done =
      type === "spring"
        ? Math.abs(raw - (waypoints[segIndex + 1] ?? raw)) < SPRING_SETTLE_THRESHOLD
        : segElapsed >= segDuration;

    if (done) {
      value.set(waypoints[segIndex + 1]!);
      segIndex++;

      if (segIndex >= n - 1) {
        const shouldRepeat =
          repeat !== undefined && repeat !== 0 && repeats < (repeat === "infinite" ? Infinity : repeat);

        if (shouldRepeat) {
          repeats++;
          if (repeatType === "reverse") {
            waypoints = [...original].reverse();
            segIndex = n - 2;
          } else {
            waypoints = [...original];
            segIndex = 0;
          }
          startSegment(segIndex);
          return;
        }

        running = false;
        stopScheduler?.();
        onComplete?.();
        resolveFinished();
        return;
      }
      startSegment(segIndex);
    }
  }

  onStart?.();

  let stopScheduler: Unscheduler;

  if (delay > 0) {
    const timer = setTimeout(() => {
      if (!running) return;
      startSegment(segIndex);
      stopScheduler = scheduler(tick);
    }, delay);
    stopScheduler = () => {
      running = false;
      clearTimeout(timer);
    };
  } else {
    startSegment(0);
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
