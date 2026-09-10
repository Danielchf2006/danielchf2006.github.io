/**
 * oneko — the pixel cat that chases the cursor.
 *
 * Adapted from the classic oneko.js. Sprite sheet is /oneko.png (256x128,
 * 8x4 grid of 32x32 frames, canonical oneko layout — BSD-2, Cesar Gimenes;
 * see public/oneko-LICENSE.txt).
 *
 * - skipped for prefers-reduced-motion and for coarse pointers (no mouse)
 * - waits for the intro overlay to finish before appearing
 * - scaled 2x, crisp
 */

const SCALE = 2;
const SIZE = 32 * SCALE;
const SPEED = 10;

type Frame = [number, number];
type Sets = Record<string, Frame[]>;

// scratchWall* reuse scratchSelf cells — this sheet has no wall-scratch frames
const spriteSets: Sets = {
  idle: [[-3, -3]],
  alert: [[-7, -3]],
  scratchSelf: [
    [-5, 0],
    [-6, 0],
    [-7, 0],
  ],
  scratchWallN: [
    [-5, 0],
    [-6, 0],
  ],
  scratchWallS: [
    [-7, 0],
    [-6, 0],
  ],
  scratchWallE: [
    [-5, 0],
    [-7, 0],
  ],
  scratchWallW: [
    [-6, 0],
    [-5, 0],
  ],
  tired: [[-3, -2]],
  sleeping: [
    [-2, 0],
    [-2, -1],
  ],
  N: [
    [-1, -2],
    [-1, -3],
  ],
  NE: [
    [0, -2],
    [0, -3],
  ],
  E: [
    [-3, 0],
    [-3, -1],
  ],
  SE: [
    [-5, -1],
    [-5, -2],
  ],
  S: [
    [-6, -3],
    [-7, -2],
  ],
  SW: [
    [-5, -3],
    [-6, -1],
  ],
  W: [
    [-4, -2],
    [-4, -3],
  ],
  NW: [
    [-1, 0],
    [-1, -1],
  ],
};

function start() {
  const el = document.createElement("div");
  el.id = "oneko";
  el.setAttribute("aria-hidden", "true");

  let nekoX = 32;
  let nekoY = 32;
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let frameCount = 0;
  let idleTime = 0;
  let idleAnim: string | null = null;
  let idleAnimFrame = 0;

  Object.assign(el.style, {
    width: `${SIZE}px`,
    height: `${SIZE}px`,
    position: "fixed",
    pointerEvents: "none",
    imageRendering: "pixelated",
    left: `${nekoX - SIZE / 2}px`,
    top: `${nekoY - SIZE / 2}px`,
    zIndex: "2147483000",
    backgroundImage: "url(/oneko.png)",
    backgroundSize: `${8 * SIZE}px ${4 * SIZE}px`,
  } as Partial<CSSStyleDeclaration>);
  document.body.appendChild(el);

  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function setSprite(name: string, frame: number) {
    const set = spriteSets[name];
    const [x, y] = set[frame % set.length];
    el.style.backgroundPosition = `${x * SIZE}px ${y * SIZE}px`;
  }

  function resetIdle() {
    idleAnim = null;
    idleAnimFrame = 0;
  }

  function idle() {
    idleTime += 1;
    if (
      idleTime > 10 &&
      Math.floor(Math.random() * 200) === 0 &&
      idleAnim == null
    ) {
      const avail = ["sleeping", "scratchSelf"];
      if (nekoX < 32) avail.push("scratchWallW");
      if (nekoY < 32) avail.push("scratchWallN");
      if (nekoX > window.innerWidth - 32) avail.push("scratchWallE");
      if (nekoY > window.innerHeight - 32) avail.push("scratchWallS");
      idleAnim = avail[Math.floor(Math.random() * avail.length)];
    }

    switch (idleAnim) {
      case "sleeping":
        if (idleAnimFrame < 8) {
          setSprite("tired", 0);
          break;
        }
        setSprite("sleeping", Math.floor(idleAnimFrame / 4));
        if (idleAnimFrame > 192) resetIdle();
        break;
      case "scratchWallN":
      case "scratchWallS":
      case "scratchWallE":
      case "scratchWallW":
      case "scratchSelf":
        setSprite(idleAnim, idleAnimFrame);
        if (idleAnimFrame > 9) resetIdle();
        break;
      default:
        setSprite("idle", 0);
        return;
    }
    idleAnimFrame += 1;
  }

  function frame() {
    frameCount += 1;
    const diffX = nekoX - mouseX;
    const diffY = nekoY - mouseY;
    const dist = Math.sqrt(diffX ** 2 + diffY ** 2);

    if (dist < SPEED || dist < 48) {
      idle();
      return;
    }

    idleAnim = null;
    idleAnimFrame = 0;

    if (idleTime > 1) {
      setSprite("alert", 0);
      idleTime = Math.min(idleTime, 7);
      idleTime -= 1;
      return;
    }

    let direction = diffY / dist > 0.5 ? "N" : "";
    direction += diffY / dist < -0.5 ? "S" : "";
    direction += diffX / dist > 0.5 ? "W" : "";
    direction += diffX / dist < -0.5 ? "E" : "";
    setSprite(direction, frameCount);

    nekoX -= (diffX / dist) * SPEED;
    nekoY -= (diffY / dist) * SPEED;

    nekoX = Math.min(Math.max(16, nekoX), window.innerWidth - 16);
    nekoY = Math.min(Math.max(16, nekoY), window.innerHeight - 16);

    el.style.left = `${nekoX - SIZE / 2}px`;
    el.style.top = `${nekoY - SIZE / 2}px`;
  }

  let last: number | undefined;
  function loop(ts: number) {
    if (!el.isConnected) return;
    if (last === undefined) last = ts;
    if (ts - last > 100) {
      last = ts;
      frame();
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}

const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const coarse = window.matchMedia("(pointer: coarse)").matches;

if (!reduce && !coarse) {
  const intro = document.getElementById("intro");
  if (intro && !document.documentElement.classList.contains("intro-off")) {
    window.addEventListener("intro:done", start, { once: true });
    // safety net if the intro never fires its event
    window.setTimeout(() => {
      if (!document.getElementById("oneko")) start();
    }, 8000);
  } else {
    start();
  }
}

export {};
