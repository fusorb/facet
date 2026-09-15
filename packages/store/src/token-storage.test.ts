import { describe, it, expect } from "vitest";
import { createZustandTokenStorage } from "./token-storage.js";
import type { ApiResponse, RefreshResult, ApiError } from "@fusorb/facet-sdk";

/** Minimal fake auth store that satisfies TokenStoreLike. */
function makeFakeStore() {
  const state: { accessToken: string | null; refreshToken: string | null } = {
    accessToken: "old-access",
    refreshToken: "old-refresh",
  };
  return {
    getState: () => ({
      accessToken: state.accessToken,
      refreshToken: state.refreshToken,
    }),
    setTokens: (accessToken: string, refreshToken?: string) => {
      state.accessToken = accessToken;
      if (refreshToken !== undefined) state.refreshToken = refreshToken;
    },
    clearAuth: () => {
      state.accessToken = null;
      state.refreshToken = null;
    },
  };
}

/** Fake SDK refresher with a controllable return value. */
function makeFakeSdk(result: ApiResponse<RefreshResult>) {
  let calledWith: string | null = null;
  return {
    refresh: async (token: string): Promise<ApiResponse<RefreshResult>> => {
      calledWith = token;
      return result;
    },
    getCalledWith: () => calledWith,
  };
}

describe("createZustandTokenStorage", () => {
  it("getAccessToken / getRefreshToken read from the store", () => {
    const store = makeFakeStore();
    const sdk = makeFakeSdk({
      data: { accessToken: "x", refreshToken: "y" },
      error: null,
    });
    const storage = createZustandTokenStorage({ authStore: store, sdk });

    expect(storage.getAccessToken()).toBe("old-access");
    expect(storage.getRefreshToken()).toBe("old-refresh");
  });

  it("setTokens delegates to the store", () => {
    const store = makeFakeStore();
    const sdk = makeFakeSdk({ data: { accessToken: "x" }, error: null });
    const storage = createZustandTokenStorage({ authStore: store, sdk });

    storage.setTokens("new-access", "new-refresh");
    expect(storage.getAccessToken()).toBe("new-access");
    expect(storage.getRefreshToken()).toBe("new-refresh");
  });

  it("clearTokens calls clearAuth on the store", () => {
    const store = makeFakeStore();
    const sdk = makeFakeSdk({ data: { accessToken: "x" }, error: null });
    const storage = createZustandTokenStorage({ authStore: store, sdk });

    storage.clearTokens();
    expect(storage.getAccessToken()).toBeNull();
    expect(storage.getRefreshToken()).toBeNull();
  });

  it("onTokenRefresh calls sdk.refresh with the store's refresh token", async () => {
    const store = makeFakeStore();
    const sdk = makeFakeSdk({
      data: { accessToken: "fresh-access", refreshToken: "fresh-refresh" },
      error: null,
    });
    const storage = createZustandTokenStorage({ authStore: store, sdk });

    const result = await storage.onTokenRefresh("old-access");
    expect(sdk.getCalledWith()).toBe("old-refresh");
    expect(result).toBe("fresh-access");
  });

  it("onTokenRefresh updates the store with new tokens on success", async () => {
    const store = makeFakeStore();
    const sdk = makeFakeSdk({
      data: { accessToken: "fresh-access", refreshToken: "fresh-refresh" },
      error: null,
    });
    const storage = createZustandTokenStorage({ authStore: store, sdk });

    await storage.onTokenRefresh("old-access");
    expect(storage.getAccessToken()).toBe("fresh-access");
    expect(storage.getRefreshToken()).toBe("fresh-refresh");
  });

  it("onTokenRefresh clears auth when sdk returns an error", async () => {
    const store = makeFakeStore();
    const error: ApiError = {
      statusCode: 401,
      error: "Unauthorized",
      message: "bad token",
    };
    const sdk = makeFakeSdk({ data: null, error });
    const storage = createZustandTokenStorage({ authStore: store, sdk });

    const result = await storage.onTokenRefresh("old-access");
    expect(result).toBeNull();
    expect(storage.getAccessToken()).toBeNull();
    expect(storage.getRefreshToken()).toBeNull();
  });

  it("onTokenRefresh clears auth when sdk returns data without access token", async () => {
    const store = makeFakeStore();
    const sdk = makeFakeSdk({ data: {} as RefreshResult, error: null });
    const storage = createZustandTokenStorage({ authStore: store, sdk });

    const result = await storage.onTokenRefresh("old-access");
    expect(result).toBeNull();
    expect(storage.getAccessToken()).toBeNull();
  });

  it("onTokenRefresh returns null when no refresh token is stored", async () => {
    const store = makeFakeStore();
    const sdk = makeFakeSdk({ data: { accessToken: "x" }, error: null });
    const storage = createZustandTokenStorage({ authStore: store, sdk });

    // Clear the refresh token first
    store.clearAuth();
    const result = await storage.onTokenRefresh("old-access");
    expect(result).toBeNull();
    expect(sdk.getCalledWith()).toBeNull();
  });

  it("onTokenRefresh guards against re-entrancy", async () => {
    const store = makeFakeStore();
    let callCount = 0;
    const sdk = {
      refresh: async (): Promise<ApiResponse<RefreshResult>> => {
        callCount++;
        if (callCount === 1) {
          const result = await storage.onTokenRefresh("concurrent");
          expect(result).toBeNull(); // re-entrant call is blocked
        }
        return { data: { accessToken: "fresh" }, error: null };
      },
    };
    const storage = createZustandTokenStorage({ authStore: store, sdk });

    const result = await storage.onTokenRefresh("old-access");
    expect(result).toBe("fresh");
    expect(callCount).toBe(1); // refresh called only once
  });
});
