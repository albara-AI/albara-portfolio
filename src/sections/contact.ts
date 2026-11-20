import { contact, contactSection, links } from '../content';
import { emph, esc, label, siteLink } from '../lib/html';

export function renderContact(): string {
  return `
    <div class="contact__main">
      ${label(contactSection.label)}
      <h2 data-split>${emph(contact.heading)}</h2>
      <div class="cta">
        ${links.map((l) => siteLink(l, { button: true })).join('\n        ')}
      </div>
      <p class="email" data-reveal>
        <a class="email__addr" href="mailto:${contact.email}">${esc(contact.email)}</a>
        <button class="email__copy mono" type="button" data-copy="${esc(contact.email)}">${esc(contactSection.copy)}</button>
        <span class="sr-only" role="status" data-copy-status></span>
      </p>
    </div>
    <footer class="foot mono" data-reveal><span>${esc(contact.footer)}</span></footer>`;
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
    btn.textContent = contactSection.copied;
    if (status) status.textContent = `${contactSection.copied}: ${value}`;
    clearTimeout(timer);
    timer = window.setTimeout(() => {
      btn.textContent = contactSection.copy;
      if (status) status.textContent = '';
    }, 2000);
  });
}
