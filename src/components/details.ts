// Project details panel — a native <dialog>: a centred modal on desktop, a
// full-screen sheet on phones (CSS). Opened from a carousel card.
//   • close: ✕ button, Esc (native), or a click outside the panel
//   • focus stays inside while open (Tab wraps around) and returns to the
//     card that opened it when closed
//   • the page behind can't scroll while it's open
import { data, ui, work, type DataProject, type LlmProject } from '../content';
import { badge, emph, esc, extLink, tags } from '../lib/html';
import { img } from '../lib/media';

export type DetailsKind = 'llm' | 'data';

export function detailsMarkup(): string {
  return `
    <dialog class="details" aria-labelledby="details-title" data-lenis-prevent>
      <div class="details__box">
        <button class="details__close" type="button" aria-label="${esc(ui.closeDetails)}">✕</button>
        <div class="details__body"></div>
      </div>
    </dialog>`;
}

const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

function gallery(ids: readonly string[]): string {
  if (!ids.length) return '';
  return `<ul class="gallery" aria-label="${esc(ui.gallery)}">
    ${ids.map((id) => `<li class="gallery__item">${img(id, { sizes: '(max-width: 820px) 88vw, 620px' })}</li>`).join('')}
  </ul>`;
}

function llmBody(p: LlmProject, i: number): string {
  const total = String(work.projects.length).padStart(2, '0');
  return `
    <p class="details__kicker mono">${String(i + 1).padStart(2, '0')} / ${total}${p.status ? badge(p.status) : ''}</p>
    <h2 id="details-title">${emph(p.name)}</h2>
    <p class="details__title">${esc(p.title)}</p>
    ${p.status ? '' : `<p class="details__meta mono">${esc(p.meta)}</p>`}
    ${gallery(p.media)}
    <p class="details__desc">${esc(p.description)}</p>
    ${p.metric ? `<p class="details__metric"><span class="mono">${esc(ui.keyMetric)}</span>${esc(p.metric)}</p>` : ''}
    ${p.extra ? `<p class="details__extra">${esc(p.extra)}</p>` : ''}
    ${tags(p.tags)}
    ${p.repo ? extLink(p.repo, `${work.viewCode} →`, 'project__code mono') : ''}`;
}

function dataBody(p: DataProject): string {
  return `
    <p class="details__kicker mono">${esc(data.label)}</p>
    <h2 id="details-title">${esc(p.title)}</h2>
    ${gallery(p.media ?? [])}
    <p class="details__desc">${esc(p.line)}</p>
    ${p.metric ? `<p class="details__metric"><span class="mono">${esc(ui.keyMetric)}</span>${esc(p.metric)}</p>` : ''}
    ${p.detail ? `<p class="details__extra">${esc(p.detail)}</p>` : ''}
    ${tags(p.tags)}
    ${p.repo ? extLink(p.repo, `${work.viewCode} →`, 'project__code mono') : ''}`;
}

let dialog: HTMLDialogElement;
let body: HTMLElement;
let opener: HTMLElement | null = null;

const lockScroll = (on: boolean) => {
  document.documentElement.classList.toggle('modal-open', on);
  // Smooth scroll (Lenis, when loaded) pauses while the page is locked.
  document.dispatchEvent(new CustomEvent('scroll-lock', { detail: on }));
};

export function openDetails(kind: DetailsKind, index: number, from: HTMLElement): void {
  opener = from;
  body.innerHTML = kind === 'llm' ? llmBody(work.projects[index], index) : dataBody(data.projects[index]);
  body.scrollTop = 0;
  dialog.showModal();
  lockScroll(true);
  dialog.querySelector<HTMLElement>('.details__close')!.focus();
  // Clips: autoplay muted in the gallery; with reduced motion, the visitor
  // starts them (controls) instead.
  body.querySelectorAll('video').forEach((v) => {
    if (reduceMotion()) v.controls = true;
    else v.play().catch(() => (v.controls = true));
  });
}

export function initDetails(): void {
  dialog = document.querySelector<HTMLDialogElement>('dialog.details')!;
  body = dialog.querySelector<HTMLElement>('.details__body')!;

  dialog.querySelector('.details__close')!.addEventListener('click', () => dialog.close());

  // Click outside the panel (on the dimmed backdrop) closes it.
  dialog.addEventListener('click', (e) => {
    const box = dialog.querySelector('.details__box')!.getBoundingClientRect();
    const { clientX: x, clientY: y } = e;
    if (x < box.left || x > box.right || y < box.top || y > box.bottom) dialog.close();
  });

  // Focus trap: Tab / Shift+Tab wrap around inside the panel.
  dialog.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const f = [...dialog.querySelectorAll<HTMLElement>('a[href], button, video[controls], [tabindex]:not([tabindex="-1"])')].filter(
      (el) => !el.hasAttribute('disabled') && el.offsetParent !== null,
    );
    if (!f.length) return;
    const first = f[0];
    const last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  // Esc fires 'cancel' then 'close' natively; every way of closing ends here.
  dialog.addEventListener('close', () => {
    body.querySelectorAll('video').forEach((v) => v.pause());
    lockScroll(false);
    opener?.focus({ preventScroll: true });
    opener = null;
  });

  // Any card with data-details="llm|data" + data-index opens the panel.
  document.addEventListener('click', (e) => {
    const card = (e.target as HTMLElement).closest<HTMLElement>('[data-details]');
    if (!card) return;
    openDetails(card.dataset.details as DetailsKind, Number(card.dataset.index), card);
  });
}
