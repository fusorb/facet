import { describe, it, expect, vi } from "vitest";
import { motionValue } from "./motion-value.js";

describe("motionValue", () => {
  it("initializes with the given value", () => {
    const v = motionValue(42);
    expect(v.get()).toBe(42);
  });

  it("set updates the value", () => {
    const v = motionValue(0);
    v.set(10);
    expect(v.get()).toBe(10);
  });

  it("subscribe receives updates", () => {
    const v = motionValue(0);
    const received: number[] = [];
    v.subscribe((val) => received.push(val));

    v.set(1);
    v.set(2);
    v.set(3);

    expect(received).toEqual([1, 2, 3]);
  });

  it("unsubscribe stops receiving updates", () => {
    const v = motionValue(0);
    const received: number[] = [];
    const unsub = v.subscribe((val) => received.push(val));

    v.set(1);
    unsub();
    v.set(2);

    expect(received).toEqual([1]);
  });

  it("multiple subscribers all receive updates", () => {
    const v = motionValue(0);
    const a: number[] = [];
    const b: number[] = [];
    v.subscribe((val) => a.push(val));
    v.subscribe((val) => b.push(val));

    v.set(5);

    expect(a).toEqual([5]);
    expect(b).toEqual([5]);
  });

  it("subscribe returns an unsubscribe function", () => {
    const v = motionValue(0);
    const cb = vi.fn();
    const unsub = v.subscribe(cb);

    expect(typeof unsub).toBe("function");
    v.set(1);
    expect(cb).toHaveBeenCalledTimes(1);
    unsub();
    v.set(2);
    expect(cb).toHaveBeenCalledTimes(1);
  });
});
