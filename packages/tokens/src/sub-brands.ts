import type { SubBrands } from "./types.js";

export const subBrands: SubBrands = {
  fellowship: { name: "Fellowship", accent: "#50C878" },
  labs: { name: "Labs", accent: "#7B68EE" },
  academy: { name: "Academy", accent: "#FFBF00" },
  ventures: { name: "Ventures", accent: "#FF7F50" },
  community: { name: "Community", accent: "#87CEEB" },
  research: { name: "Research", accent: "#8FBC8F" },
} as const;
