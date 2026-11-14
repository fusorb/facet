import { create, type StoreApi } from "zustand";
import type { User } from "@fusorb/facet-sdk";
import type { AuthState } from "./auth.store.js";
import type { PersistAdapter } from "./token-storage.js";

/**
 * Structural surface of a secure key-value backend. The consumer supplies its
 * platform's secure medium — e.g. `expo-secure-store` in React Native, or a
 * thin wrapper over `react-native-keychain`. Options are opaque so the store
 * stays framework-agnostic.
 */
export interface SecureStoreBackend {
  getItemAsync(key: string, options?: unknown): Promise<string | null>;
  setItemAsync(key: string, value: string, options?: unknown): Promise<void>;
  deleteItemAsync(key: string, options?: unknown): Promise<void>;
}

/**
 * The session blob persisted to the secure backend. The refresh token is
 * stored here (device-only) but never passed *through* the `PersistAdapter`
 * signature — it is read back out of the store inside `persist()`.
 */
export interface SecureSession {
  user: User;
  accessToken: string;
  refreshToken: string;
  sessionId?: string;
}

/**
 * `AuthState` plus the React-Native-specific concerns the framework-agnostic
 * store deliberately omits: a logout `sessionId` and SecureStore
 * `persist`/`forget`/`restore` lifecycle.
 */
export interface SecureAuthState extends Omit<AuthState, "setAuth"> {
  sessionId: string | null;
  setAuth: (user: User, accessToken: string, refreshToken: string, sessionId?: string) => void;
  /** Persist the current session to the secure store. */
  persist: () => Promise<void>;
  /** Drop the persisted session (sign-out, or a refresh the server rejected). */
  forget: () => Promise<void>;
  /** Restore a persisted session on launch. Returns true if one was found. */
  restore: () => Promise<boolean>;
}

export interface CreateSecureAuthStoreOptions {
  storageKey: string;
  /** The secure medium to write to (e.g. `expo-secure-store`). */
  backend: SecureStoreBackend;
  /** Opaque options passed through to the backend (e.g. keychain accessibility). */
  storageOptions?: unknown;
}

/**
 * A Zustand auth store that persists its session to a secure medium and can be
 * fed into `createZustandTokenStorage` via `createSecurePersistAdapter`.
 */
export function createSecureAuthStore(options: CreateSecureAuthStoreOptions) {
  const { storageKey, backend, storageOptions } = options;

  // Writes are serialized so a sign-out can never be overtaken by a write that
  // was still in flight (a token refresh landing right after logout would
  // otherwise resurrect the session it just dropped).
  let pendingWrite: Promise<void> = Promise.resolve();
  function serialize(write: () => Promise<void>): Promise<void> {
    pendingWrite = pendingWrite.then(write, write);
    return pendingWrite;
  }

  return create<SecureAuthState>((set, get) => ({
    user: null,
    accessToken: null,
    refreshToken: null,
    sessionId: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,

    setAuth: (user, accessToken, refreshToken, sessionId) =>
      set({
        user,
        accessToken,
        refreshToken,
        sessionId: sessionId ?? null,
        isAuthenticated: true,
        isLoading: false,
      }),

    setUser: (user) => set({ user }),

    setTokens: (accessToken, refreshToken) =>
      set((state) => ({
        accessToken,
        ...(refreshToken ? { refreshToken } : {}),
        isAuthenticated: state.isAuthenticated || accessToken !== null,
      })),

    clearAuth: () =>
      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        sessionId: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      }),

    setLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error }),

    persist: () =>
      serialize(async () => {
        const { user, accessToken, refreshToken, sessionId } = get();
        if (!user || !accessToken) return;
        const session: SecureSession = {
          user,
          accessToken,
          refreshToken: refreshToken ?? "",
          sessionId: sessionId ?? undefined,
        };
        await backend.setItemAsync(storageKey, JSON.stringify(session), storageOptions);
      }),

    forget: () => serialize(() => backend.deleteItemAsync(storageKey, storageOptions)),

    restore: async () => {
      try {
        const raw = await backend.getItemAsync(storageKey, storageOptions);
        if (!raw) return false;
        const parsed = JSON.parse(raw) as SecureSession;
        if (!parsed.accessToken || !parsed.user) return false;
        set({
          user: parsed.user,
          accessToken: parsed.accessToken,
          refreshToken: parsed.refreshToken,
          sessionId: parsed.sessionId ?? null,
          isAuthenticated: true,
        });
        return true;
      } catch {
        await get()
          .forget()
          .catch(() => {});
        return false;
      } finally {
        set({ isLoading: false });
      }
    },
  }));
}

/**
 * Bridges a {@link SecureAuthState} store to the `PersistAdapter` contract of
 * `createZustandTokenStorage`. The refresh token is never passed through this
 * adapter — `setAccessToken` only triggers a full-session persist/forget.
 */
export function createSecurePersistAdapter(store: StoreApi<SecureAuthState>): PersistAdapter {
  return {
    getAccessToken: () => store.getState().accessToken,
    setAccessToken: (token) => {
      const state = store.getState();
      if (token === null) {
        void state.forget().catch(() => {});
      } else {
        void state.persist().catch(() => {});
      }
    },
  };
}
