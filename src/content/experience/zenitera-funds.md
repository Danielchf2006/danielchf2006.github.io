---
org: Zenitera Funds Co.
role: Data Science & ML Development Intern
location: Remote / Shanghai, China
start: "2025-11"
end: "2026-03"
dates: Nov 2025 – Mar 2026
order: 4
tags: [LLM Pipelines, Taxonomy Design, Document Parsing, Model Eval / Benchmarking]
highlights:
  - Built an LLM contract-review agent that segments contracts into clauses, classifies them against a 28-category taxonomy (17 regulatory + 11 company-specific), and auto-generates Word comment bubbles flagging risks for legal-team review.
  - Engineered a 4-stage Python pipeline (docx XML parsing → clause segmentation → classification → risk prediction) parsing 320 contract clauses at 100% text coverage; fixed parser bugs, recovering 90% of lost reviewer comments from the test set.
  - Induced 34 review patterns from 62 human-redlined clauses across 139 official checklist items, replacing an 8-rule playbook.
  - Designed an eval framework to benchmark Qwen vs. Claude on a 69-block hand-labeled gold set with leave-one-out validation.
---

The full pipeline — parsing, taxonomy classification, and the playbook-mining
system that predicts reviewer comments — is written up as the
[Contract Review LLM Pipeline](/projects/zenitera-contracts) project,
including a leave-one-out evaluation against real redlined contracts.
