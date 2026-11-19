"use client";

import { AboutSection, CampaignSection, ContactSection, Hero, PartnerSection, RateCardSection, SkillsSection, StatsSection, WorkSection } from "./sections";

export function HomeView() {
  return (
    <>
      <Hero />
      <AboutSection />
      <WorkSection />
      <CampaignSection />
      <PartnerSection />
      <StatsSection />
      <SkillsSection />
      <RateCardSection />
      <ContactSection />
    </>
  );
}
