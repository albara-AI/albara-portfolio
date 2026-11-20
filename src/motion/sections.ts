// Scroll-driven effects after About (DESIGN.md → "Scroll story after About").
// The carousels themselves are never driven by vertical scroll: these effects
// only move whole sections, or the carousel's <li> wrappers *once* while it
// enters — the cards (and the active card) stay under swipe/drag/arrows.
import { gsap } from 'gsap';
import type Lenis from 'lenis';

/**
 * Layered transitions: each section slides up over the previous one, while
 * the one behind is held back (moves up only ~15% of the scroll), scales to
 * 0.92 and darkens. No pinning — the section behind is counter-translated,
 * so layout, Lenis and the carousels are untouched.
 */
export function stackedSections(): void {
  const ids = ['about', 'work', 'data', 'contact'];
  const secs = ids.map((id) => document.getElementById(id)).filter((s): s is HTMLElement => !!s);
  secs.slice(0, -1).forEach((prev, i) => {
    const next = secs[i + 1];
    gsap.to(prev, {
      // as `next` rises one screen, `prev` sinks back 85% of it
      y: () => window.innerHeight * 0.85,
      scale: 0.92,
      '--shade': 0.55,
      // shrink around the middle of what's on screen (prev's last screenful)
      transformOrigin: () => `50% ${Math.max(0, prev.offsetHeight - window.innerHeight / 2)}px`,
      ease: 'none',
      scrollTrigger: {
        trigger: next,
        start: 'top bottom',
        end: 'top top',
        scrub: true,
        invalidateOnRefresh: true,
      },
    });
  });
}

/**
 * Keyboard focus must never land under the next sheet. With the layered
 * sections, an element can be inside the viewport (so the browser doesn't
 * scroll to it) yet covered by the section sliding over it. When focus lands
 * on something covered, scroll to where its section is fully settled and
 * uncovered, with the element as close to the middle of the screen as that
 * allows. Positions come from the layout (offsetTop), which the scroll-driven
 * transforms don't change.
 * (Entrances below fade with opacity only — never visibility: hidden — so
 * everything stays in the Tab order before it has been scrolled to.)
 */
export function keepFocusInView(lenis: Lenis): void {
  const layoutTop = (el: HTMLElement) => {
    let y = 0;
    for (let n: HTMLElement | null = el; n; n = n.offsetParent as HTMLElement | null) y += n.offsetTop;
    return y;
  };
  document.addEventListener('focusin', (e) => {
    const el = e.target;
    if (!(el instanceof HTMLElement) || el.closest('dialog, .nav, #menu, .skip-link')) return;
    const section = el.closest<HTMLElement>('.section');
    // A whole section gets focus after a nav/anchor jump, which already put it
    // exactly where it belongs (e.g. the logo → scrollY 0): never move it.
    if (!section || el === section) return;
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight;
    // Test points below the fixed nav bar — the bar itself isn't "covering".
    const navH = document.querySelector<HTMLElement>('.nav')?.offsetHeight ?? 0;
    // Still see-through = its entrance hasn't played yet (needs scrolling to).
    let faded = false;
    for (let n: HTMLElement | null = el; n && n !== section; n = n.parentElement) {
      if (parseFloat(getComputedStyle(n).opacity) < 0.5) faded = true;
    }
    if (!faded && r.bottom > 0 && r.top < vh) {
      const x = Math.min(Math.max(r.left + r.width / 2, 0), window.innerWidth - 1);
      const y = Math.min(Math.max(r.top + Math.min(r.height / 2, 24), navH), vh - 1);
      const hit = document.elementFromPoint(x, y);
      if (hit && (hit === el || el.contains(hit))) return; // visible — nothing to do
    }
    const top = layoutTop(section);
    const settled = top + Math.max(0, section.offsetHeight - vh); // last scroll before the next sheet rises
    const centre = layoutTop(el) - (vh - el.offsetHeight) / 2;
    lenis.scrollTo(Math.min(Math.max(centre, top), settled), { duration: 0.8 });
  });
}

/**
 * LLM projects: the carousel comes in from depth — cards spread out, turned
 * and far back — and settles into the coverflow as the section scrolls into
 * view (scrubbed). Once settled, the trigger is removed: scroll does nothing
 * to the carousel after that.
 */
export function llmEntrance(): void {
  const root = document.querySelector<HTMLElement>('.carousel--cover');
  if (!root) return;
  const items = gsap.utils.toArray<HTMLElement>(root.querySelectorAll('.carousel__item'));
  const controls = root.querySelector('.carousel__controls');
  const mid = (items.length - 1) / 2;
  // constant 3D depth for the entrance (set once — not animated)
  gsap.set(items, { transformPerspective: 1200 });

  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: root,
      start: 'top 95%',
      end: 'top 35%',
      scrub: 0.6,
      onLeave: (self) => {
        // settled: lock the final state and stop listening to scroll
        self.kill();
        tl.progress(1).kill();
        gsap.set(items, { clearProps: 'transform,opacity' });
      },
    },
  });
  tl.from(items, {
    x: (i) => (i - mid) * 220,
    y: 80,
    z: -900,
    rotateY: (i) => (i - mid) * -40,
    rotateX: 18,
    opacity: 0,
    stagger: 0.08,
  }).from(controls, { opacity: 0, y: 20 }, 0.2);
}

/** Data & ML: cards rise and fade in with a stagger; light parallax on images. */
export function dataEntrance(): void {
  const root = document.querySelector<HTMLElement>('.carousel--flat');
  if (!root) return;
  const items = root.querySelectorAll('.carousel__item');
  gsap.from(items, {
    y: 70,
    opacity: 0,
    duration: 1,
    ease: 'power3.out',
    stagger: 0.12,
    scrollTrigger: { trigger: root, start: 'clamp(top 85%)', once: true },
  });
  gsap.from(root.querySelector('.carousel__controls'), {
    opacity: 0,
    duration: 0.8,
    scrollTrigger: { trigger: root, start: 'clamp(top 85%)', once: true },
  });
  // Images drift slightly inside their frames (CSS makes them 16% taller).
  root.querySelectorAll('.pcard__media img').forEach((img) => {
    gsap.fromTo(
      img,
      { yPercent: -6 },
      {
        yPercent: 6,
        ease: 'none',
        scrollTrigger: { trigger: root, start: 'top bottom', end: 'bottom top', scrub: true },
      },
    );
  });
}

/** Contact: buttons fade up one after another (the big line is a word reveal). */
export function contactEntrance(): void {
  const btns = document.querySelectorAll('#contact .cta .btn');
  gsap.from(btns, {
    y: 24,
    opacity: 0,
    duration: 0.9,
    ease: 'power3.out',
    stagger: 0.08,
    scrollTrigger: { trigger: '#contact .cta', start: 'clamp(top 90%)', once: true },
  });
}
