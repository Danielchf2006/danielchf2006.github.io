---
org: IDXExchange
role: Data Science Intern
location: Boise, ID
start: "2026-06"
end: Present
dates: Jun 2026 – Present
order: 4
tags: [XGBoost, Feature Engineering, Leakage Detection, Tableau, SQL]
highlights:
  - Built an XGBoost close-price model on 397K+ California MLS listings — R² 0.90, MAPE 11.75%.
  - Designed a temporal train/test split (most-recent-month holdout) to stop look-ahead leakage in time-series housing data.
  - Engineered preprocessing across 82 features — median/mode imputation, one-hot and ordinal encoding, amenity-text parsing into binary indicators, log-transforms of skewed price/area variables, and dropping 15+ columns with >80% missingness.
  - Diagnosed ListPrice as a leakage feature via feature-importance analysis; removing it preserved inference for off-market properties.
  - Located over/under-prediction segments by evaluating MAPE / MdAPE across price bands on ~30K held-out listings.
---

<!-- The model from this internship is written up as a project:
     [CalPriceIQ](/projects/calpriceiq). -->
