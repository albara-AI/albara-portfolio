import { about } from '../content';
import { emph, esc, label } from '../lib/html';
import { img } from '../lib/media';

export function renderAbout(): string {
  const facts = about.facts
    .map((f) => `<div class="fact"><dt class="mono">${esc(f.label)}</dt><dd>${esc(f.value)}</dd></div>`)
    .join('');
  // Skills: a plain list by default (reduced motion, screen readers).
  // With motion, src/motion/typewriter.ts types them one at a time into
  // .skills__tw and the list becomes screen-reader-only.
  const list = about.skills.map(esc).join(', ');
  return `
    <div class="about__text">
      ${label(about.label)}
      <h2 data-split>${emph(about.heading)}</h2>
      ${about.paragraphs.map((p) => `<p class="body" data-reveal>${esc(p)}</p>`).join('')}
      <p class="skills" data-reveal>
        <span class="skills__lead">${esc(about.skillsLead)}</span>
        <span class="skills__list">${list}.</span>
        <span class="skills__tw" aria-hidden="true"><span class="skills__word"></span><span class="skills__cursor"></span></span>
      </p>
      <dl class="facts" data-reveal>${facts}</dl>
    </div>
    <figure class="about__portrait">
      ${img(about.portrait, { sizes: '(max-width: 820px) 100vw, 40vw' })}
    </figure>`;
}
