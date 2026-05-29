import { defineAstroPaperConfig } from "./src/types/config";

export default defineAstroPaperConfig({
  site: {
    // Placeholder. Real deploy URL is set later (see Phase 6).
    url: "https://reliaparse.com/",
    title: "ReliaParse",
    description: "Auditable LLMs for the work that has to be right.",
    author: "ReliaParse Team",
    // ogImage intentionally omitted — falls back to AstroPaper default
    // and the dynamic OG image route. Phase 6 restyles.
    lang: "en",
    timezone: "Europe/Helsinki",
    dir: "ltr",
  },
  posts: {
    perPage: 4,
    perIndex: 4,
    scheduledPostMargin: 15 * 60 * 1000,
  },
  features: {
    // Single-theme site — dark mode disabled for the research preview.
    lightAndDarkMode: false,
    dynamicOgImage: true,
    showArchives: true,
    showBackButton: true,
    // No public source repo to edit yet.
    editPost: { enabled: false },
    search: "pagefind",
  },
  // Research project — no social profiles yet.
  socials: [],
  // No share buttons on posts during the research preview.
  shareLinks: [],
});
