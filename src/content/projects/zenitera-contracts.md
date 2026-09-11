---
title: Contract Review LLM Pipeline
summary: Reverse-engineers how human reviewers actually redline contracts into a mined "playbook," then applies it to predict what a reviewer would flag on a new one.
order: 3
featured: true
role: Data Science & Intelligence — Policy Risk Analyst Intern
org: Zenitera Funds Co.
dates: Jun 2026 – Present
location: Remote / Shanghai, China
stack: [Python, python-docx, LLM Classification, Prompt Engineering, JSONL Pipelines, Claude API, Qwen / Kimi]
metrics:
  - { label: "Contract types", value: "14" }
  - { label: "Taxonomy categories", value: "26" }
  - { label: "Text coverage", value: "100%" }
  - { label: "LOO test contracts", value: "4" }
# add public/images/projects/zenitera-contracts/cover.jpg then uncomment:
# cover: cover.jpg
coverAlt: "Contract review pipeline — playbook mining and prediction"
links:
  - { label: "Code (sanitized public copy)", href: "https://github.com/Danielchf2006/contract-review-llm-pipeline" }
draft: false
---

## Problem

Zenitera's legal/risk team reviews a steady stream of contracts by hand,
flagging clauses and leaving tracked-changes comments based on experience
that mostly lives in reviewers' heads. The brief: turn that tribal knowledge
into something explicit and applicable — first classify contracts and their
clauses against a real taxonomy, then go further and predict *what a human
reviewer would actually flag* on a contract nobody has looked at yet.

## Approach

### Parsing that doesn't silently drop data

`.docx` tracked-changes and comments live in raw XML that `python-docx`
quietly discards (`<w:ins>`/`<w:del>` content isn't exposed by the normal
API). I wrote a parser against the raw XML instead, so an edit or comment
a reviewer actually made is never invisible to the pipeline. A separate
parser extracts both paragraphs **and tables** in true document order, then
segments the contract using a four-level heading hierarchy — tuned for
Chinese-language contracts, structured to be adaptable to others.

### Stage 1 — classification against a real taxonomy

Every contract gets classified into one of **14 contract types**, and every
clause block gets tagged against a **26-category taxonomy** — a
government-recommended tier (single-label) plus a company-specific tier
(multi-label, tuned to Zenitera's own review priorities). I reverse-engineered
that 26-category structure by mining clause-label patterns out of legacy
reviewer annotations rather than designing it from scratch, so it reflects
how the team already thinks about risk. Classification runs through two
interchangeable LLM backends (an OpenAI-compatible gateway to a Qwen-class
model, and the Anthropic API directly), scored against a hand-labeled golden
set to catch drift between them.

### Stage 2 — mining a playbook from real redlines

This is the harder problem: not "what category is this clause" but "what
would this reviewer actually *say* about it." Every block in a set of
previously-redlined contracts — touched **and** untouched — gets folded
into one tagged corpus, untouched blocks kept as negative examples so the
model also learns what reviewers *don't* flag. A two-pass map-reduce LLM
process induces patterns from that corpus (plus the team's own written
review checklists, parsed separately as documented policy rather than
observed behavior). Each mined pattern is a `{checkpoint, typical_action,
reasoning}` triple, written as a self-contained judicial-style explanation —
so a downstream reviewer never has to go back and re-read the original
contracts to trust a pattern.

Prediction then reasons **by analogy**, not literal trigger-string matching,
and is deliberately biased toward false positives over false negatives —
better to over-flag than let a real issue through silently. Predictions
render back into a real `.docx` with actual Word comment bubbles, so an
AI-reviewed draft reads exactly like a human-reviewed one, side by side.

### Evaluating it honestly — leave-one-out, not a demo

Rather than reporting how well the model fits contracts it was mined from, I
ran a **leave-one-out test**: mine the playbook with zero knowledge of one
contract, predict on that excluded contract block-by-block, score against
what its real human reviewer(s) actually flagged. Repeated across 4 real
redlined contracts:

| Contract | Blocks | Human touch rate | Precision | Recall |
|---|---:|---:|---:|---:|
| A (heavily redlined) | 101 | 27.7% | 0.47 | 0.50 |
| B (heavily redlined) | 69 | 27.5% | 0.45 | 0.79 |
| C (lightly redlined) | 69 | 10.1% | 0.23 | 0.43 |
| D (lightly redlined) | 81 | 9.9% | 0.08 | 0.25 |

## Results

The leave-one-out numbers surfaced a real pattern, not just noise:
**precision tracks how heavily-redlined the *other* contracts in the mining
corpus are, not the held-out contract itself.** Whatever's left in the
corpus after excluding one contract skews the playbook toward however
aggressively *those* contracts were reviewed. Combined with a deliberate
false-positive bias, that produces a flood of false positives when the
excluded contract's real reviewer was comparatively light-touch — most
visibly on Contract D (23 false positives vs. 2 true positives).

I traced imperfect recall to three distinct, separable causes rather than
writing it off as "the model needs work":

1. **Single-source pattern concentration** — a pattern demonstrated by only
   one contract in the corpus disappears entirely when that contract is the
   one excluded.
2. **Reviewer under-representation** — one reviewer contributed under 3% of
   all edits corpus-wide, so the mined playbook has almost no signal for
   that reviewer's more deal-specific, less generalizable commentary style.
3. **Ground-truth label noise** — the scoring label ("any edit or comment")
   doesn't separate a substantive legal fix from a mechanical fill-in
   (an address, a page number), inflating false negatives without
   reflecting an actual reasoning failure.

None of those are prompt-tuning fixes — they all point at the same thing: a
larger, more balanced set of redlined contracts and reviewers in the mining
corpus, not a better prompt.

## What I'd do next

- Grow the mining corpus specifically toward giving today's single-source
  patterns a second independent instance, and toward the under-represented
  reviewer's edit style.
- Tighten the `has_review_action` ground-truth label to separate
  substantive edits from mechanical fill-ins before trusting a raw
  precision/recall number.
- Periodically spot-check cases where the model's reasoning-by-analogy
  makes a defensible-but-different materiality call than the original
  human reviewer — worth monitoring, not eliminating; the false-positive
  bias is intentional.
