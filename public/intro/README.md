# Intro

The entry animation is a **coded CRT boot sequence** — no assets. Everything
lives in `src/components/IntroOverlay.astro`:

- the boot log lines are the `BOOT` array (edit to taste)
- the mini regression chart is seeded inline SVG
- exit is the pixel-mosaic dissolve

Toggle it in `src/data/site.ts`:

```ts
intro: {
  enabled: true,
  showOncePerSession: true,   // false = replays on every page load
}
```

Reduced-motion visitors and repeat visits within a session skip it entirely
(decided before first paint, no flash). This folder is otherwise unused.
