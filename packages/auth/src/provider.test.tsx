import {
  act,
  render,
  renderHook,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ArcIdClient } from "@fusorb/facet-sdk";
import { ArcProvider, useAuth } from "./provider.js";
import { createMemoryStorage } from "./test-storage.js";
import type { AuthUser } from "./types.js";

const USER: AuthUser = {
  id: "u1",
  email: "ada@fusorb.dev",
  name: "Ada Lovelace",
  memberships: [],
  plan: "pro",
  tenantId: "tenant_arc_001",
};

/** Real SovGrant envelope for domain routes. */
function envelope(data: unknown): unknown {
  return { success: true, data };
}

/** Bare RFC 6749 response for /oauth/token. */
const tokenBundle = {
  sessionId: "sess-1",
  accessToken: "at",
  refreshToken: "rt",
  idToken: null,
  expiresIn: 900,
};

const loginNoMfa = {
  identity: USER,
  sessionId: "sess-1",
  requiresMfa: false,
  mfaEnrollmentRequired: false,
  mfaTypes: [],
  accessToken: "at",
  refreshToken: "rt",
  idToken: null,
  expiresIn: 900,
};

const loginWithMfa = {
  identity: USER,
  sessionId: "sess-1",
  requiresMfa: true,
  mfaEnrollmentRequired: false,
  mfaTypes: ["TOTP"],
};

function mockJson(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("ArcProvider", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    globalThis.fetch = fetchMock as unknown as typeof fetch;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function makeClient() {
    return new ArcIdClient({ baseUrl: "https://auth.example.dev/api/v1" });
  }

  it("boots unauthenticated when no token is stored", async () => {
    const storage = createMemoryStorage();
    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => (
        <ArcProvider client={makeClient()} storage={storage}>
          {children}
        </ArcProvider>
      ),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it("restores a session from stored tokens", async () => {
    const storage = createMemoryStorage();
    storage.access = "stored-at";
    storage.refresh = "stored-rt";
    fetchMock.mockResolvedValue(mockJson(envelope(USER)));

    const onSessionRestore = vi.fn();
    const client = makeClient();
    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => (
        <ArcProvider
          client={client}
          storage={storage}
          onSessionRestore={onSessionRestore}
        >
          {children}
        </ArcProvider>
      ),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.user).toEqual(USER);
    expect(result.current.isAuthenticated).toBe(true);
    expect(onSessionRestore).toHaveBeenCalledWith(USER);
    // Stored token must be pushed into the SDK client.
    expect(client.getAccessToken()).toBe("stored-at");
  });

  it("clears tokens when session restore fails", async () => {
    const storage = createMemoryStorage();
    storage.access = "expired-at";
    storage.refresh = "expired-rt";
    // me() fails AND refresh fails
    fetchMock.mockResolvedValue(
      mockJson(
        { success: false, error: "UNAUTHORIZED", message: "expired" },
        401,
      ),
    );

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => (
        <ArcProvider client={makeClient()} storage={storage}>
          {children}
        </ArcProvider>
      ),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(storage.clearCount).toBeGreaterThan(0);
  });

  it("refreshes the session when me() fails but refresh succeeds", async () => {
    const storage = createMemoryStorage();
    storage.access = "old-at";
    storage.refresh = "valid-rt";

    fetchMock
      .mockResolvedValueOnce(
        mockJson(
          { success: false, error: "UNAUTHORIZED", message: "expired" },
          401,
        ),
      ) // me()
      .mockResolvedValueOnce(
        mockJson({
          access_token: "new-at",
          refresh_token: "new-rt",
          expires_in: 900,
        }), // bare refresh
      )
      .mockResolvedValueOnce(mockJson(envelope(USER))); // me() again

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => (
        <ArcProvider client={makeClient()} storage={storage}>
          {children}
        </ArcProvider>
      ),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.user).toEqual(USER);
    expect(result.current.isAuthenticated).toBe(true);
    expect(storage.access).toBe("new-at");
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("login stores tokens and authenticates (no MFA)", async () => {
    const storage = createMemoryStorage();
    fetchMock.mockResolvedValue(mockJson(envelope(loginNoMfa)));

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => (
        <ArcProvider client={makeClient()} storage={storage}>
          {children}
        </ArcProvider>
      ),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.login({ email: "ada@fusorb.dev", password: "pw" });
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(USER);
    expect(storage.access).toBe("at");
    expect(storage.refresh).toBe("rt");
  });

  it("login requires MFA: no tokens stored until verifyMfa", async () => {
    const storage = createMemoryStorage();
    fetchMock
      .mockResolvedValueOnce(mockJson(envelope(loginWithMfa))) // login
      .mockResolvedValueOnce(mockJson(envelope(tokenBundle))) // mfa verify
      .mockResolvedValueOnce(mockJson(envelope(USER))); // me()

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => (
        <ArcProvider client={makeClient()} storage={storage}>
          {children}
        </ArcProvider>
      ),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    let loginRes: Awaited<ReturnType<typeof result.current.login>>;
    await act(async () => {
      loginRes = await result.current.login({
        email: "ada@fusorb.dev",
        password: "pw",
      });
    });

    // MFA gate: sessionId + requiresMfa, no tokens yet.
    expect(loginRes!.data?.requiresMfa).toBe(true);
    expect(result.current.isAuthenticated).toBe(false);
    expect(storage.access).toBeNull();

    await act(async () => {
      await result.current.verifyMfa("123456", loginRes!.data!.sessionId);
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(USER);
    expect(storage.access).toBe("at");
    expect(storage.refresh).toBe("rt");
  });

  it("login surfaces API errors in state", async () => {
    const storage = createMemoryStorage();
    fetchMock.mockResolvedValue(
      mockJson(
        {
          success: false,
          error: "INVALID_CREDENTIALS",
          message: "Bad email or password",
        },
        401,
      ),
    );

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => (
        <ArcProvider client={makeClient()} storage={storage}>
          {children}
        </ArcProvider>
      ),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.login({ email: "ada@fusorb.dev", password: "nope" });
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.error).toBe("Bad email or password");
    expect(storage.access).toBeNull();
  });

  it("logout clears tokens and state", async () => {
    const storage = createMemoryStorage();
    storage.access = "at";
    storage.refresh = "rt";
    fetchMock.mockResolvedValue(mockJson(envelope(USER)));

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => (
        <ArcProvider client={makeClient()} storage={storage}>
          {children}
        </ArcProvider>
      ),
    });

    await waitFor(() => expect(result.current.isAuthenticated).toBe(true));

    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(storage.access).toBeNull();
    expect(storage.refresh).toBeNull();
  });

  it("onAuthChange fires when auth state flips", async () => {
    const storage = createMemoryStorage();
    const onAuthChange = vi.fn();
    fetchMock.mockResolvedValue(mockJson(envelope(loginNoMfa)));

    render(
      <ArcProvider
        client={makeClient()}
        storage={storage}
        onAuthChange={onAuthChange}
      >
        <ConsumerProbe />
      </ArcProvider>,
    );

    const loginButton = await screen.findByRole("button", { name: /login/i });
    await act(async () => {
      loginButton.click();
    });

    await waitFor(() => {
      expect(
        onAuthChange.mock.calls.some((c) => c[0].isAuthenticated === true),
      ).toBe(true);
    });
  });
});

/* ── Helper component that calls useAuth from render ───────── */

function ConsumerProbe() {
  const { login } = useAuth();
  return (
    <button onClick={() => login({ email: "ada@fusorb.dev", password: "pw" })}>
      Login
    </button>
  );
}
