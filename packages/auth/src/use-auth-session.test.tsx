import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useAuthSession } from "./provider.js";

describe("useAuthSession", () => {
  it("returns a signed-out session when no SgProvider is present", () => {
    const { result } = renderHook(() => useAuthSession());
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(typeof result.current.signOut).toBe("function");
  });

  it("signOut is a no-op (does not throw) without a provider", () => {
    const { result } = renderHook(() => useAuthSession());
    expect(() => result.current.signOut()).not.toThrow();
  });
});
