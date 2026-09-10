# Intro animation

The full-screen clip that plays when someone enters the site.

## Add your clip

1. Drop the file here, e.g. `intro.gif`, `intro.webp`, or `intro.mp4`.
2. In `src/data/site.ts`, set `intro.src` to `/intro/<filename>` and set
   `intro.durationMs` to roughly the length of the clip in milliseconds.

```ts
intro: {
  enabled: true,
  src: "/intro/intro.mp4",
  durationMs: 3000,
  showOncePerSession: true,   // false = replays on every page load
  pixelated: true,            // crisp-scale (good for pixel art)
},
```

## Format notes

- **`.mp4` / `.webm`** are dramatically smaller than a GIF for the same length
  and quality — prefer these. They're muted + autoplay + inline.
- **`.gif` / `.webp` / `.apng`** also work; keep them under ~2–3 MB.
- The overlay auto-dismisses after `durationMs`, or immediately on click, any
  key, scroll, or the "skip →" button.
- Reduced-motion visitors and repeat visits within the same session skip it
  entirely (no flash — decided before first paint).
- With `src: ""` a built-in animated placeholder shows instead, so the flow is
  testable before the real clip exists.
