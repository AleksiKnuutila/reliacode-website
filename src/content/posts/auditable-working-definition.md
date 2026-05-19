---
title: 'What we mean by "auditable" — a working definition'
description: 'Six properties an analytical run should carry with it so a reviewer, a regulator, or a future you can rerun it cold.'
pubDatetime: 2026-05-15T09:00:00Z
category: Method
tags:
  - method
  - auditability
featured: true
draft: false
---

The word "auditable" gets used loosely. People reach for it when they mean
"someone wrote a notebook," or "we saved the SQL," or "the model is documented
somewhere on the wiki." None of those are auditable in the sense we care
about. When we say a run is auditable, we mean a reviewer, a regulator, or a
future version of you can pick it up cold — with no Slack threads, no tribal
memory, no email back-and-forth — and rerun it to exactly the same answer.

Concretely, six properties have to travel with the run:

## 1. Inputs are captured verbatim

Not "we pulled from the warehouse," but the exact rows, hashed and pinned to
the run. If the table changes underneath you, the bundle still has what was
read.

## 2. Code is the version that ran

Not the version that is checked in this morning. The commit SHA of every
module that touched data, recorded at execution time. The two diverge more
often than people admit.

## 3. Outputs are bound to the run

Not to the artifact location. Filenames lie, paths get reorganised, and S3
prefixes drift. A content hash and a run id are the only durable handles.

## 4. The environment is documented

Python versions, library versions, environment variables, the machine
fingerprint. "It worked on my laptop" is a confession, not a defence.

## 5. The intent is recorded

What question was being asked? In prose, in the bundle, written before the
analysis ran. This is the part that almost nobody captures — and it is what
turns a code review into an intent review.

## 6. Verification was performed and the result is recorded

A check ran, it had a pass/fail outcome, and that outcome lives in the
bundle. Verification that is not recorded is a rumour about verification.

That is the working definition. Subsequent notes work through each property
in more detail — why it is necessary, where teams cut corners, and what the
minimum sufficient evidence looks like in practice.
