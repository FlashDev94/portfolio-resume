"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { usePortfolioStore } from "@/lib/store";
import { SeoPanel } from "@/components/seo/SeoPanel";
import { downloadResumePdf } from "@/lib/pdf-resume";
import {
  X,
  ChevronUp,
  ChevronDown,
  Plus,
  Trash2,
  Download,
  RotateCcw,
  Upload,
} from "lucide-react";
import type {
  EducationItem,
  ExperienceItem,
  ProjectItem,
  SkillItem,
  SocialLink,
} from "@/lib/types";

const TABS = [
  { id: "sections", label: "Sections" },
  { id: "hero", label: "Hero" },
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "education", label: "Education" },
  { id: "contact", label: "Contact" },
  { id: "seo", label: "SEO" },
  { id: "theme", label: "Theme" },
] as const;

function newId() {
  return crypto.randomUUID?.() ?? `id-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function readImage(file: File, maxEdge = 960): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxEdge / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(String(reader.result));
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.onerror = () => resolve(String(reader.result));
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

export function CustomizerPanel() {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  const open = usePortfolioStore((s) => s.panelOpen);
  const setPanelOpen = usePortfolioStore((s) => s.setPanelOpen);
  const activeTab = usePortfolioStore((s) => s.activeTab);
  const setActiveTab = usePortfolioStore((s) => s.setActiveTab);
  const data = usePortfolioStore((s) => s.data);
  const saveAndAnalyze = usePortfolioStore((s) => s.saveAndAnalyze);

  const patchHero = usePortfolioStore((s) => s.patchHero);
  const patchAbout = usePortfolioStore((s) => s.patchAbout);
  const patchContact = usePortfolioStore((s) => s.patchContact);
  const toggleSection = usePortfolioStore((s) => s.toggleSection);
  const reorderSection = usePortfolioStore((s) => s.reorderSection);
  const setSkills = usePortfolioStore((s) => s.setSkills);
  const setExperience = usePortfolioStore((s) => s.setExperience);
  const setProjects = usePortfolioStore((s) => s.setProjects);
  const setEducation = usePortfolioStore((s) => s.setEducation);
  const setSocials = usePortfolioStore((s) => s.setSocials);
  const setAvatar = usePortfolioStore((s) => s.setAvatar);
  const setProjectImage = usePortfolioStore((s) => s.setProjectImage);
  const setTheme = usePortfolioStore((s) => s.setTheme);
  const setAccent = usePortfolioStore((s) => s.setAccent);
  const resetToDefaults = usePortfolioStore((s) => s.resetToDefaults);

  useEffect(() => {
    if (!open) return;
    closeBtnRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPanelOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, setPanelOpen]);

  if (!open) return null;

  const sectionsSorted = [...data.sections].sort((a, b) => a.order - b.order);

  return (
    <div className="panel-root" role="presentation">
      <button
        type="button"
        className="panel-backdrop"
        aria-label="Close customize panel"
        onClick={() => setPanelOpen(false)}
      />
      <div
        ref={panelRef}
        className="customizer-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <header className="panel-header">
          <div>
            <h2 id={titleId}>Customize portfolio</h2>
            <p className="muted tiny">Edits save locally · SEO re-analyzes on blur/save</p>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            className="btn btn-icon"
            onClick={() => setPanelOpen(false)}
            aria-label="Close panel"
          >
            <X size={20} />
          </button>
        </header>

        <div className="panel-toolbar">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => {
              saveAndAnalyze();
            }}
          >
            Save & analyze SEO
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => downloadResumePdf(data)}
          >
            <Download size={14} aria-hidden="true" /> PDF
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => {
              if (confirm("Reset all content to mock defaults?")) resetToDefaults();
            }}
          >
            <RotateCcw size={14} aria-hidden="true" /> Reset
          </button>
        </div>

        <div className="panel-tabs" role="tablist" aria-label="Customize categories">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={activeTab === t.id}
              className={activeTab === t.id ? "tab active" : "tab"}
              onClick={() => setActiveTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="panel-body" role="tabpanel">
          {activeTab === "sections" && (
            <ul className="section-toggle-list">
              {sectionsSorted.map((sec) => (
                <li key={sec.id} className="section-toggle-row">
                  <label className="toggle">
                    <input
                      type="checkbox"
                      checked={sec.enabled}
                      onChange={() => toggleSection(sec.id)}
                    />
                    <span>{sec.label}</span>
                  </label>
                  <div className="row-actions">
                    <button
                      type="button"
                      className="btn btn-icon btn-sm"
                      aria-label={`Move ${sec.label} up`}
                      onClick={() => reorderSection(sec.id, "up")}
                    >
                      <ChevronUp size={16} />
                    </button>
                    <button
                      type="button"
                      className="btn btn-icon btn-sm"
                      aria-label={`Move ${sec.label} down`}
                      onClick={() => reorderSection(sec.id, "down")}
                    >
                      <ChevronDown size={16} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {activeTab === "hero" && (
            <div className="form-stack">
              <label className="field">
                <span>Name</span>
                <input
                  value={data.hero.name}
                  onChange={(e) => patchHero({ name: e.target.value })}
                  onBlur={saveAndAnalyze}
                />
              </label>
              <label className="field">
                <span>Title / role</span>
                <input
                  value={data.hero.title}
                  onChange={(e) => patchHero({ title: e.target.value })}
                  onBlur={saveAndAnalyze}
                />
              </label>
              <label className="field">
                <span>Tagline</span>
                <textarea
                  rows={3}
                  value={data.hero.tagline}
                  onChange={(e) => patchHero({ tagline: e.target.value })}
                  onBlur={saveAndAnalyze}
                />
              </label>
              <label className="field">
                <span>Location</span>
                <input
                  value={data.hero.location}
                  onChange={(e) => patchHero({ location: e.target.value })}
                  onBlur={saveAndAnalyze}
                />
              </label>
              <label className="field file-field">
                <span>Profile image</span>
                <span className="file-btn">
                  <Upload size={16} aria-hidden="true" /> Upload image
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      const url = await readImage(f, 640);
                      setAvatar(url);
                      saveAndAnalyze();
                    }}
                  />
                </span>
                {data.hero.avatarUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={data.hero.avatarUrl} alt="" className="thumb" width={64} height={64} />
                )}
              </label>
            </div>
          )}

          {activeTab === "about" && (
            <div className="form-stack">
              <label className="field">
                <span>Heading</span>
                <input
                  value={data.about.heading}
                  onChange={(e) => patchAbout({ heading: e.target.value })}
                  onBlur={saveAndAnalyze}
                />
              </label>
              <label className="field">
                <span>Bio</span>
                <textarea
                  rows={8}
                  value={data.about.body}
                  onChange={(e) => patchAbout({ body: e.target.value })}
                  onBlur={saveAndAnalyze}
                />
              </label>
              <div className="field-row">
                <label className="field">
                  <span>Years</span>
                  <input
                    type="number"
                    min={0}
                    value={data.about.yearsExperience}
                    onChange={(e) =>
                      patchAbout({ yearsExperience: Number(e.target.value) || 0 })
                    }
                    onBlur={saveAndAnalyze}
                  />
                </label>
                <label className="field">
                  <span>Projects</span>
                  <input
                    type="number"
                    min={0}
                    value={data.about.projectsDelivered}
                    onChange={(e) =>
                      patchAbout({ projectsDelivered: Number(e.target.value) || 0 })
                    }
                    onBlur={saveAndAnalyze}
                  />
                </label>
                <label className="field">
                  <span>Clients</span>
                  <input
                    type="number"
                    min={0}
                    value={data.about.happyClients}
                    onChange={(e) =>
                      patchAbout({ happyClients: Number(e.target.value) || 0 })
                    }
                    onBlur={saveAndAnalyze}
                  />
                </label>
              </div>
            </div>
          )}

          {activeTab === "skills" && (
            <ListEditor
              items={data.skills}
              onChange={(skills) => {
                setSkills(skills);
                saveAndAnalyze();
              }}
              blank={(): SkillItem => ({
                id: newId(),
                name: "New skill",
                level: 70,
                category: "General",
              })}
              render={(item, update) => (
                <>
                  <label className="field">
                    <span>Name</span>
                    <input
                      value={item.name}
                      onChange={(e) => update({ name: e.target.value })}
                    />
                  </label>
                  <label className="field">
                    <span>Category</span>
                    <input
                      value={item.category}
                      onChange={(e) => update({ category: e.target.value })}
                    />
                  </label>
                  <label className="field">
                    <span>Level ({item.level}%)</span>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={item.level}
                      onChange={(e) => update({ level: Number(e.target.value) })}
                    />
                  </label>
                </>
              )}
            />
          )}

          {activeTab === "experience" && (
            <ListEditor
              items={data.experience}
              onChange={(items) => {
                setExperience(items);
                saveAndAnalyze();
              }}
              blank={(): ExperienceItem => ({
                id: newId(),
                company: "Company",
                role: "Role",
                location: "",
                startDate: "2024-01",
                endDate: "",
                current: true,
                description: "",
                highlights: [],
              })}
              render={(item, update) => (
                <>
                  <label className="field">
                    <span>Role</span>
                    <input value={item.role} onChange={(e) => update({ role: e.target.value })} />
                  </label>
                  <label className="field">
                    <span>Company</span>
                    <input
                      value={item.company}
                      onChange={(e) => update({ company: e.target.value })}
                    />
                  </label>
                  <label className="field">
                    <span>Location</span>
                    <input
                      value={item.location}
                      onChange={(e) => update({ location: e.target.value })}
                    />
                  </label>
                  <div className="field-row">
                    <label className="field">
                      <span>Start</span>
                      <input
                        value={item.startDate}
                        onChange={(e) => update({ startDate: e.target.value })}
                      />
                    </label>
                    <label className="field">
                      <span>End</span>
                      <input
                        value={item.endDate}
                        disabled={item.current}
                        onChange={(e) => update({ endDate: e.target.value })}
                      />
                    </label>
                  </div>
                  <label className="toggle">
                    <input
                      type="checkbox"
                      checked={item.current}
                      onChange={(e) => update({ current: e.target.checked })}
                    />
                    <span>Current role</span>
                  </label>
                  <label className="field">
                    <span>Description</span>
                    <textarea
                      rows={2}
                      value={item.description}
                      onChange={(e) => update({ description: e.target.value })}
                    />
                  </label>
                  <label className="field">
                    <span>Highlights (one per line)</span>
                    <textarea
                      rows={3}
                      value={item.highlights.join("\n")}
                      onChange={(e) =>
                        update({
                          highlights: e.target.value.split("\n").filter((l) => l.trim()),
                        })
                      }
                    />
                  </label>
                </>
              )}
            />
          )}

          {activeTab === "projects" && (
            <ListEditor
              items={data.projects}
              onChange={(items) => {
                setProjects(items);
                saveAndAnalyze();
              }}
              blank={(): ProjectItem => ({
                id: newId(),
                title: "New project",
                description: "Describe impact and your role.",
                tech: [],
                imageUrl: "",
                liveUrl: "",
                repoUrl: "",
                featured: false,
              })}
              render={(item, update) => (
                <>
                  <label className="field">
                    <span>Title</span>
                    <input
                      value={item.title}
                      onChange={(e) => update({ title: e.target.value })}
                    />
                  </label>
                  <label className="field">
                    <span>Description</span>
                    <textarea
                      rows={3}
                      value={item.description}
                      onChange={(e) => update({ description: e.target.value })}
                    />
                  </label>
                  <label className="field">
                    <span>Tech (comma-separated)</span>
                    <input
                      value={item.tech.join(", ")}
                      onChange={(e) =>
                        update({
                          tech: e.target.value
                            .split(",")
                            .map((t) => t.trim())
                            .filter(Boolean),
                        })
                      }
                    />
                  </label>
                  <label className="field">
                    <span>Live URL</span>
                    <input
                      value={item.liveUrl}
                      onChange={(e) => update({ liveUrl: e.target.value })}
                    />
                  </label>
                  <label className="field">
                    <span>Repo URL</span>
                    <input
                      value={item.repoUrl}
                      onChange={(e) => update({ repoUrl: e.target.value })}
                    />
                  </label>
                  <label className="toggle">
                    <input
                      type="checkbox"
                      checked={item.featured}
                      onChange={(e) => update({ featured: e.target.checked })}
                    />
                    <span>Featured</span>
                  </label>
                  <label className="field file-field">
                    <span>Project image</span>
                    <span className="file-btn">
                      <Upload size={16} aria-hidden="true" /> Upload
                      <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={async (e) => {
                          const f = e.target.files?.[0];
                          if (!f) return;
                          const url = await readImage(f, 960);
                          setProjectImage(item.id, url);
                          saveAndAnalyze();
                        }}
                      />
                    </span>
                  </label>
                </>
              )}
            />
          )}

          {activeTab === "education" && (
            <ListEditor
              items={data.education}
              onChange={(items) => {
                setEducation(items);
                saveAndAnalyze();
              }}
              blank={(): EducationItem => ({
                id: newId(),
                school: "School",
                degree: "Degree",
                field: "Field",
                startDate: "2015",
                endDate: "2019",
                description: "",
              })}
              render={(item, update) => (
                <>
                  <label className="field">
                    <span>School</span>
                    <input
                      value={item.school}
                      onChange={(e) => update({ school: e.target.value })}
                    />
                  </label>
                  <label className="field">
                    <span>Degree</span>
                    <input
                      value={item.degree}
                      onChange={(e) => update({ degree: e.target.value })}
                    />
                  </label>
                  <label className="field">
                    <span>Field</span>
                    <input
                      value={item.field}
                      onChange={(e) => update({ field: e.target.value })}
                    />
                  </label>
                  <div className="field-row">
                    <label className="field">
                      <span>Start</span>
                      <input
                        value={item.startDate}
                        onChange={(e) => update({ startDate: e.target.value })}
                      />
                    </label>
                    <label className="field">
                      <span>End</span>
                      <input
                        value={item.endDate}
                        onChange={(e) => update({ endDate: e.target.value })}
                      />
                    </label>
                  </div>
                  <label className="field">
                    <span>Notes</span>
                    <textarea
                      rows={2}
                      value={item.description}
                      onChange={(e) => update({ description: e.target.value })}
                    />
                  </label>
                </>
              )}
            />
          )}

          {activeTab === "contact" && (
            <div className="form-stack">
              <label className="field">
                <span>Heading</span>
                <input
                  value={data.contact.heading}
                  onChange={(e) => patchContact({ heading: e.target.value })}
                  onBlur={saveAndAnalyze}
                />
              </label>
              <label className="field">
                <span>Subheading</span>
                <textarea
                  rows={2}
                  value={data.contact.subheading}
                  onChange={(e) => patchContact({ subheading: e.target.value })}
                  onBlur={saveAndAnalyze}
                />
              </label>
              <label className="field">
                <span>Email</span>
                <input
                  type="email"
                  value={data.contact.email}
                  onChange={(e) => patchContact({ email: e.target.value })}
                  onBlur={saveAndAnalyze}
                  autoComplete="email"
                />
              </label>
              <label className="field">
                <span>Phone</span>
                <input
                  type="tel"
                  value={data.contact.phone}
                  onChange={(e) => patchContact({ phone: e.target.value })}
                  onBlur={saveAndAnalyze}
                  autoComplete="tel"
                />
              </label>
              <label className="field">
                <span>Availability</span>
                <input
                  value={data.contact.availability}
                  onChange={(e) => patchContact({ availability: e.target.value })}
                  onBlur={saveAndAnalyze}
                />
              </label>
              <h3 className="panel-subtitle">Social links</h3>
              <ListEditor
                items={data.socials}
                onChange={(items) => {
                  setSocials(items);
                  saveAndAnalyze();
                }}
                blank={(): SocialLink => ({
                  id: newId(),
                  label: "Link",
                  url: "https://",
                })}
                render={(item, update) => (
                  <>
                    <label className="field">
                      <span>Label</span>
                      <input
                        value={item.label}
                        onChange={(e) => update({ label: e.target.value })}
                      />
                    </label>
                    <label className="field">
                      <span>URL</span>
                      <input
                        value={item.url}
                        onChange={(e) => update({ url: e.target.value })}
                      />
                    </label>
                  </>
                )}
              />
            </div>
          )}

          {activeTab === "seo" && <SeoPanel />}

          {activeTab === "theme" && (
            <div className="form-stack">
              <fieldset className="form-fieldset">
                <legend>Color mode</legend>
                <label className="toggle">
                  <input
                    type="radio"
                    name="theme"
                    checked={data.theme === "dark"}
                    onChange={() => setTheme("dark")}
                  />
                  <span>Dark</span>
                </label>
                <label className="toggle">
                  <input
                    type="radio"
                    name="theme"
                    checked={data.theme === "light"}
                    onChange={() => setTheme("light")}
                  />
                  <span>Light</span>
                </label>
              </fieldset>
              <label className="field">
                <span>Accent color</span>
                <input
                  type="color"
                  value={data.accentColor}
                  onChange={(e) => setAccent(e.target.value)}
                />
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ListEditor<T extends { id: string }>({
  items,
  onChange,
  blank,
  render,
}: {
  items: T[];
  onChange: (items: T[]) => void;
  blank: () => T;
  render: (item: T, update: (patch: Partial<T>) => void) => ReactNode;
}) {
  return (
    <div className="list-editor">
      {items.map((item, idx) => (
        <div key={item.id} className="list-card">
          <div className="list-card-head">
            <span className="muted tiny">Item {idx + 1}</span>
            <button
              type="button"
              className="btn btn-icon btn-sm"
              aria-label={`Remove item ${idx + 1}`}
              onClick={() => onChange(items.filter((x) => x.id !== item.id))}
            >
              <Trash2 size={14} />
            </button>
          </div>
          {render(item, (patch) =>
            onChange(items.map((x) => (x.id === item.id ? { ...x, ...patch } : x)))
          )}
        </div>
      ))}
      <button
        type="button"
        className="btn btn-secondary btn-sm"
        onClick={() => onChange([...items, blank()])}
      >
        <Plus size={14} aria-hidden="true" /> Add item
      </button>
    </div>
  );
}
