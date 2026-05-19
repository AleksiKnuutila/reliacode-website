/**
 * Internal resolved configuration used throughout the codebase.
 *
 * Prefer editing `astro-paper.config.ts` instead of this file. This module exists to
 * apply defaults and expose a fully-resolved config shape (`ResolvedAstroPaperConfig`).
 *
 * It also exports the ReliaGround-specific site constants (NAV_LINKS, HEADER_CTA,
 * FOOTER_COLS, etc.) used by the Header / Footer / Layout shell.
 */
import userConfig from "@/astro-paper.config";
import type { ResolvedAstroPaperConfig } from "./types/config";
import { PUBLIC_GOOGLE_SITE_VERIFICATION } from "astro:env/client";

const DEFAULT_OG_IMAGE = "default-og.jpg";

const config: ResolvedAstroPaperConfig = {
  site: {
    ...userConfig.site,
    ogImage: userConfig.site.ogImage ?? DEFAULT_OG_IMAGE,
    lang: userConfig.site.lang ?? "en",
    timezone: userConfig.site.timezone ?? "UTC",
    dir: userConfig.site.dir ?? "ltr",
    googleVerification:
      userConfig.site.googleVerification || PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
  posts: {
    perPage: userConfig.posts?.perPage ?? 4,
    perIndex: userConfig.posts?.perIndex ?? 4,
    scheduledPostMargin:
      userConfig.posts?.scheduledPostMargin ?? 15 * 60 * 1000,
  },
  features: {
    lightAndDarkMode: userConfig.features?.lightAndDarkMode ?? true,
    dynamicOgImage: userConfig.features?.dynamicOgImage ?? true,
    showArchives: userConfig.features?.showArchives ?? true,
    showBackButton: userConfig.features?.showBackButton ?? true,
    editPost: userConfig.features?.editPost ?? { enabled: false },
    search: userConfig.features?.search ?? "pagefind",
  },
  socials: userConfig.socials ?? [],
  shareLinks: userConfig.shareLinks ?? [],
};

export default config;

// ──────────────────────────────────────────────────────────────────
// ReliaGround site constants
//
// These are read by the shared shell (Header / Footer) and by the
// landing-page sections. Keeping them here means a single edit
// changes them everywhere.
// ──────────────────────────────────────────────────────────────────

export type NavLink = {
  label: string;
  href: string;
};

/** Main in-page navigation. Hrefs are landing-page fragments; Header
 *  rewrites them to "/#..." on non-landing pages. */
export const NAV_LINKS: NavLink[] = [
  { label: "Problem", href: "#problem" },
  { label: "Approach", href: "#approach" },
  { label: "Team", href: "#team" },
  { label: "FAQ", href: "#faq" },
  { label: "Blog", href: "#blog" },
];

/** Sticky-header CTA. Target is the in-page contact section. */
export const HEADER_CTA: NavLink = {
  label: "Pilot with us",
  href: "#contact",
};

/** Pilot enquiry address. Placeholder until the real mailbox is set up. */
export const PILOT_EMAIL = "pilots@reliaground.example";

/** Footer column layout (column 1 is the colophon, hard-coded in Footer). */
export const FOOTER_COLS = {
  site: NAV_LINKS,
  project: [
    { label: "Research brief", href: "#" },
    { label: "Publications", href: "#" },
    { label: "Advisors", href: "#" },
  ] satisfies NavLink[],
};

/** Affiliation shown next to the logo. */
export const SITE_AFFILIATION = "University of Helsinki";

/** Footer column-1 paragraph. */
export const COLOPHON =
  "A research-to-business project at the University of Helsinki on reliable, auditable LLM-assisted analytics.";
