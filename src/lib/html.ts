// Tiny helpers for building markup from content.ts.
// All text goes through esc() so content can never inject HTML.

export const esc = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** `Engineer by training, *builder* by habit.` → escaped text with <em>builder</em>. */
export const emph = (s: string): string => esc(s).replace(/\*(.+?)\*/g, '<em>$1</em>');

/** Section label: "——  01 — About" */
export const label = (text: string): string => `<p class="label mono">${esc(text)}</p>`;

export const tags = (list: readonly string[]): string =>
  `<ul class="tags mono" aria-label="Tech">${list.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>`;

export const badge = (text: string): string =>
  `<span class="badge mono"><span class="badge__dot" aria-hidden="true"></span>${esc(text)}</span>`;

/** External link that opens in a new tab safely. */
export const extLink = (href: string, text: string, cls = ''): string =>
  `<a class="${cls}" href="${esc(href)}" target="_blank" rel="noopener noreferrer">${esc(text)}<span class="sr-only"> (opens in a new tab)</span></a>`;
