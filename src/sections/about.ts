import { about } from '../content';
import { emph, esc, label } from '../lib/html';
import { img } from '../lib/media';

export function renderAbout(): string {
  const facts = about.facts
    .map((f) => `<div class="fact"><dt class="mono">${esc(f.label)}</dt><dd>${esc(f.value)}</dd></div>`)
    .join('');
  return `
    <div class="about__text">
      ${label(about.label)}
      <h2 data-split>${emph(about.heading)}</h2>
      ${about.paragraphs.map((p) => `<p class="body" data-reveal>${esc(p)}</p>`).join('')}
      <dl class="facts" data-reveal>${facts}</dl>
    </div>
    <figure class="about__portrait">
      ${img(about.portrait, { sizes: '(max-width: 820px) 100vw, 40vw' })}
    </figure>`;
}
