import type { RefreshResult, ApiResponse } from "@fusorb/facet-sdk";

/**
 * Minimal interface for a Zustand auth store that the token bridge needs.
 * Any store exposing these methods satisfies this structurally - the concrete
 * {@link AuthState} store is passed in by the consumer.
 */
export interface TokenStoreLike {
  getState: () => {
    accessToken: string | null;
    refreshToken: string | null;
  };
  setTokens: (accessToken: string, refreshToken?: string) => void;
  clearAuth: () => void;
}

/**
 * Interface for an SDK auth-like object that can refresh tokens.
 * Matches {@link AuthSdk.refresh} exactly.
 */
export interface TokenRefresher {
  refresh: (token: string) => Promise<ApiResponse<RefreshResult>>;
}

/**
 * Bridge between a Zustand auth store and the ArcIdClient's token-refresh hooks.
 *
 * - Reads refresh/access tokens from the store via `getState()`
 * - On a 401, calls `sdk.refresh()` → updates the store with the new token bundle
 * - Clears auth on refresh failure (expired/invalid refresh token)
 * - Re-entrancy guard prevents infinite recursion if the refresh request itself 401s
 *
 * `persist` (optional): a key-value adapter that persists the **access token only**
 * to a secure medium (e.g. httpOnly cookie via a server callback).  The refresh
 * token should never be persisted through this adapter - use an httpOnly cookie
 * on the SovGrant backend instead.
 */
export interface TokenStorage {
  getAccessToken: () => string | null;
  getRefreshToken: () => string | null;
  setTokens: (accessToken: string, refreshToken?: string) => void;
  clearTokens: () => void;
  onTokenRefresh: (failedToken: string) => Promise<string | null>;
}

/** Optional adapter for persisting tokens to a secure medium (e.g. httpOnly cookie). */
export interface PersistAdapter {
  getAccessToken: () => string | null;
  setAccessToken: (token: string | null) => void;
}

export function createZustandTokenStorage({
  authStore,
  sdk,
  persist,
}: {
  authStore: TokenStoreLike;
  sdk: TokenRefresher;
  /**
   * Optional adapter for persisting the **access token** to a secure medium
   * (e.g. httpOnly cookie via a server callback).  When provided,
   * `setTokens` also calls `persist.setAccessToken()` so the token survives
   * a full-page reload without relying on Zustand's in-memory state.
   * The refresh token is NEVER passed through this adapter - it should
   * live in an httpOnly cookie on the SovGrant backend.
   */
  persist?: PersistAdapter;
}): TokenStorage {
  // Re-entrancy guard: the client's request() retries with a fresh token after
  // onTokenRefresh resolves, but the refresh call itself goes through the same
  // client. If POST /oauth/token ever 401s, request() would call onTokenRefresh
  // again, recursing forever. The flag short-circuits the second entry so the
  // original failure path (clearing auth) runs instead.
  let refreshInFlight = false;

  return {
    getAccessToken: () =>
      persist?.getAccessToken() ?? authStore.getState().accessToken ?? null,

    getRefreshToken: () => authStore.getState().refreshToken ?? null,

    setTokens: (accessToken, refreshToken) => {
      authStore.setTokens(accessToken, refreshToken);
      persist?.setAccessToken(accessToken);
    },

    clearTokens: () => {
      authStore.clearAuth();
      persist?.setAccessToken(null);
    },

    onTokenRefresh: async () => {
      const state = authStore.getState();
      if (!state.refreshToken || refreshInFlight) return null;

      refreshInFlight = true;
      try {
        const { data, error } = await sdk.refresh(state.refreshToken);
        if (error || !data?.accessToken) {
          authStore.clearAuth();
          persist?.setAccessToken(null);
          return null;
        }

        authStore.setTokens(data.accessToken, data.refreshToken);
        persist?.setAccessToken(data.accessToken);
        return data.accessToken;
      } finally {
        refreshInFlight = false;
      }
    },
  };
}
