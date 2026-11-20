import { ui, work, type LlmProject } from '../content';
import { badge, emph, esc, extLink, label, tags } from '../lib/html';
import { asset, img } from '../lib/media';

const total = String(work.projects.length).padStart(2, '0');
const idxOf = (i: number) => `${String(i + 1).padStart(2, '0')} / ${total}`;

/* ---------- Static layout (no motion): one readable block per project ---------- */
function staticBlocks(): string {
  return work.projects
    .map((p, i) => {
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
          <div class="project__info" data-reveal>
            <p class="project__idx mono">${idxOf(i)}${p.status ? badge(p.status) : ''}</p>
            <h3 id="project-${p.id}-name">${esc(p.name)}</h3>
            <p class="project__title">${esc(p.title)}</p>
            ${p.status ? '' : `<p class="project__meta mono">${esc(p.meta)}</p>`}
            <p class="project__desc">${esc(p.description)}</p>
            ${p.metric ? `<p class="project__metric">${esc(p.metric)}</p>` : ''}
            ${p.extra ? `<p class="project__extra">${esc(p.extra)}</p>` : ''}
            ${tags(p.tags)}
            ${p.repo ? extLink(p.repo, `${work.viewCode} →`, 'project__code mono') : ''}
          </div>
          <ul class="project__media" data-reveal aria-label="${esc(p.name)} — ${esc(ui.screenshots)}">${cards}</ul>
        </article>`;
    })
    .join('');
}

/* ---------- Ring (with motion, src/motion/ring.ts) ---------- */

/** All cards in ring order, grouped by project (DESIGN.md §3). */
function ringCards(): string {
  return work.projects
    .flatMap((p, pi) =>
      p.media.map((id) => {
        const kind = asset(id).type; // generated charts are anchored left (titles live there)
        return `<li class="rcard rcard--${kind}" data-project="${pi}">
          <button class="rcard__btn" type="button" aria-label="${esc(p.name)} — ${esc(ui.showCard)}">
            ${img(id, { sizes: '(max-width: 820px) 340px, 660px', cls: 'rcard__media' }) /* cover-cropped: rendered width ≈ card height × image aspect */}
          </button>
          ${p.status ? badge(p.status) : ''}
        </li>`;
      }),
    )
    .join('');
}

/** One info panel per project, stacked in the same grid cell: the area is
 *  always as tall as the tallest panel, so switching never shifts the ring. */
function panel(p: LlmProject, i: number): string {
  return `
    <article class="rpanel${i === 0 ? ' is-active' : ''}" data-project="${i}" aria-labelledby="ring-${p.id}"${i === 0 ? '' : ' inert'}>
      <div class="rpanel__id">
        <p class="rpanel__idx mono">${idxOf(i)}${p.status ? badge(p.status) : ''}</p>
        <h3 id="ring-${p.id}">${esc(p.name)}</h3>
        <p class="rpanel__title">${esc(p.title)}</p>
        ${p.status ? '' : `<p class="rpanel__meta mono">${esc(p.meta)}</p>`}
      </div>
      <div class="rpanel__body">
        <p class="rpanel__desc">${esc(p.description)}</p>
        ${p.metric ? `<p class="rpanel__metric">${esc(p.metric)}</p>` : ''}
        <div class="rpanel__foot">
          ${tags(p.tags)}
          ${p.repo ? extLink(p.repo, `${work.viewCode} →`, 'project__code mono') : ''}
        </div>
      </div>
    </article>`;
}

function ring(): string {
  return `
    <div class="ring" style="--cards:${work.projects.reduce((n, p) => n + p.media.length, 0)}">
      <div class="ring__stage">
        <header class="ring__head">
          <div>${label(work.label)}<h2>${emph(work.heading)}</h2></div>
          <p class="ring__hint mono" aria-hidden="true">${esc(work.ringHint)}</p>
        </header>
        <div class="ring__area">
          <div class="ring__wrap">
            <ul class="ring__track" aria-label="${esc(work.heading.replace(/\*/g, ''))} — ${esc(ui.screenshots)}">${ringCards()}</ul>
          </div>
        </div>
        <div class="ring__info">${work.projects.map(panel).join('')}</div>
      </div>
    </div>`;
}

export function renderWork(): string {
  return `
    <header class="section-head work__head">
      ${label(work.label)}
      <h2 data-split>${emph(work.heading)}</h2>
    </header>
    <div class="projects">${staticBlocks()}</div>
    ${ring()}`;
}
