import { work } from '../content';
import { badge, emph, esc, extLink, label, tags } from '../lib/html';
import { img } from '../lib/media';

// Phase 2: each project as a readable block (info + its media cards).
// Phase 5 turns the cards into the ring and this info into the panel.
export function renderWork(): string {
  const total = String(work.projects.length).padStart(2, '0');
  const projects = work.projects
    .map((p, i) => {
      const idx = `${String(i + 1).padStart(2, '0')} / ${total}`;
      const cards = p.media
        .map(
          (id) => `<li class="mcard">
            ${img(id, { sizes: '(max-width: 820px) 70vw, 24vw', cls: 'mcard__media' })}
            ${p.status ? badge(p.status) : ''}
          </li>`,
        )
        .join('');
      return `
        <article class="project" id="project-${p.id}" aria-labelledby="project-${p.id}-name">
          <div class="project__info">
            <p class="project__idx mono">${idx}${p.status ? badge(p.status) : ''}</p>
            <h3 id="project-${p.id}-name">${esc(p.name)}</h3>
            <p class="project__title">${esc(p.title)}</p>
            ${p.status ? '' : `<p class="project__meta mono">${esc(p.meta)}</p>`}
            <p class="project__desc">${esc(p.description)}</p>
            ${p.metric ? `<p class="project__metric">${esc(p.metric)}</p>` : ''}
            ${p.extra ? `<p class="project__extra">${esc(p.extra)}</p>` : ''}
            ${tags(p.tags)}
            ${p.repo ? extLink(p.repo, `${work.viewCode} →`, 'project__code mono') : ''}
          </div>
          <ul class="project__media" aria-label="${esc(p.name)} screenshots and results">${cards}</ul>
        </article>`;
    })
    .join('');
  return `
    <header class="section-head">
      ${label(work.label)}
      <h2>${emph(work.heading)}</h2>
    </header>
    <div class="projects">${projects}</div>`;
}
