import { beforeEach, describe, expect, it } from "vitest";
import { defaultStorage, type TokenStorage } from "./storage.js";

describe("defaultStorage (localStorage)", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("persists tokens under sg_ keys", () => {
    defaultStorage.setTokens("at-1", "rt-1");
    expect(window.localStorage.getItem("sg_access_token")).toBe("at-1");
    expect(window.localStorage.getItem("sg_refresh_token")).toBe("rt-1");
  });

  it("reads back tokens", () => {
    defaultStorage.setTokens("at-2", "rt-2");
    expect(defaultStorage.getAccessToken()).toBe("at-2");
    expect(defaultStorage.getRefreshToken()).toBe("rt-2");
  });

  it("returns null when nothing is stored", () => {
    expect(defaultStorage.getAccessToken()).toBeNull();
    expect(defaultStorage.getRefreshToken()).toBeNull();
  });

  it("clearTokens removes both keys", () => {
    defaultStorage.setTokens("at-3", "rt-3");
    defaultStorage.clearTokens();
    expect(defaultStorage.getAccessToken()).toBeNull();
    expect(defaultStorage.getRefreshToken()).toBeNull();
  });

  it("satisfies the TokenStorage interface", () => {
    const storage: TokenStorage = defaultStorage;
    expect(storage).toBeDefined();
  });
});
