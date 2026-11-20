// Fonts: self-hosted via @fontsource (Latin subset only — the site is English).
// Only the weights DESIGN.md allows: 400 + 500, plus Instrument Serif italic for <em>.
import '@fontsource/instrument-serif/latin-400.css';
import '@fontsource/instrument-serif/latin-400-italic.css';
import '@fontsource/inter/latin-400.css';
import '@fontsource/inter/latin-500.css';
import '@fontsource/jetbrains-mono/latin-400.css';
import '@fontsource/jetbrains-mono/latin-500.css';

import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';
import './styles/sections.css';

import { bindContact, renderContact } from './sections/contact';
import { renderAbout } from './sections/about';
import { renderData } from './sections/data';
import { renderHero } from './sections/hero';
import { bindNav, renderNav } from './sections/nav';
import { renderWork } from './sections/work';

const fill = (id: string, html: string) => {
  const el = document.getElementById(id);
  if (el) el.innerHTML = html;
};

fill('nav-root', renderNav());
fill('top', renderHero());
fill('about', renderAbout());
fill('work', renderWork());
fill('data', renderData());
fill('contact', renderContact());

bindNav(document);
bindContact(document);

// Phase 2 renders with JS, so the browser's own jump to #hash on load
// happens before the content exists — redo it once the sections are filled.
if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView();
