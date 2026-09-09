/**
 * Skills showcase data.
 *
 * `evidence` links a skill group to the projects / experience that prove it —
 * use the project slug (src/content/projects/<slug>.md) or an external URL.
 * The Skills page renders these as chips that link to the proof.
 */

export type SkillGroup = {
  name: string;
  blurb: string;
  skills: string[];
  evidence: { label: string; href: string }[];
};

export const skillGroups: SkillGroup[] = [
  {
    name: "Machine Learning & Modeling",
    blurb:
      "Supervised models end to end — framing, feature engineering, validation design, error analysis.",
    skills: [
      "XGBoost",
      "Scikit-learn",
      "Logistic Regression",
      "Random Forests",
      "Feature Engineering",
      "Leakage / holdout design",
    ],
    evidence: [
      { label: "CalPriceIQ", href: "/projects/calpriceiq" },
      { label: "GridGate", href: "/experience#gridgate" },
      { label: "DSAC Datathon", href: "/projects/dsac-datathon-2026" },
    ],
  },
  {
    name: "Data Engineering & Pipelines",
    blurb:
      "Getting data from raw source to model-ready: scraping, parsing, schema design.",
    skills: [
      "Python",
      "Pandas",
      "NumPy",
      "SQL",
      "Web scraping",
      "docx → JSONL parsing",
    ],
    evidence: [
      { label: "Zenitera contract parser", href: "/experience#zenitera-funds" },
      { label: "GridGate scrapers", href: "/experience#gridgate" },
    ],
  },
  {
    name: "LLM / Applied AI",
    blurb: "Classification pipelines, evaluation, and prompt/model A/B testing.",
    skills: [
      "LLM classification pipelines",
      "Taxonomy design",
      "Ground-truth labeling",
      "Model A/B testing (Kimi k3 vs Opus 5)",
    ],
    evidence: [
      { label: "Zenitera Funds", href: "/experience#zenitera-funds" },
    ],
  },
  {
    name: "Analysis & Visualization",
    blurb: "Turning findings into dashboards and decks stakeholders act on.",
    skills: ["Tableau", "Matplotlib", "Seaborn", "Excel", "PowerPoint", "R"],
    evidence: [
      { label: "DSAC Datathon", href: "/projects/dsac-datathon-2026" },
      { label: "Fantuan Delivery", href: "/experience#fantuan-delivery" },
    ],
  },
  {
    name: "Economics & Strategy",
    blurb:
      "Market sizing, TAM-SAM-SOM, KPI projection, and risk-scoring frameworks.",
    skills: [
      "Market sizing",
      "TAM-SAM-SOM",
      "KPI modeling",
      "Cost projection",
      "Risk scoring",
    ],
    evidence: [
      { label: "Fantuan Delivery", href: "/experience#fantuan-delivery" },
      { label: "GridGate", href: "/experience#gridgate" },
    ],
  },
];
