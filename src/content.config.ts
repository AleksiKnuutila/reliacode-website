import { defineCollection, reference } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";

export const BLOG_PATH = "src/content/posts";

const posts = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: `./${BLOG_PATH}` }),
  schema: ({ image }) =>
    z.object({
      /** Slug of the team member who wrote this post, e.g.
       *  `aleksi-knuutila`. Must match a file in src/content/team/. */
      author: reference("team"),
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
    affiliation: z.string(),
    colophon: z.string(),
    pilot_email: z.string(),
    // `{year}` is substituted with the current year at render time.
    legal_left: z.string(),
  }),
});

// One file per landing section. Schema discriminated by `section` so each
// file gets exactly the fields it needs and Zod validates strictly.
const landing = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: "./src/content/landing" }),
  schema: z.discriminatedUnion("section", [
    // --- hero (flat scalars only; partners live as H2 items in the
    //     markdown body, parsed via parseSectionItems).
    //
    //     The headline is split into a default-colored prefix and an
    //     accent-colored second statement (rendered as a block). The
    //     funder-strip label is a two-line block: `funder_lead`
    //     (regular muted) on top, `funder_sub` (accent, semibold)
    //     below. ---
    z.object({
      section: z.literal("hero"),
      title: z.string(),
      headline_prefix: z.string(),
      headline_accent: z.string(),
      lead: z.string().optional(),
      cta_label: z.string(),
      cta_href: z.string(),
      funder_lead: z.string(),
      funder_sub: z.string(),
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

    // --- howitworks (flat scalars only; three steps live as H2 items in
    //     the markdown body with `## {label} — {title}` followed by a
    //     prose paragraph. Step illustrations are hardcoded in the
    //     HowItWorks component, picked by step index). ---
    z.object({
      section: z.literal("howitworks"),
      title: z.string(),
      kicker: z.string(),
      headline: z.string(),
    }),

    // --- approach (kicker + headline scalars; the three pillar cards
    //     live in the markdown body as H2 items parsed via
    //     parseSectionItems). ---
    z.object({
      section: z.literal("approach"),
      title: z.string(),
      kicker: z.string(),
      headline: z.string(),
    }),

    // --- team (section header only; individual members live in the
    //     `team` collection, one file per person, so each is editable
    //     standalone in Obsidian). ---
    z.object({
      section: z.literal("team"),
      title: z.string(),
      headline: z.string(),
      intro: z.string(),
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

    // --- cta (right-column card lists tappable contact channels;
    //     each has a kind (drives which icon + scheme), a label, a
    //     display value, and an href. `feature: true` gets the
    //     emphasized background; `external: true` opens in a new tab
    //     and shows the ↗ arrow.) ---
    z.object({
      section: z.literal("cta"),
      title: z.string(),
      kicker: z.string(),
      headline: z.string(),
      lead: z.string(),
      cta_label: z.string(),
      card_title: z.string(),
      channels: z.array(
        z.object({
          kind: z.enum(["email", "phone", "calendar", "linkedin"]),
          label: z.string(),
          value: z.string(),
          href: z.string(),
          feature: z.boolean().default(false),
          external: z.boolean().default(false),
        })
      ),
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
// markdown body; the photo lives in the same folder so it's editable
// alongside the markdown in Obsidian.
const team = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: "./src/content/team" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      /** Full name as shown on the card. */
      name: z.string(),
      /** Sub-line below the name. */
      role: z.string(),
      /** Path to the profile photo, relative to this markdown file
       *  (typically `./<slug>.jpeg`). Astro's image pipeline optimizes
       *  it. */
      photo: image(),
      /** Lower numbers appear first. */
      sort: z.number(),
    }),
});

export const collections = { posts, pages, landing, site, faq, team };
