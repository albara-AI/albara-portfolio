import { contact, contactSection, hero, identity } from '../content';
import { esc, extLink, label } from '../lib/html';
import { img } from '../lib/media';

// Phase 2: static hero. The collage is the reduced-motion layout; Phase 4
// turns these cards into the 3D fly-through.
export function renderHero(): string {
  const cards = hero.media
    .map((id, i) => `<figure class="hero__card hero__card--${i + 1}">${img(id, { sizes: '(max-width: 820px) 40vw, 18vw' })}</figure>`)
    .join('');
  return `
    <div class="hero__collage" aria-hidden="true">${cards}</div>
    <div class="hero__name">
      <h1>${esc(identity.firstName)}<br><em>${esc(identity.lastName)}</em></h1>
      <p class="hero__sentence">${esc(hero.sentence)}</p>
    </div>
    <div class="hero__intro">
      ${label(hero.intro.label)}
      <p class="hero__intro-text">${esc(hero.intro.text)}</p>
      <p class="hero__links mono">
        <a href="${contact.cv}" download="${contact.cvFilename}">${esc(contactSection.buttons.cv)}</a>
        ${extLink(contact.github, contactSection.buttons.github)}
      </p>
    </div>
    <p class="hero__hint mono" aria-hidden="true"><span>${esc(hero.scrollHint)}</span><i></i></p>`;
}
