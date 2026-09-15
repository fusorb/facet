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

export interface FacetTokens {
  alpha: AlphaPalette;
  typography: TypographyScale;
  spacing: SpacingScale;
  subBrands: SubBrands;
}
