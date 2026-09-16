/**
 * @fusorb/facet-motion — values layer
 *
 * A motion value is a plain observable number container. It knows nothing
 * about React, the DOM, or CSS — it is simply "this number changes over
 * time and anyone can subscribe." This is the load-bearing abstraction
 * that lets core/ and drivers/ stay decoupled.
 */

export type MotionValueSubscriber = (value: number) => void;
export type Unsubscribe = () => void;

export interface MotionValue {
  /** Current numeric value. */
  get(): number;
  /** Set a new value, notifying subscribers. */
  set(value: number): void;
  /** Subscribe to value changes. Returns an unsubscribe function. */
  subscribe(fn: MotionValueSubscriber): Unsubscribe;
}

/**
 * Create a plain observable motion value.
 *
 * @example
 * const opacity = motionValue(0);
 * opacity.subscribe((v) => console.log(v));        // → 0
 * opacity.set(0.5);                                  // subscriber fires with 0.5
 */
export function motionValue(initial: number): MotionValue {
  let value = initial;
  const subscribers = new Set<MotionValueSubscriber>();

  return {
    get: () => value,
    set: (v: number) => {
      value = v;
      subscribers.forEach((fn) => fn(value));
    },
    subscribe: (fn: MotionValueSubscriber): Unsubscribe => {
      subscribers.add(fn);
      return () => {
        subscribers.delete(fn);
      };
    },
  };
}
