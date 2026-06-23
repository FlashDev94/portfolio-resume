"use client";

import { usePortfolioStore } from "@/lib/store";
import { useScrollHighlight } from "@/hooks/use-scroll-highlight";
import { Download, PanelRightOpen, Menu, X } from "lucide-react";
import { downloadResumePdf } from "@/lib/pdf-resume";
import { useState } from "react";

export function SiteNav() {
  const data = usePortfolioStore((s) => s.data);
  const setPanelOpen = usePortfolioStore((s) => s.setPanelOpen);
  const [menuOpen, setMenuOpen] = useState(false);

  const enabled = [...data.sections]
    .filter((s) => s.enabled)
    .sort((a, b) => a.order - b.order);
  const ids = enabled.map((s) => s.id);
  const active = useScrollHighlight(ids);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setMenuOpen(false);
  };

  return (
    <header className="site-nav" role="banner">
      <div className="site-nav-inner">
        <a href="#hero" className="brand" onClick={(e) => { e.preventDefault(); scrollTo("hero"); }}>
          <span className="brand-mark" aria-hidden="true" />
          <span className="brand-text">{data.hero.name.split(" ")[0] || "Portfolio"}</span>
        </a>

        <nav className="desktop-nav" aria-label="Primary">
          <ul>
            {enabled.map((sec) => (
              <li key={sec.id}>
                <a
                  href={`#${sec.id}`}
                  className={active === sec.id ? "nav-link active" : "nav-link"}
                  aria-current={active === sec.id ? "location" : undefined}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollTo(sec.id);
                  }}
                >
                  {sec.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="nav-actions">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => downloadResumePdf(data)}
            aria-label="Download resume as PDF"
          >
            <Download size={18} aria-hidden="true" />
            <span className="hide-sm">Resume PDF</span>
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setPanelOpen(true)}
            aria-haspopup="dialog"
          >
            <PanelRightOpen size={18} aria-hidden="true" />
            <span className="hide-sm">Customize</span>
          </button>
          <button
            type="button"
            className="btn btn-icon mobile-menu-btn"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav id="mobile-nav" className="mobile-nav" aria-label="Mobile primary">
          <ul>
            {enabled.map((sec) => (
              <li key={sec.id}>
                <a
                  href={`#${sec.id}`}
                  className={active === sec.id ? "nav-link active" : "nav-link"}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollTo(sec.id);
                  }}
                >
                  {sec.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
