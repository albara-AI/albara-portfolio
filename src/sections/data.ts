import { data, work } from '../content';
import { emph, esc, extLink, label, tags } from '../lib/html';
import { img } from '../lib/media';

export function renderData(): string {
  const cards = data.projects
    .map(
      (p, i) => `
      <article class="dcard" aria-labelledby="data-${p.id}">
        <figure class="dcard__media">${img(p.media, { sizes: '(max-width: 820px) 100vw, 45vw' })}</figure>
        <div class="dcard__body">
          <p class="dcard__idx mono">${String(i + 1).padStart(2, '0')}</p>
          <h3 id="data-${p.id}">${esc(p.title)}</h3>
          <p class="dcard__line">${esc(p.line)}</p>
          ${p.detail ? `<p class="dcard__detail">${esc(p.detail)}</p>` : ''}
          ${tags(p.tags)}
          ${p.repo ? extLink(p.repo, `${work.viewCode} →`, 'project__code mono') : ''}
        </div>
      </article>`,
    )
    .join('');
  return `
    <header class="section-head">
      ${label(data.label)}
      <h2>${emph(data.heading)}</h2>
    </header>
    <div class="dgrid">${cards}</div>`;
}
