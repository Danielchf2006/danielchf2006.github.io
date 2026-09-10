/**
 * Cursor-local, PERSISTENT text/image glitch.
 *
 * As the pointer moves over the page:
 *  - text: the few characters directly under it flip to the Monocraft pixel
 *    font, scramble through glyphs with a violet chromatic split, then settle
 *    back to the real text — but KEEP the pixel font + a frozen split. The
 *    page stays "corrupted" wherever the cursor has been.
 *  - images: get a permanent frozen chromatic ghost.
 *
 * The real text is never lost: a <span class="px"> is spliced in around the
 * touched characters and simply left there once settled. Opt any subtree out
 * with [data-no-glitch].
 */

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789§#%&/\\<>=+*?!{}[]".split("");
const RADIUS = 4; // chars each side of the cursor
const CHURN_MS = 40; // ms between scramble frames
const SETTLE_MS = 420; // ms of churn before it freezes
const REGION_COOLDOWN = 40; // ms before an element sparks again (progressive sweep)
const MOVE_THROTTLE = 40;

const reduce =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const rnd = <T>(a: T[]) => a[(Math.random() * a.length) | 0];
const animating = new Set<Text | Element>();
const cooldownUntil = new WeakMap<Element, number>();

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
  if (doc.caretPositionFromPoint) {
    const pos = doc.caretPositionFromPoint(x, y);
    if (pos && pos.offsetNode.nodeType === Node.TEXT_NODE)
      return { node: pos.offsetNode as Text, offset: pos.offset };
  } else if (doc.caretRangeFromPoint) {
    const range = doc.caretRangeFromPoint(x, y);
    if (range && range.startContainer.nodeType === Node.TEXT_NODE)
      return { node: range.startContainer as Text, offset: range.startOffset };
  }
  return null;
}

function eligible(parent: Element | null): parent is HTMLElement {
  if (!parent) return false;
  const tag = parent.tagName;
  if (tag === "SCRIPT" || tag === "STYLE" || tag === "NOSCRIPT") return false;
  if (parent.classList.contains("px")) return false; // already glitched
  if (parent.closest("[data-no-glitch]")) return false;
  return true;
}

function sparkText(x: number, y: number) {
  const caret = caretFromPoint(x, y);
  if (!caret) return;
  const { node } = caret;
  const parent = node.parentElement;
  if (!eligible(parent)) return;

  const now = performance.now();
  if ((cooldownUntil.get(parent) ?? 0) > now) return;
  if (animating.has(node)) return;

  const text = node.nodeValue ?? "";
  const start = Math.max(0, caret.offset - RADIUS);
  const end = Math.min(text.length, caret.offset + RADIUS);
  const slice = text.slice(start, end);
  if (!slice.trim()) return;

  cooldownUntil.set(parent, now + REGION_COOLDOWN);
  animating.add(node);

  const before = document.createTextNode(text.slice(0, start));
  const after = document.createTextNode(text.slice(end));
  const span = document.createElement("span");
  span.className = "px glitching";
  span.textContent = slice;
  parent.replaceChild(after, node);
  parent.insertBefore(span, after);
  parent.insertBefore(before, span);

  const started = performance.now();
  const id = window.setInterval(() => {
    const t = (performance.now() - started) / SETTLE_MS;
    span.textContent = slice
      .split("")
      .map((ch, i) =>
        ch === " " ? " " : i / slice.length < t - 0.15 ? ch : rnd(GLYPHS),
      )
      .join("");
    if (t >= 1) {
      clearInterval(id);
      span.textContent = slice; // real text, kept
      span.className = "px px--set"; // frozen — pixel font + static split stay
      animating.delete(node);
    }
  }, CHURN_MS);
}

function sparkImage(el: Element) {
  const img =
    el.tagName === "IMG"
      ? (el as HTMLImageElement)
      : el.closest(".hoverimg")?.querySelector("img") ?? null;
  if (!img || img.classList.contains("img-glitched")) return;
  if (img.closest("[data-no-glitch]")) return;
  img.classList.add("img-glitched");
  // let a wrapped HoverImage also run its pixelate burst
  el.closest(".hoverimg")?.dispatchEvent(new Event("mouseenter"));
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

      const target = document.elementFromPoint(e.clientX, e.clientY);
      if (
        target &&
        (target.tagName === "IMG" || target.closest(".hoverimg"))
      ) {
        sparkImage(target);
      } else {
        sparkText(e.clientX, e.clientY);
      }
    },
    { passive: true },
  );
}
