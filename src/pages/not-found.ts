// 404 page: same paper, type and buttons as the site, one way back home.
import { notFound } from '../content';
import { emph, esc, label } from '../lib/html';

export function renderNotFound(): string {
  return `
    <div class="notfound__inner">
      ${label(notFound.label)}
      <h1>${emph(notFound.heading)}</h1>
      <p class="notfound__text">${esc(notFound.text)}</p>
      <a class="btn" href="/">${esc(notFound.back)}</a>
    </div>`;
}
