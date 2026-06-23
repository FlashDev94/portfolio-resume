import type { PortfolioData, SeoAnalysis, SeoIssue } from "./types";

const STOP = new Set([
  "the","and","for","with","that","this","from","your","you","are","was","were",
  "have","has","had","not","but","all","can","will","our","out","about","into",
  "than","then","them","they","their","been","being","also","over","such","only",
]);

function words(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP.has(w));
}

function density(tokens: string[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const t of tokens) counts[t] = (counts[t] || 0) + 1;
  const total = tokens.length || 1;
  const top = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12);
  const out: Record<string, number> = {};
  for (const [k, v] of top) out[k] = Math.round((v / total) * 1000) / 10;
  return out;
}

function issue(
  id: string,
  severity: SeoIssue["severity"],
  category: string,
  title: string,
  detail: string,
  suggestion: string
): SeoIssue {
  return { id, severity, category, title, detail, suggestion };
}

/** Client-side SEO impact analysis when portfolio content is saved. */
export function analyzeSeo(data: PortfolioData): SeoAnalysis {
  const issues: SeoIssue[] = [];
  const { seo, hero, about, projects, experience, skills, contact } = data;

  const bodyParts = [
    hero.name,
    hero.title,
    hero.tagline,
    about.heading,
    about.body,
    contact.heading,
    contact.subheading,
    ...skills.map((s) => s.name),
    ...experience.flatMap((e) => [e.role, e.company, e.description, ...e.highlights]),
    ...projects.flatMap((p) => [p.title, p.description, ...p.tech]),
  ].join(" ");

  const allText = `${seo.pageTitle} ${seo.metaDescription} ${seo.keywords} ${bodyParts}`;
  const tokens = words(allText);
  const wordCount = tokens.length;
  const keywordDensity = density(tokens);
  const keywordList = seo.keywords
    .split(/[,;]/)
    .map((k) => k.trim().toLowerCase())
    .filter(Boolean);

  // Title
  const titleLen = seo.pageTitle.trim().length;
  if (!titleLen) {
    issues.push(
      issue("title-empty", "critical", "Title", "Missing page title",
        "Search engines and social previews need a title.",
        "Set SEO → Page title to include your name and primary role.")
    );
  } else if (titleLen < 30) {
    issues.push(
      issue("title-short", "warning", "Title", "Title is short",
        `Title is ${titleLen} characters (aim 50–60).`,
        "Add role, specialty, or location to strengthen relevance.")
    );
  } else if (titleLen > 60) {
    issues.push(
      issue("title-long", "warning", "Title", "Title may be truncated",
        `Title is ${titleLen} characters; Google often truncates past ~60.`,
        "Front-load your name and primary keyword; trim secondary phrases.")
    );
  } else {
    issues.push(
      issue("title-ok", "good", "Title", "Title length is healthy",
        `Title is ${titleLen} characters.`,
        "Keep the primary keyword near the start.")
    );
  }

  if (seo.pageTitle && !seo.pageTitle.toLowerCase().includes(hero.name.split(" ")[0]?.toLowerCase() || "")) {
    issues.push(
      issue("title-name", "info", "Title", "Name not found in title",
        "Branded searches often include your name.",
        "Include your full name in the page title for personal brand queries.")
    );
  }

  // Meta description
  const descLen = seo.metaDescription.trim().length;
  if (!descLen) {
    issues.push(
      issue("desc-empty", "critical", "Meta", "Missing meta description",
        "Snippets may be auto-generated poorly without one.",
        "Write a 140–160 character summary with a clear value prop and CTA.")
    );
  } else if (descLen < 120) {
    issues.push(
      issue("desc-short", "warning", "Meta", "Meta description is short",
        `Description is ${descLen} characters (aim 140–160).`,
        "Add what you do, who you help, and a soft call to action.")
    );
  } else if (descLen > 160) {
    issues.push(
      issue("desc-long", "warning", "Meta", "Meta description may truncate",
        `Description is ${descLen} characters.`,
        "Keep the strongest benefit in the first 120 characters.")
    );
  } else {
    issues.push(
      issue("desc-ok", "good", "Meta", "Meta description length looks good",
        `Description is ${descLen} characters.`,
        "Ensure it reads as a compelling search snippet, not keyword stuffing.")
    );
  }

  // Keywords vs content
  if (!keywordList.length) {
    issues.push(
      issue("kw-empty", "warning", "Keywords", "No target keywords set",
        "Without targets it's hard to measure topical focus.",
        "Add 5–12 keywords recruiters might search (role, stack, niche).")
    );
  } else {
    const missing = keywordList.filter((kw) => !allText.toLowerCase().includes(kw));
    if (missing.length) {
      issues.push(
        issue("kw-missing", "warning", "Keywords", "Some keywords missing from content",
          `Not found in on-page text: ${missing.slice(0, 5).join(", ")}${missing.length > 5 ? "…" : ""}`,
          "Naturally weave missing keywords into About, Experience, or Project descriptions.")
      );
    } else {
      issues.push(
        issue("kw-present", "good", "Keywords", "Target keywords appear in content",
          "All listed keywords are present somewhere on the page.",
          "Avoid repeating the same phrase unnaturally — favor semantic variants.")
      );
    }
  }

  // Content depth
  if (wordCount < 150) {
    issues.push(
      issue("content-thin", "critical", "Content", "Thin on-page content",
        `Only ~${wordCount} meaningful words — hard to rank for competitive queries.`,
        "Expand About, add project outcomes, and quantify impact in experience bullets.")
    );
  } else if (wordCount < 400) {
    issues.push(
      issue("content-light", "warning", "Content", "Content could be deeper",
        `About ${wordCount} words of substantive text.`,
        "Aim for 500+ words across sections with concrete achievements and tech keywords.")
    );
  } else {
    issues.push(
      issue("content-depth", "good", "Content", "Solid content depth",
        `Approximately ${wordCount} substantive words detected.`,
        "Keep updating projects and metrics as you ship new work.")
    );
  }

  // Hero / H1 signals
  if (!hero.name.trim() || !hero.title.trim()) {
    issues.push(
      issue("hero-empty", "critical", "Structure", "Hero name or title missing",
        "Primary heading signals are incomplete.",
        "Fill Hero → Name and Title; this maps to your H1 region for crawlers.")
    );
  } else {
    issues.push(
      issue("hero-ok", "good", "Structure", "Hero identity fields populated",
        "Name and title provide a clear H1-equivalent signal.",
        "Keep title aligned with SEO page title for consistency.")
    );
  }

  // Projects alt / media
  const projectsNoDesc = projects.filter((p) => p.description.trim().length < 40);
  if (projectsNoDesc.length) {
    issues.push(
      issue("proj-desc", "warning", "Projects", "Short project descriptions",
        `${projectsNoDesc.length} project(s) have very short descriptions.`,
        "Write 1–2 outcome-focused sentences; include tech keywords and results.")
    );
  }

  const projectsNoImage = projects.filter((p) => !p.imageUrl);
  if (projectsNoImage.length === projects.length && projects.length > 0) {
    issues.push(
      issue("proj-img", "info", "Projects", "No project images yet",
        "Visuals improve engagement and rich-result potential on social shares.",
        "Upload screenshots or use the customizer image fields; set descriptive alt via titles.")
    );
  }

  // Social / links
  const badLinks = data.socials.filter((s) => s.url && !/^https?:\/\//i.test(s.url));
  if (badLinks.length) {
    issues.push(
      issue("links-protocol", "warning", "Links", "Social links missing protocol",
        "Some URLs don't start with http(s)://",
        "Use full URLs so crawlers and users get valid destinations.")
    );
  }

  // Canonical & author
  if (!seo.canonicalUrl.trim()) {
    issues.push(
      issue("canonical", "info", "Technical", "Canonical URL not set",
        "Useful once deployed to avoid duplicate URL issues.",
        "Set your production URL in SEO → Canonical URL.")
    );
  } else if (!/^https?:\/\//i.test(seo.canonicalUrl)) {
    issues.push(
      issue("canonical-bad", "warning", "Technical", "Canonical URL looks invalid",
        "Canonical should be an absolute URL.",
        "Example: https://yourdomain.com")
    );
  }

  if (!seo.author.trim()) {
    issues.push(
      issue("author", "info", "Technical", "Author not set",
        "Author meta supports personal brand signals.",
        "Set SEO → Author to your name.")
    );
  }

  // Contact / E-E-A-T light signal
  if (!contact.email.includes("@")) {
    issues.push(
      issue("contact-email", "warning", "Trust", "Contact email incomplete",
        "Recruiters and crawlers benefit from a clear contact method.",
        "Add a valid email in Contact settings.")
    );
  }

  // About length for expertise
  if (about.body.trim().length < 120) {
    issues.push(
      issue("about-short", "warning", "Content", "About section is brief",
        "About is a prime place for topical authority.",
        "Describe specialization, years of experience, and proof points in 2–3 paragraphs.")
    );
  }

  // Score
  let score = 100;
  for (const i of issues) {
    if (i.severity === "critical") score -= 18;
    else if (i.severity === "warning") score -= 8;
    else if (i.severity === "info") score -= 3;
    else if (i.severity === "good") score += 0;
  }
  score = Math.max(0, Math.min(100, score));

  return {
    score,
    issues: issues.sort((a, b) => {
      const order = { critical: 0, warning: 1, info: 2, good: 3 };
      return order[a.severity] - order[b.severity];
    }),
    wordCount,
    keywordDensity,
    analyzedAt: new Date().toISOString(),
  };
}
