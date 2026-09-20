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
import { ArchitectureSection } from "../components/sections/ArchitectureSection.js";
import { MotionPreviewSection } from "../components/sections/MotionPreviewSection.js";
import { TokensExplorerSection } from "../components/sections/TokensExplorerSection.js";

export function HomePage() {
  return (
    <LandingLayout nav={<Nav />} hero={<HeroSection />} footer={<Footer />}>
      <ArchitectureSection />
      <FeaturesSection />
      <DemoShowcaseSection />
      <AuthShowcaseSection />
      <MotionPreviewSection />
      <PricingTeaserSection />
      <ChangelogSection />
      <FaqSection />
      <TokensExplorerSection />
      <InstallSection />
      <CTASection />
    </LandingLayout>
  );
}
