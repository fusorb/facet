import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SgClient } from "./client.js";
import { OAuthSdk } from "./oauth.sdk.js";

describe("OAuthSdk", () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  let client: SgClient;
  let oauth: OAuthSdk;

  beforeEach(() => {
    fetchMock = vi.fn();
    globalThis.fetch = fetchMock as unknown as typeof fetch;
    client = new SgClient({ baseUrl: "https://auth.example.dev/api/v1" });
    oauth = new OAuthSdk(client);
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

  const oauthClient = { id: "oc1", name: "My App", redirectUris: ["https://app/cb"], createdAt: "2024" };

  it("listClients GETs /oauth/clients", async () => {
    mockJson({ success: true, data: [oauthClient] });
    const res = await oauth.listClients();
    expect(res.data).toEqual([oauthClient]);
    const [url, init] = lastCall();
    expect(url).toContain("/oauth/clients");
    expect(init.method).toBe("GET");
  });

  it("createClient POSTs /oauth/clients", async () => {
    mockJson({ success: true, data: oauthClient });
    await oauth.createClient({ name: "My App", redirectUris: ["https://app/cb"] });
    const [url, init] = lastCall();
    expect(url).toContain("/oauth/clients");
    expect(init.method).toBe("POST");
  });

  it("updateClient PATCHes /oauth/clients/:id", async () => {
    mockJson({ success: true, data: oauthClient });
    await oauth.updateClient("oc1", { name: "Renamed" });
    const [url, init] = lastCall();
    expect(url).toContain("/oauth/clients/oc1");
    expect(init.method).toBe("PATCH");
  });

  it("deleteClient DELETEs /oauth/clients/:id", async () => {
    mockJson({ success: true, data: {} });
    await oauth.deleteClient("oc1");
    const [url, init] = lastCall();
    expect(url).toContain("/oauth/clients/oc1");
    expect(init.method).toBe("DELETE");
  });

  it("listTokens GETs /oauth/tokens", async () => {
    mockJson({ success: true, data: [] });
    await oauth.listTokens();
    const [url] = lastCall();
    expect(url).toContain("/oauth/tokens");
  });

  it("revokeToken DELETEs /oauth/tokens/:id", async () => {
    mockJson({ success: true, data: {} });
    await oauth.revokeToken("tok1");
    const [url, init] = lastCall();
    expect(url).toContain("/oauth/tokens/tok1");
    expect(init.method).toBe("DELETE");
  });

  it("grantConsent POSTs /oauth/consent", async () => {
    mockJson({ success: true, data: {} });
    await oauth.grantConsent({ clientId: "oc1", scopes: ["openid"] });
    const [url, init] = lastCall();
    expect(url).toContain("/oauth/consent");
    expect(init.method).toBe("POST");
  });

  it("revokeConsent DELETEs /oauth/consent/:id", async () => {
    mockJson({ success: true, data: {} });
    await oauth.revokeConsent("oc1");
    const [url, init] = lastCall();
    expect(url).toContain("/oauth/consent/oc1");
    expect(init.method).toBe("DELETE");
  });

  it("listConsents GETs /oauth/consents", async () => {
    mockJson({ success: true, data: [] });
    await oauth.listConsents();
    const [url] = lastCall();
    expect(url).toContain("/oauth/consents");
  });

  it("introspectToken POSTs /oauth/introspect", async () => {
    mockJson({ success: true, data: { active: true } });
    await oauth.introspectToken("tok");
    const [url, init] = lastCall();
    expect(url).toContain("/oauth/introspect");
    expect(init.method).toBe("POST");
  });

  it("revokeTokenRFC7009 POSTs /oauth/revoke", async () => {
    mockJson({ success: true, data: {} });
    await oauth.revokeTokenRFC7009("tok", "access_token");
    const [url, init] = lastCall();
    expect(url).toContain("/oauth/revoke");
    expect(init.method).toBe("POST");
  });

  it("userinfo GETs /oauth/userinfo with bare response", async () => {
    mockJson({ sub: "u1", email: "a@b.c" });
    const res = await oauth.userinfo();
    expect(res.data).toEqual({ sub: "u1", email: "a@b.c" });
    const [url, init] = lastCall();
    expect(url).toContain("/oauth/userinfo");
    expect(init.method).toBe("GET");
  });

  it("jwks GETs /oauth/jwks with bare response", async () => {
    mockJson({ keys: [] });
    const res = await oauth.jwks();
    expect(res.data).toEqual({ keys: [] });
    const [url] = lastCall();
    expect(url).toContain("/oauth/jwks");
  });
});