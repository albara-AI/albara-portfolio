import { data, ui } from '../content';
import { carouselMarkup } from '../components/carousel';
import { emph, esc, label, sub2 } from '../lib/html';
import { img } from '../lib/media';

// Data & ML: smaller cards in a flat carousel (no 3D); a card opens the same
// details panel. A project without media gets a designed text card.
export function renderData(): string {
  const items = data.projects.map((p, i) => {
    const media = p.media?.length
      ? img(p.media[0], { sizes: '(max-width: 820px) 72vw, 340px' })
      : `<span class="pcard__designed" aria-hidden="true"><b>${sub2(p.metric ?? p.title)}</b></span>`;
    return `
    <button class="pcard pcard--flat" type="button" data-details="data" data-index="${i}"
      aria-label="${esc(p.title)} — ${esc(ui.openDetails)}">
      <span class="pcard__media">${media}</span>
      <span class="pcard__body">
        <span class="pcard__idx mono">${String(i + 1).padStart(2, '0')}</span>
        <span class="pcard__name">${sub2(p.title)}</span>
        <span class="pcard__sub">${esc(p.line)}</span>
      </span>
    </button>`;
  });
  return `
    <header class="section-head">
      ${label(data.label)}
      <h2 data-split>${emph(data.heading)}</h2>
    </header>
    ${carouselMarkup({ label: data.heading.replace(/\*/g, ''), variant: 'flat', items })}`;
}
