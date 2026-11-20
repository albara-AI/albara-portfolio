// Phase 3 motion. Loaded only when the visitor hasn't asked for reduced
// motion (see main.ts), so those visitors never download GSAP or Lenis and
// keep the static Phase 2 layout.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { heroFlyThrough } from './hero';
import { fadeUps, headingReveals, portrait } from './reveals';
import { initAnchors, initProgress, initSmoothScroll } from './scroll';

export function initMotion(): void {
  gsap.registerPlugin(ScrollTrigger);
  // Dev builds only: lets tests switch motion off to check the static layout.
  if (import.meta.env.DEV) (window as unknown as { __ST: typeof ScrollTrigger }).__ST = ScrollTrigger;
  document.documentElement.classList.add('has-motion'); // already set by main.ts; harmless

  const lenis = initSmoothScroll();
  initAnchors(lenis);
  initProgress();
  heroFlyThrough();
  headingReveals();
  fadeUps();
  portrait();

  // Web fonts change text heights after first paint; re-measure trigger
  // positions once they're in (cheap, runs once — not on every scroll).
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
  // Resize: ScrollTrigger re-measures on its own (debounced).
}
