import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// facet-* packages resolve to their built dist via package.json `exports`
// (mirrors what real consumers install) — faster than compiling source.
// Prettier is an optional dev dep: facet-sandbox's Format button degrades
// gracefully when it's absent.
export default defineConfig({ plugins: [tailwindcss(), react()] });
