"use client";

import { AboutSection, CampaignSection, ContactSection, Hero, PartnerSection, PinnedSection, RateCardSection, SkillsSection, StatsSection, WorkSection } from "./sections";

export function HomeView() {
  return (
    <>
      <Hero />
      <AboutSection />
      <PinnedSection />
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
