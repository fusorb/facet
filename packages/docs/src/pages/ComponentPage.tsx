import { Link, Navigate, useParams } from "react-router-dom";
import { useDocsDataSource } from "../context.js";
import { PageNav } from "../components/Guide.js";
import { useDocsKeyboardNav, useDocsNavigation } from "../lib/keyboard-nav.js";

export function ComponentPage() {
  const { slug } = useParams();
  const dataSource = useDocsDataSource();
  const { prev, next } = useDocsNavigation();
  useDocsKeyboardNav();

  if (!slug) return <Navigate to="/components" replace />;

  const items = dataSource?.getComponentManifest?.() ?? [];
  const entry = items.find((e) => e.slug === slug);
  if (!entry) return <Navigate to="/components" replace />;

  const preview = dataSource?.getComponentPreview?.(slug);
  const examples =
    dataSource?.getComponentExamples?.(slug) ?? dataSource?.examples?.(slug) ?? [];

  return (
    <article>
      <p className="mb-2 text-sm text-muted-foreground">
        <Link to="/components" className="hover:text-foreground">
          Components
        </Link>{" "}
        / {entry.name}
      </p>
      <h1 className="font-heading text-3xl font-bold text-foreground">{entry.name}</h1>
      {entry.summary ? (
        <p className="mt-2 text-muted-foreground">{entry.summary}</p>
      ) : null}
      <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
        {entry.package ? (
          <span className="rounded bg-muted px-2 py-0.5 font-mono">{entry.package}</span>
        ) : null}
        {entry.category ? <span className="rounded bg-muted px-2 py-0.5">{entry.category}</span> : null}
      </div>

      <section className="mt-8">
        <h2 className="mb-3 font-heading text-lg font-semibold text-foreground">Preview</h2>
        <div className="flex min-h-[120px] items-center justify-center overflow-hidden rounded-lg border border-border bg-muted/20 p-6">
          {preview ?? <span className="text-sm text-muted-foreground">No preview available.</span>}
        </div>
      </section>

      {examples.length > 0 ? (
        <section className="mt-8">
          <h2 className="mb-3 font-heading text-lg font-semibold text-foreground">
            Examples ({examples.length})
          </h2>
          <div className="space-y-6">
            {examples.map((ex) => (
              <div key={ex.id} className="overflow-hidden rounded-lg border border-border">
                <div className="border-b border-border bg-muted/30 px-4 py-2">
                  <div className="text-sm font-medium text-foreground">{ex.title}</div>
                  {ex.description ? (
                    <div className="text-xs text-muted-foreground">{ex.description}</div>
                  ) : null}
                </div>
                <div className="flex min-h-[100px] items-center justify-center p-6">
                  {dataSource?.renderExample ? dataSource.renderExample(ex as any) : null}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <PageNav
        prev={prev ? { label: prev.label, to: prev.path } : undefined}
        next={next ? { label: next.label, to: next.path } : undefined}
      />
    </article>
  );
}
