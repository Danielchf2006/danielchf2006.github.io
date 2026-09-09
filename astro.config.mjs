// @ts-check
import { defineConfig } from "astro/config";

// User site: served at the domain root, so no `base` is needed.
// If this ever moves to a project repo, set `base: "/repo-name"`.
export default defineConfig({
  site: "https://danielchf2006.github.io",
  trailingSlash: "ignore",
});
