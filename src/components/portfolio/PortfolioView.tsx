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
import { applyThemeToDocument, getPreset, resolveThemeColors } from "@/lib/themes";

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
    const colors = resolveThemeColors(data.themeId, data.customColors);
    const mode =
      data.themeId === "custom"
        ? // Heuristic: light if background is bright
          luminance(colors.background) > 0.45
          ? "light"
          : "dark"
        : getPreset(data.themeId)?.mode ?? "dark";
    applyThemeToDocument(colors, mode);
  }, [data.themeId, data.customColors]);

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

function luminance(hex: string): number {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
  if (!m) return 0;
  const [r, g, b] = [m[1], m[2], m[3]].map((x) => {
    const c = parseInt(x, 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
