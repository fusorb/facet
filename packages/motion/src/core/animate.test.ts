import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { animate } from "./animate.js";
import { motionValue } from "../values/motion-value.js";
import type { Scheduler } from "./scheduler.js";

/** A test scheduler that fires at fixed 10ms intervals. */
function makeScheduler(delta = 10): {
  scheduler: Scheduler;
  ticks: () => number;
} {
  let tickCount = 0;
  const scheduler: Scheduler = (cb) => {
    let t = 0;
    const id = setInterval(() => {
      tickCount++;
      t += delta;
      cb(delta);
    }, delta);
    return () => clearInterval(id);
  };
  return { scheduler, ticks: () => tickCount };
}

describe("animate", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("animates a motion value over time (tween)", () => {
    const v = motionValue(0);
    const { scheduler } = makeScheduler(10);
    animate(v, 1, { duration: 100, scheduler });

    vi.advanceTimersByTime(50);
    expect(v.get()).toBeCloseTo(0.5, 1);

    vi.advanceTimersByTime(100);
    expect(v.get()).toBe(1);
  });

  it("snaps to the exact target on completion", () => {
    const v = motionValue(0);
    const { scheduler } = makeScheduler(10);
    animate(v, 1, { duration: 50, scheduler });

    vi.advanceTimersByTime(60);
    expect(v.get()).toBe(1);
  });

  it("calls onUpdate on each tick", () => {
    const v = motionValue(0);
    const { scheduler } = makeScheduler(10);
    const updates: number[] = [];
    animate(v, 10, {
      duration: 50,
      scheduler,
      onUpdate: (val) => updates.push(val),
    });

    vi.advanceTimersByTime(60);
    expect(updates.length).toBeGreaterThan(0);
    expect(updates[updates.length - 1]).toBeCloseTo(10, 5);
  });

  it("calls onComplete when finished", () => {
    const v = motionValue(0);
    const { scheduler } = makeScheduler(10);
    let completed = false;
    animate(v, 1, {
      duration: 50,
      scheduler,
      onComplete: () => {
        completed = true;
      },
    });

    vi.advanceTimersByTime(60);
    expect(completed).toBe(true);
  });

  it("stop() halts the animation", () => {
    const v = motionValue(0);
    const { scheduler } = makeScheduler(10);
    const controller = animate(v, 1, { duration: 200, scheduler });

    vi.advanceTimersByTime(50);
    expect(v.get()).toBeGreaterThan(0);
    expect(v.get()).toBeLessThan(1);

    controller.stop();
    vi.advanceTimersByTime(200);
    expect(v.get()).toBeLessThan(1);
  });

  it("resolves the finished promise", async () => {
    const v = motionValue(0);
    const { scheduler } = makeScheduler(10);
    const controller = animate(v, 1, { duration: 50, scheduler });

    vi.advanceTimersByTime(60);
    await vi.runAllTimersAsync();
    await expect(controller.finished).resolves.toBeUndefined();
  });

  it("supports delay before start", () => {
    const v = motionValue(0);
    const { scheduler } = makeScheduler(10);
    animate(v, 1, { duration: 50, delay: 20, scheduler });

    vi.advanceTimersByTime(20);
    expect(v.get()).toBe(0); // hasn't started

    vi.advanceTimersByTime(10);
    expect(v.get()).toBeGreaterThan(0); // now running

    vi.advanceTimersByTime(60);
    expect(v.get()).toBe(1);
  });

  it("uses a spring generator when type: spring", () => {
    const v = motionValue(0);
    const { scheduler } = makeScheduler(16);
    animate(v, 100, {
      type: "spring",
      stiffness: 300,
      damping: 20,
      scheduler,
    });

    vi.advanceTimersByTime(5000);
    expect(v.get()).toBeCloseTo(100, 0);
  });

  it("creates an internal motion value when given a number", () => {
    const v = motionValue(0);
    const { scheduler } = makeScheduler(10);
    const controller = animate(v, 1, { duration: 50, scheduler });

    expect(controller.value).toBe(v);
  });
});
