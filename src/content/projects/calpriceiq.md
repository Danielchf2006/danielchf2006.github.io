---
title: CalPriceIQ
summary: An XGBoost close-price model for 397K+ California MLS listings — R² 0.90, MAPE 11.75%.
order: 1
featured: true
role: Data Science Intern
org: IDXExchange
dates: Jun 2026 – Present
location: Boise, ID
stack: [Python, Pandas, NumPy, Seaborn, Matplotlib, Tableau, SQL, XGBoost]
metrics:
  - { label: "Listings", value: "397K+" }
  - { label: "R²", value: "0.90" }
  - { label: "MAPE", value: "11.75%" }
  - { label: "Features", value: "82" }
cover: cover.jpg
coverAlt: "CalPriceIQ model — predicted vs. actual close price"
links:
  - { label: "Code", href: "https://github.com/Danielchf2006" }
# demoEmbed: "https://public.tableau.com/views/your-viz"
draft: false
---

## Problem

<!-- 2–3 sentences: what IDXExchange needed, why off-market price inference is
     hard, what "good" looks like. -->

## Approach

- **Temporal split.** Held out the most-recent month so the model is never
  evaluated on data that leaked from the future.
- **Feature engineering across 82 columns.** Median/mode imputation, one-hot and
  ordinal encoding, amenity-text parsing into binary indicators, log-transforms
  of skewed price/area variables, and dropping 15+ columns with >80% missingness.
- **Leakage diagnosis.** Feature-importance analysis flagged `ListPrice` as a
  leakage feature; removing it preserved inference for off-market properties.

## Results

<!-- Drop the predicted-vs-actual plot and the MAPE-by-price-band chart into
     /public/images/projects/calpriceiq/ and reference them here. -->

- Located over/under-prediction segments by evaluating MAPE / MdAPE across price
  bands on ~30K held-out listings.

## What I'd do next

<!-- TODO -->
