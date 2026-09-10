/**
 * Hover glitch — cheap, event-driven.
 *
 * At load we wrap every word in a <span class="w">. Hovering a word swaps it
 * to the pixel font, throws a short glyph-scramble with a violet chromatic
 * split, then holds the real word (still pixel) until the cursor leaves —
 * then it snaps back. Nothing persists.
 *
 * No pointermove polling, no caret APIs, no per-frame layout reads: the only
 * work is one class toggle + a ~200ms scramble on the single word you touch.
 * Opt a subtree out with [data-no-glitch].
 */

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789§#%&/\\<>=+*?!{}[]".split("");
const rnd = () => GLYPHS[(Math.random() * GLYPHS.length) | 0];

const reduce =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const SKIP_TAGS = new Set([
  "SCRIPT",
  "STYLE",
  "NOSCRIPT",
  "CODE",
  "PRE",
  "TEXTAREA",
]);

function wrapWords(root: HTMLElement) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(n) {
      if (!n.nodeValue || !n.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
      const p = n.parentElement;
      if (!p) return NodeFilter.FILTER_REJECT;
      if (SKIP_TAGS.has(p.tagName)) return NodeFilter.FILTER_REJECT;
      if (
        p.classList.contains("w") ||
        p.classList.contains("px") ||
        p.classList.contains("glitch") ||
        p.closest("[data-no-glitch]")
      )
        return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  const nodes: Text[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);

  for (const node of nodes) {
    const parts = (node.nodeValue ?? "").split(/(\s+)/);
    if (parts.length < 2) continue;
    const frag = document.createDocumentFragment();
    for (const part of parts) {
      if (!part) continue;
      if (/^\s+$/.test(part)) {
        frag.appendChild(document.createTextNode(part));
      } else {
        const s = document.createElement("span");
        s.className = "w";
        s.textContent = part;
        frag.appendChild(s);
      }
    }
    node.parentNode?.replaceChild(frag, node);
  }
}

let active: HTMLElement | null = null;
let raf = 0;
let timer = 0;

function deglitch(w: HTMLElement) {
  clearTimeout(timer);
  cancelAnimationFrame(raf);
  const real = w.dataset.w;
  if (real !== undefined) w.textContent = real;
  w.classList.remove("px", "glitching");
  if (active === w) active = null;
}

function glitch(w: HTMLElement) {
  active = w;
  const target = w.textContent ?? "";
  w.dataset.w = target;
  // Monocraft is monospace, so once the word swaps to it the width is fixed —
  // the scramble frames cause no reflow. Only the font swap moves anything,
  // once in and once out, for this single word.
  w.classList.add("px", "glitching");

  const frames = 6;
  let frame = 0;
  const tick = () => {
    if (active !== w) return;
    frame++;
    if (frame >= frames) {
      w.textContent = target; // real word, still pixel + split while hovered
      return;
    }
    const lock = (frame / frames) * target.length;
    w.textContent = target
      .split("")
      .map((c, i) => (i < lock ? c : rnd()))
      .join("");
    timer = window.setTimeout(() => {
      raf = requestAnimationFrame(tick);
    }, 34);
  };
  tick();
}

if (!reduce) {
  const start = () => {
    const main = document.querySelector("main");
    if (main) wrapWords(main as HTMLElement);
    const nav = document.querySelector("header");
    if (nav) wrapWords(nav as HTMLElement);

    document.addEventListener("pointerover", (e) => {
      const t = e.target as HTMLElement;
      if (t.tagName === "IMG" || t.closest?.(".hoverimg")) {
        const img =
          t.tagName === "IMG"
            ? t
            : (t.closest(".hoverimg")?.querySelector("img") as HTMLElement | null);
        if (img && !img.closest("[data-no-glitch]")) {
          img.classList.add("img-glitched");
          t.closest(".hoverimg")?.dispatchEvent(new Event("mouseenter"));
        }
        return;
      }
      const w = t.closest?.(".w") as HTMLElement | null;
      if (!w || w === active) return;
      if (active) deglitch(active);
      glitch(w);
    });

    document.addEventListener("pointerout", (e) => {
      const t = e.target as HTMLElement;
      if (t.tagName === "IMG") {
        t.classList.remove("img-glitched");
        return;
      }
      const w = t.closest?.(".w") as HTMLElement | null;
      if (w && w === active) deglitch(w);
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
}

export {};
