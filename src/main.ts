// Fonts: self-hosted via @fontsource (Latin subset only — the site is English).
// Only the weights DESIGN.md allows: 400 + 500, plus Instrument Serif italic for <em>.
import '@fontsource/instrument-serif/latin-400.css';
import '@fontsource/instrument-serif/latin-400-italic.css';
import '@fontsource/inter/latin-400.css';
import '@fontsource/inter/latin-500.css';
import '@fontsource/jetbrains-mono/latin-400.css';
import '@fontsource/jetbrains-mono/latin-500.css';

import './styles/tokens.css';
import './styles/base.css';
import './styles/sections.css';

import { identity, nav, sections } from './content';

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className: string,
  text: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  node.className = className;
  node.textContent = text;
  return node;
}

function renderNav(): void {
  const name = document.querySelector<HTMLAnchorElement>('[data-nav-name]');
  const links = document.querySelector<HTMLElement>('[data-nav-links]');
  if (name) name.textContent = `${identity.firstName} ${identity.lastName}`;
  if (links) {
    links.replaceChildren(
      ...nav.map(({ label, href }) => {
        const a = el('a', '', label);
        a.href = href;
        return a;
      }),
    );
  }
}

// Phase 0: each shell shows its label + name so the 6 sections are easy to see.
function renderShells(): void {
  for (const { id, label } of sections) {
    const section = document.getElementById(id);
    if (!section) continue;
    const name = label.split('—').pop()?.trim() ?? label;
    section.replaceChildren(
      el('div', 'label mono', label),
      el('h2', 'shell__name', name),
      el('p', 'shell__note mono', `#${id} — empty shell`),
    );
  }
}

renderNav();
renderShells();
