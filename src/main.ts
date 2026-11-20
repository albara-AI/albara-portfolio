// Fonts: self-hosted via @fontsource (Latin subset only — the site is English).
// Only the weights DESIGN.md allows: 400 + 500, plus Instrument Serif italic for <em>.
import '@fontsource/instrument-serif/latin-400.css';
import '@fontsource/instrument-serif/latin-400-italic.css';
import '@fontsource/inter/latin-400.css';
import '@fontsource/inter/latin-500.css';
import '@fontsource/jetbrains-mono/latin-400.css';
import '@fontsource/jetbrains-mono/latin-500.css';
import './styles/glyphs.css';

import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';
import './styles/sections.css';

import { initCarousel } from './components/carousel';
import { detailsMarkup, initDetails } from './components/details';
import { bindContact, renderContact } from './sections/contact';
import { renderAbout } from './sections/about';
import { renderData } from './sections/data';
import { renderHero } from './sections/hero';
import { bindNav, renderNav } from './sections/nav';
import { renderWork } from './sections/work';

// Motion (Lenis + GSAP) is a separate chunk, loaded only if the visitor
// hasn't asked for reduced motion. Those visitors keep the static layout
// and never download it.
const motion = !matchMedia('(prefers-reduced-motion: reduce)').matches;
// Switch the CSS to the motion layout *before* anything renders (tall hero,
// hidden photos and name), so there's no flash of the static layout while
// the chunk loads, and #hash jumps below use the final page height.
// (index.html already does this in <head> for the prerendered hero.)
if (motion) document.documentElement.classList.add('has-motion');

const fill = (id: string, html: string) => {
  const el = document.getElementById(id);
  if (el) el.innerHTML = html;
};

fill('nav-root', renderNav());
// The production build already has the hero in index.html (vite.config.ts →
// prerenderHero); re-rendering it would only repaint the name later.
if (!document.getElementById('top')?.childElementCount) fill('top', renderHero());
fill('about', renderAbout());
fill('work', renderWork());
fill('data', renderData());
fill('contact', renderContact());

document.body.insertAdjacentHTML('beforeend', detailsMarkup());

bindNav(document);
bindContact(document);
document.querySelectorAll<HTMLElement>('[data-carousel]').forEach(initCarousel);
initDetails();

// Sections are rendered with JS, so the browser's own jump to #hash on load
// happens before the content exists — redo it once the sections are filled.
if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView();

// The motion code (GSAP, Lenis — the biggest file) is fetched only after the
// first screen has painted, so it never competes with the name for bandwidth.
// The page is fully readable and usable before it arrives.
if (motion) {
  const loadMotion = () => import('./motion').then((m) => m.initMotion());
  requestAnimationFrame(() => setTimeout(loadMotion, 0));
}

// Dev only: point out content mistakes clearly in the console.
if (import.meta.env.DEV) import('./lib/check-content').then((m) => m.checkContent());
