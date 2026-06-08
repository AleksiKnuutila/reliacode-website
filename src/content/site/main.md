---
title: Site chrome

# Header nav. Hash hrefs are landing-page fragments; the Header
# component rewrites them to "/#…" on non-landing pages so they still
# scroll to the right section. Absolute paths (like /posts) pass
# through unchanged. "Solution" deliberately points at #how — the
# in-page label for that section is "How it works".
nav:
  - { label: "Problem",  href: "#problem" }
  - { label: "Solution", href: "#how"     }
  - { label: "Team",     href: "#team"    }
  - { label: "FAQ",      href: "#faq"     }
  # Blog is hidden for now — restore by uncommenting this line and
  # the {/* <BlogTeaser /> */} in src/pages/index.astro.
  # - { label: "Blog",     href: "/posts"   }
  - { label: "Contact",  href: "#contact" }

# Small text next to the logo (header) and used in the legal strip below.
affiliation: "University of Helsinki"

# Footer column 1 — paragraph under the brand mark.
colophon: >
  A research-to-business project at the University of Helsinki on reliable,
  auditable LLM-assisted analytics.

# Pilot enquiries mailbox. Used by the footer contact column and the
# landing-page CTA section.
pilot_email: "antti.nikander@helsinki.fi"

# Copyright line at the very bottom of the page. `{year}` is replaced
# with the current year at build time.
legal_left:  "© {year} ReliaParse · University of Helsinki"
---
