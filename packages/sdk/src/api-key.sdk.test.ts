import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SgClient } from "./client.js";
import { ApiKeySdk } from "./api-key.sdk.js";

describe("ApiKeySdk", () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  let client: SgClient;
  let apiKeys: ApiKeySdk;

  beforeEach(() => {
    fetchMock = vi.fn();
    globalThis.fetch = fetchMock as unknown as typeof fetch;
    client = new SgClient({ baseUrl: "https://auth.example.dev/api/v1" });
    apiKeys = new ApiKeySdk(client);
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

  it("list GETs /api-keys and unwraps the envelope", async () => {
    mockJson({
      success: true,
      data: [
        {
          id: "k1",
          name: "CI",
          keyPrefix: "sg_sk_sGvk1",
          scopes: ["identity:read"],
          status: "ACTIVE",
          lastUsedAt: null,
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        },
      ],
    });

    const res = await apiKeys.list();

    expect(res.error).toBeNull();
    expect(res.data?.[0]?.id).toBe("k1");
    const [url, init] = lastCall();
    expect(url).toBe("https://auth.example.dev/api/v1/api-keys");
    expect(init.method).toBe("GET");
  });

  it("create POSTs /api-keys/create with the exact body and exposes the one-time key", async () => {
    mockJson(
      {
        success: true,
        data: {
          id: "k2",
          key: "sg_sk_plaintext-once",
          name: "CI",
          keyPrefix: "sg_sk_plain",
          scopes: ["identity:read"],
          createdAt: "2026-01-01T00:00:00.000Z",
        },
      },
      201,
    );

    const res = await apiKeys.create({
      name: "CI",
      scopes: ["identity:read"],
    });

    expect(res.data?.key).toBe("sg_sk_plaintext-once");
    const [url, init] = lastCall();
    expect(url).toBe("https://auth.example.dev/api/v1/api-keys/create");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body as string)).toEqual({
      name: "CI",
      scopes: ["identity:read"],
    });
  });

  it("create sends only the name when scopes are omitted (server default applies)", async () => {
    mockJson(
      {
        success: true,
        data: {
          id: "k3",
          key: "sg_sk_x",
          name: "laptop",
          keyPrefix: "sg_sk_x",
          scopes: ["identity:read"],
          createdAt: "2026-01-01T00:00:00.000Z",
        },
      },
      201,
    );

    await apiKeys.create({ name: "laptop" });

    const [, init] = lastCall();
    expect(JSON.parse(init.body as string)).toEqual({ name: "laptop" });
  });

  it("revoke DELETEs /api-keys/:id", async () => {
    mockJson({ success: true });

    await apiKeys.revoke("key-id-1");

    const [url, init] = lastCall();
    expect(url).toBe("https://auth.example.dev/api/v1/api-keys/key-id-1");
    expect(init.method).toBe("DELETE");
  });
});
