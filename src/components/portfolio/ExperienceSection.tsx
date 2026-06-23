"use client";

import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { usePortfolioStore } from "@/lib/store";

export function ExperienceSection() {
  const experience = usePortfolioStore((s) => s.data.experience);

  return (
    <ScrollReveal as="section" id="experience" className="section" aria-labelledby="exp-heading">
      <div className="container narrow">
        <p className="eyebrow">Career</p>
        <h2 id="exp-heading" className="section-title">
          Experience
        </h2>
        <ol className="timeline">
          {experience.map((job) => (
            <li key={job.id} className="timeline-item">
              <div className="timeline-marker" aria-hidden="true" />
              <article className="timeline-card">
                <header className="timeline-head">
                  <h3 className="timeline-role">{job.role}</h3>
                  <p className="timeline-meta">
                    <span>{job.company}</span>
                    {job.location && <span> · {job.location}</span>}
                  </p>
                  <p className="timeline-dates">
                    <time dateTime={job.startDate}>{job.startDate}</time>
                    {" – "}
                    {job.current ? (
                      <span>Present</span>
                    ) : (
                      <time dateTime={job.endDate}>{job.endDate}</time>
                    )}
                  </p>
                </header>
                <p className="timeline-desc">{job.description}</p>
                {job.highlights.length > 0 && (
                  <ul className="timeline-highlights">
                    {job.highlights.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                )}
              </article>
            </li>
          ))}
        </ol>
      </div>
    </ScrollReveal>
  );
}
