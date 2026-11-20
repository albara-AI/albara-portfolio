// About → "I work with ___": types a skill, pauses ~1.5s, deletes it,
// types the next, looping. Pauses while the line is off-screen.
import { about } from '../content';

const TYPE_MS = 70; //   per character typed
const DELETE_MS = 35; // per character deleted
const HOLD_MS = 1500; // full word on screen
const GAP_MS = 300; //   empty pause before the next word

export function typewriter(): void {
  const line = document.querySelector<HTMLElement>('.skills');
  const word = line?.querySelector<HTMLElement>('.skills__word');
  if (!line || !word) return;

  const skills = about.skills;
  let i = 0; // which skill
  let n = 0; // characters shown
  let deleting = false;
  let timer = 0;
  let visible = false;

  const step = () => {
    const text = skills[i];
    if (!deleting) {
      n++;
      word.textContent = text.slice(0, n);
      if (n === text.length) {
        deleting = true;
        timer = window.setTimeout(step, HOLD_MS);
        return;
      }
      timer = window.setTimeout(step, TYPE_MS);
    } else {
      n--;
      word.textContent = text.slice(0, n);
      if (n === 0) {
        deleting = false;
        i = (i + 1) % skills.length;
        timer = window.setTimeout(step, GAP_MS);
        return;
      }
      timer = window.setTimeout(step, DELETE_MS);
    }
  };

  // Only run while the line can be seen (no work in the background).
  new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting && !visible) {
      visible = true;
      timer = window.setTimeout(step, GAP_MS);
    } else if (!entry.isIntersecting && visible) {
      visible = false;
      clearTimeout(timer);
    }
  }).observe(line);
}
