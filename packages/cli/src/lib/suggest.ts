/**
 * Repo-aware suggestion engine for the facet CLI.
 *
 * The CLI understands the consumer's repo (framework, package manager,
 * monorepo layout, installed packages) and can suggest concrete next
 * steps tied to it, not generic boilerplate. This module is the general
 * harness: any command can build a `RepoContext` from a detection and
 * register command-specific suggestion providers.
 *
 * Usage:
 *   const ctx = buildRepoContext(cwd);
 *   const steps = suggestRepoSteps(ctx, [
 *     emailSuggestionProvider(detection, answers),
 *     generalRepoProvider(ctx),
 *   ]);
 */

import {
  detectPackageManager,
  detectFramework,
  detectMonorepo,
  collectFacetDeps,
  type PackageManager,
  type Framework,
} from "./types.js";

/** What the CLI knows about the consumer's repo (the "understanding"). */
export interface RepoContext {
  cwd: string;
  pm: PackageManager;
  framework: Framework;
  monorepo: string[] | null;
  /** Facet packages the consumer already depends on. */
  facetPackages: string[];
}

/** Build the repo context from a directory. */
export function buildRepoContext(cwd: string): RepoContext {
  return {
    cwd,
    pm: detectPackageManager(cwd),
    framework: detectFramework(cwd),
    monorepo: detectMonorepo(cwd),
    facetPackages: Object.keys(collectFacetDeps(cwd)),
  };
}

/** A provider returns suggestion strings (possibly empty). */
export type SuggestionProvider = (ctx: RepoContext) => string[];

/** Run providers and dedupe, producing the ordered suggestion list. */
export function suggestRepoSteps(
  ctx: RepoContext,
  providers: SuggestionProvider[],
): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const provider of providers) {
    for (const step of provider(ctx)) {
      if (seen.has(step)) continue;
      seen.add(step);
      out.push(step);
    }
  }
  return out;
}

/**
 * General repo-wide suggestions that apply regardless of which facet
 * command ran: framework integration, monorepo hygiene, and dependency
 * housekeeping. Command-specific providers (e.g. emails) can be combined
 * with this.
 */
export function generalRepoProvider(ctx: RepoContext): string[] {
  const s: string[] = [];

  // Framework integration.
  if (ctx.framework === "next") {
    s.push(
      `Next.js: keep server-only work (API routes, server actions) in app/ and use "use client" only where interactivity requires it.`,
    );
  } else if (ctx.framework === "remix") {
    s.push(
      `Remix: loaders/actions run server-side; keep secrets (tokens, keys) out of client components.`,
    );
  } else if (ctx.framework === "react-vite") {
    s.push(
      `Vite: for anything needing server-side values, use a serverless function or a small API route rather than baking secrets into the client bundle.`,
    );
  } else {
    s.push(
      `Plain Node/backend: prefer the framework-agnostic facet packages (facet-sdk, facet-emails core) which have zero React dependency.`,
    );
  }

  // Monorepo hygiene.
  if (ctx.monorepo && ctx.monorepo.length) {
    s.push(
      `Monorepo (${ctx.monorepo.join(", ")}): add facet packages to the workspace member(s) that actually use them, not just the root, so versioning stays per-package.`,
    );
  }

  // Dependency hygiene: facet CLI not present as a devDependency.
  if (!ctx.facetPackages.includes("@fusorb/facet-cli")) {
    s.push(
      `Add the facet CLI to your devDependencies to run these helpers anywhere: \`${ctx.pm} add -D @fusorb/facet-cli\`.`,
    );
  }

  return s;
}
