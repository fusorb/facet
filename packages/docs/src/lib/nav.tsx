import * as React from "react";
import type { LayoutConfig, NavItem, NavSection } from "@fusorb/facet-layout";
import type { DocsPage } from "./pages.js";
import { extendedManifest } from "./manifest.js";

/**
 * Navigation config for the docs site shell (feeds facet Sidebar).
 *
 * The Guides, Foundations, and Ecosystem sections are derived from the
 * pages registry passed to <DocsApp>, so pages and navigation stay in
 * lockstep: add a page to the registry and it appears in the sidebar and in
 * the search palette automatically.
 */
export interface DocsSiteConfig {
  brand: LayoutConfig["brand"];
  /** Extra nav sections rendered in the sidebar (e.g. a Components section). */
  navigation: LayoutConfig["navigation"];
  /** Optional ecosystem links, rendered as a final "Ecosystem" section. */
  ecosystem?: { label: string; href: string; icon?: React.ReactNode }[];
}

/** Section id -> sidebar heading. */
const SECTION_TITLES: Record<string, string> = {
  guides: "Guides",
  auth: "Auth",
  foundations: "Foundations",
  ecosystem: "Ecosystem",
};

/** Display title for a page section id ("ready-to-use" -> "Ready to Use"). */
function titleFor(section: string): string {
  if (SECTION_TITLES[section]) return SECTION_TITLES[section]!;
  return section
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

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

  const bySection = (section: DocsPage["section"]) =>
    pages.filter((page) => page.section === section);

  // The Components, Ready-to-Use and Pages sections are inserted after the
  // Auth section so the gallery follows auth in the sidebar. They render
  // before the remaining page-driven sections (foundations, ecosystem).
  const ORDER = [
    "guides",
    "auth",
    "components",
    "ready-to-use",
    "pages",
    "animation",
    "foundations",
    "ecosystem",
  ];
  const seen = new Set(ORDER);
  const ordered = [...ORDER];
  for (const page of pages) {
    if (!seen.has(page.section)) {
      seen.add(page.section);
      ordered.push(page.section);
    }
  }

  // Build the components + ready-to-use + pages sections first so we can
  // insert them at the right positions in the ordered sections below.
  const componentsSection = showComponents
    ? buildComponentsSection()
    : undefined;
  const readyToUseSection = showComponents
    ? buildReadyToUseSection()
    : undefined;
  const pagesSection = showComponents ? buildPagesSection() : undefined;
  const animationSection = showComponents ? buildAnimationSection() : undefined;

  for (const section of ordered) {
    // The components / ready-to-use / pages / animation sections are
    // assembled from the manifest, not pages.
    if (section === "components") {
      if (componentsSection) navigation.push(componentsSection);
      continue;
    }
    if (section === "ready-to-use") {
      if (readyToUseSection) navigation.push(readyToUseSection);
      continue;
    }
    if (section === "pages") {
      if (pagesSection) navigation.push(pagesSection);
      continue;
    }
    if (section === "animation") {
      if (animationSection) navigation.push(animationSection);
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

    navigation.push({ title: titleFor(section), id: section, items });
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

/**
 * Build the sidebar Components section from the manifest: "All components"
 * then one collapsible sub-group per manifest category. Base UI primitives
 * render here grouped by category (layout, feedback, data-display, inputs,
 * general). The auth/layout guide-page surfaces (SignIn, SignUp,
 * ConsoleLayout, ...), foundations (Icon, Theme), and Ready-to-Use
 * components are excluded because they have their own guide sections.
 */
function buildComponentsSection(): NavSection {
  const byCategory = new Map<string, typeof extendedManifest>();
  for (const entry of extendedManifest) {
    if (
      entry.category === "foundations" ||
      entry.category === "ready-to-use" ||
      entry.category === "pages" ||
      entry.category === "auth" ||
      entry.category === "animation"
    ) {
      continue;
    }
    // The extended layout guide entries (ConsoleLayout, AuthLayout,
    // Sidebar, Topbar, LandingLayout) are excluded by name; the base ui
    // "layout" category (Accordion, Breadcrumb, Tabs, ...) stays.
    if (entry.category === "layout" && isExtendedLayoutSlug(entry.slug)) {
      continue;
    }
    const list = byCategory.get(entry.category) ?? [];
    list.push(entry);
    byCategory.set(entry.category, list);
  }
  const items: NavItem[] = [{ href: "/components", label: "All components" }];
  for (const [category, entries] of byCategory) {
    items.push({
      href: `/components/${entries[0]!.slug}`,
      label: category
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" "),
      children: entries.map((entry) => ({
        href: `/components/${entry.slug}`,
        label: entry.name,
      })),
    });
  }
  return { title: "Components", id: "components", items };
}

/** Slugs of the extended @fusorb/facet-layout guide entries. */
const EXTENDED_LAYOUT_SLUGS = new Set([
  "console-layout",
  "auth-layout",
  "landing-layout",
  "sidebar",
  "topbar",
]);

export function isExtendedLayoutSlug(slug: string): boolean {
  return EXTENDED_LAYOUT_SLUGS.has(slug);
}

/**
 * Build the dedicated "Ready to Use" sidebar section from the manifest:
 * ready-to-use extras (Dropzone, ColorPicker, QRCode, Marquee, Roadmap,
 * Form) rendered as top-level items with their gallery pages.
 */
export function buildReadyToUseSection(): NavSection {
  const readyToUse = extendedManifest.filter(
    (entry) => entry.category === "ready-to-use",
  );
  return {
    title: "Ready to Use",
    id: "ready-to-use",
    items: readyToUse.map((entry) => ({
      href: `/components/${entry.slug}`,
      label: entry.name,
    })),
  };
}

/**
 * Build the dedicated "Pages" sidebar section from the manifest: full-page
 * components (FeedbackPage, Footer, ...) rendered as top-level items with
 * their gallery pages. New page components added over time land here.
 */
export function buildPagesSection(): NavSection {
  const pages = extendedManifest.filter((entry) => entry.category === "pages");
  return {
    title: "Pages",
    id: "pages",
    items: pages.map((entry) => ({
      href: `/components/${entry.slug}`,
      label: entry.name,
    })),
  };
}

/**
 * Build the dedicated "Animation" sidebar section - a FLAT list (no nested
 * "Text"/"Cards" parents). TypewriterText is documented as tabs on the
 * text-animations page, so it has no standalone entry here.
 */
export function buildAnimationSection(): NavSection {
  const animations = extendedManifest.filter(
    (entry) => entry.category === "animation",
  );
  // Stable, readable order rather than alphabetical.
  const ORDER = [
    "text-animations",
    "card-animations",
    "animated-button",
    "micro-interactions",
    "animated",
  ];
  const bySlug = new Map(animations.map((a) => [a.slug, a]));
  const items: NavItem[] = [];
  for (const slug of ORDER) {
    const entry = bySlug.get(slug);
    if (entry) {
      items.push({ href: `/components/${entry.slug}`, label: entry.name });
    }
  }
  // Any animation entries not in ORDER still surface at the end.
  for (const entry of animations) {
    if (!ORDER.includes(entry.slug)) {
      items.push({ href: `/components/${entry.slug}`, label: entry.name });
    }
  }
  return { title: "Animation", id: "animation", items };
}

/** Export a nav item type for consumers building their own sections. */
export type { NavItem, NavSection };
