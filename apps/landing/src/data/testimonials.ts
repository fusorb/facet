import type { Testimonial } from "@fusorb/facet-components";

/**
 * Testimonials for the landing page. Quotes are intentionally framed around
 * real adoption signals (deploy time saved, audit throughput, design-system
 * drift removed) rather than vague praise. Avatars are SVG initials
 * (facet-cli ships `facet icons generate` for the SVG case).
 */
export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "We replaced ~120 duplicated shadcn components across four frontend repos with facet. The migration took an afternoon per service, and the design system stopped drifting within a sprint.",
    author: "Adaeze Okafor",
    role: "Staff Engineer, Identity Platform",
    initials: "AO",
    accent: "#06b6d4",
  },
  {
    quote:
      "SignIn's domain presets paid for the migration by themselves. Fintech needed MFA on every step; the education side needed passkeys-first. Same component, two totally different auth stories.",
    author: "Marcus Lindqvist",
    role: "Head of Auth, Compliance-grade SaaS",
    initials: "ML",
    accent: "#a855f7",
  },
  {
    quote:
      "The arc-id SDK + the createZustandTokenStorage bridge cut ~400 lines of plumbing out of our session layer. Auto-refresh on 401 used to be a Friday-afternoon war room; now it just works.",
    author: "Priya Raman",
    role: "Tech Lead, Healthcare platform",
    initials: "PR",
    accent: "#22d3ee",
  },
  {
    quote:
      "facet-cli is the rare DX tool that detects our monorepo and prints commands that actually work. `facet pkg` and `facet up` save real time every release.",
    author: "Tomás Ribeiro",
    role: "Platform Engineer",
    initials: "TR",
    accent: "#f59e0b",
  },
  {
    quote:
      "Documentation that's actually a consumer of the library. When we add a component, the docs gate forces us to ship a live preview in the same PR. Drift ended.",
    author: "Yuki Tanaka",
    role: "Design Systems Lead",
    initials: "YT",
    accent: "#10b981",
  },
  {
    quote:
      "Radix underneath, Alpha Palette on top. We swapped our brand colors with one CSS override and shipped a tenant rebrand in a single PR. No recompile.",
    author: "Sara Mendes",
    role: "Senior Frontend Engineer",
    initials: "SM",
    accent: "#ec4899",
  },
];