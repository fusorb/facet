import { describe, it, expect, afterEach, vi } from "vitest";
import { cssDriver, preferReducedMotion } from "./css.js";
import { resolveDuration, resolveEasing } from "./resolve.js";
import { motionValue } from "../values/motion-value.js";

describe("preferReducedMotion", () => {
  const originalMatchMedia = window.matchMedia;

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  it("returns false when no reduce preference", () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: false });
    expect(preferReducedMotion()).toBe(false);
  });

  it("returns true when reduce is requested", () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: true });
    expect(preferReducedMotion()).toBe(true);
  });
});

describe("resolveDuration", () => {
  it("resolves token to milliseconds", () => {
    expect(resolveDuration("instant")).toBe(0);
    expect(resolveDuration("fast")).toBe(150);
    expect(resolveDuration("base")).toBe(250);
    expect(resolveDuration("slow")).toBe(500);
    expect(resolveDuration("cinematic")).toBe(1000);
  });

  it("passes through numeric values", () => {
    expect(resolveDuration(333)).toBe(333);
  });

  it("falls back to base for unknown tokens", () => {
    expect(resolveDuration("unknown" as any)).toBe(250);
  });
});

describe("resolveEasing", () => {
  it("resolves standard to a callable function", () => {
    const ease = resolveEasing("standard");
    expect(typeof ease).toBe("function");
    expect(ease(0)).toBeCloseTo(0, 2);
    expect(ease(1)).toBeCloseTo(1, 2);
  });

  it("resolves linear to identity", () => {
    const ease = resolveEasing("linear");
    expect(ease(0.5)).toBe(0.5);
  });

  it("resolves spring to a callable function", () => {
    const ease = resolveEasing("spring");
    expect(typeof ease).toBe("function");
  });

  it("falls back to linear for unknown tokens", () => {
    const ease = resolveEasing("unknown" as any);
    expect(ease(0.5)).toBe(0.5);
  });
});

describe("cssDriver", () => {
  it("applies initial motion value to element.style", () => {
    const el = document.createElement("div");
    const mv = motionValue(42);
    cssDriver.apply({ style: el.style }, { opacity: mv });
    expect(el.style.opacity).toBe("42");
  });

  it("subscribes to motion value changes", () => {
    const el = document.createElement("div");
    const mv = motionValue(0);
    cssDriver.apply({ style: el.style }, { opacity: mv });

    mv.set(0.5);
    expect(el.style.opacity).toBe("0.5");
  });

  it("applies direct string/number values immediately", () => {
    const el = document.createElement("div");
    cssDriver.apply(
      { style: el.style },
      {
        opacity: 0.5,
        transform: "translateX(10px)",
      },
    );
    expect(el.style.opacity).toBe("0.5");
    expect(el.style.transform).toBe("translateX(10px)");
  });

  it("handles CSS custom properties", () => {
    const el = document.createElement("div");
    const mv = motionValue(100);
    cssDriver.apply({ style: el.style }, { "--my-var": mv });
    expect(el.style.getPropertyValue("--my-var")).toBe("100");
  });

  it("returns inactive handle when prefers-reduced-motion", () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: true });
    const el = document.createElement("div");
    const mv = motionValue(50);
    const handle = cssDriver.apply({ style: el.style }, { opacity: mv });
    expect(handle.active).toBe(false);
    expect(el.style.opacity).toBe("50"); // final value applied directly
    window.matchMedia = vi.fn().mockReturnValue({ matches: false });
  });

  it("cleanup unsubscribes", () => {
    const el = document.createElement("div");
    const mv = motionValue(0);
    const handle = cssDriver.apply({ style: el.style }, { opacity: mv });

    mv.set(0.9);
    expect(el.style.opacity).toBe("0.9");

    handle.cleanup();
    mv.set(0);
    expect(el.style.opacity).toBe("0.9"); // unchanged after cleanup
  });

  it("isSupported returns true in jsdom", () => {
    expect(cssDriver.isSupported()).toBe(true);
  });
});
