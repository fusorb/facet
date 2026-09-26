import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { defaultScheduler } from "./scheduler.js";

/**
 * Regression test for a bug where `defaultScheduler` passed the absolute
 * `requestAnimationFrame` timestamp as the first delta, instead of 0.
 * This caused spring generators to jump straight to their settled value
 * (a single-frame snap) rather than animating smoothly.
 */
describe("defaultScheduler", () => {
  const originalRaf = globalThis.requestAnimationFrame;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.requestAnimationFrame = originalRaf;
  });

  it("passes delta=0 on the first rAF frame (not the absolute timestamp)", () => {
    const deltas: number[] = [];
    const rafCallbacks: Array<(now: number) => void> = [];

    globalThis.requestAnimationFrame = vi.fn((cb: (now: number) => void) => {
      rafCallbacks.push(cb);
      return 0;
    });

    defaultScheduler((delta) => deltas.push(delta));

    // First frame – rAF passes an absolute timestamp (e.g. 5432).
    rafCallbacks[0]!(5432);
    expect(deltas[0]).toBe(0); // must be 0, not 5432

    // Second frame – 16 ms later.
    rafCallbacks[1]!(5448);
    expect(deltas[1]).toBe(16);
  });

  it("unschedule stops further callbacks", () => {
    const deltas: number[] = [];
    const rafCallbacks: Array<(now: number) => void> = [];

    globalThis.requestAnimationFrame = vi.fn((cb: (now: number) => void) => {
      rafCallbacks.push(cb);
      return 0;
    });

    const stop = defaultScheduler((delta) => deltas.push(delta));

    rafCallbacks[0]!(1000);
    expect(deltas.length).toBe(1);

    stop();

    rafCallbacks[1]?.(1016);
    expect(deltas.length).toBe(1); // no more deltas after stop
  });
});
