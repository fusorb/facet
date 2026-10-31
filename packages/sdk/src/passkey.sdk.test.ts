import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SgClient } from "./client.js";
import { PasskeySdk } from "./passkey.sdk.js";

describe("PasskeySdk", () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  let client: SgClient;
  let passkey: PasskeySdk;

  beforeEach(() => {
    fetchMock = vi.fn();
    globalThis.fetch = fetchMock as unknown as typeof fetch;
    client = new SgClient({ baseUrl: "https://auth.example.dev/api/v1" });
    passkey = new PasskeySdk(client);
  });

  afterEach(() => vi.restoreAllMocks());

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

  it("list GETs /auth/passkey", async () => {
    mockJson({ success: true, data: [] });
    await passkey.list();
    const [url, init] = lastCall();
    expect(url).toContain("/auth/passkey");
    expect(init.method).toBe("GET");
  });

  it("registrationOptions POSTs /auth/passkey/options/register", async () => {
    mockJson({ success: true, data: { options: {}, challengeId: "ch1" } });
    await passkey.registrationOptions();
    const [url, init] = lastCall();
    expect(url).toContain("/auth/passkey/options/register");
    expect(init.method).toBe("POST");
  });

  it("register POSTs /auth/passkey/register", async () => {
    mockJson({ success: true, data: { passkey: { id: "p1", credentialId: "c", createdAt: "2024" }, user: { id: "u1", email: "a@b.c", name: "Ada", memberships: [] } } });
    await passkey.register({ response: {}, challengeId: "ch1" });
    const [url, init] = lastCall();
    expect(url).toContain("/auth/passkey/register");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body as string)).toMatchObject({ challengeId: "ch1" });
  });

  it("authenticationOptions POSTs /auth/passkey/options/authenticate", async () => {
    mockJson({ success: true, data: { options: {}, challengeId: "ch2" } });
    await passkey.authenticationOptions("u1");
    const [url] = lastCall();
    expect(url).toContain("/auth/passkey/options/authenticate");
  });

  it("authenticate POSTs /auth/passkey/authenticate", async () => {
    mockJson({ success: true, data: { accessToken: "at", refreshToken: "rt", user: { id: "u1", email: "a@b.c", name: "Ada", memberships: [] } } });
    await passkey.authenticate({ response: {}, challengeId: "ch2" });
    const [url, init] = lastCall();
    expect(url).toContain("/auth/passkey/authenticate");
    expect(init.method).toBe("POST");
  });

  it("deregister DELETEs /auth/passkey/:id", async () => {
    mockJson({ success: true, data: {} });
    await passkey.deregister("p1");
    const [, init] = lastCall();
    expect(init.method).toBe("DELETE");
  });
});