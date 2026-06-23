"use client";

import { usePortfolioStore } from "@/lib/store";
import { SiteNav } from "./SiteNav";
import { HeroSection } from "./HeroSection";
import { AboutSection } from "./AboutSection";
import { SkillsSection } from "./SkillsSection";
import { ExperienceSection } from "./ExperienceSection";
import { ProjectsCarousel } from "./ProjectsCarousel";
import { EducationSection } from "./EducationSection";
import { ContactSection } from "./ContactSection";
import type { SectionId } from "@/lib/types";
import { useEffect, type JSX } from "react";

const SECTION_MAP: Record<SectionId, () => JSX.Element> = {
  hero: HeroSection,
  about: AboutSection,
  skills: SkillsSection,
  experience: ExperienceSection,
  projects: ProjectsCarousel,
  education: EducationSection,
  contact: ContactSection,
};

export function PortfolioView() {
  const data = usePortfolioStore((s) => s.data);
  const hydrated = usePortfolioStore((s) => s.hydrated);
  const runSeoAnalysis = usePortfolioStore((s) => s.runSeoAnalysis);

  useEffect(() => {
    if (hydrated) runSeoAnalysis();
  }, [hydrated, runSeoAnalysis]);

  useEffect(() => {
    document.documentElement.style.setProperty("--accent", data.accentColor);
    document.documentElement.dataset.theme = data.theme;
  }, [data.accentColor, data.theme]);

  const enabled = [...data.sections]
    .filter((s) => s.enabled)
    .sort((a, b) => a.order - b.order);

  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <SiteNav />
      <main id="main-content" tabIndex={-1}>
        {enabled.map((sec) => {
          const Comp = SECTION_MAP[sec.id];
          return Comp ? <Comp key={sec.id} /> : null;
        })}
      </main>
      <footer className="site-footer">
        <div className="container footer-inner">
          <p>
            © {new Date().getFullYear()} {data.hero.name || "Portfolio"}. Built with Portfolio Forge.
          </p>
          <p className="footer-a11y">Designed for WCAG 2.2 AA · prefers-reduced-motion respected</p>
        </div>
      </footer>
    </>
  );
}
