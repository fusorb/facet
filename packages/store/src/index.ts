/**
 * @fusorb/facet-store — Framework-agnostic auth state for ArcID.
 *
 * Owns the Zustand-based session (`useAuthStore`, `useTenantStore`) and the
 * `createZustandTokenStorage` token-refresh bridge. Intended for consumers
 * that drive auth state outside React Hooks (React Native, or non-React shells)
 * and manage their own SDK token refresh.
 *
 * This is an ALTERNATIVE state layer, not the default web path: `@fusorb/facet-auth`'s
 * `<ArcProvider>` (packages/auth) is the production React auth provider (React
 * state + its own `TokenStorage` adapter in auth/src/storage.ts) and does NOT
 * consume this package. The two are a platform split — web React (ArcProvider)
 * vs. framework-agnostic/Zustand (this package), not a duplication.
 *
 * Both layers define a `TokenStorage` adapter interface. Unifying them so a
 * `createZustandTokenStorage(...)` result is directly usable as
 * `<ArcProvider storage>` is tracked as a follow-up (§11 type ownership).
 */
export { useAuthStore } from "./auth.store.js";
export type { AuthState, User } from "./auth.store.js";

export { useTenantStore } from "./tenant.store.js";
export type { TenantState, Tenant } from "./tenant.store.js";

export {
  createZustandTokenStorage,
  type TokenStorage,
  type TokenStoreLike,
  type TokenRefresher,
  type PersistAdapter,
} from "./token-storage.js";
