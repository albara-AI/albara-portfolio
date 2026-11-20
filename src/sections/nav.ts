import { hero, identity, link, nav, ui } from '../content';
import { esc, siteLink } from '../lib/html';

// The bar uses mix-blend-mode: difference, so it can't contain the mobile
// menu panel (the panel would blend too). The panel is a sibling element.
export function renderNav(): string {
  const links = nav.map(({ label, href }) => `<a href="${href}">${esc(label)}</a>`).join('');
  return `
    <header class="nav mono">
      <a class="nav__name" href="#top">${esc(identity.firstName)} ${esc(identity.lastName)}</a>
      <nav class="nav__links" aria-label="${esc(ui.sections)}">${links}</nav>
      <button class="nav__menu-btn" type="button" aria-expanded="false" aria-controls="menu">${esc(ui.menu)}</button>
    </header>
    <div class="menu" id="menu" hidden>
      <nav class="menu__links" aria-label="${esc(ui.sections)}">${links}</nav>
      <div class="menu__extra mono">
        ${hero.buttons.map((id) => siteLink(link(id))).join('')}
      </div>
    </div>`;
}

export function bindNav(root: ParentNode): void {
  const btn = root.querySelector<HTMLButtonElement>('.nav__menu-btn');
  const menu = root.querySelector<HTMLElement>('#menu');
  if (!btn || !menu) return;
  const set = (open: boolean) => {
    btn.setAttribute('aria-expanded', String(open));
    btn.textContent = open ? ui.close : ui.menu;
    menu.hidden = !open;
    document.documentElement.classList.toggle('menu-open', open);
    // Smooth scroll (Lenis, when loaded) pauses while the menu is open.
    document.dispatchEvent(new CustomEvent('scroll-lock', { detail: open }));
  };
  btn.addEventListener('click', () => set(menu.hasAttribute('hidden')));
  menu.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).closest('a')) set(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !menu.hasAttribute('hidden')) {
      set(false);
      btn.focus();
    }
  });
}
