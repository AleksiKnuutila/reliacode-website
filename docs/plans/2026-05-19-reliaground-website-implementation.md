# ReliaGround website implementation plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a static Astro site for ReliaGround. Landing page reproduces `template.html` exactly. Blog (`/posts` and below) inherits the design language with calmer typography.

**Architecture:** Scaffold from AstroPaper v6, replace its design tokens with the template's OKLCH navy palette, extract template.html's sections into Astro components, restyle AstroPaper's blog pages with a "calmer body" treatment. Light-only. Self-hosted fonts. Static output.

**Tech Stack:** Astro 5, Tailwind v4, TypeScript, MDX, Pagefind (search), satori (OG images). Fonts: Fraunces, Manrope, Geist Mono.

**Reference docs:**
- Design: `docs/plans/2026-05-19-reliaground-astropaper-reskin-design.md`
- Visual source of truth: `template.html`

---

## Phase 0: Repo setup

### Task 0.1: Init git, commit initial state

**Files:**
- Create: `.gitignore`
- Commit: `template.html`, `docs/plans/*.md`

**Steps:**
1. `git init`
2. Write `.gitignore` with: `node_modules`, `dist`, `.astro`, `.DS_Store`, `.env*` (not `.env.example`), `pagefind`, `*.log`
3. `git add .gitignore template.html docs/`
4. `git commit -m "Initial commit: design doc and template"`

**Verify:** `git log --oneline` shows one commit.

---

## Phase 1: Scaffold AstroPaper

### Task 1.1: Clone AstroPaper, prune, install

**Steps:**
1. `git clone --depth 1 https://github.com/satnaing/astro-paper.git /tmp/astro-paper`
2. Copy everything except `.git`, `.github`, `LICENSE`, `README.md`, `CHANGELOG.md`, screenshots, and the demo content from `/tmp/astro-paper` into `/srv/reliacode/website`
3. Specifically delete: `src/data/blog/*.md` (demo posts), `public/og.png`, `public/favicon.svg`, any author/profile images we don't have content for
4. `npm install`
5. `npm run dev` — verify it boots on a local port

**Verify:** Dev server responds with AstroPaper's default homepage. Note any console errors.

**Commit:** `git add -A && git commit -m "Scaffold AstroPaper v6 baseline"`

### Task 1.2: Smoke-test the build

**Steps:**
1. `npm run build`
2. Confirm `dist/` is generated, sitemap and RSS exist, Pagefind index builds

**Verify:** No build errors. `dist/index.html`, `dist/sitemap-*.xml`, `dist/rss.xml` exist.

---

## Phase 2: Design system

### Task 2.1: Replace design tokens

**Files:**
- Modify: `src/styles/global.css`

**Steps:**
1. Open AstroPaper's `global.css`. Identify its `@theme` block and any `.dark` selectors.
2. Replace `@theme` contents with the template's `:root` block (port every variable from `template.html` lines 11–36, mapping to Tailwind v4's `--color-*` / `--font-*` naming where Tailwind expects it; keep `--brand-*`, `--gradient-*`, `--shadow-*` as plain custom properties).
3. Delete all `.dark` selectors.
4. Add base styles for `html, body, h1-h4, p, a, ::selection` matching `template.html` lines 38–61.
5. Add the three utility classes: `.mono`, `.btn-primary`, `.btn-ghost`, plus `details > summary` resets (template lines 63–97).

**Verify:** `npm run dev`. Existing AstroPaper pages now use new fonts + colors (will look broken — that's expected; we'll rebuild layouts next).

**Commit:** `git add -A && git commit -m "Replace design tokens with template palette"`

### Task 2.2: Self-host fonts

**Files:**
- Modify: `astro.config.ts` (enable `experimental.fonts`)
- Modify: `src/layouts/Layout.astro` or wherever fonts are loaded — remove Google `<link>` tags

**Steps:**
1. Configure `experimental.fonts` in `astro.config.ts` with three font families:
   - Fraunces (variable, axes: opsz, wght, SOFT, WONK; weights 400/500/600; italic 400)
   - Manrope (variable, weights 400/500/600/700)
   - Geist Mono (variable, weights 400/500)
2. Use `<Font name="..." />` in the head of the root layout
3. Remove any pre-existing Google fonts `<link>`

**Verify:** Network tab in dev shows fonts loading from local origin, not fonts.gstatic.com. Fraunces variation axes work (test by inspecting an h1).

**Commit:** `git add -A && git commit -m "Self-host Fraunces, Manrope, Geist Mono via Astro fonts"`

---

## Phase 3: Shared shell

### Task 3.1: `src/config.ts` — single source of truth

**Files:**
- Modify: `src/config.ts`

**Steps:**
1. Replace AstroPaper's defaults with:
   - `SITE`: title `"ReliaGround"`, author, url placeholder, description from template's `<title>` and lead paragraph, lang `"en"`
   - `NAV_LINKS`: `[{label, href}]` for Problem, Approach, Team, FAQ, Blog, plus CTA "Pilot with us"
   - `FOOTER_COLS`: structured as in template lines 897–931
   - `PILOT_EMAIL`: placeholder string
2. Delete AstroPaper-specific config we won't use (e.g., dark mode default, GitHub edit links if we don't want them)

**Commit:** `git add -A && git commit -m "Configure site identity and nav structure"`

### Task 3.2: `Header.astro`

**Files:**
- Modify: `src/components/Header.astro` (replace whatever AstroPaper has)

**Steps:**
1. Port template lines 99–124 (CSS for `.rg-header`, `.rg-header-inner`, `.rg-logo`, `.rg-nav`)
2. Render markup matching template lines 509–525
3. Accept prop `currentPage?: 'landing' | 'post' | 'archives' | 'tags' | 'search'`
4. Anchor link logic: if `currentPage === 'landing'`, hrefs are `#problem` etc.; otherwise `/#problem` etc.
5. Use `NAV_LINKS` from config

**Verify:** Visit landing — anchor scrolls work. Visit `/posts` (still AstroPaper default) — header renders, anchors point to `/#problem`.

**Commit:** `git add -A && git commit -m "Build site header with anchor rewriting"`

### Task 3.3: `Footer.astro`

**Files:**
- Modify: `src/components/Footer.astro`

**Steps:**
1. Port template lines 484–503 CSS
2. Render markup matching template lines 897–935, but pull labels/links from `FOOTER_COLS` + `SITE` config
3. Drop the Cloudflare email-protection `<script>` and replace `__cf_email__` spans with plain `<a href="mailto:...">` using `PILOT_EMAIL`

**Verify:** Footer renders identically on landing and blog pages.

**Commit:** `git add -A && git commit -m "Build site footer"`

### Task 3.4: `Layout.astro`

**Files:**
- Modify: `src/layouts/Layout.astro` (or create if AstroPaper's structure differs)

**Steps:**
1. Wrap `<html lang>` + `<head>` (title, meta description, OG, font preloads, favicon) + `<body>` with `<Header />` + `<slot />` + `<Footer />`
2. Accept props: `title`, `description`, `currentPage`, optionally `ogImage`
3. Use `SITE` config for defaults

**Verify:** Manually visit landing route — full shell renders.

**Commit:** `git add -A && git commit -m "Wire shared Layout with header and footer"`

---

## Phase 4: Landing page

### Task 4.1: Stub `src/pages/index.astro`

**Files:**
- Modify: `src/pages/index.astro`

**Steps:**
1. Delete AstroPaper's existing index content
2. Wrap with `<Layout currentPage="landing" title="ReliaGround — Auditable LLMs for analytics">`
3. Add empty placeholders for `<Hero />`, `<ProblemSplit />`, `<Pillars />`, `<Workflow />`, `<TeamGrid />`, `<FAQ />`, `<BlogTeaser />`, `<CTA />` (not yet created — comment them out for now)

**Commit:** `git add -A && git commit -m "Stub landing page"`

### Task 4.2: `Hero.astro` + `TruchetGrid.astro` + `TraceCard.astro`

**Files:**
- Create: `src/components/landing/Hero.astro`
- Create: `src/components/landing/TruchetGrid.astro`
- Create: `src/components/landing/TraceCard.astro`

**Steps:**
1. `TruchetGrid.astro`: port the SVG element + entire `<script>buildTruchet()</script>` block from template lines 938–1054. No props. The IIFE wires up its own ResizeObserver.
2. `TraceCard.astro`: accept prop `rows: Array<{ts, status: 'pass'|'run', message, meta}>`. Port CSS from template lines 204–249 into a `<style>` block (or `global.css` if shared). Render markup matching lines 545–586. Default `rows` to the example data from the template if no prop given.
3. `Hero.astro`: port CSS from template lines 128–161. Render full hero structure (lines 527–587) using `<TruchetGrid />` and `<TraceCard rows={...} />`. Headline + lead + CTAs as static markup. Also include the "in collaboration with" rail (lines 590–598) — port CSS lines 163–201.
4. Uncomment `<Hero />` in `index.astro`.

**Verify:** Visit landing in browser. Hero renders, headline is gradient-accented, Truchet SVG draws on the left, trace card visible on the right. Resize window — Truchet rebuilds.

**Commit:** `git add -A && git commit -m "Build Hero with TruchetGrid and TraceCard"`

### Task 4.3: `ProblemSplit.astro`

**Files:**
- Create: `src/components/landing/ProblemSplit.astro`

**Steps:**
1. Port CSS lines 252–281 (`.b-section`, `.b-shead`, `.b-kicker`, `.b-problem`, `.b-prob-card`) — note `.b-section` and `.b-shead` are SHARED with other sections; put them in `global.css` rather than scoped.
2. Render markup matching lines 602–631. Static content.
3. Uncomment in `index.astro`.

**Verify:** Problem section renders with two cards, "bad" with grey left rule, "good" with deep navy left rule + tinted background.

**Commit:** `git add -A && git commit -m "Add Problem section"`

### Task 4.4: `Pillars.astro` + `Workflow.astro`

**Files:**
- Create: `src/components/landing/Pillars.astro`
- Create: `src/components/landing/Workflow.astro`

**Steps:**
1. `Pillars.astro`: port CSS lines 284–306 (`.b-pillars`, `.b-pillar`, `.b-spec`). Render markup lines 640–664 (three pillars, including the inline YAML-styled `b-spec` for Pillar III). Static content.
2. `Workflow.astro`: port CSS lines 309–330 (`.b-workflow`, `.b-wf-*`). Render markup lines 666–698 (five steps). Static.
3. Wrap both in a `<section class="b-section alt" id="approach">` in `index.astro` matching template line 634.
4. Uncomment in `index.astro`.

**Verify:** Approach section renders with three pillar cards, YAML block on the third has navy background + color-coded tokens. Workflow row below shows 5 steps with check marks.

**Commit:** `git add -A && git commit -m "Add Approach section with Pillars and Workflow"`

### Task 4.5: `TeamGrid.astro`

**Files:**
- Create: `src/components/landing/TeamGrid.astro`
- Modify: `src/config.ts` — add `TEAM_MEMBERS` array

**Steps:**
1. Add to config: `TEAM_MEMBERS: Array<{initial, name, role, bio, affiliation}>`. Seed with the four placeholder members from template lines 720–748.
2. `TeamGrid.astro`: port CSS lines 348–386. Render markup matching lines 704–754, iterating over `TEAM_MEMBERS`.
3. Include the `.b-team-intro` paragraph and the "Names and photographs to follow" footer line.

**Verify:** Team section renders 4 cards with gradient avatar squares.

**Commit:** `git add -A && git commit -m "Add Team section"`

### Task 4.6: `FAQ.astro`

**Files:**
- Create: `src/components/landing/FAQ.astro`
- Modify: `src/config.ts` — add `FAQ_ITEMS` array

**Steps:**
1. Config: `FAQ_ITEMS: Array<{q, a, open?: boolean}>` — seed with template lines 765–820 content
2. Component: port CSS lines 389–396. Render `<details>` accordion iterating over `FAQ_ITEMS`. First item has `open` attribute.

**Verify:** FAQ section renders. Clicking summary expands; `+` rotates 45deg via existing CSS.

**Commit:** `git add -A && git commit -m "Add FAQ section"`

### Task 4.7: `BlogTeaser.astro` + `PostCard.astro`

**Files:**
- Create: `src/components/PostCard.astro` (shared)
- Create: `src/components/landing/BlogTeaser.astro`

**Steps:**
1. `PostCard.astro`: port CSS lines 399–434. Accept props `post: { slug, title, description, pubDatetime, category? }`. Render `.b-post` markup matching lines 833–840 (single post). Stamp shows "Note · NNN" — derive from a config-driven series number, or fall back to formatted date.
2. `BlogTeaser.astro`: query content collection for 3 most recent non-draft posts via `getCollection('posts')`. If `featured: true` posts exist, prefer those. Render `<section class="b-section" id="blog">` with shead "Latest writing" / "From the research notebook." and 3-column `.b-blog` grid of `<PostCard />`. Include the `.b-blog-foot` row with "All notes →" linking to `/posts`.

**Note:** Content collection schema isn't built yet (Phase 6). Until then, hardcode the three posts from template lines 833–860 as fallback data inside `BlogTeaser.astro`. Replace with real query in Phase 6.

**Verify:** Blog teaser shows 3 cards on landing, matching template visual exactly.

**Commit:** `git add -A && git commit -m "Add BlogTeaser and PostCard (hardcoded posts)"`

### Task 4.8: `CTA.astro`

**Files:**
- Create: `src/components/landing/CTA.astro`

**Steps:**
1. Port CSS lines 443–482. Render markup matching template lines 869–894.
2. Use `PILOT_EMAIL` from config for the `mailto:` links (replacing Cloudflare-protected ones).

**Verify:** CTA renders with gradient background, grid pattern overlay, two-column layout, light buttons.

**Commit:** `git add -A && git commit -m "Add CTA section"`

### Task 4.9: Visual fidelity check

**Steps:**
1. Open `template.html` in browser
2. Open `localhost:port/` (our build) in browser
3. Compare side-by-side. Check spacing, font weights, gradients, hover states, anchor scroll behavior, mobile breakpoints (resize browser).
4. File any deltas as follow-up commits.

**Verify:** Side-by-side is visually indistinguishable.

**Commit (if deltas):** `git commit -m "Visual parity fixes"`

---

## Phase 5: Blog reskin

### Task 5.1: Content collection schema

**Files:**
- Modify: `src/content.config.ts`

**Steps:**
1. Define `posts` collection with Zod schema: `title` (string), `description` (string), `pubDatetime` (date), `modDatetime` (date, optional), `tags` (array of string, default []), `draft` (boolean, default false), `featured` (boolean, default false), `category` (string, optional — e.g. "Method", "Field report", "Position")
2. Set `loader` to glob `src/data/posts/*.md`

**Commit:** `git add -A && git commit -m "Define posts content collection"`

### Task 5.2: Seed posts

**Files:**
- Create: `src/data/posts/auditable-working-definition.md`
- Create: `src/data/posts/cohort-retention-four-ways.md`
- Create: `src/data/posts/intent-verification-beats-code-review.md`

**Steps:**
1. Use the three posts from template lines 833–860 as seed content. Write 200–400 words of placeholder body for each so we can verify rendering, but keep titles/descriptions/categories exact.

**Commit:** `git add -A && git commit -m "Add three seed posts"`

### Task 5.3: Wire `BlogTeaser` to real content

**Files:**
- Modify: `src/components/landing/BlogTeaser.astro`

**Steps:**
1. Replace hardcoded data with `getCollection('posts')` query
2. Sort by `pubDatetime` desc, slice 3, with `featured` preference

**Verify:** Landing teaser shows the three seed posts. Click one — link target is `/posts/[slug]`.

**Commit:** `git add -A && git commit -m "Wire BlogTeaser to content collection"`

### Task 5.4: `/posts` index page

**Files:**
- Modify: `src/pages/posts/index.astro` (or `[...page].astro` for pagination)

**Steps:**
1. Replace AstroPaper's existing posts index
2. Use `<Layout currentPage="post">`
3. Header: `<section class="b-section">` with kicker "All notes" + h2 "From the research notebook."
4. Render posts as `.b-blog` 3-column grid of `<PostCard />`
5. Pagination: `← Newer · Older →` text links in mono, no numbered buttons. Use Astro's `paginate()` API.

**Verify:** `/posts` shows all 3 seed posts. With more posts, pagination kicks in.

**Commit:** `git add -A && git commit -m "Build /posts index page"`

### Task 5.5: `PostLayout.astro` — calmer body

**Files:**
- Create: `src/layouts/PostLayout.astro`
- Modify: `src/styles/global.css` — add `.post-prose` styles

**Steps:**
1. Layout uses `<Layout currentPage="post">`
2. Content area: `max-width: 68ch`, centered
3. Header block: title (Fraunces 42–48px), meta strip (mono date · category · read-time), tag pills (`.b-chip` style)
4. Slot for MDX content
5. `.post-prose` CSS: Manrope 17px line-height 1.75 for `p`, Fraunces for `h2/h3/h4` at 28/22/18px, code blocks with `.b-spec`-style navy background, inline code on `--secondary` background, blockquotes with `--brand-mid` left rule + italic Fraunces, lists, tables
6. Footer of layout: "← back to all notes" mono link

**Verify:** Visit `/posts/auditable-working-definition` — reads well, prose feels calmer than landing.

**Commit:** `git add -A && git commit -m "Build PostLayout with calmer body styles"`

### Task 5.6: `/posts/[slug]` route

**Files:**
- Modify: `src/pages/posts/[slug].astro`

**Steps:**
1. `getStaticPaths` from `getCollection('posts')`, filtering out drafts
2. Render with `<PostLayout {...frontmatter}>` and `<Content />` slot for body

**Verify:** All three seed posts render with `/posts/<slug>` URLs.

**Commit:** `git add -A && git commit -m "Wire post pages with PostLayout"`

### Task 5.7: `/tags` and `/tags/[tag]`

**Files:**
- Modify: `src/pages/tags/index.astro`
- Modify: `src/pages/tags/[tag].astro`
- Create: `src/components/TagPill.astro`

**Steps:**
1. `TagPill.astro`: uses `.b-chip` styling. Accepts `tag` and optional `count` props. Count rendered as smaller mono suffix.
2. `/tags` index: aggregate all tags across posts, render as wrap of `<TagPill />`s with counts.
3. `/tags/[tag]`: `getStaticPaths` from unique tags. Layout same as `/posts` index but kicker reads `Tag · [name]` and title is `Posts tagged "[name]"`.

**Verify:** `/tags` lists tags. Clicking a tag filters to posts with that tag.

**Commit:** `git add -A && git commit -m "Build /tags index and tag-filtered pages"`

### Task 5.8: `/archives`

**Files:**
- Modify: `src/pages/archives.astro`

**Steps:**
1. Use `<Layout currentPage="archives">`
2. Section with kicker "Archive" / h2 "All notes by year."
3. Group posts by `pubDatetime` year, descending
4. Each year: Fraunces heading, then plain rows: mono date (e.g. `MAY 09`) + title (link)
5. No cards. Quietest page on the site.

**Verify:** `/archives` shows year-grouped list.

**Commit:** `git add -A && git commit -m "Build /archives page"`

### Task 5.9: `/search` with Pagefind

**Files:**
- Modify: `src/pages/search.astro`
- Modify: `package.json` postbuild script (verify it runs Pagefind)
- Modify: `src/styles/global.css` — Pagefind variable overrides

**Steps:**
1. Confirm AstroPaper's existing Pagefind integration runs in `postbuild` (script: `pagefind --site dist`)
2. Mount Pagefind UI on `/search` page using `<div id="search">` + Pagefind's `<script>` import
3. Override Pagefind CSS vars to match tokens:
   - `--pagefind-ui-primary`, `--pagefind-ui-text`, `--pagefind-ui-background`, `--pagefind-ui-border`, `--pagefind-ui-font` mapped to our `--brand-mid`, `--fg`, `--card`, `--border`, `--font-body`
4. Wrap in `<Layout currentPage="search">`

**Verify:** `npm run build && npm run preview`. `/search` shows search box; typing surfaces seed-post matches.

**Commit:** `git add -A && git commit -m "Wire /search with Pagefind, themed to match tokens"`

---

## Phase 6: Cross-cutting polish

### Task 6.1: OG image generator restyle

**Files:**
- Modify: AstroPaper's OG image generator (likely `src/utils/og-templates/*.tsx`)

**Steps:**
1. Locate the satori template for post OG images
2. Restyle: navy `--gradient-accent` background, Fraunces title at large size, mono date + author at bottom, optional ReliaGround logo mark in corner
3. Verify Fraunces is loadable by satori (may need to load woff from `node_modules/@fontsource-variable/...` directly)

**Verify:** Build the site. Check `dist/posts/<slug>.png` (or wherever AstroPaper puts them). Open one — looks branded.

**Commit:** `git add -A && git commit -m "Restyle OG image generator with ReliaGround brand"`

### Task 6.2: Sitemap + RSS verification

**Steps:**
1. `npm run build`
2. Open `dist/rss.xml` — verify SITE.title/url come from our config
3. Open `dist/sitemap-0.xml` — verify all routes listed
4. Validate RSS with `xmllint --noout dist/rss.xml` (or paste into validator.w3.org)

**Verify:** No errors.

### Task 6.3: Favicon + brand mark

**Files:**
- Create: `public/favicon.svg`

**Steps:**
1. Create a small SVG favicon using the gradient mark from `.rg-logo .mark` (22px navy gradient square, rounded 4px)
2. Reference in `Layout.astro` head
3. Optionally generate `apple-touch-icon.png` if AstroPaper expects one

**Verify:** Browser tab shows the favicon.

**Commit:** `git add -A && git commit -m "Add favicon based on brand mark"`

### Task 6.4: Responsive pass

**Steps:**
1. Open landing at 1440px, 1024px, 768px, 375px widths
2. Template uses fixed `1180px` max-width with `grid-template-columns: 1.05fr 1fr` etc — these don't collapse on mobile. Add `@media (max-width: 900px)` rules for:
   - Hero grid → single column
   - Pillars / Problem / Team / Blog → stack
   - Workflow row → stack or scroll
   - CTA two-column → stack
   - Footer four-column → 2x2 or stack
3. Check blog post readability on mobile

**Verify:** No horizontal scroll at 375px. Readable on tablet.

**Commit:** `git add -A && git commit -m "Add responsive breakpoints for sub-900px viewports"`

### Task 6.5: Final build + Lighthouse

**Steps:**
1. `npm run build && npm run preview`
2. Run Lighthouse on `/` and `/posts/<slug>` — performance, accessibility, best practices, SEO
3. Fix obvious issues: missing `<main>`, image `alt`, heading hierarchy gaps

**Verify:** All scores ≥ 90.

**Commit:** `git add -A && git commit -m "Accessibility and performance fixes"`

---

## What I'm explicitly NOT doing

- Dark mode
- `/about` page
- Related posts on individual post pages
- Header-triggered search overlay (using `/search` route)
- OKLCH/color-mix fallbacks
- Email obfuscation (plain `mailto:` for now)
- Newsletter signup
- Comments
- Analytics

## Deferred (can revisit later)

- Real team member content + photos
- Real pilot email + contact form
- Real partner logos in the collab rail
- Replacing seed post bodies with actual research notes
- i18n
