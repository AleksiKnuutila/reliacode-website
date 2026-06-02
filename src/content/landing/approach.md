---
section: approach
title: Approach
kicker: Approach
headline: A different architecture for trustworthy answers.
---

## Pillar I — New model architectures

We pair generative LLMs with discriminative zero-shot models that identify the relevant chunks and spans before generation. This anchors every answer to a specific location in the source and produces calibrated confidence, something a single LLM cannot reliably do on extraction tasks.

## Pillar II — Reconciliation across documents

Workflows operate over whole collections, not single files. When several passages are relevant or sources contradict one another, the system reconciles them explicitly and surfaces the conflict, rather than silently picking one and moving on.

## Pillar III — UI built for verification

	The interface is the proof. Every answer traces back to a highlighted span in its source document, with reconciliation steps and conflicting information shown in full, turning verification from a re-investigation into a glance.
