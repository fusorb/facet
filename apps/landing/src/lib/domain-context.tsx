/**
 * React context + provider for the active landing domain.
 *
 * The DomainProvider wraps the entire landing app.  Every section reads
 * its content from `useDomain()` instead of importing hardcoded constants,
 * so switching the domain swaps headlines, features, badges, and demo
 * tabs in a single re-render.
 *
 * The active domain is persisted to `localStorage` ("facet-landing-domain")
 * so the user's choice survives navigation and reloads.
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { getDocsUrl } from "../site.config.js";
import { site } from "../site.config.js";
import { LAB_DOMAINS } from "../data/scratchpad.js";
import type { DomainContent, DomainId, CtaAction } from "./domain-config.js";
import { DOMAIN_IDS, domainDefs } from "./domain-config.js";

interface DomainContextValue {
  domain: DomainContent;
  domainId: DomainId;
  availableDomains: DomainContent[];
  switchDomain: (id: DomainId) => void;
  /** Translates a declarative CtaAction into a real side-effect. */
  handleCta: (action: CtaAction) => void;
}

const DomainContext = createContext<DomainContextValue | undefined>(undefined);

export function useDomain() {
  const ctx = useContext(DomainContext);
  if (!ctx) {
    throw new Error("useDomain must be used within a <DomainProvider>");
  }
  return ctx;
}

const STORAGE_KEY = "facet-landing-domain";

export interface DomainProviderProps {
  children: ReactNode;
  /** Initial domain; falls back to "default" when absent. */
  defaultDomain?: DomainId;
}

export function DomainProvider({
  children,
  defaultDomain = "default",
}: DomainProviderProps) {
  const [domainId, setDomainId] = useState<DomainId>(defaultDomain);

  // Hydrate from localStorage on mount (client-only).
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && stored in domainDefs) {
      setDomainId(stored as DomainId);
    }
  }, []);

  // Persist whenever the domain changes.
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, domainId);
  }, [domainId]);

  // Keep the CSS accent variable in sync with the active domain preset so
  // that `--domain-accent` reflects the user's selection across all lab
  // surfaces and the hero brand line.
  useEffect(() => {
    const labDomain =
      LAB_DOMAINS.find((d) => d.id === domainId) ?? LAB_DOMAINS[0]!;
    document.documentElement.style.setProperty(
      "--domain-accent",
      labDomain.accent,
    );
  }, [domainId]);

  const switchDomain = (id: DomainId) => setDomainId(id);

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

  const value: DomainContextValue = {
    domain: domainDefs[domainId],
    domainId,
    availableDomains: DOMAIN_IDS.map((id) => domainDefs[id]),
    switchDomain,
    handleCta,
  };

  return (
    <DomainContext.Provider value={value}>{children}</DomainContext.Provider>
  );
}
