"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { usePortfolioStore } from "@/lib/store";
import { ChevronLeft, ChevronRight, ExternalLink, Code2, Layers } from "lucide-react";

function wrapMod(value: number, period: number) {
  return ((value % period) + period) % period;
}

function shortestDelta(from: number, to: number, period: number) {
  let d = ((to - from) % period + period) % period;
  if (d > period / 2) d -= period;
  return d;
}

function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * High-performance 3D carousel.
 * Settles with non-overshooting ease (no spring wobble).
 */
export function ProjectsCarousel() {
  const projects = usePortfolioStore((s) => s.data.projects);
  const n = projects.length || 1;

  const stageRef = useRef<HTMLDivElement>(null);
  const cardElsRef = useRef<(HTMLElement | null)[]>([]);
  const dotElsRef = useRef<(HTMLButtonElement | null)[]>([]);

  const rotationRef = useRef(0);
  const velocityRef = useRef(0);
  const draggingRef = useRef(false);
  const pointerIdRef = useRef<number | null>(null);
  const lastXRef = useRef(0);
  const samplesRef = useRef<{ x: number; t: number }[]>([]);
  const rafRef = useRef(0);
  const needsPaintRef = useRef(true);
  const activeIdxRef = useRef(0);
  const reduceRef = useRef(false);
  /** Locked settle target while easing; null = free spin / drag */
  const settleTargetRef = useRef<number | null>(null);
  const settledRef = useRef(true);

  const [activeIndex, setActiveIndex] = useState(0);

  const setActiveUi = useCallback((idx: number) => {
    if (idx === activeIdxRef.current) return;
    activeIdxRef.current = idx;
    queueMicrotask(() => setActiveIndex(idx));
    for (let d = 0; d < dotElsRef.current.length; d++) {
      const dot = dotElsRef.current[d];
      if (!dot) continue;
      const on = d === idx;
      dot.classList.toggle("active", on);
      dot.setAttribute("aria-selected", on ? "true" : "false");
    }
  }, []);

  const paintCards = useCallback((r: number, locked = false) => {
    const count = cardElsRef.current.length || n;
    const reduce = reduceRef.current;
    // Integer lock kills float jitter / matrix wobble on the resting frame
    const rot = locked ? Math.round(r) : r;

    for (let i = 0; i < count; i++) {
      const el = cardElsRef.current[i];
      if (!el) continue;

      let offset = i - rot;
      offset = ((offset % count) + count) % count;
      if (offset > count / 2) offset -= count;

      const abs = Math.abs(offset);
      const isActive = locked ? Math.round(offset) === 0 : abs < 0.5;

      let transform: string;
      let opacity: number;
      let zIndex: number;

      if (locked || reduce) {
        const slot = Math.round(offset);
        if (reduce) {
          transform = `translate(-50%,-50%) translate3d(${slot * 100}%,0,0) scale(${slot === 0 ? 1 : 0.92})`;
          opacity = Math.abs(slot) > 1 ? 0 : 1 - Math.abs(slot) * 0.22;
          zIndex = 20 - Math.abs(slot);
        } else {
          const x = slot * 46;
          const z = -Math.min(Math.abs(slot), 2) * 96;
          const ry = slot * -22;
          const scale = 1 - Math.min(Math.abs(slot), 2) * 0.1;
          transform = `translate(-50%,-50%) translate3d(${x}%,0,${z}px) rotateY(${ry}deg) scale(${scale})`;
          opacity = Math.abs(slot) > 2 ? 0 : Math.max(0, 1 - Math.abs(slot) * 0.24);
          zIndex = 30 - Math.abs(slot) * 10;
        }
      } else {
        const x = offset * 46;
        const z = -Math.min(abs, 2.2) * 96;
        const ry = offset * -22;
        const scale = 1 - Math.min(abs, 2) * 0.1;
        transform = `translate(-50%,-50%) translate3d(${x}%,0,${z}px) rotateY(${ry}deg) scale(${scale})`;
        opacity = abs > 2.25 ? 0 : Math.max(0, 1 - abs * 0.24);
        zIndex = Math.round(30 - abs * 10);
      }

      el.style.transform = transform;
      el.style.opacity = String(opacity);
      el.style.zIndex = String(zIndex);
      el.style.pointerEvents = isActive ? "auto" : "none";
      el.setAttribute("aria-hidden", isActive ? "false" : "true");
      el.tabIndex = isActive ? 0 : -1;
      el.classList.toggle("is-active", isActive);
    }

    setActiveUi(wrapMod(Math.round(rot), count || 1));
  }, [n, setActiveUi]);

  const lockTo = useCallback((target: number) => {
    const t = Math.round(target);
    rotationRef.current = t;
    velocityRef.current = 0;
    settleTargetRef.current = null;
    settledRef.current = true;
    paintCards(t, true);
  }, [paintCards]);

  /** Pick nearest card; bias by last velocity so we don't flip back mid-stop. */
  const chooseSettleTarget = useCallback((r: number, v: number) => {
    const base = Math.round(r);
    // If clearly past midpoint in direction of travel, commit that way
    const frac = r - Math.floor(r + 1e-9);
    if (Math.abs(v) > 0.08) {
      if (v > 0 && frac > 0.15) return Math.ceil(r - 1e-9);
      if (v < 0 && frac < 0.85 && frac > 0) return Math.floor(r + 1e-9);
    }
    return base;
  }, []);

  const beginSettle = useCallback((r: number, v: number) => {
    if (settleTargetRef.current != null) return;
    settleTargetRef.current = chooseSettleTarget(r, v);
    settledRef.current = false;
    velocityRef.current = 0; // cancel residual spin so ease is only toward target
  }, [chooseSettleTarget]);

  const requestPaint = useCallback(() => {
    needsPaintRef.current = true;
  }, []);

  // RAF: momentum → smooth non-overshooting ease → hard lock
  useEffect(() => {
    reduceRef.current = prefersReducedMotion();
    let alive = true;
    let last = performance.now();

    const FRICTION = 0.9;
    const SETTLE_START_VEL = 0.045; // begin ease-to-slot once slow enough
    // Exponential ease: distance *= (1 - SETTLE_K)^dt  — never overshoots
    const SETTLE_K = 0.28;
    const LOCK_EPS = 0.004;

    const tick = (now: number) => {
      if (!alive) return;
      const dt = Math.min(24, now - last) / 16.6667;
      last = now;

      if (!draggingRef.current) {
        let r = rotationRef.current;
        let v = velocityRef.current;
        let changed = false;

        if (reduceRef.current) {
          if (Math.abs(v) > 0.01) {
            lockTo(Math.round(r + Math.sign(v)));
          }
        } else if (settleTargetRef.current != null) {
          // Phase 2: ease toward locked integer — no spring, no pass-through
          const target = settleTargetRef.current;
          const err = target - r;
          if (Math.abs(err) <= LOCK_EPS) {
            lockTo(target);
          } else {
            // Approach asymptotically from one side only
            const step = err * (1 - Math.pow(1 - SETTLE_K, dt));
            // Clamp so we never cross target (kills wobble)
            const next = Math.abs(step) >= Math.abs(err) ? target : r + step;
            rotationRef.current = next;
            velocityRef.current = 0;
            paintCards(next, false);
            changed = true;
          }
        } else if (!settledRef.current || Math.abs(v) > 0.0001) {
          // Phase 1: free momentum with friction
          v *= Math.pow(FRICTION, dt);
          if (Math.abs(v) < 1e-5) v = 0;

          if (Math.abs(v) < SETTLE_START_VEL) {
            beginSettle(r, velocityRef.current);
            // apply one settle frame immediately
            const target = settleTargetRef.current;
            if (target != null) {
              const err = target - r;
              if (Math.abs(err) <= LOCK_EPS) {
                lockTo(target);
              } else {
                const step = err * (1 - Math.pow(1 - SETTLE_K, dt));
                const next = Math.abs(step) >= Math.abs(err) ? target : r + step;
                rotationRef.current = next;
                velocityRef.current = 0;
                paintCards(next, false);
              }
            }
          } else {
            r += v * dt;
            if (r > 1e5 || r < -1e5) r = wrapMod(r, n);
            rotationRef.current = r;
            velocityRef.current = v;
            paintCards(r, false);
            changed = true;
            settledRef.current = false;
          }
        } else if (needsPaintRef.current) {
          paintCards(rotationRef.current, settledRef.current);
          needsPaintRef.current = false;
        }

        void changed;
      } else if (needsPaintRef.current) {
        paintCards(rotationRef.current, false);
        needsPaintRef.current = false;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    paintCards(rotationRef.current, true);
    rafRef.current = requestAnimationFrame(tick);

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMq = () => {
      reduceRef.current = mq.matches;
      requestPaint();
    };
    mq.addEventListener("change", onMq);

    return () => {
      alive = false;
      cancelAnimationFrame(rafRef.current);
      mq.removeEventListener("change", onMq);
    };
  }, [n, paintCards, requestPaint, lockTo, beginSettle]);

  useEffect(() => {
    cardElsRef.current = cardElsRef.current.slice(0, projects.length);
    lockTo(Math.round(rotationRef.current));
  }, [projects, lockTo]);

  // Trackpad / mouse wheel
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    let lastWheelT = 0;
    let wheelIdleTimer: ReturnType<typeof setTimeout> | null = null;

    const onWheel = (e: WheelEvent) => {
      const absX = Math.abs(e.deltaX);
      const absY = Math.abs(e.deltaY);
      const useX = absX > absY || e.shiftKey;

      if (!useX && !e.shiftKey && absY >= absX && absX < 2) return;
      if (useX || e.shiftKey || absX > absY * 0.6) e.preventDefault();
      else return;

      // Break out of settled/settle lock for live gesture
      settleTargetRef.current = null;
      settledRef.current = false;

      const now = performance.now();
      const dt = Math.max(1, now - lastWheelT);
      lastWheelT = now;

      const stageW = stage.clientWidth || 400;
      const pxPerItem = Math.max(90, stageW * 0.32);
      const mode = e.deltaMode;
      const scale = mode === 1 ? 16 : mode === 2 ? stageW : 1;
      const effective = (useX ? e.deltaX : e.deltaY) * scale;
      const deltaItems = effective / pxPerItem;

      rotationRef.current += deltaItems;
      const instV = (deltaItems / dt) * 16.6667;
      velocityRef.current = instV * 0.5;
      paintCards(rotationRef.current, false);

      // After trackpad gesture ends, start a clean settle (no extra boost layer)
      if (wheelIdleTimer) clearTimeout(wheelIdleTimer);
      wheelIdleTimer = setTimeout(() => {
        beginSettle(rotationRef.current, velocityRef.current);
      }, 90);
    };

    stage.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      stage.removeEventListener("wheel", onWheel);
      if (wheelIdleTimer) clearTimeout(wheelIdleTimer);
    };
  }, [paintCards, beginSettle, projects.length]);

  const impulse = useCallback((dir: 1 | -1) => {
    settleTargetRef.current = null;
    settledRef.current = false;
    if (reduceRef.current) {
      lockTo(Math.round(rotationRef.current) + dir);
      return;
    }
    // Animate one slot via settle target (stable, no spring)
    const start = rotationRef.current;
    const goal = Math.round(start) + dir;
    rotationRef.current = start + dir * 0.04;
    velocityRef.current = 0;
    settleTargetRef.current = goal;
    paintCards(rotationRef.current, false);
  }, [paintCards, lockTo]);

  const prev = useCallback(() => impulse(-1), [impulse]);
  const next = useCallback(() => impulse(1), [impulse]);

  const goToIndex = useCallback(
    (target: number) => {
      const current = rotationRef.current;
      const nearest = Math.round(current);
      const goal = nearest + shortestDelta(nearest, target, n);
      settleTargetRef.current = null;
      settledRef.current = false;
      if (reduceRef.current || Math.abs(goal - current) < 0.01) {
        lockTo(goal);
        return;
      }
      velocityRef.current = 0;
      settleTargetRef.current = goal;
      paintCards(current, false);
    },
    [n, paintCards, lockTo]
  );

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    const t = e.target as HTMLElement;
    if (t.closest("a, button")) return;

    draggingRef.current = true;
    settleTargetRef.current = null;
    settledRef.current = false;
    velocityRef.current = 0;
    pointerIdRef.current = e.pointerId;
    lastXRef.current = e.clientX;
    samplesRef.current = [{ x: e.clientX, t: performance.now() }];
    stageRef.current?.classList.add("is-dragging");

    try {
      stageRef.current?.setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current || pointerIdRef.current !== e.pointerId) return;

    const now = performance.now();
    const dx = e.clientX - lastXRef.current;
    const stageW = stageRef.current?.clientWidth || 400;
    const pxPerItem = Math.max(100, stageW * 0.38);
    const deltaItems = -dx / pxPerItem;

    rotationRef.current += deltaItems;
    paintCards(rotationRef.current, false);

    lastXRef.current = e.clientX;
    samplesRef.current.push({ x: e.clientX, t: now });
    if (samplesRef.current.length > 8) samplesRef.current.shift();
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current || pointerIdRef.current !== e.pointerId) return;
    draggingRef.current = false;
    pointerIdRef.current = null;
    stageRef.current?.classList.remove("is-dragging");

    try {
      stageRef.current?.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }

    if (reduceRef.current) {
      lockTo(Math.round(rotationRef.current));
      return;
    }

    const samples = samplesRef.current;
    let v = 0;
    if (samples.length >= 2) {
      const first = samples[0];
      const lastS = samples[samples.length - 1];
      const dtMs = Math.max(1, lastS.t - first.t);
      const stageW = stageRef.current?.clientWidth || 400;
      const pxPerItem = Math.max(100, stageW * 0.38);
      const itemsMoved = -(lastS.x - first.x) / pxPerItem;
      v = (itemsMoved / dtMs) * 16.6667 * 1.2;
    }

    const MAX_V = 1.4;
    v = Math.max(-MAX_V, Math.min(MAX_V, v));

    if (Math.abs(v) < 0.05) {
      // Soft release — go straight into settle, no extra spin/wobble
      beginSettle(rotationRef.current, v);
    } else {
      velocityRef.current = v;
      settledRef.current = false;
      settleTargetRef.current = null;
    }
    samplesRef.current = [];
  };

  if (!projects.length) {
    return (
      <section id="projects" className="section section-alt" aria-labelledby="projects-heading">
        <div className="container">
          <h2 id="projects-heading">Projects</h2>
          <p>No projects yet — add some in the customize panel.</p>
        </div>
      </section>
    );
  }

  return (
    <ScrollReveal
      as="section"
      id="projects"
      className="section section-alt projects-section"
      aria-labelledby="projects-heading"
      tilt={false}
    >
      <div className="container projects-container">
        <p className="eyebrow">Selected work</p>
        <div className="projects-head">
          <h2 id="projects-heading" className="section-title">
            Projects
          </h2>
          <div className="carousel-controls" role="group" aria-label="Project carousel controls">
            <button type="button" className="btn btn-icon" onClick={prev} aria-label="Previous project">
              <ChevronLeft size={20} aria-hidden="true" />
            </button>
            <button type="button" className="btn btn-icon" onClick={next} aria-label="Next project">
              <ChevronRight size={20} aria-hidden="true" />
            </button>
          </div>
        </div>

        <div
          ref={stageRef}
          className="carousel-stage"
          style={{ perspective: "1400px" }}
          aria-roledescription="carousel"
          aria-label="Featured projects — swipe, drag, or use trackpad to rotate"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          <div className="carousel-track">
            {projects.map((project, i) => (
              <article
                key={project.id}
                ref={(el) => {
                  cardElsRef.current[i] = el;
                }}
                className="carousel-card"
                aria-hidden="true"
                tabIndex={-1}
              >
                <div className="carousel-media">
                  {project.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={project.imageUrl}
                      alt=""
                      width={640}
                      height={360}
                      loading="lazy"
                      decoding="async"
                      draggable={false}
                    />
                  ) : (
                    <div className="carousel-media-fallback" aria-hidden="true">
                      <Layers size={48} strokeWidth={1.2} />
                    </div>
                  )}
                  {project.featured && <span className="badge">Featured</span>}
                </div>
                <div className="carousel-body">
                  <h3 className="carousel-title">{project.title}</h3>
                  <p className="carousel-desc">{project.description}</p>
                  <ul className="tech-pills" aria-label="Technologies">
                    {project.tech.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                  <div className="carousel-links">
                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        className="btn btn-ghost btn-sm"
                        target="_blank"
                        rel="noopener noreferrer"
                        draggable={false}
                      >
                        <ExternalLink size={16} aria-hidden="true" />
                        Live demo
                        <span className="sr-only"> (opens in new tab)</span>
                      </a>
                    )}
                    {project.repoUrl && (
                      <a
                        href={project.repoUrl}
                        className="btn btn-ghost btn-sm"
                        target="_blank"
                        rel="noopener noreferrer"
                        draggable={false}
                      >
                        <Code2 size={16} aria-hidden="true" />
                        Source
                        <span className="sr-only"> (opens in new tab)</span>
                      </a>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>

          <p className="carousel-hint" aria-hidden="true">
            Drag or swipe to spin
          </p>
        </div>

        <div className="carousel-dots" role="tablist" aria-label="Choose project">
          {projects.map((p, i) => (
            <button
              key={p.id}
              ref={(el) => {
                dotElsRef.current[i] = el;
              }}
              type="button"
              role="tab"
              aria-selected={i === activeIndex}
              aria-label={`Show project ${p.title}`}
              className={i === activeIndex ? "dot active" : "dot"}
              onClick={() => goToIndex(i)}
            />
          ))}
        </div>
      </div>
    </ScrollReveal>
  );
}
