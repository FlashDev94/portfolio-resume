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
  theme: "dark" | "light";
  accentColor: string;
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
