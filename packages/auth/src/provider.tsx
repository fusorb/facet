/**
 * ArcProvider: React context provider for auth state.
 *
 * Wraps the app with authentication state, login/logout/register actions,
 * and automatic session refresh on mount.
 *
 * Token plumbing:
 *   - On mount, any stored access token is pushed into the SDK client
 *     (client.setAccessToken) BEFORE me() is called, so authenticated
 *     requests actually carry the bearer header.
 *   - On login/refresh, tokens are persisted to storage AND pushed to
 *     the client.
 *   - MFA is two-phase: login returns { sessionId, requiresMfa } without
 *     tokens; the caller completes with verifyMfa() / mfaRecovery().
 *
 * Usage:
 *   <ArcProvider client={arcIdClient} storage={myStorage}>
 *     <App />
 *   </ArcProvider>
 */

import * as React from "react";
import { type ArcIdClient, AuthSdk } from "@fusorb/facet-sdk";
import type { LoginResult, TokenBundle } from "@fusorb/facet-sdk";
import type {
  AuthContextValue,
  AuthUser,
  LoginParams,
  RegisterParams,
} from "./types.js";
import { defaultStorage, type TokenStorage } from "./storage.js";

/* ── Context ───────────────────────────────────────────────── */

const AuthContext = React.createContext<AuthContextValue | null>(null);

/* ── Provider Props ────────────────────────────────────────── */

export interface ArcProviderProps {
  client: ArcIdClient;
  storage?: TokenStorage;
  children: React.ReactNode;
  /** Called after session restore succeeds (user was rehydrated from stored tokens).
   *  Useful for loading tenant/scoped data on app boot. */
  onSessionRestore?: (user: AuthUser) => void;
  /** Called when auth state changes (login, logout, session expiry). */
  onAuthChange?: (state: {
    isAuthenticated: boolean;
    user: AuthUser | null;
  }) => void;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
}

const INITIAL_STATE: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isLoading: true,
  error: null,
};

/** Post-bootstrap signed-out state (loading finished, nothing restored). */
const SIGNED_OUT_STATE: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isLoading: false,
  error: null,
};

/* ── Provider ──────────────────────────────────────────────── */

export function ArcProvider({
  client,
  storage = defaultStorage,
  children,
  onSessionRestore,
  onAuthChange,
}: ArcProviderProps) {
  // Dev-time warning: defaultStorage uses localStorage for tokens, which is
  // vulnerable to XSS.  Fires once per page-load when no explicit storage is
  // provided.  Consumers should pass a cookie-backed or in-memory adapter.
  const warnedRef = React.useRef(false);
  if (
    !warnedRef.current &&
    storage === defaultStorage &&
    typeof process !== "undefined" &&
    process.env?.NODE_ENV !== "production"
  ) {
    warnedRef.current = true;
    // eslint-disable-next-line no-console
    console.warn(
      "[@fusorb/facet-auth] ArcProvider is using defaultStorage (localStorage). " +
        "localStorage is vulnerable to XSS - refresh tokens stored here can be " +
        "stolen. For production, pass an explicit `storage` prop backed by " +
        "httpOnly cookies. This warning is shown once per page-load.",
    );
  }

  const authSdk = React.useMemo(() => new AuthSdk(client), [client]);

  // SSR-safe: do not read storage during render. Initial state has no
  // tokens; the bootstrap effect hydrates from storage after mount.
  const [state, setState] = React.useState<AuthState>(INITIAL_STATE);

  /* ── Derive isAuthenticated (not stored in state) ──────────── */

  const isAuthenticated = !!state.user && !!state.accessToken;

  /* ── Track state changes for onAuthChange ──────────────────── */

  const prevAuthRef = React.useRef(false);
  const hydratedRef = React.useRef(false);

  React.useEffect(() => {
    if (prevAuthRef.current !== isAuthenticated) {
      onAuthChange?.({
        isAuthenticated,
        user: state.user,
      });
    }
    prevAuthRef.current = isAuthenticated;
  }, [isAuthenticated, state.user, onAuthChange]);

  /* ── Bootstrap: try to restore session ─────────────────────── */

  React.useEffect(() => {
    const token = storage.getAccessToken();
    if (!token) {
      setState((prev) => ({ ...prev, isLoading: false }));
      hydratedRef.current = true;
      return;
    }

    // Push the stored token into the client so requests are authenticated.
    client.setAccessToken(token);

    authSdk
      .me()
      .then((res) => {
        if (res.data) {
          const user = res.data;
          setState((prev) => ({
            ...prev,
            user,
            accessToken: token,
            refreshToken: storage.getRefreshToken(),
            isLoading: false,
          }));
          hydratedRef.current = true;
          onSessionRestore?.(user);
        } else {
          // Token expired: try refresh
          return refreshAccessToken(authSdk, client, storage).then(
            (newToken) => {
              if (newToken) {
                return authSdk.me().then((r) => {
                  if (r.data) {
                    const refreshedUser = r.data;
                    setState((prev) => ({
                      ...prev,
                      user: refreshedUser,
                      accessToken: newToken,
                      refreshToken: storage.getRefreshToken(),
                      isLoading: false,
                    }));
                    hydratedRef.current = true;
                    onSessionRestore?.(refreshedUser);
                  } else {
                    throw new Error("Session expired");
                  }
                });
              }
              throw new Error("Session expired");
            },
          );
        }
      })
      .catch(() => {
        storage.clearTokens();
        client.setAccessToken(null);
        setState(SIGNED_OUT_STATE);
        hydratedRef.current = true;
      });
  }, []);

  /* ── Actions ──────────────────────────────────────────────── */

  const applyTokenPair = React.useCallback(
    (tokens: { accessToken: string; refreshToken: string }, user: AuthUser) => {
      storage.setTokens(tokens.accessToken, tokens.refreshToken);
      client.setAccessToken(tokens.accessToken);
      setState({
        user,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        isLoading: false,
        error: null,
      });
    },
    [client, storage],
  );

  const login = React.useCallback(
    async (params: LoginParams) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      const res = await authSdk.login(params.email, params.password);
      if (res.data) {
        const result = res.data as LoginResult;
        if (result.requiresMfa || !result.accessToken) {
          // Two-phase: hold the sessionId; tokens come after MFA verify.
          setState((prev) => ({ ...prev, isLoading: false }));
          return res;
        }
        const user = result.identity as AuthUser;
        applyTokenPair(
          {
            accessToken: result.accessToken!,
            refreshToken: result.refreshToken!,
          },
          user,
        );
      } else {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: res.error?.message ?? "Login failed",
        }));
      }
      return res;
    },
    [authSdk, applyTokenPair],
  );

  const register = React.useCallback(
    async (params: RegisterParams) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      const res = await authSdk.register(
        params.name,
        params.email,
        params.password,
      );
      if (res.data) {
        // SovGrant registration returns the identity only; no tokens.
        // Email verification is required before first sign-in.
        setState((prev) => ({ ...prev, isLoading: false }));
      } else {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: res.error?.message ?? "Registration failed",
        }));
      }
      return res;
    },
    [authSdk],
  );

  const verifyMfa = React.useCallback(
    async (code: string, sessionId: string) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      const res = await authSdk.verifyMfa(code, sessionId);
      if (res.data) {
        const bundle = res.data as TokenBundle;
        // MFA verify returns tokens; refresh the profile to hydrate user.
        const me = await authSdk.me();
        const user = (me.data ?? {
          id: "",
          email: "",
          name: "",
          memberships: [],
        }) as AuthUser;
        applyTokenPair(
          {
            accessToken: bundle.accessToken,
            refreshToken: bundle.refreshToken,
          },
          user,
        );
      } else {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: res.error?.message ?? "Invalid verification code",
        }));
      }
      return res;
    },
    [authSdk, applyTokenPair],
  );

  const mfaRecovery = React.useCallback(
    async (code: string, sessionId: string) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      const res = await authSdk.mfaRecovery(code, sessionId);
      if (res.data) {
        const bundle = res.data as TokenBundle;
        const me = await authSdk.me();
        const user = (me.data ?? {
          id: "",
          email: "",
          name: "",
          memberships: [],
        }) as AuthUser;
        applyTokenPair(
          {
            accessToken: bundle.accessToken,
            refreshToken: bundle.refreshToken,
          },
          user,
        );
      } else {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: res.error?.message ?? "Invalid recovery code",
        }));
      }
      return res;
    },
    [authSdk, applyTokenPair],
  );

  const logout = React.useCallback(async () => {
    try {
      // Best-effort server-side logout with the current session id.
      const sessionId = state.accessToken;
      if (sessionId) {
        await authSdk.logout(sessionId);
      }
    } catch {
      // Ignore network errors during logout
    }
    storage.clearTokens();
    client.setAccessToken(null);
    setState(SIGNED_OUT_STATE);
  }, [authSdk, client, storage, state.accessToken]);

  const refreshSession = React.useCallback(async () => {
    return refreshAccessToken(authSdk, client, storage);
  }, [authSdk, client, storage]);

  const clearError = React.useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const forgotPassword = React.useCallback(
    async (email: string) => {
      return authSdk.forgotPassword(email);
    },
    [authSdk],
  );

  const resetPassword = React.useCallback(
    async (token: string, newPassword: string) => {
      return authSdk.resetPassword(token, newPassword);
    },
    [authSdk],
  );

  const changePassword = React.useCallback(
    async (currentPassword: string, newPassword: string) => {
      return authSdk.changePassword(currentPassword, newPassword);
    },
    [authSdk],
  );

  const value: AuthContextValue = {
    ...state,
    isAuthenticated,
    client,
    login,
    register,
    verifyMfa,
    mfaRecovery,
    logout,
    refreshSession,
    clearError,
    forgotPassword,
    resetPassword,
    changePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/* ── Hook ──────────────────────────────────────────────────── */

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an <ArcProvider>");
  }
  return ctx;
}

/**
 * Same as useAuth, but returns null when no <ArcProvider> is present.
 * Useful for layout shells that render with or without auth context
 * (e.g. ConsoleLayout used by docs/static sites).
 */
export function useOptionalAuth(): AuthContextValue | null {
  return React.useContext(AuthContext);
}

/* ── Helpers ───────────────────────────────────────────────── */

async function refreshAccessToken(
  authSdk: AuthSdk,
  client: ArcIdClient,
  storage: TokenStorage,
): Promise<string | null> {
  const refreshToken = storage.getRefreshToken();
  if (!refreshToken) return null;

  const res = await authSdk.refresh(refreshToken);
  if (res.data) {
    const newAccess = res.data.accessToken;
    const newRefresh = res.data.refreshToken ?? refreshToken;
    storage.setTokens(newAccess, newRefresh);
    client.setAccessToken(newAccess);
    return newAccess;
  }

  storage.clearTokens();
  client.setAccessToken(null);
  return null;
}
