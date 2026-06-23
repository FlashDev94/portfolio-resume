"use client";

import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { usePortfolioStore } from "@/lib/store";
import { GraduationCap } from "lucide-react";

export function EducationSection() {
  const education = usePortfolioStore((s) => s.data.education);

  return (
    <ScrollReveal as="section" id="education" className="section" aria-labelledby="edu-heading">
      <div className="container narrow">
        <p className="eyebrow">Background</p>
        <h2 id="edu-heading" className="section-title">
          Education
        </h2>
        <ul className="edu-list">
          {education.map((ed) => (
            <li key={ed.id} className="edu-card">
              <div className="edu-icon" aria-hidden="true">
                <GraduationCap size={22} />
              </div>
              <div>
                <h3 className="edu-degree">
                  {ed.degree} {ed.field}
                </h3>
                <p className="edu-school">{ed.school}</p>
                <p className="edu-dates">
                  {ed.startDate} – {ed.endDate}
                </p>
                {ed.description && <p className="edu-desc">{ed.description}</p>}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </ScrollReveal>
  );
}
