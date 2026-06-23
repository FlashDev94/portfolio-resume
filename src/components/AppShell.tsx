"use client";

import { PortfolioView } from "@/components/portfolio/PortfolioView";
import { CustomizerPanel } from "@/components/customizer/CustomizerPanel";
import { usePortfolioStore } from "@/lib/store";
import { useEffect } from "react";

export function AppShell() {
  const seo = usePortfolioStore((s) => s.data.seo);
  const hero = usePortfolioStore((s) => s.data.hero);

  useEffect(() => {
    if (seo.pageTitle) document.title = seo.pageTitle;
    const desc = document.querySelector('meta[name="description"]');
    if (desc && seo.metaDescription) desc.setAttribute("content", seo.metaDescription);
    let author = document.querySelector('meta[name="author"]');
    if (!author) {
      author = document.createElement("meta");
      author.setAttribute("name", "author");
      document.head.appendChild(author);
    }
    author.setAttribute("content", seo.author || hero.name);
  }, [seo, hero.name]);

  return (
    <>
      <PortfolioView />
      <CustomizerPanel />
    </>
  );
}
