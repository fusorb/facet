import type { ReactNode } from "react";

type LayoutConfig = any;
type NavItem = any;
type NavSection = any;
import type { DocsPage } from "./pages.js";

/**
 * Navigation config for the docs site shell (feeds facet Sidebar).
 *
 * The Guides, Foundations, and Ecosystem sections are derived from the
 * pages registry passed to <DocsApp>, so pages and navigation stay in
 * lockstep: add a page to the registry and it appears in the sidebar and in
 * the search palette automatically.
 */
export interface DocsConfig {
  /** Top-level sections (id/label/order/icon). Drives nav section metadata. */
  sections?: { id: string; label: string; order: number; icon?: string }[];
  brand: LayoutConfig["brand"] & {
    url?: string;
    github?: string;
    npmScope?: string;
  };
}

export interface DocsSiteConfig extends DocsConfig {
  /** Extra nav sections rendered in the sidebar (e.g. a Components section). */
  navigation: LayoutConfig["navigation"];
  /** Optional ecosystem links, rendered as a final "Ecosystem" section. */
  ecosystem?: { label: string; href: string; icon?: ReactNode }[];
}

/** Section id -> sidebar heading. */
const SECTION_TITLES: Record<string, string> = {
  guides: "Guides",
  auth: "Auth",
  foundations: "Foundations",
  ecosystem: "Ecosystem",
};

/**
 * Build the full LayoutConfig for a DocsApp instance: the passed
 * navigation sections, the pages-derived sections (in a stable order:
 * guides, auth, then the components section, then foundations and any
 * other sections in first-appearance order).
 *
 * Pages with a `parent` value render as nested children under a
 * collapsible parent item (e.g. auth pages under "Auth").
 */
export function buildDocsLayoutConfig(
  config: DocsSiteConfig,
  pages: DocsPage[],
  showComponents: boolean,
): LayoutConfig {
  const navigation = [...config.navigation];

  // Resolve a section id to its display label, preferring config.sections.
  const sectionLabelMap = new Map(
    (config.sections ?? []).map((s) => [s.id, s.label]),
  );
  const resolveTitle = (section: string): string => {
    if (sectionLabelMap.has(section)) return sectionLabelMap.get(section)!;
    if (SECTION_TITLES[section]) return SECTION_TITLES[section]!;
    return section
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const bySection = (section: DocsPage["section"]) =>
    pages.filter((page) => page.section === section);

  // Content pages are derived from the registry; the optional Components
  // gallery entry is inserted after "auth" when enabled. Any additional
  // sections present in pages are appended in first-seen order.
  const ORDER = ["guides", "auth", "components", "foundations", "ecosystem"];
  const seen = new Set(ORDER);
  const ordered = [...ORDER];
  for (const page of pages) {
    if (!seen.has(page.section)) {
      seen.add(page.section);
      ordered.push(page.section);
    }
  }

  for (const section of ordered) {
    if (section === "components") {
      if (showComponents) {
        navigation.push({
          title: "Components",
          id: "components",
          items: [{ href: "/components", label: "All components" }],
        });
      }
      continue;
    }
    const sectionPages = bySection(section);
    if (sectionPages.length === 0) continue;

    // Flat pages render as top-level section items; pages with a `parent`
    // render under one collapsible parent item per parent name.
    const topLevel: DocsPage[] = [];
    const parents = new Map<string, DocsPage[]>();
    for (const page of sectionPages) {
      if (page.parent) {
        const list = parents.get(page.parent) ?? [];
        list.push(page);
        parents.set(page.parent, list);
      } else {
        topLevel.push(page);
      }
    }

    const items: NavItem[] = topLevel.map((page) => ({
      href: page.path,
      label: page.title,
    }));
    for (const [parent, children] of parents) {
      items.push({
        href: children[0]!.path,
        label: parent,
        children: children.map((child) => ({
          href: child.path,
          label: child.title,
        })),
      });
    }

    navigation.push({ title: resolveTitle(section), id: section, items });
  }

  if (config.ecosystem && config.ecosystem.length > 0) {
    navigation.push({
      title: "Ecosystem",
      id: "ecosystem",
      items: config.ecosystem.map((link) => ({
        href: link.href,
        label: link.label,
        icon: link.icon,
      })),
    });
  }

  return { brand: config.brand, navigation };
}

/** @deprecated Manifest-derived gallery nav lives in the consuming app (L3). */
export function isExtendedLayoutSlug(_slug: string): boolean {
  return false;
}

/** Export a nav item type for consumers building their own sections. */
export type { NavItem, NavSection };
