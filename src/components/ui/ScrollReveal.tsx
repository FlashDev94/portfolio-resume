"use client";

import { useEffect, useRef, type ReactNode, type ElementType } from "react";

interface Props {
  children: ReactNode;
  className?: string;
  delay?: number;
  tilt?: boolean;
  id?: string;
  as?: "section" | "div" | "article";
  "aria-labelledby"?: string;
}

/** Lightweight reveal via IntersectionObserver + CSS (faster than framer on scroll). */
export function ScrollReveal({
  children,
  className = "",
  delay = 0,
  tilt = true,
  id,
  as = "div",
  "aria-labelledby": labelledBy,
}: Props) {
  const ref = useRef<HTMLElement>(null);
  const Tag = as as ElementType;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      el.classList.add("is-revealed");
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("is-revealed");
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      id={id}
      aria-labelledby={labelledBy}
      className={`scroll-reveal${tilt ? " scroll-reveal--tilt" : ""} ${className}`}
      style={delay ? ({ "--reveal-delay": `${delay}ms` } as React.CSSProperties) : undefined}
    >
      {children}
    </Tag>
  );
}
