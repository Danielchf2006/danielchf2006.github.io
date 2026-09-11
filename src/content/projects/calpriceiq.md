---
title: CalPriceIQ
summary: An XGBoost close-price model for 397K+ California MLS listings — segmented by price band, with a spatial-features fix for an inefficient use of lat/long.
order: 1
featured: true
role: Data Science Intern
org: IDXExchange
dates: Jun 2026 – Present
location: Boise, ID
stack: [Python, Pandas, NumPy, scikit-learn, XGBoost, GeoPandas, Streamlit, SQL, Seaborn, Matplotlib]
metrics:
  - { label: "Listings", value: "397K+" }
  - { label: "R²", value: "0.90" }
  - { label: "MAPE", value: "11.75%" }
  - { label: "Features", value: "82" }
# add public/images/projects/calpriceiq/cover.jpg then uncomment:
# cover: cover.jpg
coverAlt: "CalPriceIQ model — predicted vs. actual close price"
links:
  - { label: "Code", href: "https://github.com/Danielchf2006/CA-Property-price-modeling" }
# demoEmbed: "https://public.tableau.com/views/your-viz"
compare:
  caption: "With vs. without the leakage feature"
  beforeLabel: "ListPrice included"
  afterLabel: "ListPrice removed"
  # drop these two into public/images/projects/calpriceiq/ when ready:
  # before: /images/projects/calpriceiq/with-leakage.png
  # after: /images/projects/calpriceiq/without-leakage.png
draft: false
---

## Problem

IDXExchange needed to estimate a home's likely close price directly from
CRMLS listing data — including for **off-market properties**, where the one
feature that correlates almost 1:1 with the sale price (`ListPrice`) doesn't
exist. That constraint shaped the whole project: the model has to earn its
accuracy from the property itself and its market context, not from a price
someone already typed in.

## Approach

**Data.** Six-plus months of `CRMLSSold` records pulled via FTP from IDX's
server, merged into one ~397K-row frame and filtered to single-family
residential. Early exploration surfaced genuinely broken raw rows — lot
sizes up to 2 billion sq ft, bathroom counts up to 3,000 — that get filtered
before anything downstream trusts them.

**Preprocessing, done to survive a temporal split.** The test set is the
single most recent month; everything before it is training data — never a
random shuffle, since a random split would leak future market conditions
into training. `ListPrice` / `OriginalListPrice` get dropped as leakage
(near 1:1 with the target, and absent for the off-market case IDX actually
cares about). One bug worth naming: an early year filter was accidentally
wrapped in `[...]`, turning it into an always-truthy one-item list that had
silently never excluded anything — caught and fixed before it could quietly
bias every downstream notebook.

**Baselines, built to stay comparable.** Linear regression, a depth-10
decision tree, and a 200-tree random forest — all on the *same* engineered
features, imputation, and encoding, fit strictly on the training fold so
nothing about the test month leaks into a scaler or an imputed value. The
forest cleanly beat the tree (R² 0.70 vs. 0.64), which set the bar XGBoost
had to clear.

**Feature engineering.** Ratio/age features (`bed_bath_ratio`,
`property_age`), a 25-cluster KMeans over lat/long for a neighborhood price
level, and a school-district price level joined from CA district shapefiles
— across 82 total columns after dropping 15+ with >80% missingness.

**XGBoost, tuned in two stages instead of one blind grid search:** early
stopping against a validation split to pick `n_estimators` at a small fixed
learning rate, then `RandomizedSearchCV` over tree depth and regularization
with that count held fixed. The winning config gets refit on the full
training set for the final comparison.

## Results

**Segmentation beat a single global model.** A pooled XGBoost over the whole
dataset scores R² ≈ 0.91 — but that number is dominated by the `$2M+` tail.
Splitting into four price bands and training a **separate model per band**
told a truer story, and cut error substantially on the two bands that hold
~74% of the data:

| Price band | n | Pooled MAE | Segmented MAE | Segmented R² |
|---|---:|---:|---:|---:|
| `<$500K` | 1,633 | — | $33.9K | 0.63 |
| `$500K–$1M` | 4,893 | $71.3K | $48.9K | 0.77 |
| `$1M–$2M` | 3,748 | $153.7K | $116.7K | 0.68 |
| `$2M+` | 1,616 | — | $431.3K | 0.71 |

Sample-weighting those two focus bands 2× inside one model — the cheaper
fix — only recovered a few percent. Training a dedicated model per band cut
MAE by roughly 30% on both. That gap is the headline finding: for a metric
that a business will actually read, *how* you handle heterogeneity in the
target matters more than which single model you pick.

**The model was using location inefficiently.** Permutation importance
ranked `Latitude`/`Longitude` as the top two features by impact — but gain
importance ranked them low. XGBoost was approximating a smooth spatial
price surface through many diluted, shallow splits instead of anything
resembling "similar homes nearby." Three purpose-built spatial features
fixed that: a 15-nearest-neighbor comp price and dispersion, a ~2km price
grid (shrunk toward the global mean in sparse cells), and local listing
density — each computed **train-only**, with leave-one-out logic so a
training row never sees its own contribution. That recovered another 3–4%
MAE, concentrated in the `$1M–$2M` band.

**Leakage, confirmed the right way.** Feature-importance analysis flagged
`ListPrice` as dominating every model that included it. Removing it dropped
in-sample accuracy but is what makes the model usable on the actual target
population — off-market properties that never had a list price to begin
with.

The results feed a small **Streamlit dashboard** (model comparison, feature
importance, a spatial error map) that reads only precomputed CSVs — it never
loads XGBoost or retrains on page load, so it stays fast and doesn't need
the training environment to demo.

## What I'd do next

- Push the spatial features further — the comp-price/grid features helped
  most in the band where they had the most usable comps; a finer grid or a
  proper kriging-style smoother might close more of the `$1M–$2M` gap.
- Investigate the `<$500K` and `$2M+` bands specifically — they have the
  fewest listings and the widest error, and probably need band-specific
  feature engineering rather than the same 82 columns as the middle bands.
- Wire the per-listing spatial error map into a monitoring view so IDX can
  see *where* the model is degrading as new months of data arrive, not just
  the aggregate metric.
