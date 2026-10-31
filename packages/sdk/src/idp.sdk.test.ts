import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SgClient } from "./client.js";
import { IdpSdk } from "./idp.sdk.js";

describe("IdpSdk", () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  let client: SgClient;
  let idp: IdpSdk;

  beforeEach(() => {
    fetchMock = vi.fn();
    globalThis.fetch = fetchMock as unknown as typeof fetch;
    client = new SgClient({ baseUrl: "https://auth.example.dev/api/v1" });
    idp = new IdpSdk(client);
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

  const conn = { id: "c1", name: "Okta", type: "SAML2" as const, enabled: true, createdAt: "2024-01-01" };

  it("listConnections GETs /idp/connections", async () => {
    mockJson({ success: true, data: [conn] });
    const res = await idp.listConnections();
    expect(res.data).toEqual([conn]);
    const [url, init] = lastCall();
    expect(url).toContain("/idp/connections");
    expect(init.method).toBe("GET");
  });

  it("getConnection GETs /idp/connections/:id", async () => {
    mockJson({ success: true, data: conn });
    await idp.getConnection("c1");
    const [url] = lastCall();
    expect(url).toContain("/idp/connections/c1");
  });

  it("createConnection POSTs to /idp/connections", async () => {
    mockJson({ success: true, data: conn });
    await idp.createConnection({ tenantId: "t1", name: "Okta", type: "SAML2" });
    const [url, init] = lastCall();
    expect(url).toContain("/idp/connections");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body as string)).toMatchObject({ name: "Okta", type: "SAML2" });
  });

  it("updateConnection PATCHes /idp/connections/:id", async () => {
    mockJson({ success: true, data: conn });
    await idp.updateConnection("c1", { name: "Okta 2" });
    const [url, init] = lastCall();
    expect(url).toContain("/idp/connections/c1");
    expect(init.method).toBe("PATCH");
  });

  it("deleteConnection DELETEs /idp/connections/:id", async () => {
    mockJson({ success: true, data: {} });
    await idp.deleteConnection("c1");
    const [, init] = lastCall();
    expect(init.method).toBe("DELETE");
  });
});