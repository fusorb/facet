import { describe, it, expect } from "vitest";

import {
  decodeState,
  encodeState,
  getArtifactKind,
  inferControls,
  inferControlType,
  listArtifactKinds,
  registerArtifactKind,
  toCode,
} from "./index.js";

describe("artifact kind registry", () => {
  it("registers, resolves and lists kinds", () => {
    const kind = {
      id: "core-test",
      label: "Test",
      defaultViewport: { fit: "content", scroll: "none" } as const,
      render: () => null,
    };
    registerArtifactKind(kind);
    expect(getArtifactKind("core-test")).toBe(kind);
    expect(listArtifactKinds()).toContain(kind);
  });

  it("throws on duplicate registration", () => {
    const makeKind = (label: string) => ({
      id: "core-dup",
      label,
      defaultViewport: { fit: "content", scroll: "none" } as const,
      render: () => null,
    });
    registerArtifactKind(makeKind("A"));
    expect(() => registerArtifactKind(makeKind("B"))).toThrow();
  });
});

describe("control inference", () => {
  it("maps runtime values to control types", () => {
    expect(inferControlType(true)).toBe("boolean");
    expect(inferControlType(42)).toBe("number");
    expect(inferControlType("x")).toBe("string");
    expect(inferControlType(["a", "b"])).toBe("select");
  });

  it("builds a schema from values", () => {
    const schema = inferControls({ size: "sm", disabled: false, count: 3 });
    expect(schema.fields).toHaveLength(3);
    expect(schema.fields[0]).toMatchObject({ name: "size", type: "string" });
    expect(schema.fields[2]).toMatchObject({ name: "count", type: "number" });
  });
});

describe("toCode", () => {
  it("renders quoted string props and boolean shorthand", () => {
    expect(toCode({ size: "sm", disabled: true })).toBe(
      '<Component size="sm" disabled />',
    );
  });

  it("omits falsy and missing defaults", () => {
    expect(toCode({ disabled: false, size: undefined })).toBe("<Component />");
  });
});

describe("state encode/decode", () => {
  it("round-trips values", () => {
    const values = { size: "sm", disabled: true, count: 3 };
    expect(decodeState(encodeState(values))).toEqual(values);
  });

  it("returns empty state on malformed input", () => {
    expect(decodeState("not-json")).toEqual({});
  });
});
