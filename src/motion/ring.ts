// LLM projects ring (DESIGN.md §3).
//
// The .ring block is 520vh tall with a sticky stage; ScrollTrigger maps that
// scroll to p (0 → 1) and render(p) rotates the arc so each card in turn
// passes through top-centre. The card at the top is "active": it scales up,
// its project's info panel shows, and if it has a clip (AL-BAYAN#) it plays.
//
// Geometry: every card sits on a circle of radius R whose centre is R below
// the active slot; card i is turned by angle a = i·STEP − rotation.
import type Lenis from 'lenis';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const ACTIVE_SCALE = 1.18;
const FADE_FROM = 58; // degrees from the top where cards start to fade...
const FADE_TO = 84; //   ...and are gone

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export function ringScroll(lenis: Lenis): void {
  const root = document.querySelector<HTMLElement>('.ring');
  if (!root) return;
  const area = root.querySelector<HTMLElement>('.ring__area')!;
  const cards = [...root.querySelectorAll<HTMLElement>('.rcard')];
  const panels = [...root.querySelectorAll<HTMLElement>('.rpanel')];
  const videos = cards.map((c) => c.querySelector('video'));
  const N = cards.length;

  let R = 900;
  let STEP = 16; // degrees between neighbouring cards
  let active = -1;
  let activeProject = 0;
  let inView = false;

  // Viewport-dependent sizes — measured on load/resize, never while scrolling.
  const measure = () => {
    const vw = window.innerWidth;
    const mobile = vw < 820;
    const baseW = mobile ? 160 : 220;
    const baseH = mobile ? 210 : 290;
    R = mobile ? vw * 0.95 : Math.min(vw * 0.9, 900);
    // Spread so neighbours don't overlap: card width + a gap, around the arc.
    STEP = (Math.asin(Math.min(0.9, (baseW + (mobile ? 24 : 40)) / R)) * 180) / Math.PI;
    // Shrink only if the screen is too short for the active (scaled) card.
    const room = area.clientHeight - 16;
    const k = Math.min(1, room / (baseH * ACTIVE_SCALE));
    const ch = baseH * k;
    root.style.setProperty('--cw', `${baseW * k}px`);
    root.style.setProperty('--ch', `${ch}px`);
    // Active card centred vertically, nudged up a little because the
    // neighbours dip down the arc.
    const dip = R * (1 - Math.cos((STEP * Math.PI) / 180));
    root.style.setProperty('--ring-y', `${Math.max((ch * ACTIVE_SCALE) / 2 + 8, (area.clientHeight - dip) / 2)}px`);
  };

  const setActive = (i: number) => {
    if (i === active) return;
    if (active >= 0) {
      cards[active].classList.remove('is-active');
      cards[active].querySelector('button')?.removeAttribute('aria-current');
    }
    active = i;
    cards[i].classList.add('is-active');
    cards[i].querySelector('button')?.setAttribute('aria-current', 'true');

    const project = Number(cards[i].dataset.project);
    if (project !== activeProject) {
      panels[activeProject].classList.remove('is-active');
      panels[activeProject].inert = true;
      panels[project].classList.add('is-active');
      panels[project].inert = false;
      activeProject = project;
    }
    playActive();
  };

  // Only the active card's clip plays, and only while the ring is on screen.
  const playActive = () => {
    videos.forEach((v, i) => {
      if (!v) return;
      if (i === active && inView) {
        v.play().catch(() => {}); // autoplay can be refused; the poster stays
      } else if (!v.paused) {
        v.pause();
      }
    });
  };

  const render = (p: number) => {
    const rot = p * (N - 1) * STEP;
    cards.forEach((c, i) => {
      const a = i * STEP - rot;
      const abs = Math.abs(a);
      const d = Math.min(1, abs / STEP);
      const s = ACTIVE_SCALE - (ACTIVE_SCALE - 1) * d;
      const o = 1 - clamp01((abs - FADE_FROM) / (FADE_TO - FADE_FROM));
      c.style.transform = `translateY(${R}px) rotate(${a}deg) translateY(${-R}px) scale(${s})`;
      c.style.opacity = String(o);
      c.style.visibility = o > 0.001 ? 'visible' : 'hidden';
      c.style.zIndex = String(100 - Math.round(abs));
    });
    setActive(Math.min(N - 1, Math.max(0, Math.round(rot / STEP))));
  };

  measure();
  ScrollTrigger.addEventListener('refreshInit', measure);
  const st = ScrollTrigger.create({
    trigger: root,
    start: 'top top',
    end: 'bottom bottom',
    onUpdate: (self) => render(self.progress),
    onRefresh: (self) => render(self.progress),
    onToggle: (self) => {
      inView = self.isActive;
      playActive();
    },
  });

  // Click (or keyboard focus) on a card → scroll until it's at the top.
  const goTo = (i: number, immediate = false) =>
    lenis.scrollTo(st.start + ((st.end - st.start) * i) / (N - 1), { duration: 1.2, immediate });
  cards.forEach((c, i) => {
    const btn = c.querySelector('button')!;
    btn.addEventListener('click', () => goTo(i));
    // Tabbing through the cards brings each one to the front.
    btn.addEventListener('focus', () => {
      if (i !== active) goTo(i, true);
    });
  });
}
