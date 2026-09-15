/**
 * Tenant SDK: Multi-tenant CRUD, members, policy, DID, signing keys, projects,
 * onboarding flows, JWKS
 *
 * SovGrant paths: /tenants/*, /auth/switch-context, /tenants/invites/accept
 */

import { ArcIdClient } from "./client.js";
import type { ApiResponse } from "./client.js";
import type { SwitchContextResult } from "./auth.sdk.js";
import type {
  InviteAcceptResult,
  JwkKey,
  Membership,
  OnboardingFlow,
  Project,
  SigningKey,
  Tenant,
  TenantDid,
  TenantPolicy,
} from "./types.js";

/* ── SDK Module ────────────────────────────────────────────── */

export class TenantSdk {
  constructor(private client: ArcIdClient) {}

  /* ── Tenant CRUD ──────────────────────────────────────────── */

  list(): Promise<ApiResponse<Tenant[]>> {
    return this.client.get<Tenant[]>("/tenants");
  }

  get(slug: string): Promise<ApiResponse<Tenant>> {
    return this.client.get<Tenant>(`/tenants/${slug}`);
  }

  create(data: { name: string; slug: string }): Promise<ApiResponse<Tenant>> {
    return this.client.post<Tenant>("/tenants", data);
  }

  /* ── Context Switching ────────────────────────────────────── */

  switchTenant(tenantId: string): Promise<ApiResponse<SwitchContextResult>> {
    return this.client.post<SwitchContextResult>("/auth/switch-context", {
      tenantId,
    });
  }

  /* ── Members ──────────────────────────────────────────────── */

  listMembers(tenantId: string): Promise<ApiResponse<Membership[]>> {
    return this.client.get<Membership[]>(`/tenants/${tenantId}/members`);
  }

  addMember(
    tenantId: string,
    data: { identityId: string; role: string },
  ): Promise<ApiResponse<void>> {
    return this.client.post<void>(`/tenants/${tenantId}/members`, data);
  }

  removeMember(
    tenantId: string,
    identityId: string,
  ): Promise<ApiResponse<void>> {
    return this.client.del<void>(`/tenants/${tenantId}/members/${identityId}`);
  }

  /* ── Policy ───────────────────────────────────────────────── */

  getPolicy(tenantId: string): Promise<ApiResponse<TenantPolicy>> {
    return this.client.get<TenantPolicy>(`/tenants/${tenantId}/policy`);
  }

  updatePolicy(
    tenantId: string,
    data: TenantPolicy,
  ): Promise<ApiResponse<void>> {
    return this.client.patch<void>(`/tenants/${tenantId}/policy`, data);
  }

  /* ── Invites ──────────────────────────────────────────────── */

  acceptInvite(data: {
    token: string;
  }): Promise<ApiResponse<InviteAcceptResult>> {
    return this.client.post<InviteAcceptResult>("/invites/accept", data);
  }

  /* ── DID ──────────────────────────────────────────────────── */

  getDid(tenantId: string): Promise<ApiResponse<TenantDid>> {
    return this.client.get<TenantDid>(`/tenants/${tenantId}/did`);
  }

  provisionDid(
    tenantId: string,
    data: { domain: string },
  ): Promise<ApiResponse<void>> {
    return this.client.post<void>(`/tenants/${tenantId}/did`, data);
  }

  /* ── Signing Keys ─────────────────────────────────────────── */

  listSigningKeys(tenantId: string): Promise<ApiResponse<SigningKey[]>> {
    return this.client.get<SigningKey[]>(`/tenants/${tenantId}/signing-keys`);
  }

  createSigningKey(
    tenantId: string,
    data: { displayName?: string; expiresAt?: string },
  ): Promise<ApiResponse<SigningKey>> {
    return this.client.post<SigningKey>(
      `/tenants/${tenantId}/signing-keys`,
      data,
    );
  }

  revokeSigningKey(tenantId: string, kid: string): Promise<ApiResponse<void>> {
    return this.client.del<void>(`/tenants/${tenantId}/signing-keys/${kid}`);
  }

  /* ── Projects ─────────────────────────────────────────────── */

  listProjects(tenantId: string): Promise<ApiResponse<Project[]>> {
    return this.client.get<Project[]>(`/tenants/${tenantId}/projects`);
  }

  createProject(
    tenantId: string,
    data: { name: string; description?: string },
  ): Promise<ApiResponse<Project>> {
    return this.client.post<Project>(`/tenants/${tenantId}/projects`, data);
  }

  getProject(
    tenantId: string,
    projectId: string,
  ): Promise<ApiResponse<Project>> {
    return this.client.get<Project>(
      `/tenants/${tenantId}/projects/${projectId}`,
    );
  }

  updateProject(
    tenantId: string,
    projectId: string,
    data: { name?: string; description?: string },
  ): Promise<ApiResponse<Project>> {
    return this.client.patch<Project>(
      `/tenants/${tenantId}/projects/${projectId}`,
      data,
    );
  }

  deleteProject(
    tenantId: string,
    projectId: string,
  ): Promise<ApiResponse<void>> {
    return this.client.del<void>(`/tenants/${tenantId}/projects/${projectId}`);
  }

  /* ── Onboarding Flows ─────────────────────────────────────── */

  createOnboardingFlow(
    tenantId: string,
    projectId: string,
    data: { name?: string; steps: Array<{ type: string; title?: string }> },
  ): Promise<ApiResponse<OnboardingFlow>> {
    return this.client.post<OnboardingFlow>(
      `/tenants/${tenantId}/projects/${projectId}/onboarding-flows`,
      data,
    );
  }

  listOnboardingFlows(
    tenantId: string,
    projectId: string,
  ): Promise<ApiResponse<OnboardingFlow[]>> {
    return this.client.get<OnboardingFlow[]>(
      `/tenants/${tenantId}/projects/${projectId}/onboarding-flows`,
    );
  }

  getOnboardingFlow(
    tenantId: string,
    projectId: string,
    flowId: string,
  ): Promise<ApiResponse<OnboardingFlow>> {
    return this.client.get<OnboardingFlow>(
      `/tenants/${tenantId}/projects/${projectId}/onboarding-flows/${flowId}`,
    );
  }

  updateOnboardingFlow(
    tenantId: string,
    projectId: string,
    flowId: string,
    data: { name?: string; steps?: Array<{ type: string; title?: string }> },
  ): Promise<ApiResponse<OnboardingFlow>> {
    return this.client.patch<OnboardingFlow>(
      `/tenants/${tenantId}/projects/${projectId}/onboarding-flows/${flowId}`,
      data,
    );
  }

  deleteOnboardingFlow(
    tenantId: string,
    projectId: string,
    flowId: string,
  ): Promise<ApiResponse<void>> {
    return this.client.del<void>(
      `/tenants/${tenantId}/projects/${projectId}/onboarding-flows/${flowId}`,
    );
  }

  /* ── JWKS ─────────────────────────────────────────────────── */

  /** GET /tenants/:slug/jwks: bare { keys } payload. */
  getJwksBySlug(slug: string): Promise<ApiResponse<{ keys: JwkKey[] }>> {
    return this.client.get<{ keys: JwkKey[] }>(`/tenants/${slug}/jwks`, {
      bare: true,
    });
  }
}
