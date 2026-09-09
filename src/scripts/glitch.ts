/**
 * Cursor-local text glitch. As the pointer moves over any text on the page,
 * the few characters directly under it flip to the Minecraft pixel font,
 * scramble through glyphs with a red/cyan chromatic split, then resolve back
 * to the real text. Only the characters near the cursor change — not the
 * whole element.
 *
 * The real text is never lost: a transient <span class="px glitching"> is
 * spliced in for the duration and removed afterwards, merging the text node
 * back exactly as it was.
 */

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789§#%&/\\<>=+*?!{}[]".split("");
const RADIUS = 4; // chars on each side of the cursor
const LIFETIME = 460; // ms a patch churns before resolving
const CHURN_MS = 40; // ms between scramble frames
const COOLDOWN = 90; // ms before the same element can spark again
const MOVE_THROTTLE = 45;

const reduce =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

type Patch = { span: HTMLSpanElement; done: () => void };
const active = new WeakMap<Element, Patch>();
const cooldownUntil = new WeakMap<Element, number>();

const rnd = <T>(a: T[]) => a[(Math.random() * a.length) | 0];

function caretFromPoint(x: number, y: number): { node: Text; offset: number } | null {
  const doc = document as Document & {
    caretPositionFromPoint?: (
      x: number,
      y: number,
    ) => { offsetNode: Node; offset: number } | null;
    caretRangeFromPoint?: (x: number, y: number) => Range | null;
  };
  if (doc.caretPositionFromPoint) {
    const pos = doc.caretPositionFromPoint(x, y);
    if (pos && pos.offsetNode.nodeType === Node.TEXT_NODE) {
      return { node: pos.offsetNode as Text, offset: pos.offset };
    }
  } else if (doc.caretRangeFromPoint) {
    const range = doc.caretRangeFromPoint(x, y);
    if (range && range.startContainer.nodeType === Node.TEXT_NODE) {
      return { node: range.startContainer as Text, offset: range.startOffset };
    }
  }
  return null;
}

function eligible(parent: Element | null): parent is HTMLElement {
  if (!parent) return false;
  const tag = parent.tagName;
  if (tag === "SCRIPT" || tag === "STYLE" || tag === "NOSCRIPT" || tag === "svg")
    return false;
  if (parent.closest("[data-no-glitch]")) return false;
  if (parent.classList.contains("px")) return false;
  return true;
}

function spark(x: number, y: number) {
  const caret = caretFromPoint(x, y);
  if (!caret) return;
  const { node } = caret;
  const parent = node.parentElement;
  if (!eligible(parent)) return;

  const now = performance.now();
  if ((cooldownUntil.get(parent) ?? 0) > now) return;
  if (active.has(parent)) return;

  const text = node.nodeValue ?? "";
  const start = Math.max(0, caret.offset - RADIUS);
  const end = Math.min(text.length, caret.offset + RADIUS);
  const slice = text.slice(start, end);
  if (!slice.trim()) return;

  // splice: [before] [span] [after]
  const original = text;
  const before = document.createTextNode(original.slice(0, start));
  const after = document.createTextNode(original.slice(end));
  const span = document.createElement("span");
  span.className = "px glitching";
  span.textContent = slice;
  parent.replaceChild(after, node);
  parent.insertBefore(span, after);
  parent.insertBefore(before, span);

  let raf = 0;
  let interval = 0;
  const startedAt = performance.now();

  const restore = () => {
    clearInterval(interval);
    cancelAnimationFrame(raf);
    // rebuild the exact original text node
    const merged = document.createTextNode(original);
    if (span.parentNode === parent) parent.replaceChild(merged, span);
    if (before.parentNode === parent) parent.removeChild(before);
    if (after.parentNode === parent) parent.removeChild(after);
    parent.normalize();
    active.delete(parent);
    cooldownUntil.set(parent, performance.now() + COOLDOWN);
  };

  const patch: Patch = { span, done: restore };
  active.set(parent, patch);

  interval = window.setInterval(() => {
    const t = (performance.now() - startedAt) / LIFETIME;
    // characters lock back to their real value left-to-right as t -> 1
    span.textContent = slice
      .split("")
      .map((ch, i) => {
        if (ch === " ") return " ";
        return i / slice.length < t - 0.15 ? ch : rnd(GLYPHS);
      })
      .join("");
    if (t >= 1) restore();
  }, CHURN_MS);

  window.setTimeout(restore, LIFETIME + 60);
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
      spark(e.clientX, e.clientY);
    },
    { passive: true },
  );
}
