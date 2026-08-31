"use client";

import { useCallback, useState } from "react";
import { OFFER_CURRENCY, OFFER_VALUE, trackPixel } from "@/lib/meta-pixel";
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

  // Every CTA on the page routes through here, so this is the one place that
  // knows someone showed intent — whichever button they pressed.
  const openWizard = useCallback(() => {
    trackPixel("ViewContent", {
      content_name: "Design Express",
      value: OFFER_VALUE,
      currency: OFFER_CURRENCY,
    });
    setWizardOpen(true);
  }, []);
  const closeWizard = useCallback(() => setWizardOpen(false), []);

  return (
    <>
      <TopBar onStart={openWizard} />
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
