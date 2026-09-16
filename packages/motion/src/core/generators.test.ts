import { describe, it, expect } from "vitest";
import { tween, spring } from "./generators.js";

describe("tween generator", () => {
  it("interpolates linearly by default", () => {
    const gen = tween({ from: 0, to: 100, duration: 1000 });
    expect(gen(0)).toBe(0);
    expect(gen(500)).toBeCloseTo(50, 5);
    expect(gen(1000)).toBe(100);
  });

  it("clamps to the target after duration", () => {
    const gen = tween({ from: 0, to: 100, duration: 500 });
    expect(gen(1000)).toBe(100);
    expect(gen(2000)).toBe(100);
  });

  it("clamps the start to from value", () => {
    const gen = tween({ from: 30, to: 60, duration: 500 });
    expect(gen(-10)).toBe(30);
    expect(gen(0)).toBe(30);
  });

  it("applies an easing function", () => {
    const easeIn = (t: number) => t * t;
    const gen = tween({ from: 0, to: 100, duration: 1000, ease: easeIn });
    expect(gen(500)).toBeCloseTo(25, 5);
  });

  it("handles negative direction", () => {
    const gen = tween({ from: 100, to: 0, duration: 1000 });
    expect(gen(500)).toBeCloseTo(50, 5);
    expect(gen(1000)).toBe(0);
  });
});

describe("spring generator", () => {
  it("starts at the from value", () => {
    const gen = spring({ from: 0, to: 100, stiffness: 300, damping: 20 });
    expect(gen(0)).toBeCloseTo(0, 5);
  });

  it("converges to the to value", () => {
    const gen = spring({ from: 0, to: 100, stiffness: 300, damping: 20 });
    expect(gen(5000)).toBeCloseTo(100, 1);
  });

  it("overshoots with low damping (underdamped)", () => {
    const gen = spring({ from: 0, to: 100, stiffness: 100, damping: 10 });
    const values = Array.from({ length: 100 }, (_, i) => gen(i * 20));
    expect(Math.max(...values)).toBeGreaterThan(100);
  });

  it("does not overshoot with high damping (overdamped)", () => {
    const gen = spring({ from: 0, to: 100, stiffness: 300, damping: 50 });
    for (let t = 0; t <= 1000; t += 20) {
      expect(gen(t)).toBeLessThanOrEqual(100);
      expect(gen(t)).toBeGreaterThanOrEqual(0);
    }
  });

  it("starts at rest (zero initial velocity)", () => {
    const gen = spring({ from: 0, to: 100, stiffness: 300, damping: 20 });
    const v0 = gen(0);
    const v1 = gen(0.1);
    expect(v1 - v0).toBeCloseTo(0, 3);
  });
});
