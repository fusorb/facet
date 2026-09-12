/**
 * @fusorb/facet-components: Full lucide icon surface
 *
 * Re-exports every icon, alias, and helper from lucide-react so consuming
 * apps get the entire icon set without installing lucide-react themselves.
 *
 * Import from the subpath to keep it out of the main bundle:
 *
 *   import { Heart, Github, Icon as LIcon, createLucideIcon } from "@fusorb/facet-components/icons";
 *
 * Tree-shaking applies: only the icons you import end up in your bundle.
 */

export * from "lucide-react";
