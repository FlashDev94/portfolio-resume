"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_PORTFOLIO } from "./mock-data";
import { analyzeSeo } from "./seo-analyzer";
import type {
  PortfolioData,
  SectionId,
  SeoAnalysis,
  SkillItem,
  ExperienceItem,
  ProjectItem,
  EducationItem,
  SocialLink,
} from "./types";

interface PortfolioStore {
  data: PortfolioData;
  seoAnalysis: SeoAnalysis | null;
  panelOpen: boolean;
  activeTab: string;
  hydrated: boolean;
  setHydrated: (v: boolean) => void;
  setPanelOpen: (open: boolean) => void;
  setActiveTab: (tab: string) => void;
  replaceData: (data: PortfolioData) => void;
  patchHero: (patch: Partial<PortfolioData["hero"]>) => void;
  patchAbout: (patch: Partial<PortfolioData["about"]>) => void;
  patchContact: (patch: Partial<PortfolioData["contact"]>) => void;
  patchSeo: (patch: Partial<PortfolioData["seo"]>) => void;
  setTheme: (theme: PortfolioData["theme"]) => void;
  setAccent: (color: string) => void;
  toggleSection: (id: SectionId) => void;
  reorderSection: (id: SectionId, direction: "up" | "down") => void;
  setSkills: (skills: SkillItem[]) => void;
  setExperience: (items: ExperienceItem[]) => void;
  setProjects: (items: ProjectItem[]) => void;
  setEducation: (items: EducationItem[]) => void;
  setSocials: (items: SocialLink[]) => void;
  setAvatar: (dataUrl: string) => void;
  setProjectImage: (projectId: string, dataUrl: string) => void;
  resetToDefaults: () => void;
  runSeoAnalysis: () => void;
  saveAndAnalyze: () => void;
}

let seoTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleSeo(get: () => PortfolioStore, set: (p: Partial<PortfolioStore>) => void) {
  if (seoTimer) clearTimeout(seoTimer);
  seoTimer = setTimeout(() => {
    set({ seoAnalysis: analyzeSeo(get().data) });
  }, 280);
}

function patchData(
  set: (fn: (s: PortfolioStore) => Partial<PortfolioStore>) => void,
  get: () => PortfolioStore,
  mutator: (data: PortfolioData) => PortfolioData
) {
  set((s) => {
    const data = mutator(s.data);
    scheduleSeo(get, (p) => set(() => p));
    return { data };
  });
}

export const usePortfolioStore = create<PortfolioStore>()(
  persist(
    (set, get) => ({
      data: DEFAULT_PORTFOLIO,
      seoAnalysis: null,
      panelOpen: false,
      activeTab: "sections",
      hydrated: false,
      setHydrated: (v) => set({ hydrated: v }),
      setPanelOpen: (open) => set({ panelOpen: open }),
      setActiveTab: (tab) => set({ activeTab: tab }),
      replaceData: (data) => {
        set({ data });
        scheduleSeo(get, (p) => set(p));
      },
      patchHero: (patch) =>
        patchData(set, get, (d) => ({ ...d, hero: { ...d.hero, ...patch } })),
      patchAbout: (patch) =>
        patchData(set, get, (d) => ({ ...d, about: { ...d.about, ...patch } })),
      patchContact: (patch) =>
        patchData(set, get, (d) => ({ ...d, contact: { ...d.contact, ...patch } })),
      patchSeo: (patch) =>
        patchData(set, get, (d) => ({ ...d, seo: { ...d.seo, ...patch } })),
      setTheme: (theme) => patchData(set, get, (d) => ({ ...d, theme })),
      setAccent: (accentColor) => patchData(set, get, (d) => ({ ...d, accentColor })),
      toggleSection: (id) =>
        patchData(set, get, (d) => ({
          ...d,
          sections: d.sections.map((sec) =>
            sec.id === id ? { ...sec, enabled: !sec.enabled } : sec
          ),
        })),
      reorderSection: (id, direction) =>
        set((s) => {
          const sections = [...s.data.sections].sort((a, b) => a.order - b.order);
          const idx = sections.findIndex((x) => x.id === id);
          if (idx < 0) return s;
          const swap = direction === "up" ? idx - 1 : idx + 1;
          if (swap < 0 || swap >= sections.length) return s;
          const tmp = sections[idx].order;
          sections[idx] = { ...sections[idx], order: sections[swap].order };
          sections[swap] = { ...sections[swap], order: tmp };
          const data = { ...s.data, sections };
          scheduleSeo(get, (p) => set(p));
          return { data };
        }),
      setSkills: (skills) => patchData(set, get, (d) => ({ ...d, skills })),
      setExperience: (experience) => patchData(set, get, (d) => ({ ...d, experience })),
      setProjects: (projects) => patchData(set, get, (d) => ({ ...d, projects })),
      setEducation: (education) => patchData(set, get, (d) => ({ ...d, education })),
      setSocials: (socials) => patchData(set, get, (d) => ({ ...d, socials })),
      setAvatar: (dataUrl) =>
        patchData(set, get, (d) => ({ ...d, hero: { ...d.hero, avatarUrl: dataUrl } })),
      setProjectImage: (projectId, dataUrl) =>
        patchData(set, get, (d) => ({
          ...d,
          projects: d.projects.map((p) =>
            p.id === projectId ? { ...p, imageUrl: dataUrl } : p
          ),
        })),
      resetToDefaults: () => {
        const data = structuredClone(DEFAULT_PORTFOLIO);
        set({ data, seoAnalysis: analyzeSeo(data) });
      },
      runSeoAnalysis: () => set({ seoAnalysis: analyzeSeo(get().data) }),
      saveAndAnalyze: () => set({ seoAnalysis: analyzeSeo(get().data) }),
    }),
    {
      name: "portfolio-forge-v1",
      partialize: (s) => ({ data: s.data }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
        state?.runSeoAnalysis();
      },
    }
  )
);
