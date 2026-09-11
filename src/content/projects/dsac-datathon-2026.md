---
title: "2026 DSAC Datathon: What Actually Drives a Cheesesteak Shop's Yelp Rating"
summary: LassoCV on Yelp review sentiment + business attributes for Philly cheesesteak restaurants — CV R² 0.71. Team of 5, 3rd place.
order: 5
featured: true
role: Team Member — "Philly Cheesesteaks" (5-person team)
org: DSAC Datathon
dates: Jan 2026
location: Evanston, IL
stack: [Python, Pandas, scikit-learn, NLTK / VADER, XGBoost, Tableau]
metrics:
  - { label: "Placement", value: "3rd" }
  - { label: "Reviews analyzed", value: "967K+" }
  - { label: "CV R²", value: "0.71" }
  - { label: "Businesses", value: "14.6K" }
# add public/images/projects/dsac-datathon-2026/cover.jpg then uncomment:
# cover: cover.jpg
coverAlt: "DSAC Datathon — cheesesteak restaurant rating model"
links:
  - { label: "Slide deck", href: "https://danielchf2006.github.io/decks/dsac-datathon-2026.pdf" }
draft: false
---

## Problem

The restaurant industry is brutally competitive, and reviews mix genuine
customer sentiment with structural business factors that have nothing to do
with the food. Our team — Ray, Courtney, Yihan, Angelina, and me — picked a
narrow, well-defined slice of that question for the 24-hour datathon: **for
Philadelphia-area cheesesteak restaurants specifically, what actually moves
a Yelp star rating**, and can that answer turn into something a shop owner
can act on?

## Approach

**Data.** The Yelp Open Dataset — `businesses.csv` (14,569 rows) and
`reviews.csv` (967,552 rows) — filtered down to cheesesteak restaurants.
Missing hours (19%) and attributes (8%) were the noisiest columns; missing
values were imputed as `0` rather than a mean, since we couldn't establish
they were missing at random and didn't want to manufacture a signal.

**Turning review text into a feature.** Every review got scored with
`nltk`'s VADER `SentimentIntensityAnalyzer` — a lexicon-and-rules sentiment
tool that reads emphasis (capitalization, exclamation points) and negation
("not good") without needing any training data, well-suited to short,
informal review text. Those per-review scores were aggregated to
business-level features (`sent_compound_mean`, `sent_pos_mean`,
`sent_neg_mean`, and their spread). Business attributes (`BYOB`,
`DietaryRestrictions.halal`, `Open24Hours`, parking type, ambience tags,
and more) were one-hot encoded alongside them.

**Model.** `LassoCV` linear regression — chosen deliberately over a more
flexible model, because Lasso's L1 penalty zeroes out uninformative
coefficients rather than just shrinking them, which is exactly the
sparse-feature-selection behavior it's known for in genomics and other
high-dimensional biological data. With a review-derived feature space this
noisy, we wanted a model that would tell us which handful of signals
actually mattered rather than spreading small weight across all of them.
Regularization strength was tuned with **nested cross-validation** — a
5-fold inner loop to pick the penalty, wrapped in a 5-fold outer loop to
report a metric that was never used to choose that penalty — so the
reported accuracy isn't inflated by the same folds that tuned the model.
All features were standardized first, so coefficients stay directly
comparable to each other.

## Results

**CV RMSE 0.4045 ± 0.0193, CV R² 0.7083 ± 0.0423** — a strong result for a
linear model on review-derived data this noisy, and the sparsity from Lasso
made the answer legible rather than just accurate:

| Feature | Coefficient | Reads as |
|---|---:|---|
| `sent_compound_mean` | +0.237 | Overall review positivity — the single strongest driver |
| `sent_pos_mean` | +0.178 | Share of positive language in reviews |
| `sent_neg_mean` | −0.172 | Share of negative language — mirrors the positive effect |
| `sent_compound_std` | −0.100 | Inconsistent sentiment (some raves, some pans) hurts even at a fixed average |
| `word_len_mean` | −0.066 | Longer reviews skew less favorable |
| `latitude` | −0.046 | A small residual geographic effect |

**Customer sentiment dominates everything else.** The two strongest
predictors by a wide margin are both sentiment features; every non-text
business attribute we tested — parking type, BYOB, dog-friendliness,
ambience tags — correlated with rating at strength well under 0.3.
`DriveThru` was the one outlier at −0.61, though with a sample that small
for a sit-down cuisine like cheesesteaks, we treated that as a data-quirk
worth flagging rather than a recommendation.

**The two models we ran on operating hours disagreed, and that
disagreement was itself informative.** For a secondary question — does
*when* a shop is open predict its rating — we ran both a linear model and
XGBoost on the same five hours-related features. Linear regression said
more total weekly hours correlates positively with rating (+0.55 std coef)
while more hours *per day* correlates negatively (−0.46); XGBoost's
feature-importance ranking put `avg_hours_day` and `n_reviews` above
`total_hours_week` entirely. The two models weren't just noisier or
cleaner versions of each other — they emphasized genuinely different
features, which told us this sub-question needed more data before either
model's story should be trusted.

**We also mapped it.** Plotting cheesesteak locations colored by rating
against a Philadelphia housing-affordability map hinted at a
neighborhood-income relationship worth a follow-up regression — we didn't
have time to formalize it into the model during the datathon, so it stayed
a visual observation for the judges rather than a claimed result.

**The recommendation we actually gave:** there's no shortcut. The
data says, plainly, that the customer experience *is* the product —
prioritize service quality, because it outweighs every structural lever
(location, hours, amenities) we tested combined.

## What I'd do next

- Formalize the location/income relationship the map surfaced into an
  actual feature (e.g., neighborhood median income joined by geography)
  instead of leaving it as a visual observation.
- Reconcile the linear-vs-XGBoost disagreement on operating hours with a
  larger sample — right now it's a genuine open question, not a resolved
  one.
- Swap VADER for a fine-tuned transformer sentiment model and see how much
  of the 0.71 R² is VADER's lexicon-matching ceiling versus genuine signal
  in the reviews.
