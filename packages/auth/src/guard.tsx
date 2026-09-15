/**
 * Guard: route/component-level auth guard.
 *
 * Wraps children and renders them only when the user meets the
 * configured requirements. Supports role-based access control.
 *
 * Usage:
 *   <Guard>
 *     <Dashboard />
 *   </Guard>
 *
 *   <Guard fallback={<LoginPage />}>
 *     <AdminPanel />
 *   </Guard>
 *
 *   <Guard role="admin" fallback={<Unauthorized />}>
 *     <AdminPanel />
 *   </Guard>
 */

import * as React from "react";
import { useAuth } from "./provider.js";
import type { Appearance } from "./types.js";

/* ── Props ─────────────────────────────────────────────────── */

export interface GuardProps {
  /** Required role. If set, user must have this role via memberships. */
  role?: string;
  /** Render when not authenticated. Defaults to null. */
  fallback?: React.ReactNode;
  /** Content to protect */
  children: React.ReactNode;
  appearance?: Appearance;
}

/* ── Component ─────────────────────────────────────────────── */

export function Guard({
  role,
  fallback = null,
  children,
  appearance,
}: GuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Still loading auth state: render nothing or a skeleton
  if (isLoading) {
    return null;
  }

  // Not authenticated: show fallback
  if (!isAuthenticated || !user) {
    return <>{fallback}</>;
  }

  // Role check: look through memberships for the required role
  if (role && user.memberships) {
    const hasRole = user.memberships.some(
      (m) => m.role === role || m.name === role,
    );
    if (!hasRole) {
      return <>{fallback}</>;
    }
  }

  return <div className={appearance?.className}>{children}</div>;
}
