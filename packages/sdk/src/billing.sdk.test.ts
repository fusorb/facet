import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SgClient } from "./client.js";
import { BillingSdk } from "./billing.sdk.js";

describe("BillingSdk", () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  let client: SgClient;
  let billing: BillingSdk;

  beforeEach(() => {
    fetchMock = vi.fn();
    globalThis.fetch = fetchMock as unknown as typeof fetch;
    client = new SgClient({ baseUrl: "https://auth.example.dev/api/v1" });
    billing = new BillingSdk(client);
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

  it("getSubscription GETs /subscription and unwraps the envelope", async () => {
    mockJson({ success: true, data: { tenantId: "t1", plan: "PRO", status: "ACTIVE" } });

    const res = await billing.getSubscription();

    expect(res.data).toEqual({ tenantId: "t1", plan: "PRO", status: "ACTIVE" });
    const [url, init] = lastCall();
    expect(url).toContain("/subscription");
    expect(init.method).toBe("GET");
  });

  it("surfaces API errors without throwing", async () => {
    mockJson({ success: false, error: "NOT_FOUND", message: "No subscription" }, 404);

    const res = await billing.getSubscription();

    expect(res.data).toBeNull();
    expect(res.error).toMatchObject({ statusCode: 404 });
  });
});