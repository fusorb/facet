import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ArcIdClient } from "./client.js";
import { AuthSdk } from "./auth.sdk.js";

describe("AuthSdk", () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  let client: ArcIdClient;
  let auth: AuthSdk;

  beforeEach(() => {
    fetchMock = vi.fn();
    globalThis.fetch = fetchMock as unknown as typeof fetch;
    client = new ArcIdClient({ baseUrl: "https://auth.example.dev/api/v1" });
    auth = new AuthSdk(client);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function mockJson(body: unknown, status = 200): void {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json" },
      }),
    );
  }

  function lastCall(): [string, RequestInit] {
    const call = fetchMock.mock.calls.at(-1);
    if (!call) throw new Error("fetch not called");
    return call as unknown as [string, RequestInit];
  }

  const user = { id: "u1", email: "a@b.c", name: "Ada", memberships: [] };

  const loginNoMfa = {
    identity: user,
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
    identity: user,
    sessionId: "sess-1",
    requiresMfa: true,
    mfaEnrollmentRequired: false,
    mfaTypes: ["TOTP"],
  };

  it("login posts credentials to /auth/login and unwraps the envelope", async () => {
    mockJson({ success: true, data: loginNoMfa });

    const res = await auth.login("a@b.c", "pw");

    expect(res.data).toEqual(loginNoMfa);
    const [url, init] = lastCall();
    expect(url).toContain("/auth/login");
    expect(JSON.parse(init.body as string)).toEqual({
      email: "a@b.c",
      password: "pw",
    });
  });

  it("login surfaces MFA challenge without tokens", async () => {
    mockJson({ success: true, data: loginWithMfa });

    const res = await auth.login("a@b.c", "pw");

    expect(res.data?.requiresMfa).toBe(true);
    expect(res.data?.sessionId).toBe("sess-1");
    expect(res.data?.accessToken).toBeUndefined();
  });

  it("register returns the identity only (no tokens)", async () => {
    mockJson({ success: true, data: { identity: user } });

    const res = await auth.register("Ada", "a@b.c", "pw");

    expect(res.data).toEqual({ identity: user });
    const [, init] = lastCall();
    expect(JSON.parse(init.body as string)).toEqual({
      name: "Ada",
      email: "a@b.c",
      password: "pw",
    });
  });

  it("verifyMfa posts code + sessionId", async () => {
    mockJson({
      success: true,
      data: {
        sessionId: "sess-1",
        accessToken: "at",
        refreshToken: "rt",
        idToken: null,
        expiresIn: 900,
      },
    });

    await auth.verifyMfa("123456", "sess-1");

    const [url, init] = lastCall();
    expect(url).toContain("/auth/mfa/verify");
    expect(JSON.parse(init.body as string)).toEqual({
      code: "123456",
      sessionId: "sess-1",
    });
  });

  it("forgotPassword posts email to /auth/password/reset", async () => {
    mockJson({ success: true, data: {} });

    await auth.forgotPassword("a@b.c");

    const [url, init] = lastCall();
    expect(url).toContain("/auth/password/reset");
    expect(JSON.parse(init.body as string)).toEqual({ email: "a@b.c" });
  });

  it("refresh posts refresh_token grant and normalizes the bare snake_case response", async () => {
    mockJson({
      access_token: "new-at",
      refresh_token: "new-rt",
      expires_in: 900,
      token_type: "Bearer",
    });

    const res = await auth.refresh("old-rt");

    const [url, init] = lastCall();
    expect(url).toContain("/oauth/token");
    expect(JSON.parse(init.body as string)).toEqual({
      grant_type: "refresh_token",
      refresh_token: "old-rt",
    });
    expect(res.data?.accessToken).toBe("new-at");
    expect(res.data?.refreshToken).toBe("new-rt");
    expect(res.data?.expiresIn).toBe(900);
  });

  it("refresh sends client_id + client_secret when the client is configured", async () => {
    mockJson({
      access_token: "new-at",
      refresh_token: "new-rt",
      expires_in: 900,
      token_type: "Bearer",
    });
    const configured = new ArcIdClient({
      baseUrl: "https://auth.example.dev/api/v1",
      clientId: "my-app",
      clientSecret: "s3cret",
    });
    const authSdk = new AuthSdk(configured);

    await authSdk.refresh("old-rt");

    const [, init] = lastCall();
    expect(JSON.parse(init.body as string)).toEqual({
      grant_type: "refresh_token",
      refresh_token: "old-rt",
      client_id: "my-app",
      client_secret: "s3cret",
    });
  });

  it("exchangeCode posts authorization_code grant with PKCE + client_id", async () => {
    mockJson({
      access_token: "at",
      refresh_token: "rt",
      expires_in: 900,
      token_type: "Bearer",
    });
    const configured = new ArcIdClient({
      baseUrl: "https://auth.example.dev/api/v1",
      clientId: "my-app",
    });
    const authSdk = new AuthSdk(configured);

    const res = await authSdk.exchangeCode({
      code: "auth-code",
      redirectUri: "https://app.dev/callback",
      codeVerifier: "pkce-verifier",
    });

    const [url, init] = lastCall();
    expect(url).toContain("/oauth/token");
    expect(JSON.parse(init.body as string)).toEqual({
      grant_type: "authorization_code",
      code: "auth-code",
      redirect_uri: "https://app.dev/callback",
      client_id: "my-app",
      code_verifier: "pkce-verifier",
    });
    expect(res.data?.accessToken).toBe("at");
  });

  it("clientCredentials posts client_credentials grant", async () => {
    mockJson({
      access_token: "svc-at",
      expires_in: 3600,
      token_type: "Bearer",
    });
    const configured = new ArcIdClient({
      baseUrl: "https://auth.example.dev/api/v1",
      clientId: "svc-client",
      clientSecret: "svc-secret",
    });
    const authSdk = new AuthSdk(configured);

    await authSdk.clientCredentials({ scope: "openid profile" });

    const [, init] = lastCall();
    expect(JSON.parse(init.body as string)).toEqual({
      grant_type: "client_credentials",
      client_id: "svc-client",
      client_secret: "svc-secret",
      scope: "openid profile",
    });
  });

  it("authorize GETs the JSON authorize API and returns the code", async () => {
    mockJson({
      success: true,
      data: { code: "auth-code-123", state: "xyz", consentRequired: false },
    });
    const configured = new ArcIdClient({
      baseUrl: "https://auth.example.dev/api/v1",
      clientId: "my-app",
    });
    const authSdk = new AuthSdk(configured);

    const res = await authSdk.authorize({
      redirectUri: "https://app.dev/callback",
      scope: "openid profile",
      codeChallenge: "challenge",
      state: "xyz",
    });

    const [url, init] = lastCall();
    expect(url).toContain("/oauth/authorize?");
    expect(url).toContain("client_id=my-app");
    expect(url).toContain("code_challenge=challenge");
    expect(init.method).toBe("GET");
    expect(res.data).toEqual({
      code: "auth-code-123",
      state: "xyz",
      consentRequired: false,
    });
  });

  it("authorizeUrl builds the OIDC authorize redirect with PKCE + prompt", () => {
    const url = auth.authorizeUrl({
      clientId: "my-app",
      redirectUri: "https://app.dev/callback",
      scope: "openid profile email",
      state: "xyz",
      codeChallenge: "challenge",
      prompt: "consent",
    });

    expect(url).toBe(
      "https://auth.example.dev/api/v1/oauth/authorize?client_id=my-app&response_type=code&redirect_uri=https%3A%2F%2Fapp.dev%2Fcallback&scope=openid+profile+email&state=xyz&code_challenge=challenge&code_challenge_method=S256&prompt=consent",
    );
  });

  it("switchContext posts tenantId to /auth/switch-context", async () => {
    mockJson({
      success: true,
      data: {
        accessToken: "scoped-at",
        refreshToken: "scoped-rt",
        idToken: null,
        expiresIn: 900,
      },
    });

    const res = await auth.switchContext({ tenantId: "clx123" });

    const [url, init] = lastCall();
    expect(url).toContain("/auth/switch-context");
    expect(JSON.parse(init.body as string)).toEqual({ tenantId: "clx123" });
    expect(res.data?.accessToken).toBe("scoped-at");
  });

  it("revokeSession DELETEs the session endpoint", async () => {
    mockJson({ success: true, data: {} });

    await auth.revokeSession("sess-9");

    const [, init] = lastCall();
    expect(init.method).toBe("DELETE");
    expect(lastCall()[0]).toContain("/auth/sessions/sess-9");
  });

  it("surfaces API errors without throwing", async () => {
    mockJson(
      { success: false, error: "RATE_LIMITED", message: "Slow down" },
      429,
    );

    const res = await auth.login("a@b.c", "pw");

    expect(res.data).toBeNull();
    expect(res.error).toMatchObject({ statusCode: 429, message: "Slow down" });
  });
});
