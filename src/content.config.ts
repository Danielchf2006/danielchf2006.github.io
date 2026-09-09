import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

/**
 * Two content collections, each a folder of Markdown files:
 *
 *   src/content/projects/<slug>.md    -> /projects/<slug>
 *   src/content/experience/<slug>.md  -> rendered on /experience
 *
 * Add a file, fill the frontmatter, drop images in the matching
 * /public/images/... folder, and it shows up automatically.
 */

const projects = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/projects" }),
  schema: z.object({
    title: z.string(),
    // one-line summary for cards and previews
    summary: z.string(),
    // ordering on the projects grid — lower shows first
    order: z.number().default(99),
    featured: z.boolean().default(false),
    role: z.string().optional(),
    org: z.string().optional(),
    dates: z.string().optional(),
    location: z.string().optional(),
    // shown as pills on the card
    stack: z.array(z.string()).default([]),
    // headline metrics: { label: "R²", value: "0.90" }
    metrics: z
      .array(z.object({ label: z.string(), value: z.string() }))
      .default([]),
    // path under /public/images/projects/<slug>/ — cover for cards + hero
    cover: z.string().optional(),
    coverAlt: z.string().default(""),
    links: z
      .array(z.object({ label: z.string(), href: z.string().url() }))
      .default([]),
    // optional embedded demo (iframe): a Tableau Public / notebook / app URL
    demoEmbed: z.string().url().optional(),
    // optional before/after slider, rendered after the write-up.
    // paths are relative to /public (e.g. /images/projects/<slug>/pred.jpg)
    compare: z
      .object({
        before: z.string().optional(),
        after: z.string().optional(),
        beforeLabel: z.string().default("Before"),
        afterLabel: z.string().default("After"),
        caption: z.string().optional(),
      })
      .optional(),
    draft: z.boolean().default(false),
  }),
});

const experience = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/experience" }),
  schema: z.object({
    org: z.string(),
    role: z.string(),
    location: z.string(),
    // sortable start date, e.g. "2026-01"
    start: z.string(),
    // e.g. "2026-07" or "Present"
    end: z.string(),
    // human-readable range shown in the UI
    dates: z.string(),
    order: z.number().default(99),
    // short bullets — the resume lines, lightly edited for the web
    highlights: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
  }),
});

export const collections = { projects, experience };
