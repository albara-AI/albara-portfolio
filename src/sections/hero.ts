import { contact, contactSection, hero, identity } from '../content';
import { esc, extLink, label } from '../lib/html';
import { img } from '../lib/media';

// The first screen is text only: who Albara is + CV/GitHub (recruiters skim).
// With motion (src/motion/hero.ts) the stage sticks while the text lifts away
// and the 4 photos fly past the camera. Without motion, the photos simply
// sit below the text.
export function renderHero(): string {
  // sizes = the photo's size at its closest pass, so it stays sharp then.
  const cards = hero.media
    .map(
      (id, i) =>
        `<figure class="hero__card hero__card--${i + 1}">${img(id, {
          sizes: '(max-width: 820px) 64vw, 34vw',
        })}</figure>`,
    )
    .join('');
  return `
   <div class="hero__stage">
    <div class="hero__screen">
      <div class="hero__text">
        ${label(hero.label)}
        <h1>${esc(identity.firstName)}<br><em>${esc(identity.lastName)}</em></h1>
        <p class="hero__role">${esc(hero.role)}</p>
        <p class="hero__sentence">${esc(hero.sentence)}</p>
        <div class="hero__cta">
          <a class="btn" href="${contact.cv}" download="${contact.cvFilename}">${esc(contactSection.buttons.cv)}</a>
          ${extLink(contact.github, contactSection.buttons.github, 'btn btn--ghost')}
        </div>
      </div>
      <p class="hero__place mono">${esc(hero.place)}</p>
      <p class="hero__hint mono" aria-hidden="true">${esc(hero.scrollHint)}</p>
    </div>
    <div class="hero__collage" aria-hidden="true">${cards}</div>
   </div>`;
}
