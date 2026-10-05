/**
 * Landing domain content accessor.
 *
 * The domain switching UI (DomainToggle, lab presets) has been removed
 * from the landing app. `useDomain()` returns the default domain content
 * directly — no context, no provider, no switching.
 */

import { getDocsUrl } from "../site.config.js";
import { site } from "../site.config.js";
import type { CtaAction } from "./domain-config.js";
import { domainDefs } from "./domain-config.js";

export const domain = domainDefs.default;

export function useDomain() {
  const handleCta = (action: CtaAction) => {
    switch (action) {
      case "docs":
        window.open(getDocsUrl(), "_blank", "noopener,noreferrer");
        break;
      case "install": {
        const el = document.getElementById("install");
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
        break;
      }
      case "github":
        window.open(site.links.github, "_blank", "noopener,noreferrer");
        break;
      case "pricing":
        window.location.assign("/pricing");
        break;
      case "feedback":
        window.location.assign("/feedback");
        break;
    }
  };

  return { domain, handleCta };
}
