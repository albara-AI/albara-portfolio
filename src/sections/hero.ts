import { hero, identity, link } from '../content';
import { esc, label, siteLink } from '../lib/html';
import { asset, img } from '../lib/media';

// The first screen is text only: who Albara is + CV/GitHub (recruiters skim).
// With motion (src/motion/hero.ts) the stage sticks while the text lifts away
// and the 4 photos fly past the camera. Without motion, the photos simply
// sit below the text.
export function renderHero(): string {
  // sizes = the photo's size at its closest pass, so it stays sharp then.
  const cards = hero.media
    .map((id, i) => {
      const a = asset(id);
      const wide = a.width > a.height ? ' hero__card--wide' : ''; // landscape spans 2 columns on phones
      return `<figure class="hero__card hero__card--${i + 1}${wide}">${img(id, {
        sizes: '(max-width: 820px) 64vw, 34vw',
      })}</figure>`;
    })
    .join('');
  return `
   <div class="hero__stage" style="--photos:${hero.media.length}">
    <div class="hero__screen">
      <div class="hero__text">
        ${label(hero.label)}
        <h1>${esc(identity.firstName)}<br><em>${esc(identity.lastName)}</em></h1>
        <p class="hero__role">${esc(hero.role)}</p>
        <p class="hero__sentence">${esc(hero.sentence)}</p>
        <div class="hero__cta">
          ${hero.buttons.map((id) => siteLink(link(id), { button: true })).join('')}
        </div>
      </div>
      <p class="hero__place mono">${esc(hero.place)}</p>
      <p class="hero__hint mono" aria-hidden="true">${esc(hero.scrollHint)}</p>
    </div>
    <div class="hero__collage" aria-hidden="true">${cards}</div>
   </div>`;
}
