---
title: "BridgeLytic: Agentic Work OS"
summary: A 72-hour case study — a deterministic 7-stage pipeline that turns public business signals into a ranked, human-reviewable opportunity queue.
order: 4
featured: true
role: Independent Case Study (72-Hour Build)
org: BridgeLytic Capital
dates: Aug 2026
location: Remote
stack: [Python, Claude API, Deterministic Pipelines, Data Modeling, pptxgenjs]
metrics:
  - { label: "Pipeline stages", value: "7" }
  - { label: "Signals processed", value: "14" }
  - { label: "Scoring dimensions", value: "6" }
  - { label: "Audit events logged", value: "91" }
# add public/images/projects/bridgelytic/cover.jpg then uncomment:
# cover: cover.jpg
coverAlt: "BridgeLytic Agentic Work OS pipeline diagram"
links:
  - { label: "Code", href: "https://github.com/Danielchf2006/Agentic-Work-OS-Case-Modeling" }
draft: false
---

## Problem

A 72-hour take-home case: design and prototype an "agentic work OS" for
BridgeLytic Capital — a system that watches public signals (press releases,
job postings, grant listings) for opportunities that match BridgeLytic's
actual business, and turns them into a ranked queue a human can act on. The
brief specified 7 pipeline stages and a placeholder venture taxonomy; I
replaced the placeholder with BridgeLytic's real three-industry taxonomy
(pulled from their live site) and built every stage as real, runnable code
against 14 real signals sourced from live web search — not invented data.

## Approach

**Seven stages, each a pure function over one `Signal` object, one file per
stage** — matching the case's structure 1:1 instead of one monolithic
script:

```
CAPTURE → VERIFY → CLASSIFY → SCORE → ENRICH → RECOMMEND → CONTROL
```

- **Capture** loads each signal with its source, date, URL, and raw text —
  no scraping behind auth walls.
- **Verify** checks confidence (High/Med/Low), staleness (deadline-passed
  phrasing), recipient type (a government or pass-through recipient can
  never become a client, so that check runs and wins regardless of keyword
  match), and whether the evidence references a dated event.
- **Classify** routes each signal to one of BridgeLytic's three real
  industries or `NO_FIT` via keyword overlap; ambiguous matches are flagged
  for review rather than silently forced into a category.
- **Score** applies a transparent weighted formula (below) — reproducible
  to two decimal places on every re-run, since every input is a
  deterministic function of fields already in the raw signal.
- **Enrich** generates a buyer/pain/value hypothesis grounded in each
  signal's actual evidence text, not a fixed template. This runs
  deterministically by default for full auditability during batch review —
  but a real Claude API integration (`enrich_llm.py`) exists, was
  live-validated separately, and is disclosed as built-but-not-default
  rather than presented as a missing piece.
- **Recommend** assigns one of BridgeLytic's four real engagement types
  (Blueprint / Sprint / Enterprise AI Implementation / Managed Office),
  with a why-now rationale and the major open uncertainty.
- **Control** is the human-approval gate — routes to `pending_approval`,
  `needs_human_review`, or `rejected`, and separately flags duplicate
  signals. **Nothing leaves this pipeline automatically; a person sends
  anything outward.**

**The scoring formula:**

```
final_score = (Σ dimension_score × weight) − risk_penalty
```

Six dimensions (evidence strength & recency, problem urgency,
economic/strategic value, ecosystem/venture fit, decision-maker
accessibility, 30–90 day pilot feasibility), weighted 0.10–0.20 and summing
to 1.0, minus a separate risk penalty for staleness, low source confidence,
dated evidence, ambiguous fit, or a secondary/aggregator source. Evidence
strength and economic value are weighted highest — a well-sourced,
high-value signal is worth a human's time even with imperfect timing;
decision-maker accessibility is weighted lowest, since that gap is the
easiest one to close with 15 minutes of a person's own research.

## Results

Run against 14 real signals — 12 genuine buyer-pain signals plus 2
deliberately included as real test cases (a genuine near-duplicate pair, a
genuine stale-but-classified case) — the pipeline produced a ranked
opportunity set with a full audit trail (91 logged events) and caught both
planted cases correctly: it flagged the duplicate cluster (two "Director,
Production Planning" postings, different companies, same underlying
operational pain) and correctly penalized the ~21-month-old deal as stale
rather than scoring it at face value.

Top-ranked example from the actual run: a PE firm's acquisition of an AI
orchestration platform, scored 6.05, correctly routed to
`pending_approval` with an explicit analyst caveat attached ("competitive
intelligence, not a direct client lead — flagged for human review, not used
in scoring") — the kind of nuance a purely automated system would have
either silently dropped or silently acted on.

The deliverables — working prototype, CSV opportunity set, a written
decision output, the architecture/scoring docs, and a 6-slide exec deck
generated straight from a script (`build_deck.js`, not hand-built slides) —
came with an explicit AI-disclosure doc: which parts used Claude for
architecture/code/research, which logic is deterministic Python with no
live LLM call in the default path, and what I personally verified (every
source URL and date, every bug re-run against real data, every reported
score confirmed by actually executing the code).

## What I'd do next

- Validate the scoring weights against real outcomes once enough signals
  have gone through human review — they're currently reasoned, not
  empirically tuned.
- Wire the live Claude `enrich_llm.py` path into the default run once cost
  and latency at scale are acceptable, with the deterministic version kept
  as an audit-mode fallback.
- Move classification from keyword-overlap to a semantic router — testing
  surfaced real cases where unfamiliar phrasing was missed by keyword
  matching alone.
- Even out public-signal availability across BridgeLytic's three
  industries; one currently surfaces noticeably fewer usable signals than
  the other two.
