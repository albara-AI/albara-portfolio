import { contact, contactSection, identity, nav } from '../content';
import { esc, extLink } from '../lib/html';

// The bar uses mix-blend-mode: difference, so it can't contain the mobile
// menu panel (the panel would blend too). The panel is a sibling element.
export function renderNav(): string {
  const links = nav.map(({ label, href }) => `<a href="${href}">${esc(label)}</a>`).join('');
  return `
    <header class="nav mono">
      <a class="nav__name" href="#top">${esc(identity.firstName)} ${esc(identity.lastName)}</a>
      <nav class="nav__links" aria-label="Sections">${links}</nav>
      <button class="nav__menu-btn" type="button" aria-expanded="false" aria-controls="menu">Menu</button>
    </header>
    <div class="menu" id="menu" hidden>
      <nav class="menu__links" aria-label="Sections">${links}</nav>
      <div class="menu__extra mono">
        <a href="${contact.cv}" download="${contact.cvFilename}">${esc(contactSection.buttons.cv)}</a>
        ${extLink(contact.github, contactSection.buttons.github)}
      </div>
    </div>`;
}

export function bindNav(root: ParentNode): void {
  const btn = root.querySelector<HTMLButtonElement>('.nav__menu-btn');
  const menu = root.querySelector<HTMLElement>('#menu');
  if (!btn || !menu) return;
  const set = (open: boolean) => {
    btn.setAttribute('aria-expanded', String(open));
    btn.textContent = open ? 'Close' : 'Menu';
    menu.hidden = !open;
    document.documentElement.classList.toggle('menu-open', open);
    // Smooth scroll (Phase 3) listens to pause/resume while the menu is open.
    document.dispatchEvent(new CustomEvent('menu:toggle', { detail: open }));
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
