import { contact, contactSection } from '../content';
import { emph, esc, extLink, label } from '../lib/html';

export function renderContact(): string {
  const b = contactSection.buttons;
  return `
    <div class="contact__main">
      ${label(contactSection.label)}
      <h2>${emph(contact.heading)}</h2>
      <div class="cta">
        <a class="btn" href="${contact.cv}" download="${contact.cvFilename}">${esc(b.cv)}</a>
        ${extLink(contact.whatsapp, b.whatsapp, 'btn btn--ghost')}
        <a class="btn btn--ghost" href="mailto:${contact.email}">${esc(b.email)}</a>
        ${extLink(contact.linkedin, b.linkedin, 'btn btn--ghost')}
        ${extLink(contact.github, b.github, 'btn btn--ghost')}
      </div>
      <p class="email">
        <a class="email__addr" href="mailto:${contact.email}">${esc(contact.email)}</a>
        <button class="email__copy mono" type="button" data-copy="${esc(contact.email)}">${esc(b.copy)}</button>
        <span class="sr-only" role="status" data-copy-status></span>
      </p>
    </div>
    <footer class="foot mono"><span>${esc(contact.footer)}</span></footer>`;
}

/** Copy email → button shows "Copied" for 2s (DESIGN.md → Contact). */
export function bindContact(root: ParentNode): void {
  const btn = root.querySelector<HTMLButtonElement>('.email__copy');
  const status = root.querySelector<HTMLElement>('[data-copy-status]');
  if (!btn) return;
  let timer = 0;
  btn.addEventListener('click', async () => {
    const value = btn.dataset.copy ?? '';
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // Older/insecure contexts: fall back to a hidden textarea.
      const ta = document.createElement('textarea');
      ta.value = value;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.append(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    btn.textContent = contactSection.buttons.copied;
    if (status) status.textContent = `${contactSection.buttons.copied}: ${value}`;
    clearTimeout(timer);
    timer = window.setTimeout(() => {
      btn.textContent = contactSection.buttons.copy;
      if (status) status.textContent = '';
    }, 2000);
  });
}
