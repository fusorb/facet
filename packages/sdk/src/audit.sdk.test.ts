import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SgClient } from "./client.js";
import { AuditSdk } from "./audit.sdk.js";

describe("AuditSdk", () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  let client: SgClient;
  let audit: AuditSdk;

  beforeEach(() => {
    fetchMock = vi.fn();
    globalThis.fetch = fetchMock as unknown as typeof fetch;
    client = new SgClient({ baseUrl: "https://auth.example.dev/api/v1" });
    audit = new AuditSdk(client);
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

  it("list GETs /audit/logs and forwards filters", async () => {
    mockJson({ success: true, data: { data: [], meta: { total: 0, page: 1, limit: 20 } } });

    const res = await audit.list({ identityId: "u1", tenantId: "t1", action: "LOGIN", from: "2024-01-01", to: "2024-12-31", page: 2, limit: 10 });

    expect(res.data).not.toBeNull();
    const [url] = lastCall();
    expect(url).toContain("/audit/logs");
    expect(url).toContain("identityId=u1");
    expect(url).toContain("tenantId=t1");
    expect(url).toContain("action=LOGIN");
    expect(url).toContain("page=2");
    expect(url).toContain("limit=10");
  });

  it("list works with no params", async () => {
    mockJson({ success: true, data: { data: [], meta: { total: 0, page: 1, limit: 20 } } });

    await audit.list();

    const [url] = lastCall();
    expect(url).toContain("/audit/logs");
    expect(url).not.toContain("?");
  });
});