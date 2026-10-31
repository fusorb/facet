import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SgClient } from "./client.js";
import { TenantSdk } from "./tenant.sdk.js";

describe("TenantSdk", () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  let client: SgClient;
  let tenant: TenantSdk;

  beforeEach(() => {
    fetchMock = vi.fn();
    globalThis.fetch = fetchMock as unknown as typeof fetch;
    client = new SgClient({ baseUrl: "https://auth.example.dev/api/v1" });
    tenant = new TenantSdk(client);
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

  const t = { id: "t1", slug: "acme", name: "Acme", createdAt: "2024" };

  it("list GETs /tenants", async () => {
    mockJson({ success: true, data: [t] });
    const res = await tenant.list();
    expect(res.data).toEqual([t]);
    const [url, init] = lastCall();
    expect(url).toContain("/tenants");
    expect(init.method).toBe("GET");
  });

  it("get GETs /tenants/:slug", async () => {
    mockJson({ success: true, data: t });
    await tenant.get("acme");
    const [url] = lastCall();
    expect(url).toContain("/tenants/acme");
  });

  it("create POSTs /tenants (G2)", async () => {
    mockJson({ success: true, data: t });
    const res = await tenant.create({ name: "Acme", slug: "acme" });
    expect(res.data).toEqual(t);
    const [url, init] = lastCall();
    expect(url).toContain("/tenants");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body as string)).toEqual({ name: "Acme", slug: "acme" });
  });

  it("switchTenant POSTs /auth/switch-context", async () => {
    mockJson({ success: true, data: { accessToken: "at", refreshToken: "rt", idToken: null, expiresIn: 900 } });
    await tenant.switchTenant("t1");
    const [url, init] = lastCall();
    expect(url).toContain("/auth/switch-context");
    expect(init.method).toBe("POST");
  });

  it("listMembers GETs /tenants/:id/members", async () => {
    mockJson({ success: true, data: [] });
    await tenant.listMembers("t1");
    const [url] = lastCall();
    expect(url).toContain("/tenants/t1/members");
  });

  it("addMember POSTs /tenants/:id/members", async () => {
    mockJson({ success: true, data: {} });
    await tenant.addMember("t1", { identityId: "u1", role: "admin" });
    const [url, init] = lastCall();
    expect(url).toContain("/tenants/t1/members");
    expect(init.method).toBe("POST");
  });

  it("removeMember DELETEs /tenants/:id/members/:identityId", async () => {
    mockJson({ success: true, data: {} });
    await tenant.removeMember("t1", "u1");
    const [url, init] = lastCall();
    expect(url).toContain("/tenants/t1/members/u1");
    expect(init.method).toBe("DELETE");
  });

  it("getPolicy GETs /tenants/:id/policy", async () => {
    mockJson({ success: true, data: { requireMfa: true } });
    await tenant.getPolicy("t1");
    const [url] = lastCall();
    expect(url).toContain("/tenants/t1/policy");
  });

  it("updatePolicy PATCHes /tenants/:id/policy", async () => {
    mockJson({ success: true, data: {} });
    await tenant.updatePolicy("t1", { requireMfa: false });
    const [url, init] = lastCall();
    expect(url).toContain("/tenants/t1/policy");
    expect(init.method).toBe("PATCH");
  });

  it("acceptInvite POSTs /invites/accept", async () => {
    mockJson({ success: true, data: { message: "ok", tenantSlug: "acme" } });
    await tenant.acceptInvite({ token: "inv-tok" });
    const [url, init] = lastCall();
    expect(url).toContain("/invites/accept");
    expect(init.method).toBe("POST");
  });

  it("getDid GETs /tenants/:id/did", async () => {
    mockJson({ success: true, data: { did: "did:example:t1", createdAt: "2024" } });
    await tenant.getDid("t1");
    const [url] = lastCall();
    expect(url).toContain("/tenants/t1/did");
  });

  it("provisionDid POSTs /tenants/:id/did", async () => {
    mockJson({ success: true, data: {} });
    await tenant.provisionDid("t1", { domain: "acme.dev" });
    const [url, init] = lastCall();
    expect(url).toContain("/tenants/t1/did");
    expect(init.method).toBe("POST");
  });

  it("listSigningKeys GETs /tenants/:id/signing-keys", async () => {
    mockJson({ success: true, data: [] });
    await tenant.listSigningKeys("t1");
    const [url] = lastCall();
    expect(url).toContain("/tenants/t1/signing-keys");
  });

  it("createSigningKey POSTs /tenants/:id/signing-keys", async () => {
    mockJson({ success: true, data: { kid: "k1", createdAt: "2024", status: "ACTIVE" } });
    await tenant.createSigningKey("t1", { displayName: "key1" });
    const [url, init] = lastCall();
    expect(url).toContain("/tenants/t1/signing-keys");
    expect(init.method).toBe("POST");
  });

  it("revokeSigningKey DELETEs /tenants/:id/signing-keys/:kid", async () => {
    mockJson({ success: true, data: {} });
    await tenant.revokeSigningKey("t1", "k1");
    const [url, init] = lastCall();
    expect(url).toContain("/tenants/t1/signing-keys/k1");
    expect(init.method).toBe("DELETE");
  });

  it("listProjects GETs /tenants/:id/projects", async () => {
    mockJson({ success: true, data: [] });
    await tenant.listProjects("t1");
    const [url] = lastCall();
    expect(url).toContain("/tenants/t1/projects");
  });

  it("createProject POSTs /tenants/:id/projects", async () => {
    mockJson({ success: true, data: { id: "p1", name: "P", tenantId: "t1", createdAt: "2024" } });
    await tenant.createProject("t1", { name: "P" });
    const [url, init] = lastCall();
    expect(url).toContain("/tenants/t1/projects");
    expect(init.method).toBe("POST");
  });

  it("getProject GETs /tenants/:id/projects/:projectId", async () => {
    mockJson({ success: true, data: { id: "p1", name: "P", tenantId: "t1", createdAt: "2024" } });
    await tenant.getProject("t1", "p1");
    const [url] = lastCall();
    expect(url).toContain("/tenants/t1/projects/p1");
  });

  it("updateProject PATCHes /tenants/:id/projects/:projectId", async () => {
    mockJson({ success: true, data: { id: "p1", name: "P2", tenantId: "t1", createdAt: "2024" } });
    await tenant.updateProject("t1", "p1", { name: "P2" });
    const [url, init] = lastCall();
    expect(url).toContain("/tenants/t1/projects/p1");
    expect(init.method).toBe("PATCH");
  });

  it("deleteProject DELETEs /tenants/:id/projects/:projectId", async () => {
    mockJson({ success: true, data: {} });
    await tenant.deleteProject("t1", "p1");
    const [url, init] = lastCall();
    expect(url).toContain("/tenants/t1/projects/p1");
    expect(init.method).toBe("DELETE");
  });

  it("createOnboardingFlow POSTs .../onboarding-flows", async () => {
    mockJson({ success: true, data: { id: "f1", projectId: "p1", steps: [], createdAt: "2024" } });
    await tenant.createOnboardingFlow("t1", "p1", { steps: [{ type: "form" }] });
    const [url, init] = lastCall();
    expect(url).toContain("/tenants/t1/projects/p1/onboarding-flows");
    expect(init.method).toBe("POST");
  });

  it("listOnboardingFlows GETs .../onboarding-flows", async () => {
    mockJson({ success: true, data: [] });
    await tenant.listOnboardingFlows("t1", "p1");
    const [url] = lastCall();
    expect(url).toContain("/tenants/t1/projects/p1/onboarding-flows");
  });

  it("getOnboardingFlow GETs .../onboarding-flows/:flowId", async () => {
    mockJson({ success: true, data: { id: "f1", projectId: "p1", steps: [], createdAt: "2024" } });
    await tenant.getOnboardingFlow("t1", "p1", "f1");
    const [url] = lastCall();
    expect(url).toContain("/tenants/t1/projects/p1/onboarding-flows/f1");
  });

  it("updateOnboardingFlow PATCHes .../onboarding-flows/:flowId", async () => {
    mockJson({ success: true, data: { id: "f1", projectId: "p1", steps: [], createdAt: "2024" } });
    await tenant.updateOnboardingFlow("t1", "p1", "f1", { name: "renamed" });
    const [url, init] = lastCall();
    expect(url).toContain("/tenants/t1/projects/p1/onboarding-flows/f1");
    expect(init.method).toBe("PATCH");
  });

  it("deleteOnboardingFlow DELETEs .../onboarding-flows/:flowId", async () => {
    mockJson({ success: true, data: {} });
    await tenant.deleteOnboardingFlow("t1", "p1", "f1");
    const [url, init] = lastCall();
    expect(url).toContain("/tenants/t1/projects/p1/onboarding-flows/f1");
    expect(init.method).toBe("DELETE");
  });

  it("getJwksBySlug GETs /tenants/:slug/jwks (bare)", async () => {
    mockJson({ keys: [] });
    const res = await tenant.getJwksBySlug("acme");
    expect(res.data).toEqual({ keys: [] });
    const [url] = lastCall();
    expect(url).toContain("/tenants/acme/jwks");
  });
});