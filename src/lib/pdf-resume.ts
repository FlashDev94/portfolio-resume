import { jsPDF } from "jspdf";
import type { PortfolioData } from "./types";

function wrapText(doc: jsPDF, text: string, x: number, y: number, maxW: number, lineH: number): number {
  const lines = doc.splitTextToSize(text, maxW) as string[];
  for (const line of lines) {
    doc.text(line, x, y);
    y += lineH;
  }
  return y;
}

/** Generate a clean, recruiter-friendly multi-section PDF resume. */
export function downloadResumePdf(data: PortfolioData): void {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const margin = 48;
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const maxW = pageW - margin * 2;
  let y = margin;

  const ensureSpace = (need: number) => {
    if (y + need > pageH - margin) {
      doc.addPage();
      y = margin;
    }
  };

  const sectionTitle = (title: string) => {
    ensureSpace(28);
    y += 8;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(30, 30, 35);
    doc.text(title.toUpperCase(), margin, y);
    y += 4;
    doc.setDrawColor(59, 130, 246);
    doc.setLineWidth(1.5);
    doc.line(margin, y, margin + 48, y);
    y += 14;
  };

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(15, 15, 20);
  doc.text(data.hero.name || "Resume", margin, y);
  y += 18;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(60, 60, 70);
  y = wrapText(doc, data.hero.title, margin, y, maxW, 14);
  y += 4;

  const contactLine = [
    data.contact.email,
    data.contact.phone,
    data.hero.location,
  ]
    .filter(Boolean)
    .join("  ·  ");
  doc.setFontSize(9);
  doc.setTextColor(90, 90, 100);
  y = wrapText(doc, contactLine, margin, y, maxW, 12);

  const socialLine = data.socials
    .filter((s) => s.url)
    .map((s) => `${s.label}: ${s.url}`)
    .join("  |  ");
  if (socialLine) {
    y = wrapText(doc, socialLine, margin, y, maxW, 11);
  }
  y += 6;

  // Summary
  if (data.about.body) {
    sectionTitle("Summary");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(40, 40, 48);
    y = wrapText(doc, data.about.body.replace(/\n+/g, " "), margin, y, maxW, 13);
  }

  // Skills
  if (data.skills.length) {
    sectionTitle("Skills");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(40, 40, 48);
    const byCat = data.skills.reduce<Record<string, string[]>>((acc, s) => {
      (acc[s.category] ||= []).push(s.name);
      return acc;
    }, {});
    for (const [cat, names] of Object.entries(byCat)) {
      ensureSpace(16);
      doc.setFont("helvetica", "bold");
      doc.text(`${cat}: `, margin, y);
      const prefixW = doc.getTextWidth(`${cat}: `);
      doc.setFont("helvetica", "normal");
      y = wrapText(doc, names.join(", "), margin + prefixW, y, maxW - prefixW, 13);
      y += 2;
    }
  }

  // Experience
  if (data.experience.length) {
    sectionTitle("Experience");
    for (const job of data.experience) {
      ensureSpace(48);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(20, 20, 28);
      doc.text(job.role, margin, y);
      const dates = `${job.startDate} – ${job.current ? "Present" : job.endDate}`;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 110);
      const dw = doc.getTextWidth(dates);
      doc.text(dates, pageW - margin - dw, y);
      y += 13;
      doc.setFontSize(10);
      doc.setTextColor(50, 50, 60);
      doc.text(`${job.company}${job.location ? ` · ${job.location}` : ""}`, margin, y);
      y += 12;
      if (job.description) {
        doc.setTextColor(45, 45, 55);
        y = wrapText(doc, job.description, margin, y, maxW, 12);
      }
      for (const h of job.highlights) {
        ensureSpace(14);
        doc.text(`• ${h}`, margin + 8, y);
        y += 12;
      }
      y += 6;
    }
  }

  // Projects
  if (data.projects.length) {
    sectionTitle("Projects");
    for (const p of data.projects) {
      ensureSpace(40);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(20, 20, 28);
      doc.text(p.title, margin, y);
      y += 12;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(45, 45, 55);
      y = wrapText(doc, p.description, margin, y, maxW, 12);
      if (p.tech.length) {
        doc.setFontSize(9);
        doc.setTextColor(80, 80, 90);
        y = wrapText(doc, `Tech: ${p.tech.join(", ")}`, margin, y, maxW, 11);
      }
      y += 6;
    }
  }

  // Education
  if (data.education.length) {
    sectionTitle("Education");
    for (const ed of data.education) {
      ensureSpace(32);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(20, 20, 28);
      doc.text(`${ed.degree} ${ed.field}`.trim(), margin, y);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 110);
      const dates = `${ed.startDate} – ${ed.endDate}`;
      const dw = doc.getTextWidth(dates);
      doc.text(dates, pageW - margin - dw, y);
      y += 12;
      doc.setFontSize(10);
      doc.setTextColor(50, 50, 60);
      doc.text(ed.school, margin, y);
      y += 12;
      if (ed.description) {
        y = wrapText(doc, ed.description, margin, y, maxW, 12);
      }
      y += 4;
    }
  }

  const safeName = (data.hero.name || "resume").replace(/[^\w\-]+/g, "_");
  doc.save(`${safeName}_Resume.pdf`);
}
