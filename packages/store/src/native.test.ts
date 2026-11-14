import { describe, it, expect } from "vitest";
import { createSecureAuthStore, createSecurePersistAdapter } from "./native.js";
import type { SecureStoreBackend, SecureSession } from "./native.js";
import type { User } from "@fusorb/facet-sdk";

const user: User = {
  id: "u1",
  email: "a@b.c",
  name: "Alice",
  memberships: [],
};

function makeBackend(initial: Record<string, string> = {}) {
  const data = new Map<string, string>(Object.entries(initial));
  const backend: SecureStoreBackend = {
    getItemAsync: async (key) => data.get(key) ?? null,
    setItemAsync: async (key, value) => {
      data.set(key, value);
    },
    deleteItemAsync: async (key) => {
      data.delete(key);
    },
  };
  return { backend, data };
}

function makeStore(backend: SecureStoreBackend) {
  return createSecureAuthStore({ storageKey: "test-auth", backend });
}

async function flushPromises(): Promise<void> {
  await new Promise<void>((resolve) => setTimeout(resolve, 0));
}

describe("createSecureAuthStore", () => {
  it("persist writes the full session blob to the backend", async () => {
    const { backend, data } = makeBackend();
    const store = makeStore(backend);

    store.getState().setAuth(user, "access", "refresh", "sess-1");
    await store.getState().persist();

    const raw = data.get("test-auth");
    expect(raw).toBeDefined();
    const parsed = JSON.parse(raw!) as SecureSession;
    expect(parsed).toEqual({ user, accessToken: "access", refreshToken: "refresh", sessionId: "sess-1" });
  });

  it("persist is a no-op without a user or access token", async () => {
    const { backend, data } = makeBackend();
    const store = makeStore(backend);

    store.getState().setTokens("access", "refresh");
    await store.getState().persist();

    expect(data.has("test-auth")).toBe(false);
  });

  it("forget deletes the persisted session", async () => {
    const { backend, data } = makeBackend();
    const store = makeStore(backend);

    store.getState().setAuth(user, "access", "refresh");
    await store.getState().persist();
    expect(data.has("test-auth")).toBe(true);

    await store.getState().forget();
    expect(data.has("test-auth")).toBe(false);
  });

  it("restore hydrates a persisted session", async () => {
    const { backend } = makeBackend({
      "test-auth": JSON.stringify({ user, accessToken: "access", refreshToken: "refresh", sessionId: "sess-2" }),
    });
    const store = makeStore(backend);

    const ok = await store.getState().restore();
    expect(ok).toBe(true);

    const state = store.getState();
    expect(state.accessToken).toBe("access");
    expect(state.refreshToken).toBe("refresh");
    expect(state.sessionId).toBe("sess-2");
    expect(state.isAuthenticated).toBe(true);
    expect(state.isLoading).toBe(false);
  });

  it("restore returns false when nothing is stored", async () => {
    const { backend } = makeBackend();
    const store = makeStore(backend);

    const ok = await store.getState().restore();
    expect(ok).toBe(false);
    expect(store.getState().isLoading).toBe(false);
  });

  it("restore clears and returns false on corrupt data", async () => {
    const { backend, data } = makeBackend({ "test-auth": "not-json" });
    const store = makeStore(backend);

    const ok = await store.getState().restore();
    expect(ok).toBe(false);
    expect(data.has("test-auth")).toBe(false);
  });

  it("setTokens only updates memory, not the backend", async () => {
    const { backend, data } = makeBackend();
    const store = makeStore(backend);

    store.getState().setAuth(user, "access", "refresh");
    store.getState().setTokens("new-access", "new-refresh");

    expect(store.getState().accessToken).toBe("new-access");
    expect(data.has("test-auth")).toBe(false);
  });

  it("serializes writes so a forget cannot be overtaken by an in-flight persist", async () => {
    const order: string[] = [];
    const { backend } = makeBackend();
    const slowBackend: SecureStoreBackend = {
      getItemAsync: backend.getItemAsync,
      setItemAsync: async (key, value, options) => {
        order.push("persist");
        await backend.setItemAsync(key, value, options);
      },
      deleteItemAsync: async (key, options) => {
        order.push("forget");
        await backend.deleteItemAsync(key, options);
      },
    };
    const store = makeStore(slowBackend);

    store.getState().setAuth(user, "access", "refresh");
    const persistPromise = store.getState().persist();
    const forgetPromise = store.getState().forget();

    await Promise.all([persistPromise, forgetPromise]);
    expect(order).toEqual(["persist", "forget"]);
  });
});

describe("createSecurePersistAdapter", () => {
  it("getAccessToken reads from the store", () => {
    const { backend } = makeBackend();
    const store = makeStore(backend);
    store.getState().setAuth(user, "access", "refresh");

    const adapter = createSecurePersistAdapter(store);
    expect(adapter.getAccessToken()).toBe("access");
  });

  it("setAccessToken(token) persists the current session", async () => {
    const { backend, data } = makeBackend();
    const store = makeStore(backend);
    store.getState().setAuth(user, "access", "refresh");

    const adapter = createSecurePersistAdapter(store);
    adapter.setAccessToken("rotated");

    // persist is fire-and-forget; drain the task queue before asserting.
    await flushPromises();
    expect(data.has("test-auth")).toBe(true);
  });

  it("setAccessToken(null) forgets the persisted session", async () => {
    const { backend, data } = makeBackend({
      "test-auth": JSON.stringify({ user, accessToken: "access", refreshToken: "refresh" }),
    });
    const store = makeStore(backend);

    const adapter = createSecurePersistAdapter(store);
    adapter.setAccessToken(null);

    await flushPromises();
    expect(data.has("test-auth")).toBe(false);
  });
});
