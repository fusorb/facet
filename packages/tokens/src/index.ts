/**
 * @fusorb/facet-tokens: Design tokens
 *
 * Single source of truth for the Alpha Palette, typography scale,
 * spacing system, and sub-brand accent colors.
 *
 * Usage:
 *   import { alpha, typography, spacing, subBrands } from "@fusorb/facet-tokens";
 *
 * CSS custom properties are available at:
 *   import "@fusorb/facet-tokens/tokens.css";
 */

export { alpha } from "./colors";
export { typography } from "./typography";
export { spacing } from "./spacing";
export { subBrands } from "./sub-brands";
export type {
  AlphaPalette,
  TypographyScale,
  SpacingScale,
  SpacingToken,
  SubBrand,
  SubBrandKey,
  SubBrands,
  FacetTokens,
} from "./types";
