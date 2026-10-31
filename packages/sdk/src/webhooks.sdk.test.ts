import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SgClient } from "./client.js";
import { WebhooksSdk } from "./webhooks.sdk.js";

describe("WebhooksSdk", () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  let client: SgClient;
  let webhooks: WebhooksSdk;

  beforeEach(() => {
    fetchMock = vi.fn();
    globalThis.fetch = fetchMock as unknown as typeof fetch;
    client = new SgClient({ baseUrl: "https://auth.example.dev/api/v1" });
    webhooks = new WebhooksSdk(client);
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

  const endpoint = { id: "e1", url: "https://x", eventTypes: ["a"], enabled: true, createdAt: "2024-01-01" };

  it("list GETs /webhooks/endpoints", async () => {
    mockJson({ success: true, data: [endpoint] });
    const res = await webhooks.list();
    expect(res.data).toEqual([endpoint]);
    const [url, init] = lastCall();
    expect(url).toContain("/webhooks/endpoints");
    expect(init.method).toBe("GET");
  });

  it("create POSTs to /webhooks/endpoints", async () => {
    mockJson({ success: true, data: endpoint });
    await webhooks.create({ url: "https://x", eventTypes: ["a"] });
    const [url, init] = lastCall();
    expect(url).toContain("/webhooks/endpoints");
    expect(init.method).toBe("POST");
  });

  it("update PATCHes /webhooks/endpoints/:id", async () => {
    mockJson({ success: true, data: endpoint });
    await webhooks.update("e1", { enabled: false });
    const [url, init] = lastCall();
    expect(url).toContain("/webhooks/endpoints/e1");
    expect(init.method).toBe("PATCH");
  });

  it("delete DELETEs /webhooks/endpoints/:id", async () => {
    mockJson({ success: true, data: {} });
    await webhooks.delete("e1");
    const [, init] = lastCall();
    expect(init.method).toBe("DELETE");
  });

  it("test POSTs to /webhooks/endpoints/:id/test", async () => {
    mockJson({ success: true, data: {} });
    await webhooks.test("e1");
    const [url, init] = lastCall();
    expect(url).toContain("/webhooks/endpoints/e1/test");
    expect(init.method).toBe("POST");
  });

  it("listEvents GETs /webhooks/events with filters", async () => {
    mockJson({ success: true, data: [] });
    await webhooks.listEvents({ status: "FAILED", cursor: "c", limit: 5 });
    const [url] = lastCall();
    expect(url).toContain("/webhooks/events");
    expect(url).toContain("status=FAILED");
    expect(url).toContain("cursor=c");
    expect(url).toContain("limit=5");
  });

  it("retryEvent POSTs to /webhooks/events/:id/retry", async () => {
    mockJson({ success: true, data: {} });
    await webhooks.retryEvent("ev1");
    const [url, init] = lastCall();
    expect(url).toContain("/webhooks/events/ev1/retry");
    expect(init.method).toBe("POST");
  });
});