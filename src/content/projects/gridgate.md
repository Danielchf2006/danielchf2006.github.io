---
title: GridGate Interconnection Risk & Regulatory Intelligence
summary: Predicting which renewable-energy projects drop out of the interconnection queue, projecting their upgrade costs, and scraping the regulatory landscape that drives both.
order: 2
featured: true
role: Lead Data Scientist — De-Risking & Queue Projection Team
org: GridGate
dates: Jan 2026 – Jul 2026
location: Evanston, IL
stack: [Python, scikit-learn, SQL, SQLite, Logistic Regression, Random Forest, Linear Regression, Web Scraping, LLM Summarization]
metrics:
  - { label: "AUC", value: "0.84" }
  - { label: "Savings/project", value: "~$500K" }
  - { label: "Drop stages modeled", value: "6" }
  - { label: "States tracked", value: "15" }
# add public/images/projects/gridgate/cover.jpg then uncomment:
# cover: cover.jpg
coverAlt: "GridGate interconnection queue risk dashboard"
links:
  - { label: "Regulatory scraper", href: "https://github.com/Danielchf2006/Gridgate-project-Daniel-Scraper" }
  - { label: "Cost projection", href: "https://github.com/Danielchf2006/GridGate_Cost_Projection" }
draft: false
---

## Problem

Renewable-energy developers sit in interconnection queues for years before a
project either reaches a Generator Interconnection Agreement (GIA) or drops
out. GridGate's queue-projection team needed three things developers
actually act on: **which projects are at risk of withdrawing**, **what an
upgrade will likely cost before the utility says so**, and **what's moving
in energy policy** that might change either answer. I owned all three.

## Approach

### Risk modeling — will a project withdraw, and when

Two models, both built on interconnection-queue data loaded into an
in-memory SQLite database so feature engineering could be written as SQL
rather than a maze of pandas merges:

- **Withdrawal predictor** — binary logistic regression: will this project
  withdraw from the queue at all?
- **Drop-round predictor** — multiclass classification over *six* exit
  states (completes, study-not-started, phase 1, phase 2, phase 3, GIA) —
  not just *whether* a project drops, but **which stage** it drops at,
  which is the number a developer actually needs to plan around.

Features came from queue congestion, stage-timing patterns, and MW
revisions — operational signals that separate a project quietly stalling
from one on track, well before a formal withdrawal filing.

### Cost & timeline projection

A second dataset — per-project upgrade costs stored as nested JSON inside
`gi_master_extracted_data` — had to be unpacked before it was usable:
projects with multiple IDs split into individual rows, and the cost map
parsed from string to structured dict per project. On top of that:

- A **linear cost model** (`cost = intercept + coefficient × summer MW`),
  deliberately started with one feature so the pipeline's correctness could
  be verified before adding complexity — a 100 MW example prediction served
  as the sanity check.
- A **timeline model**, complicated by the raw data itself: in-service
  timelines show up as strings like `"24–48 months"`. Parsing extracted the
  bounds and averaged them; the target was the **median** rather than the
  mean, since a handful of multi-decade outlier projects would otherwise
  skew a mean estimate well past what a typical project should expect.

### Regulatory intelligence — two scraper pipelines

Policy changes are a leading indicator for queue risk, so I built a
scraper that tracks them at two levels:

- **Local/county** — given a city, county, and state, it pulls adjacent
  counties from a reference dataset, downloads government and newsletter
  PDFs, and keeps only the ones that pass an energy-relevance keyword
  filter (explicitly excluding social media and `.gov` sites, which a
  separate pipeline already covers).
- **Federal & state** — a later, productionized version of the same idea:
  one pipeline searches government sites for federal energy documents and
  summarizes them with an LLM; a second queries OpenStates, DSIRE, and
  (for Wisconsin) the state legislature directly across **15 states in the
  MISO grid region**, surfacing both enacted programs (net metering, solar
  incentives) and bills actively moving through committee.

I also ran web scrapers for policy-related articles more broadly and layered
sentiment analysis on top, to catch softer signals — sentiment shifting on a
policy topic before any bill or filing formalizes it.

## Results

- Flagged at-risk queue withdrawals with **AUC up to 0.84**, and separated
  *which* stage a project was likely to drop at — a materially more useful
  signal than a single withdraw/don't-withdraw flag.
- Queue-congestion, stage-timing, and MW-revision features measurably
  improved dropout separability over using raw queue position alone.
- Cost-projection models forecasting interconnection upgrade costs enabled
  an estimated **~$500K in savings per project**, by catching cost
  trajectories developers could otherwise only learn from the utility late
  in the process.
- The regulatory pipelines turned a manual "check the news" process into a
  repeatable one — structured, relevance-scored output per state instead of
  someone reading PDFs by hand.

## What I'd do next

- Feed the risk models' congestion/timing features back into the cost model
  — the two were built on related but separate data pulls, and a project
  already flagged as high-withdrawal-risk should probably widen its cost
  uncertainty band, not just its own logistic-regression score.
- Move the drop-round classifier from logistic regression to a
  tree-based model (random forest / gradient boosting) now that the SQL
  feature pipeline is stable — the six-class problem likely has non-linear
  boundaries a linear model can't capture between adjacent phases.
- Extend the state-legislature scraper (currently Wisconsin-specific)
  to the other 14 tracked states where committee-level bill data is
  available, closing the gap between "enacted program" and "bill in
  committee" visibility.
