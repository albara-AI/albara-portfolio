// Smooth scroll (Lenis) driven by GSAP's ticker, so Lenis and ScrollTrigger
// update in the same frame — no jitter between scrolling and scroll-linked
// animations. Also: smooth in-page links and the top progress bar.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

/** expo.out — fast start, long soft landing (DESIGN.md → Motion rules). */
const expoOut = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

export function initSmoothScroll(): Lenis {
  const lenis = new Lenis({
    duration: 1.25,
    easing: expoOut,
    autoRaf: false, // GSAP's ticker drives it (below)
    // Touch keeps the phone's native scroll (Lenis's default): smoothing
    // touch input feels laggy on phones.
  });

  lenis.on('scroll', ScrollTrigger.update);
  // Dev builds only: lets tests drive the real smooth scroll (lenis.scrollTo).
  if (import.meta.env.DEV) (window as unknown as { __lenis: Lenis }).__lenis = lenis;
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0); // don't "catch up" after a slow frame — Lenis handles timing

  // The mobile menu locks the page: pause Lenis while it's open.
  document.addEventListener('menu:toggle', (e) => {
    if ((e as CustomEvent<boolean>).detail) lenis.stop();
    else lenis.start();
  });

  return lenis;
}

/** Every href="#…" link (nav, menu, skip link) glides via Lenis and lands below the fixed bar. */
export function initAnchors(lenis: Lenis): void {
  document.addEventListener('click', (e) => {
    const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const id = a.getAttribute('href')!.slice(1);
    const target = id ? document.getElementById(id) : null;
    if (!target) return;
    e.preventDefault();
    // No offset needed: Lenis honours the CSS `scroll-margin-top` (= nav
    // height) that base.css puts on every [id], so it lands below the bar.
    lenis.scrollTo(id === 'top' ? 0 : target, {
      duration: 1.6,
      onComplete: () => {
        // Move keyboard/screen-reader focus to where the page went.
        if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      },
    });
    history.pushState(null, '', `#${id}`);
  });
}

/** 2px accent bar across the top, 0 → 100% of the page. */
export function initProgress(): void {
  const bar = document.querySelector<HTMLElement>('.progress');
  if (!bar) return;
  const setScale = gsap.quickSetter(bar, 'scaleX');
  ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: (self) => setScale(self.progress),
  });
}
