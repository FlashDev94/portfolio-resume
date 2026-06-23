"use client";

import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { usePortfolioStore } from "@/lib/store";

export function SkillsSection() {
  const skills = usePortfolioStore((s) => s.data.skills);

  return (
    <ScrollReveal as="section" id="skills" className="section section-alt" aria-labelledby="skills-heading">
      <div className="container">
        <p className="eyebrow">Capabilities</p>
        <h2 id="skills-heading" className="section-title">
          Skills
        </h2>
        <ul className="skills-grid">
          {skills.map((skill) => (
            <li key={skill.id} className="skill-card">
              <div className="skill-head">
                <span className="skill-name">{skill.name}</span>
                <span className="skill-cat">{skill.category}</span>
              </div>
              <div
                className="skill-bar"
                role="meter"
                aria-valuenow={skill.level}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${skill.name} proficiency ${skill.level} percent`}
              >
                <span className="skill-fill" style={{ width: `${skill.level}%` }} />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </ScrollReveal>
  );
}
