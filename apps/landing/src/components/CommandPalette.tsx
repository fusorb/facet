import { useNavigate } from "react-router-dom";
import { CommandPalette as LayoutCommandPalette } from "@fusorb/facet-layout";
import { useCommandPalette } from "./command-palette-context.js";
import { landingSearchConfig } from "../lib/landing-search-config.js";

/**
 * Full-screen ⌘K command palette wired to facet-layout's CommandPalette.
 * Derives commands from landingSearchConfig (Components / Packages / Docs / Labs).
 * Renders inside App.tsx so it's available across all routes.
 */
export function LandingCommandPalette() {
  const { open, setOpen } = useCommandPalette();
  const navigate = useNavigate();

  return (
    <LayoutCommandPalette
      config={landingSearchConfig}
      open={open}
      onOpenChange={setOpen}
      placeholder="Search components, packages, docs…"
      trigger={null}
      navigate={(href) => {
        if (href.startsWith("/") && !href.startsWith("//")) {
          navigate(href);
        } else {
          window.open(href, "_blank", "noopener,noreferrer");
        }
      }}
    />
  );
}
