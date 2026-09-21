import { describe, it, expect } from "vitest";
import { stagger } from "./stagger.js";

describe("stagger", () => {
  it("computes delays from start (default)", () => {
    expect(stagger(100, { count: 5, from: "start" })).toEqual([
      0, 100, 200, 300, 400,
    ]);
  });

  it("computes delays from center", () => {
    expect(stagger(100, { count: 5, from: "center" })).toEqual([
      200, 100, 0, 100, 200,
    ]);
  });

  it("computes delays from end", () => {
    expect(stagger(100, { count: 5, from: "end" })).toEqual([
      400, 300, 200, 100, 0,
    ]);
  });

  it("returns [0] for count = 1", () => {
    expect(stagger(100, { count: 1 })).toEqual([0]);
  });

  it("defaults to count = 1", () => {
    expect(stagger(100)).toEqual([0]);
  });

  it("uses 0 delay", () => {
    expect(stagger(0, { count: 3 })).toEqual([0, 0, 0]);
  });

  it("center with even count distributes symmetrically", () => {
    const result = stagger(100, { count: 4, from: "center" });
    expect(result).toEqual([200, 100, 0, 100]);
  });
});
