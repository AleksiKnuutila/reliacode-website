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

// ──────────────────────────────────────────────────────────────────
// Landing-page content: Team + FAQ
//
// Rendered by TeamGrid.astro and FAQ.astro. Keeping the copy here
// makes wording changes a single-file edit and keeps the components
// purely presentational.
// ──────────────────────────────────────────────────────────────────

export type TeamMember = {
  /** Single character shown inside the gradient avatar tile. */
  initial: string;
  /** Role title — used in place of a real name until the team is public. */
  name: string;
  /** Sub-line below the name. */
  role: string;
  /** Short paragraph describing what the person does. */
  bio: string;
  /** Small mono tag at the bottom of the card. */
  affiliation: string;
};

export const TEAM_MEMBERS: TeamMember[] = [
  {
    initial: "A",
    name: "Principal Investigator",
    role: "Project Lead",
    bio: "Sets the research agenda and works across pilots. Background in machine learning & data infrastructure.",
    affiliation: "Machine Learning",
  },
  {
    initial: "P",
    name: "Postdoctoral Researcher",
    role: "LLM Verification",
    bio: "Designs the verification methods that check generated implementations against stated intent and constraints.",
    affiliation: "Software Engineering",
  },
  {
    initial: "D",
    name: "Doctoral Researcher",
    role: "Analytical Workflows",
    bio: "Studies how analytical teams work today and where reliable LLM assistance can actually fit in their pipeline.",
    affiliation: "Applied Statistics",
  },
  {
    initial: "C",
    name: "Commercialisation Lead",
    role: "Industry & Pilots",
    bio: "Runs pilot relationships, scopes engagements with partner organisations, and maps the route out of the research phase.",
    affiliation: "Tech Transfer",
  },
];

export type FaqItem = {
  /** Question text shown in the summary row. */
  q: string;
  /** Answer paragraph revealed when the row is expanded. */
  a: string;
  /** If true, the row is rendered with the `open` attribute on first paint. */
  open?: boolean;
};

export const FAQ_ITEMS: FaqItem[] = [
  {
    q: "Is ReliaGround a product I can buy today?",
    a: "Not yet. ReliaGround is an active research project. We are working with a small number of pilot organisations to validate the methods before any commercial release.",
    open: true,
  },
  {
    q: "What kinds of organisations are you looking for as pilots?",
    a: "Teams whose analytical work has low tolerance for error and a need for reproducible verification — finance, public administration, life sciences, regulated industries. We adapt to your stack.",
  },
  {
    q: "How is this different from using an LLM directly in a notebook?",
    a: "We integrate LLMs with deterministic tools and develop methods to verify implementations against stated intent and constraints. Traceable, re-runnable results — not one-shot answers.",
  },
  {
    q: "Who funds the project?",
    a: "A research-to-business project hosted at the University of Helsinki. Pilot collaborations shape the research agenda and inform routes to commercialisation.",
  },
  {
    q: "What does a pilot involve in practice?",
    a: "A scoped engagement around one or two of your real analytical workflows. Agreed success criteria, work alongside your team, shared findings. No licence fee.",
  },
  {
    q: "Which models and tools do you support?",
    a: "The verification methods are model-agnostic. In practice we have run experiments against frontier hosted models and open-weights models, and integrated with Python, SQL and the typical warehouse / notebook stack.",
  },
  {
    q: "What happens to data we share during a pilot?",
    a: "Pilots operate under a written agreement covering data handling, scope and outputs. By default, sensitive data does not leave your environment; we work with anonymised or synthetic inputs where possible.",
  },
  {
    q: "How do we get started?",
    a: "Send a short note about a real workflow where correctness matters. We follow up with a 45-minute conversation to see whether the engagement is a fit on both sides.",
  },
];
