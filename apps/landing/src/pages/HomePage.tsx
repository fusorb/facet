import { Button } from "@fusorb/facet-components";
import { Link } from "react-router-dom";
import { SITE_PACKAGES, SITE_PACKAGES_COUNT, COMPONENT_COUNT, ICON_COUNT } from "../data/site-data.generated.js";
import { ECOSYSTEM, getEcosystemDocsUrl } from "../data/ecosystem.js";
import { getDocsUrl, getGitHubUrl, getPlaygroundUrl } from "../site.config.js";

export function HomePage() {
  return (
    <main className="mx-auto flex min-h-svh max-w-5xl flex-col gap-12 px-6 py-16">
      <header className="space-y-4">
        <p className="text-sm font-medium text-muted-foreground">fusorb / facet</p>
        <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
          Domain-customizable, auth-first UI ecosystem
        </h1>
        <p className="max-w-2xl text-pretty text-muted-foreground">
          A clean rebuild of the Facet landing surface. Packages, components, auth, layout, docs, motion, and tooling — wired for SovGrant and the Fusorb ecosystem.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button asChild><a href={getDocsUrl()}>Open docs</a></Button>
          <Button variant="outline" asChild><a href={getPlaygroundUrl()}>Playground</a></Button>
          <Button variant="ghost" asChild><a href={getGitHubUrl()}>GitHub</a></Button>
          <Button variant="ghost" asChild><Link to="/feedback">Feedback</Link></Button>
        </div>
      </header>

      <section aria-label="At a glance" className="grid gap-4 sm:grid-cols-3">
        <Stat value={String(SITE_PACKAGES_COUNT)} label="packages" />
        <Stat value={String(COMPONENT_COUNT)} label="components" />
        <Stat value={String(ICON_COUNT)} label="icons" />
      </section>

      <section aria-labelledby="ecosystem-heading" className="space-y-4">
        <h2 id="ecosystem-heading" className="text-xl font-semibold">Ecosystem</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {ECOSYSTEM.map((entry) => (
            <a
              key={entry.slug}
              href={getEcosystemDocsUrl(entry)}
              className="rounded-xl border border-border/60 bg-card/30 p-4 transition-colors hover:bg-card/50"
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-medium">{entry.title}</span>
                <span className="text-xs text-muted-foreground">{entry.version || "—"}</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{entry.short}</p>
            </a>
          ))}
        </div>
      </section>

      <section aria-labelledby="packages-heading" className="space-y-3">
        <h2 id="packages-heading" className="text-xl font-semibold">Packages</h2>
        <ul className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
          {SITE_PACKAGES.map((pkg) => (
            <li key={pkg.name} className="flex items-center justify-between gap-3 rounded-lg border border-border/40 px-3 py-2">
              <span className="font-mono text-xs text-foreground">{pkg.name}</span>
              <span className="text-xs">v{pkg.version}</span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/40 p-5">
      <div className="text-3xl font-semibold text-foreground">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}
