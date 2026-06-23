"use client";

import { usePortfolioStore } from "@/lib/store";
import type { SeoIssue } from "@/lib/types";
import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";

const iconFor = (s: SeoIssue["severity"]) => {
  switch (s) {
    case "critical":
      return <XCircle size={16} aria-hidden="true" />;
    case "warning":
      return <AlertTriangle size={16} aria-hidden="true" />;
    case "info":
      return <Info size={16} aria-hidden="true" />;
    default:
      return <CheckCircle2 size={16} aria-hidden="true" />;
  }
};

function scoreLabel(score: number): string {
  if (score >= 85) return "Strong search readiness";
  if (score >= 65) return "Solid — room to grow";
  if (score >= 40) return "Needs content work";
  return "High risk of poor visibility";
}

export function SeoPanel() {
  const analysis = usePortfolioStore((s) => s.seoAnalysis);
  const seo = usePortfolioStore((s) => s.data.seo);
  const patchSeo = usePortfolioStore((s) => s.patchSeo);
  const saveAndAnalyze = usePortfolioStore((s) => s.saveAndAnalyze);

  if (!analysis) {
    return (
      <div className="panel-section">
        <p className="muted">Save content to run SEO analysis.</p>
        <button type="button" className="btn btn-primary" onClick={saveAndAnalyze}>
          Analyze now
        </button>
      </div>
    );
  }

  const scoreClass =
    analysis.score >= 85 ? "score-good" : analysis.score >= 65 ? "score-ok" : "score-low";

  return (
    <div className="seo-panel">
      <div className={`seo-score-card ${scoreClass}`} role="status" aria-live="polite">
        <div className="seo-score-ring" aria-hidden="true">
          <span>{analysis.score}</span>
        </div>
        <div>
          <p className="seo-score-title">SEO impact score</p>
          <p className="seo-score-sub">{scoreLabel(analysis.score)}</p>
          <p className="muted tiny">
            ~{analysis.wordCount} content words · updated{" "}
            {new Date(analysis.analyzedAt).toLocaleTimeString()}
          </p>
        </div>
      </div>

      <p className="seo-intro">
        Analysis runs whenever portfolio content is saved. It estimates how your copy, titles, and
        structure may affect discoverability — not a live Google rank guarantee.
      </p>

      <fieldset className="form-fieldset">
        <legend>SEO fields</legend>
        <label className="field">
          <span>Page title</span>
          <input
            type="text"
            value={seo.pageTitle}
            onChange={(e) => patchSeo({ pageTitle: e.target.value })}
            onBlur={saveAndAnalyze}
            maxLength={80}
            autoComplete="off"
          />
        </label>
        <label className="field">
          <span>Meta description</span>
          <textarea
            value={seo.metaDescription}
            onChange={(e) => patchSeo({ metaDescription: e.target.value })}
            onBlur={saveAndAnalyze}
            rows={3}
            maxLength={200}
          />
        </label>
        <label className="field">
          <span>Target keywords (comma-separated)</span>
          <input
            type="text"
            value={seo.keywords}
            onChange={(e) => patchSeo({ keywords: e.target.value })}
            onBlur={saveAndAnalyze}
          />
        </label>
        <label className="field">
          <span>Canonical URL</span>
          <input
            type="url"
            value={seo.canonicalUrl}
            onChange={(e) => patchSeo({ canonicalUrl: e.target.value })}
            onBlur={saveAndAnalyze}
            placeholder="https://yourdomain.com"
          />
        </label>
        <label className="field">
          <span>Author</span>
          <input
            type="text"
            value={seo.author}
            onChange={(e) => patchSeo({ author: e.target.value })}
            onBlur={saveAndAnalyze}
          />
        </label>
      </fieldset>

      {Object.keys(analysis.keywordDensity).length > 0 && (
        <div className="kw-density">
          <h3 className="panel-subtitle">Top term density (%)</h3>
          <ul className="kw-chips">
            {Object.entries(analysis.keywordDensity).map(([k, v]) => (
              <li key={k}>
                <span>{k}</span>
                <strong>{v}%</strong>
              </li>
            ))}
          </ul>
        </div>
      )}

      <h3 className="panel-subtitle">Findings</h3>
      <ul className="seo-issues">
        {analysis.issues.map((issue) => (
          <li key={issue.id} className={`seo-issue sev-${issue.severity}`}>
            <div className="seo-issue-icon">{iconFor(issue.severity)}</div>
            <div>
              <p className="seo-issue-title">
                <span className="seo-cat">{issue.category}</span> {issue.title}
              </p>
              <p className="seo-issue-detail">{issue.detail}</p>
              <p className="seo-issue-tip">
                <strong>Tip:</strong> {issue.suggestion}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
