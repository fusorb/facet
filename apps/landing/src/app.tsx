import * as React from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { NotFound, ThemeProvider } from "@fusorb/facet-components";
import { LandingLayout } from "@fusorb/facet-layout";
import { Nav } from "./components/Nav.js";
import { HeroSection } from "./components/HeroSection.js";
import { DemoSection } from "./components/DemoSection.js";
import { InstallSection } from "./components/InstallSection.js";
import { FaqSection } from "./components/FaqSection.js";
import { CTASection } from "./components/CTASection.js";
import { TestimonialsSection } from "./components/TestimonialsSection.js";
import { AuthShowcaseSection } from "./components/AuthShowcaseSection.js";
import { PricingTeaserSection } from "./components/PricingTeaserSection.js";
import { ChangelogSection } from "./components/ChangelogSection.js";
import { Footer } from "./components/Footer.js";
import { FeedbackPage } from "./pages/FeedbackPage.js";
import { AboutPage } from "./pages/AboutPage.js";
import { EcosystemPage } from "./pages/EcosystemPage.js";
import { EcosystemDetailPage } from "./pages/EcosystemDetailPage.js";
import { PricingPage } from "./pages/PricingPage.js";
import { SecurityPage } from "./pages/SecurityPage.js";
import { DashboardDemoPage } from "./pages/DashboardDemoPage.js";

function HomePage() {
  return (
    <LandingLayout nav={<Nav />} hero={<HeroSection />} footer={<Footer />}>
      <DemoSection />
      <AuthShowcaseSection />
      <PricingTeaserSection />
      <TestimonialsSection />
      <ChangelogSection />
      <FaqSection />
      <InstallSection />
      <CTASection />
    </LandingLayout>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/feedback" element={<FeedbackPage />} />
      <Route path="/ecosystem" element={<EcosystemPage />} />
      <Route path="/ecosystem/:slug" element={<EcosystemDetailPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/security" element={<SecurityPage />} />
      <Route path="/dashboard-demo" element={<DashboardDemoPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

function NotFoundPage() {
  return (
    <>
      <Nav />
      <main className="mx-auto max-w-7xl px-8 py-20">
        <NotFound
          animation="gradient"
          title="Page not found"
          description="The page you're looking for doesn't exist or has been moved."
          actionLabel="Go back home"
          actionHref="/"
        />
      </main>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider defaultTheme="system">
      <BrowserRouter>
        <ScrollToTop />
        <AppRoutes />
      </BrowserRouter>
    </ThemeProvider>
  );
}
