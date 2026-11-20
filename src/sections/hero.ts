import { contact, contactSection, hero, identity } from '../content';
import { esc, extLink, label } from '../lib/html';
import { img } from '../lib/media';

// One sticky stage. Without motion it's a static hero (photos placed around
// the name). With motion (src/motion/hero.ts) the section grows tall and the
// stage sticks while the photos fly past the camera one by one.
export function renderHero(): string {
  // sizes = the photo's size at its closest pass (fly-through), so it stays sharp.
  // Eager: they're on the first screen.
  const cards = hero.media
    .map(
      (id, i) =>
        `<figure class="hero__card hero__card--${i + 1}">${img(id, {
          sizes: '(max-width: 820px) 64vw, 34vw',
          eager: true,
        })}</figure>`,
    )
    .join('');
  return `
   <div class="hero__stage">
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
    <p class="hero__hint mono" aria-hidden="true"><span>${esc(hero.scrollHint)}</span><i></i></p>
   </div>`;
}
