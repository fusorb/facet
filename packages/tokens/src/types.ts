export interface AlphaPalette {
  readonly deepSpace: "#0A1A2F";
  readonly electricCyan: "#4AD3F5";
  readonly mistGray: "#E0E5E8";
  readonly logicGold: "#D4AF37";
  readonly baseWhite: "#FFFFFF";
}

export interface TypographyScale {
  readonly font: {
    readonly heading: string;
    readonly body: string;
    readonly mono: string;
    readonly technical: string;
  };
  readonly weight: {
    readonly bold: 700;
    readonly semiBold: 600;
    readonly medium: 500;
    readonly regular: 400;
  };
  readonly size: {
    readonly h1: string;
    readonly h2: string;
    readonly h3: string;
    readonly body: string;
    readonly caption: string;
    readonly small: string;
  };
}

export type SpacingToken =
  0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16 | 20 | 24 | 32 | 40 | 48 | 64;
export type SpacingScale = Record<SpacingToken, string>;

export interface SubBrand {
  readonly name: string;
  readonly accent: string;
}

export type SubBrandKey =
  "fellowship" | "labs" | "academy" | "ventures" | "community" | "research";
export type SubBrands = Record<SubBrandKey, SubBrand>;

/** Motion duration tokens (CSS: --motion-duration-*) */
export type MotionDuration =
  | "0"
  | "50"
  | "100"
  | "150"
  | "200"
  | "250"
  | "300"
  | "350"
  | "500"
  | "700"
  | "1000";

/** Motion easing tokens (CSS: --motion-ease-*) */
export type MotionEasing =
  | "standard"
  | "standard-decelerate"
  | "standard-accelerate"
  | "emphasized"
  | "emphasized-decelerate"
  | "emphasized-accelerate"
  | "spring"
  | "bounce";

/** Facet motion duration tokens (CSS: --facet-motion-duration-*)
 * Semantic named durations consumed by @fusorb/facet-motion's registry. */
export type FacetMotionDuration = "instant" | "fast" | "base" | "slow" | "cinematic";

/** Facet motion easing tokens (CSS: --facet-motion-ease-*)
 * Curated easing curves for the facet-motion registry. */
export type FacetMotionEasing =
  | "linear"
  | "standard"
  | "smooth"
  | "emphasized"
  | "spring"
  | "elastic";

/** Motion travel-distance tokens (CSS: --motion-distance-*) */
export type MotionDistance = "sm" | "md" | "lg" | "xl" | "2xl";

/** Motion scale tokens (CSS: --motion-scale-*) */
export type MotionScale = "inactive" | "pop";

/** Motion blur tokens (CSS: --motion-blur-*) */
export type MotionBlur = "inactive";

/** Full motion token set. Runtime values are CSS variable references so
 * the actual timing/easing/distance values stay defined in tokens.css
 * and can be overridden per-theme. */
export interface MotionTokens {
  readonly duration: Record<MotionDuration, string>;
  readonly easing: Record<MotionEasing, string>;
  readonly distance: Record<MotionDistance, string>;
  readonly scale: Record<MotionScale, string>;
  readonly blur: Record<MotionBlur, string>;
  readonly staggerDelay: string;
  readonly facetDuration: Record<FacetMotionDuration, string>;
  readonly facetEasing: Record<FacetMotionEasing, string>;
}

/** Easing value as cubic-bezier control points or "linear". */
export type EasingValue = [number, number, number, number] | "linear";

/** Raw numeric motion tokens for React Native.
 * Duration in ms, distance/scale/blur in px (1rem = 16px), easing as
 * [x1, y1, x2, y2] cubic-bezier tuples or "linear". */
export interface MotionValues {
  readonly duration: Record<MotionDuration, number>;
  readonly easing: Record<MotionEasing, EasingValue>;
  readonly distance: Record<MotionDistance, number>;
  readonly scale: Record<MotionScale, number>;
  readonly blur: Record<MotionBlur, number>;
  readonly staggerDelay: number;
  readonly facetDuration: Record<FacetMotionDuration, number>;
  readonly facetEasing: Record<FacetMotionEasing, EasingValue>;
}

export interface FacetTokens {
  alpha: AlphaPalette;
  typography: TypographyScale;
  spacing: SpacingScale;
  subBrands: SubBrands;
  motion: MotionTokens;
}
