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
    const [url, init] = lastCall();
    expect(url).toContain("/identity/admin");
    expect(url).toContain("search=ada");
    expect(url).toContain("status=ACTIVE");
    expect(init.method).toBe("GET");
  });

  it("suspend POSTs /identity/admin/:id/suspend", async () => {
    mockJson({ success: true, data: {} });
    await identity.suspend("u1", "spam");
    const [url, init] = lastCall();
    expect(url).toContain("/identity/admin/u1/suspend");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body as string)).toEqual({ reason: "spam" });
  });

  it("reinstate PATCHes /identity/:id/status", async () => {
    mockJson({ success: true, data: {} });
    await identity.reinstate("u1");
    const [url, init] = lastCall();
    expect(url).toContain("/identity/u1/status");
    expect(init.method).toBe("PATCH");
    expect(JSON.parse(init.body as string)).toEqual({ status: "ACTIVE" });
  });

  it("reinstate PATCHes /identity/:id/status with reason", async () => {
    mockJson({ success: true, data: {} });
    await identity.reinstate("u1", "appeal");
    const [url, init] = lastCall();
    expect(url).toContain("/identity/u1/status");
    expect(init.method).toBe("PATCH");
    expect(JSON.parse(init.body as string)).toEqual({ status: "ACTIVE", reason: "appeal" });
  });

  it("updateProfile PATCHes /identity/profile", async () => {
    mockJson({ success: true, data: {} });
    await identity.updateProfile({ name: "Ada 2" });
    const [url, init] = lastCall();
    expect(url).toContain("/identity/profile");
    expect(init.method).toBe("PATCH");
    expect(JSON.parse(init.body as string)).toEqual({ name: "Ada 2" });
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
    const [url, init] = lastCall();
    expect(url).toContain("/identity/devices");
    expect(init.method).toBe("GET");
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
    const [url, init] = lastCall();
    expect(url).toContain("/identity/linked-accounts");
    expect(init.method).toBe("GET");
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
    const [url, init] = lastCall();
    expect(url).toContain("/identity/external-ids");
    expect(init.method).toBe("GET");
  });

  it("linkExternalId POSTs /identity/external-ids with route payload", async () => {
    const extId = { id: "ei1", type: "nin", displayValue: "NIN ***1234", verified: false, createdAt: "2024-01-01" };
    mockJson({ success: true, data: extId });
    const res = await identity.linkExternalId({ type: "nin", value: "12345678901", displayValue: "NIN ***1234" });
    expect(res.data).toEqual(extId);
    const [url, init] = lastCall();
    expect(url).toContain("/identity/external-ids");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body as string)).toEqual({
      type: "nin",
      value: "12345678901",
      displayValue: "NIN ***1234",
    });
  });

  it("verifyExternalId POSTs /identity/external-ids/:id/verify", async () => {
    mockJson({ success: true, data: { success: true, type: "nin" } });
    const res = await identity.verifyExternalId("ei1");
    expect(res.data).toEqual({ success: true, type: "nin" });
    const [url, init] = lastCall();
    expect(url).toContain("/identity/external-ids/ei1/verify");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body as string)).toEqual({});
  });

  it("confirmExternalId POSTs /identity/external-ids/:id/confirm with code", async () => {
    const extId = { id: "ei1", type: "nin", displayValue: "NIN ***1234", verified: true, createdAt: "2024-01-01" };
    mockJson({ success: true, data: extId });
    const res = await identity.confirmExternalId("ei1", { code: "123456" });
    expect(res.data).toEqual(extId);
    const [url, init] = lastCall();
    expect(url).toContain("/identity/external-ids/ei1/confirm");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body as string)).toEqual({ code: "123456" });
  });

  it("unlinkExternalId DELETEs /identity/external-ids/:id", async () => {
    mockJson({ success: true, data: {} });
    await identity.unlinkExternalId("ei1");
    const [url, init] = lastCall();
    expect(url).toContain("/identity/external-ids/ei1");
    expect(init.method).toBe("DELETE");
  });


  it("startOnboarding POSTs /identity/onboarding/start", async () => {
    mockJson({ success: true, data: { flowId: "f1", progressId: "p1", currentStep: "s1", steps: [], status: "IN_PROGRESS" } });
    await identity.startOnboarding("f1");
    const [url, init] = lastCall();
    expect(url).toContain("/identity/onboarding/start");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body as string)).toEqual({ flowId: "f1" });
  });

  it("getOnboardingProgress GETs /identity/onboarding/:id", async () => {
    mockJson({ success: true, data: { flowId: "f1", progressId: "p1", currentStep: "s1", steps: [], status: "IN_PROGRESS" } });
    await identity.getOnboardingProgress("p1");
    const [url, init] = lastCall();
    expect(url).toContain("/identity/onboarding/p1");
    expect(init.method).toBe("GET");
  });

  it("advanceOnboarding POSTs /identity/onboarding/:id/advance", async () => {
    mockJson({ success: true, data: { flowId: "f1", progressId: "p1", currentStep: "s2", steps: [], status: "IN_PROGRESS" } });
    await identity.advanceOnboarding("p1", "s2", { foo: "bar" });
    const [url, init] = lastCall();
    expect(url).toContain("/identity/onboarding/p1/advance");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body as string)).toEqual({ stepId: "s2", foo: "bar" });
  });

  it("registerWalletDid POSTs /identity/wallet/did and returns typed result", async () => {
    const result = { did: "did:example:1", didDocument: { id: "did:example:1" }, walletId: "w1", keyType: "Ed25519" };
    mockJson({ success: true, data: result });
    const res = await identity.registerWalletDid({ publicKeyJwk: { kty: "OKP" }, provider: "web3", providerWalletId: "w1" });
    expect(res.data).toEqual(result);
    const [url, init] = lastCall();
    expect(url).toContain("/identity/wallet/did");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body as string)).toEqual({
      publicKeyJwk: { kty: "OKP" },
      provider: "web3",
      providerWalletId: "w1",
    });
  });

  it("registerPairedDevice POSTs /identity/paired-devices", async () => {
    mockJson({ success: true, data: { id: "pd1", deviceId: "dev-1" } });
    await identity.registerPairedDevice({ deviceId: "dev-1", publicKey: "pk", name: "Phone", platform: "ios" });
    const [url, init] = lastCall();
    expect(url).toContain("/identity/paired-devices");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body as string)).toEqual({
      deviceId: "dev-1",
      publicKey: "pk",
      name: "Phone",
      platform: "ios",
    });
  });

  it("listPairedDevices GETs /identity/paired-devices", async () => {
    mockJson({ success: true, data: [] });
    await identity.listPairedDevices();
    const [url, init] = lastCall();
    expect(url).toContain("/identity/paired-devices");
    expect(init.method).toBe("GET");
  });

  it("revokePairedDevice DELETEs /identity/paired-devices/:id", async () => {
    mockJson({ success: true, data: { revoked: true } });
    await identity.revokePairedDevice("dev-1");
    const [url, init] = lastCall();
    expect(url).toContain("/identity/paired-devices/dev-1");
    expect(init.method).toBe("DELETE");
  });

  it("createDeviceApproval POSTs /identity/device-approvals", async () => {
    mockJson({ success: true, data: { challenge: "ch1", expiresAt: "2024", pairedDevices: [] } });
    await identity.createDeviceApproval({ type: "login", context: { ip: "1.2.3.4" } });
    const [url, init] = lastCall();
    expect(url).toContain("/identity/device-approvals");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body as string)).toEqual({ type: "login", context: { ip: "1.2.3.4" } });
  });

  it("pollDeviceApproval GETs /identity/device-approvals/:challenge", async () => {
    mockJson({ success: true, data: { status: "pending", challenge: "ch1" } });
    await identity.pollDeviceApproval("ch1");
    const [url, init] = lastCall();
    expect(url).toContain("/identity/device-approvals/ch1");
    expect(init.method).toBe("GET");
  });

  it("approveDeviceApproval POSTs deviceId and signature", async () => {
    mockJson({ success: true, data: { success: true } });
    await identity.approveDeviceApproval({ challenge: "ch1", deviceId: "dev-1", signature: "sig" });
    const [url, init] = lastCall();
    expect(url).toContain("/identity/device-approvals/ch1/approve");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body as string)).toEqual({ deviceId: "dev-1", signature: "sig" });
  });

  it("rejectDeviceApproval POSTs /identity/device-approvals/:challenge/reject", async () => {
    mockJson({ success: true, data: { success: true } });
    await identity.rejectDeviceApproval("ch1");
    const [url, init] = lastCall();
    expect(url).toContain("/identity/device-approvals/ch1/reject");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body as string)).toEqual({});
  });
});
