// Tiny helpers for building markup from content.ts.
// All text goes through esc() so content can never inject HTML.
import { ui, type SiteLink } from '../content';

export const esc = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** `Engineer by training, *builder* by habit.` → escaped text with <em>builder</em>. */
export const emph = (s: string): string => esc(s).replace(/\*(.+?)\*/g, '<em>$1</em>');

/** Escaped text with "₂" drawn as a real subscript 2 — for serif titles
 *  (Instrument Serif has no ₂ glyph). Not for attributes. */
export const sub2 = (s: string): string => esc(s).replace(/₂/g, '<sub class="sub2">2</sub>');

/** Section label: "——  01 — About" */
export const label = (text: string): string => `<p class="label mono">${esc(text)}</p>`;

export const tags = (list: readonly string[]): string =>
  `<ul class="tags mono" aria-label="${esc(ui.tech)}">${list.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>`;

export const badge = (text: string): string =>
  `<span class="badge mono"><span class="badge__dot" aria-hidden="true"></span>${esc(text)}</span>`;

/** External link that opens in a new tab safely. */
export const extLink = (href: string, text: string, cls = ''): string =>
  `<a class="${cls}" href="${esc(href)}" target="_blank" rel="noopener noreferrer">${esc(text)}<span class="sr-only"> ${esc(ui.newTab)}</span></a>`;

/** Any entry from content.ts → links. `button: true` styles it as a button
 *  (filled if the link is primary, outlined otherwise). */
export function siteLink(l: SiteLink, { button = false, cls = '' } = {}): string {
  const c = [button ? (l.primary ? 'btn' : 'btn btn--ghost') : '', cls].filter(Boolean).join(' ');
  if (l.external) return extLink(l.href, l.label, c);
  const dl = l.download ? ` download="${esc(l.download)}"` : '';
  return `<a class="${c}" href="${esc(l.href)}"${dl}>${esc(l.label)}</a>`;
}
