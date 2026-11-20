// Horizontal project carousel (LLM projects + Data & ML).
//
// Built on a native horizontal scroll container with CSS scroll-snap, so
// touch swipe, trackpad sideways scrolling and snapping come from the
// browser for free — and vertical page scrolling never moves it. On top:
//   • ← → buttons and keyboard arrows (Home/End too)
//   • mouse drag on desktop
//   • "cover" variant: coverflow — the centred card full size, side cards
//     smaller and turned (off under prefers-reduced-motion: plain sliding)
import { ui } from '../content';
import { esc } from '../lib/html';

export type CarouselVariant = 'cover' | 'flat';

export function carouselMarkup(opts: { label: string; variant: CarouselVariant; items: string[] }): string {
  const n = String(opts.items.length).padStart(2, '0');
  return `
    <div class="carousel carousel--${opts.variant}" data-carousel="${opts.variant}">
      <div class="carousel__controls">
        <p class="carousel__count mono" aria-hidden="true"><span data-current>01</span> / ${n}</p>
        <button class="carousel__arrow" type="button" data-dir="-1" aria-label="${esc(ui.prev)}">←</button>
        <button class="carousel__arrow" type="button" data-dir="1" aria-label="${esc(ui.next)}">→</button>
      </div>
      <ul class="carousel__track" aria-label="${esc(opts.label)}">
        ${opts.items.map((html) => `<li class="carousel__item">${html}</li>`).join('')}
      </ul>
    </div>`;
}

const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export function initCarousel(root: HTMLElement): void {
  const track = root.querySelector<HTMLElement>('.carousel__track')!;
  const items = [...track.querySelectorAll<HTMLElement>('.carousel__item')];
  const cards = items.map((li) => li.firstElementChild as HTMLElement);
  const arrows = [...root.querySelectorAll<HTMLButtonElement>('.carousel__arrow')];
  const counter = root.querySelector<HTMLElement>('[data-current]');
  const centred = root.dataset.carousel === 'cover';
  const coverflow = centred && !reduceMotion();

  // Geometry, cached on resize (no layout reads while scrolling).
  let anchors: number[] = []; // scrollLeft that brings item i into place
  let centres: number[] = [];
  let spacing = 1;
  let half = 0;
  const measure = () => {
    const padL = parseFloat(getComputedStyle(track).scrollPaddingLeft) || 0;
    half = track.clientWidth / 2;
    centres = items.map((li) => li.offsetLeft + li.offsetWidth / 2);
    anchors = items.map((li, i) => (centred ? centres[i] - half : li.offsetLeft - padL));
    spacing = items.length > 1 ? centres[1] - centres[0] : 1;
    render();
  };

  let current = 0;
  const nearest = () => {
    const x = track.scrollLeft;
    let best = 0;
    anchors.forEach((a, i) => {
      if (Math.abs(a - x) < Math.abs(anchors[best] - x)) best = i;
    });
    return best;
  };

  const render = () => {
    const x = track.scrollLeft;
    current = nearest();
    if (counter) counter.textContent = String(current + 1).padStart(2, '0');
    const max = track.scrollWidth - track.clientWidth - 2;
    arrows[0].disabled = x <= 2;
    arrows[1].disabled = x >= max;
    if (!coverflow) return;
    cards.forEach((card, i) => {
      // d: how many card-widths this card is from the centre (signed)
      const d = Math.max(-1.6, Math.min(1.6, (centres[i] - (x + half)) / spacing));
      const a = Math.min(1, Math.abs(d));
      card.style.transform = `perspective(1100px) rotateY(${-d * 24}deg) scale(${1 - a * 0.14})`;
      card.style.opacity = String(1 - a * 0.25);
      items[i].style.zIndex = String(10 - Math.round(Math.abs(d) * 2));
    });
  };

  let raf = 0;
  track.addEventListener(
    'scroll',
    () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(render);
    },
    { passive: true },
  );

  const goTo = (i: number) => {
    const target = Math.max(0, Math.min(items.length - 1, i));
    track.scrollTo({ left: anchors[target], behavior: 'smooth' });
  };

  arrows.forEach((b) => b.addEventListener('click', () => goTo(current + Number(b.dataset.dir))));

  root.addEventListener('keydown', (e) => {
    const k = e.key;
    if (k !== 'ArrowLeft' && k !== 'ArrowRight' && k !== 'Home' && k !== 'End') return;
    e.preventDefault();
    const next = k === 'Home' ? 0 : k === 'End' ? items.length - 1 : current + (k === 'ArrowRight' ? 1 : -1);
    goTo(next);
    // keep keyboard focus on the card that is now in front
    if (root.contains(document.activeElement) && document.activeElement !== arrows[0] && document.activeElement !== arrows[1]) {
      cards[Math.max(0, Math.min(items.length - 1, next))].focus({ preventScroll: true });
    }
  });

  // Mouse drag (touch and trackpads already scroll natively).
  let down = false;
  let moved = false;
  let startX = 0;
  let startLeft = 0;
  track.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    down = true;
    moved = false;
    startX = e.clientX;
    startLeft = track.scrollLeft;
  });
  track.addEventListener('pointermove', (e) => {
    if (!down) return;
    const dx = e.clientX - startX;
    if (!moved && Math.abs(dx) > 5) {
      moved = true;
      track.setPointerCapture(e.pointerId);
      track.classList.add('is-dragging'); // turns snapping off while dragging
    }
    if (moved) track.scrollLeft = startLeft - dx;
  });
  const end = () => {
    if (!down) return;
    down = false;
    if (moved) {
      track.classList.remove('is-dragging');
      goTo(nearest());
    }
  };
  track.addEventListener('pointerup', end);
  track.addEventListener('pointercancel', end);
  // A drag shouldn't count as a click on the card under the pointer.
  track.addEventListener(
    'click',
    (e) => {
      if (moved) {
        e.preventDefault();
        e.stopPropagation();
        moved = false;
      }
    },
    true,
  );

  new ResizeObserver(measure).observe(track);
  measure();
}
