"use client";

import { useEffect, useState } from "react";

/** Tracks which section id is most visible for nav highlighting. */
export function useScrollHighlight(sectionIds: string[]): string {
  const [active, setActive] = useState(sectionIds[0] || "");

  useEffect(() => {
    if (!sectionIds.length) return;

    const observers: IntersectionObserver[] = [];
    const ratios = new Map<string, number>();

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          ratios.set(id, entry.isIntersecting ? entry.intersectionRatio : 0);
          let best = sectionIds[0];
          let bestR = 0;
          ratios.forEach((r, key) => {
            if (r > bestR) {
              bestR = r;
              best = key;
            }
          });
          if (bestR > 0) setActive(best);
        },
        { threshold: [0, 0.15, 0.35, 0.55, 0.75], rootMargin: "-12% 0px -45% 0px" }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [sectionIds.join("|")]);

  return active;
}
