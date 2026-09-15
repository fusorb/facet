import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ArcIdClient } from "./client.js";

describe("ArcIdClient", () => {
  const baseUrl = "https://auth.example.dev/api/v1";

  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    globalThis.fetch = fetchMock as unknown as typeof fetch;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function jsonResponse(body: unknown, status = 200): Response {
    return new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  }

  function callAt(index: number): [string, RequestInit] {
    const call = fetchMock.mock.calls[index];
    if (!call) throw new Error("fetch not called");
    return call as unknown as [string, RequestInit];
  }

  describe("request basics", () => {
    it("sends GET with Authorization header when a token is set", async () => {
      fetchMock.mockResolvedValue(
        jsonResponse({ success: true, data: { ok: true } }),
      );

      const client = new ArcIdClient({ baseUrl });
      client.setAccessToken("secret");
      await client.get("/ping");

      const [url, init] = callAt(0);
      expect(url).toBe(`${baseUrl}/ping`);
      expect(init.method).toBe("GET");
      expect(init.headers).toMatchObject({
        Authorization: "Bearer secret",
        "Content-Type": "application/json",
      });
    });

    it("sends no Authorization header when no token is set", async () => {
      fetchMock.mockResolvedValue(jsonResponse({ success: true, data: null }));

      const client = new ArcIdClient({ baseUrl });
      await client.get("/public");

      const [, init] = callAt(0);
      expect(init.headers).toMatchObject({
        "Content-Type": "application/json",
      });
      expect(init.headers).not.toHaveProperty("Authorization");
    });

    it("sends JSON body on POST", async () => {
      fetchMock.mockResolvedValue(jsonResponse({ success: true, data: "ok" }));

      const client = new ArcIdClient({ baseUrl });
      await client.post("/auth/login", { email: "a@b.c", password: "pw" });

      const [url, init] = callAt(0);
      expect(url).toBe(`${baseUrl}/auth/login`);
      expect(init.method).toBe("POST");
      expect(JSON.parse(init.body as string)).toEqual({
        email: "a@b.c",
        password: "pw",
      });
    });

    it("unwraps the { success, data } envelope by default", async () => {
      fetchMock.mockResolvedValue(
        jsonResponse({ success: true, data: { accessToken: "t" } }),
      );

      const client = new ArcIdClient({ baseUrl });
      const res = await client.get<{ accessToken: string }>("/me");

      expect(res).toEqual({ data: { accessToken: "t" }, error: null });
    });

    it("returns the raw body with bare: true", async () => {
      fetchMock.mockResolvedValue(
        jsonResponse({ access_token: "t", token_type: "Bearer" }),
      );

      const client = new ArcIdClient({ baseUrl });
      const res = await client.post<{ access_token: string }>(
        "/oauth/token",
        { grant_type: "refresh_token", refresh_token: "rt" },
        { bare: true },
      );

      expect(res.data).toEqual({ access_token: "t", token_type: "Bearer" });
    });

    it("normalizes a trailing slash on baseUrl", async () => {
      fetchMock.mockResolvedValue(jsonResponse({ success: true, data: null }));

      const client = new ArcIdClient({ baseUrl: `${baseUrl}/` });
      await client.get("/ping");

      expect(callAt(0)[0]).toBe(`${baseUrl}/ping`);
    });

    it("returns undefined data on 204", async () => {
      fetchMock.mockResolvedValue(new Response(null, { status: 204 }));

      const client = new ArcIdClient({ baseUrl });
      const res = await client.post<void>("/auth/logout");

      expect(res.error).toBeNull();
      expect(res.data).toBeUndefined();
    });
  });

  describe("error handling", () => {
    it("maps non-2xx to ApiError", async () => {
      fetchMock.mockResolvedValue(
        jsonResponse({ error: "UNAUTHORIZED", message: "Bad creds" }, 401),
      );

      const client = new ArcIdClient({ baseUrl });
      const res = await client.get("/me");

      expect(res.data).toBeNull();
      expect(res.error).toEqual({
        statusCode: 401,
        error: "UNAUTHORIZED",
        message: "Bad creds",
      });
    });

    it("carries plan-gate fields on 402", async () => {
      fetchMock.mockResolvedValue(
        jsonResponse(
          {
            error: "UPGRADE_REQUIRED",
            message: "Pro required",
            currentPlan: "free",
            requiredPlan: "PRO",
          },
          402,
        ),
      );

      const client = new ArcIdClient({ baseUrl });
      const res = await client.get("/billing");

      expect(res.error).toMatchObject({
        statusCode: 402,
        error: "UPGRADE_REQUIRED",
        currentPlan: "free",
        requiredPlan: "PRO",
      });
    });

    it("falls back to statusText when body is not JSON", async () => {
      fetchMock.mockResolvedValue(new Response("plain text", { status: 500 }));

      const client = new ArcIdClient({ baseUrl });
      const res = await client.get("/boom");

      expect(res.error).toMatchObject({ statusCode: 500 });
    });

    it("maps network failures to NETWORK_ERROR", async () => {
      fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));

      const client = new ArcIdClient({ baseUrl });
      const res = await client.get("/offline");

      expect(res.data).toBeNull();
      expect(res.error).toMatchObject({
        statusCode: 0,
        error: "NETWORK_ERROR",
      });
    });
  });

  describe("401 auto-refresh", () => {
    it("calls onTokenRefresh and retries exactly once on 401", async () => {
      const onTokenRefresh = vi.fn().mockResolvedValue("new-token");

      fetchMock
        .mockResolvedValueOnce(
          jsonResponse({ error: "UNAUTHORIZED", message: "expired" }, 401),
        )
        .mockResolvedValueOnce(
          jsonResponse({ success: true, data: { ok: true } }),
        );

      const client = new ArcIdClient({
        baseUrl,
        onTokenRefresh,
      });
      client.setAccessToken("old-token");
      const res = await client.get("/protected");

      expect(onTokenRefresh).toHaveBeenCalledWith("old-token");
      expect(fetchMock).toHaveBeenCalledTimes(2);
      // Second attempt uses the refreshed token
      expect(callAt(1)[1].headers).toMatchObject({
        Authorization: "Bearer new-token",
      });
      expect(res.data).toEqual({ ok: true });
      expect(client.getAccessToken()).toBe("new-token");
    });

    it("does not retry when onTokenRefresh returns null", async () => {
      const onTokenRefresh = vi.fn().mockResolvedValue(null);

      fetchMock.mockResolvedValue(
        jsonResponse({ error: "UNAUTHORIZED", message: "expired" }, 401),
      );

      const client = new ArcIdClient({
        baseUrl,
        onTokenRefresh,
      });
      client.setAccessToken("old-token");
      const res = await client.get("/protected");

      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(res.error?.statusCode).toBe(401);
    });

    it("does not retry when no token is configured", async () => {
      const onTokenRefresh = vi.fn();

      fetchMock.mockResolvedValue(
        jsonResponse({ error: "UNAUTHORIZED", message: "expired" }, 401),
      );

      const client = new ArcIdClient({ baseUrl, onTokenRefresh });
      const res = await client.get("/protected");

      expect(onTokenRefresh).not.toHaveBeenCalled();
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(res.error?.statusCode).toBe(401);
    });

    it("calls onAuthCleared when refresh fails", async () => {
      const onAuthCleared = vi.fn();
      const onTokenRefresh = vi.fn().mockResolvedValue(null);

      fetchMock.mockResolvedValue(
        jsonResponse({ error: "UNAUTHORIZED", message: "expired" }, 401),
      );

      const client = new ArcIdClient({
        baseUrl,
        onTokenRefresh,
        onAuthCleared,
      });
      client.setAccessToken("old-token");
      await client.get("/protected");

      expect(onAuthCleared).toHaveBeenCalledTimes(1);
    });
  });

  describe("HTTP verbs", () => {
    it.each([
      ["put", "PUT"],
      ["patch", "PATCH"],
      ["del", "DELETE"],
    ] as const)("%s maps to %s", async (verb, method) => {
      fetchMock.mockResolvedValue(
        jsonResponse({ success: true, data: { ok: true } }),
      );

      const client = new ArcIdClient({ baseUrl });
      await client[verb]("/thing", { a: 1 } as never);

      const [, init] = callAt(0);
      expect(init.method).toBe(method);
    });
  });

  it("setAccessToken overrides the token at runtime", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ success: true, data: { ok: true } }),
    );

    const client = new ArcIdClient({ baseUrl, apiKey: "one" });
    client.setAccessToken("two");
    await client.get("/me");

    expect(callAt(0)[1].headers).toMatchObject({
      Authorization: "Bearer two",
    });
  });
});
