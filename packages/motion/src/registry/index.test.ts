import { describe, it, expect } from "vitest";
import { registry, get, resolveMotion } from "./index";

describe("registry", () => {
  it("contains a non-empty set of effects", () => {
    expect(Object.keys(registry).length).toBeGreaterThan(0);
  });

  it("get() returns a definition for known effects", () => {
    const effect = get("fade");
    expect(effect).toBeDefined();
    expect(effect?.id).toBe("fade");
    expect(effect?.family).toBe("fade");
  });

  it("get() returns undefined for unknown effects", () => {
    expect(get("nonexistent-animation")).toBeUndefined();
  });

  it("each registry entry has a matching id", () => {
    for (const [id, effect] of Object.entries(registry)) {
      expect(effect.id).toBe(id);
    }
  });

  it("generative effects have resolve functions", () => {
    for (const [, effect] of Object.entries(registry)) {
      if (effect.kind === "generative") {
        expect(typeof effect.resolve).toBe("function");
      }
    }
  });

  it("resolveMotion returns { from, to, transition } for generative effects", () => {
    const result = resolveMotion("fade", { direction: "up" }, {});
    // fade-up should resolve to opacity + translateY
    expect(result).not.toBeNull();
    if (result) {
      expect(result).toHaveProperty("from");
      expect(result).toHaveProperty("to");
      expect(result).toHaveProperty("transition");
    }
  });
});
