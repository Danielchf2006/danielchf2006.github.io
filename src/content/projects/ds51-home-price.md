---
title: "California Home Price Predictor — DS51 Capstone"
summary: A 6-person Northwestern DS 51 capstone sponsored by IDX Exchange — I led the modeling pipeline end to end, through a judged final presentation and a live Streamlit app.
order: 1.5
featured: true
role: Team Member — 6-Person Capstone Team
org: "Northwestern DS 51 (sponsor: IDX Exchange)"
dates: Summer 2026
location: Evanston, IL
stack: [Python, Pandas, LightGBM, XGBoost, scikit-learn, Streamlit, Census Geocoder API]
metrics:
  - { label: "Team size", value: "6" }
  - { label: "Test R²", value: "0.91" }
  - { label: "Monthly retrains", value: "23" }
  - { label: "Listings", value: "320K+" }
cover: app-screenshot.png
coverAlt: "The team's live Streamlit app — CA Property Price Predictor, address in, estimate out"
links:
  - { label: "Slide deck", href: "https://danielchf2006.github.io/decks/ds51-home-price-predictor.pptx" }
draft: false
---

This is a related but separate effort from [CalPriceIQ](/projects/calpriceiq) — my
own solo exploration of the same kind of problem at IDXExchange. This one is
a 6-person Northwestern **DS 51** capstone (Daniel Kim, Yuuna Wang, Jennifer
Hu, Leon Huang, Emma Gurevich, and me), sponsored by IDX Exchange, that ran
the same idea through a full team pipeline, a judged final presentation, and
a deployed app. I led the modeling — baseline through final model selection
— while the team built the case together and presented it to a judge panel
at the end of the term.

## Problem

Build a model to predict a California single-family home's final
`ClosePrice` from its property characteristics, packaged as something a
buyer, seller, or the sponsoring business could actually use — not just a
notebook metric. The team framed three concrete goals going in: evaluate how
different models perform across price bands, identify which property
features actually drive price, and ship something usable.

## Approach

**Data.** 636,443 raw CRMLS/Trestle MLS sold-listing records, filtered to
`PropertyType = Residential` / `PropertySubType = SingleFamilyResidence` and
cleaned down to 320,506 rows — dropping agent/brokerage identifiers and
commercial fields, columns over 60% missing, duplicate rows, and rows
missing a close price. The bottom and top 0.5 percentile of price were
trimmed as outliers, with the trim boundaries learned from the training
window only, then applied to validation/test — never fit on data the model
would later be judged against.

<div class="img-pair">
<img src="/images/projects/ds51-home-price/living-area-vs-price.png" alt="Living area square feet vs close price scatter plot across the full dataset">
<img src="/images/projects/ds51-home-price/price-band-distribution.png" alt="Distribution of California homes by close price band — 43.7% fall in the 500K-1M range">
</div>

**Train/validation/test, split on time, not randomly.** 24 months of
training data (April 2024–March 2026, 263,552 rows), April 2026 as
validation (11,872 rows), May 2026 as a held-out test month (11,876 rows) —
so the reported accuracy reflects predicting the future from the past, the
way the model would actually be used.

**A coordinate bug worth naming.** Rather than assume raw MLS lat/long were
trustworthy, the team explicitly checked: flag a row if its coordinate was
missing, *or* shared by 5+ other rows — a rule general enough to catch any
placeholder cluster, not just a hardcoded list of known-bad points. That
caught 2,653 of 320,506 rows (0.8%), including 107 rows all silently sitting
on the same fake point in Hemet. The fix used the Census Bureau's free bulk
geocoder (up to 10,000 addresses per request, no API key, versus one row at
a time with a mandatory delay elsewhere) — 820 of the flagged rows got a
corrected coordinate; 1,835 unmatched rows kept their original, still-
suspect value rather than being dropped. Isolating the effect honestly: it
barely moved model accuracy (Random Forest R² +0.0005, Linear Regression
+0.0001, Decision Tree −0.0083) — because only 0.8% of rows were flagged and
just 0.26% were actually correctable. Worth doing, and worth reporting
accurately instead of oversold.

**Feature engineering** added hub distance (haversine to LA/SD/SF), a
ZIP-level median $/sqft comp, high-cardinality location encodings (city,
MLS area, school district), and time-of-sale seasonality — on top of the
standard property fields.

**Two boosted models, tuned and compared head-to-head.** XGBoost (800
trees, depth 6, learning rate 0.03) and LightGBM (800 trees, 127 leaves,
learning rate 0.03, unlimited depth) were each tuned across three
configurations. The training window itself was swept from 3 to 26 months —
validation R² climbed sharply, then flattened, peaking at 24 months
(R² 0.8963) before dipping slightly at 26:

<figure>

![Validation R² across training-window lengths from 3 to 26 months, peaking at 24 months](/images/projects/ds51-home-price/training-window-sweep.png)

<figcaption>More historical data helped — up to a point. 24 months won on
validation R², and going further didn't.</figcaption>
</figure>

## Results

| Model | Test R² | Test MAE | Test MAPE | Test MdAPE |
|---|---:|---:|---:|---:|
| Linear Regression | 0.816 | $252,475 | 23.90% | 16.64% |
| Decision Tree | 0.787 | $224,990 | 16.43% | 10.79% |
| Random Forest | 0.897 | $156,842 | 11.53% | 7.57% |
| XGBoost | 0.902 | $159,349 | 11.96% | 8.34% |
| **LightGBM (final)** | **0.909** | **$152,550** | **11.55%** | **7.97%** |

LightGBM narrowly beat XGBoost on every metric and became the model behind
the deployed app. Feature importance confirmed the intuitive story with a
sharper edge than expected: `LivingArea` and `LotSizeSquareFeet` led, but
**hub distance (8.1%) and the ZIP price comp (7.2%) each individually
outranked latitude (6.2%) and longitude (6.1%)** — the engineered location
features earned their keep over the raw coordinates.

<figure>

![LightGBM top 12 feature groups by share of total split gain — LivingArea and LotSizeSquareFeet lead, hub distance and ZIP price comp outrank raw lat/long](/images/projects/ds51-home-price/lightgbm-feature-groups.png)

<figcaption>The final model's feature-group breakdown. Accuracy itself still
varies by county — roughly 10% MAPE in some, over 20% in Lake and Santa Cruz
counties among others.</figcaption>
</figure>

**Stability was tested, not assumed.** Retraining monthly and testing on
the next unseen month, 23 times across two years, kept test R² between
0.894 and 0.920 with no downward trend — evidence this generalizes rather
than getting lucky on one test split. Winter months ran 1–1.5 points worse
on MAPE, read as seasonality rather than model decay.

<figure>

![Walk-forward stability: LightGBM retrained monthly across 23 months, test R2 stays between 0.894 and 0.920 with MAPE and MdAPE holding steady](/images/projects/ds51-home-price/walk-forward-stability.png)

<figcaption>23 monthly retrains, tested each time on the following month —
the model held up rather than relying on one favorable split.</figcaption>
</figure>

**Shipped as a live app**, not just a slide. The fitted pipeline
(imputers, scalers, encoders, model) saves as one object; the app rebuilds
every engineered feature from raw form inputs using the same logic as the
training notebook, and an address lookup (Google Maps, with a free
fallback) autofills latitude/longitude/ZIP so a user only has to type an
address:

<figure>

![The deployed Streamlit app — CA Property Price Predictor, with property details, location lookup, sale timing, and a predicted price with its real error range](/images/projects/ds51-home-price/app-screenshot.png)

<figcaption>Address in, estimate out — with the model's real held-out MAE
shown alongside the prediction, not hidden behind a confident-looking single
number.</figcaption>
</figure>

Getting it deployed surfaced its own honest list of gotchas: a ZIP
price-per-sqft table that had only ever lived in notebook memory had to be
rebuilt and saved as its own file; a form dropdown depended on a file
excluded from git, caught only by testing a fresh clone; `requirements.txt`
had to pin exact versions the model was trained under.

**Presenting it.** The team walked a judge panel through the full pipeline
— data quality choices, the baseline, feature engineering, the XGBoost vs.
LightGBM comparison, and a live run of the app — closing with the README's
explicitly flagged list of what was and wasn't yet verified, rather than
presenting the model as more finished than it was.

## What I'd do next

- Retrain monthly on a real schedule now that the walk-forward test showed
  *when* performance dips (winter) rather than just that it's stable on
  average.
- Push the geocoding fix further — 1,835 flagged rows are still unmatched
  and kept as-is; a second geocoding pass or a different provider might
  recover more of them.
- Investigate the high-MAPE counties (Lake, Santa Cruz, and others) the
  same way CalPriceIQ investigated its worst-performing price bands —
  county-specific error is a pattern, not noise, until proven otherwise.
