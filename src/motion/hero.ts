// Hero fly-through (DESIGN.md §1).
//
// The hero is 340vh tall with a sticky 100vh stage, so there are 240vh of
// scroll while the stage stays put. ScrollTrigger turns that scroll into a
// progress value p (0 → 1), and render(p) places everything from p alone —
// scrolling back up simply plays it in reverse.
//
//   p 0.00–0.12  intro + "Scroll" hint fade out
//   p 0.00–0.83  the 4 photos fly past the camera one by one (brief overlaps).
//                The first is already mid-flight at p = 0, so the very first
//                screen is never empty.
//   p 0.80–0.94  the name fades/scales in, then holds until the section ends
//
// Photos move only in z (towards the camera); CSS perspective turns that into
// "growing and drifting outwards". Only transform + opacity change per frame.
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const FAR = -2600; // z where a photo appears (small, far away)
const NEAR = 560; //  z where it ends (camera is at 900; here a photo is ~2.6× its size)
const FADE_OUT_FROM = 80; //  starts fading as it passes (~1.1× size)...
const FADE_OUT_TO = 420; //   ...gone by ~1.9× — no giant washed-out overlay
const START = -0.07; // first photo "started" before the page loaded (already visible at p = 0)
const STEP = 0.2; //    next photo starts this much later
const SPAN = 0.3; //    each photo's flight (SPAN > STEP → short overlap)
const NAME_IN: [number, number] = [0.8, 0.94];
const INTRO_OUT = 0.12;
const Y_PATTERN = [-0.04, 0.05, -0.03, 0.04]; // small vertical offsets (× viewport height)

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const range = (v: number, a: number, b: number) => clamp01((v - a) / (b - a));

interface Card {
  el: HTMLElement;
  aspect: number; // width / height, from the <img> width/height attributes
  w: number;
  h: number;
  x: number;
  y: number;
}

export function heroFlyThrough(): void {
  const stage = document.querySelector<HTMLElement>('.hero__stage');
  if (!stage) return;
  const name = stage.querySelector<HTMLElement>('.hero__name')!;
  const fades = [...stage.querySelectorAll<HTMLElement>('.hero__intro, .hero__hint')];
  const cards: Card[] = [...stage.querySelectorAll<HTMLElement>('.hero__card')].map((el) => {
    const img = el.querySelector('img')!;
    return { el, aspect: Number(img.getAttribute('width')) / Number(img.getAttribute('height')), w: 0, h: 0, x: 0, y: 0 };
  });

  // Sizes depend on the viewport only, so they're measured on load/resize —
  // never inside the scroll handler (PERFORMANCE.md).
  const measure = () => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const mobile = vw < 820;
    cards.forEach((c, i) => {
      const portrait = c.aspect < 1;
      // Size at z = 0: large, but never taller than ~62% of the screen.
      const maxW = portrait ? (mobile ? 0.64 : 0.34) * vw : (mobile ? 0.84 : 0.46) * vw;
      const maxH = (mobile ? 0.5 : 0.62) * vh;
      c.w = Math.min(maxW, maxH * c.aspect);
      c.h = c.w / c.aspect;
      // Alternate left/right of centre so the middle stays mostly clear.
      const side = i % 2 === 0 ? -1 : 1;
      c.x = side * (mobile ? 0.1 : 0.17) * vw;
      c.y = Y_PATTERN[i % Y_PATTERN.length] * vh;
      c.el.style.width = `${c.w}px`;
      c.el.style.height = `${c.h}px`;
    });
  };

  const render = (p: number) => {
    const introOpacity = String(1 - range(p, 0, INTRO_OUT));
    fades.forEach((el) => (el.style.opacity = introOpacity));

    cards.forEach((c, i) => {
      const t = range(p, START + i * STEP, START + i * STEP + SPAN);
      const z = FAR + (NEAR - FAR) * t;
      const o = t <= 0 || t >= 1 ? 0 : Math.min(range(t, 0, 0.18), 1 - range(z, FADE_OUT_FROM, FADE_OUT_TO));
      c.el.style.opacity = String(o);
      // Hidden photos skip painting entirely.
      c.el.style.visibility = o > 0.001 ? 'visible' : 'hidden';
      c.el.style.transform = `translate(-50%, -50%) translate3d(${c.x}px, ${c.y}px, ${z}px)`;
    });

    const n = range(p, NAME_IN[0], NAME_IN[1]);
    const eased = 1 - Math.pow(1 - n, 3); // power3.out — settles softly
    name.style.opacity = String(eased);
    name.style.transform = `scale(${0.9 + 0.1 * eased})`;
  };

  measure();
  ScrollTrigger.addEventListener('refreshInit', measure); // resize → re-measure, then ScrollTrigger re-renders
  ScrollTrigger.create({
    trigger: '.hero',
    start: 'top top',
    end: 'bottom bottom',
    onUpdate: (self) => render(self.progress),
    onRefresh: (self) => render(self.progress),
  });
}
