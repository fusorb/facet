import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { sequence } from "./sequence.js";
import { motionValue } from "../values/motion-value.js";
import type { Scheduler } from "./scheduler.js";

function makeScheduler(delta = 10): Scheduler {
  return (cb) => {
    let t = 0;
    const id = setInterval(() => {
      t += delta;
      cb(delta);
    }, delta);
    return () => clearInterval(id);
  };
}

describe("sequence", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("runs steps sequentially", async () => {
    const v1 = motionValue(0);
    const v2 = motionValue(0);
    const sched = makeScheduler(10);
    const controller = sequence([
      { value: v1, to: 1, options: { duration: 50, scheduler: sched } },
      { value: v2, to: 1, options: { duration: 50, scheduler: sched } },
    ]);

    // Step 1 completes at t=50, onComplete fires synchronously
    vi.advanceTimersByTime(50);
    expect(v1.get()).toBe(1);
    expect(v2.get()).toBe(0); // step 2 hasn't started yet

    // Step 2 completes at t=50 after step 1
    vi.advanceTimersByTime(50);
    expect(v2.get()).toBe(1);

    await expect(controller.finished).resolves.toBeUndefined();
  });

  it("stop() halts the sequence", () => {
    const v1 = motionValue(0);
    const v2 = motionValue(0);
    const sched = makeScheduler(10);
    const controller = sequence([
      { value: v1, to: 1, options: { duration: 200, scheduler: sched } },
      { value: v2, to: 1, options: { duration: 50, scheduler: sched } },
    ]);

    vi.advanceTimersByTime(50);
    controller.stop();
    vi.advanceTimersByTime(200);

    // v1 should be partially animated, v2 untouched
    expect(v1.get()).toBeGreaterThan(0);
    expect(v1.get()).toBeLessThan(1);
    expect(v2.get()).toBe(0);
  });
});
