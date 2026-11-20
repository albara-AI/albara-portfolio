// Responsive <img>/<video> markup from public/media/assets.json
// (written by scripts/export.mjs). Width/height are always set so the
// browser reserves space before the image loads (no layout shift).
import manifest from '../../public/media/assets.json';
import { alt } from '../content';
import { esc } from './html';

export interface Asset {
  id: string;
  project: string;
  type: 'frame' | 'image' | 'generated' | 'loop';
  path: string;
  card?: string;
  thumb?: string;
  poster: string | null;
  posterFull?: string;
  webm?: string;
  width: number;
  height: number;
}

const byId = new Map<string, Asset>((manifest.assets as Asset[]).map((a) => [a.id, a]));

export function asset(id: string): Asset {
  const a = byId.get(id);
  if (!a) throw new Error(`Unknown media id "${id}" — check public/media/assets.json`);
  return a;
}

const altFor = (id: string): string => {
  const text = alt[id];
  if (!text) console.warn(`TODO: alt text for ${id}`);
  return text ?? '';
};

interface ImgOpts {
  /** CSS sizes attribute — tells the browser which srcset width to pick */
  sizes: string;
  eager?: boolean;
  cls?: string;
}

/** <img> with 400/800/1600 srcset. Lazy by default (PERFORMANCE.md). */
export function img(id: string, { sizes, eager = false, cls = '' }: ImgOpts): string {
  const a = asset(id);
  if (a.type === 'loop') return video(id, { sizes, cls });
  const srcset = [
    a.thumb && `${a.thumb} 400w`,
    a.card && `${a.card} 800w`,
    `${a.path} ${a.width}w`,
  ]
    .filter(Boolean)
    .join(', ');
  return `<img class="${cls}" src="${a.card ?? a.path}" srcset="${srcset}" sizes="${sizes}"
    width="${a.width}" height="${a.height}" alt="${esc(altFor(id))}"
    loading="${eager ? 'eager' : 'lazy'}" decoding="async"${eager ? '' : ' fetchpriority="low"'}>`;
}

/** Muted looping clip, never autoplayed here: Phase 5 plays it when its card is active. */
export function video(id: string, { cls = '' }: Partial<ImgOpts> = {}): string {
  const a = asset(id);
  return `<video class="${cls}" muted loop playsinline preload="none" poster="${a.poster}"
    width="${a.width}" height="${a.height}" aria-label="${esc(altFor(id))}">
    ${a.webm ? `<source src="${a.webm}" type="video/webm">` : ''}
    <source src="${a.path}" type="video/mp4">
  </video>`;
}
