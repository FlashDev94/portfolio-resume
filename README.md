# Portfolio Forge

Single-page developer portfolio with live customization, scroll/3D section highlights, SEO impact analysis on save, WCAG 2.2 AA-oriented accessibility, and PDF resume export.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Features

- **Mock content by default** — Alex Rivera persona you can replace via the panel
- **Customize panel** — toggle/reorder sections, edit hero/about/skills/experience/projects/education/contact, upload avatar & project images (stored locally as compressed data URLs)
- **Scroll effects** — sections use 3D tilt reveal; projects use a revolving 3D carousel (respects `prefers-reduced-motion`)
- **PDF resume** — multi-section A4/Letter PDF via **Resume PDF** / panel toolbar
- **SEO analysis** — client-side scorer runs when content is saved (blur / **Save & analyze SEO**); open **Customize → SEO** for score, keyword density, and actionable tips
- **Performance** — Next.js App Router static page, font `display: swap`, lazy project images, transform/opacity-only motion
- **Accessibility** — skip link, landmarks, labelled dialogs, focus-visible rings, 44px targets, keyboard carousel controls, live regions for SEO score, reduced motion support

## WCAG notes (AA focus)

Implemented patterns align with WCAG 2.2 A/AA criteria including: 1.1.1, 1.3.1, 1.4.3, 1.4.11, 2.1.1, 2.4.1, 2.4.2, 2.4.6, 2.4.7, 2.5.8, 3.1.1, 3.3.2, 4.1.2, 4.1.3, and reduced-motion handling for 2.2.2 / 2.3.3-style expectations.

## Data persistence

Portfolio state is saved in `localStorage` under `portfolio-forge-v1`. Use **Reset** in the panel to restore mocks.

## Scripts

| Command        | Description              |
|----------------|--------------------------|
| `npm run dev`  | Development server       |
| `npm run build`| Production build         |
| `npm start`    | Serve production build   |

## SEO MCP note

No standalone SEO MCP was connected in this environment, so analysis is implemented as a first-party module (`src/lib/seo-analyzer.ts`) wired into the save path in the customizer. It estimates title/meta health, keyword coverage, content depth, and trust signals so you can see impact while editing.
actual requested README change
