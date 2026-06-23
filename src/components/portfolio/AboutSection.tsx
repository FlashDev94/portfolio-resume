"use client";

import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { usePortfolioStore } from "@/lib/store";

export function AboutSection() {
  const about = usePortfolioStore((s) => s.data.about);

  return (
    <ScrollReveal as="section" id="about" className="section" aria-labelledby="about-heading" tilt>
      <div className="container narrow">
        <p className="eyebrow">Intro</p>
        <h2 id="about-heading" className="section-title">
          {about.heading}
        </h2>
        <div className="about-body">
          {about.body.split("\n").filter(Boolean).map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
        <ul className="stat-row" aria-label="Highlights">
          <li className="stat-card">
            <span className="stat-value">{about.yearsExperience}+</span>
            <span className="stat-label">Years experience</span>
          </li>
          <li className="stat-card">
            <span className="stat-value">{about.projectsDelivered}</span>
            <span className="stat-label">Projects delivered</span>
          </li>
          <li className="stat-card">
            <span className="stat-value">{about.happyClients}</span>
            <span className="stat-label">Happy clients</span>
          </li>
        </ul>
      </div>
    </ScrollReveal>
  );
}
