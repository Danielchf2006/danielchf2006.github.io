---
org: Zenitera Funds Co.
role: Data Science & Intelligence — Policy Risk Analyst Intern
location: Remote / Shanghai, China
start: "2026-06"
end: Present
dates: Jun 2026 – Present
order: 3
tags: [LLM Pipelines, Taxonomy Design, Python Parsing, Model A/B Testing]
highlights:
  - Building an LLM pipeline that classifies contracts into 14 types and flags clause risks against legal and company guidelines.
  - Engineered a Python parser (docx → JSONL) segmenting contracts into clause blocks with 100% text coverage.
  - Hand-labeling ground-truth samples to train a future contract-review model; ran A/B testing comparing Kimi k3 and Opus 5.
  - Reverse-engineered a 26-category contract taxonomy by mining clause-label patterns from legacy reviewer annotations.
---

The full pipeline — parsing, taxonomy classification, and the playbook-mining
system that predicts reviewer comments — is written up as the
[Contract Review LLM Pipeline](/projects/zenitera-contracts) project,
including a leave-one-out evaluation against real redlined contracts.
