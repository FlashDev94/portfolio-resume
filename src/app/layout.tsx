import type { Metadata, Viewport } from "next";
import { Archivo, Space_Grotesk } from "next/font/google";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Portfolio Forge — Accessible Developer Portfolio",
    template: "%s",
  },
  description:
    "Single-page developer portfolio with live customization, 3D scroll effects, SEO analysis, and PDF resume export. WCAG 2.2 AA oriented.",
  keywords: [
    "portfolio",
    "developer portfolio",
    "resume",
    "WCAG",
    "accessible website",
    "Next.js portfolio",
  ],
  authors: [{ name: "Portfolio Forge" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "Portfolio Forge — Accessible Developer Portfolio",
    description:
      "Customize your portfolio, preview 3D section highlights, analyze SEO impact, and download a clean PDF resume.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="dark"
      className={`${archivo.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
