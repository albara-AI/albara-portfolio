// Phase 3 motion. Loaded only when the visitor hasn't asked for reduced
// motion (see main.ts), so those visitors never download GSAP or Lenis and
// keep the static Phase 2 layout.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { heroFlyThrough } from './hero';
import { fadeUps, headingReveals, portrait } from './reveals';
import { ringScroll } from './ring';
import { initAnchors, initProgress, initSmoothScroll } from './scroll';
import { typewriter } from './typewriter';

export function initMotion(): void {
  gsap.registerPlugin(ScrollTrigger);
  // Dev builds only: lets tests switch motion off to check the static layout.
  if (import.meta.env.DEV) (window as unknown as { __ST: typeof ScrollTrigger }).__ST = ScrollTrigger;
  document.documentElement.classList.add('has-motion'); // already set by main.ts; harmless

  const lenis = initSmoothScroll();
  initAnchors(lenis);
  initProgress();
  heroFlyThrough();
  ringScroll(lenis);
  headingReveals();
  fadeUps();
  portrait();
  typewriter();

  // Web fonts change text heights after first paint; re-measure trigger
  // positions once they're in (cheap, runs once — not on every scroll).
  document.fonts?.ready.then(() => ScrollTrigger.refresh());

  // Dev builds only: ?shot=ring:0.45 shows 45% through the ring (also
  // ?shot=top:0.5, ?shot=data:0). Headless Chrome's --screenshot captures the
  // top of the document, not the scrolled view, so after scrolling there (to
  // let every animation render) we freeze the animations, pin what's on
  // screen to the viewport and scroll back to 0. Used for review screenshots.
  if (import.meta.env.DEV) {
    const shot = new URLSearchParams(location.search).get('shot');
    if (shot) {
      const [id, p = '0'] = shot.split(':');
      // Headless virtual time doesn't finish CSS transitions — show end states.
      document.head.insertAdjacentHTML('beforeend', '<style>*,*::before,*::after{transition:none!important}</style>');
      document.fonts.ready.then(() => {
        ScrollTrigger.refresh();
        const el = id === 'ring' ? document.querySelector<HTMLElement>('.ring') : document.getElementById(id);
        if (!el) return;
        const top = el.getBoundingClientRect().top + window.scrollY;
        lenis.resize();
        lenis.scrollTo(top + Math.max(0, el.offsetHeight - window.innerHeight) * Number(p), { immediate: true, force: true });
        setTimeout(() => {
          const y = window.scrollY;
          ScrollTrigger.getAll().forEach((t) => t.disable(false)); // keep rendered state
          lenis.destroy();
          const stage = el.querySelector<HTMLElement>('.hero__stage, .ring__stage');
          if (stage) {
            Object.assign(stage.style, { position: 'fixed', inset: '0', zIndex: '40', background: 'var(--paper)' });
          } else {
            document.querySelector('main')!.style.transform = `translateY(${-y}px)`;
          }
          window.scrollTo(0, 0);
          document.documentElement.dataset.shotReady = '1';
        }, 900);
      });
    }
  }
  // Resize: ScrollTrigger re-measures on its own (debounced).
}
