import type { TypographyScale } from "./types.js";

export const typography: TypographyScale = {
  font: {
    heading: '"Montserrat", sans-serif',
    body: '"Inter", sans-serif',
    mono: '"JetBrains Mono", monospace',
    technical: '"Rajdhani", sans-serif',
  },
  weight: {
    bold: 700,
    semiBold: 600,
    medium: 500,
    regular: 400,
  },
  size: {
    h1: "2rem",
    h2: "1.5rem",
    h3: "1.25rem",
    body: "0.875rem",
    caption: "0.75rem",
    small: "0.6875rem",
  },
} as const;
