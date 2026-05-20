---
section: approach
title: Approach
kicker: Approach
headline: A different architecture for trustworthy answers.
workflow_label: Workflow · five-step loop
workflow_meta: each step writes to the run's audit bundle
---

# Pillars

## Pillar I — Task decomposition

We break document understanding into specialized sub-tasks rather than running it end-to-end through a single LLM. Each step is checkable, replayable, and isolated from the others.

## Pillar II — Discriminative confidence

Zero-shot classification models verify generative output, producing calibrated probabilities — something monolithic LLMs cannot reliably do on extraction tasks.

## Pillar III — Principled abstention

When confidence is low or sources contradict, the system abstains or asks for clarification rather than guessing. Uncertainty is a first-class output, not a side effect.

# Workflow

## 01 — User intent

Goal & stated constraints

## 02 — LLM proposal

Candidate implementation

## 03 — Deterministic exec.

Reproducible run

## 04 — Verification

Intent & constraints checked

## 05 — Auditable result

Trace, inputs, outputs
