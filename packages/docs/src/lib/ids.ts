/**
 * Convert arbitrary heading text into a URL-safe HTML id for anchor links.
 *
 * Used by DocsContentPage (on H2/H3 elements) and DocsTableOfContents (on the
 * "on this page" links) so they share a single source of truth — the id on
 * each heading matches the `href` in the table of contents.
 */
export function slug(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}
