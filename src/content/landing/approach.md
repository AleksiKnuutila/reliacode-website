---
section: approach
title: Approach

kicker: Approach
headline: "Three pillars, one trace."

pillars:
  - pn: "Pillar I"
    h3: "Deterministic integration"
    body: >
      LLMs sit alongside well-specified analytical tools. Each step is
      checkable, replayable, trustable in isolation.

  - pn: "Pillar II"
    h3: "Intent verification"
    body: >
      Methods to verify that generated implementations correspond to what
      the user actually asked for — not merely code that runs.

  # Pillar III shows a decorative constraints.yaml block instead of body
  # text. The block is hardcoded in the Pillars component (not editable
  # from this file). Edit body text below to override.
  - pn: "Pillar III"
    h3: "Constraint satisfaction"
    has_spec_block: true

workflow:
  ttl: "Workflow · five-step loop"
  meta: "each step writes to the run's audit bundle"
  steps:
    - sn: "01"
      h4: "User intent"
      p: "Goal & stated constraints"
    - sn: "02"
      h4: "LLM proposal"
      p: "Candidate implementation"
    - sn: "03"
      h4: "Deterministic exec."
      p: "Reproducible run"
    - sn: "04"
      h4: "Verification"
      p: "Intent & constraints checked"
    - sn: "05"
      h4: "Auditable result"
      p: "Trace, inputs, outputs"
---
