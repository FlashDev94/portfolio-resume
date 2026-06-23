export type SectionId =
  | "hero"
  | "about"
  | "skills"
  | "experience"
  | "projects"
  | "education"
  | "contact";

export interface SocialLink {
  id: string;
  label: string;
  url: string;
}

export interface SkillItem {
  id: string;
  name: string;
  level: number; // 0-100
  category: string;
}

export interface ExperienceItem {
  id: string;
  company: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  highlights: string[];
}

export interface ProjectItem {
  id: string;
  title: string;
  description: string;
  tech: string[];
  imageUrl: string;
  liveUrl: string;
  repoUrl: string;
  featured: boolean;
}

export interface EducationItem {
  id: string;
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface SectionConfig {
  id: SectionId;
  label: string;
  enabled: boolean;
  order: number;
}

export interface HeroContent {
  name: string;
  title: string;
  tagline: string;
  location: string;
  avatarUrl: string;
  ctaPrimary: string;
  ctaSecondary: string;
}

export interface AboutContent {
  heading: string;
  body: string;
  yearsExperience: number;
  projectsDelivered: number;
  happyClients: number;
}

export interface ContactContent {
  heading: string;
  subheading: string;
  email: string;
  phone: string;
  availability: string;
}

export interface SeoMeta {
  pageTitle: string;
  metaDescription: string;
  keywords: string;
  ogImage: string;
  canonicalUrl: string;
  author: string;
}

export type ThemeMode = "dark" | "light";

/** Classy built-in palettes + fully custom element colors */
export type ThemeId =
  | "midnight"
  | "ivory"
  | "slate"
  | "burgundy"
  | "forest"
  | "champagne"
  | "ocean"
  | "custom";

export interface ThemeColors {
  background: string;
  backgroundAlt: string;
  surface: string;
  surfaceElevated: string;
  foreground: string;
  muted: string;
  accent: string;
  accentForeground: string;
  border: string;
  ring: string;
}

export interface ThemePreset {
  id: Exclude<ThemeId, "custom">;
  label: string;
  description: string;
  mode: ThemeMode;
  colors: ThemeColors;
}

export interface PortfolioData {
  hero: HeroContent;
  about: AboutContent;
  skills: SkillItem[];
  experience: ExperienceItem[];
  projects: ProjectItem[];
  education: EducationItem[];
  contact: ContactContent;
  socials: SocialLink[];
  sections: SectionConfig[];
  seo: SeoMeta;
  /** @deprecated prefer themeId — kept for migration of older localStorage */
  theme?: ThemeMode;
  /** @deprecated prefer customColors.accent */
  accentColor?: string;
  /** Active palette preset or "custom" */
  themeId: ThemeId;
  /** User-tuned colors when themeId === "custom" (also stores last custom edits) */
  customColors: ThemeColors;
}

export interface SeoIssue {
  id: string;
  severity: "critical" | "warning" | "info" | "good";
  category: string;
  title: string;
  detail: string;
  suggestion: string;
}

export interface SeoAnalysis {
  score: number;
  issues: SeoIssue[];
  wordCount: number;
  keywordDensity: Record<string, number>;
  analyzedAt: string;
}
