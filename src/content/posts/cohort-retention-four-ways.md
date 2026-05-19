---
title: 'Cohort retention, redone four ways'
description: 'A small case study from a pilot — the same business question routed through four different LLM-assisted pipelines, and what their audit bundles revealed about each.'
pubDatetime: 2026-04-12T09:00:00Z
category: Field report
tags:
  - field-report
  - retention
  - pilot
featured: false
draft: false
---

A pilot customer wanted a single, mundane number: monthly cohort retention,
broken out by acquisition segment, for the last twelve months. They had four
different tools sitting in the analytics stack and four different teams that
each had an opinion about which one to use. So we did the obvious thing and
ran the question through all four.

## The four pipelines

1. **A Jupyter notebook with an LLM-assisted SQL helper.** A senior analyst
   wrote the prompts, the model wrote the SQL, the notebook charted it.
2. **A ReliaGround-verified run.** Same warehouse, same question, intent
   captured up front, verification check on the output.
3. **A SQL-only baseline.** Hand-written by a data engineer who had not seen
   the other answers.
4. **The off-the-shelf BI tool.** A retention dashboard the vendor ships,
   pointed at the same fact table.

## What the audit bundles showed

Three of the four answers agreed to within a percentage point. One — the
notebook with the LLM helper — gave a curve that drifted lower as cohorts
aged. The audit bundle made the cause obvious: the model had filtered on
`signup_date < cohort_end` rather than `<=`, so each cohort lost its first
day. A small off-by-one boundary, invisible in the chart, surfaced
immediately in the verification step.

The BI tool agreed with the SQL baseline because the vendor's retention
macro was solid. The ReliaGround run agreed because the verification check
explicitly compared cohort sizes against a known reference.

## What we took away

The point of the pilot was never to embarrass the notebook. LLM-assisted
analysis is fast and often correct. The point was that "fast and often
correct" needs to be paired with "and we can show, after the fact, which
runs were the correct ones." Without that pairing, the four pipelines look
indistinguishable. With it, the off-by-one stands out before anyone presents
the chart to the board.
