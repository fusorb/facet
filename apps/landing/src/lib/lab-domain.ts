/**
 * Lab domain adapter.
 *
 * The landing's `useDomain` hook owns the active domain (persisted to
 * localStorage and wired to the navbar toggle).  `useLabDomain` simply
 * projects that choice onto the richer `LAB_DOMAINS` preset table, which
 * carries an accent color, auth methods, and density per domain.
 *
 * This keeps the labs dynamic with ZERO extra state: toggling the domain
 * in the nav (or the in-lab LabDomainBar) re-themes every lab live, because
 * each lab sets `--domain-accent` from the active preset.
 */

import { useDomain } from "./domain-context.js";
import { LAB_DOMAINS } from "../data/scratchpad.js";
import type { LabDomain } from "../data/scratchpad.js";

export function useLabDomain() {
  const { domainId, switchDomain } = useDomain();
  const domain = LAB_DOMAINS.find((d) => d.id === domainId) ?? LAB_DOMAINS[0]!;
  return { domain, domainId, switchDomain };
}

export { LAB_DOMAINS };
export type { LabDomain };
