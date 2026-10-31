/**
 * Docs data-source seam (ADR-003).
 *
 * A consumer (e.g. the facet docs site) plugs a `DocsDataSource` into
 * `<DocsApp>` to drive the component gallery, example lookups, and API
 * reference tables. An engine-only consumer passes none and gets a docs
 * shell with no gallery.
 *
 * This module is facet-agnostic: it defines structural types only and
 * never imports a `@fusorb/*` runtime module.
 */

export type ReferenceEntryKind =
  | "package"
  | "component"
  | "layout"
  | "motion"
  | "token";

export interface ReferenceEntry {
  id: string;
  title: string;
  kind: ReferenceEntryKind;
}

export interface ApiDocProp {
  name: string;
  type: string;
  description?: string;
  optional?: boolean;
}

export interface ApiDocSlot {
  name: string;
  description?: string;
}

export interface ApiDoc {
  props: ApiDocProp[];
  slots: ApiDocSlot[];
}

/**
 * Structural mirror of `@fusorb/facet-sandbox`'s `Example`. Kept local so
 * the docs engine stays dependency-free; structurally compatible.
 */
export interface Example<P = Record<string, unknown>> {
  id: string;
  artifact: string;
  title: string;
  description?: string;
  render: (props: P) => unknown;
  defaults?: Partial<P>;
  controls?: Record<string, unknown>;
  code?: (props: P) => string;
  tags?: string[];
}

export interface DocsDataSource {
  entries(): ReferenceEntry[];
  examples(slug: string): Example[];
  api?(slug: string): ApiDoc | undefined;
}