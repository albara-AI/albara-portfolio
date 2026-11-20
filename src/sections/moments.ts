import { moments } from '../content';
import { emph, esc, label } from '../lib/html';
import { img } from '../lib/media';

// Phase 2: a native horizontal scroll row (works with touch, trackpad and
// keyboard). Phase 3 drives it from vertical scroll on a sticky stage.
export function renderMoments(): string {
  const photos = moments.photos
    .map(
      (p) => `<li class="moment">
        <figure>
          ${img(p.media, { sizes: '(max-width: 820px) 75vw, 30vw' })}
          <figcaption class="mono">${esc(p.caption)}</figcaption>
        </figure>
      </li>`,
    )
    .join('');
  return `
    <header class="section-head">
      ${label(moments.label)}
      <h2>${emph(moments.heading)}</h2>
    </header>
    <ul class="moments__track" tabindex="0" aria-label="Event photos — scroll sideways">${photos}</ul>`;
}
