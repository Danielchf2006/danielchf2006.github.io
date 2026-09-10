/**
 * Cursor-local text/image glitch — active ONLY while hovered.
 *
 * Move the pointer over the page and:
 *  - text: the ~8 characters where the cursor entered an element flip to the
 *    Monocraft pixel font and churn through glyphs with a violet chromatic
 *    split, holding while the cursor stays anywhere on that element. Leave the
 *    element and they snap straight back to normal.
 *  - images: get a chromatic ghost that clears the moment the cursor leaves.
 *
 * The real text is never lost: a transient <span class="px"> is spliced in
 * around the touched characters and removed on exit, merging the text node
 * back exactly as it was. Opt any subtree out with [data-no-glitch].
 */

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789§#%&/\\<>=+*?!{}[]".split("");
const RADIUS = 4; // chars each side of the entry point
const CHURN_MS = 45; // ms between scramble frames
const SETTLE_MS = 300; // churn hard for this long, then hold the real text
const MOVE_THROTTLE = 40;
const EXIT_GRACE = 80; // ms grace after leaving, so word-gaps don't flicker

const reduce =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const rnd = <T>(a: T[]) => a[(Math.random() * a.length) | 0];

type Patch = {
  parent: HTMLElement;
  before: Text;
  span: HTMLSpanElement;
  after: Text;
  orig: string;
  timer: number;
};

let patch: Patch | null = null;
let glitchedImg: HTMLImageElement | null = null;
let exitTimer = 0;

function caretFromPoint(
  x: number,
  y: number,
): { node: Text; offset: number } | null {
  const doc = document as Document & {
    caretPositionFromPoint?: (
      x: number,
      y: number,
    ) => { offsetNode: Node; offset: number } | null;
    caretRangeFromPoint?: (x: number, y: number) => Range | null;
  };
  let node: Text | null = null;
  let offset = 0;
  if (doc.caretPositionFromPoint) {
    const pos = doc.caretPositionFromPoint(x, y);
    if (pos && pos.offsetNode.nodeType === Node.TEXT_NODE) {
      node = pos.offsetNode as Text;
      offset = pos.offset;
    }
  } else if (doc.caretRangeFromPoint) {
    const range = doc.caretRangeFromPoint(x, y);
    if (range && range.startContainer.nodeType === Node.TEXT_NODE) {
      node = range.startContainer as Text;
      offset = range.startOffset;
    }
  }
  if (!node) return null;

  // caretPositionFromPoint snaps to the NEAREST text even when the point is
  // in empty space — verify the cursor is actually over a glyph
  const len = node.nodeValue?.length ?? 0;
  const r = document.createRange();
  r.setStart(node, Math.min(offset, Math.max(0, len - 1)));
  r.setEnd(node, Math.min(offset + 1, len));
  const box = r.getBoundingClientRect();
  if (
    x < box.left - 6 ||
    x > box.right + 6 ||
    y < box.top - 3 ||
    y > box.bottom + 3
  )
    return null;

  return { node, offset };
}

function eligible(parent: Element | null): parent is HTMLElement {
  if (!parent) return false;
  const tag = parent.tagName;
  if (tag === "SCRIPT" || tag === "STYLE" || tag === "NOSCRIPT") return false;
  if (parent.classList.contains("px")) return false;
  if (parent.closest("[data-no-glitch]")) return false;
  return true;
}

function restorePatch() {
  if (!patch) return;
  clearInterval(patch.timer);
  const { parent, before, span, after, orig } = patch;
  if (span.parentNode === parent) {
    parent.replaceChild(document.createTextNode(orig), span);
    if (before.parentNode === parent) parent.removeChild(before);
    if (after.parentNode === parent) parent.removeChild(after);
    parent.normalize();
  }
  patch = null;
}

function makePatch(node: Text, offset: number) {
  const parent = node.parentElement;
  if (!eligible(parent)) return;
  const text = node.nodeValue ?? "";
  const start = Math.max(0, offset - RADIUS);
  const end = Math.min(text.length, offset + RADIUS);
  const slice = text.slice(start, end);
  if (!slice.trim()) return;

  const before = document.createTextNode(text.slice(0, start));
  const after = document.createTextNode(text.slice(end));
  const span = document.createElement("span");
  span.className = "px glitching";
  span.textContent = slice;
  parent.replaceChild(after, node);
  parent.insertBefore(span, after);
  parent.insertBefore(before, span);

  const startedAt = performance.now();
  const timer = window.setInterval(() => {
    const settle = (performance.now() - startedAt) / SETTLE_MS;
    span.textContent = slice
      .split("")
      .map((ch, i) =>
        ch === " " ? " " : i / slice.length < settle - 0.15 ? ch : rnd(GLYPHS),
      )
      .join("");
  }, CHURN_MS);

  patch = { parent, before, span, after, orig: text, timer };
}

function onImage(el: Element) {
  const img =
    el.tagName === "IMG"
      ? (el as HTMLImageElement)
      : (el.closest(".hoverimg")?.querySelector("img") as HTMLImageElement | null);
  if (!img || img.closest("[data-no-glitch]")) return;
  if (glitchedImg && glitchedImg !== img) glitchedImg.classList.remove("img-glitched");
  if (img !== glitchedImg) {
    img.classList.add("img-glitched");
    el.closest(".hoverimg")?.dispatchEvent(new Event("mouseenter"));
    glitchedImg = img;
  }
}

function clearImage() {
  if (glitchedImg) {
    glitchedImg.classList.remove("img-glitched");
    glitchedImg = null;
  }
}

if (!reduce) {
  let last = 0;
  window.addEventListener(
    "pointermove",
    (e) => {
      if (e.pointerType === "touch") return;
      const now = performance.now();
      if (now - last < MOVE_THROTTLE) return;
      last = now;

      const el = document.elementFromPoint(e.clientX, e.clientY);

      // --- image hover ---
      if (el && (el.tagName === "IMG" || el.closest(".hoverimg"))) {
        clearTimeout(exitTimer);
        restorePatch();
        onImage(el);
        return;
      }
      clearImage();

      // --- still hovering the current patch's element? keep it. ---
      if (
        patch &&
        el &&
        (el === patch.span ||
          patch.span.contains(el) ||
          patch.parent === el ||
          patch.parent.contains(el))
      ) {
        clearTimeout(exitTimer);
        return;
      }

      // --- moved somewhere new ---
      const caret = caretFromPoint(e.clientX, e.clientY);
      if (caret && eligible(caret.node.parentElement)) {
        clearTimeout(exitTimer);
        restorePatch();
        makePatch(caret.node, caret.offset);
      } else if (patch) {
        clearTimeout(exitTimer);
        exitTimer = window.setTimeout(restorePatch, EXIT_GRACE);
      }
    },
    { passive: true },
  );

  window.addEventListener("pointerleave", () => {
    restorePatch();
    clearImage();
  });
  document.addEventListener("scroll", () => restorePatch(), { passive: true });
}
