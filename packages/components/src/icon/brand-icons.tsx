/**
 * @fusorb/facet-components: Brand & social icons as inline SVGs.
 *
 * lucide-react deprecated its brand/social icon set and has been removing
 * entries (13 of the former ~28 are already gone in 0.468). We keep the
 * ones consumers commonly need as first-class icons in the registry so
 * they never depend on lucide's churn: same convention as GithubIcon in
 * registry.tsx.
 *
 * These follow the lucide stroke style (stroke="currentColor") so they
 * inherit text color and theme like every other icon.
 */

import type { IconComponent } from "./registry.js";

interface BrandIconProps {
  className?: string;
  size?: number | string;
  label: string;
  /** Optional consumer label; defaults to the brand name. */
  "aria-label"?: string;
  children: React.ReactNode;
}

function BrandIcon({ className, size, label, "aria-label": ariaLabel, children }: BrandIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role="img"
      aria-label={ariaLabel ?? label}
    >
      {children}
    </svg>
  );
}

function makeBrand(label: string, paths: React.ReactNode): IconComponent {
  return function Brand({ className, size, ...props }) {
    return (
      <BrandIcon className={className} size={size} label={label} {...props}>
        {paths}
      </BrandIcon>
    );
  };
}

/** GitHub mark. */
export const GithubIcon: IconComponent = makeBrand(
  "GitHub",
  <>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </>,
);

/** LinkedIn mark. */
export const LinkedinIcon: IconComponent = makeBrand(
  "LinkedIn",
  <>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </>,
);

/** Instagram mark. */
export const InstagramIcon: IconComponent = makeBrand(
  "Instagram",
  <>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </>,
);

/** Facebook mark. */
export const FacebookIcon: IconComponent = makeBrand(
  "Facebook",
  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />,
);

/** TikTok mark. */
export const TiktokIcon: IconComponent = makeBrand(
  "TikTok",
  <path d="M9 12a4 4 0 1 0 4 4V4c.5 2.5 2.5 4 5 4" />,
);

/** WhatsApp mark. */
export const WhatsappIcon: IconComponent = makeBrand(
  "WhatsApp",
  <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />,
);

/** X (formerly Twitter) mark. */
export const XIcon: IconComponent = makeBrand(
  "X",
  <path d="M4 4l16 16M20 4L4 20" />,
);

/** Twitter mark. */
export const TwitterIcon: IconComponent = makeBrand(
  "Twitter",
  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />,
);

/** YouTube mark. */
export const YoutubeIcon: IconComponent = makeBrand(
  "YouTube",
  <>
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
    <path d="m10 15 5-3-5-3z" />
  </>,
);

/** Slack mark. */
export const SlackIcon: IconComponent = makeBrand(
  "Slack",
  <>
    <rect x="13" y="2" width="6" height="12" rx="3" />
    <path d="M13 8H5a3 3 0 1 1 0-6h2" />
    <rect x="2" y="13" width="12" height="6" rx="3" />
    <path d="M16 13v8a3 3 0 1 0 6 0v-2" />
  </>,
);

/** Discord mark. */
export const DiscordIcon: IconComponent = makeBrand(
  "Discord",
  <>
    <path d="M9.5 11.5h.01M14.5 11.5h.01" />
    <path d="M15.5 16c-.9.4-2.3.7-3.5.7s-2.6-.3-3.5-.7c-.9-1.2-1.5-2.6-1.5-4.2 0-2.5 2.2-4.5 5-4.5s5 2 5 4.5c0 1.6-.6 3-1.5 4.2z" />
    <path d="M8.5 12c-1 0-2.5-.5-2.5-2S8 8.5 9 9c.6.5 1 1.5 1 2" />
    <path d="M15.5 12c1 0 2.5-.5 2.5-2S16 8.5 15 9c-.6.5-1 1.5-1 2" />
  </>,
);

/** Telegram mark. */
export const TelegramIcon: IconComponent = makeBrand(
  "Telegram",
  <path d="m22 2-7 20-4-9-9-4Z" />,
);

/** Figma mark. */
export const FigmaIcon: IconComponent = makeBrand(
  "Figma",
  <>
    <path d="M5 5.5A3.5 3.5 0 0 1 8.5 2H12v7H8.5A3.5 3.5 0 0 1 5 5.5z" />
    <path d="M12 2h3.5a3.5 3.5 0 1 1 0 7H12V2z" />
    <path d="M12 12.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 1 1-7 0z" />
    <path d="M5 19.5A3.5 3.5 0 0 1 8.5 16H12v3.5a3.5 3.5 0 1 1-7 0z" />
    <path d="M5 12.5A3.5 3.5 0 0 1 8.5 9H12v7H8.5A3.5 3.5 0 0 1 5 12.5z" />
  </>,
);

/** Spotify mark. */
export const SpotifyIcon: IconComponent = makeBrand(
  "Spotify",
  <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm4.5 14.4c-.2.3-.6.4-.9.2-2.4-1.5-5.5-1.8-9.1-1-.4.1-.7-.2-.8-.5-.1-.4.2-.7.5-.8 3.9-.9 7.4-.5 10 1.2.3.1.4.6.3.9z" />,
);

/** All brand icons keyed by lowercase registry name. */
export const brandIcons: Record<string, IconComponent> = {
  github: GithubIcon,
  linkedin: LinkedinIcon,
  instagram: InstagramIcon,
  facebook: FacebookIcon,
  tiktok: TiktokIcon,
  whatsapp: WhatsappIcon,
  x: XIcon,
  twitter: TwitterIcon,
  youtube: YoutubeIcon,
  slack: SlackIcon,
  discord: DiscordIcon,
  telegram: TelegramIcon,
  figma: FigmaIcon,
  spotify: SpotifyIcon,
};
