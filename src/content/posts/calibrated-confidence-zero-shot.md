---
title: Calibrated confidence for zero-shot LLMs
description: How llmex turns a causal LM's logits into probabilities you can actually filter and trust — with visual explainers of logit scoring, collision fallback, recognition prompts, and temperature scaling.
author: roman-kyrychenko
pubDatetime: 2026-07-31T09:00:00Z
featured: true
draft: false
tags:
  - llmex
  - calibration
  - zero-shot
---

*How [llmex](https://github.com/ReliaParse/llmex) turns a causal LM's logits into probabilities you can actually filter and trust.*

Zero-shot with an instruct-tuned LM is a fantastic way to prototype an NLP pipeline. In fifteen lines of Python you can classify tickets, extract entities, verify claims, or rank passages — no fine-tuning, no annotated data, no task-specific head.

The default recipe for turning that free-text output into something a downstream system can consume is **structured extraction**: hand the model a JSON schema in the prompt and ask it to emit conforming JSON. That works, but it has three costs you pay every call:

- **The schema eats context.** A modest Pydantic model burns 300–500 tokens of prompt before the input starts. On long documents that's context you could have spent on the actual source.
- **Parsing fails.** Trailing commas, missing required keys, hallucinated fields, quoted numbers — common enough that most production wrappers ship a JSON-repair library and a retry loop.
- **The returned JSON has no confidences.** You get `category: electronics` and no signal about whether the model was 80 % sure or 30 % sure. Every downstream consumer has to treat every field as ground truth.

You could try to squeeze a confidence out by prompting: *"On a scale of 0 to 1, how confident are you?"*. Don't. Self-reported confidence from a decoder LM is only weakly correlated with correctness, saturates near 1.0, and is trained-to-please rather than trained-to-be-honest. When you actually measure it on REBEL relation extraction, the model reports a mean confidence of `0.58` on a task where it gets `7/84 = 8.3 %` right — off by a factor of seven, in the wrong direction.

llmex fixes both. Every function returns a value **and** a confidence in `[0, 1]` derived from the model's own logits (not from anything the model *says* about itself), and can be calibrated to match empirical accuracy with a 50-example fit. The schema stays short — you pass it as a Python object, not as prompt text — and structural correctness comes for free because llmex reads probabilities over the candidates you provided, one at a time, instead of generating a JSON blob and hoping.

<figure style="margin:1.75rem 0;padding:1rem;background:#f5f5fa;border:1px solid #e5e7eb;border-radius:8px;">
<svg viewBox="0 0 800 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Two zero-shot pipelines compared: standard LLM output vs llmex output" style="display:block;width:100%;height:auto;">
  <style>
    .lx1-box{fill:#f5f5fa;stroke:#4b5563;stroke-width:1.2}
    .lx1-box-hi{fill:#eef2ff;stroke:#4338ca;stroke-width:1.5}
    .lx1-lbl{font:600 12px system-ui,sans-serif;fill:#111827}
    .lx1-sm{font:11px system-ui,sans-serif;fill:#374151}
    .lx1-code{font:11px ui-monospace,SFMono-Regular,Menlo,monospace;fill:#111827}
    .lx1-arrow{stroke:#4b5563;stroke-width:1.4;fill:none;marker-end:url(#a)}
    .lx1-arrow-hi{stroke:#4338ca;stroke-width:1.6;fill:none;marker-end:url(#ah)}
    .lx1-title{font:700 13px system-ui,sans-serif;fill:#111827}
  </style>
  <defs>
    <marker id="a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#4b5563"/></marker>
    <marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#4338ca"/></marker>
  </defs>
  <text x="20" y="22" class="lx1-title">Standard zero-shot</text>
  <rect class="lx1-box" x="20" y="38" width="210" height="48" rx="6"/>
  <text x="30" y="57" class="lx1-sm">Prompt</text>
  <text x="30" y="76" class="lx1-code">"Classify: 'I love it'"</text>
  <line class="lx1-arrow" x1="235" y1="62" x2="275" y2="62"/>
  <rect class="lx1-box" x="275" y="38" width="100" height="48" rx="6"/>
  <text x="294" y="67" class="lx1-lbl">Causal LM</text>
  <line class="lx1-arrow" x1="380" y1="62" x2="420" y2="62"/>
  <rect class="lx1-box" x="420" y="38" width="180" height="48" rx="6"/>
  <text x="430" y="57" class="lx1-sm">Free-form reply</text>
  <text x="430" y="76" class="lx1-code">"positive"</text>
  <text x="610" y="68" class="lx1-sm" fill="#b91c1c">? — no confidence</text>

  <text x="20" y="150" class="lx1-title">llmex — logit scoring over candidates</text>
  <rect class="lx1-box-hi" x="20" y="166" width="210" height="48" rx="6"/>
  <text x="30" y="185" class="lx1-sm">Prompt + candidates</text>
  <text x="30" y="204" class="lx1-code">choices=["pos","neg","neu"]</text>
  <line class="lx1-arrow-hi" x1="235" y1="190" x2="275" y2="190"/>
  <rect class="lx1-box-hi" x="275" y="166" width="100" height="48" rx="6"/>
  <text x="294" y="195" class="lx1-lbl">Causal LM</text>
  <line class="lx1-arrow-hi" x1="380" y1="190" x2="420" y2="190"/>
  <rect class="lx1-box-hi" x="420" y="166" width="280" height="48" rx="6"/>
  <text x="430" y="185" class="lx1-sm">Softmax over candidates</text>
  <text x="430" y="204" class="lx1-code">{"pos":0.91,"neg":0.05,"neu":0.04}</text>
  <text x="710" y="188" class="lx1-sm" fill="#065f46">value</text>
  <text x="710" y="204" class="lx1-sm" fill="#065f46">+ confidence</text>
</svg>
<figcaption style="color:#4b5563;font-size:.9rem;margin-top:.75rem;text-align:center;"><em>Instead of parsing a text reply, llmex reads the model's own probability distribution over the labels you supplied.</em></figcaption>
</figure>

## The core idea in one paragraph

An instruct-tuned causal LM, given a prompt like `"Sentiment: 'I love it'. Answer:\n"`, computes a probability distribution over its ~150k-token vocabulary for the very next token. `score_choices` picks out just the tokens that spell your candidate labels, renormalises to a proper distribution, and returns it. **One forward pass, N candidates, a valid probability distribution.**

```python
from llmex import classify
classify("I love this product!", ["positive", "negative", "neutral"], model, tokenizer)
# {"positive": 0.9134, "negative": 0.0512, "neutral": 0.0354}
```

That single trick powers `classify`, `mcqa`, `verify`, `rank`, `disambiguate`, and every "score the alternatives" step in `extract` / `extract_entities` / `analyze` / `extract_relations`.

## Two edge cases, handled automatically

### First-token collisions

The tokeniser doesn't respect your label semantics. `"Sports"` and `"Sci/Tech"` both start with the token `"S"`; the digits `"1"` and `"10"` start with the token `"1"`. A naïve first-token softmax over such labels is meaningless — it can't distinguish them.

<figure style="margin:1.75rem 0;padding:1rem;background:#f5f5fa;border:1px solid #e5e7eb;border-radius:8px;">
<svg viewBox="0 0 800 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Diagram: first-token collision detection triggers fallback to full-span teacher-forcing" style="display:block;width:100%;height:auto;">
  <style>
    .lx2-box{fill:#f5f5fa;stroke:#4b5563;stroke-width:1.2}
    .lx2-box-warn{fill:#fef3c7;stroke:#b45309;stroke-width:1.2}
    .lx2-box-ok{fill:#d1fae5;stroke:#065f46;stroke-width:1.2}
    .lx2-lbl{font:600 12px system-ui,sans-serif;fill:#111827}
    .lx2-sm{font:11px system-ui,sans-serif;fill:#374151}
    .lx2-code{font:11px ui-monospace,SFMono-Regular,Menlo,monospace;fill:#111827}
    .lx2-arrow{stroke:#4b5563;stroke-width:1.4;fill:none;marker-end:url(#a2)}
    .lx2-title{font:700 13px system-ui,sans-serif;fill:#111827}
  </style>
  <defs><marker id="a2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#4b5563"/></marker></defs>
  <text x="20" y="22" class="lx2-title">score_choices detects a collision → falls back to full-span scoring</text>
  <rect class="lx2-box" x="20" y="42" width="250" height="66" rx="6"/>
  <text x="30" y="60" class="lx2-sm">Candidates</text>
  <text x="30" y="80" class="lx2-code">"Sports"   → ["S", "ports"]</text>
  <text x="30" y="98" class="lx2-code">"Sci/Tech" → ["S", "ci", "/Tech"]</text>
  <line class="lx2-arrow" x1="275" y1="75" x2="310" y2="75"/>
  <rect class="lx2-box-warn" x="310" y="42" width="200" height="66" rx="6"/>
  <text x="320" y="62" class="lx2-sm">First-token clash on "S"</text>
  <text x="320" y="82" class="lx2-sm">next-token softmax can't</text>
  <text x="320" y="99" class="lx2-sm">separate the two labels</text>
  <line class="lx2-arrow" x1="515" y1="75" x2="550" y2="75"/>
  <rect class="lx2-box-ok" x="550" y="42" width="240" height="66" rx="6"/>
  <text x="560" y="62" class="lx2-sm">Fall back to score_span</text>
  <text x="560" y="82" class="lx2-sm">geometric mean of P(token | prefix)</text>
  <text x="560" y="99" class="lx2-sm">across the full label span</text>
  <text x="20" y="146" class="lx2-sm" fill="#065f46"><tspan font-weight="700">Cost:</tspan> only the colliding candidates pay for extra forward passes. Non-colliding labels stay on the fast 1-pass path.</text>
  <text x="20" y="170" class="lx2-sm">Length-normalised so a 3-token label doesn't lose to a 1-token label just for being longer.</text>
</svg>
<figcaption style="color:#4b5563;font-size:.9rem;margin-top:.75rem;text-align:center;"><em>The tokeniser doesn't respect label boundaries — llmex detects and works around it per-label, not per-batch.</em></figcaption>
</figure>

### Multi-label ≠ softmax

If a review can talk about *both* battery and screen, softmax over labels is the wrong model — it forces the probability mass to sum to 1 across labels that aren't mutually exclusive. `classify(multilabel=True)` asks one **independent** yes/no question per label and returns `P(yes)`. Real probabilities. `0.5` is a meaningful threshold.

## Confidence for extraction: recognition prompts

For open-ended tasks — NER, ABSA, relations, structured JSON — the classic approach is: generate the span, then teacher-force it back through the model and read the joint probability of the tokens. That works, but the numbers you get are useless in practice: entity text confidences of `0.004`, aspect confidences of `0.0001`. Sort-by-confidence returns garbage.

llmex switches to a **recognition prompt** instead. After the generation pass finds a candidate span, it re-prompts the model with a yes/no question — `"Is [Elon Musk] the PERSON entity in this text?"` — and reads `P(yes)` via the same collision-safe logit-scoring path.

<figure style="margin:1.75rem 0;padding:1rem;background:#f5f5fa;border:1px solid #e5e7eb;border-radius:8px;">
<svg viewBox="0 0 800 280" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Two-stage extraction diagram: generation then per-span recognition prompt" style="display:block;width:100%;height:auto;">
  <style>
    .lx3-box{fill:#f5f5fa;stroke:#4b5563;stroke-width:1.2}
    .lx3-box-hi{fill:#eef2ff;stroke:#4338ca;stroke-width:1.4}
    .lx3-box-out{fill:#d1fae5;stroke:#065f46;stroke-width:1.2}
    .lx3-sm{font:11px system-ui,sans-serif;fill:#374151}
    .lx3-code{font:11px ui-monospace,SFMono-Regular,Menlo,monospace;fill:#111827}
    .lx3-arrow{stroke:#4338ca;stroke-width:1.6;fill:none;marker-end:url(#a3)}
    .lx3-title{font:700 13px system-ui,sans-serif;fill:#111827}
    .lx3-stage{font:600 12px system-ui,sans-serif;fill:#4338ca}
  </style>
  <defs><marker id="a3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#4338ca"/></marker></defs>
  <text x="20" y="22" class="lx3-title">extract_entities()  —  generate → recognise</text>

  <text x="20" y="52" class="lx3-stage">Stage 1 — greedy generation (1 pass)</text>
  <rect class="lx3-box" x="20" y="62" width="200" height="46" rx="6"/>
  <text x="30" y="80" class="lx3-sm">source</text>
  <text x="30" y="98" class="lx3-code">"Elon Musk announced…"</text>
  <line class="lx3-arrow" x1="225" y1="85" x2="265" y2="85"/>
  <rect class="lx3-box-hi" x="265" y="62" width="200" height="46" rx="6"/>
  <text x="275" y="88" class="lx3-sm">Model emits spans + labels</text>
  <line class="lx3-arrow" x1="470" y1="85" x2="510" y2="85"/>
  <rect class="lx3-box" x="510" y="62" width="280" height="46" rx="6"/>
  <text x="520" y="80" class="lx3-sm">candidate spans</text>
  <text x="520" y="98" class="lx3-code">[Elon Musk/PERSON, Tesla/ORG]</text>

  <text x="20" y="152" class="lx3-stage">Stage 2 — per-span recognition (yes/no scoring)</text>
  <rect class="lx3-box-hi" x="20" y="162" width="420" height="66" rx="6"/>
  <text x="30" y="181" class="lx3-sm">prompt (repeated per span, KV-cached prefix)</text>
  <text x="30" y="200" class="lx3-code">"Is 'Elon Musk' the PERSON entity in the text?"</text>
  <text x="30" y="218" class="lx3-code">"Answer yes or no:"</text>
  <line class="lx3-arrow" x1="445" y1="195" x2="485" y2="195"/>
  <rect class="lx3-box-out" x="485" y="162" width="305" height="66" rx="6"/>
  <text x="495" y="181" class="lx3-sm">score_choices(["yes","no"])</text>
  <text x="495" y="200" class="lx3-code">P(yes) = 0.963  ← text_confidence</text>
  <text x="495" y="218" class="lx3-code">label_confidence via softmax</text>

  <text x="20" y="258" class="lx3-sm"><tspan font-weight="700">Per-entity output:</tspan> confidence = geometric mean(text_conf, label_conf) — one number for sort / filter, either weak component pulls it down.</text>
</svg>
<figcaption style="color:#4b5563;font-size:.9rem;margin-top:.75rem;text-align:center;"><em>The recognition prompt gives well-separated span confidences (0.5–1.0 range) instead of teacher-forcing crush (near 0). Same trick for ABSA, relations, and per-field extract().</em></figcaption>
</figure>

The result: `extract_entities()` gives you span confidences you can actually filter on. The KV prefix cache reuses the source-text prefix across all recognition prompts, so the second stage is nearly free even on CPU.

## Making the numbers trustworthy: temperature scaling

Even with recognition prompts, the raw probabilities coming out of an instruct-tuned LM are systematically **overconfident**. A 0.95 score on a task with 8 % accuracy tells you the model likes to sound sure. Ranking is fine (AUC &gt; 0.5), but the numbers themselves lie.

Fit a single scalar `T` on a small labelled calibration set (~50 examples) and apply `softmax(logits / T)` at inference. That's temperature scaling. It is monotonic — argmax, accuracy, and AUC are exactly preserved — so it can only help.

<figure style="margin:1.75rem 0;padding:1rem;background:#f5f5fa;border:1px solid #e5e7eb;border-radius:8px;">
<svg viewBox="0 0 720 260" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Reliability diagram: before and after temperature scaling on REBEL relation extraction" style="display:block;width:100%;height:auto;">
  <style>
    .lx4-ax{stroke:#374151;stroke-width:1}
    .lx4-grid{stroke:#e5e7eb;stroke-width:1}
    .lx4-tick{font:10px system-ui,sans-serif;fill:#4b5563}
    .lx4-lbl{font:11px system-ui,sans-serif;fill:#111827}
    .lx4-title{font:700 13px system-ui,sans-serif;fill:#111827}
    .lx4-sub{font:12px system-ui,sans-serif;fill:#111827}
    .lx4-diag{stroke:#6b7280;stroke-width:1;stroke-dasharray:4 3}
    .lx4-bad{fill:#b91c1c}
    .lx4-good{fill:#065f46}
    .lx4-legend{font:11px system-ui,sans-serif;fill:#374151}
  </style>
  <text x="20" y="22" class="lx4-title">REBEL relation extraction — reliability diagram (want: dots on the diagonal)</text>
  <text x="90" y="46" class="lx4-sub">Before (raw)  ECE = 0.496</text>
  <g transform="translate(60,60)">
    <line class="lx4-ax" x1="0" y1="160" x2="200" y2="160"/>
    <line class="lx4-ax" x1="0" y1="0" x2="0" y2="160"/>
    <line class="lx4-grid" x1="0" y1="120" x2="200" y2="120"/>
    <line class="lx4-grid" x1="0" y1="80"  x2="200" y2="80"/>
    <line class="lx4-grid" x1="0" y1="40"  x2="200" y2="40"/>
    <line class="lx4-grid" x1="50"  y1="0" x2="50"  y2="160"/>
    <line class="lx4-grid" x1="100" y1="0" x2="100" y2="160"/>
    <line class="lx4-grid" x1="150" y1="0" x2="150" y2="160"/>
    <line class="lx4-diag" x1="0" y1="160" x2="200" y2="0"/>
    <circle cx="20"  cy="152" r="4" class="lx4-bad"/>
    <circle cx="60"  cy="150" r="4" class="lx4-bad"/>
    <circle cx="100" cy="152" r="4" class="lx4-bad"/>
    <circle cx="140" cy="150" r="4" class="lx4-bad"/>
    <circle cx="180" cy="146" r="4" class="lx4-bad"/>
    <text x="0"  y="176" class="lx4-tick">0</text>
    <text x="95" y="176" class="lx4-tick">0.5</text>
    <text x="190" y="176" class="lx4-tick">1</text>
    <text x="-14" y="164" class="lx4-tick">0</text>
    <text x="-22" y="84"  class="lx4-tick">0.5</text>
    <text x="-14" y="4"   class="lx4-tick">1</text>
    <text x="70" y="196" class="lx4-lbl">confidence bin</text>
    <text x="-40" y="80" class="lx4-lbl" transform="rotate(-90 -40 80)">accuracy</text>
  </g>
  <text x="475" y="46" class="lx4-sub">After (T=4.0)  ECE = 0.089</text>
  <g transform="translate(440,60)">
    <line class="lx4-ax" x1="0" y1="160" x2="200" y2="160"/>
    <line class="lx4-ax" x1="0" y1="0" x2="0" y2="160"/>
    <line class="lx4-grid" x1="0" y1="120" x2="200" y2="120"/>
    <line class="lx4-grid" x1="0" y1="80"  x2="200" y2="80"/>
    <line class="lx4-grid" x1="0" y1="40"  x2="200" y2="40"/>
    <line class="lx4-grid" x1="50"  y1="0" x2="50"  y2="160"/>
    <line class="lx4-grid" x1="100" y1="0" x2="100" y2="160"/>
    <line class="lx4-grid" x1="150" y1="0" x2="150" y2="160"/>
    <line class="lx4-diag" x1="0" y1="160" x2="200" y2="0"/>
    <circle cx="20"  cy="150" r="4" class="lx4-good"/>
    <circle cx="60"  cy="112" r="4" class="lx4-good"/>
    <circle cx="100" cy="72"  r="4" class="lx4-good"/>
    <circle cx="140" cy="48"  r="4" class="lx4-good"/>
    <circle cx="180" cy="14"  r="4" class="lx4-good"/>
    <text x="0"  y="176" class="lx4-tick">0</text>
    <text x="95" y="176" class="lx4-tick">0.5</text>
    <text x="190" y="176" class="lx4-tick">1</text>
    <text x="-14" y="164" class="lx4-tick">0</text>
    <text x="-22" y="84"  class="lx4-tick">0.5</text>
    <text x="-14" y="4"   class="lx4-tick">1</text>
    <text x="70" y="196" class="lx4-lbl">confidence bin</text>
  </g>
  <text x="20" y="248" class="lx4-legend">Argmax, accuracy, and AUC are unchanged by T-scaling — only the probability changes. Mean conf drops from 0.579 to 0.172, matching true accuracy 0.083.</text>
</svg>
<figcaption style="color:#4b5563;font-size:.9rem;margin-top:.75rem;text-align:center;"><em>Fitting a single scalar T on ~50 labelled examples took REBEL relation confidences from wildly overconfident to nearly perfectly calibrated. Same trick works for every task in llmex.</em></figcaption>
</figure>

```python
from llmex import fit_temperature, classify

# 50 labelled examples drawn from your task distribution
T = fit_temperature(cls_calib, choices, model, tokenizer)   # e.g. 1.7

# Same call, one extra kwarg
scores = classify(text, choices, model, tokenizer, temperature=T)
```

Two things to watch for. First, the calibration set has to include hard cases — wrong or uncertain predictions. Feed `fit_temperature` only examples the model got right, and NLL fitting picks `T < 1` (*sharpening*) and the overconfidence stays. Stratify by prediction confidence when you build the set. Second, per-task `T` values in the wild span roughly `0.7` to `5+`; there's no universal default, so fit per task and per model.

If the fitted `T` saturates at the top of the grid, extend it:

```python
T = fit_temperature(calib, choices, model, tokenizer, t_grid=[2, 5, 8, 12, 16, 20])
```

## When to trust the score

A pre-calibration rule of thumb:

| Range | Meaning |
| --- | --- |
| **0.90 – 1.00** | Model was highly certain |
| **0.70 – 0.90** | Confident, but alternatives considered |
| **0.50 – 0.70** | Moderate — worth reviewing |
| **&lt; 0.50** | Low — may be unreliable |

After temperature scaling on a set that included hard cases, those thresholds correspond to genuine probabilities and you can pick decision thresholds on principled grounds — target ECE, precision at a coverage rate, or a conformal-prediction-set width. Composing per-check confidences into a per-record verdict? Use the geometric mean, not the arithmetic mean or raw product — it penalises any weak link and stays comparable across records with different numbers of checks.

## What llmex is not

It doesn't fine-tune. It doesn't call an API. It doesn't quantise. It just reads logits from a local causal LM and turns them into probability distributions with the correct shape for each task. The whole library is small enough to read in an afternoon.

If your workflow currently parses free-text LM output with a regex and hopes for the best, `classify()`, `extract()`, and a 50-sample calibration pass will give you a triage queue you can actually work.

---

**Try it:** [github.com/ReliaParse/llmex](https://github.com/ReliaParse/llmex) · [docs](https://reliaparse.github.io/llmex/) · [calibration recipe](https://reliaparse.github.io/llmex/calibration/)
