// @vitest-environment node
import { describe, it, expect } from "vitest";
import {
  buildDocsLayoutConfig,
  isExtendedLayoutSlug,
  type DocsSiteConfig,
} from "./nav.js";
import type { DocsPage } from "./pages.js";
type NavSection = any;

// ── Test helpers ──────────────────────────────────────────

function makeConfig(overrides: Partial<DocsSiteConfig> = {}): DocsSiteConfig {
  return {
    brand: { name: "SovGrant Docs" },
    navigation: [],
    ...overrides,
  };
}

function findSection(
  nav: NavSection[],
  idOrTitle: string,
): NavSection | undefined {
  return nav.find((s) => s.id === idOrTitle || s.title === idOrTitle);
}

// ── isExtendedLayoutSlug ───────────────────────────────────

describe("isExtendedLayoutSlug", () => {
  it("is a deprecated no-op in the data-driven engine (always false)", () => {
    // Extended-layout manifest classification lives in consuming apps (L3);
    // the engine no longer carries facet-specific slug heuristics.
    expect(isExtendedLayoutSlug("console-layout")).toBe(false);
    expect(isExtendedLayoutSlug("auth-layout")).toBe(false);
    expect(isExtendedLayoutSlug("landing-layout")).toBe(false);
    expect(isExtendedLayoutSlug("sidebar")).toBe(false);
    expect(isExtendedLayoutSlug("topbar")).toBe(false);
  });

  it("returns false for component and non-layout slugs", () => {
    expect(isExtendedLayoutSlug("button")).toBe(false);
    expect(isExtendedLayoutSlug("accordion")).toBe(false);
    expect(isExtendedLayoutSlug("sign-in")).toBe(false);
  });

  it("returns false for empty or unknown strings", () => {
    expect(isExtendedLayoutSlug("")).toBe(false);
    expect(isExtendedLayoutSlug("not-a-real-slug")).toBe(false);
  });
});

// ── buildDocsLayoutConfig ──────────────────────────────────

describe("buildDocsLayoutConfig", () => {
  it("returns brand and empty navigation when no pages and no components", () => {
    const config = makeConfig();
    const result = buildDocsLayoutConfig(config, [], false);
    expect(result.brand).toEqual({ name: "SovGrant Docs" });
    expect(result.navigation).toHaveLength(0);
  });

  it("passes through the config's brand and pre-existing navigation", () => {
    const config = makeConfig({
      navigation: [
        {
          title: "Dashboard",
          items: [{ href: "/dashboard", label: "Dashboard" }],
        },
      ],
    });
    const result = buildDocsLayoutConfig(config, [], false);
    expect(result.navigation).toHaveLength(1);
    expect(result.navigation[0]!.title).toBe("Dashboard");
  });

  it("derives a Guides section from pages with section 'guides'", () => {
    const pages: DocsPage[] = [
      {
        path: "/getting-started",
        title: "Getting Started",
        section: "guides",
        blocks: [],
      },
    ];
    const result = buildDocsLayoutConfig(makeConfig(), pages, false);
    const section = findSection(result.navigation, "Guides");
    expect(section).toBeDefined();
    expect(section!.items).toHaveLength(1);
    expect(section!.items[0]!.href).toBe("/getting-started");
    expect(section!.items[0]!.label).toBe("Getting Started");
  });

  it("groups auth pages under a collapsible parent when parent is set", () => {
    const pages: DocsPage[] = [
      {
        path: "/auth/sign-in",
        title: "Sign In",
        section: "auth",
        parent: "Auth",
        blocks: [],
      },
      {
        path: "/auth/sign-up",
        title: "Sign Up",
        section: "auth",
        parent: "Auth",
        blocks: [],
      },
    ];
    const result = buildDocsLayoutConfig(makeConfig(), pages, false);
    const section = findSection(result.navigation, "Auth");
    expect(section).toBeDefined();
    expect(section!.items).toHaveLength(1);
    expect(section!.items[0]!.label).toBe("Auth");
    expect(section!.items[0]!.children).toHaveLength(2);
    expect(section!.items[0]!.children![0]!.label).toBe("Sign In");
    expect(section!.items[0]!.children![1]!.label).toBe("Sign Up");
  });

  it("renders top-level pages without a parent as flat items", () => {
    const pages: DocsPage[] = [
      {
        path: "/guides/intro",
        title: "Intro",
        section: "guides",
        blocks: [],
      },
      {
        path: "/guides/advanced",
        title: "Advanced",
        section: "guides",
        blocks: [],
      },
    ];
    const result = buildDocsLayoutConfig(makeConfig(), pages, false);
    const section = findSection(result.navigation, "Guides");
    expect(section!.items).toHaveLength(2);
    expect(section!.items[0]!.label).toBe("Intro");
    expect(section!.items[1]!.label).toBe("Advanced");
    expect(section!.items[0]!.children).toBeUndefined();
  });

  it("adds a Components section when showComponents is true (data-driven gallery)", () => {
    const result = buildDocsLayoutConfig(makeConfig(), [], true);
    const titles = result.navigation.map((s: any) => s.title);
    expect(titles).toContain("Components");
    // Manifest-derived Pages/Animation sections live in the consuming app (L3).
    expect(titles).not.toContain("Pages");
    expect(titles).not.toContain("Animation");
    expect(titles).not.toContain("Ready to Use");
  });

  it("omits the Components section when showComponents is false", () => {
    const result = buildDocsLayoutConfig(makeConfig(), [], false);
    const titles = result.navigation.map((s: any) => s.title);
    expect(titles).not.toContain("Components");
    expect(titles).not.toContain("Ready to Use");
    expect(titles).not.toContain("Pages");
    expect(titles).not.toContain("Animation");
  });

  it("orders sections: guides, auth, components, foundations, ecosystem", () => {
    const pages: DocsPage[] = [
      {
        path: "/guides/intro",
        title: "Intro",
        section: "guides",
        blocks: [],
      },
      {
        path: "/foundations/tokens",
        title: "Tokens",
        section: "foundations",
        blocks: [],
      },
    ];
    const config = makeConfig({
      ecosystem: [{ label: "SovGrant", href: "https://arc.id" }],
    });
    const result = buildDocsLayoutConfig(config, pages, true);
    const titles = result.navigation.map((s: any) => s.title);

    const idx = (t: string) => titles.indexOf(t);
    expect(idx("Guides")).toBeLessThan(idx("Components"));
    expect(idx("Components")).toBeLessThan(idx("Foundations"));
    expect(idx("Foundations")).toBeLessThan(idx("Ecosystem"));
  });

  it("capitalizes custom section names (e.g. 'my-section' -> 'My Section')", () => {
    const pages: DocsPage[] = [
      {
        path: "/custom/page",
        title: "Custom Page",
        section: "custom-section",
        blocks: [],
      },
    ];
    const result = buildDocsLayoutConfig(makeConfig(), pages, false);
    const titles = result.navigation.map((s: any) => s.title);
    expect(titles).toContain("Custom Section");
  });

  it("adds ecosystem section at the end when config.ecosystem is set", () => {
    const config = makeConfig({
      ecosystem: [
        { label: "GitHub", href: "https://github.com" },
        { label: "Discord", href: "https://discord.gg" },
      ],
    });
    const result = buildDocsLayoutConfig(config, [], false);
    expect(result.navigation.length).toBe(1);
    expect(result.navigation[0]!.title).toBe("Ecosystem");
    expect(result.navigation[0]!.items).toHaveLength(2);
  });

  it("excludes extended layout guide slugs from the Components section", () => {
    const result = buildDocsLayoutConfig(makeConfig(), [], true);
    const componentsSection = findSection(result.navigation, "Components");
    const componentSlugs = componentsSection!.items
      .flatMap((i: any) => i.children ?? [i])
      .map((i: any) => i.href);
    expect(componentSlugs).not.toContain("/components/console-layout");
    expect(componentSlugs).not.toContain("/components/auth-layout");
    expect(componentSlugs).not.toContain("/components/sidebar");
  });

  it("Components section starts with 'All components'", () => {
    const result = buildDocsLayoutConfig(makeConfig(), [], true);
    const componentsSection = findSection(result.navigation, "Components");
    expect(componentsSection!.items[0]!.label).toBe("All components");
    expect(componentsSection!.items[0]!.href).toBe("/components");
  });

  it("does not inject manifest-derived sections (Pages/Animation) in the facet-agnostic engine", () => {
    const result = buildDocsLayoutConfig(makeConfig(), [], true);
    expect(findSection(result.navigation, "Animation")).toBeUndefined();
    expect(findSection(result.navigation, "Pages")).toBeUndefined();
  });
});
