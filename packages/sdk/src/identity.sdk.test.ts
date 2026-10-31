import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SgClient } from "./client.js";
import { IdentitySdk } from "./identity.sdk.js";

describe("IdentitySdk", () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  let client: SgClient;
  let identity: IdentitySdk;

  beforeEach(() => {
    fetchMock = vi.fn();
    globalThis.fetch = fetchMock as unknown as typeof fetch;
    client = new SgClient({ baseUrl: "https://auth.example.dev/api/v1" });
    identity = new IdentitySdk(client);
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

  const user = { id: "u1", email: "a@b.c", name: "Ada", memberships: [] };

  it("list GETs /identity/admin with filters", async () => {
    mockJson({ success: true, data: { data: [user], meta: { total: 1, page: 1, limit: 10 } } });
    await identity.list({ search: "ada", status: "ACTIVE", page: 1, limit: 10 });
    const [url] = lastCall();
    expect(url).toContain("/identity/admin");
    expect(url).toContain("search=ada");
    expect(url).toContain("status=ACTIVE");
  });

  it("suspend POSTs /identity/admin/:id/suspend", async () => {
    mockJson({ success: true, data: {} });
    await identity.suspend("u1", "spam");
    const [url, init] = lastCall();
    expect(url).toContain("/identity/admin/u1/suspend");
    expect(init.method).toBe("POST");
  });

  it("reinstate PATCHes /identity/:id/status", async () => {
    mockJson({ success: true, data: {} });
    await identity.reinstate("u1");
    const [url, init] = lastCall();
    expect(url).toContain("/identity/u1/status");
    expect(init.method).toBe("PATCH");
  });

  it("updateProfile PATCHes /identity/profile", async () => {
    mockJson({ success: true, data: {} });
    await identity.updateProfile({ name: "Ada 2" });
    const [url, init] = lastCall();
    expect(url).toContain("/identity/profile");
    expect(init.method).toBe("PATCH");
  });

  it("deleteAccount DELETEs /identity/profile", async () => {
    mockJson({ success: true, data: {} });
    await identity.deleteAccount();
    const [url, init] = lastCall();
    expect(url).toContain("/identity/profile");
    expect(init.method).toBe("DELETE");
  });

  it("listDevices GETs /identity/devices", async () => {
    mockJson({ success: true, data: [] });
    await identity.listDevices();
    const [url] = lastCall();
    expect(url).toContain("/identity/devices");
  });

  it("deleteDevice DELETEs /identity/devices/:id", async () => {
    mockJson({ success: true, data: {} });
    await identity.deleteDevice("d1");
    const [url, init] = lastCall();
    expect(url).toContain("/identity/devices/d1");
    expect(init.method).toBe("DELETE");
  });

  it("listLinkedAccounts GETs /identity/linked-accounts", async () => {
    mockJson({ success: true, data: [] });
    await identity.listLinkedAccounts();
    const [url] = lastCall();
    expect(url).toContain("/identity/linked-accounts");
  });

  it("unlinkLinkedAccount DELETEs /identity/linked-accounts/:id", async () => {
    mockJson({ success: true, data: {} });
    await identity.unlinkLinkedAccount("la1");
    const [url, init] = lastCall();
    expect(url).toContain("/identity/linked-accounts/la1");
    expect(init.method).toBe("DELETE");
  });

  it("listExternalIds GETs /identity/external-ids", async () => {
    mockJson({ success: true, data: [] });
    await identity.listExternalIds();
    const [url] = lastCall();
    expect(url).toContain("/identity/external-ids");
  });

  it("linkExternalId POSTs /identity/external-ids", async () => {
    mockJson({ success: true, data: {} });
    await identity.linkExternalId({ provider: "github", externalId: "gh-1" });
    const [url, init] = lastCall();
    expect(url).toContain("/identity/external-ids");
    expect(init.method).toBe("POST");
  });

  it("unlinkExternalId DELETEs /identity/external-ids/:id", async () => {
    mockJson({ success: true, data: {} });
    await identity.unlinkExternalId("ei1");
    const [url, init] = lastCall();
    expect(url).toContain("/identity/external-ids/ei1");
    expect(init.method).toBe("DELETE");
  });

  it("listDelegations GETs /identity/delegations", async () => {
    mockJson({ success: true, data: [] });
    await identity.listDelegations();
    const [url] = lastCall();
    expect(url).toContain("/identity/delegations");
  });

  it("createDelegation POSTs /identity/delegations", async () => {
    mockJson({ success: true, data: { id: "del1", subjectId: "s1", scope: "read", createdAt: "2024" } });
    await identity.createDelegation({ subjectId: "s1", scope: "read" });
    const [url, init] = lastCall();
    expect(url).toContain("/identity/delegations");
    expect(init.method).toBe("POST");
  });

  it("revokeDelegation DELETEs /identity/delegations/:id", async () => {
    mockJson({ success: true, data: {} });
    await identity.revokeDelegation("del1");
    const [url, init] = lastCall();
    expect(url).toContain("/identity/delegations/del1");
    expect(init.method).toBe("DELETE");
  });

  it("startOnboarding POSTs /identity/onboarding/start", async () => {
    mockJson({ success: true, data: { flowId: "f1", progressId: "p1", currentStep: "s1", steps: [], status: "IN_PROGRESS" } });
    await identity.startOnboarding("f1");
    const [url, init] = lastCall();
    expect(url).toContain("/identity/onboarding/start");
    expect(init.method).toBe("POST");
  });

  it("getOnboardingProgress GETs /identity/onboarding/:id", async () => {
    mockJson({ success: true, data: { flowId: "f1", progressId: "p1", currentStep: "s1", steps: [], status: "IN_PROGRESS" } });
    await identity.getOnboardingProgress("p1");
    const [url] = lastCall();
    expect(url).toContain("/identity/onboarding/p1");
  });

  it("advanceOnboarding POSTs /identity/onboarding/:id/advance", async () => {
    mockJson({ success: true, data: { flowId: "f1", progressId: "p1", currentStep: "s2", steps: [], status: "IN_PROGRESS" } });
    await identity.advanceOnboarding("p1", "s2", { foo: "bar" });
    const [url, init] = lastCall();
    expect(url).toContain("/identity/onboarding/p1/advance");
    expect(init.method).toBe("POST");
  });

  it("registerWalletDid POSTs /identity/wallet/did", async () => {
    mockJson({ success: true, data: {} });
    await identity.registerWalletDid({ publicKeyJwk: {}, provider: "web3", providerWalletId: "w1" });
    const [url, init] = lastCall();
    expect(url).toContain("/identity/wallet/did");
    expect(init.method).toBe("POST");
  });
});