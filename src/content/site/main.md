---
title: Site chrome

# Sticky-header nav. Hrefs are landing-page fragments; the Header
# component rewrites them to "/#…" on non-landing pages so they still
# scroll to the right section.
nav:
  - { label: "Problem",  href: "#problem"  }
  - { label: "Approach", href: "#approach" }
  - { label: "Team",     href: "#team"     }
  - { label: "FAQ",      href: "#faq"      }
  - { label: "Blog",     href: "#blog"     }

# Pill button on the right side of the header. Same rewriting applies.
header_cta:
  label: "Pilot with us"
  href: "#contact"

# Small text next to the logo (header) and used in the legal strip below.
affiliation: "University of Helsinki"

# Footer column 1 — paragraph under the brand mark.
colophon: >
  A research-to-business project at the University of Helsinki on reliable,
  auditable LLM-assisted analytics.

# Footer "Project" column (column 3). Column 2 reuses `nav` above.
footer_project_links:
  - { label: "Research brief", href: "#" }
  - { label: "Publications",   href: "#" }
  - { label: "Advisors",       href: "#" }

# Pilot enquiries mailbox. Used by the footer contact column and the
# landing-page CTA section.
pilot_email: "pilots@reliaground.example"

# Thin bar at the very bottom of the page. `{year}` is replaced with the
# current year at build time.
legal_left:  "© {year} ReliaGround · University of Helsinki"
legal_right: "Research preview · Pilots open"
---
