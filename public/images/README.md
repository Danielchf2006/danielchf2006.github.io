# Images

Everything in `public/` is served from the site root, so a file at
`public/images/projects/calpriceiq/cover.jpg` is referenced in code as
`/images/projects/calpriceiq/cover.jpg`.

## Folder map

    images/
      profile/     -> headshot / avatar (e.g. profile/daniel.jpg)
      projects/
        calpriceiq/            -> cover.jpg + result charts for that project
        dsac-datathon-2026/    -> cover.jpg + dashboard screenshots
        <new-project-slug>/    -> one folder per project, slug matches
                                 src/content/projects/<slug>.md
      experience/   -> optional screenshots per role (create subfolders as needed)
      art/          -> digital illustration / oil painting pieces
      og/           -> og.png, the 1200x630 social-share preview image

## Wiring an image to a project

1. Put the file in `images/projects/<slug>/`.
2. In `src/content/projects/<slug>.md` frontmatter, set `cover: cover.jpg`
   (filename only — the folder is derived from the slug).
3. For in-body images, reference the full path:
   `![predicted vs actual](/images/projects/calpriceiq/pred-vs-actual.png)`

## Formats

- Photos / screenshots: `.jpg` or `.webp`
- Diagrams / charts with text: `.png` or `.svg`
- Aim for < 300 KB each; resize to ~1600px wide max.
