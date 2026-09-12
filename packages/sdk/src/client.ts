/**
 * @fusorb/facet-sdk: Base HTTP client
 *
 * Pure fetch. No framework dependencies. Matches arc-id's ApiResponse shape.
 *
 * Envelope handling:
 *   - Domain routes (most /auth, /identity, /tenants, ...) respond with
 *     `{ success: true, data: <payload> }`. The client unwraps `json.data`
 *     so SDK methods return the inner payload directly.
 *   - Protocol/public endpoints (/oauth/token, /oauth/jwks, /oauth/userinfo,
 *     /tenants/:slug/jwks, /credentials/verify/*) respond bare. Use the
 *     `bare: true` request option for those.
 */

export type ApiError = {
  statusCode: number;
  error: string;
  message: string;
  details?: { path: string; message: string }[];
  currentPlan?: string;
  requiredPlan?: string;
};

export type ApiResponse<T> = { data: T; error: null } | { data: null; error: ApiError };

/** Standard arc-id success envelope for domain routes. */
export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
}

export interface RequestOptions {
  /** Bypass the `{ success, data }` envelope and return the raw body. */
  bare?: boolean;
  /** Per-request Authorization header override. */
  token?: string;
  fetchInit?: RequestInit;
}

export interface ArcIdClientConfig {
  baseUrl: string;
  apiKey?: string;
  /**
   * OAuth client id for this application. Required for third-party /
   * external integrations that talk to a shared arc-id instance via
   * `/oauth/token` (authorization_code or refresh_token grants). For a
   * first-party app wired to its own arc-id backend this can be omitted -
   * the backend defaults to its direct client.
   */
  clientId?: string;
  /** OAuth client secret for confidential (non-public) clients. */
  clientSecret?: string;
  fetchInit?: RequestInit;
  /**
   * Optional 401 auto-refresh hook.
   * Called when any request returns 401. Return the new access token to
   * retry the request, or null to propagate the error.
   *
   * Usage:
   *   onTokenRefresh: async (failedToken) => {
   *     const newToken = await authSdk.refresh(refreshToken);
   *     return newToken ?? null;
   *   }
   */
  onTokenRefresh?: (failedToken: string) => Promise<string | null>;
  /** Called when a 401 refresh fails and the session is unrecoverable. */
  onAuthCleared?: () => void;
}

export class ArcIdClient {
  private config: ArcIdClientConfig;
  private accessToken: string | null;

  constructor(config: ArcIdClientConfig) {
    this.config = { ...config, baseUrl: config.baseUrl.replace(/\/+$/, "") };
    this.accessToken = config.apiKey ?? null;
  }

  /** Set (or clear) the bearer token used for authenticated requests. */
  setAccessToken(token: string | null): void {
    this.accessToken = token;
  }

  /**
   * @deprecated Use setAccessToken. Kept for backward compatibility.
   */
  setApiKey(apiKey: string): void {
    this.setAccessToken(apiKey);
  }

  /** Current bearer token, if any. */
  getAccessToken(): string | null {
    return this.accessToken;
  }

  /** Configured base URL (trailing slash stripped). */
  getBaseUrl(): string {
    return this.config.baseUrl;
  }

  /** Configured OAuth client id (for /oauth/token grants). */
  getClientId(): string | undefined {
    return this.config.clientId;
  }

  /** Configured OAuth client secret (confidential clients). */
  getClientSecret(): string | undefined {
    return this.config.clientSecret;
  }

  /**
   * Set the OAuth client credentials at runtime. Useful for dynamically
   * configured integrations where the client is resolved after construction.
   */
  setClientCredentials(clientId: string, clientSecret?: string): void {
    this.config.clientId = clientId;
    this.config.clientSecret = clientSecret;
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    options: RequestOptions = {},
  ): Promise<ApiResponse<T>> {
    const attempt = async (token: string | null): Promise<ApiResponse<T>> => {
      try {
        const url = `${this.config.baseUrl}${path}`;
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        const authToken = options.token ?? token;
        if (authToken) {
          headers["Authorization"] = `Bearer ${authToken}`;
        }

        const mergedInit: RequestInit = {
          ...this.config.fetchInit,
          ...options.fetchInit,
          headers: {
            ...headers,
            ...this.config.fetchInit?.headers,
            ...options.fetchInit?.headers,
          },
          signal: options.fetchInit?.signal ?? this.config.fetchInit?.signal,
        };

        const response = await fetch(url, {
          method,
          ...mergedInit,
          body: body !== undefined ? JSON.stringify(body) : undefined,
        });

        if (!response.ok) {
          let errBody: Partial<ApiError> = {};
          try {
            errBody = (await response.json()) as Partial<ApiError>;
          } catch {
            // ignore parse failure
          }
          return {
            data: null,
            error: {
              statusCode: response.status,
              error: errBody.error ?? "UNKNOWN_ERROR",
              message: errBody.message ?? response.statusText,
              details: errBody.details,
              currentPlan: errBody.currentPlan,
              requiredPlan: errBody.requiredPlan,
            },
          };
        }

        if (response.status === 204) {
          return { data: undefined as T, error: null };
        }

        const json = (await response.json()) as unknown;
        if (options.bare) {
          return { data: json as T, error: null };
        }
        const envelope = json as ApiEnvelope<T>;
        if (envelope && typeof envelope === "object" && "data" in envelope) {
          return { data: envelope.data, error: null };
        }
        // Tolerant fallback: some endpoints may still respond bare.
        return { data: json as T, error: null };
      } catch (err) {
        return {
          data: null,
          error: {
            statusCode: 0,
            error: "NETWORK_ERROR",
            message: err instanceof Error ? err.message : "Unknown network error",
          },
        };
      }
    };

    // Make the initial request with the current token.
    const result = await attempt(this.accessToken);

    // Auto-refresh on 401 if a tokenRefresher is configured.
    if (result.error?.statusCode === 401 && this.config.onTokenRefresh && this.accessToken) {
      const newToken = await this.config.onTokenRefresh(this.accessToken);
      if (newToken) {
        this.setAccessToken(newToken);
        // Retry exactly once with the refreshed token.
        return attempt(newToken);
      }
      this.config.onAuthCleared?.();
    }

    return result;
  }

  get<T>(path: string, options?: RequestOptions) {
    return this.request<T>("GET", path, undefined, options);
  }

  post<T>(path: string, body?: unknown, options?: RequestOptions) {
    return this.request<T>("POST", path, body, options);
  }

  put<T>(path: string, body?: unknown, options?: RequestOptions) {
    return this.request<T>("PUT", path, body, options);
  }

  patch<T>(path: string, body?: unknown, options?: RequestOptions) {
    return this.request<T>("PATCH", path, body, options);
  }

  del<T>(path: string, options?: RequestOptions) {
    return this.request<T>("DELETE", path, undefined, options);
  }
}
