"use client";

import { useCallback, useState } from "react";
import { TopBar } from "./landing/TopBar";
import { Hero } from "./landing/Hero";
import { BeforeAfter } from "./landing/BeforeAfter";
import { HowItWorks } from "./landing/HowItWorks";
import { ValueStack } from "./landing/ValueStack";
import { Faq } from "./landing/Faq";
import { SiteFooter } from "./landing/SiteFooter";
import { Wizard } from "./landing/Wizard";

/**
 * Horizont Visuals — "Design Express" landing page.
 *
 * Editorial-luxury: warm ivory canvas, deep navy, a thread of antique gold.
 * Every CTA on the page opens the same three-step wizard, which collects the
 * four room photos, six qualifying answers and contact details before handing
 * off to Stripe. All copy is Romanian.
 */
export default function LandingPage() {
  const [wizardOpen, setWizardOpen] = useState(false);

  const openWizard = useCallback(() => setWizardOpen(true), []);
  const closeWizard = useCallback(() => setWizardOpen(false), []);

  return (
    <>
      <TopBar />
      <Hero onStart={openWizard} />
      <BeforeAfter />
      <HowItWorks />
      <ValueStack onStart={openWizard} />
      <Faq />
      <SiteFooter onStart={openWizard} />

      {wizardOpen && <Wizard onClose={closeWizard} />}
    </>
  );
}
