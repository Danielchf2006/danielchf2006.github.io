# danielchf2006.github.io

Personal site for Daniel (Haofan) Cai — resume, projects, and a skills showcase.
Built with [Astro](https://astro.build), statically exported, deployed to GitHub
Pages via GitHub Actions on every push to `main`.

## Run it

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # static site -> dist/
npm run preview    # serve the built dist/
npm run check      # type + content-schema check
```

Requires Node 20+ (Node 24 is fine locally).

## Where things live

```
src/
  data/
    site.ts         name, role, tagline, socials, nav, resume path  <- edit me first
    education.ts     schools + coursework
    skills.ts        the Skills page (groups, chips, "proof" links)
  content/
    experience/*.md  one file per role  -> rendered on /experience
    projects/*.md    one file per project -> /projects/<slug>
  content.config.ts  frontmatter schema for both collections
  components/         Nav, Footer, SocialBar, ProjectCard, ExperienceItem,
                     SkillGroup, SectionHeading, GlitchText
  layouts/           BaseLayout (every page), ProjectLayout (project pages)
  pages/
    index.astro          About / intro
    experience.astro     Resume (education + work) + PDF download
    projects/index.astro Project grid
    projects/[...slug].astro  Individual project page
    skills.astro         Skills showcase
    404.astro
  styles/
    tokens.css       all colors / type / spacing — single source of truth
    global.css       base element styles

public/
  resume/            drop Daniel-Cai-Resume.pdf here (see its README)
  images/            all imagery, organized by section (see its README)
  favicon.svg
```

## Adding a project

1. `src/content/projects/my-project.md` — fill the frontmatter (see an existing
   file for the full shape).
2. `public/images/projects/my-project/` — drop `cover.jpg` and any body images.
3. It appears on `/projects` automatically. Set `featured: true` to also surface
   it on the homepage; `order` controls sorting.

## Adding a role

`src/content/experience/my-role.md` — frontmatter only is enough (the bullets
render from `highlights`). The Markdown body is optional extra context.

## Theming

Light is the default; the Nav has a light/dark toggle (persisted in
`localStorage`). Project page heroes use `.dark-block`, which forces the dark
palette regardless of the page theme — that's the "dark accent" in the hybrid
look. All palette values are in `src/styles/tokens.css`.

## Deploying

1. Create a GitHub repo named exactly `danielchf2006.github.io`.
2. Push this folder to its `main` branch.
3. Repo → Settings → Pages → Build and deployment → Source: **GitHub Actions**.
4. Every push to `main` builds and deploys via `.github/workflows/deploy.yml`.

Live at https://danielchf2006.github.io once the first run finishes.
