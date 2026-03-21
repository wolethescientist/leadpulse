export type Niche = "designer" | "developer" | "copywriter" | "seo" | "video";

export const NICHE_PACKS: Record<Niche, string[]> = {
  designer: [
    "need a designer",
    "logo design",
    "UI design",
    "Figma",
    "branding",
    "landing page design",
  ],
  developer: [
    "need a developer",
    "build an app",
    "website development",
    "API integration",
    "need a dev",
  ],
  copywriter: [
    "need a copywriter",
    "sales page copy",
    "email sequence",
    "content writer",
    "copy needed",
  ],
  seo: [
    "SEO help",
    "rank on Google",
    "SEO audit",
    "backlinks",
    "organic traffic",
    "keyword research",
  ],
  video: [
    "video editor",
    "YouTube editor",
    "short form video",
    "reels editor",
    "video production",
  ],
};

export const NICHE_LABELS: Record<Niche, { label: string; emoji: string; description: string }> = {
  designer: { label: "Designer", emoji: "🎨", description: "Logo, UI, branding & visual work" },
  developer: { label: "Developer", emoji: "💻", description: "Apps, websites & integrations" },
  copywriter: { label: "Copywriter", emoji: "✍️", description: "Sales copy, email & content" },
  seo: { label: "SEO", emoji: "📈", description: "Rankings, audits & organic traffic" },
  video: { label: "Video Editor", emoji: "🎬", description: "YouTube, reels & production" },
};
