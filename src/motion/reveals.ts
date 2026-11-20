// Scroll-triggered reveals. All tweens use transform/opacity only, except the
// About portrait's clip-path, which DESIGN.md asks for explicitly.
import { gsap } from 'gsap';

/**
 * Wrap each word of a heading in a mask (.w) + inner span, keeping <em>.
 * The mask hides the word; the inner span slides up into view.
 */
function splitWords(el: HTMLElement): HTMLElement[] {
  const inners: HTMLElement[] = [];
  const walk = (node: Node) => {
    for (const child of [...node.childNodes]) {
      if (child.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment();
        for (const part of (child.textContent ?? '').split(/(\s+)/)) {
          if (!part) continue;
          if (/^\s+$/.test(part)) {
            frag.append(document.createTextNode(part));
            continue;
          }
          const mask = document.createElement('span');
          mask.className = 'w';
          const inner = document.createElement('span');
          inner.textContent = part;
          mask.append(inner);
          frag.append(mask);
          inners.push(inner);
        }
        child.replaceWith(frag);
      } else if (child.nodeType === Node.ELEMENT_NODE && (child as Element).tagName !== 'BR') {
        walk(child);
      }
    }
  };
  walk(el);
  return inners;
}

/** Headings rise word by word from a mask (stagger .06s, expo.out). */
export function headingReveals(): void {
  gsap.utils.toArray<HTMLElement>('[data-split]').forEach((h) => {
    const words = splitWords(h);
    gsap.from(words, {
      yPercent: 110,
      duration: 1.1,
      ease: 'expo.out',
      stagger: 0.06,
      // clamp(): elements near the page end can't sit lower than max scroll,
      // so their trigger always fires.
      scrollTrigger: { trigger: h, start: 'clamp(top 82%)', once: true },
    });
  });
}

/** Blocks fade up 30px. Grid cards come in as a staggered batch. */
export function fadeUps(): void {
  gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
    gsap.from(el, {
      y: 30,
      autoAlpha: 0,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'clamp(top 88%)', once: true },
    });
  });

  // Data & ML cards: same fade-up; the right-hand card of each row starts
  // .12s later, so a row enters as a gentle stagger.
  gsap.utils.toArray<HTMLElement>('.dcard').forEach((card, i) => {
    gsap.from(card, {
      y: 40,
      autoAlpha: 0,
      duration: 1.1,
      ease: 'power3.out',
      delay: (i % 2) * 0.12,
      scrollTrigger: { trigger: card, start: 'clamp(top 88%)', once: true },
    });
  });
}

/** About portrait: frame opens from inset(12% 8%) to full; the photo drifts inside it. */
export function portrait(): void {
  const frame = document.querySelector<HTMLElement>('.about__portrait');
  const photo = frame?.querySelector('img');
  if (!frame || !photo) return;
  gsap.fromTo(
    frame,
    { clipPath: 'inset(12% 8% 12% 8%)' },
    {
      clipPath: 'inset(0% 0% 0% 0%)',
      ease: 'none',
      scrollTrigger: { trigger: frame, start: 'top 90%', end: 'top 25%', scrub: true },
    },
  );
  gsap.fromTo(
    photo,
    { yPercent: -8 },
    {
      yPercent: 8,
      ease: 'none',
      scrollTrigger: { trigger: frame, start: 'top bottom', end: 'bottom top', scrub: true },
    },
  );
}
