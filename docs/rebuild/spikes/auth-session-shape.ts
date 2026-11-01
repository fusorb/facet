// Scratch type assertion (M1): AuthSession is structurally assignable to
// LayoutSession (and vice versa's shared fields), so consumers can pass
// `useAuthSession()` straight into a LayoutProvider's `session` prop.
//
// Compile with: npx tsc --noEmit --strict --skipLibCheck \
//   --moduleResolution bundler --module esnext --target es2022 \
//   --baseUrl . --paths '{"@fusorb/facet-auth":["./packages/auth/src/index.ts"],"@fusorb/facet-layout":["./packages/layout/src/index.ts"]}' \
//   docs/rebuild/spikes/auth-session-shape.ts
import type { AuthSession } from "@fusorb/facet-auth";
import type { LayoutSession } from "@fusorb/facet-layout";

// AuthSession -> LayoutSession must type-check (structural assignability).
const toLayout = (s: AuthSession): LayoutSession => s;
// LayoutSession -> the shared shape must accept AuthSession's user (AuthUser).
const fromLayout = (l: LayoutSession): AuthSession => ({
  user: l.user as AuthSession["user"],
  isAuthenticated: l.isAuthenticated,
  isLoading: l.isLoading,
  signOut: l.signOut,
});

void toLayout;
void fromLayout;
export {};
