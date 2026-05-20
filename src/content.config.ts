import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";
import config from "@/config";

export const BLOG_PATH = "src/content/posts";

const posts = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: `./${BLOG_PATH}` }),
  schema: ({ image }) =>
    z.object({
      author: z.string().default(config.site.author),
      pubDatetime: z.date(),
      modDatetime: z.date().optional().nullable(),
      title: z.string(),
      featured: z.boolean().optional(),
      draft: z.boolean().optional(),
      tags: z.array(z.string()).default(["others"]),
      category: z.string().optional(),
      ogImage: image().or(z.string()).optional(),
      description: z.string(),
      canonicalURL: z.string().optional(),
      hideEditPost: z.boolean().optional(),
      timezone: z.string().optional(),
    }),
});

const pages = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: "./src/content/pages" }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    ogImage: z.string().optional(),
    canonicalURL: z.string().optional(),
  }),
});

const linkSchema = z.object({ label: z.string(), href: z.string() });

// Site chrome (header, footer) editorial copy. Single file:
// src/content/site/main.md.
const site = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: "./src/content/site" }),
  schema: z.object({
    title: z.string(),
    nav: z.array(linkSchema),
    header_cta: linkSchema,
    affiliation: z.string(),
    colophon: z.string(),
    footer_project_links: z.array(linkSchema),
    pilot_email: z.string(),
    // `{year}` is substituted with the current year at render time.
    legal_left: z.string(),
    legal_right: z.string(),
  }),
});

// One file per landing section. Schema discriminated by `section` so each
// file gets exactly the fields it needs and Zod validates strictly.
const landing = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: "./src/content/landing" }),
  schema: z.discriminatedUnion("section", [
    // --- hero (flat scalars only; partners live as H2 items in the
    //     markdown body, parsed via parseSectionItems). ---
    z.object({
      section: z.literal("hero"),
      title: z.string(),
      headline_prefix: z.string().default(""),
      headline_accent: z.string(),
      headline_suffix: z.string().default(""),
      lead: z.string(),
      cta_primary_label: z.string(),
      cta_primary_href: z.string(),
      cta_secondary_label: z.string(),
      cta_secondary_href: z.string(),
    }),

    // --- problem (flat scalars only; comparison cards live as H2 items
    //     in the markdown body — first card = "bad" variant, second =
    //     "good", by position. Parsed via parseSectionItems). ---
    z.object({
      section: z.literal("problem"),
      title: z.string(),
      kicker: z.string(),
      headline: z.string(),
      /** Optional paragraph rendered between the section header and the
       *  two comparison cards. Use when the headline alone doesn't
       *  carry the framing. */
      intro: z.string().optional(),
    }),

    // --- approach (kicker/h2 + workflow header scalars). Pillars and
    //     workflow steps live in the markdown body of approach.md as
    //     H1-delimited groups with H2 items (parsed via
    //     parseSectionGroups). ---
    z.object({
      section: z.literal("approach"),
      title: z.string(),
      kicker: z.string(),
      headline: z.string(),
      workflow_label: z.string(),
      workflow_meta: z.string(),
    }),

    // --- team (section header only; individual members live in the
    //     `team` collection, one file per person, so each is editable
    //     standalone in Obsidian). ---
    z.object({
      section: z.literal("team"),
      title: z.string(),
      kicker: z.string(),
      headline: z.string(),
      intro: z.string(),
      note: z.string().optional(),
    }),

    // --- faq (section header only; individual Q&As live in the `faq`
    //     collection, one file per question). ---
    z.object({
      section: z.literal("faq"),
      title: z.string(),
      kicker: z.string(),
      headline: z.string(),
    }),

    // --- blog teaser (3 posts are pulled from the posts collection; this
    //     file owns only the kicker, headline, and footer line). ---
    z.object({
      section: z.literal("blog"),
      title: z.string(),
      kicker: z.string(),
      headline: z.string(),
      footer_text: z.string(),
      footer_link: linkSchema,
    }),

    // --- cta ---
    z.object({
      section: z.literal("cta"),
      title: z.string(),
      kicker: z.string(),
      headline: z.string(),
      lead: z.string(),
      cta_label: z.string(),
      card_title: z.string(),
      card_rows: z.array(z.object({ k: z.string(), v: z.string() })),
    }),
  ]),
});

// FAQ entries — one file per question. The answer lives in the markdown
// body so it can use full markdown formatting.
const faq = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: "./src/content/faq" }),
  schema: z.object({
    title: z.string(),
    question: z.string(),
    /** Lower numbers appear first. Leave gaps (10, 20, 30…) for easy
     *  insertion between items later. */
    sort: z.number(),
    /** Render this item with the `open` attribute on first paint. */
    open: z.boolean().default(false),
  }),
});

// Team members — one file per person. The short bio lives in the
// markdown body.
const team = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: "./src/content/team" }),
  schema: z.object({
    title: z.string(),
    /** Single character shown inside the gradient avatar tile. */
    initial: z.string(),
    /** Role title — used in place of a real name until the team is public. */
    name: z.string(),
    /** Sub-line below the name. */
    role: z.string(),
    /** Small mono tag at the bottom of the card. */
    affiliation: z.string(),
    /** Lower numbers appear first. */
    sort: z.number(),
  }),
});

export const collections = { posts, pages, landing, site, faq, team };
