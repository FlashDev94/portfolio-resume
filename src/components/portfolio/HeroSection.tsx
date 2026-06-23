"use client";

import { usePortfolioStore } from "@/lib/store";
import { downloadResumePdf } from "@/lib/pdf-resume";
import { MapPin, User } from "lucide-react";

export function HeroSection() {
  const data = usePortfolioStore((s) => s.data);
  const { hero } = data;

  const scrollProjects = () => {
    document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="hero" className="section hero-section" aria-labelledby="hero-heading">
      <div className="hero-bg" aria-hidden="true">
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div className="hero-grid" />
      </div>

      <div className="container hero-grid-layout">
        <div className="hero-copy hero-enter">
          <p className="eyebrow">Portfolio</p>
          <h1 id="hero-heading" className="hero-name">
            {hero.name}
          </h1>
          <p className="hero-title">{hero.title}</p>
          <p className="hero-tagline">{hero.tagline}</p>
          {hero.location && (
            <p className="hero-location">
              <MapPin size={16} aria-hidden="true" />
              <span>{hero.location}</span>
            </p>
          )}
          <div className="hero-ctas">
            <button type="button" className="btn btn-primary btn-lg" onClick={scrollProjects}>
              {hero.ctaPrimary}
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-lg"
              onClick={() => downloadResumePdf(data)}
            >
              {hero.ctaSecondary}
            </button>
          </div>
        </div>

        <div className="hero-visual hero-enter hero-enter-delay">
          <div className="avatar-card" aria-hidden={!hero.avatarUrl}>
            {hero.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={hero.avatarUrl}
                alt={`Portrait of ${hero.name}`}
                width={320}
                height={320}
                className="avatar-img"
                decoding="async"
                fetchPriority="high"
              />
            ) : (
              <div className="avatar-placeholder" role="img" aria-label={`${hero.name} avatar placeholder`}>
                <User size={72} strokeWidth={1.25} aria-hidden="true" />
              </div>
            )}
            <div className="avatar-ring" aria-hidden="true" />
          </div>
        </div>
      </div>
    </section>
  );
}
