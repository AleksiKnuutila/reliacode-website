# Content collections

All editorial copy for the site lives in this directory. Edit the files
here (in Obsidian or any text editor) and the site picks up the changes —
no code edits required.

## Directory map

```
src/content/
├── landing/   Sections of the homepage (one file per section)
│   ├── hero.md       headline, lead, CTAs, partner rail
│   ├── problem.md    the two contrasting cards
│   ├── approach.md   kicker + pillars + workflow steps
│   ├── team.md       team section header (kicker, headline, intro, note)
│   ├── faq.md        FAQ section header (kicker, headline)
│   ├── blog.md       blog teaser kicker, headline, footer line
│   └── cta.md        pilot CTA, headline, lead, scope card rows
├── faq/       FAQ questions, one file per Q
├── team/      Team members, one file per person
├── posts/     Blog posts, one file per post
├── pages/     Standalone static pages (about, etc.)
└── site/      Site chrome (header / footer / legal strip)
    └── main.md
```

## Editing in Obsidian

Items in `faq/`, `team/`, `posts/`, and `pages/` are designed to be edited
note-by-note: the frontmatter holds the structured fields (question text,
sort number, role, etc.) and the **markdown body** holds the prose answer
or bio. Obsidian's Properties panel and WYSIWYG editor both work cleanly.

Files in `landing/` and `site/` use richer YAML structures (lists, nested
objects) that don't render well in Obsidian's Properties panel. Edit them
in **Source view** (Ctrl/Cmd + E to toggle).

### Ordering

`faq/` and `team/` items render in `sort` order (ascending). Sort values
are spaced (10, 20, 30…) so you can insert new items between existing
ones without renumbering.

### Schema

Every file is validated against a Zod schema at build time
(`src/content.config.ts`). Mistyped fields fail the build with a clear
error — the live site is never silently broken.

## Adding a new FAQ

1. Create `src/content/faq/<slug>.md`
2. Add frontmatter: `title`, `question`, `sort` (and optionally `open: true`
   if you want it expanded by default)
3. Write the answer in the body — full markdown is supported

## Adding a new team member

1. Create `src/content/team/<slug>.md`
2. Add frontmatter: `title`, `initial`, `name`, `role`, `affiliation`, `sort`
3. Write the bio in the body

## Adding a new blog post

1. Create `src/content/posts/<slug>.md`
2. Add frontmatter (see existing posts for fields: `title`, `description`,
   `pubDatetime`, `category`, `tags`, etc.)
3. Write the post body

## What lives in code (not here)

- Site title, URL, author, language → `astro-paper.config.ts`
- Decorative constraints.yaml block on Pillar III → `Approach.astro`
- Verification trace card mock rows on the hero → `TraceCard.astro`
- Brand mark gradient, section anchor IDs → component CSS / structure
