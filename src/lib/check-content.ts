// Dev-only sanity checks for src/content.ts (runs in `npm run dev`, never in
// the production build). Mistakes show up as clear console warnings.
import { alt, data, hero, links, work } from '../content';
import { asset } from './media';

export function checkContent(): void {
  const problems: string[] = [];
  const ids: string[] = [...hero.media, ...work.projects.flatMap((p) => p.media)];
  data.projects.forEach((p) => p.media && ids.push(...p.media));
  work.projects.forEach((p) => p.cover && ids.push(p.cover));

  work.projects.forEach((p) => {
    if (p.media.length === 0 && !p.cover) problems.push(`LLM project "${p.name}" has no media — it needs at least a cover image.`);
  });
  for (const id of ids) {
    try {
      asset(id);
    } catch {
      problems.push(`Media id "${id}" isn't in public/media/assets.json — add it to scripts/approved.json and run npm run export.`);
    }
    if (!alt[id]) problems.push(`No alt text for "${id}" — add it to alt in content.ts.`);
  }
  const linkIds = links.map((l) => l.id);
  if (new Set(linkIds).size !== linkIds.length) problems.push('Two links share the same id in content.ts → links.');

  if (problems.length) console.warn(`content.ts check:\n- ${problems.join('\n- ')}`);
  else console.info('content.ts check: OK');
}
