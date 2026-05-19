# ReliaGround website — AstroPaper reskin design

**Date:** 2026-05-19
**Status:** Design approved, ready for implementation

## Summary

A static site for ReliaGround built on Astro + AstroPaper v6, reskinned to match the visual design in `template.html`. The landing page (`/`) reproduces the template's full flow. The blog (`/posts` and below) inherits the landing's design language but with calmer typography for reading.

Light-only. No dark mode.

## Architecture & routes

| Route | Purpose |
|---|---|
| `/` | Landing page — hero, problem, approach, team, FAQ, blog teaser, CTA |
| `/posts` | Paginated blog index |
| `/posts/[slug]` | Individual post |
| `/tags` | Tag cloud |
| `/tags/[tag]` | Posts filtered by tag |
| `/archives` | Year-grouped list of all posts |
| `/search` | Pagefind UI (route, not overlay) |
| `/rss.xml` | RSS feed |
| `/sitemap-index.xml` | Sitemap |

No `/about` — the team section on the landing serves that purpose.

### Navigation cohesion

Landing header uses in-page anchors (`#problem`, `#approach`, etc). On blog pages those anchors must resolve back to the landing — `Header.astro` takes a `currentPage` prop and rewrites hrefs to `/#problem` accordingly. Same for the footer.

### Landing blog teaser

The 3-card grid in the landing's `#blog` section pulls the 3 most recent posts from the content collection — not hardcoded. "All notes →" links to `/posts`.

## Design tokens & typography

Replace AstroPaper's Tailwind v4 `@theme` block with the template's `:root` tokens:

- Navy OKLCH palette (`--brand-deep`, `--brand-mid`, `--brand-soft`, `--primary`, etc.)
- Light surface tokens (`--bg`, `--fg`, `--muted`, `--card`, `--border`, `--border-strong`, `--secondary`)
- Gradients (`--gradient-accent`, `--gradient-hero`)
- Shadow (`--shadow-soft`)
- Fonts (`--font-head`, `--font-body`, `--font-mono`)

Strip all `.dark` selectors and the AstroPaper theme toggle script.

**Fonts:** switch from Google CDN to Astro's built-in `experimental.fonts` for self-hosted Fraunces / Manrope / Geist Mono. Carry over Fraunces variation axis settings (`"SOFT" 50, "WONK" 0, "opsz" 96`) as a base style on `h1–h4`.

**Reusable utility classes** (not Tailwind, plain CSS):
- `.mono` — uppercase Geist Mono kicker
- `.btn-primary` / `.btn-ghost` — buttons
- `.b-kicker` — mono kicker with leading rule

Everything else lives in Astro components.

OKLCH + `color-mix(in oklch, ...)` are used as-is. No fallbacks.

## Components

### Shared (landing + blog)

- `Layout.astro` — `<html>`, `<head>`, font preloads, slots header + footer
- `Header.astro` — sticky blur-backdrop. Props: `currentPage` (rewrites anchor hrefs)
- `Footer.astro` — four-column footer + legal strip

### Landing-only

- `Hero.astro` — wraps TruchetGrid + headline + lead + CTA + chips + TraceCard
- `TruchetGrid.astro` — the SVG maze. Existing IIFE works as-is inside a `<script>` tag; no `client:` directive needed.
- `TraceCard.astro` — verification trace mock. Takes `rows` array prop.
- `ProblemSplit.astro` — two cards (bad/good). Static content.
- `Pillars.astro` — three pillars with inline YAML-styled spec block. Static.
- `Workflow.astro` — 5-step horizontal flow. Static.
- `TeamGrid.astro` — 4-up team cards. Takes `members` array prop.
- `FAQ.astro` — `<details>`-based accordion. Takes `qa` array prop.
- `BlogTeaser.astro` — pulls 3 latest posts from content collection.
- `CTA.astro` — gradient-accent footer CTA. Static.

### Blog-only

- `PostCard.astro` — `.b-post` aesthetic, reused on landing teaser + `/posts` index
- `PostLayout.astro` — calmer reading view (see below)
- `TagPill.astro` — uses `.b-chip` aesthetic

## Blog "calmer body" treatment

Same shell (header/footer/tokens), less ornament.

### `/posts` index

- Same `.b-section` + `.b-shead` + `.b-kicker` ("All notes") pattern as landing
- Posts as `.b-post` cards in 3-column grid (matches landing teaser)
- Pagination: `← Newer · Older →` text links in mono. No numbered buttons.

### `/posts/[slug]`

- Single column, `max-width: 68ch`, centered
- Title: Fraunces 42–48px
- Meta strip: mono date · category · read-time
- Tag pills below meta (`.b-chip` style)
- Body: Manrope, `line-height: 1.75`, `font-size: 17px`
- Prose headings: Fraunces, scale h2/h3/h4 at 28/22/18px
- Code blocks: Geist Mono on navy-deep background (matches `.b-spec`)
- Inline code: `--secondary` background, mono
- Blockquotes: left rule in `--brand-mid`, italic Fraunces
- No sidebar, no related posts
- Bottom-of-post: ← back to all notes, in mono

### `/tags`

- Wrap of `.b-chip` pills, each with post count in smaller mono suffix

### `/tags/[tag]`

- Same as `/posts` index, kicker becomes "Tag · [name]"

### `/archives`

- Year-grouped list. Year heading in Fraunces. Posts as one-line rows: mono date · title (link). Quietest page on the site.

### `/search`

- Pagefind UI on a `/search` route (not overlay). Override Pagefind's CSS variables to match tokens.

## Content & configuration

### Content collections

- `src/content.config.ts` defines `posts` collection with Zod schema: `title`, `description`, `pubDatetime`, `modDatetime?`, `tags[]`, `draft?`, `featured?`
- Posts in `src/data/posts/*.md` (or `.mdx`)
- MDX enabled so posts can embed components later

### `src/config.ts`

Single source of truth for:

- `SITE` — `title`, `author`, `url`, `description`, `lang`
- `NAV_LINKS` — used by header + footer + landing nav
- `SOCIAL` — footer
- `FOOTER_COLS` — four-column structure
- `PILOT_EMAIL` — CTA + footer

### Landing content

Inlined in `src/pages/index.astro`. Specific, structural copy — not a feed. Externalizing to CMS or markdown would be premature.

### Email

Drop the Cloudflare email-protection script. Render plain `mailto:` links.

## OG image generation

Keep AstroPaper's satori-based OG image generator. Restyle:
- Navy gradient background
- Fraunces title
- Mono date + author

## Build & deploy

- `npm run dev` — local server
- `npm run build` — static site + sitemap + RSS + Pagefind index (Pagefind in `postbuild`)
- Output fully static — deploys anywhere (Cloudflare Pages, Netlify, S3+CF, nginx)

## Out of scope

- Dark mode
- `/about` page
- Related posts on individual post pages
- Header search overlay (using route instead)
- OKLCH/color-mix fallbacks for old browsers
- Email obfuscation
