import { LandingLayout } from "@fusorb/facet-layout";
import { Nav } from "../components/Nav.js";
import { Footer } from "../components/Footer.js";
import { HeroSection } from "../components/sections/HeroSection.js";
import { FeaturesSection } from "../components/sections/FeaturesSection.js";
import { DemoShowcaseSection } from "../components/sections/DemoShowcaseSection.js";
import { AuthShowcaseSection } from "../components/sections/AuthShowcaseSection.js";
import { PricingTeaserSection } from "../components/sections/PricingTeaserSection.js";
import { ChangelogSection } from "../components/sections/ChangelogSection.js";
import { FaqSection } from "../components/sections/FaqSection.js";
import { InstallSection } from "../components/sections/InstallSection.js";
import { CTASection } from "../components/sections/CTASection.js";

export function HomePage() {
  return (
    <LandingLayout nav={<Nav />} hero={<HeroSection />} footer={<Footer />}>
      <FeaturesSection />
      <DemoShowcaseSection />
      <AuthShowcaseSection />
      <PricingTeaserSection />
      <ChangelogSection />
      <FaqSection />
      <InstallSection />
      <CTASection />
    </LandingLayout>
  );
}
