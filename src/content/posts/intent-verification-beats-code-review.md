---
title: 'Why intent verification beats code review for LLM output'
description: 'Code that runs is not code that answers the right question. A short argument for checking implementations against the stated goal, not just against the compiler.'
pubDatetime: 2026-03-20T09:00:00Z
category: Position
tags:
  - position
  - verification
  - llm
featured: false
draft: false
---

Code review, as a practice, asks a careful question: *is this code correct?*
That question has served the industry well. It catches off-by-ones, missed
edge cases, race conditions, and the small sins of style that make a
codebase harder to maintain a year from now. None of that is going away.

But there is a second question that code review does not really ask:
*is this code answering the question that was asked?* And with LLM-generated
code, that second question is where most of the damage hides.

## The "it compiles" problem

An LLM is extraordinarily good at producing code that runs. Tests pass,
types check, the function returns a number with the right shape. The
trouble is that the number may answer a slightly different question than
the one in the analyst's head. The model heard "active users per cohort"
and produced something that counts sessions; the reviewer reads the code
and confirms it counts sessions correctly. Both parties are doing their
job. The output is still wrong.

## A worked example

A common case: SQL that runs but joins on the wrong key. The model picks
`user_id` because that is the conventional name; the warehouse uses
`account_id` for the entity the question is actually about. The query
returns plausible numbers. A code reviewer reads it and sees a clean
INNER JOIN. Nothing in the review process surfaces the mismatch — there
is no place in the diff where the stated intent of the analysis is written
down to compare against.

## What intent verification adds

Capture the question, in prose, before the code is written. Execute the
code. Then check the result against the stated question — not against the
code's internal consistency, but against the goal. That third step is the
one current workflows skip.

When the stakes are low — exploratory analysis, internal dashboards — code
review on its own is fine. When the stakes are higher — anything that
informs a decision, a regulator, or a customer — code review is necessary
but not sufficient. The question itself has to be reviewable, and the
answer has to be checkable against it. That is what we mean by intent
verification, and it is the gap LLM-assisted work has made impossible to
ignore.
