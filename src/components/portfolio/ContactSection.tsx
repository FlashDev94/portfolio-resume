"use client";

import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { usePortfolioStore } from "@/lib/store";
import { Mail, Phone, Clock } from "lucide-react";

export function ContactSection() {
  const { contact, socials } = usePortfolioStore((s) => s.data);

  return (
    <ScrollReveal as="section" id="contact" className="section section-alt contact-section" aria-labelledby="contact-heading">
      <div className="container narrow">
        <p className="eyebrow">Connect</p>
        <h2 id="contact-heading" className="section-title">
          {contact.heading}
        </h2>
        <p className="section-lead">{contact.subheading}</p>

        <ul className="contact-details">
          <li>
            <Mail size={18} aria-hidden="true" />
            <a href={`mailto:${contact.email}`}>{contact.email}</a>
          </li>
          {contact.phone && (
            <li>
              <Phone size={18} aria-hidden="true" />
              <a href={`tel:${contact.phone.replace(/[^\d+]/g, "")}`}>{contact.phone}</a>
            </li>
          )}
          {contact.availability && (
            <li>
              <Clock size={18} aria-hidden="true" />
              <span>{contact.availability}</span>
            </li>
          )}
        </ul>

        {socials.length > 0 && (
          <nav className="social-nav" aria-label="Social profiles">
            <ul>
              {socials.map((s) => (
                <li key={s.id}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="social-link">
                    {s.label}
                    <span className="sr-only"> (opens in new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </ScrollReveal>
  );
}
