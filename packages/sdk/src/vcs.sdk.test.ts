import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SgClient } from "./client.js";
import { VcSdk } from "./vcs.sdk.js";

describe("VcSdk", () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  let client: SgClient;
  let vcs: VcSdk;

  beforeEach(() => {
    fetchMock = vi.fn();
    globalThis.fetch = fetchMock as unknown as typeof fetch;
    client = new SgClient({ baseUrl: "https://auth.example.dev/api/v1" });
    vcs = new VcSdk(client);
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

  it("list GETs /credentials", async () => {
    mockJson({ success: true, data: [] });
    await vcs.list();
    const [url, init] = lastCall();
    expect(url).toContain("/credentials");
    expect(init.method).toBe("GET");
  });

  it("verify POSTs /credentials/verify with bare response", async () => {
    mockJson({ valid: true });
    const res = await vcs.verify("jwt-cred");
    expect(res.data).toEqual({ valid: true });
    const [url, init] = lastCall();
    expect(url).toContain("/credentials/verify");
    expect(init.method).toBe("POST");
  });

  it("issue POSTs /credentials/issue", async () => {
    mockJson({ success: true, data: {} });
    await vcs.issue({ subjectDid: "did:example:1", credentialSubject: { name: "Ada" } });
    const [url, init] = lastCall();
    expect(url).toContain("/credentials/issue");
    expect(init.method).toBe("POST");
  });

  it("offer POSTs /credentials/offers", async () => {
    mockJson({ success: true, data: { token: "tok", expiresAt: "2024" } });
    await vcs.offer({ credentialId: "c1" });
    const [url] = lastCall();
    expect(url).toContain("/credentials/offers");
  });

  it("revoke POSTs /credentials/revoke", async () => {
    mockJson({ success: true, data: {} });
    await vcs.revoke("c1");
    const [url, init] = lastCall();
    expect(url).toContain("/credentials/revoke");
    expect(init.method).toBe("POST");
  });

  it("acceptOffer POSTs /credentials/offers/:token/accept", async () => {
    mockJson({ success: true, data: {} });
    await vcs.acceptOffer("tok");
    const [url] = lastCall();
    expect(url).toContain("/credentials/offers/tok/accept");
  });

  it("createVerificationSession POSTs /credentials/verify/session (bare)", async () => {
    mockJson({ sessionId: "s1", challenge: "ch", expiresAt: "2024" });
    await vcs.createVerificationSession("c1");
    const [url] = lastCall();
    expect(url).toContain("/credentials/verify/session");
  });

  it("presentForVerification POSTs /credentials/verify/present (bare)", async () => {
    mockJson({ valid: true });
    await vcs.presentForVerification({ sessionId: "s1", credential: {}, proof: {} });
    const [url] = lastCall();
    expect(url).toContain("/credentials/verify/present");
  });

  it("getStatusList GETs /credentials/status-lists/:id (bare)", async () => {
    mockJson({ id: "sl1", bits: "0", status: "active" });
    await vcs.getStatusList("sl1");
    const [url] = lastCall();
    expect(url).toContain("/credentials/status-lists/sl1");
  });

  it("resolveTenantDidDoc GETs /credentials/tenants/:slug/did.json (bare)", async () => {
    mockJson({ did: "did:example:1" });
    await vcs.resolveTenantDidDoc("acme");
    const [url] = lastCall();
    expect(url).toContain("/credentials/tenants/acme/did.json");
  });
});