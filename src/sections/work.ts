import { ui, work } from '../content';
import { carouselMarkup } from '../components/carousel';
import { badge, emph, esc, label } from '../lib/html';
import { img } from '../lib/media';

// LLM projects: one card per project in a coverflow carousel. A card opens
// the details panel (src/components/details.ts) with the full gallery + text.
export function renderWork(): string {
  const items = work.projects.map(
    (p, i) => `
    <button class="pcard pcard--cover" type="button" data-details="llm" data-index="${i}"
      aria-label="${esc(p.name)} — ${esc(ui.openDetails)}">
      <span class="pcard__media">
        ${img(p.cover ?? p.media[0], { sizes: '(max-width: 820px) 80vw, 460px' })}
        ${p.status ? badge(p.status) : ''}
      </span>
      <span class="pcard__body">
        <span class="pcard__idx mono">${String(i + 1).padStart(2, '0')}</span>
        <span class="pcard__name">${esc(p.name)}</span>
        <span class="pcard__sub">${esc(p.title)}</span>
      </span>
    </button>`,
  );
  return `
    <header class="section-head">
      ${label(work.label)}
      <h2 data-split>${emph(work.heading)}</h2>
    </header>
    ${carouselMarkup({ label: work.heading.replace(/\*/g, ''), variant: 'cover', items })}`;
}
