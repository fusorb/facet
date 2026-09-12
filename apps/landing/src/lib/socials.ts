// Contact + social links for the Arcevo ecosystem. Single source of truth
// for the landing page (nav, footer, feedback page) so redirects stay
// consistent.

export const CONTACT = {
  /** Professional feedback channel (mailto). */
  email: "feedback@fusorbcirqle.com.ng",
  /** WhatsApp (wa.me with country code). */
  whatsapp: "https://wa.me/2347064274648",
  /** Instagram, Facebook, TikTok: shared username, URL pattern shown. */
  instagram: "https://instagram.com/kenny.gr8",
  facebook: "https://facebook.com/kenny.gr8",
  tiktok: "https://tiktok.com/@kenny.gr8",
  /** LinkedIn company page (default professional channel). */
  linkedin: "https://www.linkedin.com/company/arcevocirqle",
} as const;

export type ContactChannel = keyof typeof CONTACT;
