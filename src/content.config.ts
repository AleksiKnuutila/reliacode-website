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
    // --- hero ---
    z.object({
      section: z.literal("hero"),
      title: z.string(),
      headline_prefix: z.string().default(""),
      headline_accent: z.string(),
      headline_suffix: z.string().default(""),
      lead: z.string(),
      cta_primary: linkSchema,
      cta_secondary: linkSchema,
      partners: z
        .array(z.object({ name: z.string(), kind: z.string() }))
        .default([]),
    }),

    // --- problem ---
    z.object({
      section: z.literal("problem"),
      title: z.string(),
      kicker: z.string(),
      headline: z.string(),
      cards: z.array(
        z.object({
          variant: z.enum(["bad", "good"]),
          pn: z.string(),
          h3: z.string(),
          body: z.string(),
        }),
      ),
    }),

    // --- approach (kicker/h2 + pillars + workflow combined) ---
    z.object({
      section: z.literal("approach"),
      title: z.string(),
      kicker: z.string(),
      headline: z.string(),
      pillars: z.array(
        z.object({
          pn: z.string(),
          h3: z.string(),
          body: z.string().optional(),
          // When true, the component renders its decorative constraints.yaml
          // block in place of `body` text. The block itself lives in the
          // component (decorative, not editable copy).
          has_spec_block: z.boolean().default(false),
        }),
      ),
      workflow: z.object({
        ttl: z.string(),
        meta: z.string(),
        steps: z.array(
          z.object({
            sn: z.string(),
            h4: z.string(),
            p: z.string(),
          }),
        ),
      }),
    }),

    // --- team ---
    z.object({
      section: z.literal("team"),
      title: z.string(),
      kicker: z.string(),
      headline: z.string(),
      intro: z.string(),
      members: z.array(
        z.object({
          initial: z.string(),
          name: z.string(),
          role: z.string(),
          bio: z.string(),
          affiliation: z.string(),
        }),
      ),
      note: z.string().optional(),
    }),

    // --- faq ---
    z.object({
      section: z.literal("faq"),
      title: z.string(),
      kicker: z.string(),
      headline: z.string(),
      items: z.array(
        z.object({
          q: z.string(),
          a: z.string(),
          open: z.boolean().default(false),
        }),
      ),
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

export const collections = { posts, pages, landing, site };
