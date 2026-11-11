"use client";

import { AboutSection, CampaignSection, ContactSection, Hero, PartnerSection, SkillsSection, StatsSection, WorkSection } from "./sections";

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
      <ContactSection />
    </>
  );
}
