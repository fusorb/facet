# @fusorb/facet-components

113 styled Radix UI components — shadcn-style: Radix primitives + Alpha Palette
styling + `tailwind-merge`. No business logic, just polished, accessible UI.
Motion primitives are re-exported from `@fusorb/facet-motion`.

## Install

```bash
pnpm add @fusorb/facet-components
pnpm add @fusorb/facet-tokens
```

## Wire it up

```css
@import "tailwindcss";
@import "@fusorb/facet-tokens/tokens.css";
@import "@fusorb/facet-components/tailwind.css"; /* registers animate-facet-* utilities */
```

## Usage

```tsx
import { Button, Input, Card, ThemeProvider } from "@fusorb/facet-components";

<ThemeProvider>
  <Card>
    <Input placeholder="Email" />
    <Button>Submit</Button>
  </Card>
</ThemeProvider>
```

## Component categories

| Category | Components |
|----------|------------|
| **Primitives** | Button, Input, Badge, Pill, Toggle, Card, Dialog, Sheet, Drawer, Popover, Tooltip, DropdownMenu, ContextMenu, Menubar, Accordion, Tabs, Separator, ScrollArea, Skeleton, Avatar, Checkbox, Switch, Slider, Progress, Table, Form, Label, etc. |
| **Data display** | StatCard, ActivityFeed, DataTable, Carousel, Chart, KanbanBoard, Roadmap, LayerGraph, Tree, etc. |
| **Navigation** | Navbar, Breadcrumb, Pagination, NavigationMenu, Stepper, etc. |
| **Marketing** | HeroSection, FaqSection, TestimonialShowcase, AnnouncementBar, CookieConsent, PricingComparison, etc. |
| **Auth & security** | SignIn, SignUp, Guard, MfaDialog, OtpVerificationCard, TwoFactorSetupPanel, PasswordStrengthMeter, ApiKeyManager, AccountSettingsPanel, SecuritySectionCard, InviteTeamForm, etc. |
| **Input** | PhoneNumber, LocationPicker, CountryCodeInput, ColorPicker, QRCode, Marquee, DateRangePicker, TagInput, RatingInput, RichTextEditor, MentionInput, etc. |
| **Surfaces** | FlipCard, GlowCard, HoverScaleCard, MagneticCard, TiltCard, RippleButton, ShineBorderCard, AnimatedButton, etc. |
| **Animations** | Motion, Reveal, Stagger, Presence, Spotlight, Aurora, Beams, GridPattern, SparkleButton, TypewriterText, BlurText, WaveText, FlipText, etc. |
| **Ready-to-use pages** | BillingPage, FeedbackPage, NotFound, PageHeader, EmptyStatePage, etc. |

See the [component gallery](https://facet.dev/components) for live demos of all
113 components.

## Theming

Components read **semantic** CSS variables (`--primary`, `--background`,
`--ring`, `--card`, …) never raw colors. Override these variables to re-brand
the entire system. See `@fusorb/facet-tokens` for the full token contract.

## Domain customization

Components accept a `data-theme` or `data-brand` attribute for per-domain
theming. The `ThemeProvider` component (also exported from this package)
manages system / light / dark preference and persists the choice to
`localStorage`.

## License

MIT © facet contributors. See [LICENSE](../../LICENSE) at the repository root.
